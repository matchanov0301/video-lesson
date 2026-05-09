import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import i18n from './i18n'
import WebApp from '@twa-dev/sdk'

import { I18nextProvider } from 'react-i18next'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#111', height: '100vh', width: '100vw' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <p style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.info && this.state.info.componentStack}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

WebApp.ready()

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
};

if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on('initialized', renderApp);
}
