import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { openAlertModal } from "../../app/slices/alertSlice";
import { resetMobileAuthData } from "../../app/slices/mobileAuthSlice";

import "./AccountNameRecoveryPage.css";

/**
 * AccountNameRecoveryPage 컴포넌트
 * 
 * 아이디 찾기 페이지 랜더링
 */
function AccountNameRecoveryPage() {
  const navigate = useNavigate();

  // 전역 상태 관리
  const mobileNumber = useSelector((state) => state.mobileAuth.mobileNumber);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [foundAccountName, setFoundAccountName] = useState("");

  // 마운트 이펙트: 인증 미완료시 아이디찾기 불가, 아이디 찾기 요청
  useEffect(() => {
    // 인증되지 않은 경우 홈 페이지로 리다이렉트
    if (!isMobileAuthCompleted) {
      navigate("/");
      return;
    }

    const findAccountName = async () => {
      try {
        // 아이디 찾기 API 요청
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/recovery/account-name`, 
          { 
            params: { 
              mobileNumber, 
            },
            withCredentials: true, 
          }
        );

        // 아이디 찾기 성공
        if (response.data.code === "FIND_ID_SUCCEEDED") {
          setFoundAccountName(response.data.accountName);
        // 아이디 찾기 실패
        } else {
          dispatch(openAlertModal({
            modalTitle: "아이디 찾기 실패",
            modalContent: response.data.message,
            modalNavigatePath: "/auth/login",
          }));
          dispatch(resetMobileAuthData());
        }
      } catch (error) {
        console.log("아이디 찾기 요청 실패");
        console.error(error);
      }
    };
    
    findAccountName();
  }, []);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetMobileAuthData());
    };
  }, []);

  return (
    <div>
      <div>해당 회원정보로 가입된 아이디는 <b>{foundAccountName}</b>입니다.</div>
      <div>
        <Link to="/auth/login">
          로그인
        </Link>
        <Link to="/auth/mobile-auth/password-recovery">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}

export default AccountNameRecoveryPage;
