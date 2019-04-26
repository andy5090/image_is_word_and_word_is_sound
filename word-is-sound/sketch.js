let keyword;
let keyIndex;

let isSoundOFF;
let transitionStep;

const speedOffsetY = 3;
const speedOffsetX = 0.013;

let transHeight;
let transRate;

function setup() {
  createCanvas(windowWidth, windowHeight - 4);

  keyword = [];
  keyIndex = 0;
  isSoundON = false;
  transitionStep = 0;

  transHeight = (height / 5) * 3;
  transRate = 1;
}

class SingleKey {
  constructor(key, index, posX, posY) {
    this.key = key;
    this.index = index;
    this.posX = posX;
    this.posY = posY;
    this.bitKey = key
      .charCodeAt(0)
      .toString(2)
      .split("");
    this.osc = null;
    this.interval = null;
    this.playStep = 0;
  }

  soundInit() {
    this.osc = new p5.Oscillator();
    this.osc.freq(this.key.charCodeAt(0) * 10);
  }

  soundStart() {
    this.osc.start();
    this.interval = setInterval(() => {
      const step = this.playStep;
      if (this.bitKey[step] === "1") {
        this.osc.amp(0.1);
      } else {
        this.osc.amp(0);
      }
      this.playStep = (step + 1) % 8;
    }, 800);
  }

  soundStop() {
    clearInterval(this.interval);
    this.osc.stop();
  }

  posChange(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }

  bitKeyUpdate(bitKey) {
    this.bitKey = bitKey;
  }
}

function draw() {
  background(0);

  const totalWords = keyword.length;

  if (transitionStep === 0) {
    fill(255);
    textSize(50);
    textAlign(CENTER);
    text("Type your word", width / 2, (height / 5) * 2);

    keyword.map((sKey, index) => {
      sKey.posChange(
        ((width / 2) * (index + 1)) / (totalWords + 1) + width / 4,
        (height / 5) * 3
      );
      text(sKey.key, sKey.posX, sKey.posY);
    });
  } else if (transitionStep === 1) {
    keyword.map((sKey, index) => {
      sKey.posChange(
        ((width / 2) * (2 - transRate) * (index + 1)) / (totalWords + 1) +
          (width / 4) * transRate,
        transHeight
      );
      text(sKey.key, sKey.posX, sKey.posY);
    });

    if (transHeight < height - 70) {
      transHeight = transHeight + speedOffsetY;
      if (transRate > 0) {
        transRate = transRate - speedOffsetX;
      }
    } else {
      transitionStep = 2;

      keyword.map(sKey => {
        sKey.soundStart();
      });
    }
  } else if (transitionStep === 2) {
    keyword.map((sKey, index) => {
      stroke(0);
      fill(255);
      text(sKey.key, sKey.posX, sKey.posY);

      const bitKey = sKey.bitKey;
      let rectYOffset = 150;
      for (i in bitKey) {
        stroke(255);
        if (bitKey[i] === "1") {
          fill(255);
        } else {
          fill(0);
        }
        rect(sKey.posX - 25, sKey.posY - rectYOffset, 50, 50, 5);
        rectYOffset += 60;
      }
    });
  }
}

function keyPressed() {
  if (transitionStep === 0) {
    if (keyCode === RETURN && keyword !== "") {
      transitionStep = 1;
      keyword.map((sKey, index) => {
        let tempBits = sKey.bitKey;

        if (tempBits.length === 7) {
          tempBits.push("1");
        } else if (tempBits.length === 6) {
          tempBits.push("0");
          tempBits.push("0");
        }

        for (i = 0; i < index; i++) {
          const firstBit = tempBits[0];
          tempBits.shift();
          tempBits.push(firstBit);
        }

        sKey.bitKeyUpdate(tempBits);
        sKey.soundInit();
      });
    } else if (keyCode === ESCAPE) {
      keyword = [];
      keyIndex = 0;
    } else if (keyCode >= 65 && keyCode <= 90) {
      keyword.push(new SingleKey(key, keyIndex, 0, 0));
      keyIndex++;
      //letter
    } else if (keyCode >= 48 && keyCode <= 57) {
      keyword.push(new SingleKey(key, keyIndex, 0, 0));
      keyIndex++;
      //number
    } else {
      return false;
    }
  } else if (transitionStep === 2) {
    if (keyCode === ESCAPE) {
      transitionStep = 0;
      keyword.map(sKey => {
        sKey.soundStop();
      });
      keyword = [];
      keyIndex = 0;
      transHeight = (height / 5) * 3;
      transRate = 1;
    }
  }
}

function mouseClicked() {
  getAudioContext().resume();
}
