// store/courseSlice.ts
import { createSlice,type PayloadAction } from "@reduxjs/toolkit";
import type { CourseState, Course } from "../types";

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.loading = false;
      state.error = null;
    },

    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },

    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },

    updateCourse: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(
        (course) => course._id === action.payload._id
      );
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.selectedCourse?._id === action.payload._id) {
        state.selectedCourse = action.payload;
      }
    },

    deleteCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(
        (course) => course._id !== action.payload
      );
      if (state.selectedCourse?._id === action.payload) {
        state.selectedCourse = null;
      }
    },

    enrollStudent: (
      state,
      action: PayloadAction<{ courseId: string; studentId: string }>
    ) => {
      const course = state.courses.find(
        (c) => c._id === action.payload.courseId
      );
      if (course && !course.students.includes(action.payload.studentId)) {
        course.students.push(action.payload.studentId);
      }
    },

    unenrollStudent: (
      state,
      action: PayloadAction<{ courseId: string; studentId: string }>
    ) => {
      const course = state.courses.find(
        (c) => c._id === action.payload.courseId
      );
      if (course) {
        course.students = course.students.filter(
          (id) => id !== action.payload.studentId
        );
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setCourses,
  setSelectedCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} = courseSlice.actions;

export default courseSlice.reducer;