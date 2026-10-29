(function(){
  var nav=document.getElementById('nav'), bar=document.getElementById('progress');
  function onScroll(){
    var y=window.scrollY||document.documentElement.scrollTop;
    nav.classList.toggle('stuck', y>60);
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?(y/h)*100:0)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  var groups=new WeakMap();
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target, p=el.parentElement;
      var i=groups.get(p)||0; groups.set(p,i+1);
      var d=Math.min(i,6)*70;
      el.style.transitionDelay=d+'ms';
      el.classList.add('in');
      setTimeout(function(){el.style.transitionDelay='';},d+950);
      io.unobserve(el);
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});

  var cio=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target, target=parseFloat(el.dataset.count);
      var pre=el.dataset.prefix||'', suf=el.dataset.suffix||'';
      var t0=null, dur=1300;
      function tick(ts){
        if(!t0) t0=ts;
        var p=Math.min((ts-t0)/dur,1), eased=1-Math.pow(1-p,3);
        el.textContent=pre+Math.round(target*eased)+suf;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});

  function frameState(f){
    var more=f.scrollHeight>f.clientHeight+8;
    f.classList.toggle('has-more',more);
    f.classList.toggle('at-end',!more||f.scrollTop+f.clientHeight>=f.scrollHeight-8);
  }
  document.querySelectorAll('.scrollframe').forEach(function(f){
    f.addEventListener('scroll',function(){frameState(f);},{passive:true});
    f.querySelectorAll('img').forEach(function(i){i.addEventListener('load',function(){frameState(f);});});
    frameState(f);
  });
  window.addEventListener('resize',function(){document.querySelectorAll('.scrollframe').forEach(frameState);});
  window.addEventListener('load',function(){document.querySelectorAll('.scrollframe').forEach(frameState);});

  document.querySelectorAll('.slider').forEach(function(sl){
    var track=sl.querySelector('.track'), slides=track.children,
        tabs=sl.querySelectorAll('.slider-tab'),
        prev=sl.querySelector('.prev'), next=sl.querySelector('.next'), cur=0;
    function go(i){ i=Math.max(0,Math.min(slides.length-1,i)); track.scrollTo({left:slides[i].offsetLeft}); }
    function mark(i){
      cur=i;
      tabs.forEach(function(t,k){ t.classList.toggle('on',k===i); t.setAttribute('aria-selected',k===i?'true':'false'); });
      if(tabs[i]) tabs[i].parentNode.scrollTo({left:tabs[i].offsetLeft-16,behavior:'smooth'});
      prev.disabled=i===0; next.disabled=i===slides.length-1;
      dots.forEach(function(b,k){ b.classList.toggle('on',k===i); });
    }
    var dotsWrap=sl.querySelector('.slider-dots'), dots=[];
    if(dotsWrap){ for(var d=0;d<slides.length;d++){ (function(k){ var b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Example '+(k+1)); b.addEventListener('click',function(){ go(k); }); dotsWrap.appendChild(b); dots.push(b); })(d); } }
    tabs.forEach(function(t,k){ t.addEventListener('click',function(){ go(k); }); });
    prev.addEventListener('click',function(){ go(cur-1); });
    next.addEventListener('click',function(){ go(cur+1); });
    var raf;
    track.addEventListener('scroll',function(){
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(function(){
        var i=Math.round(track.scrollLeft/(slides[0].offsetWidth+20));
        if(i!==cur) mark(Math.max(0,Math.min(slides.length-1,i)));
      });
    },{passive:true});
    mark(0);
  });
})();
