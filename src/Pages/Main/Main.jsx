import React, { useEffect, useState } from 'react';
import './Main.css';
import Header from '../Header/Header';
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash';

import baseURL from '../../Components/url';
import moneda from '../../Components/moneda';

// Importar iconos de react-icons
import {
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';

export default function Main() {
  const [ventasHoy, setVentasHoy] = useState(null);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState(null);

  const [pedidosApp, setPedidosApp] = useState(null);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState(null);

  useEffect(() => {
    setLoadingVentas(true);
    setErrorVentas(null);
    fetch(`${baseURL}/pedidoCajaGet.php`)
      .then(res => res.json())
      .then(data => {
        const pedidos = data?.pedidosCaja || [];
        // Filtrar solo los pedidos de hoy
        const hoy = new Date();
        const esHoy = (fechaStr) => {
          if (!fechaStr) return false;
          const fecha = new Date(fechaStr);
          return fecha.getFullYear() === hoy.getFullYear() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getDate() === hoy.getDate();
        };
        const pedidosHoy = pedidos.filter(p => esHoy(p.createdAt));
        const total = pedidosHoy.reduce((acc, p) => acc + Number(p.total || 0), 0);
        setVentasHoy(total);
        setLoadingVentas(false);
      })
      .catch(err => {
        setErrorVentas('Error al cargar ventas');
        setLoadingVentas(false);
      });
  }, []);

  useEffect(() => {
    setLoadingPedidos(true);
    setErrorPedidos(null);
    fetch(`${baseURL}/pedidoGet.php`)
      .then(res => res.json())
      .then(data => {
        const pedidos = data?.pedidos || [];
        setPedidosApp(pedidos.length);
        setLoadingPedidos(false);
      })
      .catch(err => {
        setErrorPedidos('Error al cargar pedidos');
        setLoadingPedidos(false);
      });
  }, []);

  const formatearMoneda = (valor) => `${moneda} ${Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  return (
    <div className="containerGrid">
      <Header />

      <section className="containerSection">
        <HeaderDash />

        <div className="welcomeSection">
          <div className="welcomeTop">
            <div className="welcomeText">
              <span className="welcomeBadge">Panel administrativo</span>
              <h1 className="welcomeTitle">Centro de control</h1>
              <p className="welcomeSubtitle">
                Administra pedidos, caja, productos y el estado general del restaurante
                desde un solo lugar.
              </p>
            </div>

            <div className="welcomeIconBox">
              <HiOutlineChartBar />
            </div>
          </div>

          <div className="quickStats">
            <div className="quickStatCard">
              <div className="quickStatIcon orange">
                <HiOutlineCurrencyDollar />
              </div>
              <div className="quickStatInfo">
                <span className="quickStatLabel">Ventas en caja</span>
                <h3 className="quickStatValue">
                  {loadingVentas
                    ? 'Cargando...'
                    : errorVentas
                      ? errorVentas
                      : formatearMoneda(ventasHoy)}
                </h3>
              </div>
            </div>

            <div className="quickStatCard">
              <div className="quickStatIcon blue">
                <HiOutlineClipboardDocumentList />
              </div>
              <div className="quickStatInfo">
                <span className="quickStatLabel">Pedidos en el App</span>
                <h3 className="quickStatValue">
                  {loadingPedidos
                    ? 'Cargando...'
                    : errorPedidos
                      ? errorPedidos
                      : pedidosApp}
                </h3>
              </div>
            </div>

            <div className="quickStatCard">
              <div className="quickStatIcon yellow">
                <HiOutlineClock />
              </div>
              <div className="quickStatInfo">
                <span className="quickStatLabel">Pendientes</span>
                <h3 className="quickStatValue"></h3>
              </div>
            </div>
          </div>
        </div>

        <div className="containerMain">
          {/* 
          <CardsCantidad />
          
          <div className="deflexMain">
            <UsuariosMain />
            <ProductosMain />
          </div>

          <div className="deflexMain">
            <InfoUserMain />
          </div>
          */}
        </div>
      </section>
    </div>
  );
}