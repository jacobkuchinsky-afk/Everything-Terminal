import type { CipherFunction } from './index';

export const hex: CipherFunction = {
  name: 'Hexadecimal',
  description: 'Converts text to hexadecimal representation',
  requiresKey: false,
  
  encode: (text: string): string => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase();
    }).join(' ');
  },
  
  decode: (text: string): string => {
    // Handle both space-separated and continuous hex
    const cleaned = text.replace(/[^0-9A-Fa-f\s]/g, '');
    const bytes = cleaned.includes(' ')
      ? cleaned.split(/\s+/)
      : cleaned.match(/.{1,2}/g) || [];
    
    return bytes.map(byte => {
      const charCode = parseInt(byte, 16);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  },
};
