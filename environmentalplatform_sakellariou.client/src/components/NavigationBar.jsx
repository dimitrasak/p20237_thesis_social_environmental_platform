import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavigationBar.css'; // Import the new CSS file

function NavigationBar() {
    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li><Link to="/">Homepage</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {/*<li><Link to="/register">Register</Link></li> */}
            </ul>
        </nav>
    );
}

export default NavigationBar;
