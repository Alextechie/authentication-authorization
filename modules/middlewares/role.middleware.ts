import type { NextFunction, Request, Response } from "express"

export const checkRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) =>{
        if(req.user?.role?.name !== role){
            return res.status(403).json({
                message: "Forbidden. Wrong role"
            })
        }
        next()
    }
}