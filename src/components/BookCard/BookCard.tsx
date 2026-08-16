import { Link } from 'react-router-dom';
import './BookCard.css';

export type Book = {
  title: string;
  author: string;
  img: string;
  href: string;
  rating?: number;
};

type Props = {
  book: Book;
  /** 'grid' = vertical card (category rows), 'row' = horizontal card (suggest block) */
  variant?: 'grid' | 'row';
  /**
   * Keep the author row even when this book has no author. The parent list sets
   * it to true when *any* book in the group has one, so every card in that group
   * shares the same baseline — and groups where nobody has an author (Sách số,
   * Sách nói…) stay compact, exactly like the original.
   */
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
