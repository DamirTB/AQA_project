// backend/src/seed/index.ts
import { Category } from '../models/Category';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { LearningMaterial } from '../models/LearningMaterial';

const satQuestions = [
  {
    text: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '15'],
    correctOption: 1,
    order: 1,
  },
  {
    text: 'Which of the following is equivalent to 2/5 of 60?',
    options: ['12', '20', '24', '30'],
    correctOption: 2,
    order: 2,
  },
  {
    text: 'A triangle has angles measuring 45° and 90°. What is the measure of the third angle?',
    options: ['30°', '45°', '60°', '90°'],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'If the area of a square is 144 square units, what is the length of one side?',
    options: ['10', '11', '12', '14'],
    correctOption: 2,
    order: 4,
  },
  {
    text: 'What is the slope of the line passing through points (2, 3) and (6, 11)?',
    options: ['1', '2', '3', '4'],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'The word "ubiquitous" most nearly means:',
    options: ['Rare and unusual', 'Found everywhere', 'Difficult to understand', 'Recently discovered'],
    correctOption: 1,
    order: 6,
  },
  {
    text: 'Which sentence is grammatically correct?',
    options: [
      'Neither the students nor the teacher were ready.',
      'Neither the students nor the teacher was ready.',
      'Neither the students or the teacher were ready.',
      'Neither the students or the teacher was ready.',
    ],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'If f(x) = 2x² - 3x + 1, what is f(3)?',
    options: ['8', '10', '12', '16'],
    correctOption: 1,
    order: 8,
  },
  {
    text: 'A store offers a 20% discount on an item priced at $80. What is the sale price?',
    options: ['$16', '$60', '$64', '$68'],
    correctOption: 2,
    order: 9,
  },
  {
    text: 'In the sentence "The council decided to defer the decision," what does "defer" mean?',
    options: ['Cancel permanently', 'Postpone to a later time', 'Announce publicly', 'Reverse completely'],
    correctOption: 1,
    order: 10,
  },
  {
    text: 'If y = 3x - 4 and x = 6, what is y?',
    options: ['10', '12', '14', '18'],
    correctOption: 2,
    order: 11,
  },
  {
    text: 'A circle has radius 7. What is its area? (Use π ≈ 22/7)',
    options: ['44', '88', '154', '308'],
    correctOption: 2,
    order: 12,
  },
  {
    text: 'Which revision best combines the sentences: "She studied. She passed the exam."',
    options: [
      'She studied, she passed the exam.',
      'She studied; therefore, she passed the exam.',
      'She studied and passed the exam.',
      'Studying she passed the exam.',
    ],
    correctOption: 2,
    order: 13,
  },
  {
    text: 'The median of the data set 3, 7, 8, 12, 15 is:',
    options: ['7', '8', '9', '12'],
    correctOption: 1,
    order: 14,
  },
  {
    text: 'If a number is increased by 40% and the result is 84, what was the original number?',
    options: ['50', '56', '60', '70'],
    correctOption: 2,
    order: 15,
  },
];

