import type { CipherKey, CipherFunction } from './index';

export const railfence: CipherFunction = {
  name: 'Rail Fence Cipher',
  description: 'Zigzag transposition cipher using multiple rails',
  requiresKey: true,
  keyType: 'rails',
  keyDescription: 'Number of rails (2-10)',
  
  encode: (text: string, key?: CipherKey): string => {
    const rails = Math.min(Math.max(key?.rails ?? 3, 2), 10);
    if (text.length <= rails) return text;
    
    const fence: string[][] = Array.from({ length: rails }, () => []);
    let rail = 0;
    let direction = 1;
    
    for (const char of text) {
      fence[rail].push(char);
      rail += direction;
      
      if (rail === 0 || rail === rails - 1) {
        direction = -direction;
      }
    }
    
    return fence.flat().join('');
  },
  
  decode: (text: string, key?: CipherKey): string => {
    const rails = Math.min(Math.max(key?.rails ?? 3, 2), 10);
    const len = text.length;
    if (len <= rails) return text;
    
    // Calculate the length of each rail
    const railLengths: number[] = Array(rails).fill(0);
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < len; i++) {
      railLengths[rail]++;
      rail += direction;
      if (rail === 0 || rail === rails - 1) {
        direction = -direction;
      }
    }
    
    // Fill the fence with characters from the encoded text
    const fence: string[][] = [];
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      fence.push(text.slice(idx, idx + railLengths[r]).split(''));
      idx += railLengths[r];
    }
    
    // Read off the fence in zigzag pattern
    const result: string[] = [];
    const railIndices = Array(rails).fill(0);
    rail = 0;
    direction = 1;
    
    for (let i = 0; i < len; i++) {
      result.push(fence[rail][railIndices[rail]]);
      railIndices[rail]++;
      rail += direction;
      if (rail === 0 || rail === rails - 1) {
        direction = -direction;
      }
    }
    
    return result.join('');
  },
};
