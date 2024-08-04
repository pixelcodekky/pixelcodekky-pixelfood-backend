import {Request, Response} from 'express';
import Address from '../models/address';
import mongoose from 'mongoose';

const addAddress = async (req: Request, res: Response) => {
    try {
        
        const newAddress = new Address(req.body);
        newAddress.user = new mongoose.Types.ObjectId(`${req.userId}`);

        await newAddress.save();
        
        return res.status(201).json(newAddress.toObject());
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const getAddress = async (req: Request, res: Response) => {
    try {
        const {Id} = req.params;

        let userAddr; 
        let result = [];
        if(Id === undefined || Id === ''){
            userAddr =  await Address.find({user: req.userId});
        }else{
            userAddr =  await Address.findOne({_id: Id, user: req.userId});
            result.push(userAddr);
        }
       
        if(!userAddr){
            return  res.status(404).json({message:"No Address found"});
        }
        return await res.json(result.length > 0 ? result : userAddr);
    }catch (error) {
        console.log(error);
        return res.status(500).json({message: `Server error, ${error}`});
    }
}

const updateAddress = async (req: Request, res: Response) => {
    try {
        const existingAddress = await Address.findOne({
            _id: req.body._id,
            user: req.userId
        });

        if(!existingAddress){
            return res.status(404).json({message: "Address not found"});
        }

        existingAddress.buildingName = req.body.buildingName;
        existingAddress.floor = req.body.floor;
        existingAddress.deliveryInstruction = req.body.deliveryInstruction;
        existingAddress.postalcode = req.body.postalcode;
        existingAddress.lon = req.body.lon;
        existingAddress.lat = req.body.lat;
        existingAddress.isDefault = req.body.isDefault;
        existingAddress.addressName = req.body.addressName;
        existingAddress.fullName = req.body.fullName;

        await existingAddress.save();
        res.status(200).send(existingAddress);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const updateDefaultAddress = async (req: Request, res: Response) => {
    try {
        const existingAddress = await Address.findOne({_id: req.body.Id});

        if(!existingAddress){
            return res.status(404).json({message: "Address not found"});
        }

        existingAddress.isDefault = req.body.isDefault;

        await existingAddress.save();
        res.status(200).send(existingAddress);

    } catch (error) {
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const deleteAddress = async (req:  Request, res: Response) => {
    try {
        const {Id} = req.params;

        const result = await Address.deleteOne({_id: Id});
        if(result.deletedCount === 0)
            return res.status(404).json({message: "Address not found"});

        return res.status(204).json({message: `Record Delete`});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:`Server error, ${error}`});
    }

}

export default {
    addAddress,
    getAddress,
    deleteAddress,
    updateAddress,
    updateDefaultAddress
}