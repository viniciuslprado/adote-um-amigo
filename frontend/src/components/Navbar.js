import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo-link">
          <h2>Adote um Amigo</h2>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/">Início</Link>
            </li>
            <li>
              <Link to="/animals">Animais</Link>
            </li>
            <li>
              <Link to="/tips">Orientações</Link>
            </li>
            <li>
              <Link to="/register">Cadastro</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;