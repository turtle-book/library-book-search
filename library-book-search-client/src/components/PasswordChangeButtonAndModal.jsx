import axios from "axios";
import { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../services/axiosInstance";

import "./PasswordChangeButtonAndModal.css";

function PasswordChangeButtonAndModal() {
  const navigate = useNavigate();

  // 로컬 상태 관리
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false); 

  // 비밀번호 입력 필드 초기화
  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  // 비밀번호 변경 정보 제출 핸들러
  const handleSubmitPasswordChangeData = async () => {
    // 새 비밀번호 확인
    if (newPassword !== newPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      resetPasswordFields();
      return;
    }

    try {
      const accountName = sessionStorage.getItem("loginId");

      // 비밀번호 변경 요청
      const response = await axiosInstance.patch(`${import.meta.env.VITE_SERVER_URL}/auth/profile/password`, {
        accountName, 
        currentPassword, 
        newPassword,
      });

      alert(response.data.message);
  
      // 비밀번호 변경 성공 시 로그아웃 후 로그인 화면으로 이동
      if (response.data.code === "CHANGE_PASSWORD_SUCCEEDED") {
        setIsPasswordChangeModalOpen(false);

        try {
          await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
            { accountName }, 
            { withCredentials: true }
          );
          
          sessionStorage.removeItem("loginId");
          navigate("/auth/login");
        } catch (logoutError) {
          console.error("로그아웃 요청 실패", logoutError);
        }
      // 비밀번호 변경 실패
      } else {
        resetPasswordFields();
      }
    } catch (error) {
      console.error("비밀번호 변경 요청 실패", error);
    }
  };

  // 비밀번호 변경 취소
  const handleCancelPasswordChange = () => {
    resetPasswordFields();
    setIsPasswordChangeModalOpen(false);
  };

  return (
    <div>
      <div onClick={() => setIsPasswordChangeModalOpen(true)}>
        비밀번호 변경
      </div>
      <Modal 
        isOpen={isPasswordChangeModalOpen} 
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="비밀번호 변경 모달"
        className="password-change-modal"
      >
        <form className="password-change-form">
          <div className="password-change-current-password">
            <div>현재 비밀번호</div>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="password-change-new-password">
            <div>새 비밀번호</div>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="password-change-new-password-confirm">
            <div>새 비밀번호 확인</div>
            <input 
              type="password"  
              value={newPasswordConfirm} 
              onChange={(e) => setNewPasswordConfirm(e.target.value)} 
              required 
            />
          </div>
          <div className="password-change-action">
            <div onClick={handleSubmitPasswordChangeData}>
              확인
            </div>
            <div onClick={handleCancelPasswordChange}>
              취소
            </div>
          </div>
        </form>
      </Modal>
    </div>

  );
}

export default PasswordChangeButtonAndModal;
