import React, { useEffect, useRef, useState, useCallback } from 'react';
import baseURL from '../url';
import './Banners.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Banners() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const swiperRef = useRef(null);

    const cargarBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const response = await fetch(`${baseURL}/bannersGet.php`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener la respuesta del servidor');
            }

            const data = await response.json();

            const bannerImages = Array.isArray(data?.banner)
                ? data.banner
                      .map((banner) => banner?.imagen)
                      .filter((img) => typeof img === 'string' && img.trim() !== '')
                : [];

            setImages(bannerImages);
        } catch (err) {
            console.error('Error al cargar banners:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarBanners();
    }, [cargarBanners]);

    useEffect(() => {
        if (swiperRef.current && images.length > 0) {
            swiperRef.current.update();
        }
    }, [images]);

    if (loading) {
        return (
            <section className="BannerContain" aria-label="Cargando banners">
                <div className="loadingBanner" />
            </section>
        );
    }

    if (error) {
        return (
            <section className="BannerContain">
                <div className="bannerStatus bannerError">
                    <p>No se pudieron cargar los banners.</p>
                    <button className="bannerRetryBtn" onClick={cargarBanners}>
                        Reintentar
                    </button>
                </div>
            </section>
        );
    }

    if (!images.length) {
        return (
            <section className="BannerContain">
                <div className="bannerStatus bannerEmpty">
                    <p>No hay banners disponibles.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="BannerContain" aria-label="Promociones principales">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, A11y]}
                loop={images.length > 1}
                slidesPerView={1}
                spaceBetween={0}
                grabCursor={true}
                speed={700}
                navigation
                pagination={{ clickable: true }}
                autoplay={
                    images.length > 1
                        ? {
                              delay: 4500,
                              disableOnInteraction: false,
                              pauseOnMouseEnter: true,
                          }
                        : false
                }
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                className="bannerSwiper"
            >
                {images.map((image, index) => (
                    <SwiperSlide className="bannerSlide" key={`${image}-${index}`}>
                        <img
                            className="bannerImage"
                            src={image}
                            alt={`Banner promocional ${index + 1}`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}