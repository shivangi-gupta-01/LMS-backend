import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import crypto from 'crypto';
import { Console } from 'console';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';

const cookieOptions = {
    maxAge : 24 * 60 * 60 * 1000,
    httpOnly : true
}

const register = async (req , res, next) => {

    const {username , email , password } = req.body;

    if(!username || !email || !password){
        return next(new AppError('All fields are required' , 400));
    }

    const checkUser = await User.findOne({email});

    if(checkUser){
        return next(new AppError('Email is registered already' , 400));
    }

    const user = await User.create({
        username,
        email,
        password,
        avatar :{
            public_id : email,
            secure_url : 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg'
        }
    });

    if(!User){
        return next(new AppError('User registration failed , please try again' , 400));
    }

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path , {
                folder: 'LMS',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //remove file from local server
                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (err) {
            return next(new AppError(err.message || 'File not uploaded, please try again' , 500));
        }
    }

    await user.save();

    
    const token = await user.generateJWTToken();
    res.cookie('token' , token , cookieOptions);

    user.password = undefined;

    res.status(200).json({
        success  :true,
        message : 'User registered successfully',
        user
    });
}

const login = async (req , res, next) => {

    const { email , password } = req.body;
    console.log(email, password);

    if(!email || !password){
        return next(new AppError('All fields are required' , 400));
    }

    const user = await User.findOne({email}).select('+password');

    if(!user || !user.comparePassword(password)){
        return next(new AppError('Email or Password does not match' , 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token' , token , cookieOptions);


    res.status(200).json({
        success : true,
        message : 'User logged in successfully',
        user
    })
}

const logout = (req, res) => {

    res.cookie('token' , null , {
        secure : true,
        maxAge : 0,
        httpOnly : true
    });

    res.status(200).json({
        success : true,
        message : 'User logged out successfully'
    });
}

const getProfile = async (req , res) => {

    const user = await User.findById(req.user.id);
    
    res.status(200).json({
        success : true,
        message : 'User details',
        user
    })
}

const forgotPassword = async (req , res , next) => {

    const { email } = req.body;

    if(!email){
        return next(new AppError('Email is required' , 400));
    }

    const user = await User.findOne({email});

    if(!user){
        return next(new AppError('Email is not registered' , 400));
    }

    // generate token for reset password 
    const resetToken = await user.generatePasswordToken();

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = 'Reset Password';

    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`; 

    console.log(resetPasswordUrl);
    try {
        await sendEmail(email, subject , message);

        res.status(200).json({
            success : true,
            message : `Reset password token has been sent to ${email} successfully`
        });

    } catch (err) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        return next(new AppError(err.message , 500));
    }
}

const resetPassword = async (req , res , next) => {
        
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry : { $gt : Date.now()}
    });

    if(!user){
        return next(new AppError('Token is invalid or expired' , 500));
    }

    user.password = password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
        success : true,
        message : 'Password changed successfully'
    });
}

const changePassword = async function(req, res, next){

    const { oldPassword , newPassword } = req.body;

    const { id } = req.user;

    if(!oldPassword || !newPassword){
        return next(new AppError('All fields are required' , 400));
    }

    const user = await User.findById(id).select('+password');

    if(!user){
        return next(new AppError('User does not exist' , 400));
    }

    const isValidPassword = await bcrypt.compare(oldPassword , user.password);

    if(!isValidPassword){
        return next(new AppError('Invalid old password' , 400));
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success : true,
        message : 'Password changed successfully'
    });
}

const updateUser = async function(req, res , next){

    const { username } = req.body;

    const {id} = req.params;

    const user = await User.findById(id);

    if(!user){
        return next(new AppError('User does not exists' , 400));
    }

    if( username ){
        user.username = username;
    }

    if(req.file){

        // to first of all delete the current avatar image
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        const result = await cloudinary.v2.uploader.upload(req.file.path , {
            folder: 'LMS',
            width: 250,
            height: 250,
            gravity: 'faces',
            crop: 'fill'
        });

        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            // then remove the image from local server
            fs.rm(`uploads/${req.file.filename}`);
        }
    }

    await user.save();

    res.status(200).json({
    success : true,
    message : 'User profile is updated successfully'
    });
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}