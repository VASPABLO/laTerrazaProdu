import React from 'react'
import './Main.css'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import ProductosMain from '../../Components/Admin/ProductosMain/ProductosMain'
import UsuariosMain from '../../Components/Admin/UsuariosMain/UsuariosMain'
import CardsCantidad from '../../Components/Admin/CardsCantidad/CardsCantidad'
import InfoUserMain from '../../Components/Admin/InfoUserMain/InfoUserMain'
export default function Main() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />
                
                <div className='welcomeSection'>
                    <h1 className='welcomeTitle'>¡Bienvenido, Admin!</h1>
                    <p className='welcomeSubtitle'>Aquí tienes el resumen de tu restaurante.</p>
                </div>

                <div className='containerMain'>
                    <CardsCantidad />
                    
                    <div className='deFLexMain'>
                        <UsuariosMain />
                        <ProductosMain />
                    </div>
                    
                    <div className='deFLexMain'>
                        <InfoUserMain />
                    </div>
                </div>
            </section>
        </div>
    )
}
