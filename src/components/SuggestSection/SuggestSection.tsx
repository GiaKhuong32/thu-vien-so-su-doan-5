import BookCard, { type Book } from '../BookCard';
import './SuggestSection.css';
import promoImg from '../../assets/ads/coconut_landscape_1250x2500.jpg';

type Props = {
  title?: string;
  books: Book[];
  promo?: { img: string; href: string; alt?: string };
};

const defaultPromo = {
  img: promoImg,
  href: '/tin-tuc/su-kien-online-chuoi-chuong-trinh-trien-lam-trung-bay-tro-chuyen-trai-nghiem-van-minh-lua-nuoc-dong-bang-song-cuu-long.html',
  alt: 'Thư viện gợi ý cho bạn',
};

export default function SuggestSection({
  title = 'Thư viện gợi ý cho bạn',
  books,
  promo = defaultPromo,
}: Props) {
  return (
    <section className="section-suggest" aria-labelledby="suggest-tt">
      <div className="container section-suggest__inner">
        <div className="section-suggest__promo reveal">
          <a className="promo-thumb" href={promo.href} title={promo.alt}>
            <img src={promo.img} alt={promo.alt ?? title} loading="lazy" />
          </a>
        </div>

        <div className="section-suggest__list">
          <h2 id="suggest-tt" className="tt-center">
            {title}
          </h2>
          <div className="grid-products">
            {books.map((book, i) => (
              <div
                className="grid-products__item reveal"
                key={book.href + i}
                style={{ transitionDelay: `${Math.min(i, 6) * 70}ms` }}
              >
                <BookCard book={book} variant="row" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
