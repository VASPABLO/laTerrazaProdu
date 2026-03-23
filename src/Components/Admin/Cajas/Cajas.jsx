// src/components/Caja.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Caja = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            const productData = await getProducts();
            setProducts(productData);
        };
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        setCart([...cart, product]);
        setTotal(total + product.price);
    };

    const handleCheckout = () => {
        // Implementar el pago y creación de venta
        console.log('Venta realizada');
    };

    return (
        <div>
            <h2>Bienvenido, {user?.username}</h2>
            <h3>Productos</h3>
            <div>
                {products.map((product) => (
                    <div key={product.id}>
                        <span>{product.name}</span>
                        <span>${product.price}</span>
                        <button onClick={() => addToCart(product)}>Agregar al carrito</button>
                    </div>
                ))}
            </div>
            <h3>Carrito</h3>
            <ul>
                {cart.map((item, index) => (
                    <li key={index}>{item.name} - ${item.price}</li>
                ))}
            </ul>
            <h3>Total: ${total}</h3>
            <button onClick={handleCheckout}>Cobrar</button>
        </div>
    );
};

export default Caja;