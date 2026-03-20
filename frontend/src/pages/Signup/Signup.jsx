import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';
import { fetchCurrentUser, loginWithGoogle } from '../../services/api';

/**
 * Signup page component
 * @returns
 */
const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse.credential;

    try {
      await loginWithGoogle(googleIdToken);

      const me = await fetchCurrentUser();

      login({
        id: me?.id,
        email: me?.email,
        name: me?.name || me?.fullName || '',
      });

      navigate('/home');
    } catch (error) {
      console.error('Signup failed', error);
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
          Create your FlashLearn account
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Start building AI-powered flashcard decks in minutes.
        </p>

        <div className="mt-10 bg-white rounded-2xl shadow-lg px-6 py-8 sm:px-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Sign up with Google
          </h2>
          <p className="mt-2 text-gray-500">
            Use your Google account to get started and save your decks.
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

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-8 text-indigo-600 font-medium"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
};

export default Signup;
