import { Link } from 'react-router-dom';
import './AdsBanner.css';

type Props = {
  img: string;
  href: string;
  alt?: string;
};

export default function AdsBanner({ img, href, alt = 'Banner' }: Props) {
  return (
    <section className="section-ads">
      <div className="container">
        <Link className="thumb-ad reveal" to={href} title={alt}>
          <img src={img} alt={alt} loading="lazy" />
        </Link>
      </div>
    </section>
  );
}
