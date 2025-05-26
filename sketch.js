let video;
let facemesh;
let predictions = [];

let handPose;
let hands = [];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 臉部偵測
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 手勢偵測
  handPose = ml5.handpose(video, handModelReady);
  handPose.on('predict', gotHands);
}

function modelReady() {
  // 臉部模型載入完成
}

function handModelReady() {
  // 手勢模型載入完成
}

function gotHands(results) {
  hands = results;
}

function mousePressed() {
  console.log(hands);
}

function draw() {
  image(video, 0, 0, width, height);

  // 臉部偵測：只在第94點畫紅色圓
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    const [x, y] = keypoints[94];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }

  // 手勢偵測
  if (hands.length > 0) {
    for (let hand of hands) {
      // 畫出每個關鍵點
      for (let i = 0; i < hand.landmarks.length; i++) {
        let [x, y] = hand.landmarks[i];
        // 根據左右手上色
        if (hand.handedness === "Left") {
          fill(255, 0, 255);
        } else {
          fill(255, 255, 0);
        }
        noStroke();
        circle(x, y, 16);
      }
    }
  }
}
