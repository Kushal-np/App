import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
    name:"search" , 
    initialState: {query:""} , 
    reducers:{
        setSearchQuery: (state:any , action) =>{
            state.query = action.payload ; 
        },
        clearSearch: (state) =>{
            state.query = "";
        }
    }
})

export const {setSearchQuery , clearSearch} = searchSlice.actions ; 
export default searchSlice.reducer ; 