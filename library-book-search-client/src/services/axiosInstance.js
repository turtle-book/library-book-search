import axios from "axios";

import { openAlertModal } from "../app/slices/alertSlice";
import { setIsAuthenticated } from "../app/slices/authSlice";
import store from "../app/store";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}`,
  timeout: 3000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => {
    // 성공 응답 처리
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // CASE 1: 첫 시도에 401 에러(액세스 토큰 유효하지 않음)를 응답 받은 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      // 재시도 플래그 설정
      originalRequest._retry = true;

      try {
        // 액세스 토큰 재발급 API 요청
        await axiosInstance.post(`${import.meta.env.VITE_SERVER_URL}/auth/refresh-token`);

        // 액세스 토큰 재발급에 성공한 경우, 원본 요청 재시도
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.log("인터셉터 - 액세스 토큰 재발급 요청 실패");
        return Promise.reject(refreshError);
      }
    // CASE 2: 403 에러(토큰 검증 실패, 중복로그인 등)를 응답 받은 경우
    } else if (error.response.status === 403) {
      const accountName = sessionStorage.getItem("loginId");

      store.dispatch(setIsAuthenticated(false));

      // 세션스토리지에 사용자 데이터가 남아 있는 경우, 로그아웃 처리 및 로그인 페이지로 리다이렉트
      if (accountName) {
        try {
          // 로그아웃 API 요청
          await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
            { accountName },
            { withCredentials: true }
          );

          store.dispatch(openAlertModal({
            modalTitle: "로그인 만료",
            modalContent: "로그인 정보가 만료되었거나 변경되었습니다. 다시 로그인 해주세요.",
            modalReloadURL: "/auth/login",
          }));
          sessionStorage.removeItem("loginId");
          return;
        } catch (logoutError) {
          console.log("인터셉터 - 로그아웃 요청 실패")
          console.error(logoutError);
        }
      }
      
      // 세션스토리지에 사용자 데이터가 없는 경우에는 그대로 에러를 전달
      // 이 경우 서버에 사용자 데이터가 남아있을 수 있으나 충돌 등의 문제가 발생하지 않을 것으로 보기 때문에 생략
      return Promise.reject(error);
    // CASE 3: 그 외의 경우
    } else {
      return Promise.reject(error);
    } 
  }
);

export default axiosInstance;
