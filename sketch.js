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
    stroke(255, 0, 0);
    strokeWeight(4);

    if (gesture === "rock") {
      // 左右眼睛（第33與263點）
      const leftEye = keypoints[33];
      const rightEye = keypoints[263];
      ellipse(leftEye[0], leftEye[1], 80, 80);
      ellipse(rightEye[0], rightEye[1], 80, 80);
    } else if (gesture === "scissors") {
      // 額頭（第10點）
      const pos = keypoints[10];
      ellipse(pos[0], pos[1], 100, 100);
    } else if (gesture === "paper") {
      // 左右臉頰（第234與454點）
      const leftCheek = keypoints[234];
      const rightCheek = keypoints[454];
      ellipse(leftCheek[0], leftCheek[1], 80, 80);
      ellipse(rightCheek[0], rightCheek[1], 80, 80);
    } else {
      // 預設第94點
      const pos = keypoints[94];
      ellipse(pos[0], pos[1], 100, 100);
    }

    // 顯示手勢文字
    fill(0);
    noStroke();
    textSize(32);
    textAlign(LEFT, TOP);
    text(gesture, 10, 10);
  }
}

// 手勢偵測（簡易版：根據手指張開數量判斷剪刀石頭布）
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
