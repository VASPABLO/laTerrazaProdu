import React from 'react';
import Header from '../Header/Header';
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash';
import PedidosCajaData from '../../Components/Admin/PedidosCajaData/PedidosCajaData';

export default function PedidosCaja() {
    return (
        <div className='containerGrid'>
            <Header />
            <section className='containerSection'>
                <HeaderDash />
                <div className='container'>
                    <PedidosCajaData />
                </div>
            </section>
        </div>
    );
}
