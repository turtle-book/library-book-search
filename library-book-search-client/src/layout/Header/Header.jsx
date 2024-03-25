import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { openAlertModal } from "../../app/slices/alertSlice";
import { setIsAuthenticated } from "../../app/slices/authSlice";

import "./Hearder.css";

/**
 * Header 컴포넌트
 * 
 * 레이아웃의 상단부
 * 로그인 상태(isLoggedIn)를 기준으로 구분하여 렌더링
 */
function Header() {
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookSearchType, setBookSearchType] = useState("book-title-search");
  const [bookSearchTerm, setBookSearchTerm] = useState("");

  // 마운트 이펙트: 세션스토리지에 저장된 사용자 아이디를 기준으로 로그인 상태 저장
  useEffect(() => {
    const loginId = sessionStorage.getItem("loginId");
    setIsLoggedIn(!!loginId);
  }, []);

  // 로그아웃 요청 핸들러
  const handleRequestLogout = async () => {
    try {
      // 로그아웃 API 요청
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
        {}, 
        { withCredentials: true }
      );

      // 로그아웃 성공
      if (response.data.code === "LOGOUT_SUCCEEDED") {
        dispatch(setIsAuthenticated(false));
        sessionStorage.removeItem("loginId");
        window.location.href = `${import.meta.env.VITE_CLIENT_URL}/`;
      }
    } catch (error) {
      console.log("로그아웃 요청 실패");
      console.error(error);
    }
  };
  
  // 도서 검색 핸들러
  const handleSearchBook = async (e) => {
    e.preventDefault();

    // 검색어 유효성 검사
    if (!bookSearchTerm.trim()) {
      dispatch(openAlertModal({
        modalTitle: "도서 검색 불가",
        modalContent: "검색어를 입력하세요.",
      }));
      setBookSearchTerm("");
      return;
    }

    try {
      // 도서 검색 요청
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/search`, 
        { 
          params: { 
            bookSearchTerm, 
            bookSearchType,
          }, 
          withCredentials: true, 
        }
      );

      // 검색어를 포함하는 도서 데이터를 찾지 못한 경우
      if (response.data.code === "SEARCH_FAILED") {
        dispatch(openAlertModal({
          modalTitle: "도서 정보 조회 실패",
          modalContent: response.data.message,
        }));
      // 검색어를 포함하는 도서 데이터를 찾은 경우
      } else if (response.data.code === "SEARCH_SUCCEEDED") {
        const books = response.data.bookData;
        for (const book of books) {
          // 테스트
          console.log("제목: ", book.title);
          console.log("저자: ", book.author);
        }
      }
      setBookSearchTerm("");
    } catch (error) {
      console.log("도서 검색 요청 실패");
      console.error(error);
    }
  };

  return (
    <div className="layout-header">
      <div className="auth-bar">
        {isLoggedIn ? (
          <div className="auth-link">
            <div className="auth-logout" onClick={handleRequestLogout}>로그아웃</div>
            <Link to="/auth/profile" className="auth-profile-link">회원정보</Link>
          </div>
        ) : (
          <div className="auth-link">
            <Link to="/auth/login" className="auth-login-link">로그인</Link>
            <Link to="/auth/join" className="auth-join-link">회원가입</Link>
          </div>
        )}
      </div>
      <div className="book-search-bar">
        <a 
          href="/"
          className="book-search-bar-home-link"
        >
          <img src="/logo.png" />
        </a>
        <form className="book-search-container" onSubmit={handleSearchBook}>
          <input 
            className="book-search-custom-radio"
            type="radio" 
            id="book-title-search" 
            name="bookSearchType" 
            value="book-title-search" 
            checked={bookSearchType === "book-title-search"} 
            onChange={(e) => setBookSearchType(e.target.value)} 
          />
          <label 
            className="book-search-label" 
            htmlFor="book-title-search"
          >
            도서명
          </label>
          <input 
            className="book-search-custom-radio"
            type="radio" 
            id="book-author-search" 
            name="bookSearchType" 
            value="book-author-search" 
            checked={bookSearchType === "book-author-search"}
            onChange={(e) => setBookSearchType(e.target.value)} 
          />
          <label 
            className="book-search-label" 
            htmlFor="book-author-search"
          >
            저자명
          </label>
          <input 
            type="text"
            className="book-search-input"
            value={bookSearchTerm}
            placeholder="도서명 또는 저자명 검색" 
            onChange={(e) => setBookSearchTerm(e.target.value)}
          />
          <button className="book-search-button">
            <img src="search-icon.png" />
          </button>
        </form>
        <div className="real-time-search">
          <img src="mypage.png"/>
        </div>
      </div>
      <div className="top-menu-bar">
        <Link to="/" className="top-menu">도서관 안내</Link>
        <Link to="/" className="top-menu">내 서재</Link>
        <Link to="/" className="top-menu">희망도서 신청</Link>
        <Link to="/" className="top-menu">공지사항</Link>
      </div>
    </div>
  );
}

export default Header;
