'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(
  lang: string = 'en-US',
  continuous: boolean = true,
  selectedMicrophone?: string
) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setFinalTranscript(prev => prev + final);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          if (isListening) {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
            }, 100);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if continuous mode is on
        if (continuous && isListening) {
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Recognition restart failed');
              }
            }
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, isListening]);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript('');
      setFinalTranscript('');
      setIsListening(true);

      // Try to use selected microphone if specified
      if (selectedMicrophone && navigator.mediaDevices) {
        try {
          const constraints = {
            audio: {
              deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
            },
          };

          streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);

          // Note: Web Speech API doesn't directly support device selection,
          // but getting the stream first may influence which mic is used
        } catch (error) {
          console.error('Error selecting microphone:', error);
          // Fall back to default microphone
        }
      }

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setIsListening(false);
      }
    }
  }, [isListening, selectedMicrophone]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();

      // Stop the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript: finalTranscript + interimTranscript,
    finalTranscript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}
