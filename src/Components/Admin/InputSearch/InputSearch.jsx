import React, { useState } from 'react';
import './InputSearch.css';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineArrowUpRight } from 'react-icons/hi2';

export default function InputSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const enlaces = [
    { title: 'Productos', link: '/dashboard/productos' },
    { title: 'Banners', link: '/dashboard/banners' },
    { title: 'Usuarios', link: '/dashboard/usuarios' },
    { title: 'Contacto', link: '/dashboard/contacto' },
    { title: 'Categorías', link: '/dashboard/categorias' },
    { title: 'Códigos', link: '/dashboard/codigos' },
    { title: 'Mesas', link: '/dashboard/mesas' },
    { title: 'Pedidos', link: '/dashboard/pedidos' },
    { title: 'Caja', link: '/dashboard/caja' },
  ];

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setModalOpen(value.trim() !== '');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSearchTerm('');
  };

  const filteredEnlaces = enlaces.filter((enlace) =>
    enlace.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inputSearchDashboard">
      <div className="search">
        <HiOutlineMagnifyingGlass className="search-icon" />

        <input
          type="text"
          placeholder="Buscar módulo..."
          value={searchTerm}
          onChange={handleSearch}
          className="input"
        />
      </div>

      {modalOpen && (
        <div className="modalInput">
          {filteredEnlaces.length > 0 ? (
            filteredEnlaces.map((enlace, index) => (
              <div key={index} className="link">
                <Link to={enlace.link} onClick={closeModal}>
                  <span>{enlace.title}</span>
                  <HiOutlineArrowUpRight className="link-icon" />
                </Link>
              </div>
            ))
          ) : (
            <p className="emptyResult">No hay resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}