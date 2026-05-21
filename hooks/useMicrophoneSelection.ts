'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MicrophoneDevice {
  deviceId: string;
  label: string;
}

export function useMicrophoneSelection() {
  const [microphones, setMicrophones] = useState<MicrophoneDevice[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request permission and enumerate devices
  const requestPermission = useCallback(async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: MicrophoneDevice[] = devices
  .filter((device: MediaDeviceInfo) => device.kind === 'audioinput')
  .map((device: MediaDeviceInfo, index: number) => ({
    deviceId: device.deviceId,
    label: device.label || `Microphone ${index + 1}`,
  }));      
      setMicrophones(audioInputs);
      setHasPermission(true);

      // Select first microphone by default
      if (audioInputs.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }

      // Stop the stream we used for permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      return audioInputs;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      return [];
    }
  }, [selectedMicrophone]);

  // Refresh microphone list
  const refreshMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone`,
        }));

      setMicrophones(audioInputs);

      // Keep selected mic if it still exists, otherwise select first
      if (audioInputs.length > 0) {
        const stillExists = audioInputs.find(mic => mic.deviceId === selectedMicrophone);
        if (!stillExists) {
          setSelectedMicrophone(audioInputs[0].deviceId);
        }
      }
    } catch (error) {
      console.error('Error refreshing microphones:', error);
    }
  }, [selectedMicrophone]);

  // Select a specific microphone
  const selectMicrophone = useCallback(async (deviceId: string) => {
    setSelectedMicrophone(deviceId);
  }, []);

  // Initialize on mount
  useEffect(() => {
    requestPermission();
  }, []);

  // Listen for device changes
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', refreshMicrophones);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', refreshMicrophones);
      };
    }
  }, [refreshMicrophones]);

  return {
    microphones,
    selectedMicrophone,
    selectMicrophone,
    hasPermission,
    requestPermission,
    refreshMicrophones,
  };
}
