import { caesar } from './caesar';
import { vigenere } from './vigenere';
import { atbash } from './atbash';
import { rot13 } from './rot13';
import { morse } from './morse';
import { binary } from './binary';
import { base64 } from './base64';
import { hex } from './hex';
import { railfence } from './railfence';
import { playfair } from './playfair';
import { affine } from './affine';
import { bacon } from './bacon';

export type CipherKey = {
  shift?: number;
  keyword?: string;
  rails?: number;
  a?: number;
  b?: number;
};

export type CipherFunction = {
  encode: (text: string, key?: CipherKey) => string;
  decode: (text: string, key?: CipherKey) => string;
  name: string;
  description: string;
  requiresKey: boolean;
  keyType?: 'shift' | 'keyword' | 'rails' | 'affine';
  keyDescription?: string;
};

export const ciphers: Record<string, CipherFunction> = {
  caesar,
  vigenere,
  atbash,
  rot13,
  morse,
  binary,
  base64,
  hex,
  railfence,
  playfair,
  affine,
  bacon,
};

export const cipherList = Object.entries(ciphers).map(([id, cipher]) => ({
  id,
  ...cipher,
}));
