import React from 'react';

export function formatMathString(str) {
  if (!str) return '';
  return str
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\int/g, '∫')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^([0-9a-zA-Z]+)/g, '^$1');
}

export default function MathRenderer({ equation, className = '', isBlock = true }) {
  if (!equation) return null;
  const formatted = formatMathString(equation);

  if (isBlock) {
    return (
      <div className={`font-mono text-sm sm:text-base px-3.5 py-2 rounded-xl bg-[#090e1a] border border-[#1b273f] text-[#0df2c9] inline-block tracking-wide ${className}`}>
        {formatted}
      </div>
    );
  }

  return (
    <span className={`font-mono text-sm text-[#0df2c9] font-medium tracking-wide ${className}`}>
      {formatted}
    </span>
  );
}
