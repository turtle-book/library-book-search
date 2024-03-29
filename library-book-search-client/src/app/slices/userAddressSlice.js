import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  zonecode: "",
  mainAddress: "",
  detailAddress: "",
};

const userAddressSlice = createSlice({
  name: "userAddress",
  initialState,
  reducers: {
    setZonecode: (state, action) => {
      state.zonecode = action.payload;
    },
    setMainAddress: (state, action) => {
      state.mainAddress = action.payload;
    },
    setDetailAddress: (state, action) => {
      state.detailAddress = action.payload;
    },
    resetAddressData: (state) => {
      state.zonecode = "";
      state.mainAddress = "";
      state.detailAddress = "";
    },
  },
});

export const { setZonecode, setMainAddress, setDetailAddress, resetAddressData } = userAddressSlice.actions;

export default userAddressSlice.reducer;
