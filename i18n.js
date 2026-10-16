/* ON5EE — bilingue FR/EN. Français par défaut, choix mémorisé en localStorage uniquement (aucun cookie). */
(function(){
'use strict';
var KEY='on4lbo-lang',cbs=[],ATTR=['aria-label','title','placeholder','value'];
function get(){
  var m=/[?&]lang=(fr|en)\b/i.exec(location.search);
  if(m){var l=m[1].toLowerCase();try{localStorage.setItem(KEY,l)}catch(e){}return l}
  try{var s=localStorage.getItem(KEY);if(s==='en'||s==='fr')return s}catch(e){}
  return 'fr';
}
function apply(lang){
  var en=lang==='en',d=document;
  d.documentElement.lang=en?'en':'fr-BE';
  d.documentElement.classList.toggle('lang-en',en);
  Array.prototype.forEach.call(d.querySelectorAll('[data-en]'),function(el){
    if(el.dataset.fr===undefined)el.dataset.fr=el.tagName==='TITLE'?el.textContent:el.innerHTML;
    var v=en?el.getAttribute('data-en'):el.dataset.fr;
    if(el.tagName==='TITLE')d.title=v;else el.innerHTML=v;
  });
  ATTR.forEach(function(a){
    Array.prototype.forEach.call(d.querySelectorAll('[data-en-'+a+']'),function(el){
      var k='data-fr-'+a;if(!el.hasAttribute(k))el.setAttribute(k,el.getAttribute(a)||'');
      var v=en?el.getAttribute('data-en-'+a):el.getAttribute(k);
      if(a==='value')el.value=v;el.setAttribute(a,v);
    });
  });
  Array.prototype.forEach.call(d.querySelectorAll('[data-lang]'),function(el){el.hidden=el.getAttribute('data-lang')!==lang});
  Array.prototype.forEach.call(d.querySelectorAll('[data-setlang]'),function(b){b.setAttribute('aria-pressed',en?'true':'false')});
  window.I18N.lang=lang;
  cbs.forEach(function(f){try{f(lang)}catch(e){}});
}
window.I18N={lang:'fr',on:function(f){cbs.push(f)},set:function(l){
  try{localStorage.setItem(KEY,l)}catch(e){}
  if(/[?&]lang=/.test(location.search)&&history.replaceState){var u=new URL(location.href);u.searchParams.set('lang',l);history.replaceState(null,'',u)}
  apply(l);
}};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-setlang]');if(b){e.preventDefault();window.I18N.set(window.I18N.lang==='en'?'fr':'en')}});
apply(get());
requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('i18n-ready')})});
})();
