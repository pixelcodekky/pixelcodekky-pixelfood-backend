import {Request, Response} from 'express';
import Restaurant from '../models/restaurant';
import Order from '../models/order';

const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOptions = (req.query.sortOption as string) || "updatedAt";
        const page: number = parseInt(req.query.page as string);

        let query: any = {};

        query['city'] = new RegExp(city, "i");
        const checkCity = await Restaurant.countDocuments(query);
        if(checkCity == 0){
            return res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages:1,
                }
            });
        }

        if(selectedCuisines){
            const cuisinesArray = selectedCuisines.split(',').map((d) => new RegExp(d,"i"));
            query["cuisines"] = {$all: cuisinesArray};
        }

        if(searchQuery){
            const checkSearch = new RegExp(searchQuery.toLowerCase(),"i");
            query["$or"] = [
                {restaurantName: checkSearch},
                {cuisines: {$in: [checkSearch]}},
            ];
        }

        let restaurants: any = [];

        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        if(page === 0){
            //find all restaurant with query.
            restaurants = await Restaurant.find(query).sort({[sortOptions]: 1});
        }else{
            restaurants = await Restaurant.find(query).sort({[sortOptions]: 1}).skip(skip).limit(pageSize).lean();
        }
        
        const total = await Restaurant.countDocuments(query);

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total/ pageSize),
            }
        }

        res.json(response);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong'});
    }
}

const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;
        const restaurant = await Restaurant.findById(restaurantId);

        if(!restaurant){
            return res.status(404).json({message: 'Restaurant not found.'});
        }

        res.json(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong',error: `${error}`});
    }
}



const deleteRestaurants = async (req: Request, res: Response) => {
    try {
        const filter = req.body;

        const result = await Restaurant.deleteMany(filter);

        res.status(200).json({deleted : result.deletedCount});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong',error: `${error}`});
    }
}

const updateRestaurantName = async (req: Request, res:Response) => {
    
    try {
        const newName = {"city":req.body.name};
        const filterword = {"city": req.body.filterword};

        const result = await Restaurant.updateMany(filterword, newName);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong',error: `${error}`});
    }
    

    


}


export default {
    searchRestaurant,
    deleteRestaurants,
    getRestaurant,
    updateRestaurantName
}