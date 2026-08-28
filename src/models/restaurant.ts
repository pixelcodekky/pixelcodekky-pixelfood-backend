import mongoose, { InferSchemaType } from "mongoose";

const menuItemSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        require: true,
        default: () => new mongoose.Types.ObjectId(),
    },
    name:{
        type:String,
        require: true,
    },
    price:{
        type: Number,
        require: true,
    },
    imageUrl: {
        type: String,
    }
}, {timestamps: true});

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

const restaurantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    restaurantName: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    deliveryPrice: {
        type: Number,
        required: true,
    },
    estimatedDeliveryTime: {
        type: Number,
        required: true,
    },
    cuisines: [{
        type: String,
        required: true,
    }],
    menuItems: [menuItemSchema],
    imageUrl: {
        type: String,
        required: true,
    }
}, { timestamps: true });

restaurantSchema.virtual('address', {
    ref: 'RestaurantAddress',
    localField: '_id',
    foreignField: 'restaurant',
    justOne: true,
});

restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;

