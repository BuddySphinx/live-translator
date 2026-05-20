'use client';

import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceControlsProps {
  lang: string;
  text: string;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeak: () => void;
  isSupported: boolean;
  isSpeaking?: boolean;
}

export function VoiceControls({
  lang,
  text,
  isListening,
  onStartListening,
  onStopListening,
  onSpeak,
  isSupported,
  isSpeaking = false,
}: VoiceControlsProps) {
  if (!isSupported) {
    return (
      <div className="text-xs text-gray-400 italic">
        Voice not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={isListening ? onStopListening : onStartListening}
        disabled={!text || isSpeaking}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
          ${(!text || isSpeaking) && 'opacity-50 cursor-not-allowed'}
        `}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        onClick={onSpeak}
        disabled={!text || isListening}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${isSpeaking
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
          ${(!text || isListening) && 'opacity-50 cursor-not-allowed'}
        `}
        title="Listen to translation"
      >
        <Volume2 size={20} />
      </button>
    </div>
  );
}
