import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErros = async (req: Request, res:Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    next();
}

export const validateMyUserRequest = [
    body('name').isString().notEmpty().withMessage('Name allow  only string and not empty'),
    body('addressLine1').isString().notEmpty().withMessage('Address must be a string and not empty'),
    body('city').isString().notEmpty().withMessage('city must be a string and not empty'),
    body('country').isString().notEmpty().withMessage('country must be a string and not empty'),
    handleValidationErros,
];
