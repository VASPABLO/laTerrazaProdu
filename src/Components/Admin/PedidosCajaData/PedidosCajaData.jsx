import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faArrowDown, faArrowUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import baseURL from '../../url';
import moneda from '../../moneda';
import './PedidosCajaData.css';

export default function PedidosCajaData() {
    const [pedidos, setPedidos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [filtroDesde, setFiltroDesde] = useState('');
    const [filtroHasta, setFiltroHasta] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoCajaGet.php`)
            .then(r => r.json())
            .then(data => setPedidos(data.pedidosCaja || []))
            .catch(err => console.error('Error al cargar pedidos POS:', err));
    };

    const abrirModal = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado(pedido.estado);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setPedidoSeleccionado(null);
    };

    const actualizarEstado = () => {
        if (!pedidoSeleccionado) return;
        fetch(`${baseURL}/pedidoCajaPut.php?idPedidoCaja=${pedidoSeleccionado.idPedidoCaja}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.success('Estado actualizado');
                    cargarPedidos();
                    cerrarModal();
                }
            })
            .catch(() => toast.error('Error al actualizar estado'));
    };

    const eliminar = (idPedidoCaja) => {
        Swal.fire({
            title: '¿Eliminar pedido POS?',
            text: 'Esta acción no se puede revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/pedidoCajaDelete.php?idPedidoCaja=${idPedidoCaja}`, {
                    method: 'DELETE',
                })
                    .then(r => r.json())
                    .then(data => {
                        if (data.error) {
                            toast.error(data.error);
                        } else {
                            Swal.fire('Eliminado', 'Pedido POS eliminado.', 'success');
                            cargarPedidos();
                        }
                    })
                    .catch(() => toast.error('Error al eliminar'));
            }
        });
    };

    const formatearMoneda = (valor) =>
        `${moneda} ${Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

    const filtrados = pedidos.filter(item => {
        const estadoOk = !filtroEstado || item.estado === filtroEstado;
        const metodoOk = !filtroMetodo || item.metodoPago === filtroMetodo;
        const desdeOk = !filtroDesde || new Date(item.createdAt) >= new Date(filtroDesde);
        const hastaAdj = filtroHasta ? new Date(new Date(filtroHasta).setDate(new Date(filtroHasta).getDate() + 1)) : null;
        const hastaOk = !hastaAdj || new Date(item.createdAt) < hastaAdj;
        return estadoOk && metodoOk && desdeOk && hastaOk;
    });

    const lista = ordenInvertido ? [...filtrados].reverse() : filtrados;

    const totalGeneral = filtrados.reduce((acc, p) => acc + Number(p.total || 0), 0);

    return (
        <div>
            <ToastContainer />

            <div className='deFlexContent'>
                <div className='filtrosContain'>
                    <div className='inputsColumn'>
                        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
                    </div>
                    <div className='inputsColumn'>
                        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
                    </div>
                    <div className='inputsColumn'>
                        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                            <option value=''>Estado</option>
                            <option value='Generado'>Generado</option>
                            <option value='Enviado'>Enviado</option>
                            <option value='Entregado'>Entregado</option>
                            <option value='Cancelado'>Cancelado</option>
                        </select>
                    </div>
                    <div className='inputsColumn'>
                        <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}>
                            <option value=''>Método pago</option>
                            <option value='efectivo'>Efectivo</option>
                            <option value='transferencia'>Transferencia</option>
                            <option value='tarjeta'>Tarjeta</option>
                        </select>
                    </div>
                    <button className='reload' onClick={cargarPedidos}><FontAwesomeIcon icon={faSync} /></button>
                    <button className='reverse' onClick={() => setOrdenInvertido(!ordenInvertido)}>
                        {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </button>
                </div>
            </div>

            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cajero ID</th>
                            <th>Estado</th>
                            <th>Método</th>
                            <th>Subtotal</th>
                            <th>Descuento</th>
                            <th>Total</th>
                            <th>Pagado</th>
                            <th>Vuelto</th>
                            <th>Teléfono</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.length === 0 && (
                            <tr><td colSpan='12' style={{ textAlign: 'center', padding: '1rem' }}>No hay pedidos POS registrados.</td></tr>
                        )}
                        {lista.map(item => (
                            <tr key={item.idPedidoCaja}>
                                <td>#{item.idPedidoCaja}</td>
                                <td>{item.idUsuario}</td>
                                <td style={{
                                    fontWeight: 'bold',
                                    color: item.estado === 'Entregado' ? '#008000'
                                        : item.estado === 'Cancelado' ? '#d33'
                                        : item.estado === 'Enviado' ? '#0000FF'
                                        : '#DAA520'
                                }}>
                                    {item.estado}
                                </td>
                                <td>{item.metodoPago || '-'}</td>
                                <td>{formatearMoneda(item.subtotal)}</td>
                                <td>{formatearMoneda(item.descuento)}</td>
                                <td style={{ color: '#008000', fontWeight: 'bold' }}>{formatearMoneda(item.total)}</td>
                                <td>{formatearMoneda(item.montoPagado)}</td>
                                <td>{formatearMoneda(item.vuelto)}</td>
                                <td>{item.telefonoCliente || '-'}</td>
                                <td>{item.createdAt}</td>
                                <td>
                                    <button className='editar' onClick={() => abrirModal(item)}>
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button className='eliminar' onClick={() => eliminar(item.idPedidoCaja)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {lista.length > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan='6' style={{ textAlign: 'right', fontWeight: 'bold' }}>Total general:</td>
                                <td style={{ color: '#008000', fontWeight: 'bold' }}>{formatearMoneda(totalGeneral)}</td>
                                <td colSpan='5'></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {modalVisible && pedidoSeleccionado && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <h3>Pedido POS #{pedidoSeleccionado.idPedidoCaja}</h3>
                            <span className='close' onClick={cerrarModal}>&times;</span>
                        </div>

                        <div className='flexGrap'>
                            <fieldset>
                                <legend>Estado</legend>
                                <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                                    <option value='Generado'>Generado</option>
                                    <option value='Enviado'>Enviado</option>
                                    <option value='Entregado'>Entregado</option>
                                    <option value='Cancelado'>Cancelado</option>
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Total</legend>
                                <input value={formatearMoneda(pedidoSeleccionado.total)} disabled />
                            </fieldset>
                            <fieldset>
                                <legend>Método de pago</legend>
                                <input value={pedidoSeleccionado.metodoPago || '-'} disabled />
                            </fieldset>
                            <fieldset>
                                <legend>Teléfono cliente</legend>
                                <input value={pedidoSeleccionado.telefonoCliente || '-'} disabled />
                            </fieldset>
                            <fieldset>
                                <legend>Fecha</legend>
                                <input value={pedidoSeleccionado.createdAt} disabled />
                            </fieldset>
                        </div>

                        <div className='pcaja__productos'>
                            <h4>Productos</h4>
                            {(() => {
                                try {
                                    const prods = JSON.parse(pedidoSeleccionado.productos || '[]');
                                    return prods.map((p, i) => (
                                        <div key={i} className='pcaja__producto-fila'>
                                            <span>{p.nombre || p.titulo}</span>
                                            <span>x{p.cantidad}</span>
                                            <span>{formatearMoneda(p.precio * p.cantidad)}</span>
                                        </div>
                                    ));
                                } catch {
                                    return <p>No se pudo leer los productos.</p>;
                                }
                            })()}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className='btn-principal' onClick={actualizarEstado}>Guardar estado</button>
                            <button className='btn-secundario' onClick={cerrarModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