const ieltsQuestions = [
  {
    text: 'Choose the correct word: "She has been living in London _____ 2015."',
    options: ['for', 'since', 'from', 'during'],
    correctOption: 1,
    order: 1,
  },
  {
    text: 'Which word is a synonym of "abundant"?',
    options: ['Scarce', 'Plentiful', 'Moderate', 'Insufficient'],
    correctOption: 1,
    order: 2,
  },
  {
    text: 'Choose the correct sentence:',
    options: [
      'If I would have known, I would have come.',
      'If I had known, I would have come.',
      'If I have known, I would have come.',
      'If I knew, I would have come.',
    ],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'The opposite of "benevolent" is:',
    options: ['Generous', 'Malevolent', 'Indifferent', 'Grateful'],
    correctOption: 1,
    order: 4,
  },
  {
    text: 'Choose the correct word: "The report was _____ by the committee last week."',
    options: ['reviewing', 'review', 'reviewed', 'reviews'],
    correctOption: 2,
    order: 5,
  },
  {
    text: '"To break the ice" means:',
    options: [
      'To damage something frozen',
      'To initiate conversation in an awkward situation',
      'To solve a difficult problem',
      'To end a relationship',
    ],
    correctOption: 1,
    order: 6,
  },
  {
    text: 'Which sentence uses the correct form of the comparative?',
    options: [
      'This book is more better than that one.',
      'This book is better than that one.',
      'This book is most better than that one.',
      'This book is gooder than that one.',
    ],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'Choose the correct preposition: "She is very keen _____ learning new languages."',
    options: ['at', 'in', 'on', 'for'],
    correctOption: 2,
    order: 8,
  },
  {
    text: 'What does "pragmatic" mean?',
    options: ['Idealistic and visionary', 'Dealing with things in a practical way', 'Overly emotional', 'Extremely cautious'],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'Choose the correct word: "Despite _____ hard, he failed the exam."',
    options: ['to study', 'studying', 'studied', 'study'],
    correctOption: 1,
    order: 10,
  },
  {
    text: 'Choose the correct passive voice: "The report _____ by the manager yesterday."',
    options: ['was approved', 'approved', 'is approving', 'has approve'],
    correctOption: 0,
    order: 11,
  },
  {
    text: 'Which collocation is correct?',
    options: ['do a decision', 'make a decision', 'take a decision', 'have a decision'],
    correctOption: 1,
    order: 12,
  },
  {
    text: 'The word "ambiguous" most nearly means:',
    options: ['Clear and simple', 'Open to more than one interpretation', 'Extremely loud', 'Very old'],
    correctOption: 1,
    order: 13,
  },
  {
    text: 'Choose the correct article: "She is _____ honest person."',
    options: ['a', 'an', 'the', '— (no article)'],
    correctOption: 1,
    order: 14,
  },
  {
    text: 'Which sentence correctly uses a conditional type 2?',
    options: [
      'If I will be you, I would study more.',
      'If I were you, I would study more.',
      'If I am you, I would study more.',
      'If I was you, I will study more.',
    ],
    correctOption: 1,
    order: 15,
  },
];

const toeflQuestions = [
  {
    text: 'Choose the best completion: "The scientist presented a _____ explanation of the results."',
    options: ['coherent', 'coherence', 'coherently', 'cohering'],
    correctOption: 0,
    order: 1,
  },
  {
    text: 'In academic writing, "mitigate" most nearly means:',
    options: ['increase', 'measure', 'reduce', 'ignore'],
    correctOption: 2,
    order: 2,
  },
  {
    text: 'Select the grammatically correct sentence:',
    options: [
      'The data shows that students improves with practice.',
      'The data show that students improve with practice.',
      'The data showing that students improve with practice.',
      'The data is show that students improve with practice.',
    ],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'The phrase "in contrast" is primarily used to:',
    options: [
      'Introduce an example',
      'Show similarity',
      'Show difference between ideas',
      'Conclude an argument',
    ],
    correctOption: 2,
    order: 4,
  },
  {
    text: 'Choose the best word: "The lecture was so _____ that everyone stayed focused."',
    options: ['engage', 'engaging', 'engaged', 'engagement'],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'Which transition best indicates cause and effect?',
    options: ['however', 'for example', 'therefore', 'meanwhile'],
    correctOption: 2,
    order: 6,
  },
  {
    text: 'What is the main purpose of a thesis statement?',
    options: [
      'To list references',
      'To summarize every paragraph',
      'To state the central argument',
      'To provide background statistics only',
    ],
    correctOption: 2,
    order: 7,
  },
  {
    text: 'Choose the correct preposition: "The professor insisted _____ revising the draft."',
    options: ['in', 'on', 'at', 'to'],
    correctOption: 1,
    order: 8,
  },
  {
    text: 'In TOEFL speaking, a strong response usually includes:',
    options: [
      'Only one short sentence',
      'Memorized phrases without examples',
      'Clear opinion with supporting reasons',
      'As many advanced words as possible without structure',
    ],
    correctOption: 2,
    order: 9,
  },
  {
    text: 'Choose the best completion: "Students are encouraged to _____ multiple sources."',
    options: ['consult', 'consulting', 'consulted', 'consults'],
    correctOption: 0,
    order: 10,
  },
  {
    text: 'The word "substantiate" in academic writing typically means to:',
    options: ['remove evidence', 'support with evidence', 'summarize only', 'avoid detail'],
    correctOption: 1,
    order: 11,
  },
  {
    text: 'Which sentence avoids redundancy?',
    options: [
      'The final outcome was unexpected.',
      'The outcome was unexpected.',
      'Past history shows repetition.',
      'Each individual student must cooperate together.',
    ],
    correctOption: 1,
    order: 12,
  },
  {
    text: 'A topic sentence should:',
    options: [
      'Repeat the title exactly',
      'Introduce the main idea of the paragraph',
      'List every source',
      'End with a question only',
    ],
    correctOption: 1,
    order: 13,
  },
  {
    text: 'Choose the best word: "The results were statistically _____."',
    options: ['significance', 'significant', 'significantly', 'signify'],
    correctOption: 1,
    order: 14,
  },
  {
    text: 'In integrated writing, synthesizing means:',
    options: [
      'Copying one passage only',
      'Combining ideas from multiple sources coherently',
      'Ignoring the lecture',
      'Writing only personal opinion',
    ],
    correctOption: 1,
    order: 15,
  },
];

