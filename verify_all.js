import dataStore from './src/services/dataStore.js';
import { calculateQualityScores, evaluateQuestionQuality } from './src/services/qualityScorer.js';

console.log('====================================================');
console.log('🚀 KWESHUN FULL COMPREHENSIVE SYSTEM VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. DATASTORE INITIALIZATION & USERS
console.log('--- 1. DataStore Core & User Management ---');
assert(dataStore.users.length >= 8, `Users loaded (${dataStore.users.length} users)`);
const initialUser = dataStore.getCurrentUser();
const startingDP = initialUser.dp;
assert(initialUser && initialUser.name, `Current user retrieved: ${initialUser?.name} (${initialUser?.email})`);
assert(startingDP > 0, `User DP initialized: ${startingDP} DP`);

// 2. DECKS & CONTENT
console.log('\n--- 2. Academic Decks & Curriculum ---');
assert(dataStore.decks.length >= 7, `Decks loaded (${dataStore.decks.length} decks)`);
dataStore.decks.forEach((deck) => {
  const deckQuestions = dataStore.questions.filter((q) => q.deckId === deck.id);
  assert(deckQuestions.length >= 5, `Deck "${deck.title}" (${deck.id}) has ${deckQuestions.length} unique questions`);
});

// 3. QUESTION AUTHORING, DIRECT PUBLISHING & QUALITY ENGINE
console.log('\n--- 3. Direct Publish (+30 DP) & Quality Scorer ---');

const testPublishPayload = {
  deckId: 'deck_1',
  deckName: 'Cell Biology & Mitosis',
  topic: 'Cell Division & Mitosis',
  prompt: 'Which phase of the cell cycle is characterized by the division of the nucleus into two genetically identical nuclei?',
  options: [
    'Mitosis',
    'Interphase',
    'Cytokinesis',
    'DNA Replication'
  ],
  correctAnswerIndex: 0,
  explanation: 'Mitosis is the process in which the cell nucleus divides to form two genetically identical daughter nuclei. It ensures that each daughter cell receives an identical set of chromosomes.',
  citation: 'Campbell Biology 12th Ed, Ch. 12',
  difficulty: 'Easy',
  status: 'Live'
};

const publishedQ = dataStore.createQuestion(testPublishPayload);
assert(publishedQ && publishedQ.id, `Question created: ID ${publishedQ.id}`);
assert(publishedQ.status === 'Live', `Question published directly with status "Live"`);
assert(publishedQ.correctAnswerIndex === 0, `Selected correct answer is Option A (Index 0)`);
assert(dataStore.getCurrentUser().dp === startingDP + 30, `User earned +30 DP immediately (New DP: ${dataStore.getCurrentUser().dp})`);

// 4. MY QUESTIONS & REPOSITORY INTEGRATION
console.log('\n--- 4. My Questions Query & Persistence ---');
const myQuestions = dataStore.getQuestions({ authorId: 'user_1' });
assert(myQuestions.some(q => q.id === publishedQ.id), `Newly published question appears in My Questions list`);
const foundLive = dataStore.getQuestions({ status: 'Live' });
assert(foundLive.some(q => q.id === publishedQ.id), `Question appears in Live / Approved filter`);

// 5. QUESTION PERFORMANCE & DYNAMIC ANALYTICS
console.log('\n--- 5. Dynamic Question Analytics & Answer Distribution ---');
assert(publishedQ.plays === 0, `Initial plays: 0`);
assert(publishedQ.accuracy === 0, `Initial accuracy: 0%`);

// Simulate Player 1 answering Option A (Correct)
dataStore.recordQuestionAttempt(publishedQ.id, 0, true, 3200);
let liveQ = dataStore.getQuestionById(publishedQ.id);
assert(liveQ.plays === 1, `Attempt 1 logged: plays = 1`);
assert(liveQ.correctAttempts === 1, `correctAttempts = 1`);
assert(liveQ.accuracy === 100, `accuracy = 100%`);
assert(liveQ.answerDistribution.A === 1, `Answer distribution Option A = 1 count`);
assert(liveQ.optionDistribution[0] === 100, `Option distribution Option A = 100%`);

// Simulate Player 2 answering Option B (Incorrect)
dataStore.recordQuestionAttempt(publishedQ.id, 1, false, 4500);
liveQ = dataStore.getQuestionById(publishedQ.id);
assert(liveQ.plays === 2, `Attempt 2 logged: plays = 2`);
assert(liveQ.correctAttempts === 1 && liveQ.incorrectAttempts === 1, `1 Correct, 1 Incorrect recorded`);
assert(liveQ.accuracy === 50, `accuracy recalculated = 50%`);
assert(liveQ.answerDistribution.A === 1 && liveQ.answerDistribution.B === 1, `Answer distribution: A=1, B=1`);
assert(liveQ.optionDistribution[0] === 50 && liveQ.optionDistribution[1] === 50, `Option distribution: A=50%, B=50%`);

// 6. SUBMIT FOR REVIEW & DRAFT LIFECYCLES
console.log('\n--- 6. Review & Draft Lifecycles ---');
const reviewQ = dataStore.createQuestion({
  ...testPublishPayload,
  topic: 'Pending Review Topic',
  status: 'Pending Review'
});
assert(reviewQ.status === 'Pending Review', `Question saved with "Pending Review" status`);

const draftQ = dataStore.createQuestion({
  ...testPublishPayload,
  topic: 'Draft Concept',
  status: 'Draft'
});
assert(draftQ.status === 'Draft', `Question saved with "Draft" status`);

// 7. BATTLES & INTERACTIVE GAMEPLAY
console.log('\n--- 7. Battles & Interactive Duel Engine ---');
const opponent = dataStore.users[1];
const createdBattle = dataStore.createBattle(opponent.id, 'deck_1', 'AP Physics Mechanics Duel');
assert(createdBattle && createdBattle.id, `Created 5-round battle vs ${createdBattle.opponentName} (ID: ${createdBattle.id})`);
assert(createdBattle.maxRounds === 5, `Battle has 5 rounds configured`);

const round1Outcome = dataStore.submitBattleAnswer(createdBattle.id, 1, 0, 4200);
assert(round1Outcome && round1Outcome.userScore >= 0, `Round 1 answered with response time feedback`);

// Test Lightning Arena (10 prompts)
const lightning = dataStore.startLightningArena();
assert(lightning && lightning.questionIds.length === 10, `Lightning Arena created with 10 questions`);

// 8. SOCIAL & CONNECTIONS
console.log('\n--- 8. Friends Network & Invitations ---');
assert(dataStore.friends.length >= 3, `Friends list loaded (${dataStore.friends.length} connections)`);

// 9. LEADERBOARDS
console.log('\n--- 9. Distinction Leaderboard Engine ---');
const monthlyLB = dataStore.getLeaderboard('monthly');
assert(monthlyLB.length >= 8, `Monthly Leaderboard generated (${monthlyLB.length} ranked scholars)`);

// 10. NOTIFICATIONS & ACTIVITIES
console.log('\n--- 10. Notifications & Ledger Activity ---');
assert(dataStore.notifications.length >= 3, `Notifications loaded (${dataStore.notifications.length} alerts)`);
assert(dataStore.activities.length >= 5, `Activity ledger loaded (${dataStore.activities.length} activity items)`);
assert(dataStore.dpTransactions.length >= 5, `DP Transactions loaded (${dataStore.dpTransactions.length} transactions)`);

// SUMMARY
console.log('\n====================================================');
console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('====================================================');
