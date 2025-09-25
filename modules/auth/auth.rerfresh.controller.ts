import type { Request, Response } from "express"
import { generateAccessToken, verifyToken } from "../../utils/lib";
// import { access_token_exp } from "../../utils/env";

export const refreshTokenController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if(!refreshToken){
        return res.status(401).json({
            message: "Unauthorized: No refresh token"
        })
    }

    try{
        const decode = verifyToken(refreshToken);

        if(!decode){
            return res.status(401).json({
                message: "No refresh token"
            })
        };

        const {id, role, permissions} = decode;

        const newAccessToken = await generateAccessToken({id, role, permissions});

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
            sameSite: "lax",
            path: "/"
        });


        return res.json({
            message: "Access token refreshed"
        })
    } catch(err: any) {
        return res.status(401).json({
            message: 'Invalid refresh token',
            error: err.message
        })
    }
}