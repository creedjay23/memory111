import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#EEF3EF] flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] rounded-3xl border border-[#E4E9E5] bg-white p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-[#17241C]">
                화면을 불러오는 중 문제가 발생했습니다
              </h1>
              <p className="text-sm text-[#5A6B60]">
                잠시 후 다시 시도하거나 처음 화면으로 돌아가 주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="w-full min-h-[48px] rounded-xl bg-[#16783A] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#095A2E] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>다시 시도하기</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
