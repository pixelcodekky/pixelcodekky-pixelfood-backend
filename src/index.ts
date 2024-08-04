import express, {Request, Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import myUserRoute from './routes/MyuserRoutes';
import myRestaurantRoute from './routes/MyRestaurantRoutes';
import RestaurantRoutes from './routes/RestaurantRoutes';
import myAddressRoutes from './routes/MyAddressRoutes';
import orderRoutes from './routes/OrderRoute';
import {v2 as cloudinary} from 'cloudinary';

const mongodburl = process.env.MONGODB_CONNECTION_STRING as string; 

mongoose.connect(mongodburl).then(() =>{
    console.log(`Mongo DB Service Connected.`);
}).catch((error) => {
    if(error.name === 'MongoNetworkError'){
        console.error(`Network Error, make sure network setting are correct`);
    }
    console.error(`Mongo DB Service Not Connected. ${error}`);
    process.exit(1);
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());

const port = process.env.PORT || 5000;

app.use('/api/order/checkout/webhook', express.raw({type: '*/*'}));
app.use(express.json());

app.get("/hello", async (req: Request, res: Response) => {
    res.json({message: "Welcome from pixel soft api"});
});

//register routes
app.use('/api/my/user', myUserRoute);
app.use('/api/my/restaurant', myRestaurantRoute);
app.use('/api/restaurant', RestaurantRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/my/address', myAddressRoutes);

app.listen(port, () => {
    console.log(`Server is listen on port ${port}`);
});

