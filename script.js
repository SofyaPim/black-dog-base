document.addEventListener("DOMContentLoaded", function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 720;
  let enemies = [];
  let score = 0;
  let gameOver = false;
  const fullScreenButton = document.getElementById("fullScreenButton");

  class InputHandler {
    constructor() {
      this.keys = [];
      this.touchY = "";
      this.touchTreshold = 30;

      window.addEventListener("keydown", (e) => {
        // Проверяем, была ли нажата одна из клавиш стрелок а также  находится ли эта клавиша уже в массиве this.keys с помощью метода indexOf(). Если indexOf() возвращает -1, это означает, что клавиша еще не была добавлена в массив
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        } else if (e.key === "Enter" && gameOver) restartGame();
        //   console.log(e.key, this.keys);
      });
      window.addEventListener("keyup", (e) => {
        // Если клавиша стрелки отпущена, она удаляется из массива this.keys с помощью метода splice(). Метод indexOf() находит индекс клавиши в массиве, а splice() удаляет элемент по этому индексу.
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
        //   console.log(e.key, this.keys);
      });
      window.addEventListener("touchstart", (e) => {
        this.touchY = e.changedTouches[0].pageY;
      });
      window.addEventListener("touchmove", (e) => {
        const swipeDiastance = e.changedTouches[0].pageY - this.touchY;
        if (
          swipeDiastance < -this.touchTreshold &&
          this.keys.indexOf("swipe up") === -1
        )
          this.keys.push("swipe up");
        else if (
          swipeDiastance > this.touchTreshold &&
          this.keys.indexOf("swipe down") === -1
        ) {
          this.keys.push("swipe down");
          if (gameOver) restartGame();
        }
      });
      window.addEventListener("touchend", (e) => {
        this.keys.splice(this.keys.indexOf("swipe up"), 1);
        this.keys.splice(this.keys.indexOf("swipe down"), 1);
      });
    }
  }
  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 50;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("playerImage");
      this.frameX = 0;
      this.maxFrame = 7;
      this.frameY = 0;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 0;
      this.vy = 0;
      this.weight = 1;
    }
    restart() {
      this.x = 50;
      this.y = this.gameHeight - this.height;
      this.maxFrame = 7;
      this.frameY = 0;
    }
    draw(context) {
    
    // context.lineWidth = 5;
    //     context.strokeStyle = 'blue';
    //     context.beginPath();
    //    context.arc(this.x + this.width/2, this.y + this.height/2 + 20, this.width/3, 0, Math.PI *2);
    //    context.stroke();
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
   
    update(input, deltaTime, enemies) {
      // collision detection
      enemies.forEach((enemy) => {
        const dx = (enemy.x + enemy.width / 2 - 20) - (this.x + this.width / 2);
        const dy = enemy.y + enemy.height / 2 - (this.y + this.width / 2 + 20);
        const distance = Math.hypot(dx, dy);
        if (distance < enemy.width / 3 + this.width / 3) {
          gameOver = true;
        }
      });
      // sprite animation
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX > this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      //  controls
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if (
        (input.keys.indexOf("ArrowUp") > -1 ||
          input.keys.indexOf("swipe up") > -1) &&
        this.onGround()
      ) {
        this.vy -= 30;
      } else {
        this.speed = 0;
      }

      this.x += this.speed;
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.gameWidth - this.width) {
        this.x = this.gameWidth - this.width;
      }
      // vertical movement
      this.y += this.vy;
      if (!this.onGround()) {
        this.vy += this.weight;
        this.maxFrame = 5;
        this.frameY = 1;
      } else {
        this.vy = 0;
        this.maxFrame = 7;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height) {
        this.y = this.gameHeight - this.height;
      }
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }
  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("backgroundImage");
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 7;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
    restart() {
      this.x = 0;
    }
  }
  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById("enemyImage");
      this.x = gameWidth;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.markedForDeletion = false;
    }
    draw(context) {
   
   
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    //   context.lineWidth = 5;
    //   context.strokeStyle = 'blue';
    //   context.beginPath();
    //  context.arc(this.x + this.width/2 - 20, this.y + this.height/2, this.width/3, 0, Math.PI *2);
    //  context.stroke();
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
        score++;
      }
    }
  }

  function handlerEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
  }
  function displayStatusText(context) {
    context.textAlign = "left";
    context.font = "40px Helvetica";
    context.fillStyle = "black";
    context.fillText("Счёт: " + score, 20, 50);
    context.fillStyle = "white";
    context.fillText("Счёт: " + score, 22, 52);
    if (gameOver) {
      context.textAlign = "center";
      context.fillStyle = "black";
      context.fillText(
        "Игра окончена",
        canvas.width / 2,
        canvas.height / 2 - 20
      );
      context.fillStyle = "white";
      context.fillText(
        "Игра окончена",
        canvas.width / 2 + 2,
        canvas.height / 2 - 18
      );
      context.fillStyle = "black";
      context.fillText(
        "Enter или swipe down пробуй ещё",
        canvas.width / 2,
        canvas.height / 2 + 40
      );
      context.fillStyle = "white";
      context.fillText(
        "Enter или swipe down пробуй ещё",
        canvas.width / 2 + 2,
        canvas.height / 2 + 42
      );
    }
  }
  function restartGame() {
    player.restart();
    background.restart();
    enemies = [];
    score = 0;
    gameOver = false;
    animate(0);
  }
  function toggleFullScreen() {
    console.log(document.fullscreenElement);
    if(!document.fullscreenElement){
      canvas.requestFullscreen().catch(err => {
        alert(`can't enable fullscreen mode ${err.message}`)
      });
    } else {
      document.exitFullscreen();
    }
  }
fullScreenButton.addEventListener('click',  toggleFullScreen);
  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);
  let lasTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 2000;
  let randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lasTime;
    lasTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    //  background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handlerEnemies(deltaTime);
    displayStatusText(ctx);
    if (!gameOver) requestAnimationFrame(animate);
  }
  animate(0);
});
