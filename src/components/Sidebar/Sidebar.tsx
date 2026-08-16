import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

export type CategoryNode = {
  label: string;
  href: string;
  children?: CategoryNode[];
};

export type TopicTag = {
  label: string;
  href: string;
};

type Props = {
  categories: CategoryNode[];
  topics: TopicTag[];
  activeHref?: string;
  activeTopicHref?: string;
  categoryTitle?: string;
  topicTitle?: string;
};

function PaneIcon() {
  return (
    <svg className="pane-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 5.2A1.7 1.7 0 0 1 4.7 3.5h4.4c1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3h4.4A1.7 1.7 0 0 1 20.5 5.2v12.1a1.2 1.2 0 0 1-1.2 1.2h-4.4c-1 0-1.9.6-2.4 1.4h-1c-.5-.8-1.4-1.4-2.4-1.4H4.7a1.2 1.2 0 0 1-1.2-1.2V5.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 6.6v12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Chevron() {
  return (
    <span className="i-vertical" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="m9 5 7 7-7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Pane({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className={`pane pane-menu${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`pane-tt${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <PaneIcon />
        <span>{title}</span>
        <Chevron />
      </button>
      <div className={`pane-body${open ? ' is-open' : ''}`}>{children}</div>
    </div>
  );
}

function CategoryRow({
  node,
  activeHref,
}: {
  node: CategoryNode;
  activeHref?: string;
}) {
  const hasKids = !!node.children?.length;
  const containsActive = hasKids && node.children!.some((c) => c.href === activeHref);
  const [open, setOpen] = useState(containsActive);
  const isActive = node.href === activeHref;

  return (
    <li className={`${open ? 'is-open ' : ''}${isActive || containsActive ? 'is-active' : ''}`}>
      <Link
        to={node.href}
        title={node.label}
        onClick={
          hasKids
            ? (e) => {
               
                e.preventDefault();
                setOpen((v) => !v);
              }
            : undefined
        }
      >
        <span>{node.label}</span>
        {hasKids && <Chevron />}
      </Link>

      {hasKids && (
        <ul className={open ? 'is-open' : undefined}>
          {node.children!.map((kid) => (
            <li key={kid.href} className={kid.href === activeHref ? 'is-active' : undefined}>
              <Link to={kid.href} title={kid.label}>
                <span>{kid.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({
  categories,
  topics,
  activeHref,
  activeTopicHref,
  categoryTitle = 'Danh mục sách',
  topicTitle = 'Chủ đề & Tác giả',
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__stick">
        <Pane title={categoryTitle}>
          <ul className="menu-vertical">
            {categories.map((c) => (
              <CategoryRow key={c.href} node={c} activeHref={activeHref} />
            ))}
          </ul>
        </Pane>

        <Pane title={topicTitle}>
          <ul className="list-filter">
            {topics.map((t) => (
              <li className="filter-item" key={t.href}>
                <Link
                  className={`filter-link${t.href === activeTopicHref ? ' is-active' : ''}`}
                  to={t.href}
                  title={t.label.trim()}
                >
                  {t.label.trim()}
                </Link>
              </li>
            ))}
          </ul>
        </Pane>
      </div>
    </aside>
  );
}
