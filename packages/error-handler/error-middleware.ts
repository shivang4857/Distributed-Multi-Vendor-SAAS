import { AppError } from "./index";
import { Request, Response, NextFunction } from "express";


export const errorMiddleware = (err : Error, req : Request, res : Response, next : NextFunction) => {
    if (err instanceof AppError) {

        console.error( `error: ${err.message}, statusCode: ${err.statusCode}, isOperational: ${err.isOperational}` );
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            ...(err.details && { details: err.details }),
        });
    } else {
        console.error(`error: ${err.message} , stack: ${err.stack}`);
        res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred.',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }
}