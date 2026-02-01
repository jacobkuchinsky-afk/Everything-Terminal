import type { CipherFunction } from './index';

const rot13Char = (char: string): string => {
  if (char >= 'A' && char <= 'Z') {
    return String.fromCharCode(((char.charCodeAt(0) - 65 + 13) % 26) + 65);
  }
  if (char >= 'a' && char <= 'z') {
    return String.fromCharCode(((char.charCodeAt(0) - 97 + 13) % 26) + 97);
  }
  return char;
};

export const rot13: CipherFunction = {
  name: 'ROT13',
  description: 'Rotates each letter by 13 positions (self-inverse)',
  requiresKey: false,
  
  encode: (text: string): string => {
    return text.split('').map(rot13Char).join('');
  },
  
  decode: (text: string): string => {
    // ROT13 is symmetric - applying it twice returns the original
    return text.split('').map(rot13Char).join('');
  },
};
