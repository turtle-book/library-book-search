import LoginForm from "./LoginForm";
import JoinForm from "./JoinForm";
import { useAuth } from "../../contexts/AuthContext";

function AuthPage() {
  const { isLoginForm, setIsLoginForm } = useAuth();

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <>
      <button onClick={toggleForm}>
        {isLoginForm ? "회원가입 폼" : "로그인 폼"}
      </button>
      {isLoginForm ? (
        <LoginForm />
      ) : (
        <JoinForm />
      )}
    </>
  );
}

export default AuthPage;
