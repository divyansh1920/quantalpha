import { HashRouter, Routes, Route } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Screener from './pages/Screener';
import Portfolio from './pages/Portfolio';
import Education from './pages/Education';

function App() {
  return (
    <StockProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:ticker" element={<Analysis />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/education" element={<Education />} />
          </Routes>
        </div>
      </HashRouter>
    </StockProvider>
  );
}

export default App;