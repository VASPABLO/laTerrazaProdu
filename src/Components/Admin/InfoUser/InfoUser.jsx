import React, { useState, useEffect } from 'react';
import './InfoUser.css';
import { Link } from 'react-router-dom';
import { HiOutlineChevronRight } from 'react-icons/hi2';
import logo from '../../../images/logo1.png';
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

  return (
    <div className="infoUserWrapper">
      {loading ? (
        <div className="userLoading">Cargando...</div>
      ) : (
        <Link to="/dashboard/perfil" className="btnSession">
          <div className="userAvatar">
            <img src={logo} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%' }} />
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