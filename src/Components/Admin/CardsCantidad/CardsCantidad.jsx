import React, { useEffect, useState } from 'react';
import './CardsCantidad.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faImage, faAddressBook, faTachometerAlt, faCode, faTable, faClipboardList, faClock, faClipboard, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import baseURL from '../../url';
import contador from '../../contador'
export default function CardsCantidad() {
    const [productos, setProductos] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categorias, setCategoras] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [mesas, setMesas] = useState([]);
        const [pedidosPendientes, setPedidosPendientes] = useState(0);
        const [pedidosPreparando, setPedidosPreparando] = useState(0);
        const [pedidosCompletados, setPedidosCompletados] = useState(0);
    useEffect(() => {
        cargarProductos();
        cargarBanners();
        cargarCategoria();
        cargarCodigos();
        cargarPedidos();
        cargarMesas();
    }, []);

    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };



    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner || []);
                console.log(data.banner)
            })
            .catch(error => console.error('Error al cargar banners:', error));
    };


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };


    const cargarCodigos = () => {
        fetch(`${baseURL}/codigosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCodigos(data.codigos || []);
            })
            .catch(error => console.error('Error al cargar códigos:', error));
    };
    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const pedidosData = data.pedidos || [];
                setPedidos(pedidosData);
                
                // Calcular estados de pedidos
                const pendientes = pedidosData.filter(p => p.estado === 'pendiente').length;
                const preparando = pedidosData.filter(p => p.estado === 'preparando').length;
                const completados = pedidosData.filter(p => p.estado === 'completado').length;
                
                setPedidosPendientes(pendientes);
                setPedidosPreparando(preparando);
                setPedidosCompletados(completados);
                
                console.log(pedidosData)
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };
    const cargarMesas = () => {
        fetch(`${baseURL}/mesaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setMesas(data.mesas || []);
                console.log(data.mesas)
            })
            .catch(error => console.error('Error al cargar mesas:', error));
    };

    const [counter, setCounter] = useState(contador);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setCounter((prevCounter) => {
                    if (prevCounter === 1) {
                        recargar();
                        return contador;
                    }
                    return prevCounter - 1;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);
    const togglePause = () => {
        setIsPaused(!isPaused);
    };


    const recargar = () => {
        cargarMesas();
        cargarPedidos();
    };
    return (











        <div className='CardsCantidad'>
            {/* Total Pedidos */}
            <Anchor to={`/admin/pedidos`} className='cardCantidad' >
                <FontAwesomeIcon icon={faClipboard} className='icons' />
                <div>
                    <h3>Total Pedidos</h3>
                    <h2>{pedidos.length}</h2>
                </div>
            </Anchor>

            {/* Pendientes */}
            <Anchor to={`/admin/pedidos`} className='cardCantidad' >
                <FontAwesomeIcon icon={faClock} className='icons' />
                <div>
                    <h3>Pendientes</h3>
                    <h2>{pedidosPendientes}</h2>
                </div>
            </Anchor>

            {/* Preparando */}
            <Anchor to={`/admin/pedidos`} className='cardCantidad' >
                <FontAwesomeIcon icon={faBook} className='icons' />
                <div>
                    <h3>Preparando</h3>
                    <h2>{pedidosPreparando}</h2>
                </div>
            </Anchor>

            {/* Completados */}
            <Anchor to={`/admin/pedidos`} className='cardCantidad' >
                <FontAwesomeIcon icon={faCheck} className='icons' />
                <div>
                    <h3>Completados</h3>
                    <h2>{pedidosCompletados}</h2>
                </div>
            </Anchor>

            {/* Productos */}
            <Anchor to={`/admin/productos`} className='cardCantidad' >
                <FontAwesomeIcon icon={faBook} className='icons' />
                <div>
                    <h3>Productos</h3>
                    <h2>{productos.length}</h2>
                </div>
            </Anchor>

            {/* Categorías */}
            <Anchor to={`/admin/categorias`} className='cardCantidad' >
                <FontAwesomeIcon icon={faTachometerAlt} className='icons' />
                <div>
                    <h3>Categorias</h3>
                    <h2>{categorias.length}</h2>
                </div>
            </Anchor>
        </div>
    )
}
