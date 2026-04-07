import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { useNavigate, } from 'react-router';
import baseURL from '../../url';
import logo1 from '../../../images/logo1.png';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('contrasena', password);
            formData.append('iniciar_sesion', true);

            const response = await fetch(`${baseURL}/login.php`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Error en la solicitud al servidor');
            }

            if (data.mensaje) {
                console.log(data.mensaje);
                toast.success(data.mensaje);

                // Verifica sesion activa antes de navegar para evitar rebote al login.
                const authResponse = await fetch(`${baseURL}/userLogued.php`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const authData = await authResponse.json();

                if (!authResponse.ok || !authData?.authenticated || authData?.rol !== 'admin') {
                    throw new Error('No se pudo confirmar la sesion activa.');
                }

                setTimeout(() => {
                    navigate('/dashboard', { replace: true });

                }, 2000);

            } else if (data.error) {
                setErrorMessage(data.error);
                console.log(data.error);
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error.message);
            toast.error(error.message);
        }
    };

    return (
        <div className='loginPageContainer'>
            <ToastContainer />
            <div className='formContain'>
                <div className='fireIconContainer'>
                    <img src={logo1} alt='Logo La Terraza' className='loginLogoSmall' />
                </div>
                
                <h2 className='loginTitle'>Portal Admin</h2>
                <p className='loginSubtitle'>Inicia sesión para gestionar tu pedido</p>
                
                <form onSubmit={handleLogin} className='formAuth'>
                    <div className='inputsAuth'>
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@ejemplo.com"
                        />
                    </div>
                    <div className='inputsAuth'>
                        <label htmlFor="password">Contraseña</label>
                        <div className='deFlexInputs'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className='togglePasswordBtn'
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    <button type="submit" className='btn'>
                        Iniciar Sesión
                    </button>
                </form>

                <Link to='/forgot-password' className='forgotPasswordLink'>
                    Olvidaste tu contrasena?
                </Link>
            </div>
        </div>
    );
}
