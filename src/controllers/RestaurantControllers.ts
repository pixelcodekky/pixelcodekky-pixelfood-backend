import mongoose from 'mongoose';
import {Request, Response} from 'express';
import Restaurant from '../models/restaurant';
import { calculateDistanceHelper, importAndRead, paginateResult } from '../common';
import RestaurantAddress from '../models/restaurantaddress';
import { RestaurantSearchResponse } from '../common/types';

const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOptions = (req.query.sortOption as string) || "updatedAt";
        const page: number = parseInt(req.query.page as string);
        const latitude: number = parseFloat(req.query.latitude as string);
        const longitude: number = parseFloat(req.query.longitude as string);
        
        let query: any = {};

        var pipeline: any = [
            {
                $lookup:{
                    from: 'restaurantaddresses',
                    localField: '_id',
                    foreignField: 'restaurant',
                    as: 'address' 
                }
            },
        ];

        query['country'] = new RegExp(city, "i");
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
        
        pipeline.push(
            { 
                $match: query 
            },
            {
                $sort: {[sortOptions] : 1}
            },
        );

        // if(page === 0){
        //     //find all restaurant with query.
        //     //restaurants = await Restaurant.find(query).sort({[sortOptions]: 1});
        //     restaurants = await Restaurant.aggregate(pipeline);
        // }else{
        //     // pipeline.push(
        //     //     {
        //     //         $skip: skip
        //     //     },
        //     //     {
        //     //         $limit: pageSize
        //     //     }
        //     // );
        //     //restaurants = await Restaurant.find(query).sort({[sortOptions]: 1}).skip(skip).limit(pageSize).lean();
        //     restaurants = await Restaurant.aggregate(pipeline);
        // }

        restaurants = await Restaurant.aggregate(pipeline);
        
        const total = await Restaurant.countDocuments(query);

        let response: RestaurantSearchResponse = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total/ pageSize),
            }
        }

        let coordinates = {
            lat: latitude,
            lng: longitude,
        }

        let result = calculateDistanceHelper(response, coordinates);

        if(sortOptions === 'distance'){
            //sort by distance
            result = {...result, data: [...result.data].sort((a, b) => (a.distance || 0) - (b.distance || 0))};
        }

        //skip and pageSize
        if(page > 0){
            result = {...result, data: paginateResult(result, pageSize)}
        }
        res.json(result);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong'});
    }
}

const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;
        //const restaurant = await Restaurant.findById(restaurantId);
        console.log('parameter', restaurantId);
        const combieData = await Restaurant.aggregate([
            {
                $match: {
                    _id: { $eq: new mongoose.Types.ObjectId(`${restaurantId}`) },
                },     
            },
            {
                $lookup:{
                    from: 'restaurantaddresses',
                    localField: '_id',
                    foreignField: 'restaurant',
                    as: 'address'
                },
            },
        ]);
        console.log('before', combieData);
        if(!combieData){
            return res.status(404).json({message: 'Restaurant not found.'});
        }
        
        return res.json(combieData[0]);

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Something went wrong',error: `${error}`});
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

const upadteRestaurantMenuItemImg = async (req: Request, res: Response) => {

}

//temp use
const upadteRestaurantAddress = async (req: Request, res: Response) => {
    var rescount = await Restaurant.countDocuments();
    let restaurantIds = await Restaurant.find({}, {_Id:1});

    let populatedata = importAndRead();

    //remove existing records
    //let deletedCount = await RestaurantAddress.deleteMany({});
    //console.log('delete count', deletedCount);

    for (let i=0 ;i<rescount;i++){
        let existingRec = await RestaurantAddress.find({restaurant: restaurantIds[i]});
        if(existingRec.length > 0) continue;

        if(populatedata[i] !== undefined){
            let newAddress = new RestaurantAddress ({
                restaurant: restaurantIds[i],
                lat: populatedata[i]['lat'] || '',
                lon: populatedata[i]['lon'] || '',
                name: populatedata[i]['name'] || '',
                display_name: populatedata[i]['display_name'] || '',
                postcode: populatedata[i]['postcode'] || '',
                country: populatedata[i]['country'] || '',
                country_code: populatedata[i]['country_code'] || '',
                city: populatedata[i]['city'] || '',
            });
            await newAddress.save().then((savedRestaurant) => {
                console.log('Restaurant address saved successfully:', savedRestaurant.display_name);
            })
            .catch((error) => {
                console.error('Error saving restaurant address:', error);
            });
        }
        
    }
    let newResAddress = await RestaurantAddress.find({});

    return res.json(newResAddress);
}


export default {
    searchRestaurant,
    deleteRestaurants,
    getRestaurant,
    updateRestaurantName,
    upadteRestaurantAddress
}