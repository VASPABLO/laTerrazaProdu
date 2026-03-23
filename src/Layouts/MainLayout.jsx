import React from 'react';
import { Outlet } from 'react-router-dom';
export default function MainLayout() {
    /*
    Bloque de autenticacion/autorizacion deshabilitado para desarrollo local.
    const [usuario, setUsuario] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseURL}/userLogued.php`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsuario(data);
                setLoading(false);

            } catch (error) {
                console.error('Error al obtener datos:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    */

    return (
        <div>
            <div>
                {/* Autenticacion/autorizacion deshabilitada temporalmente en local */}
                <Outlet />
            </div>

        </div>
    );
}
