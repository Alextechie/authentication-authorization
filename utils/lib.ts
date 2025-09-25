import bcrypt from "bcrypt";
import { access_token_exp, saltRounds, secret } from "./env";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Response } from "express";
import type { TokenPayload } from "../core/types/auth";

export const hash = async (password: string) => {
    try {
        const salt = await bcrypt.genSalt(Number(saltRounds));
        return await bcrypt.hash(password, salt)
    } catch (err) {
        console.log(err)
        throw new Error(`Error hashing the password: ${err}`)
    }
};


export const compare = async (password: string, hashedPassword: string) => {
    try {
        return await bcrypt.compare(password, hashedPassword)

    } catch (err) {
        throw new Error(`Error comparing plaintext password with hashed: ${err}`)
    }
};

export const generateAccessToken = async (payload: TokenPayload) => {
    return await jwt.sign(payload, String(secret), {expiresIn: "15m"})
};


export const generateRefreshToken = async (payload: object) => {
    return await jwt.sign(payload, String(secret), {expiresIn: "7d"})
}

export const verifyToken = (token: string): TokenPayload | null  => {
    try {

        const decoded = jwt.verify(token, String(secret)) as JwtPayload

        if(typeof decoded === "string" || !("id" in decoded)) {
            throw new Error("Invalid token payload")
        };

        return decoded as TokenPayload
    } catch (err) {
        console.log(err)
        return null
    }
};