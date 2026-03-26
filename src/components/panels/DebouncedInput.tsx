import { useState, useEffect, useRef, useCallback } from 'react';

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  className?: string;
  placeholder?: string;
}

export function DebouncedInput({ value, onChange, delay = 400, className, placeholder }: DebouncedInputProps) {
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setDraft(value); }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDraft(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), delay);
  }, [onChange, delay]);

  const handleBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (draft !== value) onChange(draft);
  }, [draft, value, onChange]);

  return (
    <input
      className={className}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}

interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  className?: string;
  placeholder?: string;
  rows?: number;
  spellCheck?: boolean;
}

export function DebouncedTextarea({ value, onChange, delay = 400, className, placeholder, rows, spellCheck }: DebouncedTextareaProps) {
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setDraft(value); }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setDraft(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), delay);
  }, [onChange, delay]);

  const handleBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (draft !== value) onChange(draft);
  }, [draft, value, onChange]);

  return (
    <textarea
      className={className}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      rows={rows}
      spellCheck={spellCheck}
    />
  );
}
