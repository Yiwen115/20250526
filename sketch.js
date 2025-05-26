let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = ""; // 剪刀、石頭、布

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    gesture = detectGesture(handPredictions);
  });
}

function modelReady() {
  // 臉部模型載入完成
}
function handModelReady() {
  // 手部模型載入完成
}

function draw() {

  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    noFill();
    drawingContext.shadowBlur = 20;

    if (gesture === "rock") {
      stroke(255, 0, 0, 180);
      drawingContext.shadowColor = "red";
      strokeWeight(3);
      const leftEye = keypoints[33];
      const rightEye = keypoints[263];
      ellipse(leftEye[0] - 10, leftEye[1], 40, 28);
      ellipse(rightEye[0] + 10, rightEye[1], 40, 28);
    } else if (gesture === "scissors") {
      stroke(0, 255, 0, 180);
      drawingContext.shadowColor = "lime";
      strokeWeight(4);
      const pos = keypoints[10];
      ellipse(pos[0], pos[1], 100, 60);
    } else if (gesture === "paper") {
      stroke(0, 128, 255, 180);
      drawingContext.shadowColor = "blue";
      strokeWeight(4);
      const leftCheek = keypoints[234];
      const rightCheek = keypoints[454];
      ellipse(leftCheek[0], leftCheek[1], 80, 80);
      ellipse(rightCheek[0], rightCheek[1], 80, 80);
    }

    drawingContext.shadowBlur = 0;

    // 顯示手勢文字（加底色圓角框）
    fill(255, 255, 255, 200);
    stroke(0, 100);
    strokeWeight(1);
    rect(8, 8, 120, 40, 10);
    noStroke();
    fill(0);
    textSize(32);
    textAlign(LEFT, TOP);
    text(gesture, 16, 12);
  }
}

// 手勢偵測
function detectGesture(hands) {
  if (hands.length === 0) return "";

  const annotations = hands[0].annotations;
  // 計算伸出的手指數量
  let extended = 0;
  ["indexFinger", "middleFinger", "ringFinger", "pinky"].forEach(finger => {
    const tip = annotations[finger][3];
    const pip = annotations[finger][1];
    if (tip[1] < pip[1]) extended++;
  });
  // 大拇指判斷
  const thumbTip = annotations.thumb[3];
  const thumbIp = annotations.thumb[2];
  if (thumbTip[0] > thumbIp[0]) extended++; // 右手

  // 根據伸出手指數量判斷
  if (extended === 0 || extended === 1) return "rock"; // 石頭
  if (extended === 2) return "scissors"; // 剪刀
  if (extended >= 4) return "paper"; // 布
  return "";
}
