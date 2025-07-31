import React from 'react';
import CartItem from './CartItem';

const Cart = ({ cartItems, removeFromCart, updateQuantity, toggleCart }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-sidebar">
      <button className="close-cart-btn" onClick={toggleCart}>X</button>
      <h2>Tu Carrito</h2>
      {cartItems.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          ))}
          <h3>Total: ${total.toFixed(2)}</h3>
        </>
      )}
    </div>
  );
};

export default Cart;