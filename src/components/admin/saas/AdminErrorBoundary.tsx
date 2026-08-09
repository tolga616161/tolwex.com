"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: string | null };

/** Keeps admin chrome alive if a page throws. */
export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error?.message || "Beklenmeyen hata" };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="admin-panel">
          <h3>Sayfa yüklenemedi</h3>
          <p className="muted text-sm mt-2">{this.state.error}</p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Yeniden dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
