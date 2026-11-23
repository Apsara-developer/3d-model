(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.body.classList.add('ae-3d');
  const atmosphere = document.createElement('div'); atmosphere.className='ae-atmosphere'; atmosphere.innerHTML='<i class="ae-orb one"></i><i class="ae-orb two"></i><i class="ae-orb three"></i>'; document.body.prepend(atmosphere);
  const protectedPages = ['index.html','create-website.html','editor.html','template-library.html','bookings.html'];
  if (protectedPages.includes(path)) {
    const nav=document.createElement('div'); nav.className='ae-global-nav';
    nav.innerHTML='<div class="ae-brand">✦ <b>ARAM</b> EVENTS</div><nav class="ae-nav-links"><a href="index.html">Workspace</a><a href="create-website.html">AI Generator</a><a href="create-website.html#poster">Poster Studio</a><a href="template-library.html">Templates</a><a href="bookings.html" class="ae-booking-link">Bookings ↗</a><a href="editor.html">Editor</a></nav>';
    const main=document.querySelector('main.main')||document.querySelector('main');
    if(main) main.parentNode.insertBefore(nav,main); else document.body.insertBefore(nav,document.body.firstChild);
    const sideNav=document.querySelector('.sidebar nav');
    if(sideNav && !sideNav.querySelector('[href="bookings.html"]')) { const a=document.createElement('a'); a.href='bookings.html'; a.innerHTML='<span>▣</span><span>Bookings</span>'; sideNav.appendChild(a); }
  }
  // Subtle pointer-based 3D depth on interactive panels.
  const selector='.action,.pricing-card,.project-card,.welcome,.ae-panel,.ae-bookings-hero';
  document.addEventListener('pointermove',e=>{const card=e.target.closest(selector); if(!card)return; const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(1000px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg) translateY(-2px)`;});
  document.addEventListener('pointerout',e=>{const card=e.target.closest(selector); if(card && !card.contains(e.relatedTarget)) card.style.transform='';});
})();
