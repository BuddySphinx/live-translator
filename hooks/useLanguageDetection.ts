'use client';

import { useState, useEffect, useCallback } from 'react';

// Simple language detection for English vs Chinese
export function detectLanguage(text: string): 'english' | 'chinese' | 'unknown' {
  if (!text || text.trim().length === 0) return 'unknown';

  // Count Chinese characters (CJK Unified Ideographs)
  const chineseCharRegex = /[一-鿿]/g;
  const chineseChars = text.match(chineseCharRegex);
  const chineseCharCount = chineseChars ? chineseChars.length : 0;

  // Count English/Latin characters
  const englishCharRegex = /[a-zA-Z]/g;
  const englishChars = text.match(englishCharRegex);
  const englishCharCount = englishChars ? englishChars.length : 0;

  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'unknown';

  // Calculate percentages
  const chinesePercentage = (chineseCharCount / totalChars) * 100;
  const englishPercentage = (englishCharCount / totalChars) * 100;

  // Lower thresholds for more sensitive detection
  const CHINESE_THRESHOLD = 20; // 20% Chinese characters = Chinese (was 30%)
  const ENGLISH_THRESHOLD = 30;  // 30% English characters = English (was 50%)

  // Prioritize most recently spoken content (last 30 chars)
  const recentText = text.slice(-30);
  const recentChineseChars = recentText.match(chineseCharRegex);
  const recentEnglishChars = recentText.match(englishCharRegex);
  const recentChineseCount = recentChineseChars ? recentChineseChars.length : 0;
  const recentEnglishCount = recentEnglishChars ? recentEnglishChars.length : 0;

  // Check recent content first for quicker switching
  if (recentChineseCount > 2 && recentChineseCount > recentEnglishCount) {
    return 'chinese';
  } else if (recentEnglishCount > 2 && recentEnglishCount > recentChineseCount) {
    return 'english';
  }

  // Fall back to overall percentages
  if (chinesePercentage >= CHINESE_THRESHOLD) {
    return 'chinese';
  } else if (englishPercentage >= ENGLISH_THRESHOLD) {
    return 'english';
  } else if (chinesePercentage > englishPercentage) {
    return 'chinese';
  } else if (englishPercentage > chinesePercentage) {
    return 'english';
  }

  return 'unknown';
}

export function useLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<'english' | 'chinese' | 'unknown'>('unknown');
  const [confidence, setConfidence] = useState(0);

  const detect = useCallback((text: string) => {
    const result = detectLanguage(text);

    // Calculate confidence based on character distribution
    if (text.trim().length === 0) {
      setDetectedLanguage('unknown');
      setConfidence(0);
      return 'unknown';
    }

    const chineseCharRegex = /[一-鿿]/g;
    const englishCharRegex = /[a-zA-Z]/g;
    const chineseCount = (text.match(chineseCharRegex) || []).length;
    const englishCount = (text.match(englishCharRegex) || []).length;
    const total = chineseCount + englishCount;

    if (total === 0) {
      setDetectedLanguage('unknown');
      setConfidence(0);
      return 'unknown';
    }

    const chineseRatio = chineseCount / total;
    const englishRatio = englishCount / total;
    const confidenceScore = Math.max(chineseRatio, englishRatio) * 100;

    setDetectedLanguage(result);
    setConfidence(Math.round(confidenceScore));

    return result;
  }, []);

  const reset = useCallback(() => {
    setDetectedLanguage('unknown');
    setConfidence(0);
  }, []);

  return {
    detectedLanguage,
    confidence,
    detect,
    reset,
  };
}
