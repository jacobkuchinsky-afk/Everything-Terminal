import type { CipherKey, CipherFunction } from './index';

const processChar = (char: string, keyChar: string, decode: boolean): string => {
  const shift = keyChar.toUpperCase().charCodeAt(0) - 65;
  const actualShift = decode ? -shift : shift;
  
  if (char >= 'A' && char <= 'Z') {
    return String.fromCharCode(((char.charCodeAt(0) - 65 + actualShift + 26) % 26) + 65);
  }
  if (char >= 'a' && char <= 'z') {
    return String.fromCharCode(((char.charCodeAt(0) - 97 + actualShift + 26) % 26) + 97);
  }
  return char;
};

export const vigenere: CipherFunction = {
  name: 'Vigenère Cipher',
  description: 'Uses a keyword to create a polyalphabetic substitution cipher',
  requiresKey: true,
  keyType: 'keyword',
  keyDescription: 'Keyword (letters only)',
  
  encode: (text: string, key?: CipherKey): string => {
    const keyword = (key?.keyword || 'KEY').toUpperCase().replace(/[^A-Z]/g, '');
    if (!keyword) return text;
    
    let keyIndex = 0;
    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const result = processChar(char, keyword[keyIndex % keyword.length], false);
        keyIndex++;
        return result;
      }
      return char;
    }).join('');
  },
  
  decode: (text: string, key?: CipherKey): string => {
    const keyword = (key?.keyword || 'KEY').toUpperCase().replace(/[^A-Z]/g, '');
    if (!keyword) return text;
    
    let keyIndex = 0;
    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const result = processChar(char, keyword[keyIndex % keyword.length], true);
        keyIndex++;
        return result;
      }
      return char;
    }).join('');
  },
};
