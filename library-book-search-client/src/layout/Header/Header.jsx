import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Hearder.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchWord, setSearchWord] = useState("");
  const [searchType, setSearchType] = useState("search-title");

  // 로그인 상태 확인
  useEffect(() => {
    const loginId = localStorage.getItem("loginId");
    setIsLoggedIn(!!loginId);
  }, []);

  // 로그아웃 요청
  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
        { 
          params: {
            accountName: localStorage.getItem("loginId"),
          },
          withCredentials: true,
        },
      );
      if (response.data.code === "LOGOUT_SUCCEEDED") {
        localStorage.removeItem("loginId");
        window.location.href = `${import.meta.env.VITE_CLIENT_URL}/`;
      }
    } catch (error) {
      console.error("로그아웃 요청 실패", error);
    }
  };
  
  // 도서 검색 요청
  const handleSearch = async (event) => {
    event.preventDefault();

    // 검색어를 입력하지 않은 경우(공백 입력 포함)
    if (searchWord.trim() === "") {
      alert("검색어를 입력하세요.");
      setSearchWord("");
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/search`, {
        params: { searchWord },
      });
      // 검색어를 포함하는 도서정보를 찾지 못한 경우
      if (response.data.code === "SEARCH_FAILED") {
        alert(response.data.message);
      // 검색어를 포함하는 도서정보를 찾은 경우
      } else if (response.data.code === "SEARCH_SUCCEEDED") {
        const books = response.data.data.bookData;
        for (const book of books) {
          // 테스트
          console.log("제목: ", book.title);
          console.log("저자: ", book.author);
        }
      }
      setSearchWord("");
    } catch (error) {
      console.error("도서검색 요청 실패", error);
    }
  };

  return (
    <div className="layout-header">
      <div className="auth-bar">
        {isLoggedIn ? (
          <div onClick={handleLogout} className="auth-link">로그아웃</div>
        ) : (
          <div className="auth-link">
            <Link to="/login" className="auth-login-link">로그인</Link>
            <Link to="/join" className="auth-join-link">회원가입</Link>
          </div>
        )}
      </div>
      <div className="search-bar">
        <a 
          href="/"
          className="home-link"
        >
          <img src="logo.png" />
        </a>
        <div className="search-container">
          <input 
            type="radio" 
            id="search-title" 
            name="searchType" 
            value="search-title" 
            checked={searchType === "search-title"} 
            onChange={(e) => setSearchType(e.target.value)} 
          />
          <label htmlFor="search-title">도서명</label>
          <input 
            type="radio" 
            id="search-author" 
            name="searchType" 
            value="search-author"
            checked={searchType === "search-author"}
            onChange={(e) => setSearchType(e.target.value)} 
          />
          <label htmlFor="search-author">저자명</label>
          <input 
            type="text"
            id="search-input"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="도서명 또는 저자명 검색"
          />
          <div id="search-button" onClick={handleSearch} >
            <img src="search-icon.png" />
          </div>
        </div>
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
