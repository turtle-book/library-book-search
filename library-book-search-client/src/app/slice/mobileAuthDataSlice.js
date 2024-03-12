import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accountNameForMobileAuth: "",
  realNameForMobileAuth: "",
  mobileNumber: "",
  mobileAuthCode: "",
  isMobileAuthCodeRequested: false,
  isMobileAuthCompleted: false,
  isMobileAuthFieldsDisabled: false,
};

const mobileAuthDataSlice = createSlice({
  name: "mobileAuthData",
  initialState,
  reducers: {
    setAccountNameForMobileAuth: (state, action) => {
      state.accountNameForMobileAuth = action.payload;
    },
    setRealNameForMobileAuth: (state, action) => {
      state.realNameForMobileAuth = action.payload;
    },
    setMobileNumber: (state, action) => {
      state.mobileNumber = action.payload;
    },
    setMobileAuthCode: (state, action) => {
      state.mobileAuthCode = action.payload;
    },
    setIsMobileAuthCodeRequested: (state, action) => {
      state.isMobileAuthCodeRequested = action.payload;
    },
    setIsMobileAuthCompleted: (state, action) => {
      state.isMobileAuthCompleted = action.payload;
    },
    setIsMobileAuthFieldsDisabled: (state, action) => {
      state.isMobileAuthFieldsDisabled = action.payload;
    },
    resetMobileAuthData: (state) => {
      state.accountNameForMobileAuth = "";
      state.realNameForMobileAuth = "";
      state.mobileNumber = "";
      state.mobileAuthCode = "";
      state.isMobileAuthCodeRequested = false;
      state.isMobileAuthCompleted = false;
      state.isMobileAuthFieldsDisabled = false;
    },
  },
});

export const { setAccountNameForMobileAuth, setRealNameForMobileAuth } = mobileAuthDataSlice.actions;
export const { setMobileNumber, setMobileAuthCode } = mobileAuthDataSlice.actions;
export const { setIsMobileAuthCodeRequested, setIsMobileAuthCompleted } = mobileAuthDataSlice.actions;
export const { setIsMobileAuthFieldsDisabled } = mobileAuthDataSlice.actions;
export const { resetMobileAuthData } = mobileAuthDataSlice.actions;

export default mobileAuthDataSlice.reducer;
