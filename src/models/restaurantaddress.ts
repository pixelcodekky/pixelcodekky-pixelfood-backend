import mongoose, { InferSchemaType } from "mongoose";

const restaurantAddressScheme = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
    },
    place_id:{
        type:Number
    },
    lat: {
        type: Number, 
        required: true
    },
    lon: {
        type:Number,
        required:true,
    },
    name: {
        type: String,
    },
    display_name: {
        type:String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postcode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const RestaurantAddress = mongoose.model("RestaurantAddress", restaurantAddressScheme);
export default RestaurantAddress;


