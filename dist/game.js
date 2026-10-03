'use strict';
(() => {
const $ = id => document.getElementById(id);
const canvas=$('game'), ctx=canvas.getContext('2d'), field=$('field');
const DURATION=90;
const STAGES=[
 {age:6,name:'こども時代',en:'CHILDHOOD',icon:'🧒',base:100,event:'6歳。おこづかいを集めよう！',color:'#75c791'},
 {age:18,name:'青春時代',en:'YOUTH',icon:'🧑',base:1000,event:'18歳。はじめてのアルバイト！',color:'#72d4c8'},
 {age:30,name:'おとな時代',en:'ADULTHOOD',icon:'🧑‍💼',base:10000,event:'30歳。お給料もチャンスも急上昇！',color:'#9ac4e4'},
 {age:50,name:'円熟時代',en:'MATURITY',icon:'🧑‍🦳',base:50000,event:'50歳。人生の稼ぎどき、到来！',color:'#cbb3e7'},
 {age:70,name:'黄金時代',en:'GOLDEN YEARS',icon:'🧓',base:100000,event:'70歳。まだまだ、これから黄金時代！',color:'#f4cd75'}
];
let w=1000,h=475,dpr=1,mode='intro',elapsed=0,age=6,stageIndex=0,money=0,gross=0,expenses=0,combo=0,maxCombo=0,lastCatch=-10,spawnClock=0,magnetTime=0,magnetCooldown=0,eventClock=0,shake=0,rush=false,lastRush=-1,frame=0;
let player={x:500,target:500},drops=[],particles=[],labels=[],keys=new Set(),pointerDown=false,sound=false,audio=null;
const yen=n=>'¥'+Math.floor(n).toLocaleString('ja-JP');
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){const rect=field.getBoundingClientRect();const old=w;w=rect.width;h=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);player.x=clamp(player.x/old*w,30,w-30);player.target=player.x;}
new ResizeObserver(resize).observe(field);
function beep(freq,duration=.08,type='sine',volume=.035){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
function announce(text){$('event').textContent=text;$('event').classList.add('show');eventClock=2.8;}
function syncHud(){
 $('age').textContent=age;$('stage').textContent=STAGES[stageIndex].name;$('money').textContent=Math.floor(money).toLocaleString('ja-JP');$('time').textContent=Math.max(0,Math.ceil(DURATION-elapsed));$('progress').style.width=(elapsed/DURATION*100)+'%';
 $('chapter').textContent=`CHAPTER 0${stageIndex+1} / ${STAGES[stageIndex].en}`;
 document.querySelectorAll('.chapters>span').forEach((el,i)=>{el.classList.toggle('active',i<=stageIndex);el.classList.toggle('current',i===stageIndex);});
 const portrait=$('portrait');
 if(portrait.dataset.stage!==String(stageIndex)){portrait.dataset.stage=String(stageIndex);portrait.textContent=STAGES[stageIndex].icon;portrait.setAttribute('aria-label',STAGES[stageIndex].name+'のキャラクター');if(!reduced&&portrait.animate)portrait.animate([{transform:'scale(.85)',opacity:.5},{transform:'scale(1.15)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:600,easing:'ease-out'});}
 $('combo').textContent=combo>=3?`${combo} COMBO · ×${multiplier()}`:rush?'✦ お金の大フィーバー！':'いい人生、降ってこい。';
 $('magnet').disabled=mode!=='playing'||magnetCooldown>0;
 $('magnet-label').textContent=magnetTime>0?'お金を吸い寄せ中！':magnetCooldown>0?`あと ${Math.ceil(magnetCooldown)} 秒で使える`:'磁石を使う';
 $('magnet-help').textContent=mode==='intro'?'ゲーム開始後に使えます':magnetTime>0?'赤い出費は引き寄せないよ':magnetCooldown>0?'回復中… お金を集めながら待とう':'SPACE キー / このボタンをタップ';
 $('magnet').classList.toggle('ready',mode==='playing'&&magnetCooldown===0);$('magnet').classList.toggle('pulling',magnetTime>0);
 $('magnet-charge').style.width=(100*(1-magnetCooldown/15))+'%';
}
function multiplier(){return combo>=16?3:combo>=8?2:1;}
function start(){elapsed=0;age=6;stageIndex=0;money=0;gross=0;expenses=0;combo=0;maxCombo=0;lastCatch=-10;spawnClock=.1;magnetTime=0;magnetCooldown=0;eventClock=0;shake=0;rush=false;lastRush=-1;drops=[];particles=[];labels=[];keys.clear();player.x=w/2;player.target=w/2;mode='playing';$('intro').classList.add('hidden');$('result').classList.add('hidden');$('paused').classList.add('hidden');$('pause').disabled=false;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','一時停止');$('tip').textContent='🧲 下の磁石ボタン / SPACE で、お金をまとめ取り！';announce(STAGES[0].event);syncHud();canvas.focus({preventScroll:true});beep(550);}
function pause(){if(mode==='playing'){mode='paused';keys.clear();pointerDown=false;$('paused').classList.remove('hidden');$('pause').textContent='▶';$('pause').setAttribute('aria-label','再開');$('resume').focus({preventScroll:true});}else if(mode==='paused'){mode='playing';$('paused').classList.add('hidden');$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','一時停止');canvas.focus({preventScroll:true});}syncHud();}
function finish(){mode='result';age=100;elapsed=DURATION;keys.clear();pointerDown=false;$('pause').disabled=true;$('event').classList.remove('show');$('result').classList.remove('hidden');$('finalMoney').textContent=yen(money);$('gross').textContent=yen(gross);$('expenses').textContent='−'+yen(expenses);$('bestCombo').textContent=maxCombo+' 回';const tier=money>=100000000?['伝説の億万長者','つかんだチャンスは、数えきれない。']:money>=30000000?['お金に愛された人生','最後まで、チャンスを逃さない一生でした。']:money>=10000000?['なかなか豊かな人生','こつこつキャッチが、大きな実りに。']:['伸びしろいっぱいの人生','次の人生は、磁石とコンボで大逆転。'];$('rank').textContent=tier[0];$('resultText').textContent=tier[1];syncHud();$('restart').focus({preventScroll:true});beep(880,.4);}
function activateMagnet(){if(mode!=='playing'||magnetCooldown>0)return false;magnetTime=3.6;magnetCooldown=15;announce('🧲 お金を吸い寄せ中！');beep(660,.3,'triangle');syncHud();return true;}
function spawn(force={}){
 const s=STAGES[stageIndex],bad=force.bad??(stageIndex>0&&Math.random()<.13),gold=!bad&&Math.random()<.13;
 const edge=Math.random()<.28,x=edge?(Math.random()<.5?-22:w+22):rand(22,w-22),y=edge?rand(40,h*.36):-25;
 const value=s.base*(gold?10:bad?3:Math.random()<.4?5:1);
 drops.push({x,y,px:x,py:y,vx:edge?(x<0?rand(70,125):-rand(70,125)):rand(-30,30),vy:edge?rand(-25,15):rand(38,80),gravity:rand(45,65)+stageIndex*7,bad,gold,value,rot:rand(-.2,.2),spin:rand(-.6,.6),r:gold?19:16,...force});
}
function collect(d){
 if(d.bad){const loss=Math.min(money,d.value);money-=loss;expenses+=loss;combo=0;shake=reduced?0:.18;labels.push({x:d.x,y:d.y,text:'−'+yen(loss),life:1,color:'#ffa99a'});beep(110,.12,'sawtooth',.025);}
 else {combo++;maxCombo=Math.max(maxCombo,combo);lastCatch=elapsed;const v=d.value*multiplier();money+=v;gross+=v;labels.push({x:d.x,y:d.y,text:'+'+yen(v),life:1,color:d.gold?'#ffe599':'#eaf7df'});beep(440+Math.min(combo,20)*25,.06);for(let i=0;i<(reduced?2:8);i++)particles.push({x:d.x,y:d.y,vx:rand(-85,85),vy:rand(-105,15),life:rand(.2,.6),color:d.gold?'#ffe18b':'#b8e4bd'});}
}
function update(dt){
 if(mode!=='playing')return;
 elapsed=Math.min(DURATION,elapsed+dt);age=Math.min(100,Math.floor(6+elapsed/DURATION*94));
 const next=STAGES.reduce((acc,s,i)=>age>=s.age?i:acc,0);if(next!==stageIndex){stageIndex=next;announce(STAGES[next].event);beep(740,.2);}
 const cycle=Math.floor(elapsed/18);rush=elapsed%18>=12&&elapsed%18<16;
 if(rush&&lastRush!==cycle){lastRush=cycle;announce(age<18?'お年玉シャワー！':age<50?'臨時ボーナス！ お金の大フィーバー':age<70?'退職金シャワー！':'お祝いシャワー！');}
 const direction=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);
 if(direction){player.x=clamp(player.x+direction*(w<600?370:530)*dt,28,w-28);player.target=player.x;}else player.x+=(player.target-player.x)*Math.min(1,dt*14);
 if(elapsed-lastCatch>2.4)combo=0;
 magnetTime=Math.max(0,magnetTime-dt);magnetCooldown=Math.max(0,magnetCooldown-dt);shake=Math.max(0,shake-dt);
 if(eventClock>0){eventClock-=dt;if(eventClock<=0)$('event').classList.remove('show');}
 spawnClock-=dt;
 if(spawnClock<=0){spawn();spawnClock=(rush?.085:.31-stageIndex*.027)*(w<600?1.2:1);}
 const cy=h-105;
 for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.px=d.x;d.py=d.y;
 if(magnetTime>0&&!d.bad){const dx=player.x-d.x,dy=cy-d.y,dist=Math.hypot(dx,dy);d.vx+=dx/Math.max(dist,1)*1100*dt;d.vy+=dy/Math.max(dist,1)*1100*dt;d.vx*=Math.pow(.5,dt);d.vy=Math.min(d.vy,600);}else d.vy+=d.gravity*dt;
 d.x+=d.vx*dt;d.y+=d.vy*dt;d.rot+=d.spin*dt;
 if(d.x<10&&d.vx<0&&d.y>h*.42)d.vx=Math.abs(d.vx);if(d.x>w-10&&d.vx>0&&d.y>h*.42)d.vx=-Math.abs(d.vx);
 const crosses=d.py<=cy+13&&d.y>=cy-17;const t=d.y===d.py?1:clamp((cy-d.py)/(d.y-d.py),0,1);const hitX=d.px+(d.x-d.px)*t;
 if(crosses&&Math.abs(hitX-player.x)<(w<600?36:42)+d.r*.55){collect(d);drops.splice(i,1);}else if(d.y>h+40||d.x< -150||d.x>w+150)drops.splice(i,1);
 }
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;if(p.life<=0)particles.splice(i,1);}
 for(let i=labels.length-1;i>=0;i--){labels[i].life-=dt;labels[i].y-=35*dt;if(labels[i].life<=0)labels.splice(i,1);}
 syncHud();if(elapsed>=DURATION)finish();
}
function roundRect(x,y,width,height,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,width,height,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
function drawDrop(d){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);if(d.bad){roundRect(-18,-15,36,30,5,'#c96650','#f6ad95');ctx.fillStyle='#fff2dd';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('!',0,7);}else if(d.gold){ctx.shadowColor='#f8d670';ctx.shadowBlur=15;ctx.fillStyle='#f4c858';ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ffe8a3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#6a5420';ctx.font='bold 21px system-ui';ctx.textAlign='center';ctx.fillText('¥',0,7);}else{roundRect(-23,-12,46,25,4,STAGES[stageIndex].color,'#e3f0bf');ctx.strokeStyle='#2b725e';ctx.strokeRect(-18,-8,36,17);ctx.fillStyle='#285b48';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.fillText('¥',0,7);}ctx.restore();}
function render(time){ctx.clearRect(0,0,w,h);ctx.save();if(shake>0)ctx.translate(rand(-3,3),rand(-2,2));
 if(mode==='intro'){for(let i=0;i<12;i++){const x=(w*.04+i*w*.087)%w,y=(time*.025+i*71)%(h+60)-30;drawDrop({x,y,rot:Math.sin(time*.0007+i)*.25,bad:false,gold:i%3===0});}}
 else{drops.forEach(drawDrop);const py=h-105;
 if(magnetTime>0){ctx.strokeStyle='#ffe098';ctx.lineWidth=2;ctx.globalAlpha=.35+.15*Math.sin(time*.012);ctx.beginPath();ctx.arc(player.x,py,70+Math.sin(time*.009)*8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 ctx.fillStyle='#081f275c';ctx.beginPath();ctx.ellipse(player.x,py+47,37,7,0,0,Math.PI*2);ctx.fill();
 ctx.font=`${(w<600?[66,76,82,82,78]:[78,90,98,98,92])[stageIndex]}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(STAGES[stageIndex].icon,player.x,py+30);
 roundRect(player.x-34,py+4,68,25,5,'#dca850','#f9d582');roundRect(player.x-38,py,76,8,3,'#f9d582');ctx.textBaseline='alphabetic';ctx.fillStyle='#785a29';ctx.font='bold 15px system-ui';ctx.fillText('¥',player.x,py+22);
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4);}ctx.globalAlpha=1;
 for(const l of labels){ctx.globalAlpha=Math.min(1,l.life*2);ctx.fillStyle=l.color;ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText(l.text,l.x,l.y);}ctx.globalAlpha=1;
 }ctx.restore();}
let previous=0;function loop(time){const dt=Math.min((time-previous)/1000,.05);previous=time;update(dt);render(time);frame=requestAnimationFrame(loop);}
$('start').addEventListener('click',start);$('restart').addEventListener('click',start);$('pause').addEventListener('click',pause);$('resume').addEventListener('click',pause);$('magnet').addEventListener('click',activateMagnet);
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'サウンドをオフにする':'サウンドをオンにする');$('sound').innerHTML='♪ <span>'+(sound?'ON':'OFF')+'</span>';if(sound)beep(660,.12);});
window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','a','d',' ','p','Escape'].includes(key)&&['playing','paused'].includes(mode)){e.preventDefault();if((key==='p'||key==='Escape')&&!e.repeat)pause();else if(mode==='playing'){keys.add(key);if(key===' '&&!e.repeat)activateMagnet();}}});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{keys.clear();if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
function movePointer(e){const r=canvas.getBoundingClientRect();player.target=clamp(e.clientX-r.left,28,w-28);}
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;pointerDown=true;canvas.setPointerCapture(e.pointerId);movePointer(e);});canvas.addEventListener('pointermove',e=>{if(mode==='playing'&&(pointerDown||e.pointerType==='mouse'))movePointer(e);});canvas.addEventListener('pointerup',()=>pointerDown=false);canvas.addEventListener('pointercancel',()=>pointerDown=false);
const modelContext=document.modelContext;
if(modelContext?.registerTool){try{Promise.resolve(modelContext.registerTool({name:'read_money_is_everything_state',title:'人生ゲームの状態を見る',description:'現在の年齢、所持金、残り時間、プレイ状態を読み取ります。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(input&&Object.keys(input).length)throw new Error('入力項目はありません');return{status:mode,age,money,secondsRemaining:Math.max(0,DURATION-elapsed),combo};}})).catch(()=>{});}catch{}}
resize();syncHud();frame=requestAnimationFrame(loop);
})();
