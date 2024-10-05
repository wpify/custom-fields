import { useTabs } from '@/helpers/hooks';
import clsx from 'clsx';
import { useCallback, useContext } from 'react';
import { AppContext } from '@/custom-fields';

export function Tabs ({ tabs }) {
  const { tab: currentTab, setTab } = useTabs({ tabs });
  const { context } = useContext(AppContext);

  const handleClick = useCallback(tab => event => {
    if (context === 'gutenberg') {
      setTab(tab);
      event.preventDefault();
    }
  }, [context]);

  return Object.keys(tabs).length > 1 ? (
    <nav className="nav-tab-wrapper">
      {Object.keys(tabs).map(tab => (
        <a
          key={tab}
          className={clsx('nav-tab', { ['nav-tab-active']: tab === currentTab })}
          href={`#tab=${tab}`}
          onClick={handleClick(tab)}
        >
          {tabs[tab]}
        </a>
      ))}
    </nav>
  ) : null;
}
