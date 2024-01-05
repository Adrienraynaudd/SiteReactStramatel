import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'

const Login = () => {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({ Username: username, Password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("bien");
                localStorage.setItem('loggedInUser', username);
                navigate('/home');
            } else {
                console.error('Erreur de connexion:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la requête:', error);
        }
    };


    return (
        <div>
            <h1>Login Page</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="button-t" onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
