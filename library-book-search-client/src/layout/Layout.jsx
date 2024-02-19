import Header from './Header/Header';
import Footer from './Footer/Footer';

import "./Layout.css";

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
