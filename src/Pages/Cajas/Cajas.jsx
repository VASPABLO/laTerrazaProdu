import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../Header/Header';
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash';
import baseURL from '../../Components/url';
import moneda from '../../Components/moneda';
import html2canvas from 'html2canvas';
import './cajas.css';

export default function Cajas() {
    const [usuarioId, setUsuarioId] = useState(1);
    const [usuarioNombre, setUsuarioNombre] = useState('Usuario');
    const [caja, setCaja] = useState(null);
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [montoInicial, setMontoInicial] = useState('0');
    const [montoCierre, setMontoCierre] = useState('0');
    const [descuento, setDescuento] = useState('0');
    const [montoPagado, setMontoPagado] = useState('0');
    const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [pedidosCaja, setPedidosCaja] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGuardando, setIsGuardando] = useState(false);
    const [isEnviandoTicket, setIsEnviandoTicket] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const ticketRef = useRef(null);

    useEffect(() => {
        inicializarCaja();
        cargarProductos();
    }, []);

    const inicializarCaja = async () => {
        setLoading(true);
        setMensaje('');
        try {
            const userResponse = await fetch(`${baseURL}/userLogued.php`, {
                credentials: 'include',
            });
            const userData = await userResponse.json();
            const idUsuario = Number(userData?.idUsuario) || 1;
            const nombreUsuario = userData?.nombre || 'Usuario';
            setUsuarioId(idUsuario);
            setUsuarioNombre(nombreUsuario);

            await cargarEstadoCaja(idUsuario);
            await cargarPedidosCaja(idUsuario);
        } catch (error) {
            console.error('Error al inicializar caja', error);
            await cargarEstadoCaja(1);
            await cargarPedidosCaja(1);
        } finally {
            setLoading(false);
        }
    };

    const cargarPedidosCaja = async (idUsuarioActual) => {
        try {
            const response = await fetch(`${baseURL}/pedidoCajaGet.php?idUsuario=${idUsuarioActual}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setPedidosCaja(data?.pedidosCaja || []);
        } catch (error) {
            console.error('Error al cargar pedidos de caja', error);
            setPedidosCaja([]);
        }
    };

    const cargarEstadoCaja = async (idUsuarioActual) => {
        const estadoResponse = await fetch(`${baseURL}/cajaEstadoGet.php?idUsuario=${idUsuarioActual}`, {
            credentials: 'include',
        });
        const estadoData = await estadoResponse.json();
        if (estadoData?.abierta && estadoData?.caja) {
            setCaja(estadoData.caja);
        } else {
            setCaja(null);
        }
    };

    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                setProductos(data.productos || []);
            })
            .catch((error) => {
                console.error('Error al cargar productos', error);
                setProductos([]);
            });
    };

    const productosFiltrados = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) {
            return [];
        }
        return productos
            .filter((producto) => producto.titulo?.toLowerCase().includes(term))
            .slice(0, 20);
    }, [busqueda, productos]);

    const subtotal = useMemo(() => {
        return carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
    }, [carrito]);

    const descuentoMonto = useMemo(() => {
        const value = Number(descuento || 0);
        return value > 0 ? value : 0;
    }, [descuento]);

    const total = useMemo(() => {
        const value = subtotal - descuentoMonto;
        return value > 0 ? value : 0;
    }, [subtotal, descuentoMonto]);

    const vuelto = useMemo(() => {
        const pagado = Number(montoPagado || 0);
        const value = pagado - total;
        return value >= 0 ? value : 0;
    }, [montoPagado, total]);

    const agregarProducto = (producto) => {
        setCarrito((prev) => {
            const existente = prev.find((item) => item.idProducto === producto.idProducto);
            if (existente) {
                return prev.map((item) =>
                    item.idProducto === producto.idProducto
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [
                ...prev,
                {
                    idProducto: producto.idProducto,
                    nombre: producto.titulo,
                    precio: Number(producto.precio) || 0,
                    stock: 999,
                    cantidad: 1,
                    imagen: producto.imagen1 || '',
                },
            ];
        });

        // Limpia el buscador para permitir ingresar el siguiente producto rápidamente.
        setBusqueda('');
    };

    const actualizarCantidad = (idProducto, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito((prev) => prev.filter((item) => item.idProducto !== idProducto));
            return;
        }

        setCarrito((prev) =>
            prev.map((item) =>
                item.idProducto === idProducto ? { ...item, cantidad: nuevaCantidad } : item
            )
        );
    };

    const eliminarProducto = (idProducto) => {
        setCarrito((prev) => prev.filter((item) => item.idProducto !== idProducto));
    };

    const abrirCaja = async () => {
        const monto = Number(montoInicial);
        if (Number.isNaN(monto) || monto < 0) {
            setMensaje('Ingresa un monto inicial valido.');
            return;
        }

        setIsGuardando(true);
        setMensaje('');
        try {
            const formData = new FormData();
            formData.append('idUsuario', usuarioId);
            formData.append('montoInicial', monto);

            const response = await fetch(`${baseURL}/cajaAbrirPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.error) {
                setMensaje(data.error);
            } else {
                setMensaje('Caja abierta correctamente.');
                await cargarEstadoCaja(usuarioId);
            }
        } catch (error) {
            console.error('Error al abrir caja', error);
            setMensaje('Error al abrir caja.');
        } finally {
            setIsGuardando(false);
        }
    };

    const cobrarVenta = async () => {
        if (!caja?.idCaja) {
            setMensaje('Primero debes abrir caja.');
            return;
        }
        if (carrito.length === 0) {
            setMensaje('Agrega al menos un producto para cobrar.');
            return;
        }
        if (total <= 0) {
            setMensaje('El total de la venta debe ser mayor a 0.');
            return;
        }

        setIsGuardando(true);
        setMensaje('');
        try {
            const carritoVenta = [...carrito];
            const subtotalVenta = subtotal;
            const descuentoVenta = descuentoMonto;
            const totalVenta = total;
            const montoPagadoVenta = Number(montoPagado || 0);
            const vueltoVenta = vuelto;

            const formData = new FormData();
            formData.append('idCaja', caja.idCaja);
            formData.append('monto', totalVenta.toFixed(2));
            formData.append('metodoPago', metodoPago);
            formData.append('referencia', 'Venta POS');
            formData.append('detalle', JSON.stringify(carritoVenta));

            const response = await fetch(`${baseURL}/cajaCobroPost.php`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.error) {
                setMensaje(data.error);
            } else {
                const pedidoCajaForm = new FormData();
                pedidoCajaForm.append('idCaja', caja.idCaja);
                pedidoCajaForm.append('idUsuario', usuarioId);
                pedidoCajaForm.append('estado', 'Generado');
                pedidoCajaForm.append('productos', JSON.stringify(carritoVenta));
                pedidoCajaForm.append('subtotal', subtotalVenta.toFixed(2));
                pedidoCajaForm.append('descuento', descuentoVenta.toFixed(2));
                pedidoCajaForm.append('total', totalVenta.toFixed(2));
                pedidoCajaForm.append('montoPagado', montoPagadoVenta.toFixed(2));
                pedidoCajaForm.append('vuelto', vueltoVenta.toFixed(2));
                pedidoCajaForm.append('metodoPago', metodoPago);
                pedidoCajaForm.append('telefonoCliente', limpiarNumeroWhatsapp(telefonoWhatsapp));

                const pedidoCajaResponse = await fetch(`${baseURL}/pedidoCajaPost.php`, {
                    method: 'POST',
                    body: pedidoCajaForm,
                });

                const pedidoCajaData = await pedidoCajaResponse.json();

                if (pedidoCajaData.error) {
                    setMensaje(`Venta cobrada, pero no se guardó pedido POS: ${pedidoCajaData.error}`);
                } else {
                    setMensaje('Venta cobrada y pedido de caja guardado.');
                }

                setMensaje('Venta cobrada y registrada en caja.');
                setCarrito([]);
                setDescuento('0');
                setMontoPagado('0');
                await cargarEstadoCaja(usuarioId);
                await cargarPedidosCaja(usuarioId);
            }
        } catch (error) {
            console.error('Error al cobrar', error);
            setMensaje('Error al registrar el cobro.');
        } finally {
            setIsGuardando(false);
        }
    };

    const cerrarCaja = async () => {
        const monto = Number(montoCierre);
        if (!caja?.idCaja) {
            setMensaje('No hay caja abierta para cerrar.');
            return;
        }
        if (Number.isNaN(monto) || monto < 0) {
            setMensaje('Ingresa un monto de cierre valido.');
            return;
        }

        setIsGuardando(true);
        setMensaje('');
        try {
            const formData = new FormData();
            formData.append('idCaja', caja.idCaja);
            formData.append('montoCierre', monto);

            const response = await fetch(`${baseURL}/cajaCerrarPost.php`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.error) {
                setMensaje(data.error);
            } else {
                const diferencia = Number(data?.resumen?.diferencia || 0);
                setMensaje(`Caja cerrada. Diferencia: ${formatearMoneda(diferencia)}`);
                setCaja(null);
                setCarrito([]);
                setDescuento('0');
                setMontoCierre('0');
            }
        } catch (error) {
            console.error('Error al cerrar caja', error);
            setMensaje('Error al cerrar la caja.');
        } finally {
            setIsGuardando(false);
        }
    };

    const formatearMoneda = (valor) => {
        return `${moneda} ${Number(valor).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const limpiarNumeroWhatsapp = (numero) => {
        return String(numero || '').replace(/\D/g, '');
    };

    const enviarTicketWhatsapp = async () => {
        const numeroLimpio = limpiarNumeroWhatsapp(telefonoWhatsapp);

        if (carrito.length === 0) {
            setMensaje('Agrega productos antes de generar el ticket.');
            return;
        }

        if (!numeroLimpio || numeroLimpio.length < 8) {
            setMensaje('Ingresa un número de WhatsApp válido. Ej: 573001112233');
            return;
        }

        if (!ticketRef.current) {
            setMensaje('No se pudo generar el ticket.');
            return;
        }

        setIsEnviandoTicket(true);
        setMensaje('');

        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
            });

            const blob = await new Promise((resolve) => {
                canvas.toBlob((fileBlob) => resolve(fileBlob), 'image/png');
            });

            if (!blob) {
                setMensaje('No se pudo crear la imagen del ticket.');
                return;
            }

            const file = new File([blob], `ticket-${Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Ticket de compra',
                    text: `Ticket de compra - Total: ${formatearMoneda(total)}`,
                    files: [file],
                });
                setMensaje('Ticket compartido correctamente.');
                return;
            }

            // Fallback: descargar imagen y abrir WhatsApp Web con mensaje.
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);

            const texto = encodeURIComponent(
                `Hola, te compartimos tu ticket. Total: ${formatearMoneda(total)}. Adjuntamos imagen del ticket.`
            );
            window.open(`https://wa.me/${numeroLimpio}?text=${texto}`, '_blank');
            setMensaje('Se descargó el ticket. Adjunta la imagen en WhatsApp.');
        } catch (error) {
            console.error('Error al enviar ticket por WhatsApp', error);
            setMensaje('No se pudo enviar el ticket por WhatsApp.');
        } finally {
            setIsEnviandoTicket(false);
        }
    };

    const actualizarEstadoPedidoCaja = async (idPedidoCaja, nuevoEstado) => {
        try {
            const response = await fetch(`${baseURL}/pedidoCajaPut.php?idPedidoCaja=${idPedidoCaja}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            const data = await response.json();
            if (data.error) {
                setMensaje(data.error);
                return;
            }

            setMensaje('Estado de pedido POS actualizado.');
            await cargarPedidosCaja(usuarioId);
        } catch (error) {
            console.error('Error al actualizar pedido POS', error);
            setMensaje('No se pudo actualizar el estado del pedido POS.');
        }
    };

    const eliminarPedidoCaja = async (idPedidoCaja) => {
        try {
            const response = await fetch(`${baseURL}/pedidoCajaDelete.php?idPedidoCaja=${idPedidoCaja}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.error) {
                setMensaje(data.error);
                return;
            }

            setMensaje('Pedido POS eliminado.');
            await cargarPedidosCaja(usuarioId);
        } catch (error) {
            console.error('Error al eliminar pedido POS', error);
            setMensaje('No se pudo eliminar el pedido POS.');
        }
    };

    const fechaApertura = caja?.fechaApertura
        ? new Date(caja.fechaApertura).toLocaleString('es-CO')
        : '';

    const montoEsperadoCaja = Number(caja?.montoEsperado || 0);

    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />

                <div className='container'>
                    <section className='cajas'>
                        {loading && <div className='cajas__loading'>Cargando caja...</div>}

                        {!loading && !caja && (
                            <article className='cajas__apertura'>
                                <h2>Apertura de Caja</h2>
                                <p>Ingresa el dinero base para iniciar el turno.</p>

                                <label htmlFor='montoInicial'>Monto inicial</label>
                                <input
                                    id='montoInicial'
                                    type='number'
                                    min='0'
                                    step='0.01'
                                    value={montoInicial}
                                    onChange={(e) => setMontoInicial(e.target.value)}
                                />

                                <button
                                    type='button'
                                    className='btn-principal'
                                    onClick={abrirCaja}
                                    disabled={isGuardando}
                                >
                                    {isGuardando ? 'Abriendo...' : 'Abrir turno'}
                                </button>
                            </article>
                        )}

                        {!loading && caja && (
                            <>
                                <aside className='cajas__detalle'>
                                    <h3>Detalles de Caja</h3>
                                    <p><strong>Cajero:</strong> {usuarioNombre}</p>
                                    <p><strong>Apertura:</strong> {fechaApertura}</p>
                                    <p><strong>Método:</strong> {metodoPago}</p>
                                    <p><strong>Inicial:</strong> {formatearMoneda(caja.montoInicial)}</p>
                                    <p><strong>Esperado:</strong> {formatearMoneda(montoEsperadoCaja)}</p>

                                    <div className='cajas__cerrar'>
                                        <label htmlFor='montoCierre'>Monto contado al cierre</label>
                                        <input
                                            id='montoCierre'
                                            type='number'
                                            min='0'
                                            step='0.01'
                                            value={montoCierre}
                                            onChange={(e) => setMontoCierre(e.target.value)}
                                        />
                                        <button
                                            type='button'
                                            className='btn-secundario'
                                            onClick={cerrarCaja}
                                            disabled={isGuardando}
                                        >
                                            Cerrar caja
                                        </button>
                                    </div>
                                </aside>

                                <article className='cajas__pos'>
                                    <div className='cajas__buscador'>
                                        <input
                                            type='text'
                                            placeholder='Buscar producto...'
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                        />
                                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                            <option value='efectivo'>Efectivo</option>
                                            <option value='transferencia'>Transferencia</option>
                                            <option value='tarjeta'>Tarjeta</option>
                                        </select>
                                    </div>

                                    <div className='cajas__sugerencias'>
                                        {!busqueda.trim() && (
                                            <p className='cajas__vacio'>Escribe en el buscador para mostrar productos.</p>
                                        )}

                                        {busqueda.trim() && productosFiltrados.length === 0 && (
                                            <p className='cajas__vacio'>No se encontraron productos.</p>
                                        )}

                                        {productosFiltrados.map((producto) => (
                                            <button
                                                type='button'
                                                key={producto.idProducto}
                                                className='cajas__sugerencia'
                                                onClick={() => agregarProducto(producto)}
                                            >
                                                <span>{producto.titulo}</span>
                                                <strong>{formatearMoneda(Number(producto.precio || 0))}</strong>
                                            </button>
                                        ))}
                                    </div>

                                    <div className='cajas__tabla'>
                                        <div className='cajas__tabla-header'>
                                            <span>Descripcion</span>
                                            <span>Cantidad</span>
                                            <span>Precio</span>
                                            <span>Total</span>
                                            <span>Accion</span>
                                        </div>

                                        {carrito.length === 0 && <p className='cajas__vacio'>No hay productos en la venta.</p>}

                                        {carrito.map((item) => (
                                            <div className='cajas__fila' key={item.idProducto}>
                                                <span>{item.nombre}</span>
                                                <div className='cajas__cantidad'>
                                                    <button type='button' onClick={() => actualizarCantidad(item.idProducto, item.cantidad - 1)}>-</button>
                                                    <input
                                                        type='number'
                                                        min='1'
                                                        value={item.cantidad}
                                                        onChange={(e) => actualizarCantidad(item.idProducto, Number(e.target.value))}
                                                    />
                                                    <button type='button' onClick={() => actualizarCantidad(item.idProducto, item.cantidad + 1)}>+</button>
                                                </div>
                                                <span>{formatearMoneda(item.precio)}</span>
                                                <span>{formatearMoneda(item.precio * item.cantidad)}</span>
                                                <button type='button' className='btn-eliminar' onClick={() => eliminarProducto(item.idProducto)}>X</button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='cajas__totales'>
                                        <div><span>Subtotal:</span><strong>{formatearMoneda(subtotal)}</strong></div>
                                        <div>
                                            <span>Descuento:</span>
                                            <input
                                                type='number'
                                                min='0'
                                                step='0.01'
                                                value={descuento}
                                                onChange={(e) => setDescuento(e.target.value)}
                                            />
                                        </div>
                                        <div className='total'><span>Total a pagar:</span><strong>{formatearMoneda(total)}</strong></div>
                                        <div>
                                            <span>Monto pagado:</span>
                                            <input
                                                type='number'
                                                min='0'
                                                step='0.01'
                                                value={montoPagado}
                                                onChange={(e) => setMontoPagado(e.target.value)}
                                                placeholder='0'
                                            />
                                        </div>
                                        <div className='vuelto'><span>Vuelto:</span><strong>{formatearMoneda(vuelto)}</strong></div>
                                    </div>

                                    <div className='cajas__ticket-wrap'>
                                        <div className='cajas__ticket' ref={ticketRef}>
                                            <h4>Ticket</h4>
                                            <p>Cajero: {usuarioNombre}</p>
                                            <p>Fecha: {new Date().toLocaleString('es-CO')}</p>
                                            <hr />
                                            {carrito.map((item) => (
                                                <div className='cajas__ticket-linea' key={`ticket-${item.idProducto}`}>
                                                    <span>{item.nombre} x{item.cantidad}</span>
                                                    <strong>{formatearMoneda(item.precio * item.cantidad)}</strong>
                                                </div>
                                            ))}
                                            <hr />
                                            <div className='cajas__ticket-linea'>
                                                <span>Subtotal</span>
                                                <strong>{formatearMoneda(subtotal)}</strong>
                                            </div>
                                            <div className='cajas__ticket-linea'>
                                                <span>Descuento</span>
                                                <strong>{formatearMoneda(descuentoMonto)}</strong>
                                            </div>
                                            <div className='cajas__ticket-linea cajas__ticket-total'>
                                                <span>Total</span>
                                                <strong>{formatearMoneda(total)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='cajas__whatsapp'>
                                        <input
                                            type='text'
                                            placeholder='Numero WhatsApp. Ej: 573001112233'
                                            value={telefonoWhatsapp}
                                            onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                                        />
                                        <button
                                            type='button'
                                            className='btn-ticket'
                                            onClick={enviarTicketWhatsapp}
                                            disabled={isEnviandoTicket}
                                        >
                                            {isEnviandoTicket ? 'Generando ticket...' : 'Ticket por WhatsApp'}
                                        </button>
                                    </div>

                                    <div className='cajas__acciones'>
                                        <button
                                            type='button'
                                            className='btn-cancelar'
                                            onClick={() => {
                                                setCarrito([]);
                                                setDescuento('0');
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type='button'
                                            className='btn-cobrar'
                                            onClick={cobrarVenta}
                                            disabled={isGuardando}
                                        >
                                            {isGuardando ? 'Guardando...' : 'Cobrar'}
                                        </button>
                                    </div>
                                </article>

                                <article className='cajas__pedidos'>
                                    <h3>Pedidos POS (Caja)</h3>

                                    {pedidosCaja.length === 0 && (
                                        <p className='cajas__vacio'>No hay pedidos POS registrados.</p>
                                    )}

                                    {pedidosCaja.length > 0 && (
                                        <div className='cajas__pedidos-tabla'>
                                            <div className='cajas__pedidos-header'>
                                                <span>ID</span>
                                                <span>Total</span>
                                                <span>Pago</span>
                                                <span>Estado</span>
                                                <span>Fecha</span>
                                                <span>Acciones</span>
                                            </div>

                                            {pedidosCaja.map((pedido) => (
                                                <div className='cajas__pedidos-fila' key={pedido.idPedidoCaja}>
                                                    <span>#{pedido.idPedidoCaja}</span>
                                                    <strong>{formatearMoneda(pedido.total)}</strong>
                                                    <span>{pedido.metodoPago || '-'}</span>
                                                    <select
                                                        value={pedido.estado}
                                                        onChange={(e) => actualizarEstadoPedidoCaja(pedido.idPedidoCaja, e.target.value)}
                                                    >
                                                        <option value='Generado'>Generado</option>
                                                        <option value='Enviado'>Enviado</option>
                                                        <option value='Entregado'>Entregado</option>
                                                        <option value='Cancelado'>Cancelado</option>
                                                    </select>
                                                    <span>{new Date(pedido.createdAt).toLocaleString('es-CO')}</span>
                                                    <button
                                                        type='button'
                                                        className='btn-eliminar-pedido'
                                                        onClick={() => eliminarPedidoCaja(pedido.idPedidoCaja)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            </>
                        )}

                        {mensaje && <p className='cajas__mensaje'>{mensaje}</p>}
                    </section>
                </div>
            </section>
        </div>
    );
}