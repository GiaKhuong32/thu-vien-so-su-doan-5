import BookCard, { type Book } from '../BookCard';
import './BookGrid.css';

type Props = {
  books: Book[];
  columns?: 3 | 4;
  emptyText?: string;
};

export default function BookGrid({ books, columns = 4, emptyText = 'Chưa có tài liệu nào.' }: Props) {
  if (!books.length) {
    return <p className="book-grid__empty">{emptyText}</p>;
  }

  const reserveAuthor = books.some((b) => !!b.author);

  return (
    <div className={`book-grid book-grid--${columns}`}>
      {books.map((book, i) => (
        <div
          className="book-grid__col reveal"
          key={book.href + i}
          style={{ transitionDelay: `${Math.min(i, 11) * 45}ms` }}
        >
          <BookCard book={book} reserveAuthor={reserveAuthor} />
        </div>
      ))}
    </div>
  );
}