import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { openAlertModal } from "../app/slices/alertSlice";
import { setAccountNameForMobileAuth, setRealNameForMobileAuth } from "../app/slices/mobileAuthSlice";
import { setMobileNumber, setMobileAuthCode } from "../app/slices/mobileAuthSlice";
import { setIsMobileAuthCodeRequested, setIsMobileAuthCompleted } from "../app/slices/mobileAuthSlice";
import { setIsMobileAuthFieldsDisabled } from "../app/slices/mobileAuthSlice";

import "./MobileAuthForm.css";

/**
 * MobileAuthForm 컴포넌트
 * 
 * 모바일인증 양식 컴포넌트
 * 모바일인증의 목적(회원가입, 회원정보변경, 회원가입, 아이디찾기, 비밀번호찾기)에 따라 양식에 차이가 있으므로, props를 통해 이를 조정
 * 
 * @param {Object} props 컴포넌트에 전달되는 props
 * @param {boolean} props.isAccountNameInputVisible 아이디 입력란 활성화 여부를 의미하며, 비밀번호 찾기에 활용됨
 * @param {boolean} props.isRealNameInputVisible 이름 입력란 활성화 여부를 의미하며, 아이디 및 비밀번호 찾기에 활용됨
 * @param {boolean} props.isRegisteredMobileNumberRequired 입력한 휴대전화번호와 일치하는 가입된 정보가 있어야만 하는 경우에 설정함
 */
function MobileAuthForm({ 
  isAccountNameInputVisible=false, 
  isRealNameInputVisible=false, 
  isRegisteredMobileNumberRequired=false 
}) {
  // 전역 상태 관리
  const accountNameForMobileAuth = useSelector((state) => state.mobileAuth.accountNameForMobileAuth);
  const realNameForMobileAuth = useSelector((state) => state.mobileAuth.realNameForMobileAuth);
  const mobileNumber = useSelector((state) => state.mobileAuth.mobileNumber);
  const mobileAuthCode = useSelector((state) => state.mobileAuth.mobileAuthCode);
  const isMobileAuthCodeRequested = useSelector((state) => state.mobileAuth.isMobileAuthCodeRequested);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const isMobileAuthFieldsDisabled = useSelector((state) => state.mobileAuth.isMobileAuthFieldsDisabled);
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [remainingTime, setRemainingTime] = useState(180);

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
    // 이미 인증을 완료한 경우 요청 종료
    if (isMobileAuthCompleted) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증코드 요청 불가",
        modalContent: "이미 인증을 완료하였습니다.",
      }));
      return;
    }
    // 아이디 입력란 활성화된 경우, 아이디 유효성 검사
    if (isAccountNameInputVisible && !accountNameForMobileAuth) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증코드 요청 불가",
        modalContent: "아이디를 입력해주세요.",
      }));
      return;
    }
    // 이름 입력란 활성화된 경우, 이름 유효성 검사
    if (isRealNameInputVisible && !realNameForMobileAuth) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증코드 요청 불가",
        modalContent: "이름을 입력해주세요.",
      }));
      return;
    }
    // 휴대전화번호 유효성 검사
    if (!(/^010\d{7,8}$/.test(mobileNumber))) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증코드 요청 불가",
        modalContent: "휴대전화번호를 올바르게 입력해주세요.",
      }));
      return;
    }

    try {
      // 인증코드 전송 API 요청
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
        dispatch(openAlertModal({
          modalTitle: "모바일 인증코드 전송 성공",
          modalContent: "인증코드가 전송되었습니다.\n인증코드 6자리를 입력해주세요.",
        }));
        dispatch(setIsMobileAuthCodeRequested(true));
        setRemainingTime(180);
      // 인증코드 전송 실패
      } else {
        dispatch(openAlertModal({
          modalTitle: "모바일 인증코드 전송 실패",
          modalContent: response.data.message,
        }));
        dispatch(setAccountNameForMobileAuth(""));
        dispatch(setRealNameForMobileAuth(""));
        dispatch(setMobileNumber(""));
      }
    } catch (error) {
      console.log("인증코드 전송 요청 실패");
      console.error(error);
    }
  };

  // 모바일 인증코드 확인 핸들러
  const handleRequestMobileAuthConfirm = async () => {
    // 이미 인증을 완료한 경우 확인 종료
    if (isMobileAuthCompleted) {
      dispatch(openAlertModal({
        modalTitle: "인증 완료",
        modalContent: "이미 인증을 완료하였습니다.",
      }));
      return;
    }
    // 인증코드 6자리 유효성 검사
    if (!(/^\d{6}$/.test(mobileAuthCode))) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증코드 확인 불가",
        modalContent: "인증코드 6자리를 다시 확인해주세요.",
      }));
      return;
    }

    try {
      // 인증코드 확인 API 요청
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/mobile-auth/verification`, {
        mobileNumber,
        mobileAuthCode,
      }, {
        withCredentials: true,
      });

      // 인증코드 확인 성공
      if (response.data.code === "AUTH_CODE_VERIFICATION_SUCCEEDED") {
        dispatch(openAlertModal({
          modalTitle: "모바일 인증코드 확인 성공",
          modalContent: "인증이 완료되었습니다.",
        }));
        dispatch(setIsMobileAuthFieldsDisabled(true));
        dispatch(setIsMobileAuthCompleted(true));
      // 인증코드 확인 실패
      } else {
        dispatch(openAlertModal({
          modalTitle: "모바일 인증코드 확인 실패",
          modalContent: response.data.message,
        }));
        dispatch(setMobileAuthCode(""));
      }
    } catch (error) {
      console.log("인증코드 확인 요청 실패");
      console.error(error);
    }
  };

  // 인증코드 유효기한 표시 형식 변환 함수
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
            maxLength="11" 
            disabled={isMobileAuthFieldsDisabled} 
            onChange={(e) => dispatch(setMobileNumber(e.target.value))} 
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
              maxLength="6" 
              disabled={isMobileAuthFieldsDisabled} 
            />
            {(isMobileAuthCodeRequested && !isMobileAuthCompleted) && (
              <div className="mobile-auth-form-remaining-time">
                {formatTime(remainingTime)}
              </div>
            )}
          </div>
          <div onClick={handleRequestMobileAuthConfirm}>
            인증코드 확인
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAuthForm;
