import React, { useEffect, useState } from 'react';
import './ButonInstallAppNav.css';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';

const ButonInstallAppNav = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('Instalación aceptada');
    } else {
      console.log('Instalación rechazada');
    }

    setDeferredPrompt(null);
  };

  // 🔥 SOLO SE MUESTRA SI EXISTE EL PROMPT
  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstallClick} className="btnInstall">
      <HiOutlineArrowDownTray />
      <span>Instalar</span>
    </button>
  );
};

export default ButonInstallAppNav;