import './App.css';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <Routes>
      The start of the flash card app
      <Route path='/' element={<Login/>}/>
      <Route
       path='/home' 
       element={
          <MainLayout>
            <Home/>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
