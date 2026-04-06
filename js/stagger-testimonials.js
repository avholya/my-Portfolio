(function () {
  var TESTIMONIALS = [
    {
      stars: "★★★★★",
      starsLabel: "Оценка 5 из 5",
      text: "Сайт получился очень «живым»: выглядит дорого, при этом всё понятно по структуре. Запустились быстро и без лишней бюрократии.",
      name: "James S.",
      role: "Frontend Developer",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=320&auto=format&fit=crop"
    },
    {
      stars: "★★★★☆",
      starsLabel: "Оценка 4.5 из 5",
      text: "Очень понравилась подача кейсов и аккуратная работа с акцентами. Интерфейс читается легко, а атмосфера запоминается.",
      name: "Jessica H.",
      role: "Web Designer",
      img: "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=320&auto=format&fit=crop&q=60"
    },
    {
      stars: "★★★★★",
      starsLabel: "Оценка 5 из 5",
      text: "Редкий случай, когда визуал и UX не спорят друг с другом. Пользователи действительно стали дольше оставаться на странице.",
      name: "Lisa M.",
      role: "UX Designer",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=60"
    },
    {
      stars: "★★★★☆",
      starsLabel: "Оценка 4.5 из 5",
      text: "Коммуникация на каждом этапе была чёткой, а решения — точными. Получили сайт с характером, который приятно показывать клиентам.",
      name: "Jane D.",
      role: "UI/UX Designer",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&auto=format&fit=crop&q=60"
    },
    {
      stars: "★★★★★",
      starsLabel: "Оценка 5 из 5",
      text: "Проект был готов раньше срока, а качество кода — на уровне. Работать было очень комфортно.",
      name: "Andre K.",
      role: "Product Manager",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=60"
    },
    {
      stars: "★★★★★",
      starsLabel: "Оценка 5 из 5",
      text: "Наконец-то нашли человека, который думает и про бизнес, и про пользователя одновременно. Результат превзошёл ожидания.",
      name: "Marina L.",
      role: "Marketing Director",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=60"
    }
  ];

  var track = document.getElementById("stagger-track");
  var prevBtn = document.getElementById("stagger-prev");
  var nextBtn = document.getElementById("stagger-next");
  if (!track) return;

  var cardSize = window.innerWidth >= 640 ? 340 : 270;
  var centerIndex = 0;
  var cards = [];

  function buildCard(t) {
    var el = document.createElement("article");
    el.className = "stagger-card";
    el.innerHTML =
      '<div class="testimonial-stars" aria-label="' + t.starsLabel + '">' + t.stars + "</div>" +
      '<p class="testimonial-text">' + t.text + "</p>" +
      '<div class="testimonial-author">' +
        '<img src="' + t.img + '" alt="" loading="lazy" decoding="async" />' +
        "<div><strong>" + t.name + "</strong><span>" + t.role + "</span></div>" +
      "</div>";
    return el;
  }

  function init() {
    for (var i = 0; i < TESTIMONIALS.length; i++) {
      var card = buildCard(TESTIMONIALS[i]);
      card.style.width = cardSize + "px";
      card.style.height = cardSize + "px";
      track.appendChild(card);
      cards.push(card);

      (function (idx) {
        card.addEventListener("click", function () {
          if (idx !== centerIndex) {
            var diff = idx - centerIndex;
            var len = TESTIMONIALS.length;
            if (diff > len / 2) diff -= len;
            if (diff < -len / 2) diff += len;
            centerIndex = idx;
            updatePositions();
          }
        });
      })(i);
    }
    updatePositions();
  }

  function updatePositions() {
    var len = cards.length;

    for (var i = 0; i < len; i++) {
      var offset = i - centerIndex;
      if (offset > len / 2) offset -= len;
      if (offset < -len / 2) offset += len;

      var isCenter = offset === 0;
      var tx = (cardSize / 1.5) * offset;
      var ty = isCenter ? -55 : (offset % 2 ? 12 : -12);
      var rot = isCenter ? 0 : (offset % 2 ? 2.5 : -2.5);

      cards[i].style.transform =
        "translate(-50%, -50%) translateX(" + tx + "px) translateY(" + ty + "px) rotate(" + rot + "deg)";
      cards[i].style.zIndex = isCenter ? 10 : (len - Math.abs(offset));

      if (isCenter) {
        cards[i].classList.add("is-active");
      } else {
        cards[i].classList.remove("is-active");
      }
    }
  }

  function move(steps) {
    var len = TESTIMONIALS.length;
    centerIndex = ((centerIndex + steps) % len + len) % len;
    updatePositions();
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { move(1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { move(-1); });

  window.addEventListener("resize", function () {
    var newSize = window.innerWidth >= 640 ? 340 : 270;
    if (newSize !== cardSize) {
      cardSize = newSize;
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.width = cardSize + "px";
        cards[i].style.height = cardSize + "px";
      }
      updatePositions();
    }
  });

  init();
})();
