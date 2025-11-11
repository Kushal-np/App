
import {Outlet} from "react-router-dom"
import Navbar from "../components/Common/NavBar";

const DashBoardBody = () =>{
    return(
        <div>
         <Navbar/>
         <Outlet/>   
        </div>
    )
}
export default DashBoardBody; 