const gameContainer = document.getElementById("gameContainer");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let score = 0;
let lane = 1; // 0=左,1=中央,2=右
let enemies = [];
let combo = 0;
let lives = 3;

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
  touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  if (touchStartX === null) return;
  const diff = e.changedTouches[0].clientX - touchStartX;

  if (Math.abs(diff) > 50) {
    // 左右スワイプで移動
    if (diff > 0 && lane < 2) lane++;
    if (diff < 0 && lane > 0) lane--;
    player.style.left = `${getLaneX(lane)}px`;
  } else {
    // タップで攻撃
    performAttack();
  }
  touchStartX = null;
});

// 敵生成
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  const enemyLane = Math.floor(Math.random() * 3);
  enemy.dataset.lane = enemyLane;
  enemy.style.left = `${getLaneX(enemyLane)}px`;
  enemy.style.top = "-60px";
  gameContainer.appendChild(enemy);
  enemies.push(enemy);
}

// 攻撃処理（タップ）
function performAttack() {
  // 攻撃エフェクト
  const effect = document.createElement("div");
  const playerRect = player.getBoundingClientRect();
  effect.style.top = playerRect.top - 70 + "px"; // プレイヤーの上に表示
  effect.style.position = "absolute";
  effect.style.width = "10px";
  effect.style.height = "80px";
  effect.style.background = "yellow";
  effect.style.left = player.style.left;
//   effect.style.bottom = "60px";
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

  if (hit) {
    ++combo;
    score += 10 * combo;
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
  enemies.forEach((enemy, i) => {
    const top = parseFloat(enemy.style.top);
    enemy.style.top = top + 3 + "px"; // y移動速度

    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    // 当たり判定
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

// 敵出現間隔
setInterval(createEnemy, 1200);
update();
