import {Request, Response} from 'express';
import Restaurant from '../models/restaurant';

const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOptions = (req.query.sortOption as string) || "updatedAt";

        const page = parseInt(req.query.page as string) || 1;

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

        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const restaurants = await Restaurant.find(query).sort({[sortOptions]: 1}).skip(skip).limit(pageSize).lean();

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


export default {
    searchRestaurant,
    deleteRestaurants
}