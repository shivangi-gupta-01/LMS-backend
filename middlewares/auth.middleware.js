import AppError from "../utils/appError.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = function(req , res , next){
    const {token} = req.cookies;
    if(!token){
        return next(new AppError('Unauthenticated, please login' , 400));
    }
    const tokenDetails = jwt.verify(token , process.env.JWT_SECRET);
    if(!tokenDetails){
        return next(new AppError('Unauthenticated, please login' , 400));
    }
    req.user = tokenDetails;
    console.log(req.user);
    next();
}

const authorizedRoles = (...roles) => (req , res , next) => {

    const currectRole = req.user.role;
    if(!roles.includes(currectRole)){
        return next(new AppError('You have no permission to access this route' , 500));
    }
    next();
}

const authorizedSubscriber = async (req , res , next) => {

    const subscriptionStatus = req.user.subscription.status;

    const currectRole = req.user.role;

    if(currectRole !== 'ADMIN' && subscriptionStatus !== 'active'){
        return next(new AppError('Please subscribe to access this route', 403));
    }

    next();
}

export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}
