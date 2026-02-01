import type { CipherFunction } from './index';

const baconCode: Record<string, string> = {
  'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB', 'E': 'AABAA',
  'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB', 'I': 'ABAAA', 'J': 'ABAAB',
  'K': 'ABABA', 'L': 'ABABB', 'M': 'ABBAA', 'N': 'ABBAB', 'O': 'ABBBA',
  'P': 'ABBBB', 'Q': 'BAAAA', 'R': 'BAAAB', 'S': 'BAABA', 'T': 'BAABB',
  'U': 'BABAA', 'V': 'BABAB', 'W': 'BABBA', 'X': 'BABBB', 'Y': 'BBAAA',
  'Z': 'BBAAB'
};

const reverseBacon: Record<string, string> = Object.fromEntries(
  Object.entries(baconCode).map(([k, v]) => [v, k])
);

export const bacon: CipherFunction = {
  name: "Bacon's Cipher",
  description: 'Encodes each letter as a 5-bit A/B binary pattern',
  requiresKey: false,
  
  encode: (text: string): string => {
    return text.toUpperCase().split('').map(char => {
      if (baconCode[char]) {
        return baconCode[char];
      }
      if (char === ' ') {
        return ' ';
      }
      return '';
    }).join(' ').replace(/\s+/g, ' ').trim();
  },
  
  decode: (text: string): string => {
    // Normalize input: convert to uppercase, keep only A, B, and spaces
    const normalized = text.toUpperCase().replace(/[^AB\s]/g, '');
    const groups = normalized.split(/\s+/).filter(g => g.length > 0);
    
    return groups.map(group => {
      // Handle groups that might be concatenated 5-letter codes
      if (group.length === 5) {
        return reverseBacon[group] || '?';
      }
      
      // Handle longer groups - split into 5-letter chunks
      const letters: string[] = [];
      for (let i = 0; i < group.length; i += 5) {
        const chunk = group.slice(i, i + 5);
        if (chunk.length === 5) {
          letters.push(reverseBacon[chunk] || '?');
        }
      }
      return letters.join('');
    }).join('');
  },
};
