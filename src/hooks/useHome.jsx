import { useState, useEffect } from 'react';
export default function useHome() {

    const initialProducts = [];


    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : initialProducts;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', icon: '' });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    const handleAddToCart = (product) => {
        setCartItems((prevItems) => {
            const itemInCart = prevItems.find((item) => item.id === product.id);
            if (itemInCart) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (product) => {
        setCartItems((prevItems) => {
            return prevItems.filter((item) => item.id !== product.id);
        });
    };

    const handleClearCart = () => {
        setCartItems([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectIcon = (icon) => {
        setNewItem((prev) => ({ ...prev, icon }));
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.name && newItem.price && newItem.icon) {
            setProducts((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    name: newItem.name,
                    price: parseFloat(newItem.price),
                    icon: newItem.icon,
                },
            ]);
            setNewItem({ name: '', price: '', icon: '' });
            setIsModalOpen(false);
        }
    };

    return {
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
        handleClearCart
    }
}
