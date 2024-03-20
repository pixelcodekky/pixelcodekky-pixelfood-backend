"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const usreSchema = new mongoose_1.default.Schema({
    auth0Id: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    name: {
        type: String
    },
    addressLine1: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    }
});
const User = mongoose_1.default.model("User", usreSchema);
exports.default = User;
