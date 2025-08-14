import Link from 'next/link';
import { useRouter } from 'next/router';
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