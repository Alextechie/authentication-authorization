import crypto from "crypto";
import bcrypt from "bcrypt";
import { hash } from "./lib";
import prisma from "./prisma";



export const createVerificationToken = async (userId: string, opts: {incrementResend?: boolean, ttlMs?: number}): Promise<string> => {
    try {
        const token = crypto.randomBytes(32).toString("hex");

        const ttlMs = opts.ttlMs ?? 15 * 60 * 1000;

        const tokenExpiry = new Date(Date.now() + ttlMs);

        const hashedToken = await hash(token);

        const now = new Date();


        // store new token
        // await prisma.verificationToken.update({
        //     where: {userId},
        //     data: {
        //         userId,
        //         token: hashedToken,
        //         expiresAt: tokenExpiry
        //     }
        // });


        await prisma.verificationToken.upsert({
            where: {userId},
            update: {
                token: hashedToken,
                expiresAt: tokenExpiry,
                lastResentAt: now,
                ...(opts.incrementResend ? {resendCount : {increment: 1}}: {resendCount: 0}),
            },
            create: {
                userId,
                token: hashedToken,
                expiresAt: tokenExpiry,
                lastResentAt: now,
                resendCount: opts.incrementResend ? 1 : 0
            }
        })




        return token
    } catch (err: any) {
        throw new Error("Error creating verification token: ", err.mesage)
    }



}