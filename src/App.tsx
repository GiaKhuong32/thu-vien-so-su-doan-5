import { Outlet, useLocation } from 'react-router-dom';
import FloatingActions from './components/FloatingActions';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import useReveal from './hooks/useReveal';

export default function App() {
  const { pathname } = useLocation();
  useReveal();

  return (
    <div className={`wrapper${pathname === '/' ? ' home-page' : ''}`}>
      <Navbar />
      <Outlet />
      <Footer />
      <FloatingActions />
    </div>
  );
}
