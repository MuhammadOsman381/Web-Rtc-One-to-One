import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room2 from './pages/Room2';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room" element={<Home />} />
          <Route path="/room/:roomId/:name" element={<Room2 />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}