import { Navigate } from "react-router-dom";

/**
 * PrivateRoute 컴포넌트
 * 
 * 로그인 권한이 필요한 페이지의 경우, 이 컴포넌트를 부모 요소로 감싸 로그인 여부에 따라 페이지 자동으로 이동하도록 설계
 * 로그인 된 경우, 본래 페이지로 이동
 * 로그인 되지 않은 경우, 로그인 페이지로 이동
 * 로그인 페이지에서 로그인 성공 시, (LoginPage 컴포넌트 설정에 의해) redirectPath에 등록된 주소 또는 본래 주소로 이동
 * 
 * @param {Object} props 컴포넌트에 전달되는 props
 * @param {ReactElement} props.children 래핑할 자식 컴포넌트
 * @param {boolean} props.isAuthenticated 사용자의 인증 상태를 나타내는 boolean 값(전역 상태)
 */
function PrivateRoute({ children, isAuthenticated }) {
  return (
    isAuthenticated ? children : <Navigate to="/auth/login" replace />
  );
}

export default PrivateRoute;
