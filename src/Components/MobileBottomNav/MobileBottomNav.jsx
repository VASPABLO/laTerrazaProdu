import React from 'react';
import { useMediaQuery } from '@react-hook/media-query';
import { FiGrid, FiMapPin, FiShoppingCart } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import './MobileBottomNav.css';

export default function MobileBottomNav({ onCartClick, onMesasClick }) {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const location = useLocation();
    const navigate = useNavigate();

    const handleCatalogClick = () => {
        if (location.pathname === '/') {
            const catalogSection = document.getElementById('menu-principal');

            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        navigate('/#menu-principal');
    };

    if (!isMobile) {
        return null;
    }

    return (
        <nav className='mobileBottomNav' aria-label='Navegación inferior móvil'>
            <button
                type='button'
                className={`mobileBottomNav__item ${location.pathname === '/' ? 'is-active' : ''}`}
                onClick={handleCatalogClick}
                aria-label='Ir al catálogo'
            >
                <FiGrid />
                <span>Catálogo</span>
            </button>

            <button
                type='button'
                className='mobileBottomNav__item'
                onClick={onCartClick}
                aria-label='Abrir carrito'
            >
                <FiShoppingCart />
                <span>Carrito</span>
            </button>

            <button
                type='button'
                className='mobileBottomNav__item'
                onClick={onMesasClick}
                aria-label='Reservar mesa'
            >
                <FiMapPin />
                <span>Mesas</span>
            </button>
        </nav>
    );
}