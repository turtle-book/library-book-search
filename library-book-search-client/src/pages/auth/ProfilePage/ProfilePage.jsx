import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { setZonecode, setMainAddress, setDetailAddress, resetAddressData } from "../../../app/slice/addressDataSlice";
import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";
import AddressInputForm from "../../../components/AddressInputForm";
import MobileAuthForm from "../../../components/MobileAuthForm";
import PasswordChangeButtonAndModal from "../../../components/PasswordChangeButtonAndModal";
import axiosInstance from "../../../services/axiosInstance";

import "./ProfilePage.css";

function ProfilePage() {
  // 로컬 상태 관리
  const [userInfo, setUserInfo] = useState({});
  const [isEditingMobileNumber, setIsEditingMobileNumber] = useState(false);

  // 전역 상태 관리
  const mobileNumber = useSelector((state) => state.mobileAuthData.mobileNumber);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 휴대전화번호 표시 형식
  function formatMobileNumber(mobileNumber) {
    // 데이터를 받아오기 전에는 공백 반환(비동기 처리 관련)
    if (!mobileNumber) return "";

    // 데이터를 받아와 컴포넌트의 상태 변경이 발생하면 재랜더링 되어 아래 로직 실행
    const part1 = mobileNumber.slice(0, 3);
    const part2 = mobileNumber.slice(3, 7);
    const part3 = mobileNumber.slice(7);
    return `${part1}-${part2}-${part3}`;
  };

  // 마운트 이펙트: 회원정보 로드
  useEffect(() => {
    const accountName = sessionStorage.getItem("loginId");

    const loadUserInfo = async () => {
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/auth/profile`, { 
          params: { accountName } 
        });

        setUserInfo(response.data.userInfo);

      } catch (error) {
        console.error(error);
      }
    };
    
    loadUserInfo();
  }, []);

  // 마운트 이펙트: 모바일인증 페이지에서 뒤로가기를 할 경우 모바일인증 관련 전역상태를 초기화하기 위한 이펙트
  useEffect(() => {
    dispatch(resetMobileAuthData());
  }, []);

  // 업데이트 이펙트: 회원정보 로드 후 주소 상태 업데이트
  useEffect(() => {
    // 주소 입력 폼 컴포넌트 상태값 업데이트
    dispatch(setZonecode(userInfo.zonecode));
    dispatch(setMainAddress(userInfo.mainAddress));
    dispatch(setDetailAddress(userInfo.detailAddress));
  }, [userInfo]);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetAddressData());
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 휴대전화번호 수정 버튼 클릭 핸들러(휴대전화번호 수정 모드로 전환)
  const handleClickMobileNumberEditButton = () => {
    setIsEditingMobileNumber(true);
  };

  // 휴대전화번호 수정 확인 버튼 클릭 핸들러(휴대전화번호 수정 완료)
  const handleClickMobileNumberEditConfirm = async () => {
    if (!isMobileAuthCompleted) {
      alert("모바일 인증이 완료되지 않았습니다.");
      return;
    }

    try {
      // 휴대전화번호 변경 요청
      const response = await axiosInstance.put(`${import.meta.env.VITE_SERVER_URL}/auth/profile/mobile-number`, {
        accountName: userInfo.accountName,
        newMobileNumber: mobileNumber,
      });
      
      // 휴대전화번호 변경 성공
      if (response.data.code = "MOBILE_NUMBER_UPDATED") {
        alert("휴대전화번호가 변경되었습니다.");
        dispatch(resetMobileAuthData());
        setIsEditingMobileNumber(false);
        console.log("휴대전화변호 변경 후 다시 로드합니다.");
        window.location.href = `${import.meta.env.VITE_CLIENT_URL}/auth/profile`;
      }
    } catch (error) {
      console.error("휴대전화번호 변경 요청 실패", error);
    }
  };

  // 휴대전화번호 수정 취소 버튼 클릭 핸들러(휴대전화번호 수정 취소)
  const handleClickMobileNumberEditCancel = () => {
    dispatch(resetMobileAuthData());
    setIsEditingMobileNumber(false);
  };

  return (
    <div className="profile-page">
      <div className="user-info">
        <Link  
          to="/"
          className="user-info-home-link"
        >
          <img src="/logo.png" />
        </Link>
        <div>내 정보</div>
        <div className="user-info-account-name">
          <div>아이디</div>
          <div>{userInfo.accountName}</div>
        </div>
        <div className="user-info-real-name">
          <div>이름</div>
          <div>{userInfo.realName}</div>
        </div>
        <div className="user-info-birthday">
          <div>생년월일</div>
          <div>{userInfo.birthday}</div>
        </div>
        <div className="user-info-gender">
          <div>성별</div>
          <div>{userInfo.gender}</div>
        </div>
        <AddressInputForm isEditableType={true} />
        {isEditingMobileNumber ? (
          <div>
            <MobileAuthForm />
            <div>
              <div onClick={handleClickMobileNumberEditConfirm}>
                확인
              </div>
              <div onClick={handleClickMobileNumberEditCancel}>
                취소
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div>
              {formatMobileNumber(userInfo.mobileNumber)}
            </div>
            <div onClick={handleClickMobileNumberEditButton}>
              수정
            </div>
          </div>
        )}
        <div>
          <PasswordChangeButtonAndModal />
          <div>
            <Link to="/auth/mobile-auth/withdrawal">
              회원탈퇴
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
