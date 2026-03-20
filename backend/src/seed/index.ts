import { Exam } from '../models/Exam';
import { Question } from '../models/Question';

const jsQuestions = [
  {
    text: 'What is the output of typeof null in JavaScript?',
    options: ['null', 'undefined', 'object', 'boolean'],
    correctOption: 2,
    order: 1,
  },
  {
    text: 'Which method converts a JSON string to a JavaScript object?',
    options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'],
    correctOption: 1,
    order: 2,
  },
  {
    text: 'What does the "===" operator check?',
    options: ['Value only', 'Type only', 'Value and type', 'Reference only'],
    correctOption: 2,
    order: 3,
  },
  {
    text: 'Which keyword declares a block-scoped variable?',
    options: ['var', 'let', 'both var and let', 'none of the above'],
    correctOption: 1,
    order: 4,
  },
  {
    text: 'What is a closure in JavaScript?',
    options: [
      'A function that has no return value',
      'A function along with its lexical environment',
      'A way to close browser windows',
      'A built-in JavaScript object',
    ],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'Which array method creates a new array with filtered elements?',
    options: ['map()', 'forEach()', 'filter()', 'reduce()'],
    correctOption: 2,
    order: 6,
  },
  {
    text: 'What does "use strict" do?',
    options: [
      'Makes code run faster',
      'Enables strict mode with additional error checking',
      'Disables all warnings',
      'Enables TypeScript mode',
    ],
    correctOption: 1,
    order: 7,
  },
  {
    text: 'Which of the following is NOT a primitive type in JavaScript?',
    options: ['string', 'number', 'object', 'boolean'],
    correctOption: 2,
    order: 8,
  },
  {
    text: 'What does the spread operator (...) do?',
    options: [
      'Compresses an array',
      'Expands an iterable into individual elements',
      'Deletes array elements',
      'Sorts an array',
    ],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'What is the output of: console.log(1 + "2")?',
    options: ['3', '12', 'NaN', 'undefined'],
    correctOption: 1,
    order: 10,
  },
];

const webQuestions = [
  {
    text: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language',
    ],
    correctOption: 0,
    order: 1,
  },
  {
    text: 'Which CSS property is used to change text color?',
    options: ['font-color', 'text-color', 'color', 'foreground-color'],
    correctOption: 2,
    order: 2,
  },
  {
    text: 'What does CSS stand for?',
    options: [
      'Computer Style Sheets',
      'Cascading Style Sheets',
      'Creative Style System',
      'Colorful Style Sheets',
    ],
    correctOption: 1,
    order: 3,
  },
  {
    text: 'Which HTTP method is used to update a resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctOption: 2,
    order: 4,
  },
  {
    text: 'What is the default port for HTTPS?',
    options: ['80', '443', '8080', '3000'],
    correctOption: 1,
    order: 5,
  },
  {
    text: 'Which HTML tag is used for the largest heading?',
    options: ['<heading>', '<h6>', '<h1>', '<head>'],
    correctOption: 2,
    order: 6,
  },
  {
    text: 'What does REST stand for?',
    options: [
      'Representational State Transfer',
      'Remote Execution Server Technology',
      'Reliable Endpoint Service Tool',
      'Request Event State Tracker',
    ],
    correctOption: 0,
    order: 7,
  },
  {
    text: 'Which status code means "Not Found"?',
    options: ['200', '301', '404', '500'],
    correctOption: 2,
    order: 8,
  },
  {
    text: 'What is the purpose of the <meta> tag in HTML?',
    options: [
      'To display metadata on the page',
      'To provide metadata about the document',
      'To create a navigation menu',
      'To include external scripts',
    ],
    correctOption: 1,
    order: 9,
  },
  {
    text: 'Which CSS display value hides an element completely?',
    options: ['hidden', 'none', 'invisible', 'collapse'],
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

  const jsExam = await Exam.create({
    title: 'JavaScript Fundamentals',
    description:
      'Test your knowledge of core JavaScript concepts including types, closures, array methods, and ES6+ features.',
    timeLimitMinutes: 15,
  });

  const webExam = await Exam.create({
    title: 'Web Development Basics',
    description:
      'A quiz covering fundamental web development topics including HTML, CSS, HTTP, and REST APIs.',
    timeLimitMinutes: 20,
  });

  await Question.insertMany(
    jsQuestions.map((q) => ({ ...q, examId: jsExam._id }))
  );

  await Question.insertMany(
    webQuestions.map((q) => ({ ...q, examId: webExam._id }))
  );

  console.log('Database seeded with 2 exams and 20 questions.');
}
