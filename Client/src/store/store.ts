import {configureStore} from "@reduxjs/toolkit"
import authSlice from "./authSlice"
import courseSlice from "./courseSlice"
import searchSlice from "./searchSlice"

export const store = configureStore({
    reducer:{
        auth:authSlice ,
        course :  courseSlice ,
        search : searchSlice , 
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch ; 