const untQuestions = [
  {
    text: 'UNT Math: If 2x - 5 = 13, x equals:',
    options: ['4', '6', '8', '9'],
    correctOption: 3,
    order: 1,
  },
  {
    text: 'UNT Math: The value of 3^3 is:',
    options: ['6', '9', '18', '27'],
    correctOption: 3,
    order: 2,
  },
  {
    text: 'UNT Reading: The main idea of a paragraph is:',
    options: [
      'A minor detail',
      'The central point the author wants to convey',
      'A random supporting fact',
      'The final sentence only',
    ],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'UNT Grammar: Choose the correct form: "If she _____ earlier, she would catch the bus."',
    options: ['left', 'leaves', 'had left', 'was leaving'],
    correctOption: 2,
    order: 4,
  },
  {
    text: 'UNT History: The primary role of a constitution is to:',
    options: [
      'Describe daily weather',
      'Set fundamental laws and principles of a state',
      'List all citizens by name',
      'Replace all local regulations',
    ],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'UNT Logic: Which number comes next in the sequence 2, 4, 8, 16, ...?',
    options: ['18', '24', '30', '32'],
    correctOption: 3,
    order: 6,
  },
  {
    text: 'UNT Math: A right triangle has legs 3 and 4. The hypotenuse is:',
    options: ['5', '6', '7', '8'],
    correctOption: 0,
    order: 7,
  },
  {
    text: 'UNT Reading: An inference is:',
    options: [
      'A statement directly copied from the text',
      'A conclusion based on clues and evidence',
      'A grammar correction',
      'A list of key words only',
    ],
    correctOption: 1,
    order: 8,
  },
  {
    text: 'UNT Grammar: Choose the correct sentence:',
    options: [
      'He do not like coffee.',
      'He does not likes coffee.',
      'He does not like coffee.',
      'He not like coffee.',
    ],
    correctOption: 2,
    order: 9,
  },
  {
    text: 'UNT Math: What is 25% of 200?',
    options: ['25', '40', '50', '75'],
    correctOption: 2,
    order: 10,
  },
  {
    text: 'UNT Math: Simplify: (2^3) × (2^2) equals:',
    options: ['2^5', '2^6', '4^5', '32'],
    correctOption: 0,
    order: 11,
  },
  {
    text: 'UNT Logic: All roses are flowers. This is a rose. Therefore:',
    options: ['It is not a flower', 'It is a flower', 'It might be a tree', 'No conclusion follows'],
    correctOption: 1,
    order: 12,
  },
  {
    text: 'UNT Reading: Tone refers to:',
    options: [
      'The font size of the text',
      'The author’s attitude toward the subject',
      'The number of paragraphs',
      'The title of the passage only',
    ],
    correctOption: 1,
    order: 13,
  },
  {
    text: 'UNT Grammar: Neither of the answers _____ correct.',
    options: ['are', 'is', 'were', 'be'],
    correctOption: 1,
    order: 14,
  },
  {
    text: 'UNT Math: The perimeter of a rectangle with length 10 and width 4 is:',
    options: ['14', '24', '28', '40'],
    correctOption: 2,
    order: 15,
  },
];

