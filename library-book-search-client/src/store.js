import { configureStore } from "@reduxjs/toolkit";

import addressDataReducer from "./app/slice/addressDataSlice";
import mobileAuthDataReducer from "./app/slice/mobileAuthDataSlice";

const store = configureStore({
  reducer: {
    addressData: addressDataReducer,
    mobileAuthData: mobileAuthDataReducer,
  },
});

export default store;
