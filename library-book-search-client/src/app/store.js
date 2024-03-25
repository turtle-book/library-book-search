import { configureStore } from "@reduxjs/toolkit";

import alertReducer from "./slices/alertSlice";
import authReducer from "./slices/authSlice";
import mobileAuthReducer from "./slices/mobileAuthSlice";
import userAddressReducer from "./slices/userAddressSlice";

const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer, 
    mobileAuth: mobileAuthReducer, 
    userAddress: userAddressReducer,
  },
});

export default store;
