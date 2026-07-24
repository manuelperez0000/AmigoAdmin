import { useState } from 'react';
import PropTypes from 'prop-types';
import useDollarStore from '../stores/dollarStore';
import Modal from './Modal';

const Cart = ({ cartItems, onRemoveFromCart, onClearCart, onAddToCart, onRemoveQuantity, setCartItems }) => {
  const { dolarPrice } = useDollarStore();
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalBs = total * dolarPrice;

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');

  const handleCompleteOrder = () => {
    setClientName('');
    setIsNameModalOpen(true);
  };

  const confirmCompleteOrder = () => {
    const nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;
    const currentOrderId = nextOrderId;

    const order = {
      id: currentOrderId,
      items: cartItems,
      total: totalBs,
      date: new Date().toISOString(),
      dolarRate: dolarPrice,
      clientName: clientName.trim() || 'Sin nombre',
    };

    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));
    localStorage.setItem('nextOrderId', JSON.stringify(currentOrderId + 1));

    setIsNameModalOpen(false);
    setClientName('');
    onClearCart();
  };

  return (
    <div className="cart">
      <h4>Carrito</h4>
      {cartItems.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id} className="d-flex justify-content-between align-items-center mb-2">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price"> - Bs. {(item.price * dolarPrice).toFixed(2)}</span>
              </div>
              <div className="quantity-controls d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={() => onRemoveQuantity(item)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    if (newQuantity >= 1 && setCartItems) {
                      setCartItems((prevItems) =>
                        prevItems.map((cartItem) =>
                          cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
                        )
                      );
                    }
                  }}
                  className="form-control form-control-sm mx-2"
                  style={{ width: '60px', textAlign: 'center' }}
                />
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => onAddToCart(item)}
                >
                  +
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onRemoveFromCart(item)}
                  title="Eliminar todos los items de este tipo"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <h3>Total: Bs. {totalBs.toFixed(2)}</h3>
      {cartItems.length > 0 && (
        <button className='btn btn-success mt-4 w-100' onClick={handleCompleteOrder}>Completar Pedido</button>
      )}

      <Modal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} fullScreen>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 16 }}>Nombre del cliente</h3>
          <input
            type="text"
            placeholder="A nombre de..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmCompleteOrder(); }}
            autoFocus
            style={{ width: '100%', maxWidth: 400, padding: '10px 14px', marginTop: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 18, textAlign: 'center' }}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
            <button onClick={() => setIsNameModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: 16 }}>
              Cancelar
            </button>
            <button onClick={confirmCompleteOrder} style={{ padding: '10px 20px', borderRadius: 6, background: '#198754', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16 }}>
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Cart.propTypes = {
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  })).isRequired,
  onRemoveFromCart: PropTypes.func.isRequired,
  onClearCart: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onRemoveQuantity: PropTypes.func.isRequired,
  setCartItems: PropTypes.func.isRequired,
};

export default Cart;
