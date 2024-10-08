import clsx from 'clsx';
import { useCallback, useContext } from 'react';
import { AppContext } from '@/custom-fields';

export function Tabs () {
  const { currentTab, setTab, tabs } = useContext(AppContext);
  const handleClick = useCallback(tab => () => setTab(tab), [setTab]);

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
