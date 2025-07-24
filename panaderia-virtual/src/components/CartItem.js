import React from 'react';

const CartItem = ({ item, removeFromCart, updateQuantity }) => {
  return (
    <div className="cart-item">
      <span>{item.name} - ${item.price.toFixed(2)} x {item.quantity}</span>
      <div>
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
      </div>
    </div>
  );
};

export default CartItem;