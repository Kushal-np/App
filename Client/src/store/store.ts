import {configureStore} from "@reduxjs/toolkit"
import authSlice from "./authSlice"
import courseSlice from "./courseSlice"

export const store = configureStore({
    reducer:{
        auth:authSlice ,
        course :  courseSlice ,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch ; 