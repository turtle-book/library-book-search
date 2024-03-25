import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetAlertModal, resetNavigatePath, resetReloadURL } from "../app/slices/alertSlice";

import "./AlertModal.css";

/**
 * AlertModal 컴포넌트
 * 
 * alert를 대신해 사용자에게 알림을 제공할 modal 렌더링
 */
function AlertModal() {
  const navigate = useNavigate();

  // 전역 상태 관리
  const isAlertOpen = useSelector((state) => state.alert.isAlertOpen);
  const alertTitle = useSelector((state) => state.alert.alertTitle);
  const alertContent = useSelector((state) => state.alert.alertContent);
  const navigatePath = useSelector((state) => state.alert.navigatePath);
  const reloadURL = useSelector((state) => state.alert.reloadURL);
  const dispatch = useDispatch();

  // 모달 닫기 핸들러 함수
  const handleCloseAlertModal = () => {
    dispatch(resetAlertModal());
  };

  // 모달 닫기 후 작업 핸들러 함수
  const handleAfterCloseAlertModal = () => {
    if (navigatePath) {
      const path = navigatePath;
      dispatch(resetNavigatePath());
      navigate(path);
    } else if (reloadURL) {
      const path = reloadURL;
      dispatch(resetReloadURL());
      window.location.href = import.meta.env.VITE_CLIENT_URL + path;
    }
  }

  return (
    <Modal 
      className="alert-modal"
      isOpen={isAlertOpen} 
      onRequestClose={handleCloseAlertModal} 
      onAfterClose={handleAfterCloseAlertModal}
      contentLabel={alertTitle} 
    >
      <div className="alert-modal-content">{alertContent}</div>
      <div className="alert-modal-button" onClick={handleCloseAlertModal}>확인</div>
    </Modal>
  );
}

export default AlertModal;
