import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse.credential;

    try {
      // Send ID token to backend
      const response = await axios.post('/api/auth/google-login', {
        idToken: googleIdToken,
      });

      // Save access/refresh tokens locally
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
    }

    console.log(credentialResponse);
    console.log(jwtDecode(credentialResponse.credential));
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={(error) => console.log(error)}
        auto_select={true}
      />
    </div>
  );
};

export default Login;
