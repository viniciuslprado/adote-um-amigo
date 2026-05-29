import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="container nav-container">
        <Link to="/" className="logo-link">
          <h1 className="logo">Adote um Amigo</h1>
        </Link>

        <nav>
          <ul className="nav-list">
            <li>
              <Link to="/">Início</Link>
            </li>
            <li>
              <Link to="/animals">Animais</Link>
            </li>
            <li>
              <Link to="/guidelines">Orientações</Link>
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

export default Header;