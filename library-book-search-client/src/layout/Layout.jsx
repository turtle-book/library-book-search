import Header from './Header/Header';
import Footer from './Footer/Footer';

import "./Layout.css";

/**
 * Layout 컴포넌트
 * 
 * 레이아웃 렌더링
 * 
 * @param {Object} props 컴포넌트에 전달되는 props
 * @param {ReactElement} props.children 래핑할 자식 컴포넌트
 */
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
