import React, { useState, useEffect } from 'react';
import './InfoUser.css';
import { Link } from 'react-router-dom';
import { HiOutlineChevronRight, HiOutlineUserCircle } from 'react-icons/hi2';
import logo2 from '../../logo2';
import baseUrl from '../../url';

export default function InfoUser() {
  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseUrl}/userLogged.php`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setUsuario(data);
        setLoading(false);
        console.log(data);
      })
      .catch((error) => {
        console.error('Error al obtener datos:', error);
        setLoading(false);
      });
  }, []);

  const nombreUsuario = usuario?.nombre || 'Mi perfil';
  const fotoUsuario = usuario?.foto || '';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <div className="infoUserWrapper">
      {loading ? (
        <div className="userLoading">Cargando...</div>
      ) : (
        <Link to="/dashboard/perfil" className="btnSession">
          <div className="userAvatar">
            <img src={logo2} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          </div>

          <div className="userText">
            <span className="userLabel">Mi perfil</span>
            <span className="userName">{nombreUsuario.slice(0, 18)}</span>
          </div>

          <HiOutlineChevronRight className="arrow-icon" />
        </Link>
      )}
    </div>
  );
}