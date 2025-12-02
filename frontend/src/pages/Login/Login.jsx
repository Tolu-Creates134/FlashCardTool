import React, { useContext } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../services/api';
import { AuthContext } from '../../context/Authcontext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)

  const handleSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse.credential;

    try {
      // Send ID token to backend
      const { accessToken, refreshToken, email } = await loginWithGoogle(googleIdToken)
      console.log(`${process.env.REACT_APP_API_BASE_URL}/api`)

      // Save access/refresh tokens locally
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const user = {email}
      login(user, accessToken)

      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
    }
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
