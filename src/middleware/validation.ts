import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";

const upload = multer();

const handleValidationErros = async (req: Request, res:Response, next: NextFunction) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    next();
}

export const validateMyUserRequest = [
    body('name').isString().notEmpty().withMessage('Name allow  only string and not empty'),
    body('mobileNumber').isNumeric().notEmpty().withMessage('mobile number should contain only numbers, less than 9'),
    body('countryCode').isString().notEmpty().withMessage('country code is required'),
    handleValidationErros,
];

export const validateMyRestaurantRequest = [
    body('restaurantName').notEmpty().withMessage('Restaurant Name allow  only string and not empty'),
    body('city').notEmpty().withMessage('City allow  only string and not empty'),
    body('country').notEmpty().withMessage('Country Name allow  only string and not empty'),
    body('deliveryPrice').isFloat({min:0}).withMessage('Delivery price must be  a positive number'),
    body('estimatedDeliveryTime').isInt({min:0}).withMessage('Delivery time must be  a positive number'),
    body('cuisines').isArray().withMessage('Cuisines must be array').not().isEmpty().withMessage('Cuisines array cannot be empty'),
    body('menuItems').isArray().withMessage('Menu items must be an array of objects'),
    body('menuItems.*.name').notEmpty().withMessage('Menu item name is required'),
    body('menuItems.*.price').notEmpty().withMessage('Menu item price is must be number'),
    handleValidationErros,
] 

export const validateMyAddressRequest = [
    upload.none(),
    body('addressName').notEmpty().withMessage('address name not allow empty'),
    body('lon').notEmpty().withMessage('Longtitude not allow empty'),
    body('lat').notEmpty().withMessage('Latitude not allow empty'),
    body('fullName').notEmpty().withMessage('Full Name not allow empty'),
    handleValidationErros,
]


