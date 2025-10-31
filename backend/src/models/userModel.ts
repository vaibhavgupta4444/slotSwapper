import mongoose from "mongoose";

export interface UserInterface{
    id?: mongoose.ObjectId;
    name?: string;
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema<UserInterface>({
    name:{
        type: String
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    }
},{
    timestamps: true
});

export const User = mongoose.model("User", userSchema);