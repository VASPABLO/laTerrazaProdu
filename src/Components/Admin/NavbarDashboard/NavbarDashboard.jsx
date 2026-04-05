import React from 'react'
import './NavbarDashboard.css'
import Logout from '../Logout/Logout';
import { Link, useLocation } from 'react-router-dom'

// ICONOS MODERNOS
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCog6Tooth
} from 'react-icons/hi2'

export default function NavbarDashboard() {
  const location = useLocation()

  return (
    <div className="navbarDashboard">

      {/* LOGO */}
      <div className="logo">
        <img src={require('../../../images/logo1.png')} alt="Logo" className="logoImg" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
        <span>La Terraza</span>
      </div>

      <div className="links">

        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'activeLink' : ''}>
          <HiOutlineHome /> Inicio
        </Link>

        <Link to="/dashboard/mesas" className={location.pathname === '/dashboard/mesas' ? 'activeLink' : ''}>
          <HiOutlineCube /> Mesas
        </Link>

        <Link to="/dashboard/pedidos" className={location.pathname === '/dashboard/pedidos' ? 'activeLink' : ''}>
          <HiOutlineClipboardDocumentList /> Pedidos en el App
        </Link>

        <Link to="/dashboard/cajas" className={location.pathname === '/dashboard/cajas' ? 'activeLink' : ''}>
          <HiOutlineCurrencyDollar /> Caja
        </Link>

        <Link to="/dashboard/pedidos-caja" className={location.pathname === '/dashboard/pedidos-caja' ? 'activeLink' : ''}>
          <HiOutlineClipboardDocumentList /> Pedidos en Caja
        </Link>

        <Link to="/dashboard/productos" className={location.pathname === '/dashboard/productos' ? 'activeLink' : ''}>
          <HiOutlineCube /> Productos
        </Link>

        <Link to="/dashboard/categorias" className={location.pathname === '/dashboard/categorias' ? 'activeLink' : ''}>
          <HiOutlineChartBar /> Categorías
        </Link>

        <Link to="/dashboard/banners" className={location.pathname === '/dashboard/banners' ? 'activeLink' : ''}>
          <HiOutlineChartBar /> Banners
        </Link>

        <Link to="/dashboard/contacto" className={location.pathname === '/dashboard/contacto' ? 'activeLink' : ''}>
          <HiOutlineChartBar /> Contacto
        </Link>

        <Link to="/dashboard/usuarios" className={location.pathname === '/dashboard/usuarios' ? 'activeLink' : ''}>
          <HiOutlineUsers /> Usuarios
        </Link>

      </div>

      {/* Botón de salir al final del navbar, color naranja */}
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <Logout />
      </div>
    </div>
  )
}