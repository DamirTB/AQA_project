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

  await LearningMaterial.insertMany(learningMaterials);

  console.log(
    'Database seeded with 2 categories, 4 exams (SAT, IELTS, TOEFL, UNT), 40 questions, and 4 learning materials.'
  );
}
