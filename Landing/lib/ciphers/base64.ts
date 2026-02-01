import type { CipherFunction } from './index';

export const base64: CipherFunction = {
  name: 'Base64',
  description: 'Standard Base64 encoding/decoding',
  requiresKey: false,
  
  encode: (text: string): string => {
    try {
      // Handle Unicode characters properly
      return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch {
      return 'Error: Unable to encode text';
    }
  },
  
  decode: (text: string): string => {
    try {
      // Handle Unicode characters properly
      return decodeURIComponent(
        atob(text).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
    } catch {
      return 'Error: Invalid Base64 string';
    }
  },
};
