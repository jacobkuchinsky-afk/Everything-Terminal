import type { CipherKey, CipherFunction } from './index';

const shiftChar = (char: string, shift: number, decode: boolean = false): string => {
  const actualShift = decode ? -shift : shift;
  
  if (char >= 'A' && char <= 'Z') {
    return String.fromCharCode(((char.charCodeAt(0) - 65 + actualShift + 26) % 26) + 65);
  }
  if (char >= 'a' && char <= 'z') {
    return String.fromCharCode(((char.charCodeAt(0) - 97 + actualShift + 26) % 26) + 97);
  }
  return char;
};

export const caesar: CipherFunction = {
  name: 'Caesar Cipher',
  description: 'Shifts each letter by a fixed number of positions in the alphabet',
  requiresKey: true,
  keyType: 'shift',
  keyDescription: 'Shift amount (1-25)',
  
  encode: (text: string, key?: CipherKey): string => {
    const shift = key?.shift ?? 3;
    return text.split('').map(char => shiftChar(char, shift, false)).join('');
  },
  
  decode: (text: string, key?: CipherKey): string => {
    const shift = key?.shift ?? 3;
    return text.split('').map(char => shiftChar(char, shift, true)).join('');
  },
};
