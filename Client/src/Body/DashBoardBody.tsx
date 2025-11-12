
import {Outlet} from "react-router-dom"
import Navbar from "../components/Common/NavBar";
import SidePanel from "../components/DashBoard/SidePanel";

const DashBoardBody = () =>{
    return(
        <div>
         <Navbar/>

         <div>
            <SidePanel/>
            <Outlet/>
            </div>   
        </div>
    )
}
export default DashBoardBody; 