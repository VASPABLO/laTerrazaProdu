import React, { useState } from 'react';
import Nabvar from '../Components/Navbar/Navbar'
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@react-hook/media-query';
import Footer from '../Components/Footer/Footer'
import BtnWhatsapp from '../Components/BtnWhatsapp/BtnWhatsapp'
import Cart from '../Components/Cart/Cart'
import MobileBottomNav from '../Components/MobileBottomNav/MobileBottomNav';
export default function IndexLayout() {



    const isScreenLarge = useMediaQuery('(min-width: 900px)');
    const isMobileNav = useMediaQuery('(max-width: 767px)');
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    return (
        <div style={isMobileNav ? { paddingBottom: '88px' } : undefined}>
            {isScreenLarge ?
                <>
                    <Nabvar />
                    <Outlet />
                    <Footer />
                    <BtnWhatsapp />
                    <Cart
                        isOpen={isMobileNav ? isMobileCartOpen : undefined}
                        onRequestClose={() => setIsMobileCartOpen(false)}
                        hideTrigger={isMobileNav}
                    />
                </> :
                <>

                    <Outlet />
                    <Footer />
                    <Cart
                        isOpen={isMobileNav ? isMobileCartOpen : undefined}
                        onRequestClose={() => setIsMobileCartOpen(false)}
                        hideTrigger={isMobileNav}
                    />
                </>}

            <MobileBottomNav onCartClick={() => setIsMobileCartOpen(true)} />


        </div>
    );
}
