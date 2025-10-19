const ProductButton = ({ product, onAddToCart }) => {
  return (
    <button className="product-button" onClick={() => onAddToCart(product)}>
      <div className="product-icon">{product.icon}</div>
      <div className="">{product.name}</div>
      <div className="">$ {product.price}</div>
      {console.log(product)}
    </button>
  );
};

export default ProductButton;
