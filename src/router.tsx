import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BookListPage from './pages/BookListPage';
import BookAudioPage from './pages/BookAudioPage';
import BookDetailPage from './pages/BookDetailPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';

function RootRoute() {
  return (
    <>
      <ScrollToTop />
      <App />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootRoute />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/sach',
        element: <BookListPage />,
      },
      {
        path: '/sach/',
        element: <BookListPage />,
      },
      {
        path: '/sach/:slug.html',
        element: <BookDetailPage />,
      },
      {
        path: '/sach/:slug/Audio.html',
        element: <BookAudioPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/sach/:category',
        element: <BookListPage />,
      },
      {
        path: '/sach/:category/',
        element: <BookListPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
