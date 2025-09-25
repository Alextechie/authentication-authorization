import express, { type Request, type Response } from "express";
import { login_schema, user_schema } from "../../utils/schema"
import { Authservice } from "./auth.service";
import { serializerForUser } from "../../utils/serializers";

export const createUserController = async (req: Request, res: Response): Promise<any> => {
    // input validation
    // destructure the data from the req.body
    // create a user and return a success response

    const parsedInputs = user_schema.safeParse(req.body);

    if(!parsedInputs.success){
        return res.status(400).json({
            message: "Invalid inputs",
            error: parsedInputs.error.format()
        })
    }
    
    try{
        const {user, access_token} = await Authservice.registerUser(parsedInputs.data);

        // set access token to the cookie
        res.cookie("access_token", access_token, {
            maxAge: 15 * 60 * 1000,
            secure: false,
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        })
        
        return res.status(201).json({
            message: "User created successfully",
            profile: user
        })
    } catch(err: any){
        return res.status(500).json({
            message: `Error adding user to platform`,
            error: err.message
        })
    }
};



export const loginUserController = async (req: Request, res: Response): Promise<any> => {
    // perform input validation
    const parsedInputs = login_schema.safeParse(req.body);

    if(!parsedInputs.success){
        return res.status(400).json({
            message: "Invalid inputs",
            error: parsedInputs.error.format()
        })
    }

    const {email, password} = parsedInputs.data;

    try{
        const {user, access_token, refresh_token} = await Authservice.loginUser(email, password);

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
    } catch(err: any){
        return res.status(500).json({
            message: `Error logging in user`,
            error: err.message
        })
    }
};


export const userLogoutController = (req: Request, res: Response) => {
    res.clearCookie("access_token", {path: "/"});
    res.clearCookie("refresh_token", {path: "/auth/refresh"});
    return res.status(200).json({
        message: "User logged out successfully"
    })
}