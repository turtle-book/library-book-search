import PasswordChangeForm from "../../components/PasswordChangeForm";

import "./PasswordChangePage.css";

/**
 * PasswordChangePage 컴포넌트
 * 
 * 비밀번호 변경 페이지 렌더링
 */
function PasswordChangePage() {
  return (
    <div>
      <PasswordChangeForm isForPasswordChange={true} />
    </div>
  );
}

export default PasswordChangePage;
