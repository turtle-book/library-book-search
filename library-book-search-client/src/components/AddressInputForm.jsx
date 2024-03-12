import { useState } from "react";
import DaumPostcodeEmbed from "react-daum-postcode";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";

import { setZonecode, setMainAddress, setDetailAddress } from "../app/slice/addressDataSlice"
import axiosInstance from "../services/axiosInstance";

import "./AddressInputForm.css";

function AddressInputForm({ isEditableType=false }) {
  // 로컬 상태 관리
  const [isAddressSearchModalOpen, setIsAddressSearchModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddressData, setOriginalAddressData] = useState({});

  // 전역 상태 관리
  const zonecode = useSelector((state) => state.addressData.zonecode);
  const mainAddress = useSelector((state) => state.addressData.mainAddress);
  const detailAddress = useSelector((state) => state.addressData.detailAddress);
  const dispatch = useDispatch();

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

  // 주소 수정 버튼 클릭 핸들러(주소 수정 모드로 전환)
  const handleClickAddressEditButton = () => {
    // 기존 주소정보 임시저장
    setOriginalAddressData({ 
      zonecode, 
      mainAddress, 
      detailAddress, 
    });
    
    setIsEditingAddress(true);
  };

  // 주소 수정 확인 버튼 클릭 핸들러(주소 수정 완료)
  const handleClickAddressEditConfirm = async () => {
    if (!detailAddress) {
      alert("상세 주소를 입력해주세요.");
      return;
    }

    try {
      const accountName = sessionStorage.getItem("loginId");

      // 주소 변경 요청
      const response = await axiosInstance.put(`${import.meta.env.VITE_SERVER_URL}/auth/profile/address`, {
        accountName,
        newZonecode: zonecode,
        newMainAddress: mainAddress,
        newDetailAddress: detailAddress,
      });

      if (response.data.code === "ADDRESS_UPDATED") {
        // 임시저장된 기존 주소정보 삭제
        setOriginalAddressData({});

        setIsEditingAddress(false);
      }
    } catch (error) {
      console.error("주소 변경 요청 실패", error);
    }
  };

  // 주소 수정 취소 버튼 클릭 핸들러(주소 수정 취소)
  const handleClickAddressEditCancel = () => {
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
      <div className="address-input-form-main-address">
        <input 
          type="text" 
          value={mainAddress} 
          placeholder="주소" 
          required 
          disabled={true}
        />
      </div>
      <Modal 
        isOpen={isAddressSearchModalOpen}
        onRequestClose={handleCloseAddressSearchModal}
        contentLabel="주소 찾기 모달"
        className="address-search-modal"
      >
        <DaumPostcodeEmbed onComplete={handleCompleteAddressSearch} />
      </Modal>
      <div className="address-input-form-detail-address">
        <input 
          type="text" 
          value={detailAddress} 
          placeholder="상세 주소" 
          onChange={e => dispatch(setDetailAddress(e.target.value))} 
          required 
          disabled={isEditableType && !isEditingAddress} 
        />
      </div>
      {isEditableType && (
        isEditingAddress ? (
          <div>
            <div onClick={handleClickAddressEditConfirm}>
              확인
            </div>
            <div onClick={handleClickAddressEditCancel}>
              취소
            </div>
          </div>
        ) : (
          <div>
            <div onClick={handleClickAddressEditButton}>
              수정
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default AddressInputForm;
