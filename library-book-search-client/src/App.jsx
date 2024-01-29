import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage/AuthPage";
import HomePage from "./pages/HomePage/HomePage";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
