import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import logger from '@/utils/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        logger.error('Error Boundary caught an error:', error, errorInfo);

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // Update state with error details
        this.setState({
            error,
            errorInfo
        });

        // In production, you might want to send this to an error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                            Wystąpił błąd
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                        <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Spróbuj ponownie
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="flex-1"
                            >
                                Wróć do strony głównej
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) => {
    return (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );
};
