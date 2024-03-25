import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openAlertModal } from "../../app/slices/alertSlice";
import { setAccountNameForMobileAuth, resetMobileAuthData } from "../../app/slices/mobileAuthSlice";
import MobileAuthForm from "../../components/MobileAuthForm";

import "./MobileAuthPage.css";

/**
 * MobileAuthPage 컴포넌트
 * 
 * MobileAuthForm 컴포넌트를 불러와 모바일인증을 진행
 * 인증 후 인증 목적에 따라 다음으로 이동할 페이지 주소(type으로 구분)로 리다이렉트
 * type: withdrawal(회원탈퇴), recovery-account-name(아이디찾기), recovery-password(비밀번호찾기)
 * 
 * @param {Object} props 컴포넌트에 전달되는 props
 * @param {string} props.type 모바일인증의 용도(인증 완료 후 이동할 페이지 구분)
 */
function MobileAuthPage({ type }) {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 회원탈퇴의 경우, accountNameForMobileAuth 상태에 현재 로그인 된 계정명 저장
  useEffect(() => {
    if (type === "withdrawal") {
      const accountName = sessionStorage.getItem("loginId");
      dispatch(setAccountNameForMobileAuth(accountName));
    }
  }, []);

  // 다음 페이지로 이동
  const handleGoToNextPage = () => {
    if (!isMobileAuthCompleted) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증 미완료",
        modalContent: "모바일 인증이 완료되지 않았습니다.",
      }));
      return;
    }
    
    navigate(`/auth/${type}`);
  };

  // 이전 페이지로 이동
  const handleGoToPreviousPage = () => {
    dispatch(resetMobileAuthData());
    navigate(-1);
  };

  return (
    <div>
      <MobileAuthForm
        isAccountNameInputVisible={type === "password-recovery"} 
        isRealNameInputVisible={type !== "withdrawal"} 
        isRegisteredMobileNumberRequired={true}
      />
      <div>
        <div onClick={handleGoToNextPage}>
          확인
        </div>
        <div onClick={handleGoToPreviousPage}>
          취소
        </div>
      </div>
    </div>
  );
}

export default MobileAuthPage;
