import CourseCard from "../../components/Common/CourseCard";

const GetAllCoursesPage = () =>{
    return(
        <div>
            <div className="border-2 border-solid border-black">
                <div className="border-2 border-solid border-green-400 bg-green-200 h-[90vh] ">
                    <div className="boder-2  p-5 flex justify-between items-center border-solid relative top-[50%] translate-y-[-50%] w-[80%] left-[50%] translate-x-[-50%] border-purple-500 bg-purple-200 h-[80vh]">
                        <CourseCard/>
                        <CourseCard/>
                        <CourseCard/>
                        <CourseCard/>
                        <CourseCard/>
                        <CourseCard/>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default GetAllCoursesPage ; 