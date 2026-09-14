export function calculateQualityScores(question) {
  const text = question?.text || question?.prompt || '';
  const explanation = question?.explanation || '';
  const citations = question?.citations || question?.citation || '';
  const difficulty = (question?.difficulty || 'Medium').toLowerCase();
  
  // Attachments evaluation
  const hasImage = Boolean(question?.image || question?.imageUrl);
  const hasDrawing = Boolean(question?.drawing || question?.figure);
  const hasEquations = Boolean(
    (Array.isArray(question?.equations) && question.equations.length > 0) ||
    question?.equation ||
    text.includes('=') ||
    explanation.includes('=')
  );

  // 1. Question Depth & Prompt Originality (0-100) (25%)
  let originality = 75;
  if (text.length > 50) originality += 8;
  if (text.length > 120) originality += 8;
  if (text.length > 200) originality += 5;
  if (text.toLowerCase().includes('explain') || text.toLowerCase().includes('derive') || text.toLowerCase().includes('calculate') || text.toLowerCase().includes('describe')) {
    originality += 4;
  }
  originality = Math.min(99, Math.max(60, originality));

  // 2. Conceptual Rigor & Solution Proof (0-100) (25%)
  let factualVerification = 70;
  if (explanation.length > 40) factualVerification += 10;
  if (explanation.length > 100) factualVerification += 10;
  if (explanation.length > 200) factualVerification += 5;
  if (explanation.toLowerCase().includes('because') || explanation.toLowerCase().includes('therefore') || explanation.toLowerCase().includes('equation') || explanation.toLowerCase().includes('theorem')) {
    factualVerification += 4;
  }
  factualVerification = Math.min(99, Math.max(55, factualVerification));

  // 3. Difficulty & Academic Balance (0-100) (20%)
  let difficultyBalance = 78;
  if (difficulty === 'hard') difficultyBalance += 16;
  else if (difficulty === 'medium') difficultyBalance += 12;
  else difficultyBalance += 8;
  if (text.length > 80 && explanation.length > 80) difficultyBalance += 5;
  difficultyBalance = Math.min(98, Math.max(65, difficultyBalance));

  // 4. Scientific Artifacts & Mathematical Rigor (0-100) (15%)
  let answerDistinction = 75;
  if (hasEquations) answerDistinction += 10;
  if (hasImage) answerDistinction += 8;
  if (hasDrawing) answerDistinction += 8;
  answerDistinction = Math.min(99, Math.max(60, answerDistinction));

  // 5. Source Citations & References (0-100) (15%)
  let sourceCitations = 60;
  if (citations && citations.trim().length > 5) sourceCitations += 25;
  if (citations && (
    citations.includes('http') || 
    citations.includes('AP') || 
    citations.includes('ISBN') || 
    citations.includes('Journal') || 
    citations.includes('Vol') || 
    citations.includes('Physics') || 
    citations.includes('Calculus') || 
    citations.includes('Biology') || 
    citations.includes('Chemistry') || 
    citations.includes('Economics') || 
    citations.includes('Ch.') ||
    citations.includes('Ed.')
  )) {
    sourceCitations += 14;
  }
  sourceCitations = Math.min(99, Math.max(40, sourceCitations));

  // Weighted composite
  const composite = Math.round(
    originality * 0.25 +
    factualVerification * 0.25 +
    difficultyBalance * 0.20 +
    answerDistinction * 0.15 +
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
  if (sourceCitations < 75) recommendations.push('Add an academic textbook or paper citation to boost verification score.');
  if (!hasEquations && !hasDrawing && !hasImage) recommendations.push('Attach an equation, scientific figure, or diagram to enhance problem clarity.');
  if (factualVerification < 80) recommendations.push('Expand the solution with detailed conceptual derivations and mathematical steps.');
  if (text.length < 80) recommendations.push('Provide more contextual background and constraints in the problem prompt.');

  return {
    originality,
    factualVerification,
    difficultyBalance,
    answerDistinction,
    sourceCitations,
    composite,
    grade,
    recommendations,
    // Aliases
    overall: composite,
    status: composite >= 85 ? 'Grade A+' : composite >= 75 ? 'Grade B' : 'Grade C',
    breakdown: {
      originality: Math.round(originality * 0.25),
      factual: Math.round(factualVerification * 0.25),
      difficulty: Math.round(difficultyBalance * 0.20),
      artifacts: Math.round(answerDistinction * 0.15),
      citations: Math.round(sourceCitations * 0.15)
    },
    suggestions: recommendations
  };
}

export function evaluateQuestionQuality(question) {
  return calculateQualityScores(question);
}

export default {
  calculateQualityScores,
  evaluateQuestionQuality
};
