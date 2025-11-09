
import {Outlet} from "react-router-dom"
import Navbar from "../components/Common/NavBar";

const CourseBody = () =>{
    return(
        <div>
            <Navbar/>
         <Outlet/>   
        </div>
    )
}
export default CourseBody ; 