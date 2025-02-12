import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Forms.css";


function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://localhost:7029/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid username or password');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('profilePic', data.profilePic);

            // Decode token to get user role & username
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem('userRole', payload.role);
            localStorage.setItem('username', payload.unique_name);
            localStorage.setItem('userId', payload.nameid); // Store userId from the payload

            console.log("Decoded userId:", payload.nameid);

            //Force update της navbar με custom event
            window.dispatchEvent(new Event('storage'));

            // Redirect based on user role
            switch (payload.role) {
                case 'Regular User':
                    navigate('/reg-user-dashboard');
                    break;
                case 'Organization':
                    navigate('/organization-dashboard');
                    break;
                default:
                    navigate('/');
                    break;
            }
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="form-container">
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
