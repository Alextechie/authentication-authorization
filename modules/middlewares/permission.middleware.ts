import type { NextFunction, Request, Response } from "express"

export const checkPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user?.permissions?.includes(permission)){
            return res.status(403).json({
                message: "Forbidden. You don't have the access rights to this resource"
            })
        }
        next()
    }
}