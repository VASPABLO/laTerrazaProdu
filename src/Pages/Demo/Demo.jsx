import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@react-hook/media-query';
import baseURL from '../../Components/url';
import moneda from '../../Components/moneda';
import Products from '../../Components/Products/Products';
import './Demo.css';
import Footer from '../../Components/Footer/Footer';
import BtnWhatsapp from '../../Components/BtnWhatsapp/BtnWhatsapp';
import Cart from '../../Components/Cart/Cart';
import MobileBottomNav from '../../Components/MobileBottomNav/MobileBottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';

export default function Demo() {
    const [banners, setBanners] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [contacto, setContacto] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const isMobileNav = useMediaQuery('(max-width: 767px)');
    const location = useLocation();

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

    const cargarHome = useCallback(async () => {
        try {
            setLoading(true);
            const [bannersRes, productosRes, categoriasRes, contactoRes] = await Promise.all([
                fetch(`${baseURL}/bannersGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/productosGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/contactoGet.php`, { method: 'GET' }),
            ]);

            const bannersData = bannersRes.ok ? await bannersRes.json() : {};
            const productosData = productosRes.ok ? await productosRes.json() : {};
            const categoriasData = categoriasRes.ok ? await categoriasRes.json() : {};
            const contactoData = contactoRes.ok ? await contactoRes.json() : {};

            setBanners(Array.isArray(bannersData?.banner) ? bannersData.banner : []);
            setProductos(Array.isArray(productosData?.productos) ? productosData.productos : []);
            setCategorias(Array.isArray(categoriasData?.categorias) ? categoriasData.categorias : []);

            const contactoActual = Array.isArray(contactoData?.contacto)
                ? [...contactoData.contacto].reverse()[0]
                : {};
            setContacto(contactoActual || {});
        } catch (error) {
            console.error('Error al cargar Home:', error);
            setBanners([]);
            setProductos([]);
            setCategorias([]);
            setContacto({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarHome();
    }, [cargarHome]);

    useEffect(() => {
        if (location.hash !== '#menu-principal') {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            const catalogSection = document.getElementById('menu-principal');

            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 120);

        return () => window.clearTimeout(timeoutId);
    }, [location.hash, loading]);

    const productosDestacados = useMemo(() => {
        const destacados = productos.filter((p) => p?.masVendido === 'si');
        return (destacados.length ? destacados : productos).slice(0, 4);
    }, [productos]);

    const categoriasActivas = useMemo(() => {
        return categorias
            .filter((categoria) =>
                productos.some(
                    (producto) => String(producto?.idCategoria) === String(categoria?.idCategoria)
                )
            )
            .slice(0, 5);
    }, [categorias, productos]);


    // Slider de banners para el hero
    const [bannerIndex, setBannerIndex] = useState(0);
    const bannerInterval = useRef(null);

    useEffect(() => {
        if (banners.length > 1) {
            bannerInterval.current = setInterval(() => {
                setBannerIndex((prev) => (prev + 1) % banners.length);
            }, 4000);
            return () => clearInterval(bannerInterval.current);
        }
    }, [banners]);

    const handlePrevBanner = () => {
        setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };
    const handleNextBanner = () => {
        setBannerIndex((prev) => (prev + 1) % banners.length);
    };

    const obtenerImagenCategoria = useCallback(
        (idCategoria) => {
            const producto = productos.find(
                (item) => String(item?.idCategoria) === String(idCategoria) && obtenerImagen(item)
            );
            return obtenerImagen(producto);
        },
        [productos, obtenerImagen]
    );

    return (
        <section className="demo" style={isMobileNav ? { paddingBottom: '88px' } : undefined}>
            <section className="homeHero">
                {banners.length > 0 ? (
                    <div className="homeHeroSlider">
                        <button className="heroArrow heroArrowLeft" onClick={handlePrevBanner} aria-label="Anterior" style={{zIndex:2}}>&lt;</button>
                        <img
                            src={banners[bannerIndex]?.imagen}
                            alt={banners[bannerIndex]?.alt || 'Banner'}
                            className="homeHeroImage"
                            style={{transition:'opacity 0.5s'}}
                        />
                        <button className="heroArrow heroArrowRight" onClick={handleNextBanner} aria-label="Siguiente" style={{zIndex:2}}>&gt;</button>
                        <div className="homeHeroDots">
                            {banners.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={idx === bannerIndex ? 'dot active' : 'dot'}
                                    onClick={() => setBannerIndex(idx)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="homeHeroImage homeHeroFallback" />
                )}
                <div className="homeHeroOverlay" />

                <div className="homeHeroContent">
                    <h1>
                        La <span>Terraza</span>
                    </h1>
                    <p>
                        Cortes premium, hamburguesas artesanales y una experiencia pensada para
                        compartir buenos momentos.
                    </p>
                    <a href="#menu-principal" className="homeHeroCta">
                        Ver menu completo
                    </a>
                </div>
            </section>

            {/*
            <section className="homeSpecialties">
                <div className="homeSectionHead">
                    <h2>Nuestras Especialidades</h2>
                    <p>
                        Explora nuestra variedad de opciones preparadas al momento con ingredientes
                        frescos.
                    </p>
                </div>

                {loading ? (
                    <div className="homeSpecialtiesSkeleton" />
                ) : (
                    <div className="homeBentoGrid">
                        {categoriasActivas.map((category, index) => {
                            const isLarge = index === 0;
                            const image = obtenerImagenCategoria(category?.idCategoria);
                            return (
                                <a
                                    key={category?.idCategoria}
                                    href="#menu-principal"
                                    className={`homeBentoItem ${isLarge ? 'homeBentoItemLarge' : ''}`}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={category?.categoria || 'Categoria'}
                                            className="homeBentoImage"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="homeBentoImage homeHeroFallback" />
                                    )}
                                    <div className="homeBentoOverlay" />
                                    <div className="homeBentoText">
                                        <h3>{category?.categoria}</h3>
                                        <span>Explorar</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </section>
            */}

            <section className="homeFeatured">
                <div className="homeFeaturedHead">
                    <div>
                        <h2>Nuestras Recomendaciones</h2>
                        <p>Los platos favoritos de nuestros clientes, listos para ti.</p>
                    </div>
                    <a href="#menu-principal" className="homeSeeAll">
                        Ver todo el menu
                    </a>
                </div>

                <div className="homeFeaturedGrid">
                    {productosDestacados.map((item) => (
                        <Link
                            key={item?.idProducto}
                            className="homeFeaturedCard"
                            to={`/producto/${item?.idProducto}/${slugify(item?.titulo)}`}
                        >
                            <div className="homeFeaturedImageWrap">
                                <img
                                    src={obtenerImagen(item)}
                                    alt={item?.titulo || 'Producto'}
                                    className="homeFeaturedImage"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span className="homeFeaturedBadge">Destacado</span>
                            </div>
                            {/* ... */}
                            <div className="homeFeaturedBody">
                                <div className="homeFeaturedTitleRow">
                                    <h4>{item?.titulo}</h4>
                                    <span>{moneda} {item?.precio}</span>
                                </div>
                                {/* <p>{item?.descripcion}</p> */}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="homeInfo">
                <div className="homeInfoGrid">
                    <article className="homeInfoCard">
                        <div className="homeInfoIconWrap iconClock">
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <h3>Horarios</h3>
                        <p>{contacto?.horario || 'Mar - Dom: 11:00 am - 10:00 pm'}</p>
                    </article>

                    <article className="homeInfoCard">
                        <div className="homeInfoIconWrap iconMap">
                            <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                        <h3>Ubicacion</h3>
                        <p>{contacto?.direccion || 'Buenos Aires, Puntarenas, Costa Rica'}</p>
                    </article>

                    <article className="homeInfoCard">
                        <div className="homeInfoIconWrap iconPhone">
                            <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <h3>Contacto</h3>
                        <p>{contacto?.telefono || '+506 86810909'}</p>
                    </article>
                </div>
            </section>

            <div id="menu-principal">
                <Products />
            </div>

            <Footer />
            <BtnWhatsapp />
            <Cart
                isOpen={isMobileNav ? isMobileCartOpen : undefined}
                onRequestClose={() => setIsMobileCartOpen(false)}
                hideTrigger={isMobileNav}
            />
            <MobileBottomNav onCartClick={() => setIsMobileCartOpen(true)} />
        </section>
    );
}
