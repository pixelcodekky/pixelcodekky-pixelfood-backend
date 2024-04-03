import mongoose, { InferSchemaType } from "mongoose";

const orderSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveryDetails: {
        email:{
            type: String, 
            required: true,
        },
        name:{
            type: String, 
            required: true,
        },
        addressLine1:{
            type: String, 
            required: true,
        },
        city:{
            type: String, 
            required: true,
        },
    },
    cartItems:[
        {
            menuItemId: {type: String, require: true},
            quantity: {type: Number, require: true},
            name: {type: String, require: true},
        },
    ],
    totalAmount: Number,
    status: {
        type: String,
        enum: ["placed","paid","inProgress","outForDelivery","delivered"],
    }
}, { timestamps: true});

const Order = mongoose.model("Order", orderSchema);
export default Order;



