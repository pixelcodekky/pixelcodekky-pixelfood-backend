import {Request, Response} from 'express';
import Address from '../models/address';

const addAddress = async (req: Request, res: Response) => {
    try {
        const newAddress = new Address(req.body);
        await  newAddress.save();
        return res.status(201).json(newAddress.toObject());
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const getAddress = async (req: Request, res: Response) => {
    try {
        const {id} = req.body.addressId;
        const userId = req.userId;

        const userAddr = await Address.find({_id: id, user: userId});
        if(!userAddr){
            return  res.status(404).json({message:"No Address found"});
        }
        res.json(userAddr);
    }catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const updateAddress = async (req: Request, res: Response) => {

}

const updateDefaultAddress = async (req: Request, res: Response) => {

}

const deleteAddress = async (req:  Request, res: Response) => {

    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:`Server error, ${error}`});
    }

}

export default {
    addAddress,
    getAddress,
    deleteAddress,
    updateAddress,
    updateDefaultAddress
}