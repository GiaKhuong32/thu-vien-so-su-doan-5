import { Link } from 'react-router-dom';
import BookCard, { type Book } from '../BookCard';
import './BookSection.css';

type Props = {
  title: string;
  books: Book[];
  moreHref?: string;
  titleStyle?: 'center' | 'row';
  columns?: 4 | 5;
  id?: string;
};

export default function BookSection({
  title,
  books,
  moreHref,
  titleStyle = 'row',
  columns = 5,
  id,
}: Props) {
  const headingId = id ? `${id}-tt` : undefined;

  return (
    <section className="section-products" id={id} aria-labelledby={headingId}>
      <div className="container section-products__inner">
        {titleStyle === 'center' ? (
          <div className="section-heading">
            <h2 id={headingId} className="tt-center">
              {title}
            </h2>
            <div className="heading-divider">
              <span className="line" />
              <span className="icon-book" aria-hidden="true" />
              <span className="line" />
            </div>
          </div>
        ) : (
          <div className="title-header">
            <h2 id={headingId} className="tt-row">
              <span className="icon-book" aria-hidden="true" />
              {title}
            </h2>
            {moreHref && (
              <Link className="link-more" to={moreHref} title={title}>
                Xem thêm<span className="chev" aria-hidden="true">›</span>
              </Link>
            )}
          </div>
        )}

        <div className={`list-products cols-${columns}`}>
          {books.map((book, i) => (
            <div
              className="list-products__col reveal"
              key={book.href + i}
              style={{ transitionDelay: `${Math.min(i, 9) * 60}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>

        {moreHref && (
          <div className="section-products__more-mobile">
            <Link className="link-more" to={moreHref} title={title}>
              Xem thêm<span className="chev" aria-hidden="true">›</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
