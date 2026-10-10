import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BookListPage from './pages/BookListPage';
import BookDetailPage from './pages/BookDetailPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutLibraryPage from './pages/AboutLibraryPage';
import AboutHistoryPage from './pages/AboutHistoryPage';
import LoginPage from './pages/LoginPage';
// Disabled temporarily - only admin accounts for now
// import RegisterPage from './pages/RegisterPage';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';

const BookAudioPage = lazy(() => import('./pages/BookAudioPage'));
const BookReadPage = lazy(() => import('./pages/BookReadPage'));
const DrivePage = lazy(() => import('./pages/DrivePage'));

function LoadingRoute() {
  return (
    <>
      <ScrollToTop />
      <LoadingScreen />
      <App />
    </>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

const router = createBrowserRouter([

  {
    path: '/sach/:slug/doc.html',
    element: (
      <LazyPage>
        <BookReadPage />
      </LazyPage>
    ),
  },
  {
    path: '/doc-sach',
    element: (
      <LazyPage>
        <BookReadPage />
      </LazyPage>
    ),
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
        <LazyPage>
          <DrivePage />
        </LazyPage>
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
        element: (
          <LazyPage>
            <BookAudioPage />
          </LazyPage>
        ),
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
