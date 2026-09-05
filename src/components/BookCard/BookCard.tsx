import { Link } from 'react-router-dom';
import './BookCard.css';

export type Book = {
  title: string;
  author: string;
  img: string;
  href: string;
  rating?: number;
  category?: string;
  publishYear?: number;
};

type Props = {
  book: Book;
  variant?: 'grid' | 'row';
  reserveAuthor?: boolean;
};

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
        {book.publishYear && (
          <div className="book-card__publish-year">Xuất bản: {book.publishYear}</div>
        )}
      </div>
    </article>
  );
}
