'use client';

import { useState } from 'react';
import { VoiceControls } from './VoiceControls';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface TranslationBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  lang: string;
  langCode: string;
  readOnly?: boolean;
  showVoice?: boolean;
}

export function TranslationBox({
  label,
  value,
  onChange,
  lang,
  langCode,
  readOnly = false,
  showVoice = true,
}: TranslationBoxProps) {
  const { isListening, transcript, isSupported, startListening, stopListening } =
    useSpeechRecognition(langCode);
  const { speak, isSupported: speakSupported, isSpeaking } = useSpeechSynthesis();

  // Update text when speech recognition produces transcript
  if (transcript && value !== transcript && !readOnly) {
    onChange(transcript);
  }

  const handleSpeak = () => {
    if (value) {
      speak(value, langCode);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        {showVoice && (
          <VoiceControls
            lang={langCode}
            text={value}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
            onSpeak={handleSpeak}
            isSupported={isSupported && speakSupported}
            isSpeaking={isSpeaking}
          />
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={readOnly ? 'Translation will appear here...' : 'Enter text to translate...'}
        className={`
          w-full h-48 p-4 text-base resize-none border-2 rounded-lg
          focus:outline-none transition-all
          ${readOnly
            ? 'bg-gray-50 border-gray-200 text-gray-800'
            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }
          ${isListening ? 'border-red-400 bg-red-50' : ''}
        `}
      />

      {isListening && (
        <div className="text-sm text-red-600 font-medium animate-pulse">
          Listening... Speak now
        </div>
      )}
    </div>
  );
}
