const canvas = document.getElementById("patternCanvas");
const ctx = canvas.getContext("2d");

const state = {
  screen: 0,
  baseColor: "#f8efe2",
  targetLines: 4,
  currentOrientation: "vertical",
  currentLineIndex: 0,
  lines: []
};

const screens = document.querySelectorAll(".screen");
const previewCaption = document.getElementById("previewCaption");
const startBtn = document.getElementById("startBtn");
const baseColorInput = document.getElementById("baseColorInput");
const baseColorButtons = document.getElementById("baseColorButtons");
const lineCount = document.getElementById("lineCount");
const minusLine = document.getElementById("minusLine");
const plusLine = document.getElementById("plusLine");
const currentLineTitle = document.getElementById("currentLineTitle");
const ideaInput = document.getElementById("ideaInput");
const aiBtn = document.getElementById("aiBtn");
const aiResult = document.getElementById("aiResult");
const orientationButtons = document.querySelectorAll("[data-orientation]");
const lineType = document.getElementById("lineType");
const lineColor = document.getElementById("lineColor");
const thickness = document.getElementById("thickness");
const thicknessValue = document.getElementById("thicknessValue");
const gap = document.getElementById("gap");
const gapValue = document.getElementById("gapValue");
const opacity = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const addLineBtn = document.getElementById("addLineBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const lineList = document.getElementById("lineList");

const lineTypeNames = {
  straight: "まっすぐ線",
  wave: "ゆらゆら線",
  dot: "点線",
  heart: "ハート線",
  hand: "手書き風線",
  cat: "ねこ線"
};

const orientationNames = {
  vertical: "たて",
  horizontal: "よこ"
};

/* HTMLにねこ線の選択肢がなければ自動で追加 */
const hasCatOption = Array.from(lineType.options).some((option) => {
  return option.value === "cat";
});

if (!hasCatOption) {
  const catOption = document.createElement("option");
  catOption.value = "cat";
  catOption.textContent = "ねこ線";
  lineType.appendChild(catOption);
}

function showScreen(number) {
  state.screen = number;

  screens.forEach((screen) => {
    screen.classList.toggle(
      "active",
      Number(screen.dataset.screen) === number
    );
  });

  if (number === 3) {
    updateCurrentLineTitle();
  }

  if (number === 4) {
    renderLineList();
  }
}

function updateCurrentLineTitle() {
  currentLineTitle.textContent = `${state.currentLineIndex + 1}本目`;
  ideaInput.value = "";
  aiResult.textContent = "まだAI提案はありません";
}

function updateRangeLabels() {
  thicknessValue.textContent = thickness.value;
  gapValue.textContent = gap.value;
  opacityValue.textContent = opacity.value;
}

function setOrientation(value) {
  state.currentOrientation = value;

  orientationButtons.forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.orientation === value
    );
  });
}

function getCurrentLineSetting() {
  return {
    orientation: state.currentOrientation,
    type: lineType.value,
    color: lineColor.value,
    thickness: Number(thickness.value),
    gap: Number(gap.value),
    opacity: Number(opacity.value)
  };
}

function drawPattern(tempLine = null) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = state.baseColor;
  ctx.fillRect(0, 0, w, h);

  const allLines = tempLine ? [...state.lines, tempLine] : state.lines;

  allLines.forEach((line, index) => {
    drawRepeatedLine(line, index);
  });

  previewCaption.textContent =
    state.lines.length === 0
      ? "まだ線はありません"
      : `${state.lines.length}本の線を重ねています`;
}

function drawRepeatedLine(line, index) {
  const size = canvas.width;
  const offset = (index * 28) % line.gap;

  ctx.save();
  ctx.globalAlpha = line.opacity;
  ctx.strokeStyle = line.color;
  ctx.fillStyle = line.color;
  ctx.lineWidth = line.thickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let pos = -line.gap + offset; pos < size + line.gap; pos += line.gap) {
    if (line.orientation === "vertical") {
      drawOneLine(line, pos, 0, pos, size);
    } else {
      drawOneLine(line, 0, pos, size, pos);
    }
  }

  ctx.restore();
}

function drawOneLine(line, x1, y1, x2, y2) {
  if (line.type === "straight") {
    drawStraight(x1, y1, x2, y2);
  } else if (line.type === "wave") {
    drawWave(line, x1, y1);
  } else if (line.type === "dot") {
    drawDots(line, x1, y1);
  } else if (line.type === "heart") {
    drawHearts(line, x1, y1);
  } else if (line.type === "hand") {
    drawHandLine(line, x1, y1);
  } else if (line.type === "cat") {
    drawCats(line, x1, y1);
  }
}

