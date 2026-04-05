import React, { useState } from 'react';
import { HiOutlineArrowsPointingOut, HiOutlineArrowsPointingIn } from 'react-icons/hi2';
import './ButonScreen.css';

export default function ButonScreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error al cambiar pantalla completa:', error);
    }
  };

  return (
    <button
      className="fullscreenButton"
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      type="button"
    >
      {isFullscreen ? <HiOutlineArrowsPointingIn /> : <HiOutlineArrowsPointingOut />}
    </button>
  );
}