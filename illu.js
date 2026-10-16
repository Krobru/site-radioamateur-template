/* ON5EE — animations des illustrations : cascade, parallaxe, révélation. Vanilla JS, aucun appel réseau. */
(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
// tracé révélé au scroll
var draws=document.querySelectorAll('.illu');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2});draws.forEach(function(d){io.observe(d)})}else draws.forEach(function(d){d.classList.add('in')});
// parallaxe légère
var px=[].slice.call(document.querySelectorAll('[data-parallax]'));
if(px.length&&!reduce){var tick=false;addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){px.forEach(function(el){var r=el.getBoundingClientRect(),c=(r.top+r.height/2-innerHeight/2);el.style.transform='translateY('+(c*-(+el.dataset.parallax||.06)).toFixed(1)+'px)'});tick=false})},{passive:true})}
// cascade (waterfall) façon SDR
var cv=document.getElementById('waterfall');
if(cv&&cv.getContext){
  var ctx=cv.getContext('2d'),W,H,t=0,sig=[{x:.18,w:.012,a:.9,cw:1},{x:.42,w:.03,a:.7},{x:.63,w:.008,a:1,cw:1},{x:.8,w:.045,a:.55}];
  function size(){var d=Math.min(2,devicePixelRatio||1);W=cv.width=Math.round(cv.clientWidth*d);H=cv.height=Math.round(cv.clientHeight*d);ctx.fillStyle='#04060c';ctx.fillRect(0,0,W,H)}
  function col(v){v=Math.max(0,Math.min(1,v));return 'rgb('+Math.round(10+v*v*200)+','+Math.round(30+v*170)+','+Math.round(60+v*195)+')'}
  function line(){ctx.drawImage(cv,0,0,W,H-2,0,2,W,H-2);for(var x=0;x<W;x+=2){var f=x/W,v=Math.random()*.22;sig.forEach(function(s){var on=s.cw?((Math.sin(t*.25+s.x*40)>-.2)?1:0):1;var d=(f-s.x)/s.w;v+=s.a*on*Math.exp(-d*d)});ctx.fillStyle=col(v);ctx.fillRect(x,0,2,2)}t++}
  size();for(var k=0;k<H/2;k++)line();addEventListener('resize',function(){size();for(var k=0;k<H/2;k++)line()});
  if(!reduce){var vis=true;if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);(function loop(){if(vis&&!document.hidden)line();setTimeout(function(){requestAnimationFrame(loop)},50)})()}
}
})();
