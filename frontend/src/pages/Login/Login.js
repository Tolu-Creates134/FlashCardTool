import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    console.log(credentialResponse);
    console.log(jwtDecode(credentialResponse.credential));

    const googleIdToken = credentialResponse.credential;

    // Send ID token to backend
    const response = await axios.post('/api/auth/google-login', {
      idToken: googleIdToken,
    });

    // Save access/refresh tokens locally
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshtoke', response.data.refreshToken);
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={(response) => {
          console.log(response);
          console.log(jwtDecode(response.credential));
          navigate('/home');
        }}
        onError={(error) => console.log(error)}
        auto_select={true}
      />
    </div>
  );
};

export default Login;
