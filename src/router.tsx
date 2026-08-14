import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import BookListPage from './pages/BookListPage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/sach',
    element: <BookListPage />,
  },
  {
    path: '/sach/:category',
    element: <BookListPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
