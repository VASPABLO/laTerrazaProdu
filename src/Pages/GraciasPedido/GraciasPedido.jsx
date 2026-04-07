import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './GraciasPedido.css';

export default function GraciasPedido() {
    const location = useLocation();
    const orderName = location?.state?.orderName || '';

    return (
        <main className='thanksOrder'>
            <section className='thanksOrder__card'>
                <h1>Gracias por su pedido</h1>
                <p>
                    {orderName ? `${orderName}, ` : ''}nos pondremos en contacto para la entrega.
                </p>
                <p className='thanksOrder__subtext'>
                    En breve confirmaremos los detalles por WhatsApp y coordinaremos la entrega.
                </p>

                <div className='thanksOrder__actions'>
                    <Link to='/' className='thanksOrder__btn thanksOrder__btn--secondary'>
                        Salir
                    </Link>
                    <Link to='/' className='thanksOrder__btn'>
                        Volver al inicio
                    </Link>
                </div>
            </section>
        </main>
    );
}
