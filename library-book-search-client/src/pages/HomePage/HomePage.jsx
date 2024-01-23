import axios from "axios";
import { useState } from "react";

function HomePage() {
  const [searchWord, setSearchWord] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();

    // 검색어를 입력하지 않은 경우
    if (searchWord.trim() === '') {
      alert('검색어를 입력하세요.');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/search`, {
        params: { word: searchWord }
      });
      // 검색어를 포함하는 도서정보를 찾지 못한 경우
      if (response.data.type === "popUpMessage") {
        alert(response.data.content);
      // 검색어를 포함하는 도서정보를 찾은 경우
      } else if (response.data.type === 'redirect') {
        const books = response.data.content;
        for (const book of books) {
          console.log("제목: ", book.title);
          console.log("저자: ", book.author);
        }
      }
    } catch (error) {
      console.error(error);
    }

    setSearchWord("");
  }

  return (
    <>
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
