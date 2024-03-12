import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";
import axiosInstance from "../../../services/axiosInstance";

import "./WithdrawalPage.css";

function WithdrawalPage() {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 인증 미완료시 회원탈퇴 불가
  useEffect(() => {
    // 인증되지 않은 경우 프로필 페이지로 이동
    if (!isMobileAuthCompleted) {
      navigate("/auth/profile");
      return;
    }
  }, []);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 회원탈퇴 진행 요청 핸들러
  const handleRequestWithdrawal = async () => {
    const accountName = sessionStorage.getItem("loginId");

    try {
      // 회원탈퇴 요청
      const response = await axiosInstance.delete(`${import.meta.env.VITE_SERVER_URL}/auth/withdrawal`, {
        params: {
          accountName,
        }
      });

      // 회원탈퇴 성공 시
      if (response.data.code = "WITHDRAWAL SUCCEEDED") {
        alert("회원탈퇴가 정상적으로 처리되었습니다.");

        dispatch(resetMobileAuthData());
        sessionStorage.removeItem("loginId");
        
        window.location.href = `${import.meta.env.VITE_CLIENT_URL}/`;
      }
    } catch (error) {
      console.error("회원탈퇴 요청 실패", error);
    }
  };
  
  // 회원탈퇴 취소 핸들러
  const handleCancelWithdrawal = () => {
    dispatch(resetMobileAuthData());
    navigate("/auth/profile");
  };

  return (
    <div>
      <div>회원탈퇴를 진행하시겠습니까?</div>
      <div>
        <div onClick={handleRequestWithdrawal}>
          확인
        </div>
        <div onClick={handleCancelWithdrawal}>
          취소
        </div>
      </div>
    </div>
  );
}

export default WithdrawalPage;
