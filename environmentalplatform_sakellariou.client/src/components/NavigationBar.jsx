import React from 'react';
import { Link } from 'react-router-dom';

function NavigationBar() {
    return (
        <nav>
            <ul>
                <li><Link to="/">Homepage</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {/*<li><Link to="/register">Register</Link></li> */}

            </ul>
        </nav>
    );
}

export default NavigationBar;
