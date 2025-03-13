import { genToken } from "../lib/utils.js";
import User from "../models/users.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async(req,res)=>{
    const { fullName,password,email } = req.body;
    try {
        if(!fullName || !password || !email){
            return res.status(400).json({message : "Fill all fields"});
        }
        if(password.length < 6){
            return res.status(400).json({message : "Modify password length"});
        }
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message:"This email Already exists!!"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            password: hashedPassword,
            email,
        })

        if(newUser) {
            genToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                createdAt: newUser.createdAt, 
              });
              
        }
        else return res.status(400).json({message:"Invalid User data"});

    } catch (error) {
        console.log(`Error with signup ${error.message}`);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export const login = async(req,res)=>{
    const { email,password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({message : "Invalid credentials!!"});

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials!!"});

        genToken(user._id,res);

        return res.status(200).json({
            _id:user._id,
            fullName : user.fullName,
            email : user.email,
            createdAt:user.createdAt,
            profilePic : user.profilePic
        });
    } catch (error) {
        console.log(`There is error in login ${error.message}`);
        return res.status(500).json({message:"Internal Server Error!!!"});
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        return res.status(200).json({message : "Logged Out!!"});
    } catch (error) {
        console.log(`Error in Logging Outt!!`);
        return res.status(500).json({message : "Internal Server Error"});
    }
}


export const updateProfile = async(req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) return res.status(400).json({message:"Profile pic is required!!"});

        const uploadResponse = await cloudinary.uploader.upload(profilePic,{
            folder: "profile_pics",
          });
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log(`Error in profile pic Update : ${error.message}`);
        return res.status(500).json({message:"Internal Server Error!!!"});
    }
}


export const checkAuth = (req,res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }
        res.status(200).json(req.user);
    } catch (error) {
        console.log(`Error in checkAuth Controller ${error.message}`);
        return res.status(500).json({message:"Internal server Error!!"});
    }
}