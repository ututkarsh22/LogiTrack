import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AgentModel from "../models/Agent.model.js";

export const registerUser = async (req,res)=>{

    try{

        const {name,email,password,confirmPassword,role} = req.body;

        if(!name || !email || !password || !confirmPassword || !role){
            return res.status(400).json({message:"All fields are required"});
        }   
        
        if(password !== confirmPassword)
        {
            return res.status(402).json({
                success : false,
                message : "Password are not same"
            })
        }
        const existing = await User.findOne({email});

        if(existing)
        {
            return res.status(400).json({
                success : false,
                message : "User already exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role
        });

        if(role === "agent")
        {
            const agent = await AgentModel.create({
                user : user._id
            })
        }

        res.status(201).json({
            success : true,
            message : "User registerd Successfully",
            user : {
                id : user._id,
                name : user.name,
                email : user.email,
                role : user.role
            }
        });

    }catch(err){
        res.status(501).json({
            success : false,
            message : err.message
        })
    }

};


export const loginUser = async(req, res) => {
 try {
    
     const{email , password} = req.body;
 
     if(!email || !password){
         return res.status(401).json({
             success:false,
             message : "All fields required",
         })
     }
     const exist = await User.findOne({email});
 
     if(!exist){
         return res.status(401).json({
             success : false,
             message : "Invalid email"
         })
 
     }
 
     const hashedPassword = await bcrypt.compare(password, exist.password);

     if(!hashedPassword)
     {
         return res.status(400).json({
             success : false,
             message : "Password is invalid"
         })
     }
 
     const token = jwt.sign(
         {id: exist._id,role: exist.role},
         process.env.JWT_SECRET,
         {expiresIn:"3d"}
 );

    res.cookie("token", token , {
        httpOnly : true,
        secure : false,
        maxAge : 24 * 60 * 60 * 1000
    })
 res.status(200).json({
     success: true,
     message:"login sucessful",
     exist:{
         id:exist._id,
         name : exist.name,
         email: exist.email,
         role:exist.role
     }
 });
 } catch (error) {
    res.status(501).json({
        success : false,
        message : `error from login ${error.message}`
    })
 }

}

export const logoutUser = async(req,res) => {
    try {
        
        res.clearCookie("token");

        res.json({
            success : true,
            message : "Successfully logout"
        })
    } catch (error) {
        res.json({
            success : false,
            message : error.message
        })
    }
}