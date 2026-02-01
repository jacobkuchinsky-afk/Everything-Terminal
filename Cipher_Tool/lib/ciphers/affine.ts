import type { CipherKey, CipherFunction } from './index';

// Valid 'a' values that are coprime with 26
const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

// Modular multiplicative inverse
const modInverse = (a: number, m: number): number => {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return 1;
};

const affineChar = (char: string, a: number, b: number, decode: boolean): string => {
  const isUpper = char >= 'A' && char <= 'Z';
  const isLower = char >= 'a' && char <= 'z';
  
  if (!isUpper && !isLower) return char;
  
  const base = isUpper ? 65 : 97;
  const x = char.charCodeAt(0) - base;
  
  let result: number;
  if (decode) {
    const aInv = modInverse(a, 26);
    result = (aInv * (x - b + 26)) % 26;
  } else {
    result = (a * x + b) % 26;
  }
  
  return String.fromCharCode(result + base);
};

export const affine: CipherFunction = {
  name: 'Affine Cipher',
  description: 'Mathematical cipher using formula E(x) = (ax + b) mod 26',
  requiresKey: true,
  keyType: 'affine',
  keyDescription: 'a (coprime to 26: 1,3,5,7,9,11,15,17,19,21,23,25) and b (0-25)',
  
  encode: (text: string, key?: CipherKey): string => {
    let a = key?.a ?? 5;
    const b = key?.b ?? 8;
    
    // Ensure 'a' is valid
    if (!validA.includes(a)) {
      a = 5; // Default to valid value
    }
    
    return text.split('').map(char => affineChar(char, a, b, false)).join('');
  },
  
  decode: (text: string, key?: CipherKey): string => {
    let a = key?.a ?? 5;
    const b = key?.b ?? 8;
    
    // Ensure 'a' is valid
    if (!validA.includes(a)) {
      a = 5; // Default to valid value
    }
    
    return text.split('').map(char => affineChar(char, a, b, true)).join('');
  },
};
