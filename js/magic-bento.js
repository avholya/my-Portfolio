/**
 * Magic Bento — порт с React/GSAP на ванильный JS.
 * Настройки как в примере: spotlight, stars, border glow, click ripple; tilt/magnetism выкл.
 */
(function () {
  var MOBILE_BREAKPOINT = 768;
  var cfg = {
    spotlightRadius: 400,
    particleCount: 12,
    glowColor: "132, 0, 255",
    enableSpotlight: true,
    enableStars: true,
    clickEffect: true,
  };

  function calculateSpotlightValues(radius) {
    return { proximity: radius * 0.5, fadeDistance: radius * 0.75 };
  }

  function updateCardGlowProperties(card, mouseX, mouseY, glow, radius) {
    var rect = card.getBoundingClientRect();
    var w = rect.width || 1;
    var h = rect.height || 1;
    var relativeX = ((mouseX - rect.left) / w) * 100;
    var relativeY = ((mouseY - rect.top) / h) * 100;
    card.style.setProperty("--glow-x", relativeX + "%");
    card.style.setProperty("--glow-y", relativeY + "%");
    card.style.setProperty("--glow-intensity", String(glow));
    card.style.setProperty("--glow-radius", radius + "px");
  }

  function createParticle(x, y, color) {
    var el = document.createElement("div");
    el.className = "particle";
    el.style.cssText =
      "position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(" +
      color +
      ",1);box-shadow:0 0 6px rgba(" +
      color +
      ",0.55);pointer-events:none;z-index:6;left:" +
      x +
      "px;top:" +
      y +
      "px;";
    return el;
  }

  function bindParticleCard(card, gsap, options) {
    var glowColor = options.glowColor;
    var particleCount = options.particleCount;
    var enableStars = options.enableStars;
    var clickEffect = options.clickEffect;

    var timeouts = [];
    var liveParticles = [];
    var isHovered = false;
    var memoized = [];
    var initialized = false;

    function initParticles() {
      if (initialized || !card) return;
      var rect = card.getBoundingClientRect();
      for (var i = 0; i < particleCount; i++) {
        memoized.push(createParticle(Math.random() * rect.width, Math.random() * rect.height, glowColor));
      }
      initialized = true;
    }

    function clearAll() {
      timeouts.forEach(function (id) {
        clearTimeout(id);
      });
      timeouts = [];
      liveParticles.forEach(function (p) {
        gsap.to(p, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)",
          onComplete: function () {
            if (p.parentNode) p.parentNode.removeChild(p);
          },
        });
      });
      liveParticles = [];
    }

    function animateParticles() {
      if (!enableStars || !isHovered) return;
      if (!initialized) initParticles();
      memoized.forEach(function (particle, index) {
        var tid = setTimeout(function () {
          if (!isHovered || !card) return;
          var clone = particle.cloneNode(true);
          card.appendChild(clone);
          liveParticles.push(clone);
          gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
          gsap.to(clone, {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: "none",
            repeat: -1,
            yoyo: true,
          });
          gsap.to(clone, {
            opacity: 0.3,
            duration: 1.5,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
          });
        }, index * 100);
        timeouts.push(tid);
      });
    }

    function onEnter() {
      isHovered = true;
      card.classList.add("particle-container--active");
      animateParticles();
    }

    function onLeave() {
      isHovered = false;
      card.classList.remove("particle-container--active");
      clearAll();
    }

    function onClick(e) {
      if (!clickEffect) return;
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      var ripple = document.createElement("div");
      var d = maxDistance * 2;
      ripple.style.cssText =
        "position:absolute;width:" +
        d +
        "px;height:" +
        d +
        "px;border-radius:50%;background:radial-gradient(circle, rgba(" +
        glowColor +
        ", 0.42) 0%, rgba(" +
        glowColor +
        ", 0.18) 32%, transparent 72%);left:" +
        (x - maxDistance) +
        "px;top:" +
        (y - maxDistance) +
        "px;pointer-events:none;z-index:40;";
      card.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: function () {
            ripple.remove();
          },
        }
      );
    }

    if (enableStars) {
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
    }
    if (clickEffect) {
      card.addEventListener("click", onClick);
    }

    return function destroy() {
      isHovered = false;
      card.classList.remove("particle-container--active");
      if (enableStars) {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      }
      if (clickEffect) {
        card.removeEventListener("click", onClick);
      }
      clearAll();
    };
  }

  function initSpotlight(scopeEl, targetEls, gsap) {
    var spotlightRadius = cfg.spotlightRadius;
    var glowColor = cfg.glowColor;
    var spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText =
      "position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(circle, rgba(" +
      glowColor +
      ", 0.15) 0%, rgba(" +
      glowColor +
      ", 0.08) 15%, rgba(" +
      glowColor +
      ", 0.04) 25%, rgba(" +
      glowColor +
      ", 0.02) 40%, rgba(" +
      glowColor +
      ", 0.01) 65%, transparent 70%);" +
      "z-index:85;opacity:0;left:0;top:0;transform:translate(-50%, -50%);mix-blend-mode:screen;";
    document.body.appendChild(spotlight);

    function handleMove(e) {
      var rect = scopeEl.getBoundingClientRect();
      var inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        targetEls.forEach(function (c) {
          c.style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      var sv = calculateSpotlightValues(spotlightRadius);
      var proximity = sv.proximity;
      var fadeDistance = sv.fadeDistance;
      var minDistance = Infinity;

      targetEls.forEach(function (card) {
        var cr = card.getBoundingClientRect();
        var cx = cr.left + cr.width / 2;
        var cy = cr.top + cr.height / 2;
        var distance = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
        var effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        var glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.12,
        ease: "power2.out",
        overwrite: "auto",
      });
      var targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlight, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    function handleDocLeave() {
      targetEls.forEach(function (c) {
        c.style.setProperty("--glow-intensity", "0");
      });
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
    }

    document.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleDocLeave);

    return function () {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleDocLeave);
      if (spotlight.parentNode) spotlight.parentNode.removeChild(spotlight);
    };
  }

  function init() {
    var scope = document.querySelector("main");
    if (!scope) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    var gsap = window.gsap;

    if (reduced || mobile || !gsap) {
      return;
    }

    var targets = Array.prototype.slice.call(
      document.querySelectorAll(
        ".magic-bento-card, .project-card, .stagger-card, .badge, .audience-list li, .approach-list > li, .contact-grid > div, .about-list li"
      )
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add("particle-container");
    });

    var cleanups = [];

    if (cfg.enableSpotlight) {
      cleanups.push(initSpotlight(scope, targets, gsap));
    }

    targets.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      if (rect.width * rect.height < 9000) return;
      cleanups.push(
        bindParticleCard(card, gsap, {
          glowColor: cfg.glowColor,
          particleCount: cfg.particleCount,
          enableStars: cfg.enableStars,
          clickEffect: cfg.clickEffect,
        })
      );
    });

    window.addEventListener(
      "beforeunload",
      function () {
        cleanups.forEach(function (fn) {
          try {
            fn();
          } catch (e) {}
        });
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
