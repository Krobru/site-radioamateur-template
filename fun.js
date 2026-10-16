/* {{CALL}} — aperçu FUN : VFO, S-mètre, PTT CW, carte QSL, easter egg. Vanilla JS, aucun appel réseau. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var L=function(fr,en){return (window.I18N&&I18N.lang==='en')?en:fr};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var STOPS=[
 {f:1.840,b:'160m',m:'LSB',t:'#apropos',fr:'Top band ! Découvrez qui est '+CFG.CALL+'.',en:'Top band! Find out who '+CFG.CALL+' is.'},
 {f:3.680,b:'80m',m:'LSB',t:'#station',fr:'80 m : jetez un œil à la station.',en:'80 m: have a look at the station.'},
 {f:7.100,b:'40m',m:'LSB',t:'#outils',fr:'40 m : outils radio — locator & Morse.',en:'40 m: radio tools — locator & Morse.'},
 {f:14.200,b:'20m',m:'USB',t:'#qsl',fr:'20 m, la bande DX ! QSL via bureau UBA.',en:'20 m, the DX band! QSL via the UBA bureau.'},
 {f:28.500,b:'10m',m:'USB',t:'#liens',fr:'10 m : liens utiles DX & propagation.',en:'10 m: useful DX & propagation links.'},
 {f:50.150,b:'6m',m:'USB',t:'#soutenir',fr:'6 m, la bande magique… soutenez le relais !',en:'6 m, the magic band… support the repeater!'},
 {f:144.800,b:'2m',m:'FM',t:'#articles',fr:'144,800 : fréquence APRS en Europe… lisez nos articles !',en:'144.800: the APRS frequency in Europe… read the articles!'},
 {f:145.500,b:'2m',m:'FM',t:'#contact',fr:'145,500 : appel FM… envoyez-moi un message !',en:'145.500: FM calling… send me a message!'},
 {f:+CFG.REP_OUT,b:'70cm',m:'FM',t:'#relais',fr:''+CFG.REP_CALL+' ! Sortie '+CFG.REP_OUT_FR+' · shift −7,6 · CTCSS '+CFG.CTCSS_FR+' Hz · FM/C4FM',en:''+CFG.REP_CALL+'! Output '+CFG.REP_OUT+' · shift −7.6 · CTCSS '+CFG.CTCSS+' Hz · FM/C4FM'}
];
var STEP=45,rot=3*STEP,signal=1,activity=0,lastIdx=-1;
var vfo=$('#vfo'),dial=$('#vfodial'),freqEl=$('#lcdfreq'),msgEl=$('#lcdmsg'),bandEl=$('#lcdband'),go=$('#lcdgo'),needle=$('#needle'),rx=$('#ledrx'),tx=$('#ledtx');
var modeEl=document.querySelector('.lcd .mode');
function fmt(f){var mhz=Math.floor(f),k=Math.round((f-mhz)*100000);var khz=Math.floor(k/100),hz=k%100;return mhz+'.'+('00'+khz).slice(-3)+'.'+('0'+hz).slice(-2)}
function render(){
  rot=Math.max(-20,Math.min(STOPS.length*STEP-STEP+20,rot));
  var idx=Math.max(0,Math.min(STOPS.length-1,Math.round(rot/STEP))),off=rot-idx*STEP,s=STOPS[idx];
  signal=Math.max(0,1-Math.abs(off)/(STEP/2));
  var f=s.f+off*0.0005;
  freqEl.innerHTML=fmt(f)+'<small>MHz</small>';
  bandEl.textContent=s.b;modeEl.textContent=s.m;
  msgEl.textContent=signal>.35?L(s.fr,s.en):L('… QRM … tournez le VFO …','… QRM … keep tuning …');
  go.setAttribute('href',s.t);go.textContent=L('Aller ›','Go ›');go.setAttribute('aria-label',L('Aller à la section','Go to section')+' '+s.b);
  dial.style.transform='rotate('+(rot*2)+'deg)';
  vfo.setAttribute('aria-valuenow',idx);vfo.setAttribute('aria-valuetext',s.b+' '+fmt(f)+' MHz');
  if(idx!==lastIdx){activity=Math.min(1,activity+.4);lastIdx=idx}
  if(noiseGain)noiseGain.gain.setTargetAtTime(0.004+0.05*(1-signal),actx.currentTime,.05);
  if(reduce)meter(false);
}
function meter(jit){
  var v=signal*.72+activity*.28+(jit?(Math.random()-.5)*.08*(signal+.2):0);v=Math.max(0,Math.min(1,v));
  needle.style.transform='rotate('+(-58+v*116)+'deg)';
  rx.classList.toggle('on',signal>.6&&(!jit||Math.random()>.15));
}
var vis=true;
if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis&&!reduce)requestAnimationFrame(loop)}).observe($('.hero'));
function loop(){activity*=.96;meter(true);if(vis&&!reduce)requestAnimationFrame(loop)}
/* VFO : glisser / molette / clavier */
var dragging=false,lastA=0;
function ang(e){var r=vfo.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
vfo.addEventListener('pointerdown',function(e){dragging=true;lastA=ang(e);vfo.setPointerCapture(e.pointerId);e.preventDefault()});
vfo.addEventListener('pointermove',function(e){if(!dragging)return;var a=ang(e),d=a-lastA;if(d>180)d-=360;if(d<-180)d+=360;lastA=a;rot+=d/2;activity=Math.min(1,activity+Math.abs(d)/120);render()});
['pointerup','pointercancel'].forEach(function(t){vfo.addEventListener(t,function(){dragging=false;var i=Math.round(rot/STEP);if(Math.abs(rot-i*STEP)<8){rot=i*STEP;render()}})});
vfo.addEventListener('wheel',function(e){e.preventDefault();rot+=(e.deltaY>0?1:-1)*4;activity=Math.min(1,activity+.15);render()},{passive:false});
vfo.addEventListener('keydown',function(e){var k=e.key,d=0;
  if(k==='ArrowRight'||k==='ArrowUp')d=STEP/3;else if(k==='ArrowLeft'||k==='ArrowDown')d=-STEP/3;else if(k==='PageUp')d=STEP;else if(k==='PageDown')d=-STEP;
  else if(k==='Home'){rot=0;render();e.preventDefault();return}else if(k==='End'){rot=(STOPS.length-1)*STEP;render();e.preventDefault();return}
  else if(k==='Enter'){location.hash=go.getAttribute('href');return}
  if(d){rot=Math.round((rot+d)/(STEP/3))*(STEP/3);render();e.preventDefault()}});
window.addEventListener('mousemove',function(e){activity=Math.min(1,activity+Math.min(.05,(Math.abs(e.movementX||0)+Math.abs(e.movementY||0))/600));if(reduce)meter(false)},{passive:true});
window.addEventListener('scroll',function(){activity=Math.min(1,activity+.04);if(reduce)meter(false)},{passive:true});
/* Audio : bruit (désactivé par défaut) + PTT CW */
var actx=null,noiseSrc=null,noiseGain=null;
function ac(){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;actx=actx||new A();if(actx.state==='suspended')actx.resume();return actx}
$('#noise').addEventListener('click',function(){
  var b=this,on=b.getAttribute('aria-pressed')!=='true';
  if(on){var c=ac();if(!c)return;var n=c.sampleRate*2,buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    noiseSrc=c.createBufferSource();noiseSrc.buffer=buf;noiseSrc.loop=true;var bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=.6;
    noiseGain=c.createGain();noiseGain.gain.value=0;noiseSrc.connect(bp);bp.connect(noiseGain);noiseGain.connect(c.destination);noiseSrc.start();render();}
  else if(noiseSrc){noiseSrc.stop();noiseSrc.disconnect();noiseSrc=null;noiseGain=null}
  b.setAttribute('aria-pressed',on?'true':'false');
});
var M={C:'-.-.',Q:'--.-',D:'-..',E:'.',O:'---',N:'-.',4:'....-',L:'.-..',B:'-...',K:'-.-'},cwTimers=[],cwOsc=null;
function stopCW(){cwTimers.forEach(clearTimeout);cwTimers=[];tx.classList.remove('on');$('#ptt').classList.remove('down');if(cwOsc){try{cwOsc.stop()}catch(e){}cwOsc=null}}
$('#ptt').addEventListener('click',function(){
  if(cwOsc){stopCW();return}
  var c=ac();if(!c)return;var u=1.2/22,t=c.currentTime+.05,g=c.createGain();g.gain.value=0;g.connect(c.destination);
  cwOsc=c.createOscillator();cwOsc.frequency.value=700;cwOsc.connect(g);cwOsc.start(t);$('#ptt').classList.add('down');
  ('CQ CQ DE '+CFG.CALL+' K').split(' ').forEach(function(w){w.split('').forEach(function(ch){(M[ch]||'').split('').forEach(function(sym){
    var d=(sym==='.'?1:3)*u;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.005);g.gain.setValueAtTime(.3,t+d-.005);g.gain.linearRampToValueAtTime(0,t+d);
    (function(on,dur){cwTimers.push(setTimeout(function(){tx.classList.add('on')},on*1000));cwTimers.push(setTimeout(function(){tx.classList.remove('on')},(on+dur)*1000))})(t-c.currentTime,d);t+=d+u});t+=2*u});t+=4*u});
  cwOsc.stop(t);cwTimers.push(setTimeout(stopCW,(t-c.currentTime)*1000+60));
  msgEl.textContent='CQ CQ DE '+CFG.CALL+' K';
});
/* Modules rack : boutons et LED */
$$('#gear .card').forEach(function(c){var k=document.createElement('span');k.className='rk';k.setAttribute('aria-hidden','true');var l=document.createElement('span');l.className='rled';l.setAttribute('aria-hidden','true');l.style.animationDelay=(Math.random()*3).toFixed(2)+'s';c.appendChild(l);c.appendChild(k)});
/* Formulaire QSL interactif */
(function(){var f=$('#qslform');if(!f)return;var g=function(i){return document.getElementById(i)};
var pad=function(n){return(n<10?'0':'')+n},touched={};
function now(){var d=new Date();if(!touched.d)g('q-date').value=d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());if(!touched.t)g('q-utc').value=pad(d.getUTCHours())+':'+pad(d.getUTCMinutes());upd()}
function set(id,v,ph){var b=g(id);b.textContent=v||ph;b.classList.toggle('live',!!v)}
function upd(){var c=g('q-call').value.toUpperCase().trim();var dv=g('q-date').value.split('-');
set('qv-call',c,'________');set('qv-date',dv.length===3?dv[2]+'/'+dv[1]+'/'+dv[0]:'','__/__/____');set('qv-utc',g('q-utc').value,'__:__');
set('qv-freq',g('q-freq').value.trim(),'______');set('qv-mode',g('q-mode').value,'____');set('qv-rst',g('q-rsts').value.trim(),'___');
g('qslsubj').value='QSL '+CFG.CALL+' de '+(c||'?')}
g('q-date').addEventListener('input',function(){touched.d=1});g('q-utc').addEventListener('input',function(){touched.t=1});
f.addEventListener('input',upd);f.addEventListener('change',upd);
f.addEventListener('submit',function(){g('q-call').value=g('q-call').value.toUpperCase().trim();upd()});
now();setInterval(now,15000)})();
/* Carte QSL */
var q=$('#qslcard');q.addEventListener('click',function(){q.setAttribute('aria-pressed',q.getAttribute('aria-pressed')==='true'?'false':'true')});
/* Easter egg : « CQ » ou code Konami */
var buf='',kon=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],ki=0;
document.addEventListener('keydown',function(e){
  var tg=e.target,tag=tg&&tg.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(tg&&tg.isContentEditable))return;
  if(e.key===kon[ki]||(kon[ki].length===1&&e.key.toLowerCase()===kon[ki])){ki++;if(ki===kon.length){ki=0;party()}}else ki=(e.key===kon[0])?1:0;
  if(tg===vfo)return;
  if(e.key&&e.key.length===1){buf=(buf+e.key.toUpperCase()).slice(-2);if(buf==='CQ'){buf='';party()}}
});
function toast(t){var e=$('#toast');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},2600)}
function party(){
  toast(L('📡 CQ CQ ! QSO confirmé — 73 de '+CFG.CALL+'','📡 CQ CQ! QSO confirmed — 73 de '+CFG.CALL+''));
  if(reduce)return;
  var cv=$('#confetti'),x=cv.getContext('2d'),W=cv.width=innerWidth,H=cv.height=innerHeight,cols=['#4da3ff','#00c2ff','#2f7bff','#9fd8ff','#e6efff'],P=[];
  for(var i=0;i<90;i++)P.push({x:Math.random()*W,y:-20-Math.random()*H*.5,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6.3,vr:(Math.random()-.5)*.2,s:6+Math.random()*10,c:cols[i%cols.length]});
  var t0=performance.now();
  (function f(now){var el=now-t0;x.clearRect(0,0,W,H);
    P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.strokeStyle=p.c;x.lineWidth=2;x.globalAlpha=Math.max(0,1-el/4000);
      for(var k=1;k<=3;k++){x.beginPath();x.arc(0,0,p.s*k/3,-.7,.7);x.stroke()}x.beginPath();x.fillStyle=p.c;x.arc(-2,0,2,0,6.3);x.fill();x.restore()});
    if(el<4000)requestAnimationFrame(f);else x.clearRect(0,0,W,H)})(t0);
}
if(window.I18N)I18N.on(render);
render();meter(false);if(!reduce)requestAnimationFrame(loop);
})();
