import { Link } from "react-router-dom";
import type { Course } from "../../types";


interface CourseCardProps {
    course:Course
}

const CourseCard: React.FC =({course}:CourseCardProps) =>{
    return(
        <div className="border-2 border-solid border-black ">

        <div className="border-solid border-2 border-blue-500 flex justify-center items-center">
            <div className="h-[15vh] w-[15vh]   border-solid border-2 bg-blue-200">
                {course.title}
                <img src={course.thumbnailUrl}>
                
                </img>
                <video src={course.videoUrls} ></video>
                <div>
                    <div>Details of the course
                        <div className="border-2 border-solid border-green-200 bg-green-300 text-2xl text-blue-900">
                            {course.instructor.name}
                            <br />
                        </div>
                        
                        <div></div>
                    </div>
                </div>
                <div>
                    <button className="border-2 border-solid border-red-400 bg-red-500 p-4 text-white  text-2xl">
                        <Link to={`/course/detail/${course._id}`}>
                        Course Details
                        </Link>
                    </button>
                </div>
            </div>
            
        </div>
        </div>
    )
}

export default CourseCard ; 