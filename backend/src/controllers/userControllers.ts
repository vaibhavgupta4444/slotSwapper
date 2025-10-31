import { Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

const createToken = (id: ObjectId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign({ id }, secret, { expiresIn: '7d' });
}

const signIn = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    try {

        if(!email || !password){
            throw new Error("Missing required parameters");
        }

        const user = await User.findOne({email});

        if(!user){
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            throw new Error("Invalid password");
        }

        const token = createToken(user.id);

        return response.json({
            success: true,
            token
        })
        
    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

const signUp = async (request: Request, response: Response) => {
    const { name, email, password } = request.body;

    try {
        
        if(!name || !email || !password){
            throw new Error("Missing parameters");
        }

        const isUserExist = await User.findOne({email});

        if(isUserExist){
            throw new Error("User Already Exists");
        }

        const salt=await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: newPassword
        });

        const user = await newUser.save();

        const token = createToken(user.id);

        return response.json({
            success: true,
            token
        })

    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}

export {signIn, signUp};