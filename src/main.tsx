import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';
import './styles/global.css';
import '@fontsource/philosopher/400.css';
import '@fontsource/philosopher/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
