import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, 'KWESHUN_Project_Documentation.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  info: {
    Title: 'KWESHUN - Complete Project Overview & Documentation',
    Author: 'KWESHUN Academic Platform Team',
    Subject: 'Architecture, Features, Content & User Guide',
    Keywords: 'Kweshun, React, Academic Gaming, Battle Arena, Documentation'
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const COLOR_PRIMARY = '#0a2540'; // Deep Navy
const COLOR_ACCENT = '#00a884'; // Mint green
const COLOR_PURPLE = '#6366f1'; // Indigo/Purple
const COLOR_TEXT = '#1e293b'; // Slate text
const COLOR_MUTED = '#64748b'; // Muted slate
const COLOR_BG_LIGHT = '#f8fafc';
const COLOR_CARD_BORDER = '#e2e8f0';

// Helper: Header Banner
function drawHeader(title, subtitle) {
  doc.rect(45, 40, 505, 75).fillAndStroke('#0f172a', '#0df2c9');
  
  doc.fillColor('#0df2c9').fontSize(22).font('Helvetica-Bold')
     .text('KWESHUN', 60, 52, { characterSpacing: 1.5 });
     
  doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold')
     .text(title, 60, 78);
     
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
     .text(subtitle, 60, 95);

  doc.y = 130;
}

// Helper: Section Title
function addSectionTitle(title, iconText = '') {
  doc.moveDown(0.8);
  const y = doc.y;
  
  doc.rect(45, y, 4, 18).fill('#0df2c9');
  doc.fillColor(COLOR_PRIMARY).fontSize(14).font('Helvetica-Bold')
     .text(`  ${title}`, 52, y + 2);
  doc.moveDown(0.6);
}

// Helper: Subsection Title
function addSubSection(title) {
  doc.moveDown(0.4);
  doc.fillColor(COLOR_PURPLE).fontSize(11).font('Helvetica-Bold')
     .text(title);
  doc.moveDown(0.2);
}

// Helper: Paragraph
function addParagraph(text) {
  doc.fillColor(COLOR_TEXT).fontSize(9.5).font('Helvetica')
     .text(text, { lineGap: 3.5, align: 'justify' });
  doc.moveDown(0.4);
}

// Helper: Bullet Item
function addBullet(boldLabel, desc) {
  doc.fillColor(COLOR_PRIMARY).fontSize(9.5).font('Helvetica-Bold')
     .text(`• ${boldLabel}: `, { continued: true, lineGap: 3 });
  doc.fillColor(COLOR_TEXT).font('Helvetica')
     .text(desc);
  doc.moveDown(0.2);
}

// Helper: Feature Box Card
function addFeatureCard(title, route, whatItDoes, howToUse) {
  const startY = doc.y;
  
  // Measure height
  const cardHeight = 88;
  if (startY + cardHeight > 750) {
    doc.addPage();
  }
  
  const currentY = doc.y;
  doc.roundedRect(45, currentY, 505, 82, 6).fillAndStroke('#f8fafc', '#cbd5e1');
  
  // Header in card
  doc.fillColor(COLOR_PRIMARY).fontSize(10.5).font('Helvetica-Bold')
     .text(title, 55, currentY + 8, { continued: true });
  doc.fillColor('#059669').fontSize(8.5).font('Helvetica-Bold')
     .text(`  [ Route: ${route} ]`);
     
  doc.fillColor(COLOR_MUTED).fontSize(8.5).font('Helvetica-Bold')
     .text('What it does: ', 55, currentY + 26, { continued: true });
  doc.fillColor(COLOR_TEXT).font('Helvetica')
     .text(whatItDoes, { width: 485 });
     
  doc.fillColor('#4338ca').fontSize(8.5).font('Helvetica-Bold')
     .text('How to use: ', 55, currentY + 48, { continued: true });
  doc.fillColor(COLOR_TEXT).font('Helvetica')
     .text(howToUse, { width: 485 });
     
  doc.y = currentY + 90;
}

