import { shuffleArray } from './utils';
import { DomUIInterface } from './DomUI';

class VocabularyTrainer {
  private readonly words: string[];
  private currentQuestionIndex: number;
  private currentWord: string;
  private errorRecords: {
    errors: { [word: string]: number };
    total: number;
  };
  private readonly maxErrors: number;
  private currentAnswerArray: string[];
  private readonly shuffledWordsArray: string[];
  private shuffledLettersArray: string[];

  private ui: DomUIInterface;

  constructor(
    words: string[],
    maxQuestions: number,
    maxErrors: number,
    ui: DomUIInterface
  ) {
    this.currentQuestionIndex = 0;
    this.maxErrors = maxErrors;
    this.currentWord = '';
    this.currentAnswerArray = [];
    this.shuffledWordsArray = shuffleArray(words).splice(0, maxQuestions);
    this.words = [...this.shuffledWordsArray];
    this.shuffledLettersArray = [];
    this.errorRecords = this.words.reduce(
      (acc, word) => ({
        ...acc,
        errors: {
          ...acc.errors,
          [word]: 0,
        },
      }),
      {
        errors: {},
        total: 0,
      }
    );
    this.ui = ui;
  }

  startTraining() {
    this.ui.attachTrainingKeyPressHandler(
      this.handleTrainingKeyPress.bind(this)
    );
    this.showNextQuestion();
  }

  showNextQuestion() {
    this.currentAnswerArray = [];
    if (this.currentQuestionIndex < this.words.length) {
      this.currentWord = this.shuffledWordsArray.pop()!;
      this.currentQuestionIndex++;
      this.shuffledLettersArray = shuffleArray(this.currentWord.split(''));

      this.ui.updateQuestionCount(this.currentQuestionIndex, this.words.length);
      this.ui.clearAnswerContainer();
      this.ui.renderShuffledLetters(this.shuffledLettersArray);

      // Attach event handlers
      this.ui.attachLetterClickHandlers(this.handleLetterClick.bind(this));
    } else {
      this.showStatistics();
    }
  }

  handleAnswerSubmission(letter: string, index: number, button?: Element) {
    const expectedLetter = this.currentWord[this.currentAnswerArray.length];

    if (letter === expectedLetter) {
      this.currentAnswerArray.push(letter);
      this.shuffledLettersArray.splice(index, 1);
      this.ui.moveLetterToAnswerContainer(letter, index, button);
      if (
        this.ui.isAnswerComplete(
          this.currentWord,
          this.currentAnswerArray.join('')
        )
      ) {
        this.showNextQuestion();
      }
    } else {
      this.errorRecords.errors[this.currentWord]++;
      this.errorRecords.total++;

      this.ui.highlightIncorrectLetter(index, button);

      if (this.errorRecords.errors[this.currentWord] >= this.maxErrors) {
        this.ui.showMaxErrorsReached(this.currentWord);
        setTimeout(() => this.showNextQuestion(), 1000);
      }
    }
  }

  getInteractionDisabledStatus() {
    return this.errorRecords.errors[this.currentWord] >= this.maxErrors;
  }

  handleLetterClick(letter: string, index: number, button: Element) {
    if (this.getInteractionDisabledStatus()) {
      return;
    }

    this.handleAnswerSubmission(letter, index, button);
  }

  handleTrainingKeyPress(event: KeyboardEvent) {
    if (this.getInteractionDisabledStatus()) {
      return;
    }

    const pressedLetter = event.key.toLowerCase();

    // разрешаем только буквы, запрет на символы, Meta и тд.
    if (/^[a-zA-Zа-яА-Я]$/u.test(pressedLetter)) {
      const index = this.shuffledLettersArray.indexOf(pressedLetter);

      this.handleAnswerSubmission(pressedLetter, index);
    }
  }

  showStatistics() {
    const questionsWithErrors = Object.values(this.errorRecords.errors).filter(
      (error) => error).length;

    const correctAnswers = this.currentQuestionIndex - questionsWithErrors;
    const wordWithMostErrors = this.findWordWithMostErrors();

    this.ui.clearAnswerContainer();
    this.ui.displayStatistics(
      correctAnswers,
      this.errorRecords.total,
      wordWithMostErrors
    );
  }

  findWordWithMostErrors() {
    let maxErrors = 0;
    let wordWithMostErrors = '';

    for (const [word, errorCount] of Object.entries(this.errorRecords.errors)) {
      if (errorCount > maxErrors) {
        maxErrors = errorCount;
        wordWithMostErrors = word;
      }
    }

    return wordWithMostErrors;
  }
}

export default VocabularyTrainer;
