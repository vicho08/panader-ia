import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://panaderia-backend-586791903884.us-central1.run.app';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/productos/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Mapear los datos para que coincidan con la estructura esperada si es necesario
        // El backend devuelve "nombre" y "precio" como strings, los convertimos a número para cálculos
        const formattedProducts = data.map(product => ({
          id: product.id,
          name: product.nombre,
          price: parseFloat(product.precio), // Convertir a número
          description: product.descripcion // Aunque no lo uses ahora, es bueno tenerlo
        }));
        setProducts(formattedProducts);
      } catch (e) {
        console.error("Error fetching products:", e);
        setError("No se pudieron cargar los productos. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  if (loading) {
    return <div className="product-list">Cargando productos...</div>;
  }

  if (error) {
    return <div className="product-list error-message">{error}</div>;
  }

  return (
    <div className="product-list">
      <h2>Nuestros Productos</h2>
      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
      ) : (
        products.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)}>Agregar Producto</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;