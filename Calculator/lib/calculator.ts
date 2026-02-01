// Token types for the expression parser
type TokenType = 
  | 'number' 
  | 'operator' 
  | 'function' 
  | 'constant' 
  | 'lparen' 
  | 'rparen';

interface Token {
  type: TokenType;
  value: string | number;
}

// Operator precedence
const precedence: Record<string, number> = {
  '+': 1,
  '-': 1,
  '×': 2,
  '÷': 2,
  '%': 2,
  '^': 3,
};

// Right associative operators
const rightAssociative = new Set(['^']);

// Available functions
const functions: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(toRadians(x)),
  cos: (x) => Math.cos(toRadians(x)),
  tan: (x) => Math.tan(toRadians(x)),
  asin: (x) => toDegrees(Math.asin(x)),
  acos: (x) => toDegrees(Math.acos(x)),
  atan: (x) => toDegrees(Math.atan(x)),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  exp: Math.exp,
  fact: factorial,
};

// Constants
const constants: Record<string, number> = {
  π: Math.PI,
  e: Math.E,
};

// Helper functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  if (!Number.isInteger(n)) return gamma(n + 1);
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Gamma function approximation for non-integer factorials
function gamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Tokenize the expression
export function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  // Clean up the expression
  expression = expression
    .replace(/\s+/g, '')
    .replace(/×/g, '×')
    .replace(/\*/g, '×')
    .replace(/÷/g, '÷')
    .replace(/\//g, '÷')
    .replace(/−/g, '-');

  while (i < expression.length) {
    const char = expression[i];
    
    // Numbers (including decimals)
    if (/[0-9.]/.test(char)) {
      let num = '';
      while (i < expression.length && /[0-9.]/.test(expression[i])) {
        num += expression[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    
    // Constants
    if (char === 'π' || char === 'e') {
      // Check if 'e' is part of scientific notation
      if (char === 'e' && tokens.length > 0 && tokens[tokens.length - 1].type === 'number') {
        // Handle scientific notation
        i++;
        let sign = '';
        if (expression[i] === '+' || expression[i] === '-') {
          sign = expression[i];
          i++;
        }
        let exp = '';
        while (i < expression.length && /[0-9]/.test(expression[i])) {
          exp += expression[i];
          i++;
        }
        const base = tokens.pop()!.value as number;
        tokens.push({ type: 'number', value: base * Math.pow(10, parseFloat(sign + exp)) });
        continue;
      }
      tokens.push({ type: 'constant', value: char });
      i++;
      continue;
    }
    
    // Functions
    const funcNames = Object.keys(functions);
    let matched = false;
    for (const fname of funcNames) {
      if (expression.slice(i, i + fname.length).toLowerCase() === fname.toLowerCase()) {
        tokens.push({ type: 'function', value: fname });
        i += fname.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    
    // Operators
    if (['+', '-', '×', '÷', '^', '%'].includes(char)) {
      // Handle negative numbers at start or after operator/lparen
      if (char === '-') {
        const prevToken = tokens[tokens.length - 1];
        if (!prevToken || prevToken.type === 'operator' || prevToken.type === 'lparen' || prevToken.type === 'function') {
          // This is a negative sign, not subtraction
          i++;
          let num = '-';
          while (i < expression.length && /[0-9.]/.test(expression[i])) {
            num += expression[i];
            i++;
          }
          if (num !== '-') {
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
          } else {
            // Just a minus sign before something else
            i--;
          }
        }
      }
      tokens.push({ type: 'operator', value: char });
      i++;
      continue;
    }
    
    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }
    
    if (char === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }
    
    // Skip unknown characters
    i++;
  }
  
  return tokens;
}

// Shunting-yard algorithm to convert to RPN
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operatorStack: Token[] = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'number':
      case 'constant':
        output.push(token);
        break;
        
      case 'function':
        operatorStack.push(token);
        break;
        
      case 'operator': {
        const op1 = token.value as string;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'lparen') break;
          
          if (top.type === 'function') {
            output.push(operatorStack.pop()!);
            continue;
          }
          
          const op2 = top.value as string;
          const prec1 = precedence[op1] || 0;
          const prec2 = precedence[op2] || 0;
          
          if (
            prec2 > prec1 ||
            (prec2 === prec1 && !rightAssociative.has(op1))
          ) {
            output.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
        break;
      }
        
      case 'lparen':
        operatorStack.push(token);
        break;
        
      case 'rparen':
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type !== 'lparen'
        ) {
          output.push(operatorStack.pop()!);
        }
        operatorStack.pop(); // Remove the '('
        
        // If there's a function before the parenthesis, pop it
        if (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === 'function'
        ) {
          output.push(operatorStack.pop()!);
        }
        break;
    }
  }
  
  // Pop remaining operators
  while (operatorStack.length > 0) {
    output.push(operatorStack.pop()!);
  }
  
  return output;
}

// Evaluate RPN expression
function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = [];
  
  for (const token of rpn) {
    switch (token.type) {
      case 'number':
        stack.push(token.value as number);
        break;
        
      case 'constant':
        stack.push(constants[token.value as string]);
        break;
        
      case 'function': {
        const arg = stack.pop();
        if (arg === undefined) throw new Error('Invalid expression');
        const fn = functions[token.value as string];
        if (!fn) throw new Error(`Unknown function: ${token.value}`);
        stack.push(fn(arg));
        break;
      }
        
      case 'operator': {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          throw new Error('Invalid expression');
        }
        
        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '×': stack.push(a * b); break;
          case '÷': 
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b); 
            break;
          case '^': stack.push(Math.pow(a, b)); break;
          case '%': stack.push(a % b); break;
          default:
            throw new Error(`Unknown operator: ${token.value}`);
        }
        break;
      }
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  
  return stack[0];
}

// Main evaluation function
export function evaluate(expression: string): number {
  if (!expression.trim()) return 0;
  
  const tokens = tokenize(expression);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn);
}

// Format number for display
export function formatNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
  
  // Handle very large or very small numbers with scientific notation
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
    return num.toExponential(8).replace(/\.?0+e/, 'e');
  }
  
  // Round to avoid floating point errors
  const rounded = Math.round(num * 1e12) / 1e12;
  
  // Format with appropriate decimal places
  const str = rounded.toString();
  
  // Limit length
  if (str.length > 15) {
    return Number(rounded.toPrecision(10)).toString();
  }
  
  return str;
}

// Validate expression (check for balanced parentheses, etc.)
export function validateExpression(expression: string): boolean {
  let parenCount = 0;
  
  for (const char of expression) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) return false;
  }
  
  return parenCount === 0;
}

// Get the last number or result from expression
export function getLastNumber(expression: string): string {
  const matches = expression.match(/[\d.]+$/);
  return matches ? matches[0] : '';
}

// Check if expression ends with an operator
export function endsWithOperator(expression: string): boolean {
  return /[+\-×÷^%]$/.test(expression.trim());
}

// Check if expression ends with a function
export function endsWithFunction(expression: string): boolean {
  const funcNames = Object.keys(functions);
  for (const fname of funcNames) {
    if (expression.toLowerCase().endsWith(fname + '(')) {
      return true;
    }
  }
  return false;
}