function drawStraight(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawWave(line, x1, y1) {
  const isVertical = line.orientation === "vertical";
  const length = canvas.width;
  const amplitude = Math.max(4, line.thickness * 1.6);
  const waveLength = 54;

  ctx.beginPath();

  for (let t = 0; t <= length; t += 8) {
    const wave = Math.sin((t / waveLength) * Math.PI * 2) * amplitude;

    const x = isVertical ? x1 + wave : t;
    const y = isVertical ? t : y1 + wave;

    if (t === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

function drawDots(line, x1, y1) {
  const isVertical = line.orientation === "vertical";
  const distance = line.thickness * 2.8;
  const radius = line.thickness / 2;

  for (let t = 0; t <= canvas.width; t += distance) {
    const x = isVertical ? x1 : t;
    const y = isVertical ? t : y1;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHearts(line, x1, y1) {
  const isVertical = line.orientation === "vertical";
  const distance = Math.max(26, line.thickness * 3.7);
  const size = Math.max(10, line.thickness * 1.6);

  for (let t = 0; t <= canvas.width; t += distance) {
    const x = isVertical ? x1 : t;
    const y = isVertical ? t : y1;

    drawHeart(x, y, size, isVertical ? 0 : Math.PI / 2);
  }
}

function drawHeart(x, y, size, rotate) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(size / 18, size / 18);

  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-12, -4, -8, -16, 0, -9);
  ctx.bezierCurveTo(8, -16, 12, -4, 0, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHandLine(line, x1, y1) {
  const isVertical = line.orientation === "vertical";
  const length = canvas.width;
  const rough = Math.max(2, line.thickness * 0.45);

  ctx.beginPath();

  for (let t = 0; t <= length; t += 18) {
    const wobble =
      Math.sin((t + x1 + y1) * 0.09) * rough +
      Math.cos(t * 0.05) * rough;

    const x = isVertical ? x1 + wobble : t;
    const y = isVertical ? t : y1 + wobble;

    if (t === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

/* ねこ線 */
function drawCats(line, x1, y1) {
  const isVertical = line.orientation === "vertical";
  const distance = Math.max(40, line.thickness * 5);
  const size = Math.max(13, line.thickness * 1.9);

  for (let t = 0; t <= canvas.width; t += distance) {
    const x = isVertical ? x1 : t;
    const y = isVertical ? t : y1;

    drawCat(x, y, size, isVertical ? 0 : Math.PI / 2);
  }
}

function drawCat(x, y, size, rotate) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(size / 20, size / 20);

  // 顔
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // 左耳
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(-10, -12);
  ctx.lineTo(-2, -8);
  ctx.closePath();
  ctx.fill();

  // 右耳
  ctx.beginPath();
  ctx.moveTo(6, -4);
  ctx.lineTo(10, -12);
  ctx.lineTo(2, -8);
  ctx.closePath();
  ctx.fill();

  // ひげ
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.moveTo(-8, 1);
  ctx.lineTo(-14, -1);

  ctx.moveTo(-8, 3);
  ctx.lineTo(-14, 4);

  ctx.moveTo(8, 1);
  ctx.lineTo(14, -1);

  ctx.moveTo(8, 3);
  ctx.lineTo(14, 4);

  ctx.stroke();

  ctx.restore();
}

function localSuggestion(idea) {
  const text = idea.toLowerCase();

  if (
    text.includes("ねこ") ||
    text.includes("猫") ||
    text.includes("cat") ||
    text.includes("動物")
  ) {
    return {
      lineType: "cat",
      color: "#8b5e3c",
      thickness: 10,
      gap: 108,
      opacity: 0.75,
      reason: "猫っぽい雰囲気に合わせてねこ線にしました。"
    };
  }

  if (
    text.includes("かわいい") ||
    text.includes("ハート") ||
    text.includes("女の子")
  ) {
    return {
      lineType: "heart",
      color: "#b98276",
      thickness: 10,
      gap: 108,
      opacity: 0.72,
      reason: "かわいい印象に合わせてハート線にしました。"
    };
  }

  if (
    text.includes("ゆら") ||
    text.includes("なみなみ") ||
    text.includes("ふわ") ||
    text.includes("波")
  ) {
    return {
      lineType: "wave",
      color: "#8b5e3c",
      thickness: 7,
      gap: 92,
      opacity: 0.72,
      reason: "やわらかい印象に合わせて波線にしました。"
    };
  }

  if (
    text.includes("レトロ") ||
    text.includes("喫茶") ||
    text.includes("カフェ")
  ) {
    return {
      lineType: "dot",
      color: "#7a4d35",
      thickness: 8,
      gap: 82,
      opacity: 0.8,
      reason: "レトロな雰囲気に合わせて点線にしました。"
    };
  }

  if (
    text.includes("手書き") ||
    text.includes("ラフ") ||
    text.includes("ゆる")
  ) {
    return {
      lineType: "hand",
      color: "#6c4a3c",
      thickness: 6,
      gap: 88,
      opacity: 0.75,
      reason: "ゆるい印象に合わせて手書き風線にしました。"
    };
  }

  return {
    lineType: "straight",
    color: "#8b5e3c",
    thickness: 8,
    gap: 96,
    opacity: 0.75,
    reason: "落ち着いた印象に合わせてまっすぐ線にしました。"
  };
}

function applySuggestion(suggestion) {
  lineType.value = suggestion.lineType;
  lineColor.value = suggestion.color;
  thickness.value = suggestion.thickness;
  gap.value = suggestion.gap;
    opacity.value = suggestion.opacity;

  updateRangeLabels();

  aiResult.textContent =
    `AI提案：${lineTypeNames[suggestion.lineType]}。${suggestion.reason}`;

  drawPattern(getCurrentLineSetting());
}

function renderLineList() {
  lineList.innerHTML = "";

  state.lines.forEach((line, index) => {
    const li = document.createElement("li");

    li.textContent =
      `${index + 1}本目：` +
      `${orientationNames[line.orientation]}・` +
      `${lineTypeNames[line.type]}・` +
      `太さ${line.thickness}px・` +
      `間隔${line.gap}px`;

    lineList.appendChild(li);
  });
}

function resetLineInputs() {
  const nextOrientation =
    state.currentLineIndex % 2 === 0 ? "vertical" : "horizontal";

  setOrientation(nextOrientation);

  lineType.value = "straight";
  lineColor.value =
    state.currentLineIndex % 2 === 0 ? "#8b5e3c" : "#b98276";
  thickness.value = 8;
  gap.value = 96;
  opacity.value = 0.75;

  updateRangeLabels();
}

startBtn.addEventListener("click", () => {
  showScreen(1);
});

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(state.screen + 1);
  });
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(Math.max(0, state.screen - 1));
  });
});

baseColorButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-color]");
  if (!button) return;

  state.baseColor = button.dataset.color;
  baseColorInput.value = state.baseColor;

  document.querySelectorAll(".color-chip").forEach((chip) => {
    chip.classList.remove("selected");
  });

  button.classList.add("selected");

  drawPattern();
});

