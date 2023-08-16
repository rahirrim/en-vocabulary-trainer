interface DomUIInterface {
  attachTrainingKeyPressHandler(handler: (event: KeyboardEvent) => void): void;
  attachLetterClickHandlers(
    handler: (letter: string, index: number, button: Element) => void
  ): void;
  removeEventListeners(): void;
  updateQuestionCount(current: number, total: number): void;
  clearAnswerContainer(): void;
  renderShuffledLetters(letters: string[]): void;
  moveLetterToAnswerContainer(
    letter: string,
    index: number,
    button?: Element
  ): void;
  hideMainContainer(): void;
  isAnswerComplete(word: string, answer: string): boolean;
  highlightIncorrectLetter(index: number, button?: Element): void;
  showMaxErrorsReached(currentWord: string): void;
  displayStatistics(
    correctAnswers: number,
    errors: number,
    wordWithMostErrors: string
  ): void;
}

class DomUI implements DomUIInterface {
  private mainContainer: HTMLElement;
  private answerContainer: HTMLElement;
  private lettersContainer: HTMLElement;
  private questionCountElement: HTMLElement;
  private statsContainer: HTMLElement;

  private keyPressHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor() {
    this.mainContainer = document.getElementById('main')!;
    this.answerContainer = document.getElementById('answer')!;
    this.lettersContainer = document.getElementById('letters')!;
    this.questionCountElement = document.getElementById('question_count')!;
    this.statsContainer = document.getElementById('stats')!;
  }

  attachTrainingKeyPressHandler(handler: (event: KeyboardEvent) => void) {
    this.keyPressHandler = (event) => {
      handler(event);
    };
    document.addEventListener('keydown', this.keyPressHandler);
  }

  attachLetterClickHandlers(
    handler: (letter: string, index: number, button: Element) => void
  ) {
    const letterButtons = this.lettersContainer.querySelectorAll('.letter');
    letterButtons.forEach((button, index) => {
      const letter = button.textContent || '';
      button.addEventListener('click', () => handler(letter, index, button));
    });
  }

  /** Не делаю удалений для события "click", т.к. элементы удаляются из DOM и по коду не остается ссылок */
  removeEventListeners() {
    if (this.keyPressHandler) {
      document.removeEventListener('keydown', this.keyPressHandler);
      this.keyPressHandler = null;
    }
  }

  updateQuestionCount(current: number, total: number) {
    this.questionCountElement.textContent = `${current} of ${total}`;
  }

  clearAnswerContainer() {
    this.answerContainer.innerHTML = '';
  }

  renderShuffledLetters(letters: string[]) {
    /** делаем кастомный батчинг, чтобы не рендерить после каждой кнопки */
    const fragment = document.createDocumentFragment();

    letters.forEach((letter) => {
      const letterButton = document.createElement('button');
      letterButton.classList.add('btn', 'btn-primary', 'mr-2', 'letter');
      letterButton.textContent = letter;
      fragment.appendChild(letterButton);
    });

    this.lettersContainer.replaceChildren(fragment);
  }

  /**
   * Изначально хотел сделать двухстороннюю привязку массивов и дом элементов,
   * т.е обновляется массив и далее сразу рендерим(синхронизируем) новый список, было бы легче поддерживать код.
   * Но тогда нужно каждый раз рендерить 2 списка, делать remove/addEventListener, теряем в производительности.
   */
  moveLetterToAnswerContainer(letter: string, index: number, button?: Element) {
    const letterButton = document.createElement('button');
    letterButton.classList.add('btn', 'btn-success', 'mr-2', 'letter');
    letterButton.textContent = letter;
    this.answerContainer.appendChild(letterButton);

    const deletedBtn = button ?? this.lettersContainer.children[index];
    this.lettersContainer.removeChild(deletedBtn);
  }

  hideMainContainer() {
    this.mainContainer.style.display = 'none';
  }

  isAnswerComplete(word: string, answer: string) {
    if (word.length !== answer.length) {
      return false;
    }
    return answer === word;
  }

  highlightIncorrectLetter(index: number, button?: Element) {
    const currentButton = button ?? this.lettersContainer.children[index];

    if (!currentButton) {
      return;
    }

    currentButton.classList.add('btn-danger');
    setTimeout(() => currentButton.classList.remove('btn-danger'), 500);
  }

  showMaxErrorsReached(currentWord: string) {
    const currentWordArray = currentWord.split('');
    const fragment = document.createDocumentFragment();

    currentWordArray.forEach((letter) => {
      const letterButton = document.createElement('button');
      letterButton.classList.add('btn', 'btn-danger', 'mr-2', 'letter');
      letterButton.textContent = letter;
      fragment.appendChild(letterButton);
    });

    this.lettersContainer.replaceChildren(fragment);
  }

  displayStatistics(
    correctAnswers: number,
    errors: number,
    wordWithMostErrors: string
  ) {
    this.removeEventListeners();
    this.hideMainContainer();
    this.statsContainer.innerHTML = '';

    const correctAnswersElement = document.createElement('p');
    correctAnswersElement.textContent = `Correct answers: ${correctAnswers}`;
    correctAnswersElement.classList.add('btn-success');
    this.statsContainer.appendChild(correctAnswersElement);

    const errorsElement = document.createElement('p');
    errorsElement.textContent = `Total Errors: ${errors}`;
    errorsElement.classList.add('btn-danger');
    this.statsContainer.appendChild(errorsElement);

    if (wordWithMostErrors) {
      const wordWithMostErrorsElement = document.createElement('p');
      wordWithMostErrorsElement.innerHTML = `Word with most errors: <strong>${wordWithMostErrors}</strong>`;
      this.statsContainer.appendChild(wordWithMostErrorsElement);
    }
  }
}

export type { DomUIInterface };

export default DomUI;