const greQuestions = [
  {
    text: 'GRE Quant: If x² = 49 and x > 0, what is x?',
    options: ['6', '7', '8', '9'],
    correctOption: 1,
    order: 1,
  },
  {
    text: 'GRE Quant: What is the sum of integers from 1 to 20 inclusive?',
    options: ['190', '200', '210', '220'],
    correctOption: 2,
    order: 2,
  },
  {
    text: 'GRE Quant: A rectangle has length 12 and width 5. Its area is:',
    options: ['34', '48', '60', '72'],
    correctOption: 2,
    order: 3,
  },
  {
    text: 'GRE Quant: If 40% of a number is 28, what is the number?',
    options: ['60', '65', '70', '80'],
    correctOption: 2,
    order: 4,
  },
  {
    text: 'GRE Quant: The prime factorization of 84 includes which factor?',
    options: ['9', '7', '11', '13'],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'GRE Quant: Solve for x: 5x - 15 = 0',
    options: ['2', '3', '4', '5'],
    correctOption: 1,
    order: 6,
  },
  {
    text: 'GRE Quant: A circle has diameter 10. Its circumference is approximately (π ≈ 3.14):',
    options: ['15.7', '31.4', '62.8', '78.5'],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'GRE Quant: Which fraction is largest?',
    options: ['1/3', '2/5', '3/8', '1/2'],
    correctOption: 3,
    order: 8,
  },
  {
    text: 'GRE Quant: |−7 + 3| equals:',
    options: ['−4', '4', '10', '−10'],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'GRE Quant: If y is directly proportional to x and y = 12 when x = 4, find y when x = 10.',
    options: ['24', '28', '30', '36'],
    correctOption: 2,
    order: 10,
  },
];

const gmatQuestions = [
  {
    text: 'GMAT: If a shirt costs $40 after a 20% markup on wholesale, wholesale price was:',
    options: ['$28', '$30', '$32', '$33.33'],
    correctOption: 3,
    order: 1,
  },
  {
    text: 'GMAT: A committee of 3 is chosen from 5 people. How many committees?',
    options: ['10', '15', '20', '60'],
    correctOption: 0,
    order: 2,
  },
  {
    text: 'GMAT: Data sufficiency — Is x > 0? (1) x² > 0 (2) x³ > 0',
    options: ['Statement 1 alone', 'Statement 2 alone', 'Both together', 'Neither'],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'GMAT: Average of 4, 8, and 16 is:',
    options: ['8', '9', '10', '12'],
    correctOption: 1,
    order: 4,
  },
  {
    text: 'GMAT: Critical reasoning — Weakening an argument typically:',
    options: [
      'Adds irrelevant praise',
      'Undermines a key assumption',
      'Restates the conclusion',
      'Changes the topic completely',
    ],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'GMAT: If machine A makes 60 units/hour and B makes 90 units/hour together in one hour:',
    options: ['120', '135', '150', '180'],
    correctOption: 2,
    order: 6,
  },
  {
    text: 'GMAT: Sentence correction — Neither the manager nor the employees _____ notified.',
    options: ['was', 'were', 'is', 'are'],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'GMAT: Probability of rolling an even number on a fair six-sided die:',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctOption: 2,
    order: 8,
  },
  {
    text: 'GMAT: If profit = revenue − cost and revenue is $500 with 30% profit margin on cost, cost is:',
    options: ['$350', '$384.62', '$400', '$454.55'],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'GMAT: Reading: The primary purpose of the passage is most likely to:',
    options: [
      'List random facts',
      'Present and analyze an issue',
      'Tell a fictional story',
      'Provide a recipe',
    ],
    correctOption: 1,
    order: 10,
  },
];

