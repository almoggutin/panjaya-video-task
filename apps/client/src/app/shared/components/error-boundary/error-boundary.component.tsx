import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

type State = {
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	override state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	override componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('[ErrorBoundary]', error, info.componentStack);
	}

	override render() {
		if (this.state.error) {
			return (
				<div style={{ padding: '2rem', color: 'var(--danger)' }}>
					<h2>Something went wrong.</h2>
					<pre style={{ fontSize: '0.75rem', opacity: 0.7 }}>{this.state.error.message}</pre>
				</div>
			);
		}
		return this.props.children;
	}
}
