import { createSlice } from "@reduxjs/toolkit"; // Add PayloadAction
import type { AuthState, User } from "../types";

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    }
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;