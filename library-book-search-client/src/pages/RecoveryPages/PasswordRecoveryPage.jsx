import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetMobileAuthData } from "../../app/slices/mobileAuthSlice";
import PasswordChangeForm from "../../components/PasswordChangeForm";

import "./PasswordRecoveryPage.css";

/**
 * RecoveryPasswordPage 컴포넌트
 * 
 * 비밀번호 찾기 페이지 렌더링
 */
function PasswordRecoveryPage() {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 인증 미완료시 비밀번호 찾기 거부
  useEffect(() => {
    if (!isMobileAuthCompleted) {
      navigate("/");
    }
  }, []);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetMobileAuthData());
    };
  }, []);

  return (
    <div>
      <PasswordChangeForm />
    </div>
  );
}

export default PasswordRecoveryPage;
