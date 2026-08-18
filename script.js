// Helper: iterate a NodeList safely across all browsers (older engines lack
// NodeList.prototype.forEach).
function each(list, fn) {
  Array.prototype.forEach.call(list, fn);
}

function initSite() {
  // Acknowledgement of Country popup — shows once per browser session
  var overlay = document.getElementById('ackOverlay');
  if (overlay) {
    var alreadySeen = sessionStorage.getItem('ackSeen');
    if (!alreadySeen) {
      setTimeout(function () { overlay.classList.add('visible'); }, 250);
    } else {
      overlay.style.display = 'none';
    }
    var closeBtn = document.getElementById('ackClose');
    function closeAck() {
      overlay.classList.remove('visible');
      sessionStorage.setItem('ackSeen', '1');
      setTimeout(function () { overlay.style.display = 'none'; }, 400);
      // Return keyboard focus to the page's main heading rather than
      // leaving it lost on a now-hidden element.
      var mainHeading = document.querySelector('main h1');
      if (mainHeading) {
        mainHeading.focus();
      }
    }
    if (closeBtn) closeBtn.addEventListener('click', closeAck);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAck();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) closeAck();
    });
  }

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Scroll reveal — content must never be permanently hidden, so every path
  // (observer support, no support, or observer failing to fire) ends the
  // same way: sections become visible.
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    each(revealEls, function (el) { io.observe(el); });
  } else {
    each(revealEls, function (el) { el.classList.add('in'); });
  }
  // Safety net regardless of the branch above.
  setTimeout(function () {
    each(revealEls, function (el) { el.classList.add('in'); });
  }, 1000);

  // Jump-nav active state on scroll
  var jumpLinks = document.querySelectorAll('.jumpnav a');
  var sections = [];
  each(jumpLinks, function (a) {
    sections.push(document.querySelector(a.getAttribute('href')));
  });
  function onScroll() {
    var pos = window.scrollY + 140;
    var activeIdx = 0;
    each(sections, function (sec, i) {
      if (sec && sec.offsetTop <= pos) activeIdx = i;
    });
    each(jumpLinks, function (a, i) {
      if (i === activeIdx) { a.className += ' active'; }
      else { a.className = a.className.replace(/\s*active\b/, ''); }
    });
  }
  if (jumpLinks.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

// Robust ready-check: works regardless of when DOMContentLoaded fires
// relative to this trailing script tag.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
