import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CourseState {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  mediaFiles: File[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: CourseState = {
  title: "",
  description: "",
  category: "",
  thumbnail: null,
  thumbnailPreview: null,
  mediaFiles: [],
  loading: false,
  success: false,
  error: null,
};

export const createCourseSlice = createSlice({
  name: "createCourse",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setThumbnail: (
      state,
      action: PayloadAction<{ file: File; preview: string }>
    ) => {
      state.thumbnail = action.payload.file;
      state.thumbnailPreview = action.payload.preview;
    },
    setMediaFiles: (state, action: PayloadAction<FileList>) => {
      state.mediaFiles = Array.from(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetForm: (state) => {
      state.title = "";
      state.description = "";
      state.category = "";
      state.thumbnail = null;
      state.thumbnailPreview = null;
      state.mediaFiles = [];
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  setTitle,
  setDescription,
  setCategory,
  setThumbnail,
  setMediaFiles,
  setLoading,
  setSuccess,
  setError,
  resetForm,
} = createCourseSlice.actions;

export default createCourseSlice.reducer;
