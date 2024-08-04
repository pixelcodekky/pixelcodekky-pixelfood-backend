import { Request, Response } from 'express';
import User from '../models/user';



const getUser = async(req : Request ,res :Response) => {
    try {
        const currentUser = await User.findOne({_id: req.userId});
        if(!currentUser){
            return res.status(404).json({message: 'User not found.'});
        }

        return res.json(currentUser);

    } catch (error) {
        console.log(error);
        res.status(500).json({messsage: 'error encountered'});
    }
}

const createUser = async (req: Request, res: Response) => {
    try {
        
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({auth0Id});

        if(existingUser){
            return res.status(409); // information already exist
        }

        //manipulate phone number;
        if(isContactNumber(req.body.countryCode,'country_code')){
            return res.status(500).json({message: "Invalid country code"});
        }

        if(isContactNumber(req.body.phoneNumber,"phone_number")){
            return res.status(500).json({message: "Invalid Phone Number."});
        }

        const newUser = new User(req.body);
        newUser.name = req.body.name || req.body.email;
        newUser.countryCode = req.body.countryCode || 'NA';

        await  newUser.save();
        return res.status(201).json(newUser.toObject());

    } catch (error) {
        console.log(error);
        return res.status(500).json({messsage: 'error encountered'});
    }
};

const updateUser = async (req:Request, res: Response) => {
    try {
        const {name, addressLine1, country, city, countryCode, mobileNumber} = req.body;

        const user = await User.findById(req.userId);

        if(!user){
            return res.status(404).json({message:'No user with the given input was found.'});
        }

        user.name = name;
        user.addressLine1 = addressLine1;
        user.country = country;
        user.city= city;
        user.countryCode = countryCode;
        user.mobileNumber = mobileNumber;

        await user.save();

        return res.send(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({messsage: 'error encountered'});
    }
}

const isContactNumber = (value: string,type:string) => {
    const regexCountryCode = /^\+\d{1,3}$/;
    const regexPhoneNumber = /^[0-9]$/
    let result = false;

    switch(type){
        case "country_code":
            result = regexCountryCode.test(value);
            break;
        case "phone_number":
            result = regexPhoneNumber.test(value); 
            break;
        
    }
    return result;
}

export default {
    getUser,
    createUser,
    updateUser
}

