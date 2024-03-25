import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { openAlertModal } from "../../app/slices/alertSlice";
import { resetAddressData } from "../../app/slices/userAddressSlice";
import { resetMobileAuthData } from "../../app/slices/mobileAuthSlice";
import AddressInputForm from "../../components/AddressInputForm";
import MobileAuthForm from "../../components/MobileAuthForm";
import axiosInstance from "../../services/axiosInstance";

import "./JoinPage.css";

/**
 * JoinPage 컴포넌트
 * 
 * 회원가입 페이지 렌더링
 */
function JoinPage() {
  // 전역 상태 관리
  const zonecode = useSelector((state) => state.userAddress.zonecode);
  const mainAddress = useSelector((state) => state.userAddress.mainAddress);
  const detailAddress = useSelector((state) => state.userAddress.detailAddress);
  const mobileNumber = useSelector((state) => state.mobileAuth.mobileNumber);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuth.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetAddressData());
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 성별 남자 선택 핸들러
  const handleSelectMale = () => {
    setGender("남자");
  };

  // 성별 여자 선택 핸들러
  const handleSelectFemale = () => {
    setGender("여자");
  };

  // 회원가입 요청 핸들러
  const handleRequestJoin = async () => {
    // 유효성 검사
    if (!accountName.trim()) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 제출 불가",
        modalContent: "아이디를 입력해주세요.",
      }));
      return;
    } else if (password.length < 8) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 제출 불가",
        modalContent: "8자리 이상의 비밀번호를 입력해주세요.",
      }));
      return;
    } else if (!realName.trim()) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 제출 불가",
        modalContent: "이름을 입력해주세요.",
      }));
      return;
    } else if (!verifyBirthday(birthday)) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 제출 불가",
        modalContent: "생년월일을 다시 확인해주세요.",
      }));
      return;
    } else if (!gender) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 제출 불가",
        modalContent: "성별을 선택해주세요.",
      }));
      return;
    } else if (!zonecode.trim() || !mainAddress.trim() || !detailAddress.trim()) {
      dispatch(openAlertModal({
        modalTitle: "회원가입 실패",
        modalContent: "주소를 입력해주세요.",
      }));
      return;
    }

    // 모바일인증이 완료되지 않았으면 회원가입 거부
    if (!isMobileAuthCompleted) {
      dispatch(openAlertModal({
        modalTitle: "모바일 인증 미완료",
        modalContent: "모바일 인증이 완료되지 않았습니다.",
      }));
      return;
    }

    // 회원가입 API 요청
    try {
      const response = await axiosInstance.post(`${import.meta.env.VITE_SERVER_URL}/auth/join`, {
        accountName, 
        password, 
        realName, 
        birthday, 
        gender, 
        zonecode,
        mainAddress,
        detailAddress,
        mobileNumber, 
      });

      // 결과 알림 메시지
      // 회원가입 성공 시 모달 닫기 후 로그인 페이지로 리다이렉트
      dispatch(openAlertModal({
        modalTitle: "회원가입 결과",
        modalContent: response.data.message,
        modalNavigatePath: response.data.code === "JOIN_SUCCEEDED" ? "/auth/login" : "",
      }));

      // input 초기화
      setAccountName("");
      setPassword("");
      setRealName("");
      setBirthday("");
      setGender("");
      dispatch(resetAddressData());
      dispatch(resetMobileAuthData());
    } catch (error) {
      console.log("회원가입 요청 실패:");
      console.error(error);
    }
  };

  // 생년월일 유효성 검사 함수
  function verifyBirthday(birthday) {
    // 8자리 숫자 문자열이 아니라면 false
    if ((!/^\d{8}$/.test(birthday))) return false;

    // 입력한 날짜 연, 월, 일 분해
    const year = Number(birthday.slice(0, 4));
    const month = Number(birthday.slice(4, 6));
    const day = Number(birthday.slice(6));
    
    // 현재 연, 월, 일 그리고 이번 달의 마지막 일
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // 입력한 '연도'가 1900년 이상 현재 연도 이하의 범위에 속하는지 확인
    if (year < 1900 || year > currentYear) return false;
    // 입력한 '월'이 1월 이상 12월 이하의 범위에 속하는지 확인  
    if (month < 1 || month > 12) return false;

    // 입력한 '일'이 1일 이상 입력한 일자의 마지막 일자 이하의 범위에 속하는지 확인
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) return false;

    // 입력한 일자가 현재 날짜를 넘지 않는지 확인
    if (year === currentYear && month > currentMonth) return false;
    if (year === currentYear && month === currentMonth && day > currentDay) return false;

    return true;
  }

  return (
    <div className="join-page">
      <form className="join-form">
        <div>
          <div className="join-form-account-name">
            <div className="join-form-label">
              아이디
            </div>
            <input 
              type="text" 
              value={accountName} 
              placeholder="아이디" 
              maxLength="10" 
              onChange={(e) => setAccountName(e.target.value)} 
            />
          </div>
          <div className="join-form-password">
            <div className="join-form-label">
              비밀번호
            </div>
            <input 
              type="password" 
              value={password} 
              placeholder="비밀번호" 
              maxLength="20" 
              onChange={(e) => setPassword(e.target.value)} 
            /> 
          </div>
        </div>
        <div>
          <div className="join-form-real-name">
            <div className="join-form-label">
              이름
            </div>
            <input 
              type="text" 
              value={realName} 
              placeholder="이름" 
              maxLength="10" 
              onChange={(e) => setRealName(e.target.value)} 
            />
          </div>
          <div className="join-form-birthday">
            <div className="join-form-label">
              생년월일
            </div>
            <input 
              type="text" 
              value={birthday} 
              placeholder="'-'없이 입력하세요. ex) 19770101" 
              onChange={(e) => setBirthday(e.target.value)} 
            />
          </div>
          <div className="join-form-gender">
            <div className="join-form-label">
              성별
            </div>
            <div 
              onClick={handleSelectMale}
              className={`join-form-gender-option ${gender === "남자" ? "selected" : ""}`}
            >
              남자
            </div>
            <div 
              onClick={handleSelectFemale}
              className={`join-form-gender-option ${gender === "여자" ? "selected" : ""}`}
            >
              여자
            </div>
          </div>
        </div>
        <AddressInputForm />
        <MobileAuthForm />
        <div className="join-button" onClick={handleRequestJoin}>회원가입</div>
      </form>
    </div>
  );
}

export default JoinPage;
