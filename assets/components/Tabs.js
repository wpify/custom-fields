import { useTabs } from '@/helpers/hooks';
import clsx from 'clsx';

export function Tabs ({ tabs }) {
  const { tab: currentTab } = useTabs({ tabs });

  return Object.keys(tabs).length > 1 ? (
    <nav className="nav-tab-wrapper">
      {Object.keys(tabs).map(tab => (
        <a
          key={tab}
          className={clsx('nav-tab', { ['nav-tab-active']: tab === currentTab })}
          href={`#tab=${tab}`}
        >
          {tabs[tab]}
        </a>
      ))}
    </nav>
  ) : null;
}
