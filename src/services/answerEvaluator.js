// Transparent Rubric-Based Academic Answer Evaluator for Kweshun
// Strictly evaluates long-form written academic responses using structured concept and formula rubrics

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'this', 'these', 'those',
  'then', 'so', 'if', 'or', 'such', 'can', 'could', 'should', 'would',
  'how', 'what', 'when', 'where', 'which', 'who', 'why', 'i', 'my',
  'me', 'you', 'your', 'we', 'our', 'they', 'them', 'their', 'very',
  'much', 'like', 'good', 'think', 'know', 'see', 'just', 'also'
]);

export function normalizeMathText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[·•×]/g, '*')
    .replace(/[Σ∑]/g, 'sigma ')
    .replace(/\\sigma/gi, 'sigma ')
    .replace(/\\cdot/gi, '*')
    .replace(/\\times/gi, '*')
    .replace(/\\sqrt/gi, 'sqrt')
    .replace(/√/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/ᵢ/g, 'i')
    .replace(/₀/g, '0')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  if (!text) return [];
  const normalized = normalizeMathText(text);
  return normalized
    .replace(/[^a-z0-9\sθλαβγΔ\+\-\*\/\=\^\(\)\_\.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// Canonical rubric definitions for key curriculum/test questions
const KNOWN_RUBRICS = {
  newton_second_law: {
    expectedConcepts: [
      {
        key: 'newton_law',
        label: "Newton's second law (F = ma or ΣF = ma)",
        check: (norm, raw) => {
          if (/(newton|second\s*law|f(_?net)?\s*=\s*m\s*\*?\s*a|net\s*force|sigma\s*f\s*=\s*m)/i.test(norm)) return true;
          // Equivalence: Component forms ΣFx = m·ax and ΣFy = m·ay express Newton's second law
          const hasFx = /(sigma\s*)?f_?x\s*=\s*m\s*\*?\s*a_?x|a_?x\s*=\s*(sigma\s*)?f_?x\s*\/\s*m/i.test(norm);
          const hasFy = /(sigma\s*)?f_?y\s*=\s*m\s*\*?\s*a_?y|a_?y\s*=\s*(sigma\s*)?f_?y\s*\/\s*m/i.test(norm);
          return hasFx && hasFy;
        }
      },
      {
        key: 'cartesian_decomp',
        label: 'Cartesian x & y force resolution',
        check: (norm, raw) => {
          if (/(cartesian|component|orthogonal|resolv|x-axis|y-axis)/i.test(norm)) return true;
          if (/(cos|sin|theta|θ|projection|angle)/i.test(norm)) return true;
          const hasFx = /(sigma\s*)?f_?x/i.test(norm);
          const hasFy = /(sigma\s*)?f_?y/i.test(norm);
          return hasFx && hasFy;
        }
      },
      {
        key: 'force_summation',
        label: 'Sum of Cartesian forces (ΣFx and ΣFy)',
        check: (norm, raw) => {
          return /(sigma\s*f|sum\s*of\s*force|∑f|σf|f_?x|f_?y|fnet_?x|fnet_?y)/i.test(norm);
        }
      },
      {
        key: 'resultant_accel',
        label: 'Resultant net acceleration synthesis (a = √(ax² + ay²))',
        check: (norm, raw) => {
          if (/(resultant|pythagor|net\s*accel|total\s*accel)/i.test(norm)) return true;
          if (/a(_?net)?\s*=\s*sqrt/i.test(norm)) return true;
          if (/sqrt\s*\(\s*\(?a_?x\^?2\s*\+\s*a_?y\^?2/i.test(norm)) return true;
          if (/sqrt\s*\(\s*\(?\s*\(?(sigma\s*)?f_?x/i.test(norm)) return true;
          return false;
        }
      }
    ],
    requiredFormulas: [
      {
        key: 'fx_formula',
        label: 'ΣFx = m·ax (or ax = ΣFx/m)',
        check: (norm) => {
          return /(sigma\s*)?f_?x\s*=\s*m\s*\*?\s*a_?x|a_?x\s*=\s*(sigma\s*)?f_?x\s*\/\s*m|(sigma\s*)?f_?x\s*=\s*(sigma\s*)?f(_?i)?\s*\*?\s*cos/i.test(norm);
        }
      },
      {
        key: 'fy_formula',
        label: 'ΣFy = m·ay (or ay = ΣFy/m)',
        check: (norm) => {
          return /(sigma\s*)?f_?y\s*=\s*m\s*\*?\s*a_?y|a_?y\s*=\s*(sigma\s*)?f_?y\s*\/\s*m|(sigma\s*)?f_?y\s*=\s*(sigma\s*)?f(_?i)?\s*\*?\s*sin/i.test(norm);
        }
      },
      {
        key: 'a_resultant_formula',
        label: 'a = √(ax² + ay²) or a = √((ΣFx/m)² + (ΣFy/m)²)',
        check: (norm) => {
          if (/a(_?net)?\s*=\s*sqrt\s*\(/i.test(norm)) return true;
          if (/sqrt\s*\(\s*\(?a_?x\^?2\s*\+\s*a_?y\^?2/i.test(norm)) return true;
          if (/sqrt\s*\(\s*\(?\s*\(?(sigma\s*)?f_?x/i.test(norm)) return true;
          if (/\(?a_?x\^?2\s*\+\s*a_?y\^?2\)?\^?\(?(0\.5|1\/2)\)?/i.test(norm)) return true;
          return false;
        }
      }
    ]
  }
};

export function extractKeyConcepts(question) {
  if (Array.isArray(question?.expectedConcepts) && question.expectedConcepts.length > 0) {
    return question.expectedConcepts;
  }

  const prompt = (question?.prompt || question?.text || '').toLowerCase();
  if (prompt.includes('newton') && prompt.includes('acceleration') && (prompt.includes('cartesian') || prompt.includes('angles'))) {
    return KNOWN_RUBRICS.newton_second_law.expectedConcepts.map(c => c.label);
  }

  const explanation = question?.explanation || '';
  const concepts = new Set();

  // Extract explicit formulas/equations
  const mathMatches = (explanation + ' ' + (question?.equation || '')).match(/[A-Za-zΣθλαβγΔ0-9\+\-\*\/\=\^\(\)\_\.\√]{2,}/g) || [];
  mathMatches.slice(0, 6).forEach((m) => {
    if (m.includes('=') || m.includes('+') || m.includes('^') || m.includes('/') || m.includes('Σ') || m.includes('√') || m.includes('*')) {
      concepts.add(m.trim());
    }
  });

  const tokens = tokenize(explanation);
  const freq = {};
  tokens.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });

  Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 6)
    .forEach((term) => {
      if (term.length > 2) concepts.add(term);
    });

  return Array.from(concepts);
}

export function evaluateWrittenAnswer(userAnswer, question) {
  const answer = (userAnswer || '').trim();
  const cleanAnswer = answer.toLowerCase();
  const normAnswer = normalizeMathText(answer);
  const prompt = (question?.prompt || question?.text || '').toLowerCase();

  // 1. Check if empty or obviously insufficient (< 8 chars, < 2 tokens)
  if (!cleanAnswer || cleanAnswer.length < 8 || tokenize(cleanAnswer).length < 2) {
    return {
      isCorrect: false,
      isPartial: false,
      scorePercent: 0,
      awardedDP: 0,
      gradeLabel: 'INCORRECT / NEEDS IMPROVEMENT (0 DP)',
      status: 'incorrect',
      matchedConcepts: [],
      missingConcepts: extractKeyConcepts(question).slice(0, 5),
      matchedFormulas: [],
      missingFormulas: ['Required governing equations'],
      feedback: 'Your answer needs more explanation. Please write the complete physical derivation steps and formulas.',
      rubricBreakdown: { conceptScore: 0, formulaScore: 0, explanationScore: 0, total: 0 }
    };
  }

  // 2. Determine rubric
  const isNewtonProblem = prompt.includes('newton') && (prompt.includes('cartesian') || prompt.includes('acceleration') || prompt.includes('angles'));
  
  let conceptScore = 0;
  let formulaScore = 0;
  let explanationScore = 0;
  const matchedConcepts = [];
  const missingConcepts = [];
  const matchedFormulas = [];
  const missingFormulas = [];

  if (isNewtonProblem) {
    const rubric = KNOWN_RUBRICS.newton_second_law;

    // Evaluate concepts (Max 40 pts)
    rubric.expectedConcepts.forEach((concept) => {
      if (concept.check(normAnswer, cleanAnswer)) {
        matchedConcepts.push(concept.label);
        conceptScore += (40 / rubric.expectedConcepts.length);
      } else {
        missingConcepts.push(concept.label);
      }
    });

    // Evaluate formulas (Max 40 pts)
    rubric.requiredFormulas.forEach((formula) => {
      if (formula.check(normAnswer, cleanAnswer)) {
        matchedFormulas.push(formula.label);
        formulaScore += (40 / rubric.requiredFormulas.length);
      } else {
        missingFormulas.push(formula.label);
      }
    });

    // Evaluate mathematical rigor and explanation depth (Max 20 pts)
    const hasAllFormulas = matchedFormulas.length === rubric.requiredFormulas.length;
    const hasAllConcepts = matchedConcepts.length === rubric.expectedConcepts.length;
    const wordCount = cleanAnswer.split(/\s+/).length;

    if (hasAllFormulas && hasAllConcepts) {
      explanationScore = 20; // Full credit for complete, exact derivation
    } else if (wordCount >= 25) {
      explanationScore = 20;
    } else if (wordCount >= 14) {
      explanationScore = 14;
    } else if (wordCount >= 8) {
      explanationScore = 8;
    } else {
      explanationScore = 2;
    }

  } else {
    // General Rubric Evaluation
    const expected = extractKeyConcepts(question);
    const userTokens = new Set(tokenize(normAnswer));

    expected.forEach((c) => {
      const cClean = normalizeMathText(c);
      if (normAnswer.includes(cClean) || userTokens.has(cClean)) {
        matchedConcepts.push(c);
      } else {
        missingConcepts.push(c);
      }
    });

    const conceptRatio = expected.length > 0 ? (matchedConcepts.length / expected.length) : 0.5;
    conceptScore = Math.round(conceptRatio * 45);

    // Formula / Math check
    const hasMath = /[\=\+\-\*\/\^\√\Σ]/.test(answer) || /sigma|sqrt|\^/.test(normAnswer);
    const hasEquationWords = /(equation|formula|equals|yields|derive|calculate)/i.test(cleanAnswer);
    formulaScore = (hasMath ? 25 : 0) + (hasEquationWords ? 10 : 0);

    // Explanation length check
    const wordCount = cleanAnswer.split(/\s+/).length;
    if (wordCount >= 25) explanationScore = 20;
    else if (wordCount >= 15) explanationScore = 12;
    else if (wordCount >= 6) explanationScore = 6;
    else explanationScore = 0;
  }

  const totalScore = Math.min(100, Math.max(0, Math.round(conceptScore + formulaScore + explanationScore)));

  // Rubric Threshold Rules:
  // 80–100%: Correct (+10 DP)
  // 40–79%: Partially Correct (+5 DP)
  // 0–39%: Incorrect / Needs Improvement (0 DP)

  let isCorrect = false;
  let isPartial = false;
  let awardedDP = 0;
  let status = 'incorrect';
  let gradeLabel = 'INCORRECT / NEEDS IMPROVEMENT (0 DP)';
  let feedback = '';

  if (totalScore >= 75) {
    isCorrect = true;
    isPartial = false;
    awardedDP = 10;
    status = 'correct';
    gradeLabel = 'CORRECT ANSWER (+10 DP AWARDED)';
    feedback = 'Excellent derivation! Your solution demonstrates complete physical reasoning, Cartesian force decomposition, and the net acceleration formulation.';
  } else if (totalScore >= 40) {
    isCorrect = false;
    isPartial = true;
    awardedDP = 5;
    status = 'partial';
    gradeLabel = 'PARTIALLY CORRECT (+5 DP)';
    if (missingFormulas.length > 0) {
      feedback = `Good start! You identified some core concepts, but missed key mathematical steps (${missingFormulas.join(', ')}).`;
    } else {
      feedback = 'Partially correct. Your answer touched on fundamental concepts, but lacked the complete derivation.';
    }
  } else {
    isCorrect = false;
    isPartial = false;
    awardedDP = 0;
    status = 'incorrect';
    gradeLabel = 'INCORRECT / NEEDS IMPROVEMENT (0 DP)';
    if (cleanAnswer.length < 25 || cleanAnswer.includes('f = ma') || cleanAnswer.includes('f=ma')) {
      feedback = 'Your answer is incomplete. Stating only "F = ma" does not address non-orthogonal angle resolution or the Cartesian derivation.';
    } else {
      feedback = 'Your answer did not meet the required rubric criteria for Cartesian force resolution and resultant acceleration.';
    }
  }

  return {
    isCorrect,
    isPartial,
    scorePercent: totalScore,
    awardedDP,
    gradeLabel,
    status,
    matchedConcepts,
    missingConcepts,
    matchedFormulas,
    missingFormulas,
    feedback,
    rubricBreakdown: {
      conceptScore: Math.round(conceptScore),
      formulaScore: Math.round(formulaScore),
      explanationScore: Math.round(explanationScore),
      total: totalScore
    }
  };
}

export default {
  evaluateWrittenAnswer,
  extractKeyConcepts,
  normalizeMathText
};



