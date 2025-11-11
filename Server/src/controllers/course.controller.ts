import { Response, Request } from "express";
import cloudinary from "../utils/libs/cloudinary";
import Course from "../models/course.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, category } = req.body;
        const instructor = (req as any).user?.userId;

        if (!title || !description || !instructor) {
            return res.status(400).json({
                success: false,
                message: "All fields required"
            });
        }

        let thumbnailUrl: string | null = null;
        const videoUrls: string[] = [];

        const files = (req as any).files;

        if (files?.thumbnail?.[0]) {
            const result = await cloudinary.uploader.upload(
                `data:${files.thumbnail[0].mimetype};base64,${files.thumbnail[0].buffer.toString('base64')}`,
                {
                    resource_type: "image",
                    folder: "course-thumbnails"
                }
            );
            thumbnailUrl = result.secure_url;
        }

        if (files?.mediaFiles) {
            for (const file of files.mediaFiles) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    {
                        resource_type: file.mimetype.startsWith("video/") ? "video" : "auto",
                        folder: "course-media"
                    }
                );
                videoUrls.push(result.secure_url);
            }
        }

        const course = await Course.create({
            title,
            description,
            category,
            instructor,
            thumbnailUrl: thumbnailUrl,
            videoUrls: videoUrls
        });

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        console.log("Here we ar e")
        const { courseId } = req.params;
        console.log(courseId)
        const { title, description, category } = req.body;
        const instructor = (req as any).user?.userId;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        if (course.instructor.toString() !== instructor) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized to update this course"
            })
        }

        let thumbnailUrl: string | null = null;
        const videoUrls: string[] = [];

        const files = (req as any).files;
        if (files?.thumbnail?.[0]) {
            const result = await cloudinary.uploader.upload(
                `data:${files.thumbnail[0].mimetype};base64,${files.thumbnail[0].buffer.toString('base64')}`, {
                resource_type: "image",
                folder: "course-thumbnails"
            }
            );
            thumbnailUrl: result.secure_url;
        }
        if (files?.mediaFiles) {
            for (const file of files.mediaFiles) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    {
                        resource_type: file.mimetype.startsWith("video/") ? "video" : "auto",
                        folder: "course-media"
                    }
                );
                videoUrls.push(result.secure_url);
            }
        }
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
        if (videoUrls.length > 0) {
            updateData.videoUrls = [...(course.videoUrls || []), ...videoUrls];
        }


        const updatedCourse = await Course.findByIdAndUpdate(
            courseId , 
            {$set:updateData} , 
            {new:true , runValidators:true}
        )

        return res.status(200).json({
            success:true , 
            message:"Course updated Successfully" , 
            data : updatedCourse
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false , 
            message:"Internal server error" , 
            error : error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const deleteCourse = async(req:Request , res:Response) =>{
    try{
        const {courseId} = req.params; 
        const instructor = (req as any).user?.userId ; 

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({
                success:false , 
                message:"Course not found" , 
            })
        }

        if(course.instructor.toString() !== instructor){
            return res.status(403).json({
                success:false , 
                message:"You are not authorized to delete this course" , 
            });
        }

        await course.deleteOne();
        return res.status(200).json({
            success:true , 
            message:"Course deleted Successfully" , 
        });
    }
    catch(error){
        console.log("Error deleting the course" , error);
        return res.status(500).json({
            success:false , 
            message:"Server Error , please try again" , 
        })
    }
}

export const getAllCourses = async(req:Request , res:Response)=>{
    try{
        const Courses = await Course.find().populate("students","name email").populate("instructor" , "name email");
        res.status(200).json({
            Courses
        })
    }
    catch(error){   
        res.status(400).json({
            message:"Error to get files"
        })
    }
}

export const searchCourses = async(req:Request , res:Response)=>{
    try{
        const {query} = req.query ; 
        if(!query || query.toString().trim() ===""){
            return res.status(200).json({
                courses:[]
            })
        }

        const courses = await Course.find({
            $or:[
                {title:{$regex:query , $options:'i'}},
                {description:{$regex:query , $options:'i'}},
                {category:{$regex:query , $options:'i'}}
            ]
        }).populate("instructor", "name")
        .limit(10)
        .select('title description category thumbnailUrl');

        res.status(200).json({
            courses
        })
    }   
    catch(error){
        res.status(400).json({
            message:"Error searching Courses"
        })
    }
}


export const getCoursesById = async(req:Request , res:Response) =>{
    try{
        const {courseId } = req.params ;
        const course = await Course.findById(courseId).populate("students" , "name email profileImage").populate("instructor" , "name email profileImage")

        if(!course){return res.status(404).json({
            message:"Course not found"
        })}

        res.status(200).json({
            course
        })
    }
    catch(error){
        res.status(400).json({
            message:"Error fetching course"
        })
    }
}


export const  CoursesUploadedByMe = async(req : Request , res : Response) =>{
    try{
        const instructorId = req.params.instructorId ; 
        const courses = await Course.find({instructor:instructorId}).populate("instructor" , "name email");

        if(!courses || courses.length === 0){
            return res.status(404).json({
                success:false , 
                message:"No courses found for this instructor" , 
            });
        }

        return res.status(200).json({
            success:true , 
            courses , 
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false , 
            message:"Server error , Please try again" , 
        });
    }
}

 

export const courseEnrolledByMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing",
      });
    }

    const enrolledCourses = await Course.find({ students: userId })
      .populate("instructor", "name email")
      .select("-__v") // optional: clean up response
      .lean();

    if (!enrolledCourses || enrolledCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not enrolled in any courses yet.",
      });
    }

    return res.status(200).json({
      success: true,
      count: enrolledCourses.length,
      courses: enrolledCourses,
    });
  } catch (error: any) {
    console.error("courseEnrolledByMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const courseId = req.params.courseId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user?.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.students.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    course.students.push(userId);

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again",
    });
  }
};
