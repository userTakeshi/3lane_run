const gameContainer = document.getElementById("gameContainer");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const titleScreen = document.getElementById("titleScreen");
const startButton = document.getElementById("startButton");

let score = 0;
let lane = 1; // 0=左,1=中央,2=右
let enemies = [];
let combo = 0;
let lives = 3;
let gameRunning = false;

// レーンの中心X座標
function getLaneX(lane) {
  const width = window.innerWidth;
  if (lane === 0) return width * 0.166;
  if (lane === 1) return width * 0.5;
  if (lane === 2) return width * 0.833;
}

// プレイヤー初期位置
player.style.left = `${getLaneX(lane)}px`;

// スワイプで移動・タップで攻撃
let touchStartX = null;
document.addEventListener("touchstart", e => {
  if (!gameRunning) return;
  touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  if (!gameRunning) return;
  if (touchStartX === null) return;
  const diff = e.changedTouches[0].clientX - touchStartX;

  if (Math.abs(diff) > 50) {
    if (diff > 0 && lane < 2) lane++;
    if (diff < 0 && lane > 0) lane--;
    player.style.left = `${getLaneX(lane)}px`;
  } else {
    performAttack();
  }
  touchStartX = null;
});

// 敵生成
function createEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  const enemyLane = Math.floor(Math.random() * 3);
  enemy.dataset.lane = enemyLane;
  enemy.style.left = `${getLaneX(enemyLane)}px`;
  enemy.style.top = "-60px";
  gameContainer.appendChild(enemy);
  enemies.push(enemy);
}

// 攻撃処理
function performAttack() {
  // 攻撃エフェクト
  const effect = document.createElement("div");
  const playerRect = player.getBoundingClientRect();
  effect.style.top = playerRect.top - 60 + "px"; // プレイヤーの上に表示
  effect.style.position = "absolute";
  effect.style.width = "10px";
  effect.style.height = "80px";
  effect.style.background = "yellow";
  effect.style.left = player.style.left;
  effect.style.transform = "translateX(-50%)";
  effect.style.borderRadius = "5px";
  gameContainer.appendChild(effect);
  setTimeout(() => gameContainer.removeChild(effect), 100);

  let hit = false;

  enemies.forEach((enemy, i) => {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();
    const near =
      Math.abs(enemyRect.top - playerRect.top) < 120 &&
      enemy.dataset.lane == lane;

    if (near) {
      gameContainer.removeChild(enemy);
      enemies[i] = null;
      hit = true;
    }
  });

  enemies = enemies.filter(e => e !== null);

  const MAX_COMBO = 5;  // コンボ上限

    if (hit) {
        combo++;
        if (combo > MAX_COMBO) {
            combo = MAX_COMBO;
            score += 10 + (combo - 1) * 10;
        }
    } else {
        combo = 0;
    }

  scoreDisplay.textContent = `Score: ${score}`;
}

// プレイヤーヒット処理
function hitPlayer() {
  lives--;
  combo = 0;
  livesDisplay.textContent = "♥".repeat(lives);
  if (lives <= 0) {
    alert("ゲームオーバー！");
    location.reload();
  }
}

// ゲームループ
function update() {
  if (!gameRunning) return;

  enemies.forEach((enemy, i) => {
    const top = parseFloat(enemy.style.top);
    enemy.style.top = top + 3 + "px";

    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    if (
      Math.abs(enemyRect.top - playerRect.top) < 40 &&
      enemy.dataset.lane == lane
    ) {
      hitPlayer();
      gameContainer.removeChild(enemy);
      enemies[i] = null;
    }

    if (top > window.innerHeight) {
      gameContainer.removeChild(enemy);
      enemies[i] = null;
    }
  });

  enemies = enemies.filter(e => e !== null);

  requestAnimationFrame(update);
}

// タイトル画面の「ゲーム開始」ボタン
startButton.addEventListener("click", () => {
  titleScreen.style.display = "none";
  gameContainer.style.display = "block";

  // ゲーム変数リセット
  score = 0;
  combo = 0;
  lives = 3;
  lane = 1;
  player.style.left = `${getLaneX(lane)}px`;
  scoreDisplay.textContent = `Score: ${score}`;
  livesDisplay.textContent = "♥".repeat(lives);
  enemies.forEach(e => gameContainer.removeChild(e));
  enemies = [];

  gameRunning = true;
  update();
  setInterval(createEnemy, 1200);
});
