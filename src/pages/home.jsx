import ProductButton from '../components/ProductButton';
import Cart from '../components/Cart';
import Modal from '../components/Modal';
import IconPicker from '../components/IconPicker';
import useHome from '../hooks/useHome';

const Home = () => {

    const {
        products,
        handleAddToCart,
        setIsModalOpen,
        isModalOpen,
        handleAddItem,
        newItem,
        handleInputChange,
        handleSelectIcon,
        cartItems,
        setCartItems,
        handleRemoveFromCart,
        handleClearCart } = useHome()


    return (
        <div className="container-fluid h-100 p-0 mb-0 separacion-top bg-danger w-100">

            <div className="main-content bg-success">
                <div className="products-section">
                    <div className='flex-between'>
                        <h2 className='m-0'>Productos</h2>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nuevo producto</button>
                    </div>
                    <hr />
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductButton key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}

                    </div>
                </div>
                <div className="cart-container">
                    <Cart
                        cartItems={cartItems}
                        onRemoveFromCart={handleRemoveFromCart}
                        onClearCart={handleClearCart}
                        onAddToCart={handleAddToCart}
                        onRemoveQuantity={(item) => {
                            const itemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
                            if (itemInCart && itemInCart.quantity > 1) {
                                setCartItems((prevItems) =>
                                    prevItems.map((cartItem) =>
                                        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                                    )
                                );
                            }
                        }}
                        setCartItems={setCartItems}
                    />
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleAddItem}>
                    <h2>Agregar Nuevo Producto</h2>
                    <input
                        type="text"
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        placeholder="Nombre del producto"
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        value={newItem.price}
                        onChange={handleInputChange}
                        placeholder="Precio"
                        step="0.01"
                        required
                    />
                    <IconPicker newItem={newItem} onSelectIcon={handleSelectIcon} />
                    <button className='btn btn-primary' type="submit">Agregar Producto</button>
                </form>
            </Modal>
        </div>
    )
}

export default Home
