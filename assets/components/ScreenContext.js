import React from 'react';

const ScreenContext = React.createContext({
	RootWrapper: ({ key, children }) => {
		return (
			<React.Fragment key={key}>
				{children}
			</React.Fragment>
		);
	},
	RowWrapper: ({ key, children }) => {
		return (
			<React.Fragment key={key}>
				{children}
			</React.Fragment>
		);
	},
});

ScreenContext.displayName = 'ScreenContext';

export default ScreenContext;
