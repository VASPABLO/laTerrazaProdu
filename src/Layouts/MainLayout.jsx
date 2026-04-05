import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import baseURL from '../Components/url';

export default function MainLayout() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseURL}/userLogued.php`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (!data?.authenticated || !data?.rol || data.rol !== 'admin') {
                    setUsuario(null);
                    setLoading(false);
                    navigate('/login');
                    return;
                }
                setUsuario(data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}