baseColorInput.addEventListener("input", () => {
  state.baseColor = baseColorInput.value;

  document.querySelectorAll(".color-chip").forEach((chip) => {
    chip.classList.remove("selected");
  });

  drawPattern();
});

minusLine.addEventListener("click", () => {
  state.targetLines = Math.max(1, state.targetLines - 1);
  lineCount.textContent = state.targetLines;
});

plusLine.addEventListener("click", () => {
  state.targetLines = Math.min(8, state.targetLines + 1);
  lineCount.textContent = state.targetLines;
});

orientationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setOrientation(button.dataset.orientation);
  });
});

[thickness, gap, opacity, lineType, lineColor].forEach((input) => {
  input.addEventListener("input", () => {
    updateRangeLabels();
    drawPattern(getCurrentLineSetting());
  });
});

aiBtn.addEventListener("click", () => {
  const idea = ideaInput.value.trim();

  if (!idea) {
    aiResult.textContent =
      "先に「ねこ」「ふわふわ」「レトロ」みたいな線のイメージを入力してね。";
    return;
  }

  aiBtn.disabled = true;
  aiBtn.textContent = "AI生成中...";
  aiResult.textContent = "線のイメージを考えています...";

  setTimeout(() => {
    try {
      const suggestion = localSuggestion(idea);
      applySuggestion(suggestion);
    } catch (error) {
      console.error(error);
      aiResult.textContent =
        "エラーが出たので、もう一度入力して試してね。";
    } finally {
      aiBtn.disabled = false;
      aiBtn.textContent = "AIで線を生成";
    }
  }, 500);
});

addLineBtn.addEventListener("click", () => {
  const newLine = getCurrentLineSetting();

  state.lines.push(newLine);
  state.currentLineIndex += 1;

  drawPattern();

  if (state.currentLineIndex >= state.targetLines) {
    showScreen(4);
  } else {
    resetLineInputs();
    updateCurrentLineTitle();
  }
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "check-pattern.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

resetBtn.addEventListener("click", () => {
  state.screen = 0;
  state.baseColor = "#f8efe2";
  state.targetLines = 4;
  state.currentOrientation = "vertical";
  state.currentLineIndex = 0;
  state.lines = [];

  lineCount.textContent = state.targetLines;
  baseColorInput.value = state.baseColor;

  document.querySelectorAll(".color-chip").forEach((chip) => {
    chip.classList.toggle("selected", chip.dataset.color === state.baseColor);
  });

  resetLineInputs();
  drawPattern();
  showScreen(0);
});

resetLineInputs();
drawPattern();