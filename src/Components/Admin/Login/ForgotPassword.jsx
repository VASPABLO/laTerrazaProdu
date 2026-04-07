import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import baseURL from '../../url';
import logo1 from '../../../images/logo1.png';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error('Debes ingresar tu correo.');
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('email', email.trim());

            const response = await fetch(`${baseURL}/forgotPasswordPost.php`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'No se pudo procesar la solicitud');
            }

            toast.success(data?.mensaje || 'Si el correo existe, te enviamos un enlace para recuperar tu contrasena.');
            setEmail('');
        } catch (error) {
            toast.error(error.message || 'No se pudo procesar la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='loginPageContainer'>
            <ToastContainer />
            <div className='formContain'>
                <div className='fireIconContainer'>
                    <img src={logo1} alt='Logo La Terraza' className='loginLogoSmall' />
                </div>

                <h2 className='loginTitle'>Recuperar Contrasena</h2>
                <p className='loginSubtitle'>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>

                <form onSubmit={handleSubmit} className='formAuth'>
                    <div className='inputsAuth'>
                        <label htmlFor='email'>Correo Electronico</label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder='admin@ejemplo.com'
                        />
                    </div>

                    <button type='submit' className='btn' disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                <Link to='/login' className='forgotPasswordLink'>
                    Volver al login
                </Link>
            </div>
        </div>
    );
}
