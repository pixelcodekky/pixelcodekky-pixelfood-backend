import {Request, Response} from 'express';
import Restaurant from '../models/restaurant';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';
import Order from '../models/order';

const createRestaurant = async (req: Request, res: Response) => {
    try {
        
        const existingRestaurant = await Restaurant.findOne({user: req.userId});

        if(existingRestaurant){
            return res.status(409).json({message: 'Restaurant already exist'});
        }

        // const image = req.file as Express.Multer.File;
        // const base64Image = Buffer.from(image.buffer).toString('base64');
        // const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        // const uploadRes = await cloudinary.v2.uploader.upload(dataURI);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = await uploadImage(req.file as Express.Multer.File);
        restaurant.user = new mongoose.Types.ObjectId(`${req.userId}`);
        await restaurant.save();

        res.status(201).send(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({user: req.userId});

        if(!restaurant){
            return res.status(404).json({message: `No restaurant found for user`});
        }

        res.json(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}



const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({user: req.userId});

        if(!existingRestaurant){
            return res.status(404).json({message: `Cannot find your restaurant.`});
        }

        existingRestaurant.restaurantName = req.body.restaurantName;
        existingRestaurant.city = req.body.city;
        existingRestaurant.country = req.body.country;
        existingRestaurant.deliveryPrice = req.body.deliveryPrice;
        existingRestaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        existingRestaurant.cuisines = req.body.cuisines;
        existingRestaurant.menuItems = req.body.menuItems;

        if(req.file){
            existingRestaurant.imageUrl = await uploadImage(req.file as Express.Multer.File);
        }

        await existingRestaurant.save();
        res.status(200).send(existingRestaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Server error, ${error}`});
    }
}

const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({user: req.userId});
        if(!restaurant){
            return res.status(404).json({message: `This user does not have a restaurant`});
        }

        const orders = await Order.find({restaurant: restaurant._id}).populate('restaurant').populate('user');

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Fail to get Restaurant Orders`})
    }
}

const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const {orderId} = req.params;
        const {status} = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }

        const restaurant = await Restaurant.findById(order.restaurant);

        if(restaurant?.user?._id.toString() !== req.userId){
            res.status(401).send();
        }
        
        order.status = status;
        await order.save();

        res.status(200).json(order);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: `unable to update order status`});
    }
}

const uploadImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString('base64');
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadRes = await cloudinary.v2.uploader.upload(dataURI);

    return uploadRes.url;
}

export default {
    createRestaurant,
    getMyRestaurant,
    updateRestaurant,
    getMyRestaurantOrders,
    updateOrderStatus
}

