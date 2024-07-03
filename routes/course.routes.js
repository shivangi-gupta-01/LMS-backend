import express from 'express';
import { addLecturesByCourseId, createCourse, deleteCourse, deleteLecturesByCourseId, getAllCourses, getLecturesByCourseId, updateCourse } from '../controllers/course.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from '../middlewares/auth.middleware.js';
const router = express.Router();

router
      .route('/')
      .get(getAllCourses)
      .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
        )
      .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        deleteLecturesByCourseId
        );

router
      .route('/:courseId')
      .get(isLoggedIn ,authorizedSubscriber, getLecturesByCourseId)
      .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse)
      .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        deleteCourse)
      .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        addLecturesByCourseId
      );
      
export default router;