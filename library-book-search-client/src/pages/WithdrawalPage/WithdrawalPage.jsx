import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openAlertModal } from "../../app/slices/alertSlice";
import { resetMobileAuthData } from "../../app/slices/mobileAuthSlice";
import axiosInstance from "../../services/axiosInstance";

import "./WithdrawalPage.css";

/**
 * WithdrawalPage 컴포넌트
 * 
 * 회원탈퇴 페이지 렌더링
 */
function WithdrawalPage() {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 인증 미완료시 회원탈퇴 불가
  useEffect(() => {
    // 인증되지 않은 경우 프로필 페이지로 이동
    if (!isMobileAuthCompleted) {
      dispatch(openAlertModal({
        modalTitle: "접근 불가",
        modalContent: "인증되지 않은 사용자는 접근할 수 없습니다.",
        modalNavigatePath: "/auth/profile",
      }));
    }
  }, []);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 회원탈퇴 요청 핸들러
  const handleRequestWithdrawal = async () => {
    const accountName = sessionStorage.getItem("loginId");

    try {
      // 회원탈퇴 API 요청
      const response = await axiosInstance.delete(`${import.meta.env.VITE_SERVER_URL}/auth/withdrawal`, {
        params: {
          accountName,
        }
      });

      // 회원탈퇴 성공 시
      if (response.data.code = "WITHDRAWAL SUCCEEDED") {
        dispatch(openAlertModal({
          modalTitle: "회원탈퇴 성공",
          modalContent: "회원탈퇴가 정상적으로 처리되었습니다.",
          modalReloadURL: "/",
        }));
        dispatch(resetMobileAuthData());
        sessionStorage.removeItem("loginId");
      }
    } catch (error) {
      console.log("회원탈퇴 요청 실패");
      console.error(error);
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
