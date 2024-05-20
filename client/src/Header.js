import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import logo from "./images/logo.png";
import axios from 'axios';

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.get('http://localhost:4000/profile', {
        withCredentials: true, // Make sure this option is included
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
        .then(response => {
          if (response.status === 200) {
            setUserInfo(response.data); // Assuming the response contains user info
          } else {
            throw new Error('Unauthorized');
          }
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setUserInfo(null);
          localStorage.removeItem('token');
        });
    } else {
      setUserInfo(null);
    }
  }, [setUserInfo]);

  function logout() {
    axios.post('http://localhost:4000/logout', {}, {
      withCredentials: true,
    }).then(() => {
      setUserInfo(null);
      localStorage.removeItem('token');
    });
  }

  const username = userInfo?.username;

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible. Also, other data associated with this account will be deleted!");

    if (confirmDelete) {
      try {
        const response = await axios.delete('http://localhost:4000/delete-account', {
          withCredentials: true,
        });

        if (response.status === 200) {
          setUserInfo(null);
          localStorage.removeItem('token');
          alert("Account deleted successfully.");
          window.location.reload();
        } else {
          alert("Error deleting account. Please try again later.");
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert("Network error. Please try again later.");
      }
    }
  };

  return (
    <header>
      <Link to="/"><img src={logo} alt="logo" className="logo" /></Link>
      <nav>
        {username && (
          <>
            <Link to="/">Home</Link>
            <Link to="/create">NewPost</Link>
            <a onClick={logout} href="/">Logout</a>
            <button className="dltbtn" onClick={handleDeleteAccount}>Delete Account</button>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
