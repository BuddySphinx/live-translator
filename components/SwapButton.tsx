'use client';

import { ArrowLeftRight } from 'lucide-react';

interface SwapButtonProps {
  onSwap: () => void;
  disabled?: boolean;
}

export function SwapButton({ onSwap, disabled = false }: SwapButtonProps) {
  return (
    <button
      onClick={onSwap}
      disabled={disabled}
      className="
        p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full
        transition-all duration-200 hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-lg hover:shadow-xl
      "
      title="Swap languages"
    >
      <ArrowLeftRight size={24} />
    </button>
  );
}