// ================= PAGE 1 =================
drawHeader('Academic Competition & Question Authoring Platform', 'Complete Architecture, Functional Feature Guide & Documentation • v1.0.0');

addSectionTitle('1. Executive Summary & Core Purpose');
addParagraph(
  'KWESHUN is a modern gamified academic competition web application designed for students, educators, and researchers. Unlike passive flashcards, Kweshun transforms exam preparation and peer learning into a competitive esports-style arena with real-time peer duels, rapid-fire lightning sprints, and peer-reviewed question authoring.'
);
addParagraph(
  'Scholars earn Distinction Points (DP), maintain daily active flame streaks, unlock tiered honors (from Scholar Tier up to Grandmaster), and climb global and school leaderboards through verified academic merit.'
);

addSectionTitle('2. Academic Disciplines & Content Repository');
addParagraph('The platform comes pre-loaded with curated, peer-reviewed question banks across 6 core academic subjects:');

addBullet('Cell Biology & Mitosis', 'Cell cycle checkpoints, meiosis crossover, cyclin-CDK complexes, and organelles.');
addBullet('Organic Chemistry Reactions', 'SN1/SN2 mechanisms, electrophilic aromatic substitution, and reagents.');
addBullet('Electromagnetism & Circuits', "Gauss's law, Maxwell equations, RLC circuit dynamics, and Lorentz force.");
addBullet('Data Structures & Algorithms', 'Balanced search trees, dynamic programming, graph traversal, and asymptotic complexity.');
addBullet('Microeconomics & Game Theory', 'Nash equilibrium, consumer surplus, price elasticity, and oligopoly.');
addBullet('World History 1900–1950', 'Treaty of Versailles, League of Nations, interwar economics, and WWII geopolitics.');

addSectionTitle('3. Complete Platform Feature Guide (Part I)');

addFeatureCard(
  'A. Home Dashboard',
  '/#/ or /#/home',
  'Personal scholar headquarters displaying live DP balance, global rank, battle win rate (W/L ratio), and daily streak flame.',
  'Click "Daily Lightning" for rapid sprints, "Quick Match" for duels, or "Practice" on any deck to launch interactive practice.'
);

addFeatureCard(
  'B. Question Quality Engine',
  '/#/questions',
  'Authoring and peer-review hub featuring a deterministic 5-dimension automated quality calculator (Originality, Factual, Balance, Distinction, Citations).',
  'Click "Author Question", fill in 4 choices, explanation, and citation. View the live 0-100 quality score and choose Direct Publish (+30 DP) or Submit.'
);

// ================= PAGE 2 =================
doc.addPage();

addSectionTitle('3. Complete Platform Feature Guide (Part II)');

addFeatureCard(
  'C. Peer Battle Arena',
  '/#/battles',
  '5-Round Head-to-Head competitive quiz matches with a 15-second countdown timer, live score calculation, and post-duel confetti results.',
  'Click "Instant Quick Match" or "Challenge Peer". Answer within 15s per round. View win/loss outcomes, DP gains, and rematch options.'
);

addFeatureCard(
  'D. Decks & Practice Repository',
  '/#/decks',
  'Academic catalog allowing topic-by-topic mastery tracking and interactive step-by-step quiz practice sessions.',
  'Filter decks by subject (Science, Math, CS, Economics, History) or search keywords. Click "Practice Deck" to earn +10 DP per correct answer.'
);

addFeatureCard(
  'E. Friends & Peer Network',
  '/#/friends',
  'Social connection center showing online status, streaks, win rates, and incoming connection requests.',
  'Click "Invite Peers" to generate a referral link or email direct invites (+50 DP). Click "Challenge" on any friend card to start a custom duel.'
);

