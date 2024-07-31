document.addEventListener("DOMContentLoaded", function () {
  const themeMusic = new Audio('assets/sounds/theme.mp3');
  const playButton = document.getElementById('playButton');
  const sound = new Audio('assets/sounds/play.mp3');
  const fadeOutSound = new Audio('assets/sounds/sfx_fade_out.mp3');
  const fadeInSound = new Audio('assets/sounds/sfx_fade_in.mp3');
  const errorSound = new Audio('assets/sounds/error.mp3');
  const defeatSound = new Audio('assets/sounds/defeat.mp3');
  const successSound = new Audio('assets/sounds/success.mp3');
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const circle = document.getElementById("circle");
  const overlay = document.getElementById("overlay");
  const main = document.getElementById('main');
  const itemsContainer = document.getElementById('items');
  const trashBins = document.querySelectorAll('#trash div');
  const finalScoreElement = document.getElementById('finalScore');
  const recordElement = document.getElementById('record');
  const livesElement = document.getElementById('lives');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  const backButton = document.getElementById('backbutton');
  let record = parseInt(localStorage.getItem("record") ?? 0);
  let score = 0;
  let lives = 3;
  let timer = 60;
  let intervalId;
  const maxItems = 5;
  let currentItems = [];
  const itemTypes = [
    { type: 'paper', items: ['paper1.png', 'paper2.png', 'paper3.png', 'paper4.png', 'paper5.png'] },
    { type: 'organic', items: ['organic1.png', 'organic2.png', 'organic3.png', 'organic4.png', 'organic5.png'] },
    { type: 'metal', items: ['metal1.png', 'metal2.png', 'metal3.png', 'metal4.png', 'metal5.png'] },
    { type: 'plastic', items: ['plastic1.png', 'plastic2.png', 'plastic3.png', 'plastic4.png', 'plastic5.png'] },
    { type: 'glass', items: ['glass1.png', 'glass2.png', 'glass3.png', 'glass4.png', 'glass5.png'] },
    { type: 'electronic', items: ['electronic1.png', 'electronic2.png', 'electronic3.png', 'electronic4.png', 'electronic5.png'] }
  ];

  function animateCircle() {
    circle.style.transform = `scale(3)`;

    circle.addEventListener("transitionend", function handleTransitionEnd() {
      overlay.classList.add("hidden");
      overlay.classList.remove("active");

      main.style.display = "flex";

      circle.removeEventListener("transitionend", handleTransitionEnd);
    });
  }

  function animatedReverse() {
    overlay.classList.remove("hidden");
    overlay.classList.add("active");

    circle.style.transform = "scale(0)";

    circle.addEventListener("transitionend", function handleReverseTransition() {
      main.style.display = "none";
      circle.removeEventListener("transitionend", handleReverseTransition);
    });
  }

  function startThemeMusic() {
    themeMusic.loop = true;
    themeMusic.play().catch(error => {
      console.error("Erro ao tentar tocar a música tema:", error);
    });
  }

  function updateLives() {
    lives--;
    if (lives <= 0) {
      errorSound.play()
      endGame(false);
    }
    livesElement.textContent = `Lifes: ${lives}`;
  }

  function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    scoreElement.textContent = `Points: ${score}`;
  }

  function updateTimer() {
    timer--;
    timerElement.textContent = `Time: ${timer}s`;
    if (timer <= 0) {
      endGame(true);
    }
  }

  function endGame(success = true) {
    clearInterval(intervalId);
    setTimeout(function () {
      menu.classList.add('show');
      overlay.classList.remove('hidden');
      animatedReverse()
      setTimeout(() => {
        menu.style.display = 'none';
        finalScoreElement.style.display = "flex";
        finalScoreElement.innerHTML = `
       <p>Sua pontuação final foi ${score}</p>
      `;
        if (success) {
          successSound.play();
        } else {
          defeatSound.play();
        }

        if (score > record) {
          record = score;
          localStorage.setItem("record", record);
          recordElement.textContent = `Recorde: ${record}`;
        }

        setTimeout(() => {
          game.classList.remove('show');
          animateCircle()
          resetGame();
        }, 500);
      }, 1500);
    }, 200);

    themeMusic.pause();
    themeMusic.currentTime = 0;
  }

  function resetGame() {
    lives = 3;
    score = 0;
    timer = 60;
    record = parseInt(localStorage.getItem("record") ?? 0);
    updateScore(0);
    timerElement.textContent = `Time: ${timer}s`;
    livesElement.textContent = `Lifes: ${lives}`;
    scoreElement.textContent = `Points: ${score}`;
    recordElement.textContent = `Recorde: ${record}`;
    menu.style.display = 'flex';
    game.style.display = 'none';
    currentItems.forEach(item => itemsContainer.removeChild(item));
    currentItems = [];
  }

  function startGame() {
    resetGame();
    game.style.display = 'flex';
    menu.style.display = 'none';
    intervalId = setInterval(updateTimer, 1000);
    generateInitialItems();
  }

  function generateInitialItems() {
    for (let i = 0; i < maxItems; i++) {
      generateRandomItem();
    }
  }

  function generateRandomItem() {
    const randomTypeIndex = Math.floor(Math.random() * itemTypes.length);
    const itemType = itemTypes[randomTypeIndex];
    const randomItemIndex = Math.floor(Math.random() * itemType.items.length);
    const itemImage = itemType.items[randomItemIndex];

    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.setAttribute('data-type', itemType.type);
    itemElement.style.backgroundImage = `url('assets/items/${itemType.type}/${itemImage}')`;
    itemElement.style.left = `${Math.random() * 80 + 10}%`;
    itemElement.style.top = `${Math.random() * 60 + 10}%`;
    itemElement.draggable = true;
    itemElement.style.cursor = "grab"
    makeItemDraggable(itemElement);

    itemsContainer.appendChild(itemElement);
    currentItems.push(itemElement);
  }

  function checkDrop(e) {
    const touch = e.changedTouches[0];

    trashBins.forEach(bin => {
      const binRect = bin.getBoundingClientRect();
      if (
        touch.clientX >= binRect.left &&
        touch.clientX <= binRect.right &&
        touch.clientY >= binRect.top &&
        touch.clientY <= binRect.bottom
      ) {

        const binType = bin.id;
        const itemRect = touch.target.getAttribute('data-type')

        if (itemRect === binType) {
          updateScore(1);
          sound.play();
          bin.classList.add('correct');
          setTimeout(() => bin.classList.remove('correct'), 500);
          removeItem(itemRect);
          generateRandomItem();
        } else {
          updateScore(-1);
          errorSound.play();
          updateLives();
          bin.classList.add('wrong');
          setTimeout(() => bin.classList.remove('wrong'), 500);
        }
      }
    });
  }

  function makeItemDraggable(item) {
    item.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-type'));
      setTimeout(() => item.classList.add('hide'), 0);
    });

    item.addEventListener('dragend', function () {
      item.classList.remove('hide');
    });

    item.addEventListener('touchstart', function (e) {
      e.preventDefault();
      const touch = e.touches[0];
      const offsetX = touch.clientX - item.getBoundingClientRect().left;
      const offsetY = touch.clientY - item.getBoundingClientRect().top;

      function handleTouchMove(e) {
        const touch = e.touches[0];
        item.style.position = 'absolute';
        item.style.left = `${touch.clientX - offsetX}px`;
        item.style.top = `${touch.clientY - offsetY}px`;
      }

      function handleTouchEnd(e) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        // Verifica se o item está sobre uma lixeira
        checkDrop(e);
      }

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    });
  }

  function handleDrop(e) {
    const itemType = e.dataTransfer.getData('text/plain');
    const binType = e.target.getAttribute('id');

    if (itemType === binType) {
      updateScore(1);
      sound.play();
      e.target.classList.add('correct');
      setTimeout(() => e.target.classList.remove('correct'), 500);
      removeItem(itemType);
      generateRandomItem();
    } else {
      updateScore(-1);
      errorSound.play();
      updateLives();
      e.target.classList.add('wrong');
      setTimeout(() => e.target.classList.remove('wrong'), 500);
    }
  }

  trashBins.forEach(bin => {
    bin.addEventListener('dragover', function (e) {
      e.preventDefault();
    });

    bin.addEventListener('drop', function (e) {
      e.preventDefault();
      handleDrop(e);
    });

    bin.addEventListener('touchstart', function (e) {
      e.preventDefault();
    });

    bin.addEventListener('touchend', function (e) {
      e.preventDefault();
    });
  });

  function removeItem(itemType) {
    const itemToRemove = currentItems.find(item => item.getAttribute('data-type') === itemType);
    if (itemToRemove) {
      itemsContainer.removeChild(itemToRemove);
      currentItems = currentItems.filter(item => item !== itemToRemove);
    }
  }

  playButton.addEventListener('click', handlePlayButtonClick);
  playButton.addEventListener('touchstart', handlePlayButtonClick);

  backButton.addEventListener('click', handleBackButtonClick);
  backButton.addEventListener('touchstart', handleBackButtonClick);

  function handlePlayButtonClick(e) {
    e.preventDefault();
    playButton.classList.add('clicked');
    setTimeout(function () {
      playButton.classList.remove('clicked');
      fadeOutSound.play();
      overlay.classList.remove('hidden');
      animatedReverse()
      setTimeout(() => {
        menu.style.display = 'none';
        fadeInSound.play();
        animateCircle()
        setTimeout(() => {
          game.classList.add('show');
          startGame();
          startThemeMusic();
        }, 500);
      }, 1500);
    }, 200);
  }

  function handleBackButtonClick(e) {
    e.preventDefault();
    clearInterval(intervalId);

    setTimeout(function () {
      backButton.classList.remove('clicked');
      fadeOutSound.play();
      menu.classList.add('show');
      main.classList.add('transition');
      overlay.classList.remove('hidden');
      animatedReverse()
      setTimeout(() => {
        finalScoreElement.style.display = 'none'
        menu.style.display = 'none';
        fadeInSound.play();
        animateCircle()
        setTimeout(() => {
          game.classList.remove('show');
          main.classList.remove('transition');
          resetGame(); // Inicia o jogo
        }, 500);
      }, 1500);
    }, 200);

    themeMusic.pause();
    themeMusic.currentTime = 0;
  }


});
