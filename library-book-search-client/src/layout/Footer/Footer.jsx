import { Link } from "react-router-dom";

import "./Footer.css";

const Footer = () => {
  return (
    <div className="layout-footer">
      <Link to="/">개인정보처리방침</Link>
      <Link to="/">찾아오시는 길</Link>
    </div>
  );
};

export default Footer;
