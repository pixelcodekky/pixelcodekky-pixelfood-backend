import mongoose from "mongoose";

const usreSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    name:{
        type: String
    },
    addressLine1:{
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    mobileNumber:{
        type: Number,
        require: true,
    },
    countryCode:{
        type: String,
        require: true,
    },
    isVerified :{
        type: Boolean,  
        default: false  // initially set to false for non verified users
    }
}, {timestamps: true});

const User = mongoose.model("User", usreSchema);
export default User;


