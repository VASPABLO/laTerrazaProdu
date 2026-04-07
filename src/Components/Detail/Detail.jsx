import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import './Detail.css'
import Modal from 'react-responsive-modal';
import ModalCart from 'react-modal';
import 'react-responsive-modal/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faExternalLinkAlt, faStar, faTrash, faHeart } from '@fortawesome/free-solid-svg-icons';
import whatsappIcon from '../../images/wpp.png';
import { Link as Anchor, useNavigate, useLocation } from "react-router-dom";
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import baseURL from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DetailLoading from "../DetailLoading/DetailLoading";
import moneda from '../moneda';

export default function Detail() {
    const navigate = useNavigate();
    const swiperRef = useRef(null);
    SwiperCore.use([Navigation, Pagination, Autoplay]);
    const { idProducto } = useParams();
    const [producto, setProducto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contactos, setContactos] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const items = [producto?.item1, producto?.item2, producto?.item3, producto?.item4, producto?.item5, producto?.item6, producto?.item7, producto?.item8, producto?.item9, producto?.item10];
    const [categorias, setCategorias] = useState([]);
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
    const location = useLocation();
    const itemsDisponibles = useMemo(() => {
        return items.filter((item) => `${item ?? ''}`.trim() !== '');
    }, [
        producto?.item1,
        producto?.item2,
        producto?.item3,
        producto?.item4,
        producto?.item5,
        producto?.item6,
        producto?.item7,
        producto?.item8,
        producto?.item9,
        producto?.item10,
    ]);
    const selectedItem = selectedItemIndex >= 0 ? items[selectedItemIndex] : '';

    useEffect(() => {
        cargarProductos();
        cargarContacto();
        cargarFavoritos();
        cargarCategoria()
    }, []);

    useEffect(() => {
        const indexInicial = items.findIndex((item) => `${item ?? ''}`.trim() !== '');
        setSelectedItemIndex(indexInicial >= 0 ? indexInicial : -1);
    }, [
        producto?.item1,
        producto?.item2,
        producto?.item3,
        producto?.item4,
        producto?.item5,
        producto?.item6,
        producto?.item7,
        producto?.item8,
        producto?.item9,
        producto?.item10,
    ]);
    const handleSelectionChange = (index) => {
        setSelectedItemIndex(index);
    };
    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const cargarContacto = () => {
        fetch(`${baseURL}/contactoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setContactos(data.contacto.reverse()[0] || []);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
                console.log(data.productos)
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error)
                setLoading(true);
            });
    };


    const cargarFavoritos = () => {
        const storedFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setFavoritos(storedFavoritos);
    };

    useEffect(() => {
        const product = productos.find((e) => e.idProducto === parseInt(idProducto));
        setProducto(product);
    }, [idProducto, productos]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);




    function handleCompartirClick() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Echa un vistazo a este producto',
                url: window.location.href,
            })
                .then(() => console.log('Contenido compartido correctamente'))
                .catch((error) => console.error('Error al compartir:', error));
        } else {
            console.error('La API de compartir no está disponible en este navegador.');
        }
    }

    const handleWhatsappMessage = () => {
        const phoneNumber = contactos?.telefono;
        const title = encodeURIComponent(producto?.titulo?.replace(/\s+/g, '-'));
        const formattedPrice = Number(producto?.precio).toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const item = selectedItem;
        const detalleItem = item ? `\n     ${item}` : '';

        const message = `Hola 🌟, quisiera más información sobre\n\n✅ *${title}*${detalleItem}\n     ${moneda} ${formattedPrice}`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    };

    const goBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/');
        }
    };




    const addToCart = (selectedItemValue) => {
        if (producto) {
            if (producto.stock < 1) {
                toast.error('No hay stock', { autoClose: 400 });
                return;
            }
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItemIndex = cart.findIndex(item =>
                item.idProducto === producto.idProducto
            );
            if (existingItemIndex !== -1) {
                const existingItem = cart[existingItemIndex];
                const updatedSabores = selectedItemValue
                    ? [...(existingItem.item || []), selectedItemValue]
                    : [...(existingItem.item || [])];
                const updatedCantidad = existingItem.cantidad + cantidad;
                cart[existingItemIndex] = { ...existingItem, item: updatedSabores, cantidad: updatedCantidad };
            } else {
                cart.push({ idProducto: producto.idProducto, item: selectedItemValue ? [selectedItemValue] : [], cantidad });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            cargarProductos();
            toast.success('Producto agregado', { autoClose: 400 });
            setTimeout(() => {
                window.location.reload();

            }, 600);
        }
    };

    const incrementCantidad = () => {
        setCantidad(cantidad + 1);
    };

    const decrementCantidad = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };


    const agregarAFavoritos = (idProducto) => {
        const favList = [...favoritos];
        const index = favList.indexOf(idProducto);
        if (index === -1) {
            // Si el producto no está en favoritos, lo agregamos
            favList.push(idProducto);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
            console.log('Producto agregado a favoritos');

        } else {
            // Si el producto está en favoritos, lo eliminamos
            favList.splice(index, 1);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
            console.log('Producto eliminado de favoritos');
        }
    };



    if (!producto) {
        return <DetailLoading />;
    }


    return (


        <div className="detail">

            <ToastContainer />
            <div className="deFlexDetail">
                <button className="back" onClick={goBack} title="Volver">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span className="back-label">Volver</span>
                </button>

                <div className="deFLexIcon">
                    <button
                        onClick={() => agregarAFavoritos(producto.idProducto)}
                        className={`action-btn favoritos-btn ${favoritos.includes(producto.idProducto) ? 'favorito-activo' : ''}`}
                        title={favoritos.includes(producto.idProducto) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                        <FontAwesomeIcon icon={faHeart} />
                        <span className="btn-tooltip">{favoritos.includes(producto.idProducto) ? 'Guardado' : 'Favorito'}</span>
                    </button>
                    <button className="action-btn share-btn" onClick={handleCompartirClick} title="Compartir">
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        <span className="btn-tooltip">Compartir</span>
                    </button>
                </div>
            </div>
            <div className="detail-contain">
                <SwiperSlide id={"swiperDetail"} >
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        loop={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
                        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                        autoplay={{ delay: 3000 }} // Cambia el valor de 'delay' según tus preferencias
                        pagination={{ clickable: true, }}
                        onSwiper={(swiper) => {
                            console.log(swiper);
                            swiperRef.current = swiper;
                        }}

                    >

                        {
                            producto.imagen1 ?
                                (
                                    <SwiperSlide  >
                                        <img
                                            src={producto.imagen1}
                                            alt={producto.titulo}
                                            className="imagen1"
                                            onClick={() => {
                                                setModalImage(producto.imagen1);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </SwiperSlide>
                                ) : (
                                    <>
                                    </>
                                )
                        }

                        {
                            producto.imagen2 ?
                                (
                                    <SwiperSlide  >
                                        <img
                                            src={producto.imagen2}
                                            alt={producto.titulo}
                                            className="imagen2"
                                            onClick={() => {
                                                setModalImage(producto.imagen2);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </SwiperSlide>
                                ) : (
                                    <>
                                    </>
                                )
                        }
                        {
                            producto.imagen3 ?
                                (
                                    <SwiperSlide  >
                                        <img
                                            src={producto.imagen3}
                                            alt={producto.titulo}
                                            className="img"
                                            onClick={() => {
                                                setModalImage(producto.imagen3);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </SwiperSlide>
                                ) : (
                                    <>
                                    </>
                                )
                        }
                        {
                            producto.imagen4 ?
                                (
                                    <SwiperSlide  >
                                        <img
                                            src={producto.imagen4}
                                            alt={producto.titulo}
                                            className="imagen4"
                                            onClick={() => {
                                                setModalImage(producto.imagen4);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </SwiperSlide>
                                ) : (
                                    <>
                                    </>
                                )
                        }
                    </Swiper>
                </SwiperSlide>
                <div className="textDetail">
                    <h2 className="title">{producto.titulo}</h2>
                    <hr />
                    <div className="deFLexBuet">
                        {
                            categorias
                                .filter(categoriaFiltrada => categoriaFiltrada.idCategoria === producto.idCategoria)
                                .map(categoriaFiltrada => (
                                    <h4>  <FontAwesomeIcon icon={faStar} />{categoriaFiltrada.categoria}</h4>

                                ))
                        }
                        {producto.stock >= 1 ? (
                            <h4 style={{ color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.12)', padding: '2px 12px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 }}>Stock {producto.stock}</h4>
                        ) : (
                            <h4 style={{ color: '#f87171', backgroundColor: 'rgba(248,113,113,0.12)', padding: '2px 12px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 }}>Disponible</h4>
                        )}
                    </div>

                    <div className='deFLexPrice'>
                        <h5 className="price">
                            {moneda} {producto?.precio}

                        </h5>

                        {
                            (producto?.precioAnterior >= 1 && producto?.precioAnterior !== undefined) && (
                                <h5 className='precioTachadoDetail'>{moneda} {producto?.precioAnterior}</h5>
                            )
                        }


                    </div>
                    {/* <p>{producto.descripcion}</p> */}
                    {producto && itemsDisponibles.length > 0 && (
                        <details className='variablesAccordion' open>
                            <summary>Variables</summary>

                            <div className='itemsDetail'>
                                {items.map((item, index) => (
                                    item && (
                                        <label key={index} className={`itemChip ${selectedItemIndex === index ? 'is-active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="variable"
                                                value={item}
                                                checked={selectedItemIndex === index}
                                                onChange={() => handleSelectionChange(index)}
                                            />
                                            {item}
                                        </label>
                                    )
                                ))}
                            </div>
                        </details>
                    )}


                    <div className='deFlexCart'>
                        <button onClick={decrementCantidad} style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f0', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.1rem', minWidth: 32, textAlign: 'center' }}>{cantidad}</span>
                        <button onClick={incrementCantidad} style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f0', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <div className='deFlexGoTocart'>
                        <button onClick={() => addToCart(selectedItem)} className='btnAdd'>Agregar  <FontAwesomeIcon icon={faShoppingCart} />  </button>
                        <button className="wpp" onClick={handleWhatsappMessage}>
                            WhatsApp
                            <img src={whatsappIcon} alt="whatsappIcon" />
                        </button>
                    </div>
                </div>
            </div>
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                center
                classNames={{
                    modal: 'custom-modal',
                }}
            >
                <img src={modalImage} alt={producto.titulo} />
            </Modal>
        </div>

    )
}





