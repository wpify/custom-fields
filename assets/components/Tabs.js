import { useTabs } from '@/helpers/hooks';
import clsx from 'clsx';

export function Tabs ({ tabs }) {
  const { tab: currentTab, setTab } = useTabs({ tabs });

  return Object.keys(tabs).length > 1 ? (
    <div className="wpifycf-tabs">
      {Object.keys(tabs).map(tab => (
        <button
          key={tab}
          className={clsx('wpifycf-tabs__item', { ['wpifycf-tabs__item--active']: tab === currentTab })}
          type="button"
          onClick={() => setTab(tab)}
        >
          {tabs[tab]}
        </button>
      ))}
    </div>
  ) : null;
}
