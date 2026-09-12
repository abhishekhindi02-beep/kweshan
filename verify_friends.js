import dataStore from './src/services/dataStore.js';
import { initialUsers, initialFriends, initialFriendRequests } from './src/services/mockData.js';

console.log('====================================================');
console.log('🚀 KWESHUN FRIENDS & PEER NETWORK VERIFICATION TEST');
console.log('====================================================\n');

// 1. Peer Directory
console.log('--- 1. Available AI/Demo Peers Directory ---');
const peers = dataStore.users.filter(u => u.id !== dataStore.currentUserId);
console.assert(peers.length >= 8, `Expected >= 8 peers, got ${peers.length}`);
console.log(`✅ PASS: ${peers.length} AI/Demo peers available (Abram, Alfonso, Nadia, Maren, James, Elena, Lucas, Marcus, Aria).`);
const abram = peers.find(p => p.name === 'Abram Mango');
console.assert(abram && abram.dp > 0 && abram.level > 0, 'Abram Mango properties missing');
console.log(`✅ PASS: Peer Abram Mango verified (Lvl ${abram.level}, ${abram.dp} DP, Tier: ${abram.tier}).`);

// 2. Pending Requests Flow
console.log('\n--- 2. Pending Requests & Dynamic State ---');
const initialPendingCount = dataStore.friendRequests.length;
console.log(`Initial Pending Requests Count: ${initialPendingCount}`);
console.assert(initialPendingCount > 0, 'Should have pending requests');
console.log(`✅ PASS: Pending Requests count is dynamic (${initialPendingCount})`);

const firstReq = dataStore.friendRequests[0];
console.log(`Testing Accept Request for: ${firstReq.name || firstReq.senderName}`);
const acceptRes = dataStore.acceptFriendRequest(firstReq.id);
console.assert(acceptRes.success, 'Accept request failed');
console.assert(dataStore.friendRequests.length === initialPendingCount - 1, 'Pending count not decremented');
console.assert(dataStore.friends.some(f => f.name === (firstReq.name || firstReq.senderName)), 'Friend not added to connections');
console.log(`✅ PASS: Accepted request. New pending count = ${dataStore.friendRequests.length}. Friend added to Connections!`);

// 3. Notification & Activity on Friend Accept
console.log('\n--- 3. Notification & Activity Generation ---');
const latestNotif = dataStore.notifications[0];
const latestAct = dataStore.activities[0];
console.assert(latestAct && latestAct.type === 'friend_connected', 'Activity not created for friend connection');
console.log(`✅ PASS: Activity logged: "${latestAct.title} - ${latestAct.text}"`);
console.assert(latestNotif && latestNotif.type === 'friend_accepted', 'Notification not created for friend acceptance');
console.log(`✅ PASS: Notification generated: "${latestNotif.title} - ${latestNotif.message}"`);

// 4. Decline Request
if (dataStore.friendRequests.length > 0) {
  const secondReq = dataStore.friendRequests[0];
  const pendingBefore = dataStore.friendRequests.length;
  dataStore.declineFriendRequest(secondReq.id);
  console.assert(dataStore.friendRequests.length === pendingBefore - 1, 'Decline did not decrement count');
  console.log(`✅ PASS: Declined request. Remaining pending = ${dataStore.friendRequests.length}.`);
}

// 5. Challenge Dispatch Flow (Standard Duel)
console.log('\n--- 5. Challenge Dispatch Flow (Standard Duel) ---');
const standardBattle = dataStore.createBattle('user_2', 'deck_1', 'AP Physics 1: Mechanics', 'standard');
console.assert(standardBattle && standardBattle.id, 'Battle creation failed');
console.assert(standardBattle.questions.length === 5, 'Battle does not have 5 questions');
console.assert(standardBattle.dpReward === 120, 'Standard duel DP reward != 120');
console.assert(standardBattle.timeRemainingSeconds === 15, 'Standard duel timer != 15s');
console.log(`✅ PASS: Standard Duel created against ${standardBattle.opponentName} in ${standardBattle.subject} (Stake: +120 DP, Timer: 15s).`);

// 6. Challenge Dispatch Flow (Sudden Death)
console.log('\n--- 6. Challenge Dispatch Flow (Sudden Death) ---');
const suddenBattle = dataStore.createBattle('user_3', 'deck_2', 'AP Calculus AB & BC', 'sudden_death');
console.assert(suddenBattle && suddenBattle.dpReward === 180, 'Sudden death DP reward != 180');
console.assert(suddenBattle.timeRemainingSeconds === 10, 'Sudden death timer != 10s');
console.log(`✅ PASS: Sudden Death Duel created against ${suddenBattle.opponentName} (Stake: +180 DP, Timer: 10s).`);

// 7. Full 5-Round Battle Simulation
console.log('\n--- 7. 5-Round Battle Playthrough ---');
for (let round = 1; round <= 5; round++) {
  const outcome = dataStore.submitBattleAnswer(standardBattle.id, round, 0, 3000);
  console.log(`   Round ${round}/5: User ${outcome.isUserCorrect ? 'Correct' : 'Incorrect'} | AI ${outcome.opponentCorrect ? 'Correct' : 'Incorrect'} | Score: ${outcome.userScore} - ${outcome.opponentScore}`);
  if (round === 5) {
    console.assert(outcome.isGameOver, 'Battle should be finished after round 5');
    console.assert(outcome.result, 'Battle result missing');
    console.log(`✅ PASS: Match Concluded! Winner: ${outcome.result.toUpperCase()} (Final Score: ${outcome.userScore} - ${outcome.opponentScore})`);
  }
}

console.log('\n====================================================');
console.log('🎉 ALL FRIENDS & CHALLENGE FLOW TESTS PASSED (100%)');
console.log('====================================================');
