import React from 'react';

class ReactHooksErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    
    
    
    // Global error handler for uncaught React errors
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleGlobalError = (event) => {
    console.error('🔍 ReactHooksErrorBoundary - Global error caught:', event.error);
    if (event.error?.message?.includes('useCallback') || 
        event.error?.message?.includes('useState') ||
        event.error?.message?.includes('useEffect')) {
      console.error('🔍 ReactHooksErrorBoundary - React hooks error detected!');
      this.setState({ 
        hasError: true, 
        error: event.error,
        errorInfo: { componentStack: event.error.stack }
      });
    }
  };

  handleUnhandledRejection = (event) => {
    console.error('🔍 ReactHooksErrorBoundary - Unhandled rejection:', event.reason);
  };

  static getDerivedStateFromError(error) {
    console.error('🔍 ReactHooksErrorBoundary - getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔍 ReactHooksErrorBoundary - componentDidCatch:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2>🚨 React Hooks Error Detected</h2>
          <details style={{ marginTop: '10px' }}>
            <summary>Error Details</summary>
            <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ReactHooksErrorBoundary;