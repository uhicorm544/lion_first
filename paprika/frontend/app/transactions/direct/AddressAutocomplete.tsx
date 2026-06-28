'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AddressAutocomplete.module.css';

interface Suggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
}

interface GooglePrediction {
  placeId?: string;
  text?: { text?: string };
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
}
//GooglePrediction : 구글 장소 정보
interface GoogleSuggestion {
  placePrediction?: GooglePrediction;
}

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: { text: string; placeId: string }) => void;
  placeholder?: string;
  inputClassName?: string;
}

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

export default function AddressAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  inputClassName,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  // 사용자가 목록에서 항목을 선택한 직후에는 재검색을 건너뛴다.
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const keyword = value.trim();
    if (keyword.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return;
    }

    // 입력할 때마다 호출하지 않도록 300ms 디바운스
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(AUTOCOMPLETE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat',
          },
          body: JSON.stringify({
            input: keyword,
            languageCode: 'ko',
            includedRegionCodes: ['kr'],
          }),
        });

        const data: { suggestions?: GoogleSuggestion[] } = await response.json();
        const parsed: Suggestion[] = (data.suggestions ?? [])
          .filter((item): item is Required<GoogleSuggestion> => Boolean(item.placePrediction))
          .map((item) => {
            const prediction = item.placePrediction;
            return {
              placeId: prediction.placeId ?? '',
              text: prediction.text?.text ?? '',
              mainText: prediction.structuredFormat?.mainText?.text ?? '',
              secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
            };
          });

        setSuggestions(parsed);
        setOpen(parsed.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  /* 추천 장소 선택했을떄 그다음 처리 */
  const handleSelect = (suggestion: Suggestion) => {
    skipNextFetch.current = true;
    onChange(suggestion.text);
    onSelect?.({ text: suggestion.text, placeId: suggestion.placeId });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        className={inputClassName}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      
      // 자동완성 추천 목록을 화면에 실제로 그리는 JSX
      {open && suggestions.length > 0 && (
        <ul className={styles.list}>
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId} className={styles.item}>
              <button
                type="button"
                className={styles.itemButton}
                // onClick보다 먼저 실행되어 input blur로 목록이 닫히기 전에 선택을 처리
                onMouseDown={() => handleSelect(suggestion)}
              >
                <span className={styles.main}>{suggestion.mainText || suggestion.text}</span>
                {suggestion.secondaryText && (
                  <span className={styles.secondary}>{suggestion.secondaryText}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
