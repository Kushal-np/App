import { useDispatch } from "react-redux";
import CourseCard from "../../components/Common/CourseCard";
import type { Course } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../../api/courseApi";
import { Link } from "react-router-dom";
const GetAllCoursesPage = () =>{

    const dispatch = useDispatch()

    const {data , isLoading , isError ,error} = useQuery<Course[]>({
        queryKey:["Course"],
        queryFn: getAllCourses 
    })
    
    console.log(data)
    if(isLoading){
        return(
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl"> Loading Courses...</p>
            </div>
        )
    }
    return(
        <div>
            <div className="border-2 border-solid border-black">
                <div className="border-2 border-solid border-green-400 bg-green-200 h-[90vh] ">
                    <div className="boder-2  p-5 flex justify-between items-center border-solid relative top-[50%] translate-y-[-50%] w-[80%] left-[50%] translate-x-[-50%] border-purple-500 bg-purple-200 h-[80vh]">
                        {
                            data.Courses?.map((d)=>{return(
                                <Link to={`/course/detail/${d._id}`}>
                                <CourseCard key={d._id} course={d} />
                        </Link>
                            )})
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
export default GetAllCoursesPage ; 