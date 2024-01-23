# 프로젝트 주요 기능 기획(안)
 > 최초 작성 일자: 2024년 1월 15일 월요일 오후 14시 32분  
 > 최근 수정 일자:
</br>

1. **도서 검색**
 - 검색 대상(도서명, 저자 등)을 선택하여 검색할 수 있도록 구현
 - 검색창에 도서명 입력 시, 검색창 하단에 현재 입력된 텍스트를 포함하는 추천 도서명 목록 10개를 표시하고 해당되는 텍스트는 하이라이트 표시
 - 추천 목록에 있는 도서를 특정하여 선택하면 해당 도서의 상세정보 페이지로 바로 이동
 - 도서 선택 없이 단순 검색의 경우 도서 검색 결과 페이지로 이동
 - 도서 검색 결과 페이지의 경우, 검색어에 맞는 도서 정보를 페이지당 10개씩 나열
 - 열된 각 도서의 도서 표지(이미지), 도서명, 저자, 대여 여부 등의 정보 표시
 - 도서 선택 시 도서 상세정보 페이지로 이동
 - 상세정보 페이지에는 도서 리뷰 내용 등 조회 가능
</br>

2. **회원가입 및 로그인**
 - 회원가입 구현: DB 설계, 휴대폰 인증 API  
 - 로컬 로그인 구현  
 - SNS 로그인 구현  
 - JWT 토큰 인증  
 - 아이디 찾기, 비밀번호 찾기 기능 구현
</br>

3. **도서 리뷰 & 즐겨찾기**
 - 도서 상세정보 표시
 - 해당 도서에 대한 리뷰 조회 및 작성 가능
 - 리뷰 내용은 리뷰 작성자, 평점, 리뷰 글 등으로 구성
 - 사용자에게 리뷰 작성, 수정, 삭제 권한 부여
 - 도서 즐겨찾기 기능 구현
</br>

4. **미보유 도서 추가 요청 게시판**
 - 도서 추가 요청 게시글을 페이지당 10개씩 나열
 - 도서 추가 요청 글 작성 시 도서명, 저자 등 도서 구분을 위한 내용을 입력하여 작성
 - 도서 리뷰와 같이 로그인 한 사용자에 한해 추가 요청글 작성, 수정, 삭제 권한 부여
 - 게시글 제목, 게시글 내용, 작성자 등을 검색 조건으로 하여 게시글 검색 및 조회 기능 구현
</br>

5. **마이페이지**
 - 사용자의 회원정보 변경 페이지 연결
 - 사용자가 현재 대여 중인 도서 목록 표시
 - 사용자의 위시리스트 표시
</br>

7. **관리자 페이지**
 - 관리자 계정만 접속할 수 있는 관리자 페이지 구현
 - 관리자가 신규 도서를 DB에 추가할 수 있도록 UI 구현
 - 사용자들이 작성한 리뷰, 도서 추가 요청 글을 삭제할 수 있는 UI 구현
</br>