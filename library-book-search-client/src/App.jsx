import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import JoinPage from "./pages/JoinPage/JoinPage";
import HomePage from "./pages/HomePage/HomePage";
import Layout from "./layout/Layout";
import LoginPage from "./pages/LoginPage/LoginPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
      </Routes>
    </Router>
  );
}

export default App;
