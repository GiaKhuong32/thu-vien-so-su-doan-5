import { Link } from 'react-router-dom';
import './BookCard.css';

export type Book = {
  title: string;
  author: string;
  img: string;
  href: string;
  rating?: number;
  category?: string;
};

type Props = {
  book: Book;
  variant?: 'grid' | 'row';
  reserveAuthor?: boolean;
};

function Stars({ value = 0 }: { value?: number }) {
  return (
    <div className="rated-star" aria-label={`Đánh giá ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star${i <= value ? ' is-on' : ''}`} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export default function BookCard({ book, variant = 'grid', reserveAuthor = true }: Props) {
  const showAuthor = reserveAuthor || !!book.author;

  return (
    <article className={`book-card book-card--${variant}`}>
      <Link className="book-card__link" to={book.href} title={book.title} aria-label={book.title} />
      <div className="book-card__thumb">
        <img src={book.img} alt={book.title} loading="lazy" />
      </div>
      <div className="book-card__info">
        <h3 className="book-card__title">{book.title}</h3>
        {showAuthor && <div className="book-card__author">{book.author}</div>}
        <Stars value={book.rating} />
      </div>
    </article>
  );
}
