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
    }
});

const User = mongoose.model("User", usreSchema);
export default User;


