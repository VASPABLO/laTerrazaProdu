import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import baseURL from '../../url';
import logo1 from '../../../images/logo1.png';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) {
            toast.error('El enlace no es valido. Solicita uno nuevo.');
            return;
        }

        if (password.length < 8) {
            toast.error('La contrasena debe tener al menos 8 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Las contrasenas no coinciden.');
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('token', token);
            formData.append('contrasena', password);
            formData.append('confirmar_contrasena', confirmPassword);

            const response = await fetch(`${baseURL}/resetPasswordPost.php`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'No se pudo actualizar la contrasena');
            }

            toast.success(data?.mensaje || 'Contrasena actualizada correctamente');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1500);
        } catch (error) {
            toast.error(error.message || 'No se pudo actualizar la contrasena');
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

                <h2 className='loginTitle'>Nueva Contrasena</h2>
                <p className='loginSubtitle'>Escribe tu nueva contrasena para recuperar el acceso.</p>

                <form onSubmit={handleSubmit} className='formAuth'>
                    <div className='inputsAuth'>
                        <label htmlFor='password'>Contrasena</label>
                        <div className='deFlexInputs'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                name='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder='Minimo 8 caracteres'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='togglePasswordBtn'
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    <div className='inputsAuth'>
                        <label htmlFor='confirmPassword'>Confirmar Contrasena</label>
                        <div className='deFlexInputs'>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id='confirmPassword'
                                name='confirmPassword'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder='Repite la contrasena'
                            />
                            <button
                                type='button'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className='togglePasswordBtn'
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    <button type='submit' className='btn' disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Actualizar Contrasena'}
                    </button>
                </form>

                <Link to='/forgot-password' className='forgotPasswordLink'>
                    Solicitar un enlace nuevo
                </Link>
            </div>
        </div>
    );
}
