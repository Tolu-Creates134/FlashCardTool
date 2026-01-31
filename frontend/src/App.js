import './App.css';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import CreateDeck from './pages/CreateDeck/CreateDeck';
import ViewDeck from './pages/ViewDeck/ViewDeck';
import PractiseDeck from './pages/PractiseDeck/PractiseDeck';
import EditDeck from './pages/EditDeck/EditDeck';
import Scores from './pages/Scores/Scores';

function App() {
  return (
    <Routes>
      The start of the flash card app
      {/* Login route — no layout */}
      <Route path='/' element={<Login/>}/>

      {/* All other pages that share MainLayout */}
      <Route element={<MainLayout/>}>
        <Route path='/home' element={<Home/>} />
        <Route path='/create-deck' element={<CreateDeck/>} />
        <Route path='/decks/:deckId' element={<ViewDeck/>} />
        <Route path='/decks/:deckId/practise' element={<PractiseDeck/>} />
        <Route path='/decks/:deckId/edit' element={<EditDeck/>}/>
        <Route path='/decks/:deckId/scores' element={<Scores/>}/> 
      </Route>
    </Routes>
  );
}

export default App;
