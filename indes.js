document.addEventListener('DOMContentLoaded', () => {

  const CARDS = [
    {
      eyebrow: 'Hoy',
      lines: [
        'Dicen que hoy es un día especial...',
        'Solo quería aprovechar para hacerte un pequeño detalle.',
        'Y decirte que sos una persona muy especial para mí.'
      ],
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTuPHPd5SR6jgpoGixNpd6Oxla4KcdSDJZtUXOQLiqLg&s=10'
    },
    {
      eyebrow: 'La cancha',
      lines: [
        'Me gusta mucho cuando jugamos voley y terminamos riéndonos mucho.',
        'Son momentos cortos, pero la paso súper bien.'
      ],
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrpNvZuNZsHhbj_0O9CPyS69b8bqdHoMO60zJiNhZyFg&s=10' 
    },
    {
      eyebrow: 'Silencio',
      lines: [
        'Sé que a veces no hablo demasiado...',
        'Me cuesta encontrar las palabras correctas.',
        ['Pero eso no significa que no disfrute estar a tu lado.', 'pause'],
      ],
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdftK56t4HU71tTJWDrlIvtPsR3z31LPnptXRJoUIjAw&s=10'
    },
    {
      eyebrow: 'Todavía no...',
      lines: [
        'Espero que algún día pueda decirte esto de manera diferente.',
        ['Mientras tanto...', 'pause'],
        ['Solo quería decirte que te quiero.', 'strong']
      ],
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ7ThmqMPSqvPVnf3FoP_9vq-khCUVbv0Ky_pzH0wheQ&s=10',
      lastCard: true
    }
  ];

  const stage = document.getElementById('stage');
  const cardTemplate = document.getElementById('cardTemplate');
  const finalTemplate = document.getElementById('finalTemplate');
  const ambientHearts = document.getElementById('ambientHearts');

  const welcomeHTML = document.querySelector('[data-step="0"]').outerHTML;

  let currentIndex = -1;

  function typeWriter(el, text, speed = 35) {
    return new Promise(resolve => {
      el.textContent = '';
      let i = 0;
      function step() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  function fadeOutAndRemove(cardEl, callback) {
    cardEl.classList.remove('card-visible');
    cardEl.classList.add('card-leaving');
    setTimeout(() => {
      cardEl.remove();
      if (callback) callback();
    }, 500);
  }

  async function renderCard(index) {
    const data = CARDS[index];
    const node = cardTemplate.content.cloneNode(true);
    const cardEl = node.querySelector('.card-paper');
    const eyebrow = node.querySelector('.eyebrow');
    const linesWrap = node.querySelector('.card-lines');
    const imgWrap = node.querySelector('.card-image-wrapper');
    const btn = node.querySelector('.btn-continue');

    eyebrow.textContent = data.eyebrow;

    // Si la carta tiene un meme, lo agregamos (con manejo por si la imagen no carga)
    if (data.image) {
      const img = document.createElement('img');
      img.src = data.image;
      img.alt = '';
      img.addEventListener('error', () => imgWrap.remove());
      imgWrap.appendChild(img);
    }

    if (data.lastCard) {
      btn.textContent = 'Cerrar ❤️';
    }

    stage.appendChild(node);
    const appendedCard = stage.lastElementChild;

    // Pequeño delay para que el navegador procese el CSS
    setTimeout(() => {
      appendedCard.classList.add('card-visible');
    }, 50);

    // Efecto máquina de escribir para la primera línea
    const firstLineData = data.lines[0];
    const firstLineText = Array.isArray(firstLineData) ? firstLineData[0] : firstLineData;

    const firstP = document.createElement('p');
    linesWrap.appendChild(firstP);

    // Esperamos 1 segundo a que la carta salga del sobre antes de escribir
    setTimeout(async () => {
      await typeWriter(firstP, firstLineText);

      // Agregamos el resto de las líneas con fade-in (apareciendo por partes)
      data.lines.slice(1).forEach((lineData, i) => {
        const [text, type] = Array.isArray(lineData) ? lineData : [lineData, null];
        const p = document.createElement('p');
        p.textContent = text;
        if (type === 'pause') p.classList.add('line-pause');
        if (type === 'strong') p.classList.add('line-strong');
        // Aumentamos el delay para que salgan una por una lentamente
        p.style.animationDelay = (i * 1.5 + 0.5) + 's';
        linesWrap.appendChild(p);
      });
    }, 1000);

    btn.addEventListener('click', () => {
      if (data.lastCard) {
        showFinalCard(appendedCard);
      } else {
        advance(appendedCard, index + 1);
      }
    });
  }

  function advance(currentCardEl, nextIndex) {
    fadeOutAndRemove(currentCardEl, () => {
      currentIndex = nextIndex;
      renderCard(nextIndex);
    });
  }

  // En vez de dejar la pantalla en blanco al terminar, mostramos una
  // tarjeta de cierre con la opción de volver a leer todo desde el sobre.
  function showFinalCard(currentCardEl) {
    fadeOutAndRemove(currentCardEl, () => {
      const node = finalTemplate.content.cloneNode(true);
      stage.appendChild(node);
      const finalCard = stage.lastElementChild;
      const restartBtn = finalCard.querySelector('.btn-restart');

      setTimeout(() => finalCard.classList.add('card-visible'), 50);

      restartBtn.addEventListener('click', () => {
        fadeOutAndRemove(finalCard, () => {
          currentIndex = -1;
          showWelcomeCard();
        });
      });
    });
  }

  function bindOpenButton(welcomeCard) {
    const openBtn = welcomeCard.querySelector('#openBtn');
    openBtn.addEventListener('click', () => {
      fadeOutAndRemove(welcomeCard, () => {
        currentIndex = 0;
        renderCard(0);
      });
    });
  }

  function showWelcomeCard() {
    stage.insertAdjacentHTML('afterbegin', welcomeHTML);
    const welcomeCard = document.querySelector('[data-step="0"]');
    setTimeout(() => welcomeCard.classList.add('card-visible'), 50);
    bindOpenButton(welcomeCard);
  }

  // Vinculamos el botón de la tarjeta de bienvenida que ya está en el HTML
  bindOpenButton(document.querySelector('[data-step="0"]'));

  // --- Corazones ambientales de fondo ---
  function spawnHeart() {
    if (!ambientHearts) return;
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (12 + Math.random() * 16) + 'px';
    const duration = 8 + Math.random() * 6;
    heart.style.animationDuration = duration + 's';
    ambientHearts.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }

  setInterval(spawnHeart, 1200);
});