import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";

import "./RecoveryAccountNamePage.css";

function RecoveryAccountNamePage() {
  const navigate = useNavigate();

  // 로컬 상태 관리
  const [foundAccountName, setFoundAccountName] = useState("");

  // 전역 상태 관리
  const mobileNumber = useSelector((state) => state.mobileAuthData.mobileNumber);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 인증 미완료시 아이디찾기 불가, 아이디 찾기 요청
  useEffect(() => {
    console.log(isMobileAuthCompleted);
    // 인증되지 않은 경우 로그인 페이지로 이동
    if (!isMobileAuthCompleted) {
      navigate("/auth/login");
      return;
    }

    const getAccountName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/recovery/account-name`, 
          { 
            params: { mobileNumber },
            withCredentials: true, 
          }
        );

        // 아이디 조회 실패
        if (response.data.code === "FIND_ID_FAILED") {
          alert(response.data.message);
          dispatch(resetMobileAuthData());
          navigate("/auth/login");
        // 아이디 조회 성공
        } else {
          setFoundAccountName(response.data.accountName);
        }
      } catch (error) {
        console.error("아이디 조회 실패", error);
      }
    };
    
    getAccountName();
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
        <Link to="/auth/mobile-auth/recovery-password">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}

export default RecoveryAccountNamePage;
