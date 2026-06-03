(function () {
  if (typeof window.galleryData === 'undefined') return;
  var galleryData = window.galleryData;
  var labels = window.galleryLabels || {
    openImage: 'Open image',
    close: 'Close',
    prev: 'Previous image',
    next: 'Next image'
  };

  var mosaic = document.getElementById('galleryMosaic');
  if (!mosaic) return;

  function toWebp(src) { return src.replace(/\.(jpe?g|png)$/i, '.webp'); }

  function buildPicture(src, alt, withLazy) {
    var pic = document.createElement('picture');
    var source = document.createElement('source');
    source.srcset = toWebp(src);
    source.type = 'image/webp';
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (withLazy) img.loading = 'lazy';
    pic.appendChild(source);
    pic.appendChild(img);
    return pic;
  }

  galleryData.forEach(function (item, index) {
    var btn = document.createElement('button');
    btn.className = 'mosaic-item' + (item.featured ? ' featured' : '');
    btn.type = 'button';
    btn.setAttribute('data-index', index);
    btn.setAttribute('aria-label', labels.openImage + ': ' + item.cap);
    btn.appendChild(buildPicture(item.src, item.cap, true));
    mosaic.appendChild(btn);
  });

  var lightbox = document.getElementById('lightbox');
  var lightboxPictureSlot = document.getElementById('lightboxPictureSlot');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var btnClose = document.getElementById('lightboxClose');
  var btnPrev = document.getElementById('lightboxPrev');
  var btnNext = document.getElementById('lightboxNext');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  function updateLightbox() {
    var item = galleryData[currentIndex];
    lightboxPictureSlot.innerHTML = '';
    var pic = buildPicture(item.src, item.cap, false);
    pic.querySelector('img').className = 'lightbox__image';
    lightboxPictureSlot.appendChild(pic);
    lightboxCaption.textContent = item.cap;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryData.length;
  }

  function showNext() { currentIndex = (currentIndex + 1) % galleryData.length; updateLightbox(); }
  function showPrev() { currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length; updateLightbox(); }

  mosaic.addEventListener('click', function (e) {
    var btn = e.target.closest('.mosaic-item');
    if (btn) openLightbox(parseInt(btn.getAttribute('data-index'), 10));
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', showPrev);
  btnNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'ArrowLeft') showPrev();
  });

  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = e.changedTouches[0].screenX - touchStartX;
    if (diff > 50) showPrev();
    else if (diff < -50) showNext();
  }, { passive: true });
})();
