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

        const newUser = new User(req.body);
        await  newUser.save();
        return res.status(201).json(newUser.toObject());

    } catch (error) {
        console.log(error);
        return res.status(500).json({messsage: 'error encountered'});
    }
};

const updateUser = async (req:Request, res: Response) => {
    try {
        console.log(req.body);
        const {name, addressLine1, country, city} = req.body;

        const user = await User.findById(req.userId);

        if(!user){
            return res.status(404).json({message:'No user with the given input was found.'});
        }

        user.name = name;
        user.addressLine1 = addressLine1;
        user.country = country;
        user.city= city;

        await user.save();

        return res.send(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({messsage: 'error encountered'});
    }
}


export default {
    getUser,
    createUser,
    updateUser
}

