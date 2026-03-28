'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <div className="mb-3 text-3xl">⚠️</div>
          <h3 className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">
            Something went wrong
          </h3>
          <p className="mb-4 text-xs text-red-600 dark:text-red-400">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
