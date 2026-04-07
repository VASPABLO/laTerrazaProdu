import React from 'react';
import logo from '../../../images/logo1.png';
import './Spiner.css';

export default function Spiner() {
    return (
        <div className='spinnerContainer'>
            <div className='spinner'>
                <img src={logo} alt="Spinner" className='spinnerImage' />
                <p className='spinnerText'>La Terraza</p>
            </div>
        </div>
    );
}
