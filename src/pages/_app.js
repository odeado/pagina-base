import Link from 'next/link';
import Home from './components/Home';
import PublicPage from './components/PublicPage';

function App() {
  return (
    <>
      <Link href="/admin">Admin</Link>
      <Link href="/">Home</Link>
    </>
  );
}

