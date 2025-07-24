import React, { useState } from 'react';

const CheckoutForm = ({ onPlaceOrder }) => {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    address: ''
  });

  const handleChange = (e) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPlaceOrder(clientInfo);
    setClientInfo({ name: '', email: '', address: '' });
  };

  return (
    <div className="checkout-form">
      <h2>Datos del Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={clientInfo.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={clientInfo.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Dirección:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={clientInfo.address}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Finalizar Pedido</button>
      </form>
    </div>
  );
};

export default CheckoutForm;