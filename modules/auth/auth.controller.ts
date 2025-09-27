import express, { type Request, type Response } from "express";
import { login_schema, reset_password_schema, user_schema } from "../../utils/schema"
import { Authservice } from "./auth.service";
import { sendEmail } from "../notifications/email/mailer";
import prisma from "../../utils/prisma";
import { compare, hash } from "../../utils/lib";
import { findUser } from "./auth.model";

const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const MAX_RESENDS = 5;
const RESEND_RESET_WINDOW = 24 * 60 * 60 * 1000;

import crypto from "crypto";
import { createVerificationToken } from "../../utils/helpers";

export const createUserController = async (req: Request, res: Response): Promise<any> => {
    // input validation
    // destructure the data from the req.body
    // create a user and return a success response

    const parsedInputs = user_schema.safeParse(req.body);

    if (!parsedInputs.success) {
        return res.status(400).json({
            message: "Invalid inputs",
            error: parsedInputs.error.format()
        })
    }

    try {
        const { user, access_token, verificationUrl } = await Authservice.registerUser(parsedInputs.data);

        // send the user an email
        await sendEmail({
            to: user.email,
            subject: "Verify your email",
            html: `
                <div style={{color: 'red'}}>
                    <h2>Welcome</h2>
                    <p>Click the link below to verify your email</p>
                    <a href=${verificationUrl} target="_blank">${verificationUrl}</a>
                </div>
            `
        })

        // set access token to the cookie
        res.cookie("access_token", access_token, {
            maxAge: 15 * 60 * 1000,
            secure: false,
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        })

        return res.status(201).json({
            message: "User created successfully. Please check your email to verify your account",
            profile: user
        })
    } catch (err: any) {
        return res.status(500).json({
            message: `Error adding user to platform`,
            error: err.message
        })
    }
};



export const loginUserController = async (req: Request, res: Response): Promise<any> => {
    // perform input validation
    const parsedInputs = login_schema.safeParse(req.body);

    if (!parsedInputs.success) {
        return res.status(400).json({
            message: "Invalid inputs",
            error: parsedInputs.error.format()
        })
    }

    const { email, password } = parsedInputs.data;

    try {
        const { user, access_token, refresh_token } = await Authservice.loginUser(email, password);

        // send the token as a cookie to the cookieParser

        res.cookie("refresh_token", refresh_token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "lax",
            httpOnly: true,
            path: "/auth/refresh"
        })

        return res.status(200).json({
            message: "Login successfull",
            profile: user,
            token: access_token
        })
    } catch (err: any) {
        return res.status(500).json({
            message: `Error logging in user`,
            error: err.message
        })
    }
};


export const userLogoutController = (req: Request, res: Response) => {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/auth/refresh" });
    return res.status(200).json({
        message: "User logged out successfully"
    })
};

// email verification controller
export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        const { token, id } = req.query as { token: string, id: string };
        console.log(token);

        if (!token || typeof token !== "string" || !id) {
            return res.status(400).json({ message: "Invalid token" })
        };

        // find the token from the model
        const record = await prisma.verificationToken.findUnique({
            where: { userId: id }
        });

        if (!record) {
            return res.status(400).json({
                message: "Invalid or expired token"
            })
        };

        // compare the hashed token with the token provided to see if it matches
        const isValid = await compare(token, record.token)

        if (!isValid) {
            return res.status(400).json({
                message: "Comparison failed. Invalid token"
            })
        };

        // check if the token has not expired
        if (record.expiresAt < new Date()) {
            await prisma.verificationToken.delete({ where: { id: record.id } });

            return res.status(410).json({
                message: "Verification link expired. Please request a new one",
                action: "/auth/resend-verification"
            })
        };


        // mark user as verified
        await prisma.user.update({
            where: { id: record.userId },
            data: {
                isVerified: true
            }
        });

        // clean up the token
        await prisma.verificationToken.delete({
            where: { id: record.id }
        });

        return res.status(200).json({
            message: "Email verified successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: Something went wrong"
        })
    }
};


export const resendVerificationController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            })
        };

        // create a token. create a verification url and send the user an email
        const user = await findUser(email);

        if (!user) {
            return res.status(400).json({
                message: "User does not exist"
            })
        };

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" })
        };

        const record = await prisma.verificationToken.findUnique({
            where: {userId: user.id}
        });

        const now = new Date();

        console.log(now);

        if (record) {
            console.log("request reached here");
            // reset counter if 24 hours passes
            // block if within 5 mins
            // block if daily attempts reached
            if (record.lastResentAt && now.getTime() - record.lastResentAt.getTime() > RESEND_RESET_WINDOW) {
                await prisma.verificationToken.update({
                    where: { userId: user.id },
                    data: {
                        resendCount: 0
                    }
                });
            }


            if(record.lastResentAt && now.getTime() - record.lastResentAt.getTime() < RATE_LIMIT_WINDOW){
                return res.status(429).json({
                    message: "Please wait a few minutes before requesting another link"
                })
            }


            if(record.resendCount >= MAX_RESENDS){
                return res.status(429).json({message: "Too many verification attempts. Try again tomorrow"})
            }

        } else {
            return res.status(400).json({
                message: "Token is invalid"
            })
        }

        // create a new token
        const verificationToken = await createVerificationToken(user.id, {incrementResend: true})

        const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${encodeURIComponent(verificationToken)}&id=${user.id}`;

        console.log(verificationToken);

        await sendEmail({
            to: user.email,
            subject: "Verify your account",
            html: `
                 <div>
                    <h2>Welcome</h2>
                    <p>Click the link below to verify your email</p>
                    <a href=${verificationUrl} target="_blank">${verificationUrl}</a>
                </div>
            `
        });


        return res.status(200).json({
            message: "New Verification email sent to your email"
        });
    } catch (err) {

    }
}


export const resetPasswordController = async (req: Request, res: Response) => {
    // get the password from the request body;
    // perform input validation
    // after successfull update redirect the user to the login route 

    const parsedInputs = reset_password_schema.safeParse(req.body);

    if (!parsedInputs.success) {
        return res.status(400).json({
            message: "Invalid inputs",
            error: parsedInputs.error.format()
        })
    };

    try {
        const { email, password } = parsedInputs.data;
        await Authservice.passwordReset(email, password);
        return res.status(200).json({
            message: "User password updated successfully",
        })
    } catch (err: any) {
        return res.status(500).json({
            message: "Error updating user password",
            error: err.message
        })
    }
}; 