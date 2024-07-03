import { Schema , model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({
    username : {
        type : String,
        require : [true , 'Username is required'],
        minLen : [5 , 'Username must be at-least 5 characters'],
        maxLen : [50 , 'Username should less than 50 characters'],
        lowercase : true,
        trim : true 
    },

    email : {
        type : String,
        require : [true , 'Email is required'],
        unique : true,
        lowercase : true,
        trim : true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
        ]
    },

    password : {
        type : String,
        require : [true , 'Password is required'],
        minLen : [8 , 'Password must be at-least 8 characters'],
        select : false
    },

    role : {
        type : String,
        enum :['USER' , 'ADMIN'],
        default : 'USER'
    },

    avatar : {
        public_id : {
            type : String
        },

        secure_url : {
            type :String
        }
    },

    forgotPasswordToken : String,
    forgotPasswordExpiry : Date,

    subscription : {
        id : String,
        status : String
    }

}, {
    timestamps : true
});

userSchema.pre('save' , async function(next) {
    if(!this.isModified('password')){
        return next();
    }

    this.password = await bcrypt.hash(this.password , 10);
    return next();
});

userSchema.methods = {
    comparePassword : async function(plainTextPassword){
        return bcrypt.compare(plainTextPassword , this.password);
    },

    generateJWTToken : function(){
        return jwt.sign({
            id : this._id , role : this.role , email : this.email , subscription : this.subscription
        },
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_EXPIRY
        }
        )
    },
    generatePasswordToken : async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000 // 15 min

        return resetToken;
    }
}

// now create the model of user schema 
const User = model('User' , userSchema);

export default User;