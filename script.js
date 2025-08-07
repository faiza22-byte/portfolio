/* =========== Canvas particles (subtle) =========== */
(() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const PARTICLE_COUNT = Math.max(24, Math.floor((w * h) / 90000));

  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  });

  function rand(min, max){ return Math.random() * (max - min) + min; }

  class P {
    constructor(){
      this.reset();
    }
    reset(){
      this.x = rand(0, w);
      this.y = rand(-h, h);
      this.r = rand(0.6, 2.6);
      this.vy = rand(0.05, 0.6);
      this.vx = rand(-0.2, 0.2);
      this.alpha = rand(0.06, 0.22);
    }
    step(){
      this.x += this.vx;
      this.y += this.vy;
      if(this.y > h + 20) this.reset();
      if(this.x < -50 || this.x > w + 50) this.reset();
    }
    draw(){
      ctx.beginPath();
      ctx.fillStyle = `rgba(110,231,183,${this.alpha})`;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  for(let i=0;i<PARTICLE_COUNT;i++) particles.push(new P());

  function tick(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){ p.step(); p.draw(); }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* =========== Navbar transparency on scroll =========== */
(() => {
  const nav = document.getElementById('siteNav');
  const topBtn = document.getElementById('topBtn');
  function onScroll(){
    if(window.scrollY > 60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    if(window.scrollY > 400) topBtn.style.display = 'block'; else topBtn.style.display = 'none';
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
})();

/* =========== Typing animation for hero title =========== */
(() => {
  const lines = ["Hi, I'm Faiza Gull", "I build AI & Full-Stack products", "I convert research into reliable tools"];
  const target = document.getElementById('typed-line');
  let li=0, ci=0;
  function type(){
    if(!target) return;
    const text = lines[li];
    target.textContent = text.substring(0, ci);
    ci++;
    if(ci > text.length){
      setTimeout(()=>{ erase(); }, 900);
    } else {
      setTimeout(type, 80 + Math.random()*30);
    }
  }
  function erase(){
    const text = lines[li];
    ci--;
    target.textContent = text.substring(0, ci);
    if(ci <= 0){
      li = (li + 1) % lines.length;
      setTimeout(type, 200);
    } else {
      setTimeout(erase, 30);
    }
  }
  type();
})();

/* =========== Smooth scroll for nav links =========== */
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
})();

/* =========== Reveal on scroll (IntersectionObserver) =========== */
(() => {
  const io = new IntersectionObserver((entries, ob) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add('show');
        ob.unobserve(en.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.reveal').forEach(r => io.observe(r));
})();

/* =========== Carousel (infinite loop) =========== */
(() => {
  const wrap = document.querySelector('.carousel-viewport') || document.querySelector('.carousel-viewport');
  const carousel = document.getElementById('carousel');
  const prevBtn = document.querySelector('.carousel-arrow.prev');
  const nextBtn = document.querySelector('.carousel-arrow.next');
  const indicators = document.getElementById('indicators');

  if(!carousel) return;

  // clone items for looping
  const items = Array.from(carousel.children);
  const total = items.length;
  // clone head and tail
  items.forEach(node => carousel.appendChild(node.cloneNode(true)));
  items.slice().reverse().forEach(node => carousel.insertBefore(node.cloneNode(true), carousel.firstChild));

  let index = total; // start at original first (after clones)
  function setTransform(animate=true){
    const itemW = carousel.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).gap || 18);
    if(!animate) carousel.style.transition = 'none'; else carousel.style.transition = '';
    carousel.style.transform = `translateX(${-index * itemW}px)`;
  }

  // build indicators for original items
  for(let i=0;i<total;i++){
    const b = document.createElement('button');
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=> goTo(i));
    indicators.appendChild(b);
  }
  function updateIndicators(){
    const nodes = Array.from(indicators.children);
    const relative = ((index - total) % total + total) % total;
    nodes.forEach((n,i)=> n.classList.toggle('active', i===relative));
  }

  function goTo(i){
    index = total + i;
    setTransform(true);
    updateIndicators();
  }

  nextBtn.addEventListener('click', ()=> { index++; setTransform(true); updateIndicators(); });
  prevBtn.addEventListener('click', ()=> { index--; setTransform(true); updateIndicators(); });

  // keyboard
  document.addEventListener('keydown', e => { if(e.key==='ArrowRight') nextBtn.click(); if(e.key==='ArrowLeft') prevBtn.click(); });

  // autoplay
  let autoplay = setInterval(()=> nextBtn.click(), 4200);
  carousel.addEventListener('mouseenter', ()=> clearInterval(autoplay));
  carousel.addEventListener('mouseleave', ()=> autoplay = setInterval(()=> nextBtn.click(), 4200));

  // correct position after transition if at clones
  carousel.addEventListener('transitionend', ()=>{
    const children = carousel.children;
    const itemW = children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).gap || 18);
    if(index >= children.length - total){
      // jumped past end clones -> jump back to originals
      index = total;
      carousel.style.transition = 'none';
      carousel.style.transform = `translateX(${-index * itemW}px)`;
      requestAnimationFrame(()=> carousel.style.transition = '');
    }
    if(index < total){
      // jumped before start clones -> jump to corresponding original
      index = total + (index % total);
      carousel.style.transition = 'none';
      carousel.style.transform = `translateX(${-index * itemW}px)`;
      requestAnimationFrame(()=> carousel.style.transition = '');
    }
  });

  // initial positioning
  window.addEventListener('load', ()=> setTransform(false));
  window.addEventListener('resize', ()=> setTransform(false));
})();

/* =========== Scroll-to-top button =========== */
(() => {
  const btn = document.getElementById('topBtn');
  btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();

/* =========== Small accessibility tweak: show nav on resize ========= */
(() => {
  const nav = document.querySelector('.nav');
  window.addEventListener('resize', ()=> {
    if(window.innerWidth > 980) nav.classList.remove('mobile-open');
  });
})();
