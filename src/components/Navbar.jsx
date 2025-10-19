import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useDollarStore from '../stores/dollarStore';

const Navbar = () => {
  const { dolarPrice, setDolarPrice } = useDollarStore();
  const location = useLocation();
  const [isDollarInputFocused, setIsDollarInputFocused] = useState(false);

  const handleDolarChange = (e) => {
    setDolarPrice(e.target.value);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar px-3">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-icon">👨‍💼</div>
          <div className="brand-text">
            <h1 className="brand-title">amigoAdmin</h1>
            <p className="brand-subtitle">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${isActiveLink('/') ? 'active' : ''}`}
          >
            🏠 Inicio
          </Link>
          <Link
            to="/orders"
            className={`navbar-link ${isActiveLink('/orders') ? 'active' : ''}`}
          >
            📋 Pedidos
          </Link>
          <Link
            to="/products"
            className={`navbar-link ${isActiveLink('/products') ? 'active' : ''}`}
          >
            🛍️ Productos
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        <div>
          <label className="dolar-label">
            💰 Tasa del dólar:
          </label>
          <div className="dolar-input-wrapper">
            <span className="dolar-symbol">$</span>
            <input
              type="number"
              onChange={handleDolarChange}
              value={dolarPrice}
              placeholder="0.00"
              className="dolar-input"
              onFocus={() => setIsDollarInputFocused(true)}
              onBlur={() => setIsDollarInputFocused(false)}
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
