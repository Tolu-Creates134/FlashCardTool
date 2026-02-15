import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../services/api';
import { AuthContext } from '../../context/Authcontext';
import { BookOpen } from 'lucide-react';

/**
 * Login component
 * @returns 
 */
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <BookOpen size={26} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Welcome to FlashLearn
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Your AI-Powered Study Companion
        </p>

        <div className="mt-10 bg-white rounded-2xl shadow-lg px-6 py-8 sm:px-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-gray-500">
            Continue with Google to access your decks.
          </p>

          <div className="mt-8 flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={(error) => console.log(error)}
              auto_select={true}
              size="large"
              shape="rectangular"
              width={320}
            />
          </div>
        </div>

        <p className="mt-8 text-indigo-600 font-medium">
          Don&apos;t have an account? Create one
        </p>
      </div>
    </div>
  );
};

export default Login;
