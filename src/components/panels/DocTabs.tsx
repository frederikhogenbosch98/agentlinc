import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Docs } from '../../types';

type DocTab = keyof Docs;

const TABS: { key: DocTab; label: string; placeholder: string }[] = [
  { key: 'description', label: 'Description', placeholder: 'What does this system do? Describe the algorithm, math, purpose...' },
  { key: 'tests', label: 'Tests', placeholder: 'Test plan: expected inputs/outputs, edge cases, unit test ideas...' },
  { key: 'logging', label: 'Logging', placeholder: 'What to log, at what level, what format...' },
  { key: 'debug', label: 'Debug', placeholder: 'Known issues, debugging tips, things to watch out for...' },
];

interface DocTabsProps {
  docs: Docs;
  onChange: (docs: Docs) => void;
}

export function DocTabs({ docs, onChange }: DocTabsProps) {
  const [activeTab, setActiveTab] = useState<DocTab>('description');
  const [isEditing, setIsEditing] = useState(false);
  // Local draft state so typing doesn't hit the store on every keystroke
  const [draft, setDraft] = useState(docs[activeTab]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync draft when docs change externally or tab switches
  useEffect(() => {
    setDraft(docs[activeTab]);
  }, [docs, activeTab]);

  const handleChange = useCallback(
    (value: string) => {
      setDraft(value);
      // Debounce the store update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange({ ...docs, [activeTab]: value });
      }, 400);
    },
    [docs, activeTab, onChange]
  );

  // Flush on blur so nothing is lost
  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (draft !== docs[activeTab]) {
      onChange({ ...docs, [activeTab]: draft });
    }
  }, [draft, docs, activeTab, onChange]);

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="doc-tabs">
      <div className="doc-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`doc-tab ${activeTab === tab.key ? 'active' : ''} ${docs[tab.key] ? 'has-content' : ''}`}
            onClick={() => { setActiveTab(tab.key); setIsEditing(false); }}
          >
            {tab.label}
            {docs[tab.key] && <span className="doc-tab-dot" />}
          </button>
        ))}
      </div>
      <div className="doc-tabs-body">
        <div className="doc-tabs-toolbar">
          <button
            className="doc-tabs-toggle"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        </div>
        {isEditing ? (
          <textarea
            className="doc-tabs-editor"
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={currentTab.placeholder}
            spellCheck={false}
          />
        ) : (
          <div className="doc-tabs-preview">
            {draft ? (
              <ReactMarkdown>{draft}</ReactMarkdown>
            ) : (
              <p className="doc-tabs-empty">{currentTab.placeholder}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
