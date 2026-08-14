import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="wrapper" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Trang không tìm thấy</h2>
      <Link 
        to="/" 
        style={{ 
          display: 'inline-block', 
          padding: '12px 24px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}
