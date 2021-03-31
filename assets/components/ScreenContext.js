import React from 'react';

const ScreenContext = React.createContext({
	RootWrapper: () => null,
	RowWrapper: () => null,
});

ScreenContext.displayName = 'ScreenContext';

export default ScreenContext;
