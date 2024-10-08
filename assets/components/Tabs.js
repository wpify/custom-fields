import { useTabs } from '@/helpers/hooks';
import clsx from 'clsx';
import { useCallback } from 'react';

export function Tabs () {
  const { tab: currentTab, setTab, tabs } = useTabs();
  const handleClick = useCallback(tab => () => setTab(tab), []);

  return Object.keys(tabs).length > 1 ? (
    <nav className="nav-tab-wrapper">
      {Object.keys(tabs).map(tab => (
        <button
          key={tab}
          className={clsx('nav-tab', { ['nav-tab-active']: tab === currentTab })}
          onClick={handleClick(tab)}
          type="button"
        >
          {tabs[tab]}
        </button>
      ))}
    </nav>
  ) : null;
}
