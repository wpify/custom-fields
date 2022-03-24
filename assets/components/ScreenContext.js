import React from 'react';
import GutenbergRootWrapper from './GutenbergRootWrapper';
import GutenbergBlockRow from './GutenbergBlockRow';

const ScreenContext = React.createContext({
	RootWrapper: GutenbergRootWrapper,
	RowWrapper: GutenbergBlockRow,
});

export default ScreenContext;
