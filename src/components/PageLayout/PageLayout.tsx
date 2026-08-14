import type { ReactNode } from 'react';
import './PageLayout.css';

type Props = {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarRight?: boolean;
};

export default function PageLayout({ sidebar, children, sidebarRight = false }: Props) {
  return (
    <div className="block-bg page-body">
      <div className="container page-body__inner">
        <div className={`block-sidebar${sidebarRight ? ' block-sidebar--right' : ''}`}>
          {sidebar}
          <div className="mainbody">{children}</div>
        </div>
      </div>
    </div>
  );
}