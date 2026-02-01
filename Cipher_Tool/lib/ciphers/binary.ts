import type { CipherFunction } from './index';

export const binary: CipherFunction = {
  name: 'Binary',
  description: 'Converts text to 8-bit binary representation',
  requiresKey: false,
  
  encode: (text: string): string => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  },
  
  decode: (text: string): string => {
    // Handle both space-separated and continuous binary
    const cleaned = text.replace(/[^01\s]/g, '');
    const bytes = cleaned.includes(' ') 
      ? cleaned.split(/\s+/)
      : cleaned.match(/.{1,8}/g) || [];
    
    return bytes.map(byte => {
      const charCode = parseInt(byte, 2);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  },
};
