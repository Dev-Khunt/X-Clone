import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validate = (schema:ZodObject)=>async (req:Request,res:Response,next:NextFunction) => {
    const result = await schema.safeParseAsync(req.body)
    if (!result.success) {
        res.status(400).json({errors:result.error.flatten()})
        return;
    }

    req.body = result.data
    next()
}
