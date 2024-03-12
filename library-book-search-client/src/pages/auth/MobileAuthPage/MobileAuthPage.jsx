import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setAccountNameForMobileAuth, resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";
import MobileAuthForm from "../../../components/MobileAuthForm";


// type: withdrawal(회원탈퇴), recovery-account-name(아이디찾기), recovery-password(비밀번호찾기)
function MobileAuthPage({ type }) {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 회원탈퇴의 경우, accountNameForMobileAuth 상태에 현재 로그인 된 계정명 저장
  if (type === "withdrawal") {
    const accountName = sessionStorage.getItem("loginId");
    dispatch(setAccountNameForMobileAuth(accountName));
  }

  // 다음 페이지로 이동
  const handleGoToNextPage = () => {
    if (!isMobileAuthCompleted) {
      alert("모바일 인증이 완료되지 않았습니다.");
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
        isAccountNameInputVisible={type === "recovery-password"} 
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
