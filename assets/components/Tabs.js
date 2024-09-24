import { useCallback } from 'react';
import { useTab } from '@/helpers/hooks';
import clsx from 'clsx';

export function Tabs ({ tabs }) {
  const currentTab = useTab(state => state.tab);
  const setTab = useTab(state => state.setTab);
  const handleTabChange = useCallback(tab => () => setTab(tab), [setTab]);

  return Object.keys(tabs).length > 1 ? (
    <div className="wpifycf-tabs">
      {Object.keys(tabs).map(tab => (
        <button
          key={tab}
          className={clsx('wpifycf-tabs__item', { ['wpifycf-tabs__item--active']: tab === currentTab })}
          type="button"
          onClick={handleTabChange(tab)}
        >
          {tabs[tab]}
        </button>
      ))}
    </div>
  ) : null;
}
