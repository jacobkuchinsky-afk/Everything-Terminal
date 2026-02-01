import type { CipherFunction } from './index';

const atbashChar = (char: string): string => {
  if (char >= 'A' && char <= 'Z') {
    return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
  }
  if (char >= 'a' && char <= 'z') {
    return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
  }
  return char;
};

export const atbash: CipherFunction = {
  name: 'Atbash Cipher',
  description: 'Reverses the alphabet (A↔Z, B↔Y, etc.)',
  requiresKey: false,
  
  encode: (text: string): string => {
    return text.split('').map(atbashChar).join('');
  },
  
  decode: (text: string): string => {
    // Atbash is symmetric - encoding and decoding are the same
    return text.split('').map(atbashChar).join('');
  },
};
