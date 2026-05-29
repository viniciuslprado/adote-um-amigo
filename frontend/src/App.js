import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Animals from "./pages/Animals";
import AnimalDetails from "./pages/AnimalDetails";
import Tips from "./pages/Tips";
import Register from "./pages/Register";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/animals/:animalName/:id" element={<AnimalDetails />} />
          <Route path="/animals/:animalName" element={<AnimalDetails />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
