import axios from "axios";

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
    
    // 401 에러 확인 및 요청 재시도 여부 확인
    if (error.response.status === 401 && !originalRequest._retry) {
      // 재시도 플래그 설정
      originalRequest._retry = true;

      try {
        // 액세스 토큰 재발급 요청
        await axiosInstance.post(
          `${import.meta.env.VITE_SERVER_URL}/auth/refresh-token`,
        );

        // 원본 요청 재시도
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
