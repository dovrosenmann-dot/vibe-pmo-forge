import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-4xl font-bold text-destructive">Alguma coisa deu errado.</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || "Ocorreu um erro inesperado."}
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
