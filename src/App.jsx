
import Navbar from './components/Navbar';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import Router from './router'
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css'
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Router />
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-links">
          <a
            href="/"
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">🏠</div>
            <div className="mobile-nav-text">Inicio</div>
          </a>
          <a
            href="/orders"
            className={`mobile-nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">📋</div>
            <div className="mobile-nav-text">Pedidos</div>
          </a>
          <a
            href="/products"
            className={`mobile-nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">🛍️</div>
            <div className="mobile-nav-text">Productos</div>
          </a>
        </div>
      </nav>
    </>
  );
}

export default App;
