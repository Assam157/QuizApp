 import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Registration from "./components/StudentDetails";
import Login from "./components/StudentLogin.jsx";
import QuizPage from "./components/QuizPage";
import ResultPage from "./components/CertificatePage";
import RulesPage from "./components/RulesPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/rules" element={<RulesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
