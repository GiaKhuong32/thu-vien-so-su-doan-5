import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BookListPage from './pages/BookListPage';
import BookAudioPage from './pages/BookAudioPage';
import BookReadPage from './pages/BookReadPage';
import BookDetailPage from './pages/BookDetailPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutLibraryPage from './pages/AboutLibraryPage';
import AboutHistoryPage from './pages/AboutHistoryPage';
import LoginPage from './pages/LoginPage';
// Disabled temporarily - only admin accounts for now
// import RegisterPage from './pages/RegisterPage';
import DrivePage from './pages/DrivePage';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';

function RootRoute() {
  return (
    <>
      <ScrollToTop />
      <App />
    </>
  );
}

function LoadingRoute() {
  return (
    <>
      <ScrollToTop />
      <LoadingScreen />
      <App />
    </>
  );
}

const router = createBrowserRouter([

  {
    path: '/sach/:slug/doc.html',
    element: <BookReadPage />,
  },
  {
    path: '/doc-sach',
    element: <BookReadPage />,
  },
  {
    path: '/dang-nhap',
    element: (
      <>
        <ScrollToTop />
        <LoginPage />
      </>
    ),
  },
  // Disabled temporarily - only admin accounts for now
  // {
  //   path: '/dang-ky',
  //   element: (
  //     <>
  //       <ScrollToTop />
  //       <RegisterPage />
  //     </>
  //   ),
  // },
  {
    path: '/quan-ly-tep/:folderId?',
    element: (
      <>
        <ScrollToTop />
        <DrivePage />
      </>
    ),
  },
  {
    element: <LoadingRoute />,
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
