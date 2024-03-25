import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAlertOpen: false,
  alertTitle: "",
  alertContent: "",
  navigatePath: "",
  reloadURL: "",
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    openAlertModal: (state, action) => {
      const { modalTitle, modalContent, modalNavigatePath, modalReloadURL } = action.payload;
      state.isAlertOpen = true;
      state.alertTitle = modalTitle;
      state.alertContent = modalContent;
      state.navigatePath = modalNavigatePath || "";
      state.reloadURL = modalReloadURL || "";
    },
    resetAlertModal: (state) => {
      state.isAlertOpen = false;
      state.alertTitle = "";
      state.alertContent = "";
    },
    resetNavigatePath: (state) => {
      state.navigatePath = "";
    },
    resetReloadURL: (state) => {
      state.reloadURL = "";
    },
  },
});

export const { openAlertModal, resetAlertModal, resetNavigatePath, resetReloadURL } = alertSlice.actions;

export default alertSlice.reducer;
