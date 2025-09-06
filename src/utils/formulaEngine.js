// Safe formula evaluation engine for worksheets
export class FormulaEngine {
  constructor() {
    // Whitelist of allowed operations and functions
    this.allowedOperators = ['+', '-', '*', '/', '(', ')', '^', '%'];
    this.allowedFunctions = ['SUM', 'AVG', 'MAX', 'MIN', 'IF', 'ROUND', 'ABS', 'SQRT'];
    this.allowedConstants = ['PI', 'E'];
  }

  // Sanitize and validate formula
  sanitizeFormula(formula) {
    if (!formula || typeof formula !== 'string') return '';
    
    // Remove whitespace and convert to uppercase for functions
    let cleaned = formula.replace(/\s+/g, '').toUpperCase();
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /EVAL/i, /FUNCTION/i, /RETURN/i, /VAR/i, /LET/i, /CONST/i,
      /WHILE/i, /FOR/i, /IF\s*\(/i, /SCRIPT/i, /DOCUMENT/i, /WINDOW/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(cleaned)) {
        throw new Error('Unsafe formula detected');
      }
    }
    
    return cleaned;
  }

  // Parse and validate formula tokens
  tokenizeFormula(formula) {
    const tokens = [];
    let current = '';
    
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      
      if (this.allowedOperators.includes(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else if (char.match(/[A-Z0-9_.]/)) {
        current += char;
      } else {
        throw new Error(`Invalid character: ${char}`);
      }
    }
    
    if (current) tokens.push(current);
    return tokens;
  }

  // Evaluate basic arithmetic expressions safely
  evaluateExpression(expression, variables = {}) {
    try {
      const sanitized = this.sanitizeFormula(expression);
      const tokens = this.tokenizeFormula(sanitized);
      
      // Replace variables with values
      const processed = tokens.map(token => {
        // Check if it's a number
        if (!isNaN(parseFloat(token))) return parseFloat(token);
        
        // Check if it's a variable
        if (variables.hasOwnProperty(token)) return variables[token];
        
        // Check if it's an allowed function or operator
        if (this.allowedOperators.includes(token) || this.allowedFunctions.includes(token)) {
          return token;
        }
        
        // Check if it's a constant
        if (token === 'PI') return Math.PI;
        if (token === 'E') return Math.E;
        
        throw new Error(`Unknown token: ${token}`);
      });
      
      // Convert back to string and evaluate safely
      const evalString = processed.join('');
      return this.safeEval(evalString, variables);
      
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return { error: error.message };
    }
  }

  // Safe evaluation with limited math functions
  safeEval(expression, variables = {}) {
    // Implement basic calculator functionality
    const math = {
      SUM: (...args) => args.reduce((a, b) => a + b, 0),
      AVG: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
      MAX: Math.max,
      MIN: Math.min,
      ROUND: Math.round,
      ABS: Math.abs,
      SQRT: Math.sqrt,
      IF: (condition, trueVal, falseVal) => condition ? trueVal : falseVal
    };
    
    // Simple expression evaluator for basic arithmetic
    try {
      // Replace function calls with actual functions
      let processed = expression;
      
      // Handle SUM(A1:A5) style ranges - simplified for now
      processed = processed.replace(/SUM\(([^)]+)\)/g, (match, range) => {
        const values = this.parseRange(range, variables);
        return math.SUM(...values);
      });
      
      processed = processed.replace(/AVG\(([^)]+)\)/g, (match, range) => {
        const values = this.parseRange(range, variables);
        return math.AVG(...values);
      });
      
      // For basic arithmetic, use Function constructor with limited scope
      const result = new Function('return ' + processed)();
      
      if (!isFinite(result)) {
        throw new Error('Result is not a finite number');
      }
      
      return result;
      
    } catch (error) {
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }

  // Parse range notation like A1:A5 into array of values
  parseRange(range, variables) {
    // Simple implementation - in real app would handle cell references
    const parts = range.split(',').map(part => {
      const trimmed = part.trim();
      if (!isNaN(parseFloat(trimmed))) return parseFloat(trimmed);
      if (variables.hasOwnProperty(trimmed)) return variables[trimmed];
      return 0;
    });
    return parts;
  }

  // Validate field formula for worksheet
  validateFieldFormula(formula, availableFields = []) {
    try {
      if (!formula) return { valid: true };
      
      const sanitized = this.sanitizeFormula(formula);
      const tokens = this.tokenizeFormula(sanitized);
      
      // Check that all referenced fields exist
      for (const token of tokens) {
        if (!this.allowedOperators.includes(token) && 
            !this.allowedFunctions.includes(token) &&
            !this.allowedConstants.includes(token) &&
            isNaN(parseFloat(token))) {
          
          if (!availableFields.includes(token)) {
            return { 
              valid: false, 
              error: `Unknown field reference: ${token}` 
            };
          }
        }
      }
      
      return { valid: true, sanitized };
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

export const formulaEngine = new FormulaEngine();
export default formulaEngine;