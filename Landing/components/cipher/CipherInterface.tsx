'use client';

import React, { useState, useCallback } from 'react';
import { Dropdown } from '@/components/cipher/Dropdown';
import { TextArea } from '@/components/cipher/TextArea';
import { ConvertButton } from '@/components/cipher/ConvertButton';
import { KeyInput } from '@/components/cipher/KeyInput';
import { ciphers, cipherList, CipherKey } from '@/lib/ciphers';

type Mode = 'encode' | 'decode';

export const CipherInterface: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encode');
  const [selectedCipher, setSelectedCipher] = useState<string>('caesar');
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [cipherKey, setCipherKey] = useState<CipherKey>({
    shift: 3,
    keyword: 'KEY',
    rails: 3,
    a: 5,
    b: 8,
  });

  const currentCipher = ciphers[selectedCipher];

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    try {
      const result = mode === 'encode'
        ? currentCipher.encode(inputText, cipherKey)
        : currentCipher.decode(inputText, cipherKey);
      setOutputText(result);
    } catch (error) {
      setOutputText('Error: Unable to process input');
      console.error(error);
    }
  }, [mode, currentCipher, inputText, cipherKey]);

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const modeOptions = [
    { value: 'encode', label: 'Encode' },
    { value: 'decode', label: 'Decode' },
  ];

  const cipherOptions = cipherList.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cipher-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Cipher Tool
        </h1>
        <p className="text-cipher-text-muted max-w-md mx-auto">
          Encode and decode text using 12 different cipher algorithms
        </p>
      </div>

      {/* Main Card */}
      <div className="card p-6 sm:p-8">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Dropdown
            label="Mode"
            options={modeOptions}
            value={mode}
            onChange={(v) => setMode(v as Mode)}
          />
          <Dropdown
            label="Cipher Type"
            options={cipherOptions}
            value={selectedCipher}
            onChange={setSelectedCipher}
          />
          {currentCipher.requiresKey && currentCipher.keyType && (
            <KeyInput
              keyType={currentCipher.keyType}
              keyDescription={currentCipher.keyDescription || ''}
              value={cipherKey}
              onChange={setCipherKey}
            />
          )}
        </div>

        {/* Cipher Info Badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="badge">{currentCipher.name}</span>
          <span className="text-sm text-cipher-text-muted">{currentCipher.description}</span>
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Text Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TextArea
            label={mode === 'encode' ? 'Plain Text' : 'Encoded Text'}
            value={inputText}
            onChange={setInputText}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'}
          />
          <TextArea
            label={mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
            value={outputText}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <ConvertButton onClick={handleConvert} disabled={!inputText.trim()} />
          </div>
          <button
            onClick={handleSwap}
            disabled={!outputText}
            className={`
              py-4 px-6 font-medium rounded-xl
              border border-cipher-border text-cipher-text
              transition-all duration-200
              ${!outputText 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:border-cipher-border-hover hover:bg-cipher-card-hover active:scale-[0.98]'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Swap
            </span>
          </button>
          <button
            onClick={handleClear}
            disabled={!inputText && !outputText}
            className={`
              py-4 px-6 font-medium rounded-xl
              border border-cipher-border text-cipher-text-muted
              transition-all duration-200
              ${!inputText && !outputText
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.98]'
              }
            `}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Cipher Info Card */}
      <div className="mt-6 card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cipher-primary/10 border border-cipher-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-cipher-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">
              About {currentCipher.name}
            </h3>
            <p className="text-cipher-text-muted text-sm leading-relaxed">
              {currentCipher.description}
              {currentCipher.requiresKey && currentCipher.keyDescription && (
                <span className="block mt-2 text-cipher-bright">
                  Required key: {currentCipher.keyDescription}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
