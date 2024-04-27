import mongoose, { InferSchemaType } from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buildingName: {
        type: String,
        require: false
    },
    floor: {
        type: String,
        require: false
    },
    deliveryInstruction: {
        type: String,
        require: false
    },
    postalcode: {
        type: Number,
        require: true
    },
    isDefault:{
        type: Boolean,
        require: false
    },
    addressName:{
        type: String,
        require: true
    }
},{timestamps: true});

const Address = mongoose.model("Address", addressSchema);
export default Address;


