/* Tableau de propagation HF. Charge propagation.json depuis ce même site (aucun tiers). */
(function(){
'use strict';
var root=document.getElementById('propagation');
var body=document.getElementById('prop-body');
var updatedEl=document.getElementById('prop-updated');
if(!root||!body)return;

var STALE=6*60*60*1000;
var BANDS=[
  {id:'80m-40m',label:'80 – 40 m'},
  {id:'30m-20m',label:'30 – 20 m'},
  {id:'17m-15m',label:'17 – 15 m'},
  {id:'12m-10m',label:'12 – 10 m'}
];
var cache=null;

function lang(){return (window.I18N&&I18N.lang==='en')?'en':'fr'}
function t(fr,en){return lang()==='en'?en:fr}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){
  s=String(s||'').trim().toLowerCase();
  if(s==='good'||s==='excellent')return 'good';
  if(s==='fair'||s==='average'||s==='ok')return 'fair';
  if(s==='poor'||s==='bad'||s==='closed'||s==='band closed')return 'poor';
  return '';
}
function pill(v){
  var k=norm(v);
  var label=k==='good'?t('Bonne','Good'):k==='fair'?t('Moyenne','Fair'):k==='poor'?t('Fermée','Closed'):'—';
  return '<span class="prop-pill prop-'+(k||'unk')+'">'+label+'</span>';
}
function fmtTime(iso){
  var d=new Date(iso);
  if(isNaN(d.getTime()))return '';
  var hh=String(d.getUTCHours()).padStart(2,'0');
  var mm=String(d.getUTCMinutes()).padStart(2,'0');
  return t('mis à jour à '+hh+':'+mm+' UTC','updated at '+hh+':'+mm+' UTC');
}
function showNA(){
  if(updatedEl)updatedEl.textContent='';
  body.innerHTML='<p class="prop-na">'+t('Données indisponibles','Data unavailable')+'</p>';
}
function val(v){return (v===0||v||v==='0')?esc(v):'—'}
function idx(label,v){return '<div><small>'+esc(label)+'</small><b>'+val(v)+'</b></div>'}
function render(data){
  if(!data||!data.updated){showNA();return}
  var ts=Date.parse(data.updated);
  if(isNaN(ts)||(Date.now()-ts)>STALE){showNA();return}
  if(updatedEl)updatedEl.textContent=fmtTime(data.updated);
  var bands=data.bands||{};
  var rows=BANDS.map(function(b){
    var ev=bands[b.id]||{};
    return '<tr><th scope="row">'+b.label+'</th><td>'+pill(ev.day)+'</td><td>'+pill(ev.night)+'</td></tr>';
  }).join('');
  body.innerHTML=
    '<table class="prop-table"><thead><tr><th>'+t('Bande','Band')+'</th><th>'+t('Jour','Day')+'</th><th>'+t('Nuit','Night')+'</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<div class="prop-idx">'+
      idx('SFI',data.sfi)+
      idx('SSN',data.ssn)+
      idx('A',data.aindex)+
      idx('K',data.kindex)+
      idx('X-ray',data.xray)+
    '</div>';
}

fetch('propagation.json',{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'})
  .then(function(r){if(!r.ok)throw new Error('http');return r.json()})
  .then(function(d){cache=d;render(d)})
  .catch(function(){cache=null;showNA()});

if(window.I18N)I18N.on(function(){if(cache)render(cache);else if(body.querySelector('.prop-na'))showNA()});
})();
