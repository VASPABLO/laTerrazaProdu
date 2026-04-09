import React, { useState } from 'react';
import './InputSearch.css';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineArrowUpRight } from 'react-icons/hi2';

export default function InputSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const enlaces = [
    { title: 'Productos', link: '/admin/productos' },
    { title: 'Banners', link: '/admin/banners' },
    { title: 'Usuarios', link: '/admin/usuarios' },
    { title: 'Contacto', link: '/admin/contacto' },
    { title: 'Categorías', link: '/admin/categorias' },
    { title: 'Códigos', link: '/admin/codigos' },
    { title: 'Mesas', link: '/admin/mesas' },
    { title: 'Pedidos', link: '/admin/pedidos' },
    { title: 'Caja', link: '/admin/cajas' },
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