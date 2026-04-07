
import './App.css';
import { router, } from "./Pages/index";
import { RouterProvider } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import Spiner from './Components/Admin/Spiner/Spiner';


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, []);


  return (
    <>
      {showSplash ? <Spiner /> : <RouterProvider router={router} />}
    </>

  );
}

export default App;
