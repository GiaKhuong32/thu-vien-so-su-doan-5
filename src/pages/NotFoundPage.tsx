import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="container">
        <h1>Không tìm thấy dữ liệu</h1>
        <p>Sách không tồn tại hoặc backend chưa trả về dữ liệu phù hợp.</p>

        <Link to="/sach/">
          Quay lại thư viện
        </Link>
      </section>
    </main>
  );
}
