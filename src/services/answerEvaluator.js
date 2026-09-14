// Smart Academic Answer Evaluator for Kweshun
// Evaluates written long-form solutions against canonical proofs and problem concepts

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'this', 'these', 'those',
  'then', 'so', 'if', 'or', 'such', 'can', 'could', 'should', 'would',
  'how', 'what', 'when', 'where', 'which', 'who', 'why'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\sΣθλαβγΔ\+\-\*\/\=\^\(\)\_\.\√]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function extractKeyConcepts(question) {
  const explanation = question?.explanation || '';
  const prompt = question?.prompt || question?.text || '';

  const concepts = new Set();

  // Extract explicit formulas/equations
  const mathMatches = (explanation + ' ' + (question?.equation || '')).match(/[A-Za-zΣθλαβγΔ0-9\+\-\*\/\=\^\(\)\_\.\√]{2,}/g) || [];
  mathMatches.slice(0, 6).forEach((m) => {
    if (m.includes('=') || m.includes('+') || m.includes('^') || m.includes('/') || m.includes('Σ') || m.includes('\\')) {
      concepts.add(m.trim().toLowerCase());
    }
  });

  // Common technical terms extraction
  const tokens = tokenize(explanation);
  const freq = {};
  tokens.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });

  // Pick top distinctive tokens
  Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 8)
    .forEach((term) => concepts.add(term));

  return Array.from(concepts);
}

export function evaluateWrittenAnswer(userAnswer, question) {
  const answer = (userAnswer || '').trim();
  const cleanAnswer = answer.toLowerCase();

  // 1. Length & substance check (e.g. "ba", "idk", 1-2 words)
  if (!cleanAnswer || cleanAnswer.length < 10 || cleanAnswer.split(/\s+/).length < 3) {
    return {
      isCorrect: false,
      isPartial: false,
      scorePercent: 0,
      awardedDP: 0,
      gradeLabel: 'Needs Review (0 DP)',
      status: 'incorrect',
      matchedConcepts: [],
      missingConcepts: extractKeyConcepts(question).slice(0, 4),
      feedback: 'Your answer is too short or missing key derivation steps and equations.'
    };
  }

  const keyConcepts = extractKeyConcepts(question);
  const userTokens = new Set(tokenize(cleanAnswer));
  
  // Track matched vs missing concepts
  const matchedConcepts = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    if (cleanAnswer.includes(concept) || userTokens.has(concept)) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  // Mathematical reasoning indicators
  const hasFormulas = /[\=\+\-\*\/\^\√\Σ]/.test(cleanAnswer);
  const hasReasoningWords = /(because|therefore|since|resolving|substituting|derive|components|equals|yields|integrate|differentiate|vector|force|law|direction|magnitude)/i.test(cleanAnswer);

  // Concept match ratio
  const conceptRatio = keyConcepts.length > 0 ? (matchedConcepts.length / keyConcepts.length) : 0.4;

  // Length and depth factor (up to 25 pts)
  const depthScore = Math.min(25, cleanAnswer.length / 5);

  // Concept score (up to 50 pts)
  const conceptScore = conceptRatio * 50;

  // Mathematical/Reasoning score (up to 25 pts)
  const mathScore = (hasFormulas ? 15 : 0) + (hasReasoningWords ? 10 : 0);

  let totalScore = Math.round(depthScore + conceptScore + mathScore);
  totalScore = Math.min(100, Math.max(0, totalScore));

  let isCorrect = false;
  let isPartial = false;
  let awardedDP = 0;
  let gradeLabel = 'Needs Review (0 DP)';
  let status = 'incorrect';
  let feedback = '';

  if (totalScore >= 60 && conceptRatio >= 0.35) {
    isCorrect = true;
    awardedDP = 10;
    gradeLabel = 'Mastery Verified (+10 DP)';
    status = 'correct';
    feedback = 'Excellent work! Your derivation accurately aligns with physical principles and canonical mathematical formulation.';
  } else if (totalScore >= 30 || conceptRatio >= 0.20 || cleanAnswer.length >= 25) {
    isPartial = true;
    awardedDP = 5;
    gradeLabel = 'Partial Credit (+5 DP)';
    status = 'partial';
    feedback = 'Good attempt. You touched upon key principles, but some derivation steps or formula components were omitted.';
  } else {
    isCorrect = false;
    awardedDP = 0;
    gradeLabel = 'Needs Review (0 DP)';
    status = 'incorrect';
    feedback = 'Your response did not match the expected academic derivation or key formula components.';
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
    feedback
  };
}

export default {
  evaluateWrittenAnswer
};
