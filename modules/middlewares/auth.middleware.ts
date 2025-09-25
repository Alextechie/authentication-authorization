import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../utils/lib";
import { findUserById } from "../auth/auth.model";
import type { TokenPayload } from "../../core/types/auth";
import { decode } from "jsonwebtoken";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //     return res.status(401).json({
    //         message: "No token provided"
    //     })
    // }

    const token = req.cookies.access_token

    if(!token){
        return res.status(401).json({
            message: "No token provided. Unauthorized"
        })
    };


    // console.log(token)
    try {
        // verify the token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token"
            })
        };

        const { id } = decoded;

        // find the user from the database to ensure that he/she is the one with the token
        const user = await findUserById(id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }


        //set the decoded data into the request head
        (req as any).user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.role.permissions.map((p) => p.permission.action)
        }

        next()
    } catch (err: any) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: err.message
        })
    }
}