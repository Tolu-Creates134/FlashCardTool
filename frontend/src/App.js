import './App.css';
import { useContext } from 'react';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import CreateDeck from './pages/CreateDeck/CreateDeck';
import ViewDeck from './pages/ViewDeck/ViewDeck';
import PractiseDeck from './pages/PractiseDeck/PractiseDeck';
import EditDeck from './pages/EditDeck/EditDeck';
import Scores from './pages/Scores/Scores';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup/Signup';
import { AuthContext } from './context/Authcontext';
import GlobalErrorToastr from './components/GlobalErrorToastr';

const AuthGate = ({ children }) => {
  const { authReady } = useContext(AuthContext);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return children;
};

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

/**
 * App Component
 * @returns 
 */
function App() {
  return (
    <AuthGate>
      <GlobalErrorToastr />

      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout/>}>
            <Route path='/home' element={<Home/>} />
            <Route path='/create-deck/:categoryId?' element={<CreateDeck/>} />
            <Route path='/decks/:deckId' element={<ViewDeck/>} />
            <Route path='/decks/:deckId/practise' element={<PractiseDeck/>} />
            <Route path='/decks/:deckId/edit' element={<EditDeck/>}/>
            <Route path='/decks/:deckId/scores' element={<Scores/>}/> 
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </AuthGate>
  );
}

export default App;
