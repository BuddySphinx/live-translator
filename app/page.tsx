'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Languages, RotateCcw, Settings, RefreshCw, Sparkles } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useMicrophoneSelection } from '@/hooks/useMicrophoneSelection';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';

interface Language {
  value: string;
  label: string;
  code: string;
}

const LANGUAGES: Language[] = [
  { value: 'english', label: 'English', code: 'en-US' },
  { value: 'chinese', label: '中文', code: 'zh-CN' },
];

export default function Home() {
  const [sourceLang, setSourceLang] = useState(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState(LANGUAGES[1]);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isAutoTranslating, setIsAutoTranslating] = useState(true);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const translationInProgress = useRef(false);
  const lastTranslatedLength = useRef(0);

  const {
    microphones,
    selectedMicrophone,
    selectMicrophone,
    hasPermission,
    requestPermission,
    refreshMicrophones,
  } = useMicrophoneSelection();

  const { speak, isSupported: speakSupported, isSpeaking } = useSpeechSynthesis();

  const {
    isListening,
    transcript,
    finalTranscript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition(sourceLang.code, true, selectedMicrophone);

  const [showMicSettings, setShowMicSettings] = useState(false);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);

  const { detectedLanguage, confidence, detect, reset: resetDetection } = useLanguageDetection();

  // Auto-translate when transcript changes
  useEffect(() => {
    if (isAutoTranslating && finalTranscript && !translationInProgress.current) {
      // Only translate if there's new content
      const newText = finalTranscript.slice(lastTranslatedLength.current);

      if (newText.trim().length > 0) {
        // Debounce translation to avoid API spam
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const timer = setTimeout(async () => {
          await translateText(newText, finalTranscript.length);
        }, 150); // Much faster - Translate 150ms after last speech

        setDebounceTimer(timer);
      }
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [finalTranscript, isAutoTranslating]);

  const translateText = async (newText: string, totalLength: number) => {
    if (!newText || translationInProgress.current) return;

    translationInProgress.current = true;

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newText,
          sourceLang: sourceLang.label,
          targetLang: targetLang.label,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translation) {
          // Append new translation to existing
          setTranslatedText(prev => prev + data.translation + ' ');
          lastTranslatedLength.current = totalLength;
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      translationInProgress.current = false;
    }
  };


  const handleSpeakTranslation = () => {
    if (translatedText) {
      speak(translatedText, targetLang.code);
    }
  };

  const handleSwapLanguages = () => {
    if (!isListening) {
      const newSourceLang = targetLang;
      const newTargetLang = sourceLang;
      setSourceLang(newSourceLang);
      setTargetLang(newTargetLang);

      // Swap text
      if (translatedText) {
        setSourceText(translatedText);
        setTranslatedText('');
        clearTranscript();
        lastTranslatedLength.current = 0;
      }
    }
  };

  const handleClear = () => {
    clearTranscript();
    setSourceText('');
    setTranslatedText('');
    lastTranslatedLength.current = 0;
    resetDetection();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      resetDetection();
    } else {
      clearTranscript();
      setSourceText('');
      setTranslatedText('');
      resetDetection();
      startListening();
    }
  };

  const handleMicPermissionRequest = async () => {
    await requestPermission();
  };

  const handleRefreshMicrophones = async () => {
    await refreshMicrophones();
  };

  // Update source text as speech comes in
  useEffect(() => {
    if (transcript) {
      setSourceText(transcript);

      // Auto-detect language if enabled (detects while speaking!)
      if (autoDetectLanguage) {
        const detected = detect(transcript);
        if (detected !== 'unknown' && detected !== sourceLang.value) {
          console.log('🌍 Language detected:', detected, 'Previous:', sourceLang.value); // Debug log

          // Auto-switch source language
          const newSourceLang = LANGUAGES.find(l => l.value === detected);
          if (newSourceLang) {
            setSourceLang(newSourceLang);
            // Auto-swap target language to opposite
            const newTargetLang = LANGUAGES.find(l => l.value !== detected);
            if (newTargetLang) {
              setTargetLang(newTargetLang);
            }
          }
        }
      }
    }
  }, [transcript, autoDetectLanguage]);

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 mb-4">
            <MicOff size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Browser Not Supported
          </h2>
          <p className="text-gray-600">
            Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-3 flex-1 flex flex-col max-w-7xl">
        {/* Compact Header */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Languages className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">
              Live Translator
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Real-time voice translation • Speak continuously
          </p>
        </div>

        {/* Language Selector & Microphone Settings */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Settings</h3>
            <button
              onClick={() => setShowMicSettings(!showMicSettings)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Microphone settings"
            >
              <Settings size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Microphone Selection */}
          {showMicSettings && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Microphone</h4>
                <button
                  onClick={handleRefreshMicrophones}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Refresh microphones"
                >
                  <RefreshCw size={16} className="text-gray-600" />
                </button>
              </div>

              {hasPermission === null && (
                <div className="text-sm text-gray-600">
                  <button
                    onClick={handleMicPermissionRequest}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Allow Microphone Access
                  </button>
                </div>
              )}

              {hasPermission === false && (
                <div className="text-sm text-red-600">
                  Microphone permission denied. Please allow access in your browser settings.
                </div>
              )}

              {hasPermission === true && microphones.length === 0 && (
                <div className="text-sm text-gray-600">
                  No microphones found. Make sure a microphone is connected.
                </div>
              )}

              {hasPermission === true && microphones.length > 0 && (
                <div className="space-y-2">
                  {microphones.map((mic) => (
                    <label
                      key={mic.deviceId}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                        ${selectedMicrophone === mic.deviceId
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="microphone"
                        value={mic.deviceId}
                        checked={selectedMicrophone === mic.deviceId}
                        onChange={() => selectMicrophone(mic.deviceId)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{mic.label}</div>
                        {selectedMicrophone === mic.deviceId && (
                          <div className="text-xs text-blue-600">Currently selected</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Language Selectors */}
          <div className="flex items-center justify-center gap-3">
            <select
              value={sourceLang.value}
              onChange={(e) => {
                if (!autoDetectLanguage) {
                  const selected = LANGUAGES.find((lang) => lang.value === e.target.value);
                  if (selected) {
                    setSourceLang(selected);
                    // Auto-swap target language to opposite
                    const newTargetLang = LANGUAGES.find(l => l.value !== e.target.value);
                    if (newTargetLang) setTargetLang(newTargetLang);
                  }
                }
              }}
              className={`px-4 py-2 text-base font-semibold bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${autoDetectLanguage ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={autoDetectLanguage}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleSwapLanguages}
              disabled={isListening}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Swap languages"
            >
              <RotateCcw size={20} />
            </button>

            <select
              value={targetLang.value}
              onChange={(e) => {
                if (!autoDetectLanguage) {
                  const selected = LANGUAGES.find((lang) => lang.value === e.target.value);
                  if (selected) {
                    setTargetLang(selected);
                    // Auto-swap source language to opposite
                    const newSourceLang = LANGUAGES.find(l => l.value !== e.target.value);
                    if (newSourceLang) setSourceLang(newSourceLang);
                  }
                }
              }}
              className={`px-4 py-2 text-base font-semibold bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${autoDetectLanguage ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={autoDetectLanguage}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Area - Expanded to fill available space */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 flex-1 min-h-0">
          {/* Source Text */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {sourceLang.label}
                </h2>
                {autoDetectLanguage && detectedLanguage !== 'unknown' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                    <Sparkles size={12} className="text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">
                      {confidence}% detected
                    </span>
                  </div>
                )}
              </div>
              {isListening && (
                <div className="flex items-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Listening...</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 bg-gray-50 rounded-lg overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap">
                {sourceText || (
                  <span className="text-gray-400 italic">
                    {isListening ? 'Speak now...' : 'Click the microphone to start'}
                  </span>
                )}
              </p>
              {interimTranscript && (
                <p className="text-gray-400 italic mt-2">{interimTranscript}</p>
              )}
            </div>
          </div>

          {/* Translated Text */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">
                {targetLang.label}
              </h2>
              <button
                onClick={handleSpeakTranslation}
                disabled={!translatedText || isSpeaking}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Listen to translation"
              >
                <Volume2 size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 bg-blue-50 rounded-lg overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                {translatedText || (
                  <span className="text-gray-400 italic">Translation will appear here...</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Control Bar - Compact */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          {/* Current Microphone Display */}
          {hasPermission === true && microphones.length > 0 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700">
                <Mic size={14} />
                <span className="font-medium">
                  {microphones.find(m => m.deviceId === selectedMicrophone)?.label || 'Default Microphone'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={isListening}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RotateCcw size={16} />
              Clear
            </button>

            {/* Main Mic Button */}
            <button
              onClick={toggleListening}
              className={`
                relative p-5 rounded-full transition-all duration-200
                ${isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white scale-110'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                }
                shadow-lg hover:shadow-xl
              `}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              )}
            </button>

            {/* Auto-detect Language Toggle */}
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-500" />
              <label className="text-xs font-medium text-gray-700">Auto-detect</label>
              <button
                onClick={() => setAutoDetectLanguage(!autoDetectLanguage)}
                className={`
                  relative w-10 h-5 rounded-full transition-colors duration-200
                  ${autoDetectLanguage ? 'bg-purple-500' : 'bg-gray-300'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${autoDetectLanguage ? 'left-5' : 'left-0.5'}
                  `}
                />
              </button>
            </div>

            {/* Auto-translate Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Auto-translate</label>
              <button
                onClick={() => setIsAutoTranslating(!isAutoTranslating)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${isAutoTranslating ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                    ${isAutoTranslating ? 'left-6' : 'left-0.5'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              {isListening
                ? autoDetectLanguage
                  ? `Listening... (Detected: ${detectedLanguage !== 'unknown' ? detectedLanguage : 'Analyzing...'} ${confidence}% confidence)`
                  : 'Listening continuously... Speak naturally'
                : 'Click the microphone to start real-time translation'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs">
          <p>Powered by DeepSeek AI • Built with Next.js</p>
        </div>
      </div>
    </main>
  );
}
