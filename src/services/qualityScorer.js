export function calculateQualityScores(question) {
  const text = question?.text || question?.prompt || '';
  const rawOptions = question?.options || [];
  const options = rawOptions.map(opt => typeof opt === 'string' ? { text: opt } : opt);
  const explanation = question?.explanation || '';
  const citations = question?.citations || question?.citation || '';
  const difficulty = (question?.difficulty || 'Medium').toLowerCase();

  // 1. Originality (0-100) (20%)
  let originality = 75;
  if (text.length > 50) originality += 10;
  if (text.length > 100) originality += 8;
  if (explanation.length > 40) originality += 7;
  originality = Math.min(98, Math.max(60, originality));

  // 2. Factual Verification (0-100) (25%)
  let factualVerification = 70;
  if (explanation.length > 30) factualVerification += 15;
  if (citations && citations.trim().length > 5) factualVerification += 13;
  factualVerification = Math.min(99, Math.max(55, factualVerification));

  // 3. Difficulty Balance (0-100) (20%)
  let difficultyBalance = 80;
  if (options.length === 4) difficultyBalance += 8;
  const avgLen = options.reduce((acc, opt) => acc + (opt?.text ? opt.text.length : 0), 0) / (options.length || 1);
  const variance = options.reduce((acc, opt) => acc + Math.abs((opt?.text ? opt.text.length : 0) - avgLen), 0);
  if (variance < 25) difficultyBalance += 7;
  if (difficulty === 'hard' || difficulty === 'medium') difficultyBalance += 4;
  difficultyBalance = Math.min(96, Math.max(65, difficultyBalance));

  // 4. Answer Distinction (0-100) (20%)
  let answerDistinction = 82;
  const uniqueTexts = new Set(options.map(o => (o?.text || '').trim().toLowerCase()));
  if (uniqueTexts.size === options.length && options.length >= 4) answerDistinction += 10;
  if (explanation.toLowerCase().includes('because') || explanation.toLowerCase().includes('therefore')) answerDistinction += 5;
  answerDistinction = Math.min(97, Math.max(60, answerDistinction));

  // 5. Source Citations (0-100) (15%)
  let sourceCitations = 60;
  if (citations && citations.length > 5) sourceCitations += 25;
  if (citations && (citations.includes('http') || citations.includes('AP') || citations.includes('ISBN') || citations.includes('Journal') || citations.includes('Vol') || citations.includes('Physics') || citations.includes('Calculus') || citations.includes('Campbell') || citations.includes('Ch.'))) {
    sourceCitations += 12;
  }
  sourceCitations = Math.min(98, Math.max(40, sourceCitations));

  // Weighted composite
  const composite = Math.round(
    originality * 0.20 +
    factualVerification * 0.25 +
    difficultyBalance * 0.20 +
    answerDistinction * 0.20 +
    sourceCitations * 0.15
  );

  let grade = 'B';
  if (composite >= 95) grade = 'A+';
  else if (composite >= 90) grade = 'A';
  else if (composite >= 85) grade = 'A-';
  else if (composite >= 80) grade = 'B+';
  else if (composite >= 75) grade = 'B';
  else if (composite >= 70) grade = 'B-';
  else if (composite >= 65) grade = 'C+';
  else grade = 'C';

  const recommendations = [];
  if (sourceCitations < 75) recommendations.push('Add an academic reference or textbook citation to boost source verification.');
  if (difficultyBalance < 80) recommendations.push('Ensure plausible distractors with balanced character lengths.');
  if (factualVerification < 80) recommendations.push('Expand the explanation with conceptual derivations and proofs.');

  return {
    originality,
    factualVerification,
    difficultyBalance,
    answerDistinction,
    sourceCitations,
    composite,
    grade,
    recommendations,
    // Aliases for convenience
    overall: composite,
    status: composite >= 85 ? 'Grade A+' : composite >= 75 ? 'Grade B' : 'Grade C',
    breakdown: {
      originality: Math.round(originality * 0.2),
      factual: Math.round(factualVerification * 0.25),
      distinction: Math.round(answerDistinction * 0.2),
      difficulty: Math.round(difficultyBalance * 0.2),
      citations: Math.round(sourceCitations * 0.15)
    },
    suggestions: recommendations
  };
}

export function evaluateQuestionQuality(question) {
  return calculateQualityScores(question);
}
