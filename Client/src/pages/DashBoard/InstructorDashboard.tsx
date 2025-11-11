import { useSelector } from "react-redux"
import { store } from "../../store/store"



export const InstructorDashBoard = () =>{

    const user = useSelector((state:RootState) => state.auth.user)
    console.log(user.role)
    if(user.role === "student"){
        return(
            <div>
                Student can't access this page 
            </div>
        )
    }
    return(
        <div>
                {user.name}
        </div>
    )
}