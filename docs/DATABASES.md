# 행복도서관 프로젝트의 데이터베이스 설계에 관한 문서
 > 최초 작성 일자: 2024년 02월 18일 일요일 오후 11시 56분  
 > 최근 수정 일자: 2024년 02월 20일 화요일 오후 16시 26분
</br>

## 개 요
행복도서관 프로젝트의 데이터베이스 설계에 대한 내용  
</br>

## 주요 데이터베이스 설계 내용

### MySQL
- **1. users 테이블**
  - 개 요: 아이디, 비밀번호, 이메일 등 사용자 정보 데이터
  - 주요컬럼
    - id: 기본키로, 여러 관계 설정에 활용
    - account_name: 로그인 아이디로 사용되며 유일한 값을 가짐
    - password: 로그인 비밀번호로 사용되며 암호화되어 저장됨
    - email: 이메일 인증에 활용되며 유일한 값을 가짐
    - is_admin: 관리자 여부
  - 관 계
    - email_verifications 테이블과 일대다 관계
      - 사용자가 회원정보 변경을 위해 이메일 인증을 시도한 정보를 관리
    - books 테이블과 일대다 관계
      - 사용자가 대여한 도서 정보를 관리
    - books 테이블과 다대다 관계
      - user_book_likes 중간 테이블을 생성하여 사용자가 '좋아요'를 설정한 도서 정보를 관리
      - user_book_likes 중간 테이블은 users 테이블의 기본키인 id 컬럼을 참조
    - reviews 테이블과 일대다 관계
      - 사용자와 사용자가 작성한 리뷰 관계 설정
    - book_requests 테이블과 일대다 관계
      - 사용자와 사용자의 희망도서 신청 내용 관계 설정
- **2. email_verifications 테이블**
  - 개 요: 이메일 인증 데이터
  - 주요컬럼
    - id: 기본키
    - user_id: 이메일 인증을 위해 users 테이블과 다대일 관계 설정에 사용되는 외래키
    - email: 인증을 시도한 이메일
    - verification_code: 인증을 위한 보안코드
    - expiration_time: 보안코드의 만료기한
    - verified: 인증 완료 여부
    - verification_type: 인증 타입으로, 회원가입의 경우와 회원정보 변경의 경우로 구분
  - 관 계
    - users 테이블과 다대일 관계
      - 사용자가 회원정보 변경을 위해 이메일 인증을 시도한 정보를 관리
      - 외래키인 user_id 컬럼을 통해 users 테이블의 id 컬럼을 참조
- **3. books 테이블**
  - 개 요: 도서 검색과 사용자 도서 관리를 위한 도서 정보 데이터
  - 주요컬럼
    - reg_number: 기본키
    - isbn: ISBN 번호, 국제 표준 도서 번호
    - rented_by: 대여 현황 기록을 위해 users 테이블과 다대일 관계 설정에 사용되는 외래키 
    - rental_count: 추천도서를 선정하는 기준이 되는 누적 대여횟수
    - created_at: 도서가 등록된 시점
  - 관 계
    - users 테이블과 다대일 관계
      - 사용자가 대여한 도서 정보를 관리
      - users 테이블의 id 컬럼을 외래키로 참조(rented_by 컬럼)
    - users 테이블과 다대다 관계
      - user_book_likes 중간 테이블을 생성하여 사용자가 '좋아요'를 설정한 도서 정보를 관리
      - user_book_likes 중간 테이블은 books 테이블의 기본키인 id 컬럼을 참조
    - reviews 테이블과 일대다 관계
      - 도서와 도서에 대한 리뷰 관계 설정
- **4. user-book-likes 테이블**
  - 개 요: 사용자와 사용자가 '좋아요'를 설정한 도서 간의 관계를 나타낸 데이터
  - 주요컬럼
    - liker: '좋아요'를 설정한 사용자를 나타내며, users 테이블의 id 컬럼을 참조하는 외래키
    - liked_book: 사용자가 '좋아요'를 설정한 도서를 나타내며, books 테이블의 id 컬럼을 참조하는 외래키
  - 관 계
    - users 테이블과 books 테이블의 다대다 관계에 의해 생성된 중간 테이블
- **5. reviews 테이블**
  - 개 요: 도서별 사용자 평점 및 댓글 데이터
  - 주요컬럼
    - user_id: 리뷰를 작성한 사용자를 나타내며, users 테이블의 id 컬럼을 참조하는 외래키
    - book_id: 리뷰 작성 대상 도서를 나타내며, books 테이블의 id 컬럼을 참조하는 외래키
    - rating: 도서에 대한 평점
    - content: 도서 리뷰 내용
  - 관 계
    - users 테이블과 다대일 관계
      - 사용자와 사용자가 작성한 리뷰 관계 설정
      - user_id 컬럼이 users 테이블의 id 컬럼을 참조
    - books 테이블과 다대일 관계
      - 도서와 도서에 대한 리뷰 관계 설정
      - book_id 컬럼이 books 테이블의 id 컬럼을 참조
- **6. book_requests 테이블**
  - 개 요: 희망 도서 신청 내용 데이터
  - 주요컬럼
    - user_id: 희망도서 신청자를 나타내며, users 테이블의 id 컬럼을 참조하는 외래키
    - book_title: 희망도서의 도서명
    - book_author: 희망도서의 저자명
    - book_publisher: 희망도서의 출판사명
    - request_comment: 희망도서 신청에 관한 사용자의 추가 코멘트
    - request_status: 희망도서 신청 진행현황
    - admin_comment: 희망도서 신청에 대한 관리자의 답변
  - 관 계
    - users 테이블과 다대일 관계
      - 사용자와 사용자의 희망도서 신청 내용 관계 설정
      - user_id 컬럼이 users 테이블의 id 컬럼을 참조
- **7. announcements 테이블**
  - 개 요: 관리자 공지사항 게시
  - 주요컬럼
    - views: 공지사항 조회수
    - is_pinned: 공지사항 상단 고정 여부
  - 관 계
    - 관계된 테이블 없음

### Redis
- **1. 리프레시 토큰**
  - 개 요: 리프레시 토큰 데이터 저장
  - 데이터 형식
    - 형식: String
    - key: `refreshToken:${accountName}`,
    - value: refreshToken
    - EX: 5 * 24 * 3600
- **2. 사용자 로그인 세션키**
  - 개 요: 중복로그인 방지를 위한 로그인세션키 저장
  - 데이터 형식
    - 형식: String
    - key: `loginSessionKey:${accountName}`,
    - value: loginSessionKey
    - EX: 15 * 60
- **3. 실시간 검색어**
  - 개 요: 실시간 검색어 구현을 위한 검색 횟수 저장, 정렬된 세트 형식으로 저장하여 상위 N개 검색어 조회 가능하도록 구현
  - 데이터 형식
    - 형식: Sorted Sets
    - key: searchWords:sorted
    - value: 각 검색어에 대한 검색 빈도수(score)와 검색어(member)
</br>

## 데이터베이스 스키마
- 프로젝트 서버 폴더 내 시퀄라이즈 모델 코드 참고
- 경로: ../library-book-search-server/models
</br>

## 데이터 모델링 규칙
- 테이블명은 복수형의 스네이크 케이스로 명명한다.
- 시퀄라이즈 모델명은 단수형의 파스칼 케이스로 명명한다.
- 컬럼명은 스네이크 케이스로 명명한다.
</br>
