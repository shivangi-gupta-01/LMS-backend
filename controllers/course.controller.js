import Course from '../models/course.model.js';
import AppError from '../utils/appError.js';
import fs from 'fs/promises';
import cloudinary from 'cloudinary';
import User from '../models/user.model.js';

export const getAllCourses = async (req , res  ,next) => {

   try {
     const courses = await Course.find({}).select('-lectures');
     console.log(courses);

     res.status(200).json({
        success: true,
        message : 'All course details',
        courses
     });

   } catch (err) {
    return next(new AppError(err.message, 500));
   }
}

export const getLecturesByCourseId = async (req, res, next) => {

    try {
        const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if(!course){
        return next(new AppError('Invalid course' , 400));
    }

    res.status(200).json({
        success : true,
        message : 'Course fetched successfully',
        lectures : course.lectures
    });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

export const createCourse = async (req , res , next) => {

    try {
        
        const {title , description, category , createdBy} = req.body;

        if(!title || !description || !category || !createdBy){
            return next(new AppError('All fields are required' , 400));
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail : {
                public_id : "Dummy",
                secure_url : "Dummy"
            }
        });

        if(req.file){
            const result = await cloudinary.v2.uploader.upload(req.file.path , {
                folder: 'LMS'
            });

            if(result){
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
    
                // remove the thumbnail from  local server
                fs.rm(`uploads/${req.file.filename}`);
            }
        }


            await course.save();

            res.status(200).json({
                success : true,
                message : 'Course created successfully',
                course
            });
            
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};

export const updateCourse = async (req , res , next) => {

    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set : req.body
            },
            {
                runValidators : true
            }
        );

        if(!course){
            return next(new AppError('Course does not exists' , 500));
        }

        res.status(200).json({
            success : true,
            message : 'Course updated successfully',
            course
        })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }

};

export const deleteCourse = async (req , res , next) => {

    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if(!course){
            return next(new AppError('Course does not exists' , 500));
        }

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success : true,
            message : 'Course deleted successfully'
        })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }

};

export const addLecturesByCourseId = async (req , res , next) => {


     try {
        
        const {courseId } = req.params;
        const { title , description } = req.body;

        const course = await Course.findById(courseId);


        if(!title || !description){
            return next(new AppError('All fields are required' , 400));
        }

        if(!course){
            return next(new AppError('Course does not exists' , 400));
        }

        const lectureData = {
            title,
            description,
            lecture : {
                public_id: "dummy",
                secure_url : "dummy"
            }
        }

        if(req.file){
            const result = await cloudinary.v2.uploader.upload(req.file.path , {
                folder: 'LMS'
            })
            if(result){
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
    
                // remove the lecture img/video from local server
            }
            fs.rm(`uploads/${req.file.filename}`);
        }
        course.lectures.push(lectureData);
        course.numOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success : true,
            message : 'Lecture added successfully',
            course
        })


     } catch (err) {
        return next(new AppError(err.message, 500));
     }
}

export const deleteLecturesByCourseId = async ( req, res , next) => {
        try {
            
            const { courseId , lectureId} = req.query;

            if(!courseId){
                return next(new AppError('CourseId is required' , 400));
            }

            if(!lectureId){
                return next(new AppError('LectureId is required' , 400));
            }

            const course = await Course.findById(courseId);

            if(!course){
                return next(new AppError('Invalid id or Course does not exist' , 400));
            }

            const lectureIndex = course.lectures.findIndex( (lecture) => lecture._id.toString() === lectureId.toString());

            if(lectureIndex === -1){
                return next(new AppError('Lecture does not exists' , 400));
            }

            // remove the lecture video from cloudinary
            await cloudinary.v2.uploader.destroy(
                course.lectures[lectureIndex].lecture.public_id,
                {
                    resource_type : 'video'
                }
            )

            // remove the lecture from the lectures array
            course.lectures.splice(lectureIndex , 1);

            // update the numOfLecture count
            course.numberOfLectures = course.lectures.length;

            await course.save();

            res.status(200).json({
                success: true,
                message : 'Course lecture deleted successfully'
            })

        } catch (e) {
            return next(new AppError(e.message , 500));
            
        }
}