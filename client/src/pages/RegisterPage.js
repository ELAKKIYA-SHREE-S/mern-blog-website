import {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/register', {
        username,
        password,
      });
      if (response.status === 200) {
        alert('Registration successful');
        navigate('/login');
      } else {
        alert('Username or Password already exists!');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Username or Password already exists!');
    }
  }
  
  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input type="text"
             placeholder="username"
             value={username}
             onChange={ev => setUsername(ev.target.value)}/>
      <input type="password"
             placeholder="password"
             value={password}
             onChange={ev => setPassword(ev.target.value)}/>
      <button>Register</button>
    </form>
  );
}