addFeatureCard(
  'F. Distinction Leaderboard',
  '/#/leaderboard',
  'Dynamic ranking system with Top-3 scholar podium (#1 Gold, #2 Silver, #3 Bronze) and full ranked table.',
  'Toggle between "Global" vs "Friends Only" and "Monthly" vs "All Time". Click "Challenge" next to any ranked scholar to initiate a match.'
);

addFeatureCard(
  'G. Notification Center',
  '/#/notifications',
  'Real-time actionable alert inbox for challenge invites, peer-review approvals, and DP milestones.',
  'Click "Action" on any notification to directly accept battle invites or review questions. Click "Mark all as read" to clear unread badges.'
);

addFeatureCard(
  'H. Scholar Profile & Ledger',
  '/#/profile/:id',
  'Complete academic curriculum vitae showing badges, win/loss stats, profile editor, and full Distinction Points transaction history.',
  'Click "Edit Profile" to modify bio, handle, and university. Inspect the Distinction Ledger table to trace every earned DP transaction.'
);

// ================= PAGE 3 =================
doc.addPage();

addSectionTitle('4. Technical Architecture & State Management');

addSubSection('A. Frontend Tech Stack');
addBullet('Framework', 'React 19 with Vite 8 for instant sub-second hot-reloading and lightweight production builds.');
addBullet('Routing', 'React Router (HashRouter) enabling deep URL linking, browser back/forward history, and static host compatibility.');
addBullet('Styling', 'Tailwind CSS v4 with custom dark navy tokens (#090d16, #0d121f, #152037), mint (#0df2c9), and purple accents.');
addBullet('Icons & FX', 'Lucide React icon system and Canvas Confetti celebration effects on battle victories and practice completions.');

addSubSection('B. State & Data Layer Architecture');
addBullet('DataStore (services/dataStore.js)', 'Centralized reactive state engine synchronizing Users, Decks, Questions, Battles, Friends, Notifications, and Activities with localStorage persistence.');
addBullet('Quality Scorer (services/qualityScorer.js)', 'Deterministic mathematical scoring algorithm computing weighted composite grades (A+, A, B, C) and actionable recommendations.');
addBullet('Context Providers', 'ThemeProvider (Dark/Light mode), ToastProvider (reactive alerts), AuthProvider (user session), and GameProvider (game actions).');

addSectionTitle('5. Interactive Verification & Flow Checklist');
addParagraph('All 7 key user journeys have been fully implemented, integrated, and verified:');

addBullet('Flow 1 (Authentication & Profile)', 'Sign in with academic credentials -> switch demo profiles -> edit bio and institution -> verify ledger.');
addBullet('Flow 2 (Question Creation & Quality)', 'Open Question Modal -> fill prompt & options -> observe live 5-dimension quality bar -> Direct Publish or Save Draft.');
addBullet('Flow 3 (Peer Battle Gameplay)', 'Launch 5-round battle -> 15s timer countdown -> select choice -> receive instant feedback -> view victory summary & DP reward.');
addBullet('Flow 4 (Daily Lightning Arena)', 'Enter Daily Lightning sprint -> answer 10 rapid-fire questions -> receive speed multiplier bonus DP.');
addBullet('Flow 5 (Deck Practice Session)', 'Open Decks page -> click Practice -> step through questions with full concept explanations -> increase deck mastery %.');
addBullet('Flow 6 (Social & Invites)', 'Send friend request -> accept incoming request -> challenge friend to duel -> generate +50 DP invite link.');
addBullet('Flow 7 (Leaderboard & Search)', 'Search global bar -> filter Monthly/All Time leaderboard -> trigger challenge against ranked scholar.');

// Footer
doc.rect(45, 765, 505, 0.5).fill('#cbd5e1');
doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica')
   .text('KWESHUN Academic Competition Platform • Generated on ' + new Date().toLocaleDateString() + ' • Confidential Documentation', 45, 772, { align: 'center', width: 505 });

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF successfully generated at: ${outputPath}`);
});
