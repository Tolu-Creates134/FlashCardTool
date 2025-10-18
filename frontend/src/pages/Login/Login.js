import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse.credential;

    const api_base_url = `${process.env.REACT_APP_API_BASE_URL}/api/auth/google-login`

    console.log(googleIdToken)

    try {
      // Send ID token to backend
      const response = await axios.post(api_base_url, {
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
    console.log(api_base_url)
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