const actQuestions = [
  {
    text: 'ACT Math: What is the value of 7 + 8 × 2?',
    options: ['22', '23', '30', '32'],
    correctOption: 1,
    order: 1,
  },
  {
    text: 'ACT Math: In a right triangle, if one leg is 5 and hypotenuse is 13, the other leg is:',
    options: ['8', '10', '12', '18'],
    correctOption: 2,
    order: 2,
  },
  {
    text: 'ACT English: Choose the best option: "The team _____ their best effort."',
    options: ['give', 'gives', 'giving', 'gave'],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'ACT Reading: Context clues help determine:',
    options: ['Font color', 'Unknown word meaning', 'Page margins', 'Printer settings'],
    correctOption: 1,
    order: 4,
  },
  {
    text: 'ACT Science: A controlled experiment changes:',
    options: ['Only the dependent variable', 'One independent variable at a time', 'Everything at once', 'Nothing'],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'ACT Math: Simplify (3²)³',
    options: ['3^5', '3^6', '9^3', '27'],
    correctOption: 1,
    order: 6,
  },
  {
    text: 'ACT English: Which avoids a comma splice?',
    options: [
      'She ran, she won.',
      'She ran; she won.',
      'She ran she won.',
      'She ran, and she won,',
    ],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'ACT Math: The slope of a horizontal line is:',
    options: ['0', '1', 'undefined', '−1'],
    correctOption: 0,
    order: 8,
  },
  {
    text: 'ACT Reading: A metaphor compares two things:',
    options: ['Using "like"', 'Without using "like" or "as"', 'Only in poetry', 'Only with numbers'],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'ACT Math: What is 15% of 80?',
    options: ['8', '10', '12', '16'],
    correctOption: 2,
    order: 10,
  },
];

const learningMaterials = [
  {
    title: 'Linear Equations: Quick Start',
    topic: 'Math',
    level: 'beginner' as const,
    content:
      'A linear equation usually looks like ax + b = c. To solve it, isolate x by applying inverse operations on both sides equally.',
  },
  {
    title: 'Quadratic Equations and Factoring',
    topic: 'Math',
    level: 'intermediate' as const,
    content:
      'Quadratic equations are written as ax^2 + bx + c = 0. Common solving methods include factoring, completing the square, and the quadratic formula.',
  },
  {
    title: 'Functions and Graph Interpretation',
    topic: 'Math',
    level: 'intermediate' as const,
    content:
      'Functions map each input to one output. Understanding slope, intercepts, and growth patterns helps you quickly interpret test-style graphs.',
  },
  {
    title: 'Geometry Essentials for Test Day',
    topic: 'Math',
    level: 'beginner' as const,
    content:
      'Memorize high-frequency formulas: triangle area, circle circumference/area, and Pythagorean triples. Draw diagrams to avoid careless mistakes.',
  },
  {
    title: 'Reading for Main Idea and Supporting Evidence',
    topic: 'English',
    level: 'intermediate' as const,
    content:
      'Identify the topic sentence or thesis, then map each paragraph to one supporting role: example, contrast, cause-effect, or definition. Eliminate answers that are too narrow or only repeat a detail.',
  },
  {
    title: 'Timed Test Strategy: Pacing and Review',
    topic: 'Test Prep',
    level: 'beginner' as const,
    content:
      'Budget roughly one minute per question on mixed sections, but skip stuck items quickly and circle back if time allows. Never leave blanks when there is no penalty for guessing.',
  },
  {
    title: 'Academic Vocabulary in Context',
    topic: 'English',
    level: 'advanced' as const,
    content:
      'Learn word families and common prefixes (un-, re-, mis-) and suffixes (-tion, -able). On tests, replace the unknown word with a simple synonym and check whether the sentence still makes logical sense.',
  },
  {
    title: 'Probability and Percent Word Problems',
    topic: 'Math',
    level: 'intermediate' as const,
    content:
      'Translate “of” to multiplication and “is” to equals. For percent change, use (new − old) / old × 100%. Set up equations carefully before reaching for the calculator.',
  },
  {
    title: 'Writing Clear Thesis Statements',
    topic: 'Writing',
    level: 'intermediate' as const,
    content:
      'A thesis should answer the prompt directly and preview your reasons in one or two concise clauses. Avoid vague value claims; instead name the criteria you will defend with examples from the text or your experience.',
  },
  {
    title: 'Data Interpretation from Charts and Tables',
    topic: 'Math',
    level: 'beginner' as const,
    content:
      'Read titles, units, and axis labels before comparing bars or lines. Estimate differences when exact values are not required, and watch for scales that do not start at zero, which can exaggerate trends.',
  },
  {
    title: 'Logical Deduction and Syllogisms',
    topic: 'Logic',
    level: 'advanced' as const,
    content:
      'If all A are B and X is A, then X is B. Watch for invalid reversals: “some” and “most” statements do not justify universal conclusions. Diagram simple sets when the wording feels dense.',
  },
  {
    title: 'Grammar: Parallel Structure and Comparisons',
    topic: 'English',
    level: 'intermediate' as const,
    content:
      'Items in a list should share the same grammatical form (all nouns, all gerunds, or all clauses). Comparisons need “than” with a clear parallel object: compare like to like, not a thing to a clause.',
  },
];

