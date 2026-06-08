import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Animals from "./pages/Animals";
import AnimalDetails from "./pages/AnimalDetails";
import Tips from "./pages/Tips";
import Register from "./pages/Register";
import "./styles/App.css";

function NotFoundRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    alert("Rota incorreta! Redirecionando para o início.");
    navigate("/inicio", { replace: true });
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/animals/:animalName/:id" element={<AnimalDetails />} />
          <Route path="/animals/:animalName" element={<AnimalDetails />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
