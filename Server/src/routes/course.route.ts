import express, { Request, Response, Router } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware";
import { courseEnrolledByMe, CoursesUploadedByMe, createCourse, deleteCourse, enrollInCourse, getAllCourses, getCoursesById, searchCourses, updateCourse } from "../controllers/course.controller";
import upload from "../middleware/upload";
const app = Router();

app.post("/create", authenticate, authorize("instructor", "admin"), upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mediaFiles', maxCount: 10 }
]), createCourse);



app.put("/update/:courseId", authenticate, authorize("instructor", "admin"), upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mediaFiles', maxCount: 10 }
]), updateCourse);


app.post("/delete/:courseId", authenticate, authorize("instructor", "admin"), deleteCourse)
app.get("/AllCourses", getAllCourses)
app.get("/CourseDetail/:courseId" , getCoursesById);

app.get("/MyCourses/:instructorId", authenticate, authorize("instructor", "admin"), CoursesUploadedByMe);
app.get(
    "/my-courses",
    authenticate,
    authorize("student", "instructor", "admin"), 
    courseEnrolledByMe
);

app.post("/enrollInACourse/:courseId", authenticate, authorize("student"), enrollInCourse);
app.get("/search" , searchCourses);
export default app; 
