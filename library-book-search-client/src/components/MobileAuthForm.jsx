import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAccountNameForMobileAuth, setRealNameForMobileAuth } from "../app/slice/mobileAuthDataSlice";
import { setMobileNumber, setMobileAuthCode } from "../app/slice/mobileAuthDataSlice";
import { setIsMobileAuthCodeRequested, setIsMobileAuthCompleted } from "../app/slice/mobileAuthDataSlice";
import { setIsMobileAuthFieldsDisabled } from "../app/slice/mobileAuthDataSlice";

import "./MobileAuthForm.css";

function MobileAuthForm({ 
  isAccountNameInputVisible=false, 
  isRealNameInputVisible=false, 
  isRegisteredMobileNumberRequired=false 
}) {
  // 로컬 상태 관리
  const [remainingTime, setRemainingTime] = useState(180);

  // 전역 상태 관리
  const accountNameForMobileAuth = useSelector((state) => state.mobileAuthData.accountNameForMobileAuth);
  const realNameForMobileAuth = useSelector((state) => state.mobileAuthData.realNameForMobileAuth);
  const mobileNumber = useSelector((state) => state.mobileAuthData.mobileNumber);
  const mobileAuthCode = useSelector((state) => state.mobileAuthData.mobileAuthCode);
  const isMobileAuthCodeRequested = useSelector((state) => state.mobileAuthData.isMobileAuthCodeRequested);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const isMobileAuthFieldsDisabled = useSelector((state) => state.mobileAuthData.isMobileAuthFieldsDisabled);
  const dispatch = useDispatch();

  // 인증코드 유효기한 표시 형식
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // 업데이트&언마운트 이펙트: 인증코드 유효기한 타이머
  useEffect(() => {
    let timerId;

    if (isMobileAuthCodeRequested && remainingTime > 0) {
      // 1초마다 remainingTime 1씩 감소
      timerId = setInterval(() => {
        setRemainingTime((time) => time - 1);
      }, 1000);
    } else if (remainingTime <= 0) {
      // 남은 시간이 0초가 되면 타이머 중지
      clearInterval(timerId);
    }

    return () => clearInterval(timerId);
  }, [isMobileAuthCodeRequested, remainingTime]);

  // 모바일 인증코드 요청 핸들러
  const handleRequestMobileAuthCode = async () => {
    // 휴대전화번호 형식 검증
    if (!(/^010\d{7,8}$/.test(mobileNumber))) {
      alert("휴대전화번호를 올바르게 입력해주세요.");
      return;
    }

    // 이미 인증을 완료한 경우 요청 종료
    if (isMobileAuthCompleted) {
      alert("이미 인증을 완료하였습니다.");
      return;
    }

    try {
      // 인증코드 전송 요청
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/mobile-auth/code`, {
        accountName: accountNameForMobileAuth,
        realName: realNameForMobileAuth,
        mobileNumber,
        isRegisteredMobileNumberRequired,
      }, {
        withCredentials: true,
      });

      console.log(response.data.code);
      
      // 인증코드 전송 성공
      if (response.data.code === "AUTH_CODE_SENT") {
        dispatch(setIsMobileAuthCodeRequested(true));
        setRemainingTime(180);
      // 인증코드 전송 실패
      } else {
        dispatch(setAccountNameForMobileAuth(""));
        dispatch(setRealNameForMobileAuth(""));
        dispatch(setMobileNumber(""));
      }
      alert(response.data.message);

    } catch (error) {
      console.error("모바일 인증코드 요청 실패", error);
    }
  };

  // 모바일 인증코드 확인 핸들러
  const handleConfirmMobileAuthCode = async () => {
    // 이미 인증을 완료한 경우 확인 종료
    if (isMobileAuthCompleted) {
      alert("이미 인증을 완료하였습니다.");
      return;
    }

    try {
      // 인증코드 확인 요청
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/mobile-auth/verification`, {
        mobileNumber,
        mobileAuthCode,
      }, {
        withCredentials: true,
      });

      // 인증코드 검증 성공
      if (response.data.code === "AUTH_CODE_VERIFIED") {
        alert("인증이 완료되었습니다.");
        dispatch(setIsMobileAuthFieldsDisabled(true));
        dispatch(setIsMobileAuthCompleted(true));
      // 인증코드 검증 실패
      } else {
        alert(response.data.message);
        dispatch(setMobileAuthCode(""));
      }
    } catch (error) {
      console.error("모바일 인증코드 확인 요청 실패", error);
    }
  };

  return (
    <div className="mobile-auth-form">
      {isAccountNameInputVisible && (
        <div>
          <div>
            아이디
          </div>
          <input 
            type="text" 
            value={accountNameForMobileAuth} 
            placeholder="아이디" 
            onChange={(e) => dispatch(setAccountNameForMobileAuth(e.target.value))} 
            required 
          />
        </div>
      )}
      {isRealNameInputVisible && (
        <div>
          <div>
            이름
          </div>
          <input 
            type="text" 
            value={realNameForMobileAuth} 
            placeholder="이름" 
            onChange={(e) => dispatch(setRealNameForMobileAuth(e.target.value))} 
            required 
          />
        </div>
      )}
      <div>
        <div className="mobile-auth">
          휴대전화번호
        </div>
        <div>
          <input 
            type="text" 
            value={mobileNumber}
            placeholder="'-'없이 입력하세요. ex) 01012345678" 
            onChange={(e) => dispatch(setMobileNumber(e.target.value))} 
            required 
            maxLength="11" 
            disabled={isMobileAuthFieldsDisabled} 
          />
        </div>
        <div onClick={handleRequestMobileAuthCode}>
          인증코드 요청
        </div>
      </div>
      {isMobileAuthCodeRequested && (
        <div>
          <div>
            인증코드 입력
          </div>
          <div>
            <input
              type="text" 
              value={mobileAuthCode} 
              placeholder="인증코드 6자리" 
              onChange={(e) => dispatch(setMobileAuthCode(e.target.value))} 
              required 
              maxLength="6" 
              disabled={isMobileAuthFieldsDisabled} 
            />
            {(isMobileAuthCodeRequested && !isMobileAuthCompleted) && (
              <div className="mobile-auth-form-remaining-time">
                {formatTime(remainingTime)}
              </div>
            )}
          </div>
          <div onClick={handleConfirmMobileAuthCode}>
            인증코드 확인
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAuthForm;
