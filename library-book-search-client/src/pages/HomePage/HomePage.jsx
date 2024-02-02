import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

function HomePage() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [searchWord, setSearchWord] = useState("");

  // 로그아웃 요청
  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
        { withCredentials: true },
      );
      if (response.data.code === "LOGOUT_SUCCESS") {
        setIsLoggedIn(false);
        window.location.href = `${import.meta.env.VITE_CLIENT_URL}/`;
      }
    } catch (error) {
      console.error("로그아웃 요청 실패", error);
    }
  };

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
        params: { searchWord }
      });
      // 검색어를 포함하는 도서정보를 찾지 못한 경우
      if (response.data.code === "SEARCH_FAIL") {
        alert(response.data.message);
      // 검색어를 포함하는 도서정보를 찾은 경우
      } else if (response.data.code === "SEARCH_SUCCESS") {
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
    <>
      {isLoggedIn ? (
        <button onClick={handleLogout}>로그아웃</button>
      ) : (
        <Link to="/auth">로그인</Link>
      )}
      <form onSubmit={handleSearch}>
        <input 
          type="text"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          placeholder=""
        />
        <button>검색</button>
      </form>
    </>
  );
}

export default HomePage;
