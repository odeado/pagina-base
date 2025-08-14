import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PublicPage from './components/PublicPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Home />} />
        <Route path="/" element={<PublicPage />} />
      </Routes>
    </Router>
  );
}