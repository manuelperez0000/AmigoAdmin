import PropTypes from 'prop-types';
import useDollarStore from '../stores/dollarStore';

const Cart = ({ cartItems, onRemoveFromCart, onClearCart, onAddToCart, onRemoveQuantity, setCartItems }) => {
  const { dolarPrice } = useDollarStore();
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalBs = total * dolarPrice;

  const handleCompleteOrder = () => {
    // Obtener el siguiente ID del localStorage
    const nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;
    const currentOrderId = nextOrderId;

    const order = {
      id: currentOrderId,
      items: cartItems,
      total: totalBs,
      date: new Date().toISOString(),
      dolarRate: dolarPrice, // Guarda la tasa del dólar en el momento del pedido
    };

    // Guardar el pedido
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));

    // Incrementar el contador para el siguiente pedido
    localStorage.setItem('nextOrderId', JSON.stringify(currentOrderId + 1));

    onClearCart();
    alert('Pedido completado!');
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
