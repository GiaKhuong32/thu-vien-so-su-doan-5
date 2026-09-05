import { useState } from 'react';
import './ReviewForm.css';

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);

  const shown = hover || rating;

  return (
    <form
      className="form-rated"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="form-rated__stars">
        <span className="text-desc">Đánh giá:</span>
        <div className="star-rate" role="radiogroup" aria-label="Chấm điểm">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              type="button"
              key={i}
              className={`star${i <= shown ? ' is-on' : ''}`}
              aria-label={`${i} sao`}
              aria-checked={rating === i}
              role="radio"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <input
          id="rv-name"
          className={`form-control${name ? ' has-value' : ''}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="label-text" htmlFor="rv-name">
          Họ và tên
        </label>
      </div>

      <div className="form-group">
        <textarea
          id="rv-content"
          className={`form-control${content ? ' has-value' : ''}`}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <label className="label-text" htmlFor="rv-content">
          Nội dung
        </label>
      </div>

      <button className="btn btn-primary" type="submit">
        Gửi nhận xét
      </button>

      {sent && (
        <p className="form-rated__done" role="status">
          Cảm ơn bạn đã gửi nhận xét!
        </p>
      )}
    </form>
  );
}
