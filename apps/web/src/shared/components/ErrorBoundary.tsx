import React, { Component, ErrorInfo } from 'react';
import { Button } from '@foodiego/ui';
import { AlertCircle } from 'lucide-react';

type Props = React.PropsWithChildren<{}>;

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground max-w-[500px]">
            We encountered an unexpected error while trying to render this page.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
