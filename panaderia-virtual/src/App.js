import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';
import './App.css'; // Asegúrate de crear este archivo para los estilos

function App() {
  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;

  const [products] = useState([
    { id: 1, name: 'Pan de Masa Madre', price: 5.50 },
    { id: 2, name: 'Croissant', price: 2.75 },
    { id: 3, name: 'Donut Glaseado', price: 3.00 },
    { id: 4, name: 'Galletas de Chispas', price: 1.50 },
    { id: 5, name: 'Baguette', price: 3.20 },
  ]);

  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
    setShowCart(true); // Abre el carrito automáticamente al añadir un producto
  };

  const removeFromCart = (idToRemove) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
  };

  const updateQuantity = (idToUpdate, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.id !== idToUpdate);
      }
      return prevItems.map((item) =>
        item.id === idToUpdate ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const handlePlaceOrder = async (clientInfo) => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de finalizar el pedido.');
      return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderBody = {
      cliente: clientInfo.name, // Usamos el nombre del cliente del formulario
      total: parseFloat(total.toFixed(2)), // Aseguramos que el total sea un número flotante con 2 decimales
      productos_pedido: cartItems.map(item => ({
        producto_id: item.id,
        cantidad: item.quantity
      }))
    };
     console.log('Enviando pedido:', orderBody);

    try {
      const response = await fetch(`${backendUrl}/pedidos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderBody),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Intentar leer el error del backend
        throw new Error(`Error al finalizar el pedido: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Pedido enviado con éxito:', responseData);
      alert('¡Gracias por tu pedido! Tu pedido ha sido procesado con éxito.');
      setCartItems([]); // Vaciar carrito después de finalizar el pedido
      setShowCart(false);
    } catch (error) {
      console.error('Hubo un problema al enviar el pedido:', error);
      alert(`No se pudo finalizar el pedido: ${error.message}. Por favor, intenta de nuevo.`);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Panader - IA</h1>
        <button onClick={toggleCart} className="cart-toggle-btn">
          🛒 Carrito ({cartItems.reduce((total, item) => total + item.quantity, 0)})
        </button>
      </header>
      <div className="main-content">
        <ProductList products={products} addToCart={addToCart} />
        <CheckoutForm onPlaceOrder={handlePlaceOrder} />
      </div>
      {showCart && (
        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          toggleCart={toggleCart}
        />
      )}
    </div>
  );
}

export default App;