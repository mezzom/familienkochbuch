
'use strict';
const $=id=>document.getElementById(id),key='familienkochbuch-v2';
async function start(){
 const response=await fetch('./kochbuch.json',{cache:'no-store'});
 if(!response.ok)throw new Error('Daten nicht erreichbar');
 const data=await response.json(),recipes=data.recipes;
 if(!Array.isArray(recipes)||!recipes.length||recipes.some(x=>!x.id||!x.name||!Array.isArray(x.ingredients)||!Array.isArray(x.steps)))throw new Error('Ungültige Rezeptdaten');
 let saved={},storage=true;
 try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};if(typeof saved!=='object'||Array.isArray(saved))saved={};}catch(e){storage=false;saved={};}
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 let r=recipes.find(x=>x.id===saved.active)||recipes.find(x=>x.date===today)||recipes[0],step=0,checks=[],done=false;
 $('week').textContent=data.weekLabel+' · '+data.dateNote;
 function save(){saved.active=r.id;saved[r.id]={step,checks,done};try{localStorage.setItem(key,JSON.stringify(saved));}catch(e){storage=false;}$('status').textContent=storage?'Dein Fortschritt wird automatisch gespeichert.':'Browserspeicher nicht verfügbar: Fortschritt nur für diese Sitzung.';}
 function load(){const s=saved[r.id]||{};step=Number.isInteger(s.step)?Math.max(0,Math.min(s.step,Math.max(0,r.steps.length-1))):0;checks=r.ingredients.map((_,i)=>Array.isArray(s.checks)&&s.checks[i]===true);done=s.done===true&&step===r.steps.length-1;}
 function count(){$('checked').textContent=checks.filter(Boolean).length+' von '+checks.length+' abgehakt · '+r.servings+(r.status==='planned'?' · Grundzutaten':'');}
 function renderStep(){
  const complete=r.status==='complete'&&r.steps.length>0,n=r.steps.length,p=complete?(done?100:Math.round(step/n*100)):0;
  $('count').textContent=complete?'Schritt '+(step+1)+' von '+n:'Geplant · Rezept noch unvollständig';
  $('title').textContent=complete?r.steps[step][0]:'Bisher nur grob geplant';
  $('instruction').textContent=complete?r.steps[step][1]:r.planningNote;
  $('hint').className=complete?'muted':'notice';
  $('hint').textContent=complete?(step<n-1?'Als Nächstes: '+r.steps[step+1][0]:'Der letzte Schritt – gleich wird gegessen.'):'Noch offen: '+r.missingFields.join(' · ')+'. Die angezeigten Grundzutaten sind noch keine vollständige Zutatenliste.';
  $('done').textContent=done?'✓ Geschafft! Lasst es euch schmecken.':'';
  $('prev').disabled=!complete||step===0;$('next').disabled=!complete||done;
  $('next').textContent=!complete?'Anleitung noch offen':done?'Fertig ✓':step===n-1?'Kochen abschließen ✓':'Weiter →';
  $('progress').style.width=p+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',p);

 }
 function render(){
  $('recipe').value=r.id;$('meta').textContent=(r.time?r.time+' · ':'')+r.servings;
  $('ingredients').replaceChildren();
  r.ingredients.forEach((text,i)=>{const li=document.createElement('li'),label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');input.type='checkbox';input.checked=checks[i];span.textContent=text;input.onchange=()=>{checks[i]=input.checked;count();save();};label.append(input,span);li.append(label);$('ingredients').append(li);});
  count();renderStep();save();
 }
 recipes.forEach(x=>{const option=document.createElement('option');option.value=x.id;option.textContent=x.day+' · '+x.name+(x.status==='planned'?' (geplant)':'');$('recipe').append(option);});
 $('recipe').onchange=()=>{r=recipes.find(x=>x.id===$('recipe').value);load();render();};
 $('prev').onclick=()=>{if(step>0){step--;done=false;renderStep();save();$('title').parentElement.scrollTop=0;}};
 $('next').onclick=()=>{if(r.status!=='complete')return;if(step<r.steps.length-1)step++;else done=true;renderStep();save();$('title').parentElement.scrollTop=0;};
 $('reset').onclick=()=>$('dialog').showModal();$('cancel').onclick=()=>$('dialog').close();
 $('confirm').onclick=()=>{step=0;checks=r.ingredients.map(()=>false);done=false;render();$('dialog').close();};
 $('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){$('status').textContent='Vollbild wird von diesem Browser nicht unterstützt.';}};
 document.addEventListener('fullscreenchange',()=>{$('full').textContent=document.fullscreenElement?'Vollbild beenden':'Vollbild';});
 load();render();
}
start().catch(()=>{$('title').textContent='Kochbuch konnte nicht geladen werden';$('instruction').textContent='Bitte die Internetverbindung prüfen und die Seite neu laden.';$('prev').disabled=true;$('next').disabled=true;$('reset').disabled=true;});
