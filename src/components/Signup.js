import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

const Signup = ({ setShowSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Assign "user" role via backend endpoint
      await axios.post('http://localhost:5000/api/set-role', {
        uid,
        role: 'user',
      });

      setShowSignup(false); // Switch back to login after signup
    } catch (err) {
      setError('Signup failed. Try a stronger password or different email.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already have an account?{' '}
        <span className="link" onClick={() => setShowSignup(false)}>
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;