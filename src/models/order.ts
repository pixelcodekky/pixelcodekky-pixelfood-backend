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
        mobileNumber:{
            type:Number,
            require: true,
        },
        countryCode:{
            type:String,
            required: true,
        },
        buildingName:{
            type:String,
            require:false,
        },
        floor:{
            type:String,
            require:false,
        },
        unitNumber:{
            type:String,
            require:false,
        },
        deliveryInstruction:{
            type:String,
            require:true,
        },
        fullName:{
            type:String,
            require:true,
        },
    },
    cartItems:[
        {
            menuItemId: {type: String, require: true},
            quantity: {type: Number, require: true},
            name: {type: String, require: true},
            price: {type: Number, require: true},
        },
    ],
    totalAmount: Number,
    status: {
        type: String,
        enum: ["placed","paid","inProgress","outForDelivery","delivered"],
    },
    gst:{type:Number, require: true},
    deliveryfee:{type:Number, require:false},
    payment_status: {type: String, require: false},
    payment_intent: {type: String, require:false},
    reference_id: {type: String, require:false},
}, { timestamps: true});

const Order = mongoose.model("Order", orderSchema);
export default Order;



