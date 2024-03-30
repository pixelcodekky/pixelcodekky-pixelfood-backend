import express from 'express';
import { param } from 'express-validator';
import RestaurantControllers from '../controllers/RestaurantControllers';


const router = express.Router();

router.get(
        '/search/:city', 
        param('city').isString().trim().notEmpty().withMessage(`City parameter must be valid string`),
        RestaurantControllers.searchRestaurant);

router.delete('/',RestaurantControllers.deleteRestaurants);

export default router;


