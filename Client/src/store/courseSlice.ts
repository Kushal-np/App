import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CourseState, Course } from "../types";

const initialState: CourseState = {
    courses: [], // Fixed: was "Course", should be "courses"
    selectedCourse: null,
    loading: false,
    error: null,
}

const courseSlice = createSlice({ // Fixed: removed type annotation
    name: "course",
    initialState,
    reducers: {
        setLoading: (state: any, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state: any, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },

        setCourses: (state: any, action: PayloadAction<Course[]>) => {
            state.courses = action.payload; // Fixed: Course -> courses
            state.loading = false;
            state.error = null;
        },

        setSelectedCourse: (state: any, action: PayloadAction<Course | null>) => {
            state.selectedCourse = action.payload;
        },

        addCourse: (state: any, action: PayloadAction<Course>) => {
            state.courses.push(action.payload); // Fixed: Course -> courses
        },

        updateCourse: (state: any, action: PayloadAction<Course>) => {
            const index = state.courses.findIndex( // Fixed: Course -> courses
                (course) => course._id === action.payload._id
            );
            if (index !== -1) {
                state.courses[index] = action.payload; // Fixed: Course -> courses
            }
            if (state.selectedCourse?._id === action.payload._id) { // Fixed: .id -> ._id
                state.selectedCourse = action.payload;
            }
        },

        deleteCourse: (state: any, action: PayloadAction<string>) => { // Fixed: PayloadAction<string> not Course
            state.courses = state.courses.filter( // Fixed: Course -> courses
                (course) => course._id !== action.payload // Fixed: action.payload._id -> action.payload
            );
            if (state.selectedCourse?._id === action.payload) { // Fixed: removed extra _id
                state.selectedCourse = null;
            }
        },

        enrollStudent: (state: any, action: PayloadAction<{ courseId: string; studentId: string }>) => { // Fixed: removed extra semicolon
            const course = state.courses.find( // Fixed: Course -> courses
                (c) => c._id === action.payload.courseId
            );
            if (course && !course.students.includes(action.payload.studentId)) {
                course.students.push(action.payload.studentId);
            }
        },

        unenrollStudent: (state: any, action: PayloadAction<{ courseId: string; studentId: string }>) => {
            const course = state.courses.find( // Fixed: Course -> courses
                (c) => c._id === action.payload.courseId // Fixed: removed semicolon
            );
            if (course) {
                course.students = course.students.filter(
                    (id) => id !== action.payload.studentId
                );
            }
        }
    }
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
    unenrollStudent
} = courseSlice.actions;

export default courseSlice.reducer;