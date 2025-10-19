import Home from './pages/home'
import { Routes, Route } from 'react-router-dom';
import Orders from './pages/Orders';
import Products from './pages/Products';

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
        </Routes>
    )
}

export default Router
