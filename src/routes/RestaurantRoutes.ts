import express from 'express';
import { param } from 'express-validator';
import RestaurantControllers from '../controllers/RestaurantControllers';


const router = express.Router();

router.get(
        '/search/:city', 
        param('city').isString().trim().notEmpty().withMessage(`City parameter must be valid string`),
        RestaurantControllers.searchRestaurant);

router.get('/:restaurantId', 
param('restaurantId').isString().trim().notEmpty().withMessage(`RestaurantId parameter must be valid string`),
RestaurantControllers.getRestaurant);


router.delete('/staging/deletemany',RestaurantControllers.deleteRestaurants);
router.put('/staging/updatebyname', RestaurantControllers.updateRestaurantName);

export default router;


