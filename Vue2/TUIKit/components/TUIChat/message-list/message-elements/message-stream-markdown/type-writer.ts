const chineseRegex = /[\u4e00-\u9fa5]/;
const wordAndNonWordRegex = /\b\w+\b|[^\w]+/g;
const isStringArray = (test: any): boolean => {
  return Array.isArray(test) && !test.some(value => typeof value !== 'string');
};

export class TypeWriter {
  /**
   * @property {array} strings strings to be typed
   */
  public strings: string[] = [];

  /**
   * @property {boolean} isTyping current typing status
   */
  public isTyping: boolean = false;

  /**
   * @property {number} typeSpeed type speed in milliseconds. If empty, using dynamic speed.
   */
  public typeSpeed?: number = 0;

  /**
   * @property {number} curArrayPos current typing string's position of all strings.
   */
  private curArrayPos: number = 0;

  /**
   * @property {number} curCharPos current typing character's position in current strings.
   */
  private curCharPos: number = 0;

  /**
   * @property {ReturnType<typeof setTimeout>} timer timer for type writer animation
   */
  private timer?: ReturnType<typeof setTimeout>;

  /**
   * On string is typing
   * @param {string} curStr
   * @param {number} arrayPos
   * @param {number} characterPos
   * @param {Typed} self
   */
  public onTyping?: (curStr: string, arrayPos: number, characterPos: number, self: any) => void;

  /**
   * After start
   * @param {number} arrayPos
   * @param {number} characterPos
   * @param {TypeWriter} self
   */
  public onStart?: (arrayPos: number, characterPos: number, self: any) => void;

  /**
   * After stop
   * @param {number} arrayPos
   * @param {number} characterPos
   * @param {TypeWriter} self
   */
  public onStop?: (arrayPos: number, characterPos: number, self: any) => void;

  /**
   * All typing is complete
   * @param {Typed} self
   */
  public onComplete?: (self: any) => void;

  constructor(options: {
    defaultStrings?: string[];
    typeSpeed?: number;
    onTyping?: (curStr: string, arrayPos: number, characterPos: number, self: any) => void;
    onComplete?: (self: any) => void;
    onStart?: (arrayPos: number, characterPos: number, self: any) => void;
    onStop?: (arrayPos: number, characterPos: number, self: any) => void;
  }) {
    const { defaultStrings, typeSpeed, onTyping, onComplete, onStart, onStop } = options;
    if (defaultStrings && isStringArray(defaultStrings)) {
      this.add(defaultStrings);
    }
    if (typeof typeSpeed === 'number') {
      this.typeSpeed = typeSpeed;
    }
    if (typeof onTyping === 'function') {
      this.onTyping = onTyping;
    }
    if (typeof onComplete === 'function') {
      this.onComplete = onComplete;
    }
    if (typeof onStart === 'function') {
      this.onStart = onStart;
    }
    if (typeof onStop === 'function') {
      this.onStop = onStop;
    }
  }

  add(addStrings: string[]) {
    if (!addStrings || !addStrings.length) return;
    addStrings.forEach((item: string) => {
      if (chineseRegex.test(item)) {
        const newValueArray = item.split('');
        this.strings.push(...newValueArray);
      } else {
        const newValueArray = item.match(wordAndNonWordRegex) || item.split('');
        this.strings.push(...newValueArray);
      }
    });
  }

  start() {
    if (this.isTyping) {
      return;
    }
    this.isTyping = true;
    this.onStart && this.onStart(this.curArrayPos, this.curCharPos, this);
    this._next();
  }

  stop() {
    if (!this.isTyping) {
      return;
    }
    this.isTyping = false;
    clearTimeout(this.timer);
    this.onStop && this.onStop(this.curArrayPos, this.curCharPos, this);
  }

  done() {
    this.stop();
    let _str = this.strings[this.curArrayPos].slice(this.curCharPos);
    _str += this.strings.slice(this.curArrayPos + 1).join('');
    this.curArrayPos = this.strings.length - 1;
    this.curCharPos = this.strings[this.curArrayPos]?.length - 1;
    this.onTyping && this.onTyping(_str, this.curArrayPos, this.curCharPos, this);
    this.strings = [];
  }

  _consume() {
    if (!this.strings.length) {
      return;
    }

    if ((this.curArrayPos >= this.strings.length)) {
      this.isTyping = false;
      this.onComplete?.(this);
      return;
    }

    const item = this.strings[this.curArrayPos]?.[this.curCharPos];
    if (item) {
      this.onTyping && this.onTyping(item, this.curArrayPos, this.curCharPos, this);
    }

    if (this.curCharPos < this.strings[this.curArrayPos]?.length - 1) {
      this.curCharPos++;
    } else {
      this.curArrayPos++;
      this.curCharPos = 0;
    }
  }

  _next() {
    this._consume();
    this.timer = setTimeout(() => {
      this._consume();
      if (this.isTyping) {
        this._next();
      }
    }, this.typeSpeed || this._dynamicSpeed());
  }

  _dynamicSpeed() {
    let length = 0;
    length += (this.strings[this.curArrayPos]?.length || 0) - this.curCharPos - 1;
    for (let i = this.curArrayPos + 1; i < this.strings.length; i++) {
      length += this.strings[i]?.length || 0;
    }
    const speed = 1500 / length;
    if (speed > 150) {
      return 150;
    } else {
      return speed;
    }
  }
}
