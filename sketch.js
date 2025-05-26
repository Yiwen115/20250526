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
    strokeWeight(4);

    if (gesture === "rock") {
      // 石頭：左右眼睛多點畫紅色橢圓
      stroke(255, 0, 0); // 紅色
      const leftEyeIndices = [133,173,157,158,159,160,161,246,33,7,163,144,145,153,154,155];
      const rightEyeIndices = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249];
      leftEyeIndices.forEach(idx => {
        const pt = keypoints[idx];
        ellipse(pt[0], pt[1], 60, 40);
      });
      rightEyeIndices.forEach(idx => {
        const pt = keypoints[idx];
        ellipse(pt[0], pt[1], 60, 40);
      });
    } else if (gesture === "scissors") {
      // 剪刀：額頭畫綠色橢圓
      stroke(0, 200, 0); // 綠色
      const pos = keypoints[10];
      ellipse(pos[0], pos[1], 100, 60);
    } else if (gesture === "paper") {
      // 布：左右臉頰畫藍色橢圓
      stroke(0, 0, 255); // 藍色
      const leftCheek = keypoints[234];
      const rightCheek = keypoints[454];
      ellipse(leftCheek[0], leftCheek[1], 80, 80);
      ellipse(rightCheek[0], rightCheek[1], 80, 80);
    } else {
      // 預設第94點，灰色
      stroke(100);
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
