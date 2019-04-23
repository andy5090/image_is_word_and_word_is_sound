let osc, fft;

let keyword;
let keyIndex;

let inSoundProc;
let transitionStep;

const speedOffsetY = 3;
const speedOffsetX = 0.013;

let transHeight;
let transRate;

function setup() {
  createCanvas(windowWidth, windowHeight - 4);

  keyword = [];
  keyIndex = 0;
  inSoundProc = false;
  transitionStep = 0;

  transHeight = (height / 5) * 3;
  transRate = 1;

  // osc = new p5.Oscillator(); // set frequency and type
  // osc.amp(0.5);

  // fft = new p5.FFT();
  // osc.start();
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
  }

  posChange = (posX, posY) => {
    this.posX = posX;
    this.posY = posY;
  };

  bitKeyUpdate = bitKey => {
    this.bitKey = bitKey;
  };
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
    } else {
      transitionStep = 2;
    }

    if (transRate > 0) {
      transRate = transRate - speedOffsetX;
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

  // change oscillator frequency based on mouseX
  // let freq = map(mouseX, 0, width, 40, 880);
  // osc.freq(freq);

  // let amp = map(mouseY, 0, height, 1, 0.01);
  // osc.amp(amp);
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
