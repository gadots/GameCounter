import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-sm w-full text-center space-y-4">
            <p className="text-4xl">💥</p>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Algo salió mal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
              {this.state.error.message}
            </p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
