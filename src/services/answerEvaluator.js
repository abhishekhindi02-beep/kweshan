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

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\sΣθλαβγΔ\+\-\*\/\=\^\(\)\_\.\√]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// Canonical rubric definitions for key curriculum/test questions
const KNOWN_RUBRICS = {
  newton_second_law: {
    expectedConcepts: [
      { key: 'newton_law', label: "Newton's second law (F = ma)", regex: /(newton|second law|f\s*=\s*m\s*\*?\s*a|f_net|net force)/i },
      { key: 'cartesian_decomp', label: 'Cartesian x & y component decomposition', regex: /(cartesian|component|x-axis|y-axis|orthogonal|resolve|resolving|perpendicular)/i },
      { key: 'trig_resolution', label: 'Trigonometric force resolution (cos θ / sin θ)', regex: /(cos|sin|angle|theta|θ|projection)/i },
      { key: 'force_summation', label: 'Sum of forces (ΣFx and ΣFy)', regex: /(sigma\s*f|sum of force|∑f|σf|fx|fy|f_x|f_y|fnet_x|fnet_y)/i },
      { key: 'resultant_accel', label: 'Resultant net acceleration magnitude synthesis', regex: /(resultant|pythagor|magnitude|net accel|total accel|root|sqrt|√)/i }
    ],
    requiredFormulas: [
      { key: 'fx_formula', label: 'ΣFx = m·ax (or ax = ΣFx/m)', regex: /((\Sigma|∑|σ)?\s*f_?x\s*=\s*m\s*\*?\s*a_?x|a_?x\s*=\s*(\Sigma|∑|σ)?\s*f_?x\s*\/\s*m|f_?x\s*=\s*f\s*\*?\s*cos)/i },
      { key: 'fy_formula', label: 'ΣFy = m·ay (or ay = ΣFy/m)', regex: /((\Sigma|∑|σ)?\s*f_?y\s*=\s*m\s*\*?\s*a_?y|a_?y\s*=\s*(\Sigma|∑|σ)?\s*f_?y\s*\/\s*m|f_?y\s*=\s*f\s*\*?\s*sin)/i },
      { key: 'a_resultant_formula', label: 'a = √(ax² + ay²)', regex: /(a\s*=\s*(sqrt|√|\()|a_?net\s*=\s*(sqrt|√|\()|\(?a_?x\^?2?\s*\+\s*a_?y\^?2?\)?|√\(|sqrt\()/i }
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
  const prompt = (question?.prompt || question?.text || '').toLowerCase();

  // 1. Check if empty or obviously insufficient (< 10 chars, < 3 words)
  if (!cleanAnswer || cleanAnswer.length < 10 || cleanAnswer.split(/\s+/).length < 3) {
    return {
      isCorrect: false,
      isPartial: false,
      scorePercent: 0,
      awardedDP: 0,
      gradeLabel: 'Incorrect / Needs Improvement (0 DP)',
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
      if (concept.regex.test(cleanAnswer)) {
        matchedConcepts.push(concept.label);
        conceptScore += (40 / rubric.expectedConcepts.length);
      } else {
        missingConcepts.push(concept.label);
      }
    });

    // Evaluate formulas (Max 40 pts)
    rubric.requiredFormulas.forEach((formula) => {
      if (formula.regex.test(cleanAnswer)) {
        matchedFormulas.push(formula.label);
        formulaScore += (40 / rubric.requiredFormulas.length);
      } else {
        missingFormulas.push(formula.label);
      }
    });

    // Evaluate explanation depth and coherence (Max 20 pts)
    const wordCount = cleanAnswer.split(/\s+/).length;
    if (wordCount >= 30) explanationScore = 20;
    else if (wordCount >= 18) explanationScore = 14;
    else if (wordCount >= 10) explanationScore = 8;
    else explanationScore = 2;

  } else {
    // General Rubric Evaluation
    const expected = extractKeyConcepts(question);
    const userTokens = new Set(tokenize(cleanAnswer));

    expected.forEach((c) => {
      const cClean = c.toLowerCase();
      if (cleanAnswer.includes(cClean) || userTokens.has(cClean)) {
        matchedConcepts.push(c);
      } else {
        missingConcepts.push(c);
      }
    });

    const conceptRatio = expected.length > 0 ? (matchedConcepts.length / expected.length) : 0.5;
    conceptScore = Math.round(conceptRatio * 45);

    // Formula / Math check
    const hasMath = /[\=\+\-\*\/\^\√\Σ]/.test(cleanAnswer);
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
  let gradeLabel = 'Incorrect / Needs Improvement (0 DP)';
  let feedback = '';

  if (totalScore >= 80) {
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
  extractKeyConcepts
};


