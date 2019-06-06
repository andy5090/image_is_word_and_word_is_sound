let keyword;
let keyIndex;

let bitBoxSize;
let textSizeAlpha;

let isSoundOFF;
let transitionStep;

const speedOffsetY = 3;
const speedOffsetX = 0.013;

let transHeight;
let transRate;

let reverb;

let capture;
let img4words;

let fs;

function setup() {
  createCanvas(windowWidth, windowHeight - 5);

  capture = createCapture(VIDEO, ready);
  capture.size(16, 9);
  capture.hide();

  keyword = [];
  keyIndex = 0;
  isSoundON = false;
  transitionStep = 0;

  transHeight = (height / 5) * 3;
  transRate = 1;

  bitBoxSize = height / 14;
  textSizeAlpha = height / 1000;

  reverb = new p5.Reverb();
}

function imageToWords() {
  img4words = capture;
  img4words.loadPixels();

  for (let i = 0; i < 16; i++) {
    const pxColor = hue(
      color(
        img4words.pixels[i * 4 + 0],
        img4words.pixels[i * 4 + 1],
        img4words.pixels[i * 4 + 2]
      )
    );

    const keyCode = floor(map(pxColor, 0, 255, 48, 90));

    keyword.push(new SingleKey(String.fromCharCode(keyCode), keyIndex, 0, 0));
    keyIndex++;
  }
}

function ready() {
  setTimeout(wordInit, 1000);
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
    this.osc = new p5.Oscillator();
    this.interval = null;
    this.playStep = 0;
  }

  soundInit() {
    let waveFreq = this.key.charCodeAt(0) * ((this.index % 6) + 7);
    let reverbDecay = 3;
    switch (waveFreq % 7) {
      case 0:
        this.osc.setType("sine");
        break;
      case 1:
        this.osc.setType("square");
        waveFreq = waveFreq / 5;
        reverbDecay = 2;
        break;
      case 3:
        this.osc.setType("sine");
        waveFreq = waveFreq / 3;
        reverbDecay = 2;
        break;
      case 4:
        this.osc.setType("sawtooth");
        waveFreq = waveFreq / 6;
        reverbDecay = 1;
        break;
      case 5:
        this.osc.setType("sine");
        break;
      case 6:
        this.osc.setType("sine");
        waveFreq = waveFreq / 4;
        reverbDecay = 2;
        break;
    }
    this.osc.freq(waveFreq);
    this.osc.amp(0);
    this.osc.start();
    reverb.process(this.osc, 4, reverbDecay);
  }

  soundStart(totalKeys) {
    const stepTime = (this.key.charCodeAt(0) * (13 - (this.index % 6))) / 1.5;
    const singleAmp = 0.3 / totalKeys;
    if (this.bitKey[this.playStep] === "1") {
      this.osc.amp(singleAmp);
    } else {
      this.osc.amp(0);
    }
    this.interval = setInterval(() => {
      this.playStep++;
      if (this.playStep === 8) {
        this.playStep = 0;
        this.bitKeyInvert();
      }
      if (this.bitKey[this.playStep] === "1") {
        this.osc.amp(singleAmp);
      } else {
        this.osc.amp(0);
      }
    }, stepTime);
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

  bitKeyInvert() {
    let tempKey = [];
    this.bitKey.map(bit => {
      if (bit === "1") {
        tempKey.push("0");
      } else {
        tempKey.push("1");
      }
    });
    this.bitKeyUpdate(tempKey);
  }
}

function draw() {
  background(0);

  rectMode(CENTER);

  const totalWords = keyword.length;

  if (transitionStep === 0) {
    fill(255);
    textSize(50 * textSizeAlpha);
    textAlign(CENTER);

    text("This is your word or image", width / 2, (height / 5) * 2);

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

    if (transHeight < height - bitBoxSize * 1.2) {
      transHeight = transHeight + speedOffsetY;
      if (transRate > 0) {
        transRate = transRate - speedOffsetX;
      }
    } else {
      transitionStep = 2;

      keyword.map(sKey => {
        sKey.soundInit();
        sKey.soundStart(keyIndex);
      });
    }
  } else if (transitionStep === 2) {
    keyword.map((sKey, index) => {
      stroke(0);
      fill(255);
      text(sKey.key, sKey.posX, sKey.posY);

      const bitKey = sKey.bitKey;
      let rectYOffset = height / 5;
      for (i in bitKey) {
        stroke(255);
        if (bitKey[i] === "1") {
          fill(255);
        } else {
          fill(0);
        }
        strokeWeight(1);
        rect(sKey.posX, sKey.posY - rectYOffset, bitBoxSize, bitBoxSize, 5);
        if (i == sKey.playStep) {
          stroke(255);
          strokeWeight(4);
          noFill(0);
          rect(
            sKey.posX,
            sKey.posY - rectYOffset,
            bitBoxSize + bitBoxSize / 5,
            bitBoxSize + bitBoxSize / 5,
            5
          );
        }
        rectYOffset += bitBoxSize + bitBoxSize / 5;
      }
    });
  }
}

function reMapBits() {
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
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    transitionStep = 0;
    keyword.map(sKey => {
      sKey.soundStop();
    });
    keyword.length = 0;
    keyIndex = 0;
    transHeight = (height / 5) * 3;
    transRate = 1;

    setTimeout(wordInit, 1000);
  } else if (key === "f" || key === "F") {
    fs = fullscreen();
    fullscreen(!fs);
  }
}

function wordInit() {
  if (transitionStep === 0) {
    imageToWords();

    setTimeout(() => {
      reMapBits();
      transitionStep = 1;
    }, 1000);
  }
}

function mouseClicked() {
  fs = fullscreen();
  fullscreen(!fs);
}