export async function seedDatabase(): Promise<void> {
  const examCount = await Exam.countDocuments();
  if (examCount > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const standardizedTests = await Category.create({
    name: 'Standardized Tests',
    description: 'Practice exams for standardized tests such as SAT, GRE, and GMAT.',
  });

  const languageExams = await Category.create({
    name: 'Language Exams',
    description: 'Preparation exams for language proficiency tests such as IELTS and TOEFL.',
  });

  const satExam = await Exam.create({
    title: 'SAT Practice Test',
    description:
      'Practice questions covering SAT Math and Evidence-Based Reading & Writing sections including algebra, geometry, grammar, and vocabulary.',
    timeLimitMinutes: 15,
    categoryId: standardizedTests._id,
  });

  const ieltsExam = await Exam.create({
    title: 'IELTS Academic Preparation',
    description:
      'Prepare for the IELTS Academic test with questions on grammar, vocabulary, reading comprehension, and common English idioms.',
    timeLimitMinutes: 20,
    categoryId: languageExams._id,
  });

  const toeflExam = await Exam.create({
    title: 'TOEFL iBT Preparation',
    description:
      'Practice TOEFL-style reading, grammar, and academic English questions to improve performance in integrated language tasks.',
    timeLimitMinutes: 20,
    categoryId: languageExams._id,
  });

  const untExam = await Exam.create({
    title: 'UNT Comprehensive Practice',
    description:
      'Mock UNT exam with mixed questions in mathematics, reading comprehension, grammar, history, and logic.',
    timeLimitMinutes: 20,
    categoryId: standardizedTests._id,
  });

  const greExam = await Exam.create({
    title: 'GRE General Quantitative Practice',
    description:
      'Quantitative reasoning items covering arithmetic, algebra, geometry, and data interpretation in GRE style.',
    timeLimitMinutes: 25,
    categoryId: standardizedTests._id,
  });

  const gmatExam = await Exam.create({
    title: 'GMAT Focus Edition Practice',
    description:
      'Mixed quantitative and verbal-style items including data sufficiency, sentence correction, and critical reasoning.',
    timeLimitMinutes: 25,
    categoryId: standardizedTests._id,
  });

  const actExam = await Exam.create({
    title: 'ACT Practice Test',
    description:
      'American College Testing style practice across math, English, reading, and basic science reasoning.',
    timeLimitMinutes: 25,
    categoryId: standardizedTests._id,
  });

  await Question.insertMany(
    satQuestions.map((q) => ({ ...q, examId: satExam._id }))
  );

  await Question.insertMany(
    ieltsQuestions.map((q) => ({ ...q, examId: ieltsExam._id }))
  );

  await Question.insertMany(
    toeflQuestions.map((q) => ({ ...q, examId: toeflExam._id }))
  );

  await Question.insertMany(
    untQuestions.map((q) => ({ ...q, examId: untExam._id }))
  );

  await Question.insertMany(
    greQuestions.map((q) => ({ ...q, examId: greExam._id }))
  );

  await Question.insertMany(
    gmatQuestions.map((q) => ({ ...q, examId: gmatExam._id }))
  );

  await Question.insertMany(
    actQuestions.map((q) => ({ ...q, examId: actExam._id }))
  );

  await LearningMaterial.insertMany(learningMaterials);

  console.log(
    'Database seeded with 2 categories, 7 exams (SAT, IELTS, TOEFL, UNT, GRE, GMAT, ACT), 90 questions, and 12 learning materials.'
  );
}
