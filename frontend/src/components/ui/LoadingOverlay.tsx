'use client';

import { useEffect, useState } from 'react';

export interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
  progress?: number; // 0-100, if provided shows progress bar
  estimatedTime?: number; // in seconds
  tips?: string[]; // rotating tips to show
}

export default function LoadingOverlay({
  message = '처리 중입니다...',
  submessage,
  progress,
  estimatedTime,
  tips = [
    'AI가 문서를 분석하여 반복 업무를 찾고 있습니다',
    '업무 자동화 가능성을 평가하고 있습니다',
    '최적의 자동화 방안을 제안하고 있습니다',
    '분석 결과를 정리하고 있습니다',
  ],
}: LoadingOverlayProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (tips.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tips.length]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-300/50 p-6 sm:p-8 md:p-12 max-w-md w-full">
        {/* Animated Spinner */}
        <div className="relative mb-6 sm:mb-8">
          <div className="animate-spin w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-100 border-t-blue-600 rounded-full mx-auto"></div>
          {progress !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs sm:text-sm">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {/* Main Message */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-2 sm:mb-3">{message}</h3>

        {/* Submessage */}
        {submessage && <p className="text-sm sm:text-base text-slate-600 text-center mb-4 sm:mb-6">{submessage}</p>}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Rotating Tips */}
        {tips.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
            <p className="text-blue-900 text-center text-xs sm:text-sm leading-relaxed transition-opacity duration-300">
              💡 {tips[currentTipIndex]}
            </p>
          </div>
        )}

        {/* Time Info */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>경과: {formatTime(elapsedTime)}</span>
          </div>
          {estimatedTime && estimatedTime > elapsedTime && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>예상: 약 {formatTime(estimatedTime - elapsedTime)} 남음</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
