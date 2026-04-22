import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import baseURL from '../url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faMapPin, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  const [contactos, setContactos] = useState({});
  const googleMapsUrl = 'https://maps.app.goo.gl/uXzkktq7WXrKVFTh7?g_st=aw';

  useEffect(() => {
    cargarContacto();
  }, []);

  const cargarContacto = () => {
    fetch(`${baseURL}/contactoGet.php`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setContactos(data.contacto?.reverse()[0] || {});
      })
      .catch(error => console.error('Error al cargar contactos:', error));
  };

  return (
    <footer className="footer-contain">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-col">
            <Link to="/" className="footer-brand">
              <FontAwesomeIcon icon={faFire} className="footer-icon-fire" />
              <span className="footer-brand-name">La Terraza</span>
            </Link>
            <p className="footer-description">
              Las mejores carnes a la parrilla, hamburguesas artesanales y un ambiente inigualable para disfrutar con familia y amigos.
            </p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/laterraza782?igsh=bnpvNm1xNzNtdzF0" target="_blank" rel="noopener noreferrer" className="footer-social-link">Instagram</a>
              <a href={contactos.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-link">Facebook</a>
              <a href={`tel:${contactos.telefono}`} className="footer-social-link">WhatsApp</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Enlaces Rápidos</h4>
            <ul className="footer-list">
              <li><Link to="/" className="footer-link">Inicio</Link></li>
              <li><Link to="/menu" className="footer-link">Nuestro Menú</Link></li>
              <li><Link to="/contact" className="footer-link">Contacto</Link></li>
              <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contacto</h4>
            <ul className="footer-list">
              <li className="footer-contact-item">
                <FontAwesomeIcon icon={faMapPin} className="footer-icon" />
                <span>{contactos.direccion}</span>
              </li>
              <li className="footer-contact-item">
                <FontAwesomeIcon icon={faPhone} className="footer-icon" />
                <a href={`tel:${contactos.telefono || ''}`} className="footer-link">{contactos.telefono}</a>
              </li>
              <li className="footer-contact-item">
                <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
                <a href={`mailto:${contactos.email}`} className="footer-link">{contactos.email}</a>
              </li>
            </ul>
            <div className="footer-map-cta">
              <p className="footer-map-title">Cómo llegar</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-map-button"
              >
                <FontAwesomeIcon icon={faMapPin} className="footer-map-button-icon" />
                Ver en Google Maps
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="footer-col">
            <h4 className="footer-col-title">Horarios</h4>
            <ul className="footer-list footer-hours">
              <li><span>Martes - Domingo</span></li>
              <li><span>11:00 am - 10:00 pm</span></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} La Terraza Parrilla. Todos los derechos reservados.</p>
          <div className="footer-bottom-links">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
