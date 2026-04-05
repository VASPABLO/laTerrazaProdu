import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import baseURL from '../url';
import moneda from '../moneda';
import './Products.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProductosLoading from '../ProductosLoading/ProductosLoading';
import { Link } from 'react-router-dom';

export default function Products() {
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todo');
    const categoriasInputRef = useRef(null);

    const slugify = (text = '') =>
        text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

    const obtenerImagen = useCallback((item) => {
        return item?.imagen1 || item?.imagen2 || item?.imagen3 || item?.imagen4 || '';
    }, []);

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const [productosRes, categoriasRes] = await Promise.all([
                fetch(`${baseURL}/productosGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' }),
            ]);

            if (!productosRes.ok || !categoriasRes.ok) {
                throw new Error('No se pudo obtener la información del servidor');
            }

            const productosData = await productosRes.json();
            const categoriasData = await categoriasRes.json();

            setProductos(Array.isArray(productosData?.productos) ? productosData.productos : []);
            setCategorias(Array.isArray(categoriasData?.categorias) ? categoriasData.categorias : []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError(true);
            toast.error('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const categoriasConProductos = useMemo(() => {
        return categorias.filter((categoria) =>
            productos.some(
                (producto) => String(producto?.idCategoria) === String(categoria?.idCategoria)
            )
        );
    }, [categorias, productos]);

    const productosMasVendidos = useMemo(() => {
        return productos.filter((item) => item?.masVendido === 'si');
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        if (categoriaSeleccionada === 'Todo') return [];
        return productos.filter(
            (item) => String(item?.idCategoria) === String(categoriaSeleccionada)
        );
    }, [productos, categoriaSeleccionada]);

    const formatearPrecioAnteriorVisible = (precioAnterior) => {
        return Number(precioAnterior) >= 1;
    };

    const ProductCard = ({ item, masVendido = false, compact = false }) => {
        const imagen = obtenerImagen(item);

        return (
            <Link
                className={`productCard ${masVendido ? 'productCardFeatured' : ''} ${compact ? 'productCardCompact' : ''}`}
                to={`/producto/${item.idProducto}/${slugify(item.titulo)}`}
            >
                <div className="productCardImageWrap">
                    <img
                        src={imagen}
                        alt={item?.titulo || 'Producto'}
                        className="productCardImage"
                        loading="lazy"
                        decoding="async"
                    />
                    {masVendido && <span className="productBadge">Destacado</span>}
                </div>

                <div className="productCardBody">
                    <div className="productCardTop">
                        <div className="productCardTitleBlock">
                            <h4 className="productCardTitle">{item?.titulo}</h4>
                            <p className="productCardDescription">{item?.descripcion}</p>
                        </div>

                        <div className="productCardPriceBlock">
                            <span className="productPrice">{moneda} {item?.precio}</span>
                            {formatearPrecioAnteriorVisible(item?.precioAnterior) && (
                                <span className="productOldPrice">{moneda} {item?.precioAnterior}</span>
                            )}
                        </div>
                    </div>

                    <div className="productCardFooter">
                        <span className="productCardAction">Ver detalles</span>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <section className="ProductsContain" aria-label="Listado de productos">
            <ToastContainer position="top-right" autoClose={2500} />

            <div className="productsShell">
                <div className="productsHero">
                    <div className="productsHeroBadge">Menú del restaurante</div>
                    <h2>Nuestro menú</h2>
                    <p className="productsHeroText">
                        Descubre nuestros platos, bebidas y especialidades en un espacio visual más claro,
                        moderno y fácil de recorrer.
                    </p>
                </div>

                {!loading && !error && productos.length > 0 && (
                    <div className="categoriasInputs" ref={categoriasInputRef}>
                        <button
                            type="button"
                            className={`categoryChip ${categoriaSeleccionada === 'Todo' ? 'active' : ''}`}
                            onClick={() => setCategoriaSeleccionada('Todo')}
                        >
                            Todo
                        </button>

                        {categoriasConProductos.map(({ categoria, idCategoria }) => (
                            <button
                                key={idCategoria}
                                type="button"
                                className={`categoryChip ${
                                    String(categoriaSeleccionada) === String(idCategoria) ? 'active' : ''
                                }`}
                                onClick={() => setCategoriaSeleccionada(idCategoria)}
                            >
                                {categoria}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <ProductosLoading />
                ) : error ? (
                    <div className="productsStatus productsError">
                        <div className="statusIcon">⚠</div>
                        <p>No se pudieron cargar los productos.</p>
                        <button type="button" className="retryBtn" onClick={cargarDatos}>
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="Products">
                        {categoriaSeleccionada === 'Todo' && (
                            <>
                                {categoriasConProductos.map(({ categoria, idCategoria }) => {
                                    const productosCategoria = productos.filter(
                                        (item) => String(item?.idCategoria) === String(idCategoria)
                                    );

                                    if (!productosCategoria.length) return null;

                                    return (
                                        <div key={idCategoria} className="categoriSection">
                                            <div className="deFlexTitlesection">
                                                <div className="sectionHeading">
                                                    <h3>{categoria}</h3>
                                                    <p className="sectionSubtitle">
                                                        Explora las opciones disponibles en esta categoría.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="seeMoreBtn"
                                                    onClick={() => setCategoriaSeleccionada(idCategoria)}
                                                >
                                                    Ver todo →
                                                </button>
                                            </div>

                                            <Swiper
                                                modules={[Navigation, Pagination, A11y]}
                                                spaceBetween={16}
                                                slidesPerView={1.15}
                                                navigation
                                                breakpoints={{
                                                    480: { slidesPerView: 1.3 },
                                                    640: { slidesPerView: 2.1 },
                                                    900: { slidesPerView: 3 },
                                                    1200: { slidesPerView: 4 },
                                                }}
                                                className="productsSwiper"
                                            >
                                                {productosCategoria.map((item) => (
                                                    <SwiperSlide key={item.idProducto}>
                                                        <ProductCard item={item} />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {categoriaSeleccionada !== 'Todo' && (
                            <div className="selectedCategoryBlock">
                                <div className="selectedCategoryHeader">
                                    <div>
                                        <h3 className="selectedCategoryTitle">
                                            {
                                                categoriasConProductos.find(
                                                    (cat) => String(cat.idCategoria) === String(categoriaSeleccionada)
                                                )?.categoria || 'Categoría'
                                            }
                                        </h3>
                                        <p className="sectionSubtitle">
                                            Visualiza todos los productos disponibles en esta sección.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="seeMoreBtn"
                                        onClick={() => setCategoriaSeleccionada('Todo')}
                                    >
                                        Volver al menú →
                                    </button>
                                </div>

                                <div className="categoriSectionSelected">
                                    {productosFiltrados.length > 0 ? (
                                        productosFiltrados.map((item) => (
                                            <ProductCard key={item.idProducto} item={item} compact />
                                        ))
                                    ) : (
                                        <div className="productsStatus productsEmpty">
                                            <div className="statusIcon">🍽</div>
                                            <p>No hay productos en esta categoría.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}