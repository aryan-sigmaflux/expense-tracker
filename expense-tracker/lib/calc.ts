// Safe arithmetic evaluator for the amount field.
// Supports + - * / ( ) and decimals (and ×, ÷, − as aliases). No eval/Function.
// Returns the numeric result, or null if the expression is empty/invalid.
export function evalExpression(input: string): number | null {
  const s = input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .trim();
  if (!s) return null;

  let i = 0;
  const skip = () => {
    while (i < s.length && s[i] === " ") i++;
  };

  function parseExpr(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    skip();
    while (i < s.length && (s[i] === "+" || s[i] === "-")) {
      const op = s[i++];
      const right = parseTerm();
      if (right === null) return null;
      left = op === "+" ? left + right : left - right;
      skip();
    }
    return left;
  }

  function parseTerm(): number | null {
    let left = parseFactor();
    if (left === null) return null;
    skip();
    while (i < s.length && (s[i] === "*" || s[i] === "/")) {
      const op = s[i++];
      const right = parseFactor();
      if (right === null) return null;
      if (op === "/" && right === 0) return null;
      left = op === "*" ? left * right : left / right;
      skip();
    }
    return left;
  }

  function parseFactor(): number | null {
    skip();
    if (i >= s.length) return null;
    if (s[i] === "+") {
      i++;
      return parseFactor();
    }
    if (s[i] === "-") {
      i++;
      const v = parseFactor();
      return v === null ? null : -v;
    }
    if (s[i] === "(") {
      i++;
      const v = parseExpr();
      skip();
      if (s[i] !== ")") return null;
      i++;
      return v;
    }
    const start = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    if (i === start) return null;
    const num = Number(s.slice(start, i));
    return Number.isFinite(num) ? num : null;
  }

  const result = parseExpr();
  skip();
  if (i !== s.length) return null; // leftover/invalid characters
  return result;
}
