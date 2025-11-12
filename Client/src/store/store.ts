// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import courseSlice from "./courseSlice";
import searchSlice from "./searchSlice";
import createCourseReducer from "./CourseCreationSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    course: courseSlice,
    search: searchSlice,
    createCourse: createCourseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore File objects in actions and state
        ignoredActions: ["createCourse/setThumbnail", "createCourse/setMediaFiles"],
        ignoredPaths: ["createCourse.thumbnail", "createCourse.mediaFiles"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;