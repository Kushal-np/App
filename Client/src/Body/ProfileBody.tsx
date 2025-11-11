
import {Outlet} from "react-router-dom"
import Navbar from "../components/Common/NavBar";

const ProfileBody = () =>{
    return(
        <div>
         <Navbar/>
         <Outlet/>   
        </div>
    )
}
export default ProfileBody ; 