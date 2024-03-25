import { useState } from "react";
import DaumPostcodeEmbed from "react-daum-postcode";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";

import { openAlertModal } from "../app/slices/alertSlice";
import { setZonecode, setMainAddress, setDetailAddress } from "../app/slices/userAddressSlice"
import axiosInstance from "../services/axiosInstance";

import "./AddressInputForm.css";

/**
 * AddressInputForm 컴포넌트
 * 
 * 주소 입력 폼 컴포넌트로,
 * isEditableType prop이 true인 경우 주소 수정 기능이 활성화 되며(내 정보 페이지에서 주소 변경을 위해 사용),
 * 기본값인 false인 경우 단순히 주소 입력 폼만 렌더링(회원가입 폼에 사용)
 * 
 * @param {Object} props 컴포넌트에 전달되는 props
 * @param {boolean} props.isEditableType 수정 모드 옵션 boolean 값(true인 경우 활성화)
 */
function AddressInputForm({ isEditableType=false }) {
  // 전역 상태 관리
  const zonecode = useSelector((state) => state.userAddress.zonecode);
  const mainAddress = useSelector((state) => state.userAddress.mainAddress);
  const detailAddress = useSelector((state) => state.userAddress.detailAddress);
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [isAddressSearchModalOpen, setIsAddressSearchModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddressData, setOriginalAddressData] = useState({});

  // 주소 찾기 모달 오픈 핸들러
  const handleOpenAddressSearchModal = () => {
    // 수정 가능한 타입의 경우, 수정 버튼을 클릭한 후 활성화
    if (isEditableType && !isEditingAddress) return;

    setIsAddressSearchModalOpen(true);
  };

  // 주소 찾기 모달 닫기 핸들러
  const handleCloseAddressSearchModal = () => {
    setIsAddressSearchModalOpen(false);
  };

  // 주소 찾기 완료 핸들러
  const handleCompleteAddressSearch = (data) => {
    const zonecode = data.zonecode;
    let fullAddress = data.address;
    let extraAddress = "";
  
    // 도로명 주소인 경우
    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
  
    dispatch(setZonecode(zonecode));
    dispatch(setMainAddress(fullAddress));
    setIsAddressSearchModalOpen(false);
  };

  // 주소 수정 모드 전환 핸들러(주소 수정 버튼 클릭 시 실행)
  const handleEnterAddressEdit = () => {
    // 기존 주소 정보 임시저장
    setOriginalAddressData({ 
      zonecode, 
      mainAddress, 
      detailAddress, 
    });
    
    setIsEditingAddress(true);
  };

  // 주소 변경 요청 핸들러(주소 수정 확인 버튼 클릭 시 실행)
  const handleRequestAddressChange = async () => {
    // 유효성 검사
    if (!zonecode.trim() || !mainAddress.trim() || !detailAddress.trim()) {
      dispatch(openAlertModal({
        modalTitle: "주소 변경 제출 불가",
        modalContent: "주소를 입력해주세요.",
      }));
      return;
    }

    try {
      const accountName = sessionStorage.getItem("loginId");

      // 사용자 주소 정보 변경 API 요청
      const response = await axiosInstance.put(`${import.meta.env.VITE_SERVER_URL}/auth/profile/address`, {
        accountName,
        newZonecode: zonecode,
        newMainAddress: mainAddress,
        newDetailAddress: detailAddress,
      });

      // 주소 변경 성공 시, 임시저장된 기존 주소 정보 삭제 및 수정 모드 비활성화
      if (response.data.code === "ADDRESS_UPDATED") {
        setOriginalAddressData({}); // 임시저장된 기존 주소 정보 삭제
        setIsEditingAddress(false);
      }
    } catch (error) {
      console.log("주소 변경 요청 실패");
      console.error(error);
    }
  };

  // 주소 수정 취소 핸들러(주소 수정 취소 버튼 클릭 시 실행)
  const handleCancelAddressEdit = () => {
    // 기존 주소 정보 복구
    const { zonecode, mainAddress, detailAddress } = originalAddressData;
    dispatch(setZonecode(zonecode));
    dispatch(setMainAddress(mainAddress));
    dispatch(setDetailAddress(detailAddress));

    setIsEditingAddress(false);
  };

  return (
    <div className="address-input-form">
      <div className="address-input-form-zonecode">
        <input 
          type="text"
          value={zonecode}
          placeholder="우편번호"
          required 
          disabled={true}
        />
        {(!isEditableType || isEditingAddress) && (
          <div onClick={handleOpenAddressSearchModal}>
            주소 찾기
          </div>
        )}
      </div>
      <Modal 
        className="address-search-modal"
        isOpen={isAddressSearchModalOpen}
        onRequestClose={handleCloseAddressSearchModal}
        contentLabel="주소 찾기 모달"
      >
        <DaumPostcodeEmbed onComplete={handleCompleteAddressSearch} />
      </Modal>
      <div className="address-input-form-main-address">
        <input 
          type="text" 
          value={mainAddress} 
          placeholder="주소" 
          required 
          disabled={true}
        />
      </div>
      <div className="address-input-form-detail-address">
        <input 
          type="text" 
          value={detailAddress} 
          placeholder="상세 주소" 
          required 
          disabled={isEditableType && !isEditingAddress} 
          onChange={e => dispatch(setDetailAddress(e.target.value))} 
        />
      </div>
      {isEditableType && (
        isEditingAddress ? (
          <div>
            <div onClick={handleRequestAddressChange}>
              확인
            </div>
            <div onClick={handleCancelAddressEdit}>
              취소
            </div>
          </div>
        ) : (
          <div>
            <div onClick={handleEnterAddressEdit}>
              수정
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default AddressInputForm;
