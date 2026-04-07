import React, { useEffect, useState } from 'react';
import { Link as Anchor, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import logo from '../../images/logo.png';
import baseURL from '../url';
import 'swiper/swiper-bundle.css';
import Profile from '../Profile/Profile';
import './Navbar.css';
import Favoritos from '../Favoritos/Favoritos';
import InputSerach from '../InputSerach/InputSearchs';
import Logout from '../Admin/Logout/Logout';
export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();  // Obtén la ubicación actual
    const [usuario, setUsuario] = useState({});
    const [contacto, setContacto] = useState({});

    useEffect(() => {
        cargarBanners();
    }, []);

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const bannerImages = data.banner.map(banner => banner.imagen);
                setImages(bannerImages);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
            });
    };

    useEffect(() => {
        fetch(`${baseURL}/userLogued.php`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setUsuario(data?.authenticated ? data : {});
                setLoading(false);
            })
            .catch(() => {
                setUsuario({});
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch(`${baseURL}/contactoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const contactoActual = Array.isArray(data?.contacto) && data.contacto.length > 0
                    ? [...data.contacto].reverse()[0]
                    : {};
                setContacto(contactoActual || {});
            })
            .catch(() => {
                setContacto({});
            });
    }, []);

    const tickerMessage = `Somos La Terraza | Horario: ${contacto?.horario || 'Martes a Domingo, 11:00 am - 10:00 pm'} | Tel: ${contacto?.telefono || '+506 86810909'}`;

    return (
        <header>
            <nav>
                <Anchor to={`/`} className='logo'>
                    <img src={logo} alt="logo" />

                </Anchor>

                <div className='navTicker' aria-label='Informacion del restaurante'>
                    <div className='navTicker__track'>
                        <span>{tickerMessage}</span>
                        <span aria-hidden='true'>{tickerMessage}</span>
                    </div>
                </div>

                {/*
                <div className='deFLexNavs'>
                    <Favoritos />
                    <InputSerach />
                    <Anchor to="/login" className="navAdminLink">Admin</Anchor>
                    <div className={`nav_toggle  ${isOpen && "open"}`} onClick={() => setIsOpen(!isOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                */}

                <Modal
                    isOpen={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                    className="modalNav"
                    overlayClassName="overlay"
                >
                    <div className="modalNav-content">
                        {loading ? (
                            <div className='loadingBannerFondo'>
                            </div>
                        ) : (
                            <>
                                <div className='fondo'>
                                    <img src={images[0]} alt={`imagen`} />
                                </div>
                                <Profile />
                                {loading ? (
                                    <div></div>
                                ) : usuario.idUsuario ? (
                                    <Logout />
                                ) : (
                                    <></>
                                )}

                            </>
                        )}
                    </div>

                </Modal>
            </nav>
        </header>
    );
}
