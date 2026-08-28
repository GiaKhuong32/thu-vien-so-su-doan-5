import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BookListPage from './pages/BookListPage';
import BookAudioPage from './pages/BookAudioPage';
import BookDetailPage from './pages/BookDetailPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AboutLibraryPage from './pages/AboutLibraryPage';
import AboutHistoryPage from './pages/AboutHistoryPage';
import AboutMissionPage from './pages/AboutMissionPage';
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
        path: '/gioi-thieu/thu-vien-so-nguyen-an-ninh-chuyen-de-nam-bo.html',
        element: <AboutLibraryPage />,
      },
      {
        path: '/gioi-thieu/quy-hoa-sen.html',
        element: <AboutHistoryPage />,
      },
      {
        path: '/gioi-thieu/chinh-sach-su-dung.html',
        element: <AboutMissionPage />,
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
