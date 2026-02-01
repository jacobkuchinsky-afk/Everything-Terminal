import type { CipherKey, CipherFunction } from './index';

const createGrid = (keyword: string): string[][] => {
  const used = new Set<string>();
  const letters: string[] = [];
  
  // Add keyword letters first (J is replaced by I)
  for (const char of keyword.toUpperCase().replace(/J/g, 'I')) {
    if (/[A-Z]/.test(char) && !used.has(char)) {
      letters.push(char);
      used.add(char);
    }
  }
  
  // Add remaining letters
  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    if (char !== 'J' && !used.has(char)) {
      letters.push(char);
      used.add(char);
    }
  }
  
  // Create 5x5 grid
  const grid: string[][] = [];
  for (let i = 0; i < 5; i++) {
    grid.push(letters.slice(i * 5, (i + 1) * 5));
  }
  
  return grid;
};

const findPosition = (grid: string[][], char: string): [number, number] => {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === char) {
        return [row, col];
      }
    }
  }
  return [0, 0];
};

const prepareText = (text: string): string[] => {
  // Remove non-letters, replace J with I, convert to uppercase
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const pairs: string[] = [];
  
  let i = 0;
  while (i < cleaned.length) {
    const first = cleaned[i];
    const second = cleaned[i + 1] || 'X';
    
    if (first === second) {
      pairs.push(first + 'X');
      i++;
    } else {
      pairs.push(first + second);
      i += 2;
    }
  }
  
  return pairs;
};

export const playfair: CipherFunction = {
  name: 'Playfair Cipher',
  description: 'Digraph substitution cipher using a 5x5 key grid',
  requiresKey: true,
  keyType: 'keyword',
  keyDescription: 'Keyword for grid generation',
  
  encode: (text: string, key?: CipherKey): string => {
    const keyword = key?.keyword || 'KEYWORD';
    const grid = createGrid(keyword);
    const pairs = prepareText(text);
    
    return pairs.map(pair => {
      const [r1, c1] = findPosition(grid, pair[0]);
      const [r2, c2] = findPosition(grid, pair[1]);
      
      if (r1 === r2) {
        // Same row: shift right
        return grid[r1][(c1 + 1) % 5] + grid[r2][(c2 + 1) % 5];
      } else if (c1 === c2) {
        // Same column: shift down
        return grid[(r1 + 1) % 5][c1] + grid[(r2 + 1) % 5][c2];
      } else {
        // Rectangle: swap columns
        return grid[r1][c2] + grid[r2][c1];
      }
    }).join(' ');
  },
  
  decode: (text: string, key?: CipherKey): string => {
    const keyword = key?.keyword || 'KEYWORD';
    const grid = createGrid(keyword);
    const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const pairs: string[] = [];
    
    for (let i = 0; i < cleaned.length; i += 2) {
      pairs.push(cleaned.slice(i, i + 2));
    }
    
    return pairs.map(pair => {
      if (pair.length < 2) return pair;
      
      const [r1, c1] = findPosition(grid, pair[0]);
      const [r2, c2] = findPosition(grid, pair[1]);
      
      if (r1 === r2) {
        // Same row: shift left
        return grid[r1][(c1 + 4) % 5] + grid[r2][(c2 + 4) % 5];
      } else if (c1 === c2) {
        // Same column: shift up
        return grid[(r1 + 4) % 5][c1] + grid[(r2 + 4) % 5][c2];
      } else {
        // Rectangle: swap columns
        return grid[r1][c2] + grid[r2][c1];
      }
    }).join('');
  },
};
