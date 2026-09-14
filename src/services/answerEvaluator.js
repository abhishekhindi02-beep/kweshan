// Smart Academic Answer Evaluator for Kweshun
// Evaluates written long-form solutions with strict academic criteria

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

export function extractKeyConcepts(question) {
  const explanation = question?.explanation || '';
  const prompt = question?.prompt || question?.text || '';

  const concepts = new Set();

  // Extract explicit formulas/equations (e.g., Fx=m*ax, F=ma, a=sqrt(ax^2+ay^2))
  const mathMatches = (explanation + ' ' + (question?.equation || '')).match(/[A-Za-zΣθλαβγΔ0-9\+\-\*\/\=\^\(\)\_\.\√]{2,}/g) || [];
  mathMatches.slice(0, 8).forEach((m) => {
    if (m.includes('=') || m.includes('+') || m.includes('^') || m.includes('/') || m.includes('Σ') || m.includes('√') || m.includes('*')) {
      concepts.add(m.trim().toLowerCase());
    }
  });

  // Common technical terms extraction from explanation
  const tokens = tokenize(explanation);
  const freq = {};
  tokens.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });

  // Pick top distinctive technical tokens
  Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 8)
    .forEach((term) => {
      if (term.length > 2) concepts.add(term);
    });

  return Array.from(concepts);
}

export function evaluateWrittenAnswer(userAnswer, question) {
  const answer = (userAnswer || '').trim();
  const cleanAnswer = answer.toLowerCase();
  const keyConcepts = extractKeyConcepts(question);

  // 1. Minimum Length and Word Count Check (gibberish/one-liner like "ba", "idk", "asdf")
  if (!cleanAnswer || cleanAnswer.length < 15 || cleanAnswer.split(/\s+/).length < 4) {
    return {
      isCorrect: false,
      scorePercent: 0,
      awardedDP: 0,
      gradeLabel: 'Wrong Answer (0 DP)',
      status: 'incorrect',
      matchedConcepts: [],
      missingConcepts: keyConcepts.slice(0, 4),
      feedback: 'Your answer is incorrect because it is too brief and does not include any mathematical derivation or physical laws.'
    };
  }

  const userTokens = new Set(tokenize(cleanAnswer));
  
  // 2. Track matched vs missing concepts
  const matchedConcepts = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    if (cleanAnswer.includes(concept) || userTokens.has(concept)) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  // 3. Mathematical and Formula presence
  const hasFormulaSymbols = /[\=\+\-\*\/\^\√\Σ]/.test(cleanAnswer);
  const hasKeyMathTokens = /(fx|fy|ax|ay|fnet|f_net|sigma|sqrt|root|cos|sin|component|orthogonal|vector|acceleration|newton|second law|m\*a|ma)/i.test(cleanAnswer);
  
  const conceptRatio = keyConcepts.length > 0 ? (matchedConcepts.length / keyConcepts.length) : 0;

  // Strict Evaluation: Must match at least 40% of technical concepts AND have formulas or math tokens
  const isStrictlyCorrect = (conceptRatio >= 0.40 && (hasFormulaSymbols || hasKeyMathTokens)) || 
                            (matchedConcepts.length >= 3 && cleanAnswer.length >= 35);

  if (isStrictlyCorrect) {
    return {
      isCorrect: true,
      scorePercent: Math.min(100, Math.round(conceptRatio * 100) + 20),
      awardedDP: 10,
      gradeLabel: 'Correct! (+10 DP)',
      status: 'correct',
      matchedConcepts,
      missingConcepts,
      feedback: 'Great job! Your answer accurately explains the physical principles and includes the necessary derivation steps.'
    };
  }

  // Otherwise, it is WRONG (0 DP)
  return {
    isCorrect: false,
    scorePercent: Math.round(conceptRatio * 50),
    awardedDP: 0,
    gradeLabel: 'Wrong Answer (0 DP)',
    status: 'incorrect',
    matchedConcepts,
    missingConcepts: missingConcepts.length > 0 ? missingConcepts : keyConcepts.slice(0, 4),
    feedback: 'Your answer is incorrect. It does not provide the required physical derivation steps or governing formulas.'
  };
}

export default {
  evaluateWrittenAnswer,
  extractKeyConcepts
};

