import VocabularyTrainer from './VocabularyTrainer';
import DomUI from './DomUI';

const words = [
  'apple',
  'function',
  'timeout',
  'task',
  'application',
  'data',
  'tragedy',
  'sun',
  'symbol',
  'button',
  'software',
];

const maxErrors = 3;
const maxQuestions = 6;
const ui = new DomUI();
const app = new VocabularyTrainer(words, maxQuestions, maxErrors, ui);

document.addEventListener('DOMContentLoaded', () => {
  app.startTraining();
});
