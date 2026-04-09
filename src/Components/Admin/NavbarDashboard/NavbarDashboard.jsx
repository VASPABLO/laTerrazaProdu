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
  HiOutlineTag,
  HiOutlineMegaphone,
  HiOutlinePhone
} from 'react-icons/hi2'

export default function NavbarDashboard() {
  const location = useLocation()
  const isActive = (...paths) => paths.includes(location.pathname)

  return (
    <div className="navbarDashboard">

      {/* LOGO */}
      <div className="logo">
        <img src={require('../../../images/logo1.png')} alt="Logo" className="logoImg" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
        <span>La Terraza</span>
      </div>

      <div className="links">

        <Link to="/admin" className={isActive('/admin', '/dashboard') ? 'activeLink' : ''}>
          <HiOutlineHome /> Inicio
        </Link>

        <Link to="/admin/mesas" className={isActive('/admin/mesas', '/dashboard/mesas') ? 'activeLink' : ''}>
          <HiOutlineCube /> Mesas
        </Link>

        <Link to="/admin/pedidos" className={isActive('/admin/pedidos', '/dashboard/pedidos') ? 'activeLink' : ''}>
          <HiOutlineClipboardDocumentList /> Pedidos en el App
        </Link>

        <Link to="/admin/cajas" className={isActive('/admin/cajas', '/dashboard/cajas') ? 'activeLink' : ''}>
          <HiOutlineCurrencyDollar /> Caja
        </Link>

        <Link to="/admin/pedidos-caja" className={isActive('/admin/pedidos-caja', '/dashboard/pedidos-caja') ? 'activeLink' : ''}>
          <HiOutlineClipboardDocumentList /> Pedidos en Caja
        </Link>

        <Link to="/admin/productos" className={isActive('/admin/productos', '/dashboard/productos') ? 'activeLink' : ''}>
          <HiOutlineCube /> Productos
        </Link>

        <Link to="/admin/categorias" className={isActive('/admin/categorias', '/dashboard/categorias') ? 'activeLink' : ''}>
          <HiOutlineTag /> Categorías
        </Link>

        <Link to="/admin/banners" className={isActive('/admin/banners', '/dashboard/banners') ? 'activeLink' : ''}>
          <HiOutlineMegaphone /> Banners
        </Link>

        <Link to="/admin/contacto" className={isActive('/admin/contacto', '/dashboard/contacto') ? 'activeLink' : ''}>
          <HiOutlinePhone /> Contacto
        </Link>

        <Link to="/admin/usuarios" className={isActive('/admin/usuarios', '/dashboard/usuarios') ? 'activeLink' : ''}>
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