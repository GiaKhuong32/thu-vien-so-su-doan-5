import { Link } from 'react-router-dom';
import './PageBanner.css';

export type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  img?: string;
  crumbs: Crumb[];
  title?: string;
};

export default function PageBanner({ img, crumbs, title }: Props) {
  return (
    <div className="banner-page block-bg" style={{ backgroundImage: `url(${img})` }}>
      <div className="container banner-page__inner">
        <div className="text-banner">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <li key={`${c.label}-${i}`} className={`breadcrumb-item${isLast ? ' is-active' : ''}`}>
                    {c.href && !isLast ? (
                      <Link to={c.href} title={c.label}>
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? 'page' : undefined}>{c.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {title && <h1 className="banner-page__tt">{title}</h1>}
        </div>
      </div>
    </div>
  );
}