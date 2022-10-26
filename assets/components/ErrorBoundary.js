import React from 'react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className={'wcf-error'}>
					Something went wrong. Please reload the page.
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
