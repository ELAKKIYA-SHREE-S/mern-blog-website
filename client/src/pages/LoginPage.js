import { useContext, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:4000/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      setUserInfo(response.data); // Assuming response.data contains user info
      setRedirect(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Wrong credentials');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={ev => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={ev => setPassword(ev.target.value)}
      />
      <button type="submit">Login</button>
      <Link to="/forgot-password">Forgot Password?</Link>
    </form>
  );
}
