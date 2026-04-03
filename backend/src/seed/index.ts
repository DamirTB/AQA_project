// backend/src/seed/index.ts
import { Category } from '../models/Category';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';

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

  await Question.insertMany(
    satQuestions.map((q) => ({ ...q, examId: satExam._id }))
  );

  await Question.insertMany(
    ieltsQuestions.map((q) => ({ ...q, examId: ieltsExam._id }))
  );

  console.log('Database seeded with 2 categories, 2 exams (SAT + IELTS), and 20 questions.');
}
