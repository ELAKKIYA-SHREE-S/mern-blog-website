import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Forgotpwd = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
  
    const handleForgotPassword = async (ev) => {
      ev.preventDefault();
  
      try {
        const response = await axios.get("http://localhost:4000/forgot-password", {
          method: "POST",
          body: JSON.stringify({ username, password }),
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.ok) {
          // User found, password updated, or other relevant logic
          setMessage("Password updated successfully!!");
          setTimeout(() =>navigate("/login"), 2000);
        } else if (response.status === 404) {
          setMessage("User not found. Please check your username.");
        } else {
          setMessage("Error updating password. Please try again later.");
        }
      } catch (error) {
        console.error("Network error:", error);
        setMessage("Network error. Please try again later.");
      }
    };
  
    return (
      <form className="forgot-password" onSubmit={handleForgotPassword}>
        <h1>Forgot Password</h1>
        <p>Enter your username and new password to update.</p>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          autoComplete="current-username"
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          autoComplete="new-password"
        />
        <button>Update Password</button>
        {message && <p>{message}</p>}
      </form>
    );
  };  
  
  export default Forgotpwd;