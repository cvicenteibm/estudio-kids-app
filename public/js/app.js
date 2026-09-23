/* ══════════════════════════════════════════════════════════
   LÓGICA PRINCIPAL Y CONTROL DE LA APLICACIÓN
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════ */
let stars = 0;
function addStar(n=1){
  stars+=n;
  achState.stars=stars;
  const sc=document.getElementById('star-count');
  if(sc) sc.textContent=stars;
  const hs=document.getElementById('hud-stars');
  if(hs){ hs.style.transform='scale(1.35)'; setTimeout(()=>hs.style.transform='',260); }
  checkAchievements();
}
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr,n){ return shuffle(arr).slice(0,n); }

/* ══════════════════════════════════════════════════════════
   AUDIO ENGINE  (Web Audio API — sin archivos externos)
══════════════════════════════════════════════════════════ */
const _ac = new (window.AudioContext || window.webkitAudioContext)();

function _playTone(freqs, dur=0.08, type='sine', vol=0.18){
  freqs.forEach((f,i)=>{
    const osc=_ac.createOscillator(), g=_ac.createGain();
    osc.connect(g); g.connect(_ac.destination);
    osc.frequency.value=f; osc.type=type;
    const t=_ac.currentTime+i*dur;
    g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur*1.8);
    osc.start(t); osc.stop(t+dur*2);
  });
}
function playCorrect(){ _playTone([523,659,784],0.09,'sine',0.2); }   // C-E-G
function playWrong()  { _playTone([220,180],0.12,'sawtooth',0.12); }  // buzz
function playAchievement(){
  _playTone([523,659,784,1047],0.1,'sine',0.22);                      // do-mi-sol-do
}
function playFinish(perfect){
  if(perfect) _playTone([523,659,784,1047,784,1047],0.09,'sine',0.2);
  else        _playTone([440,494,523],0.1,'sine',0.18);
}

/* unlock AudioContext on first user gesture */
document.addEventListener('click',()=>{ if(_ac.state==='suspended') _ac.resume(); },{once:true});

/* ══════════════════════════════════════════════════════════
   DIFFICULTY SYSTEM
══════════════════════════════════════════════════════════ */
let difficulty = 'easy';
const DIFF_LABELS = { easy:'🌿 Pradera', medium:'🏜️ Desierto', hard:'🌋 Nether' };
const DIFF_STARS  = { easy:1, medium:2, hard:3 };

function starsForCorrect(){ return DIFF_STARS[difficulty]; }

/* ══════════════════════════════════════════════════════════
   VIDAS + RACHA
══════════════════════════════════════════════════════════ */
const MAX_LIVES = 3;
let _lives   = MAX_LIVES;
let _streak  = 0;
let _lastSec = null;   // sección activa para el retry de game over

function initLives(){
  _lives  = MAX_LIVES;
  _streak = 0;
  _renderHearts();
  _renderStreak();
}

function _renderHearts(){
  for(let i=1;i<=MAX_LIVES;i++){
    const h = document.getElementById('heart-'+i);
    if(!h) continue;
    h.classList.toggle('lost', i > _lives);
    h.classList.remove('shake');
  }
}

function _renderStreak(){
  const el = document.getElementById('hud-streak');
  if(!el) return;
  if(_streak < 2){
    el.textContent = '';
    el.classList.remove('active','fire');
  } else {
    const isFire = _streak >= 5;
    el.textContent = isFire ? `🔥 x${_streak}` : `⚡ x${_streak}`;
    el.classList.add('active');
    el.classList.toggle('fire', isFire);
    // pulso visual
    el.classList.remove('fire');
    void el.offsetWidth; // reflow para reiniciar animación
    if(isFire) el.classList.add('fire');
  }
}

function onCorrectAnswer(){
  _streak++;
  playerCoins += 5; // +5 monedas por cada respuesta correcta
  _renderStreak();
  // logros de racha
  if(_streak === 3) showAchToast({ emoji:'⚡', name:'Racha x3', desc:'¡3 respuestas correctas seguidas!' });
  if(_streak === 5) showAchToast({ emoji:'🔥', name:'En Llamas x5', desc:'¡5 en racha! ¡Imparable!' });
}

function onWrongAnswer(){
  _streak = 0;
  _renderStreak();
  _lives--;
  _renderHearts();
  // animación de shake en el corazón que se perdió
  const h = document.getElementById('heart-'+(_lives+1));
  if(h){ h.classList.add('shake'); setTimeout(()=>h.classList.remove('shake'),400); }
  if(_lives <= 0) _triggerGameOver();
}

function _triggerGameOver(){
  playWrong(); playWrong();
  const msg = document.getElementById('gameover-msg');
  const names = [
    `¡Los mobs te vencieron, ${playerName}!<br>¡Pero el Overworld te necesita de vuelta!`,
    `¡Sin vidas, ${playerName}!<br>¡Los héroes aprenden y vuelven más fuertes!`,
    `💀 ${playerName}, ¡el Creeper explotó cerca!<br>¡Recargate y volvé a la batalla!`,
  ];
  if(msg) msg.innerHTML = names[rand(0,names.length-1)];
  document.getElementById('gameover-overlay').classList.add('show');
}

function gameOverRetry(){
  document.getElementById('gameover-overlay').classList.remove('show');
  initLives();
  // relanzar la misión actual
  if(_lastSec==='math'    && _lastRewardTopic) loadMath(_lastRewardTopic);
  else if(_lastSec==='lang'    && _lastRewardTopic) loadLang(_lastRewardTopic);
  else if(_lastSec==='eng'     && _lastRewardTopic) loadEng(_lastRewardTopic);
  else if(_lastSec==='parcial' && _lastRewardTopic) loadParcial(_lastRewardTopic);
}

function gameOverExit(){
  document.getElementById('gameover-overlay').classList.remove('show');
  initLives();
  goToSubjects();
}

/* ══════════════════════════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════════════════════════ */


const achState = {
  stars: 0, totalAnswered: 0, totalCorrect: 0,
  perfectSections: 0, mathSections: 0, langSections: 0, engSections: 0,
  hardSections: 0, mediumSections: 0,
  unlocked: new Set()
};

function checkAchievements(){
  let newUnlock = false;
  ACHIEVEMENTS.forEach(a=>{
    if(!achState.unlocked.has(a.id) && a.cond(achState)){
      achState.unlocked.add(a.id);
      newUnlock = true;
      showAchToast(a);
    }
  });
  if(newUnlock) renderAchGrid();
}

function showAchToast(a){
  playAchievement();
  const t=document.getElementById('ach-toast');
  t.textContent=`${a.emoji} ¡Nuevo trofeo! ${a.name}`;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}

function renderAchGrid(){
  const grid=document.getElementById('ach-grid');
  if(!grid) return;
  grid.innerHTML=ACHIEVEMENTS.map(a=>{
    const un=achState.unlocked.has(a.id);
    return `<div class="ach-card ${un?'unlocked':'locked'}">
      <span class="ach-emoji">${a.emoji}</span>
      <div class="ach-name">${a.name}</div>
      <div class="${un?'ach-desc':'ach-lock'}">${un?a.desc:'???'}</div>
    </div>`;
  }).join('');
}

let playerName = '';
let _activeSubject = 'math';

function goToScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const hud = document.getElementById('game-hud');
  if(id==='screen-game' || id==='screen-exercise') hud.classList.add('active');
  else hud.classList.remove('active');
  window.scrollTo(0,0);
}

function goToDifficulty(){
  const input = document.getElementById('player-name-input');
  playerName = input ? input.value.trim() : '';
  if(!playerName) return;
  const dg = document.getElementById('diff-greeting');
  if(dg) dg.textContent = `⚔️ ¡${playerName}, el Héroe! Elegí tu bioma de aventura:`;
  goToScreen('screen-difficulty');
}

function selectDiffCard(d){
  difficulty = d;
  document.querySelectorAll('.diff-card').forEach(c=>c.classList.remove('selected'));
  const dc = document.getElementById('dcard-'+d);
  if(dc) dc.classList.add('selected');
  problemPool=[];
}

function goToSubjects(){ goToScreen('screen-subjects'); }

function goToExercises(subject){
  goToScreen('screen-game');
  document.getElementById('hud-player-name').textContent = '⚔️ '+playerName;
  const labels = { math:'💎 Mina', lang:'📜 Tomo', eng:'🌍 Mapa', parcial:'📋 Parcial' };
  document.getElementById('hud-subject-label').textContent =
    (labels[subject]||'') + ' · ' + DIFF_LABELS[difficulty];
  // update subjects subtitle with hero name
  const ss = document.getElementById('subjects-subtitle');
  if(ss) ss.innerHTML = `🧭 El inventario está listo, <strong>${playerName}</strong>.<br>¿Qué misión vas a craftear hoy?`;
  showSection(subject);
}

function goToLogros(){
  goToScreen('screen-game');
  document.getElementById('hud-player-name').textContent = '⚔️ '+(playerName||'Héroe');
  document.getElementById('hud-subject-label').textContent = '🏆 Cofre de Trofeos';
  showSection('logros');
}

function goToExerciseScreen(sec, label){
  _activeSubject = sec;
  ['math','lang','eng','parcial','science','history','daily'].forEach(s=>{
    const card = document.getElementById('ex-card-'+s);
    if(card) card.style.display = s===sec ? 'block' : 'none';
  });
  const tn = document.getElementById('ex-topic-name');
  if(tn) tn.textContent = label;
  document.getElementById('hud-player-name').textContent = '⚔️ '+playerName;
  const labels = { math:'💎 Mina', lang:'📜 Tomo', eng:'🌍 Mapa', parcial:'📋 Parcial', science:'🔬 Ciencias', history:'🏛️ Historia', daily:'⚡ Diario' };
  document.getElementById('hud-subject-label').textContent =
    (labels[sec]||'') + ' · ' + DIFF_LABELS[difficulty];
  goToScreen('screen-exercise');
}

function backToTopics(){
  // El desafío diario no tiene pantalla de temas intermedia → volver a misiones
  if (_activeSubject === 'daily') {
    goToSubjects();
    return;
  }
  goToScreen('screen-game');
  showSection(_activeSubject);
}

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('visible'));
  const sec = document.getElementById('sec-'+id);
  if(sec) sec.classList.add('visible');
  if(id==='logros'){ renderAchGrid(); renderRanking(); }
  if(id==='lang') selectLangBook(1);
}

let _lastRewardSec = 'math';
let _lastRewardTopic = null;

function showReward(emoji,title,msg){
  document.getElementById('reward-emoji').textContent=emoji;
  document.getElementById('reward-title').textContent=title;
  document.getElementById('reward-msg').textContent=msg;
  document.getElementById('reward-modal').classList.add('show');
}
function closeReward(){ document.getElementById('reward-modal').classList.remove('show'); }

function rewardReplay(){
  closeReward();
  if(_lastRewardSec==='math'    && _lastRewardTopic) loadMath(_lastRewardTopic);
  else if(_lastRewardSec==='lang'    && _lastRewardTopic) loadLang(_lastRewardTopic);
  else if(_lastRewardSec==='eng'     && _lastRewardTopic) loadEng(_lastRewardTopic);
  else if(_lastRewardSec==='parcial' && _lastRewardTopic) loadParcial(_lastRewardTopic);
}
function rewardGoTopics(){ closeReward(); backToTopics(); }
function rewardGoSubjects(){ closeReward(); goToSubjects(); }

function updateProgress(sec,pct){
  document.getElementById(sec+'-progress').style.width=pct+'%';
}

function disableOpts(id){
  document.querySelectorAll('#'+id+' .opt-btn').forEach(b=>{b.disabled=true;b.style.cursor='default';});
}
function highlightCorrect(id,ans){
  document.querySelectorAll('#'+id+' .opt-btn').forEach(b=>{
    if(b.textContent.trim()===String(ans)) b.classList.add('correct');
  });
}

// Frases narrativas de victoria por bioma


function pickMsg(pool, name, bioma, correct, total, bonus){
  const msg = pool[Math.floor(Math.random()*pool.length)];
  return msg.replace(/{name}/g,name).replace(/{bioma}/g,bioma)
            .replace(/{correct}/g,correct).replace(/{total}/g,total)
            .replace(/{bonus}/g,bonus);
}

function finishSection(sec,correct,total){
  // ── PARCIAL ──
  if(sec === 'parcial'){
    _lastRewardSec   = 'parcial';
    _lastRewardTopic = parcialState.topic;
    updateProgress('parcial', 100);
    const perfect = correct === total;
    playFinish(perfect);
    const msgs = perfect
      ? [`🏆 ¡Perfecto, ${playerName}! ¡El parcial no te va a ganar!`,
         `⚔️ ¡Genial, ${playerName}! ¡Dominás todos los temas del parcial!`]
      : correct >= Math.ceil(total*0.6)
        ? [`💪 ¡Bien, ${playerName}! Seguí practicando y vas a dominar el parcial.`,
           `📋 ${playerName}, cada práctica te hace más fuerte. ¡A seguir!`]
        : [`⚔️ ${playerName}, ¡a entrenar más! Volvé a intentar este tema.`,
           `🗡️ Los bloques del parcial son difíciles, ¡pero vos podés!`];
    showReward(
      perfect ? '🏆' : correct>=Math.ceil(total*0.6) ? '🎉' : '💪',
      perfect ? '¡MISIÓN PERFECTA!' : correct>=Math.ceil(total*0.6) ? '¡PRÁCTICA CUMPLIDA!' : '¡SEGUÍ ENTRENANDO!',
      pick(msgs,1)[0] + ` (${correct}/${total} correctas)`
    );
    if(perfect){ achState.perfectSections++; }
    achState.mathSections++;
    achState.langSections++;
    if(difficulty==='hard')   achState.hardSections++;
    if(difficulty==='medium') achState.mediumSections++;
    checkAchievements();
    saveProfile();
    return;
  }

  // ── NORMAL ──
  _lastRewardSec = sec;
  if(sec==='math') _lastRewardTopic = mathState.topic;
  else if(sec==='lang') _lastRewardTopic = langState.topic;
  else if(sec==='eng')  _lastRewardTopic = engState.topic;

  const pct=Math.round(correct/total*100);
  updateProgress(sec,100);
  const perfect = pct===100;
  playFinish(perfect);
  const diffLabel = DIFF_LABELS[difficulty];
  const bonusStars = difficulty==='hard' ? 5 : difficulty==='medium' ? 3 : 3;
  if(perfect){
    const msg = pickMsg(FINISH_MSGS.perfect, playerName, diffLabel, correct, total, bonusStars);
    showReward('🏆','¡MISIÓN PERFECTA!', msg);
    addStar(bonusStars); achState.perfectSections++;
  } else if(pct>=60){
    const bonus = difficulty==='hard' ? 2 : difficulty==='medium' ? 1 : 1;
    const msg = pickMsg(FINISH_MSGS.good, playerName, diffLabel, correct, total, bonus);
    showReward('🎉','¡MISIÓN CUMPLIDA!', msg);
    addStar(bonus);
  } else {
    const msg = pickMsg(FINISH_MSGS.retry, playerName, diffLabel, correct, total, 0);
    showReward('💪','¡HÉROE, INTENTÁ DE NUEVO!', msg);
  }
  if(sec==='math') achState.mathSections++;
  if(sec==='lang') achState.langSections++;
  if(sec==='eng')  achState.engSections++;
  if(difficulty==='hard')   achState.hardSections++;
  if(difficulty==='medium') achState.mediumSections++;
  checkAchievements();
  saveProfile();
}


function renderNextBtn(sec, onNext){
  const btn = document.createElement('button');
  btn.className='next-btn'; btn.style.display='block';
  btn.textContent = NEXT_BTN_TEXTS[Math.floor(Math.random()*NEXT_BTN_TEXTS.length)];
  btn.onclick = onNext;
  return btn;
}

/* ══════════════════════════════════════════════════════════
   ██████  MATEMÁTICA
══════════════════════════════════════════════════════════ */

/* ── Datos numéricos ── */
const numberNames = {
  0:'cero',1:'uno',2:'dos',3:'tres',4:'cuatro',5:'cinco',
  6:'seis',7:'siete',8:'ocho',9:'nueve',10:'diez',
  11:'once',12:'doce',13:'trece',14:'catorce',15:'quince',
  16:'dieciséis',17:'diecisiete',18:'dieciocho',19:'diecinueve',20:'veinte',
  21:'veintiuno',22:'veintidós',23:'veintitrés',24:'veinticuatro',25:'veinticinco',
  26:'veintiséis',27:'veintisiete',28:'veintiocho',29:'veintinueve',30:'treinta',
  40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta',80:'ochenta',90:'noventa',100:'cien',
  200:'doscientos',300:'trescientos',400:'cuatrocientos',500:'quinientos',
  600:'seiscientos',700:'setecientos',800:'ochocientos',900:'novecientos',1000:'mil'
};

// Numbers pools by difficulty
const readableNumbersEasy   = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const readableNumbersMedium = [20,21,22,23,24,25,30,40,50,60,70,80,90,100,
                                102,115,130,145,200,250,300,400,500];
const readableNumbersHard   = [100,200,300,400,500,600,700,800,900,1000,
                                101,115,132,248,375,456,789,625,847,963];

function getReadablePool(){
  if(difficulty==='hard')   return readableNumbersHard;
  if(difficulty==='medium') return readableNumbersMedium;
  return readableNumbersEasy;
}

function numToWord(n){
  if(numberNames[n]) return numberNames[n];
  // 31-99: decenas + unidades
  if(n>=31 && n<=39) return 'treinta y '    + numberNames[n-30];
  if(n>=41 && n<=49) return 'cuarenta y '   + numberNames[n-40];
  if(n>=51 && n<=59) return 'cincuenta y '  + numberNames[n-50];
  if(n>=61 && n<=69) return 'sesenta y '    + numberNames[n-60];
  if(n>=71 && n<=79) return 'setenta y '    + numberNames[n-70];
  if(n>=81 && n<=89) return 'ochenta y '    + numberNames[n-80];
  if(n>=91 && n<=99) return 'noventa y '    + numberNames[n-90];
  // 101-199: ciento + resto
  if(n>=101 && n<=199) return 'ciento ' + numToWord(n-100);
  // 200-999: centenas compuestas (ej: 789 = setecientos + ochenta y nueve)
  const centenas = [200,300,400,500,600,700,800,900];
  for(const c of centenas){
    if(n > c && n < c+100){
      const resto = n - c;
      return numberNames[c] + (resto > 0 ? ' ' + numToWord(resto) : '');
    }
  }
  return String(n);
}



let mathState={};

function loadMath(topic){
  const label = MATH_TOPIC_LABELS[topic] || topic;
  goToExerciseScreen('math', label);
  mathState={ topic, idx:0, total:6, correct:0 };
  updateProgress('math',0);
  _lastSec = 'math'; _lastRewardTopic = topic;
  initLives();
  nextMath();
}

function nextMath(){
  if(mathState.idx>=mathState.total){ finishSection('math',mathState.correct,mathState.total); return; }
  updateProgress('math', mathState.idx/mathState.total*100);
  const el=document.getElementById('math-exercise');
  el.innerHTML='';
  if(mathState.topic==='read')      renderMathRead(el);
  if(mathState.topic==='valpos')    renderMathValPos(el);
  if(mathState.topic==='order')     renderMathOrder(el);
  if(mathState.topic==='mental')    renderMathMental(el);
  if(mathState.topic==='problem')   renderMathProblem(el);
  if(mathState.topic==='multintro') renderMathMultIntro(el);
  if(mathState.topic==='figuras')   renderMathFiguras(el);
  if(mathState.topic==='cuerpos')   renderMathCuerpos(el);
  if(mathState.topic==='espacio')   renderMathEspacio(el);
  if(mathState.topic==='medida')    renderMathMedida(el);
  if(mathState.topic==='tiempo')    renderMathTiempo(el);
}

/* ── 1. Leer y escribir números ── */
function renderMathRead(el){
  const mode = rand(0,1); // 0=num→palabra  1=palabra→num
  const pool = pick(getReadablePool(),4);
  const correct = pool[0];
  const opts = shuffle(pool);

  if(mode===0){
    // Mostrar número, elegir palabra
    el.innerHTML=`
      <p class="ex-intro">⛏️ ¡Héroe! ¿Cómo se escribe este número en el libro de bloques?</p>
      <div class="big-question">${correct}</div>
      <div class="options-grid" id="math-opts">
        ${opts.map(n=>`<button class="opt-btn" onclick="checkMathRead(this,'${numToWord(n)}','${numToWord(correct)}')">${numToWord(n)}</button>`).join('')}
      </div>
      <div class="feedback" id="math-fb"></div>`;
  } else {
    // Mostrar palabra, elegir número
    el.innerHTML=`
      <p class="ex-intro">🗺️ ¡El mapa dice esto! ¿Qué número es?</p>
      <div class="big-question">${numToWord(correct)}</div>
      <div class="options-grid" id="math-opts">
        ${opts.map(n=>`<button class="opt-btn" onclick="checkMathRead(this,'${n}','${correct}')">${n}</button>`).join('')}
      </div>
      <div class="feedback" id="math-fb"></div>`;
  }
  el.appendChild(renderNextBtn('math',nextMath));
}



function mcMsg(pool){ return pool[Math.floor(Math.random()*pool.length)]; }

function checkMathRead(btn,val,ans){
  disableOpts('math-opts');
  const fb=document.getElementById('math-fb');
  achState.totalAnswered++;
  if(String(val)===String(ans)){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); mathState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('math-opts',ans);
    onWrongAnswer();
  }
  mathState.idx++;
  document.getElementById('math-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}

/* ── 2. Orden y secuencias ── */
const orderTypes=['anterior','posterior','missing','asc','desc'];

function renderMathOrder(el){
  const type = orderTypes[mathState.idx % orderTypes.length];
  let q={};

  // Ranges by difficulty
  const maxN = difficulty==='easy' ? 50 : difficulty==='medium' ? 500 : 9999;
  const minN = difficulty==='easy' ? 2  : difficulty==='medium' ? 10  : 100;
  const stepMax = difficulty==='easy' ? 5 : difficulty==='medium' ? 20 : 100;

  if(type==='anterior'){
    const n=rand(minN,maxN); q={label:`¿Cuál es el número ANTERIOR a ${n}?`, ans:n-1, opts:shuffle([n-1,n+1,n-2,n+2])};
  } else if(type==='posterior'){
    const n=rand(minN-1,maxN-1); q={label:`¿Cuál es el número POSTERIOR a ${n}?`, ans:n+1, opts:shuffle([n+1,n-1,n+2,n-2])};
  } else if(type==='missing'){
    const start=rand(1,minN)*2; const step=rand(2,stepMax);
    const seq=[start, start+step, start+step*2, start+step*3, start+step*4];
    const holeIdx=rand(1,3);
    const ans=seq[holeIdx];
    const display=seq.map((v,i)=>i===holeIdx?'___':v).join(' → ');
    const opts=shuffle([ans, ans+step, ans-step, ans+step*2]);
    q={label:`Completá la secuencia:\n${display}`, ans, opts};
  } else if(type==='asc'){
    const a=rand(minN,maxN); const b=rand(1,stepMax);
    const nums=shuffle([a, a+b, a+b*2, a+b*3]);
    const ans=nums.slice().sort((x,y)=>x-y)[0];
    const opts2=shuffle(nums);
    q={label:`¿Cuál es el número MÁS PEQUEÑO?`, sub:`${nums.join('   ')}`, ans, opts:opts2};
  } else {
    const a=rand(minN,maxN); const b=rand(1,stepMax);
    const nums=shuffle([a, a+b, a+b*2, a+b*3]);
    const ans=nums.slice().sort((x,y)=>y-x)[0];
    const opts2=shuffle(nums);
    q={label:`¿Cuál es el número MÁS GRANDE?`, sub:`${nums.join('   ')}`, ans, opts:opts2};
  }

  el.innerHTML=`
    <p class="ex-intro">🔄 ¡El portal necesita esta secuencia para abrirse!</p>
    <div class="medium-question">${q.label.replace(/\n/,'<br>')}</div>
    ${q.sub?`<div class="big-question" style="font-size:2.6rem;letter-spacing:6px">${q.sub}</div>`:''}
    <div class="options-grid" id="math-opts">
      ${q.opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 3. Cálculo mental ── */
function renderMathMental(el){
  let a,b,op,ans,label,lvlLabel;

  if(difficulty==='easy'){
    // Estrategias: dobles, mitades, número redondo, 1 cifra
    const strat = ['suma1','resta1','doble','mitad','redondo'][mathState.idx % 5];
    if(strat==='doble'){
      a=rand(1,10); ans=a*2;
      label=`El doble de ${a} = ?`; lvlLabel='Dobles';
    } else if(strat==='mitad'){
      ans=rand(1,10); a=ans*2;
      label=`La mitad de ${a} = ?`; lvlLabel='Mitades';
    } else if(strat==='redondo'){
      a=rand(1,9)*10; b=rand(1,5)*10; op=rand(0,1)?'+':'-';
      if(op==='-' && b>a){[a,b]=[b,a];}
      ans=op==='+'?a+b:a-b;
      label=`${a} ${op} ${b} = ?`; lvlLabel='Números redondos';
    } else if(strat==='suma1'){
      a=rand(1,9); b=rand(1,9);
      ans=a+b; label=`${a} + ${b} = ?`; lvlLabel='1 cifra';
    } else {
      a=rand(1,9); b=rand(1,9);
      if(b>a){[a,b]=[b,a];}
      ans=a-b; label=`${a} - ${b} = ?`; lvlLabel='1 cifra';
    }
  } else if(difficulty==='medium'){
    // dobles de 2 cifras, mitades, tablas 2-5, redondos
    const strat = ['doble','mitad','tabla','redondo2','cifra2'][mathState.idx % 5];
    if(strat==='doble'){
      a=rand(10,50); ans=a*2;
      label=`El doble de ${a} = ?`; lvlLabel='Dobles';
    } else if(strat==='mitad'){
      ans=rand(10,50); a=ans*2;
      label=`La mitad de ${a} = ?`; lvlLabel='Mitades';
    } else if(strat==='tabla'){
      a=rand(2,5); b=rand(1,10);
      ans=a*b; label=`${a} × ${b} = ?`; lvlLabel='Tablas';
    } else if(strat==='redondo2'){
      a=rand(1,9)*100; b=rand(1,4)*100; op=rand(0,1)?'+':'-';
      if(op==='-' && b>a){[a,b]=[b,a];}
      ans=op==='+'?a+b:a-b;
      label=`${a} ${op} ${b} = ?`; lvlLabel='Centenas redondas';
    } else {
      a=rand(10,99); b=rand(1,49); op=rand(0,1)?'+':'-';
      if(op==='-' && b>a){[a,b]=[b,a];}
      ans=op==='+'?a+b:a-b; label=`${a} ${op} ${b} = ?`; lvlLabel='2 cifras';
    }
  } else {
    // hard: dobles/mitades grandes, tablas 6-9, 3 cifras, divisiones
    const type=['doble','mitad','tabla','cifra3','division'][mathState.idx % 5];
    if(type==='doble'){
      a=rand(50,500); ans=a*2;
      label=`El doble de ${a} = ?`; lvlLabel='Dobles';
    } else if(type==='mitad'){
      ans=rand(50,500); a=ans*2;
      label=`La mitad de ${a} = ?`; lvlLabel='Mitades';
    } else if(type==='tabla'){
      a=rand(6,9); b=rand(2,10);
      ans=a*b; label=`${a} × ${b} = ?`; lvlLabel='Tablas';
    } else if(type==='cifra3'){
      a=rand(100,999); b=rand(10,199); op=rand(0,1)?'+':'-';
      if(op==='-' && b>a){[a,b]=[b,a];}
      ans=op==='+'?a+b:a-b; label=`${a} ${op} ${b} = ?`; lvlLabel='3 cifras';
    } else {
      b=rand(2,9); ans=rand(2,10); a=b*ans;
      label=`${a} ÷ ${b} = ?`; lvlLabel='División';
    }
  }

  const distractors=new Set();
  for(const c of [ans+1,ans+2,ans-1,ans-2,ans+10,ans-10,ans+5,Math.floor(ans/2)]){
    if(c!==ans && c>=0) distractors.add(c); if(distractors.size===3) break;
  }
  const opts=shuffle([ans,...[...distractors].slice(0,3)]);

  el.innerHTML=`
    <p class="ex-intro">🧠 ¡Calcula para craftear! Estrategia: ${lvlLabel}</p>
    <div class="big-question">${label}</div>
    <div class="options-grid" id="math-opts">
      ${opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── helper: genera siempre exactamente 4 opciones únicas que incluyen la correcta ── */
function make4Opts(correct) {
  const s = new Set([correct]);
  // candidatos: vecinos del correcto y valores fijos de relleno
  const candidates = [correct+1, correct-1, correct+2, correct-2,
                      correct+3, correct+4, correct+5];
  for (const c of candidates) {
    if (c >= 0 && c !== correct) s.add(c);
    if (s.size === 4) break;
  }
  // seguro: si por alguna razón sigue faltando, agrega 0,1,2,3...
  for (let i = 0; s.size < 4; i++) s.add(i);
  return shuffle([...s].slice(0, 4));
}

/* ── 1b. Valor posicional ── */
function renderMathValPos(el){
  const types=['unidades','decenas','centenas','armar','comparar'];
  const type = types[mathState.idx % types.length];
  let q={}, intro='';

  if(type==='unidades'){
    const n = difficulty==='easy' ? rand(11,99) : rand(100,999);
    const digU = n % 10;
    q={ label:`En el número <b>${n}</b>, ¿cuál es el dígito de las <b>UNIDADES</b>?`,
        ans: digU,
        opts: make4Opts(digU) };
    intro='🏗️ Valor posicional — Unidades';

  } else if(type==='decenas'){
    const n = difficulty==='easy' ? rand(10,99) : rand(100,999);
    const digD = Math.floor((n % 100) / 10);
    q={ label:`En el número <b>${n}</b>, ¿cuál es el dígito de las <b>DECENAS</b>?`,
        ans: digD,
        opts: make4Opts(digD) };
    intro='🏗️ Valor posicional — Decenas';

  } else if(type==='centenas'){
    const n = difficulty==='easy' ? rand(100,500) : rand(101,999);
    const digC = Math.floor(n / 100);
    q={ label:`En el número <b>${n}</b>, ¿cuál es el dígito de las <b>CENTENAS</b>?`,
        ans: digC,
        opts: make4Opts(digC) };
    intro='🏗️ Valor posicional — Centenas';

  } else if(type==='armar'){
    const c=rand(1,9), d=rand(0,9), u=rand(0,9);
    const n = difficulty==='easy' ? d*10+u : c*100+d*10+u;
    const label = difficulty==='easy'
      ? `<b>${d}</b> en las decenas y <b>${u}</b> en las unidades → ¿qué número es?`
      : `<b>${c}</b> en centenas, <b>${d}</b> en decenas y <b>${u}</b> en unidades → ¿qué número es?`;
    q={ label, ans:n, opts: make4Opts(n) };
    intro='🏗️ Armá el número';

  } else {
    // Cuánto VALE el dígito de las decenas (valor posicional real, ej: 3 → vale 30)
    const n = rand(100,999);
    const digD = Math.floor((n % 100) / 10);
    const valD = digD * 10;
    q={ label:`En el número <b>${n}</b>, el dígito de las decenas es <b>${digD}</b>.<br>¿Cuánto <b>vale</b> ese dígito?`,
        ans: valD,
        opts: make4Opts(valD) };
    intro='🏗️ Valor del dígito';
  }

  el.innerHTML=`
    <p class="ex-intro">${intro}</p>
    <div class="medium-question">${q.label}</div>
    <div class="options-grid" id="math-opts">
      ${q.opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 4. Situaciones problemáticas aditivas ── */
const mathProblemsEasy = [
  // unir
  { text:'Lucía tiene 🍎 <b>8 manzanas</b> y le regalan <b>5 más</b>. ¿Cuántas tiene ahora?', ans:13, ops:[13,12,14,11] },
  // agregar
  { text:'En una canasta hay 🥚 <b>20 huevos</b>. Se rompen <b>7</b>. ¿Cuántos quedan?', ans:13, ops:[13,12,14,15] },
  // perder
  { text:'Pedro tiene <b>35 figuritas</b> 🃏. Le da <b>12</b> a su amigo. ¿Cuántas le quedan?', ans:23, ops:[23,22,24,25] },
  // unir
  { text:'En el aula hay <b>15 nenas</b> 👧 y <b>13 nenes</b> 👦. ¿Cuántos chicos hay en total?', ans:28, ops:[28,27,29,26] },
  // comparar
  { text:'Ana tiene <b>18 caramelos</b> 🍬 y Beto tiene <b>11</b>. ¿Cuántos caramelos más tiene Ana?', ans:7, ops:[7,6,8,9] },
  // ganar
  { text:'Martín juntó <b>14 monedas</b> 🪙 y luego ganó <b>9 más</b> en un juego. ¿Cuántas tiene?', ans:23, ops:[23,22,24,21] },
  // comparar
  { text:'En una caja hay <b>24 lápices</b> ✏️. Se usan <b>8</b>. ¿Cuántos lápices quedan?', ans:16, ops:[16,15,17,14] },
  // unir partes
  { text:'Hay <b>12 pájaros</b> 🐦 en un árbol y <b>7 más</b> llegan volando. ¿Cuántos pájaros hay?', ans:19, ops:[19,18,20,17] },
];
const mathProblemsMedium = [
  { text:'Hay 🐑 <b>50 ovejas</b> en el campo. Entran <b>25 más</b>. ¿Cuántas hay?', ans:75, ops:[75,74,76,70] },
  { text:'Una librería tiene <b>120 libros</b> 📚. Venden <b>45</b>. ¿Cuántos quedan?', ans:75, ops:[75,80,70,65] },
  { text:'Mamá compra <b>3 docenas de facturas</b> 🥐 (una docena = 12). ¿Cuántas facturas son?', ans:36, ops:[36,34,38,30] },
  { text:'Un tren tiene <b>8 vagones</b> 🚃. En cada vagón viajan <b>10 personas</b>. ¿Cuántas viajan?', ans:80, ops:[80,70,90,85] },
  // comparar
  { text:'La escuela A tiene <b>245 alumnos</b> 🏫 y la escuela B tiene <b>198</b>. ¿Cuántos alumnos más tiene A?', ans:47, ops:[47,43,53,37] },
  // ganar/perder
  { text:'Un coleccionista tiene <b>180 estampillas</b> 📮. Pierde <b>35</b> y consigue <b>60 nuevas</b>. ¿Cuántas tiene?', ans:205, ops:[205,215,195,185] },
  // agregar
  { text:'En un partido se anotaron <b>130 puntos</b> en el primer tiempo y <b>95</b> en el segundo. ¿Cuántos en total?', ans:225, ops:[225,235,215,220] },
  // diferencia
  { text:'Una pileta tiene <b>500 litros</b> 💧. Se gastan <b>175</b>. ¿Cuántos litros quedan?', ans:325, ops:[325,335,315,350] },
];
const mathProblemsHard = [
  { text:'Una fábrica produce <b>250 cajas</b> 📦 por día. ¿Cuántas produce en <b>4 días</b>?', ans:1000, ops:[1000,900,800,1200] },
  { text:'Un campo mide <b>840 metros</b> 🌾. Se recorre <b>un tercio</b>. ¿Cuántos metros?', ans:280, ops:[280,270,290,300] },
  { text:'En una sala hay <b>12 filas</b> 🪑 con <b>15 asientos</b> cada una. ¿Cuántos asientos?', ans:180, ops:[180,170,190,160] },
  { text:'Un negocio vendió <b>432 productos</b> en <b>6 días</b>. ¿Cuántos vendió por día?', ans:72, ops:[72,62,82,70] },
  // comparar grandes
  { text:'Ciudad A tiene <b>648 habitantes</b> 🏙️ y ciudad B tiene <b>879</b>. ¿Cuántos más tiene B?', ans:231, ops:[231,221,241,251] },
  // ganar/perder
  { text:'Un almacén tenía <b>720 productos</b> 🏪. Vendió <b>385</b> y recibió <b>210 nuevos</b>. ¿Cuántos tiene ahora?', ans:545, ops:[545,535,555,560] },
];

let problemPool=[];
function renderMathProblem(el){
  const pool = difficulty==='hard' ? mathProblemsHard : difficulty==='medium' ? mathProblemsMedium : mathProblemsEasy;
  if(problemPool.length===0) problemPool=shuffle([...pool]);
  const q=problemPool[mathState.idx % problemPool.length];

  el.innerHTML=`
    <p class="ex-intro">📜 ¡El aldeano te pide ayuda con esta misión! Leé y resolvé:</p>
    <div class="reading-box">${q.text}</div>
    <div class="medium-question">¿Cuál es el resultado?</div>
    <div class="options-grid" id="math-opts">
      ${shuffle(q.ops).map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 5. Introducción a la multiplicación ── */
function renderMathMultIntro(el){
  const mode = ['series','rect','suma'][mathState.idx % 3];

  let q={};
  if(mode==='series'){
    // Series que se repiten: ¿cuánto hay en total?
    const emoji=['🍎','⭐','🔵','🟥','🐟','🌸'][rand(0,5)];
    const grupo = difficulty==='easy' ? rand(2,5) : rand(2,9);
    const veces = difficulty==='easy' ? rand(2,4) : rand(2,6);
    const total = grupo * veces;
    const grupos = Array(veces).fill(emoji.repeat(grupo)).join('  ');
    q={ intro:'⛏️ Series que se repiten',
        label:`Hay <b>${veces} grupos</b> de <b>${grupo} ${emoji}</b> cada uno.<br>¿Cuántos hay en total?`,
        display: grupos,
        ans: total,
        opts: shuffle([total, total+grupo, total-grupo, total+grupo*2].filter(v=>v>0).slice(0,4)) };
  } else if(mode==='rect'){
    // Organización rectangular
    const filas = difficulty==='easy' ? rand(2,4) : rand(2,6);
    const cols  = difficulty==='easy' ? rand(2,5) : rand(2,8);
    const total = filas * cols;
    const display = Array(filas).fill('🟦'.repeat(cols)).join('<br>');
    q={ intro:'🟦 Organización rectangular',
        label:`Hay <b>${filas} filas</b> de <b>${cols} cuadrados</b> cada una.<br>¿Cuántos cuadrados hay en total?`,
        display,
        ans: total,
        opts: shuffle([total, total+filas, total-cols, total+cols].filter(v=>v>0).slice(0,4)) };
  } else {
    // Suma sucesiva → multiplicación
    const n = difficulty==='easy' ? rand(2,5) : rand(2,9);
    const veces = difficulty==='easy' ? rand(2,4) : rand(2,6);
    const total = n*veces;
    const suma = Array(veces).fill(n).join(' + ');
    q={ intro:'➕ Suma sucesiva',
        label:`${suma} = <b>${veces} veces ${n}</b> = ?`,
        display:'',
        ans: total,
        opts: shuffle([total, total+n, total-n, total+n*2].filter(v=>v>0).slice(0,4)) };
  }

  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    <div class="medium-question">${q.label}</div>
    ${q.display ? `<div class="big-question" style="font-size:2.8rem;line-height:2.0;letter-spacing:4px">${q.display}</div>` : ''}
    <div class="options-grid" id="math-opts">
      ${q.opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 6. Figuras geométricas — SVG inline ── */

// SVGs limpios y grandes, colores estilo Minecraft


// SVGs 3D con perspectiva isométrica clara — redibujados con coordenadas precisas


const figurasData = [
  { nombre:'Cuadrado',   lados:4, vertices:4, desc:'4 lados iguales, 4 vértices' },
  { nombre:'Rectángulo', lados:4, vertices:4, desc:'4 lados (2 pares iguales), 4 vértices' },
  { nombre:'Triángulo',  lados:3, vertices:3, desc:'3 lados, 3 vértices' },
  { nombre:'Círculo',    lados:0, vertices:0, desc:'Sin lados ni vértices, curvo' },
];

function renderMathFiguras(el){
  const tipos=['nombre','lados','vertices','descripcion'];
  const tipo = tipos[mathState.idx % tipos.length];
  const fig = figurasData[rand(0,figurasData.length-1)];
  const svg = FIGURA_SVG[fig.nombre];
  let q={};

  if(tipo==='nombre'){
    const opts = shuffle(figurasData.map(f=>f.nombre));
    q={ intro:'🔺 ¿Cuál es el nombre de esta figura del bioma?',
        label:'', svg, ans:fig.nombre, opts };
  } else if(tipo==='lados'){
    const opts = shuffle([...new Set([fig.lados, fig.lados+1, fig.lados===0?1:fig.lados-1, 4])].slice(0,4));
    q={ intro:`🔺 Mirá bien el <b>${fig.nombre}</b>:`,
        label:`¿Cuántos <b>lados</b> tiene?`,
        svg, ans:String(fig.lados), opts:opts.map(String) };
  } else if(tipo==='vertices'){
    const opts = shuffle([...new Set([fig.vertices, fig.vertices+1, fig.vertices===0?1:fig.vertices-1, 3])].slice(0,4));
    q={ intro:`🔺 Mirá bien el <b>${fig.nombre}</b>:`,
        label:`¿Cuántos <b>vértices</b> (esquinas) tiene?`,
        svg, ans:String(fig.vertices), opts:opts.map(String) };
  } else {
    const opts = shuffle(figurasData.map(f=>f.nombre));
    q={ intro:'🔺 ¡El aldeano describe una figura! ¿Cuál es?',
        label:`"Tiene ${fig.desc}"`,
        svg: null, ans:fig.nombre, opts };
  }

  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    ${q.svg ? `<div class="figura-svg-wrap">${q.svg}</div>` : ''}
    ${q.label ? `<div class="medium-question">${q.label}</div>` : ''}
    <div class="options-grid" id="math-opts">
      ${q.opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,\`${o}\`,\`${q.ans}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 7. Cuerpos geométricos — SVG inline ── */
const cuerposData = [
  { nombre:'Cubo',     caras:6, aristas:12, vertices:8,  forma:'cuadrados' },
  { nombre:'Prisma',   caras:5, aristas:9,  vertices:6,  forma:'rectángulos y triángulos' },
  { nombre:'Pirámide', caras:5, aristas:8,  vertices:5,  forma:'triángulos y una base cuadrada' },
  { nombre:'Esfera',   caras:0, aristas:0,  vertices:0,  forma:'superficie curva sin aristas' },
  { nombre:'Cilindro', caras:3, aristas:2,  vertices:0,  forma:'dos círculos y una superficie curva' },
];

function renderMathCuerpos(el){
  const tipos=['nombre','caras','aristas','vertices'];
  const tipo = tipos[mathState.idx % tipos.length];
  const c = cuerposData[rand(0,cuerposData.length-1)];
  const svg = CUERPO_SVG[c.nombre];
  let q={};

  if(tipo==='nombre'){
    const opts = shuffle(cuerposData.map(x=>x.nombre));
    q={ intro:'📦 ¿Cómo se llama este cuerpo geométrico?',
        label:'', svg, ans:c.nombre, opts };
  } else if(tipo==='caras'){
    const opts = shuffle([...new Set([c.caras, c.caras+1, c.caras===0?1:c.caras-1, c.caras+2])].slice(0,4));
    q={ intro:`📦 Mirá bien el <b>${c.nombre}</b>:`,
        label:`¿Cuántas <b>caras</b> tiene?`,
        svg, ans:String(c.caras), opts:opts.map(String) };
  } else if(tipo==='aristas'){
    const opts = shuffle([...new Set([c.aristas, c.aristas+2, c.aristas===0?1:c.aristas-2, c.aristas+4])].slice(0,4));
    q={ intro:`📦 Mirá bien el <b>${c.nombre}</b>:`,
        label:`¿Cuántas <b>aristas</b> (bordes) tiene?`,
        svg, ans:String(c.aristas), opts:opts.map(String) };
  } else {
    const opts = shuffle([...new Set([c.vertices, c.vertices+1, c.vertices===0?1:c.vertices-1, c.vertices+3])].slice(0,4));
    q={ intro:`📦 Mirá bien el <b>${c.nombre}</b>:`,
        label:`¿Cuántos <b>vértices</b> (puntas) tiene?`,
        svg, ans:String(c.vertices), opts:opts.map(String) };
  }

  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    ${q.svg ? `<div class="figura-svg-wrap">${q.svg}</div>` : ''}
    ${q.label ? `<div class="medium-question">${q.label}</div>` : ''}
    <div class="options-grid" id="math-opts">
      ${q.opts.map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 8. Orientación espacial — con escenas SVG ── */

// Construye un bloque SVG con emoji + etiqueta
function bloqueEdificio(x, y, emoji, label, color='#f0ede0', highlight=false){
  const borde = highlight ? '#F5C518' : '#1a1a1a';
  const sw     = highlight ? 4 : 3;
  return `
    <rect x="${x}" y="${y}" width="95" height="85" rx="4"
          fill="${color}" stroke="${borde}" stroke-width="${sw}"/>
    <text x="${x+47}" y="${y+46}" text-anchor="middle" font-size="32">${emoji}</text>
    <text x="${x+47}" y="${y+74}" text-anchor="middle" font-size="11"
          font-family="monospace" fill="#1a1a1a">${label}</text>`;
}

// Flecha de brújula
function brujula(x, y){
  return `
    <circle cx="${x}" cy="${y}" r="24" fill="#1a1a1a" opacity="0.7"/>
    <text x="${x}" y="${y-8}"  text-anchor="middle" font-size="12" fill="#fff" font-family="monospace">N</text>
    <text x="${x}" y="${y+18}" text-anchor="middle" font-size="12" fill="#aaa" font-family="monospace">S</text>
    <text x="${x-15}" y="${y+5}" text-anchor="middle" font-size="12" fill="#aaa" font-family="monospace">O</text>
    <text x="${x+15}" y="${y+5}" text-anchor="middle" font-size="12" fill="#aaa" font-family="monospace">E</text>`;
}

const espacioPreguntas = [

  // 1. ¿Dónde está el gato respecto a la caja? — arriba/abajo/adentro/al lado
  { intro:'🗺️ Mirá la escena y respondé:',
    pregunta:'¿Dónde está el 🐱 gato?',
    svg: `<svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg">
      <!-- caja -->
      <rect x="80" y="70" width="100" height="80" rx="4" fill="#c8a96e" stroke="#1a1a1a" stroke-width="3"/>
      <text x="130" y="118" text-anchor="middle" font-size="42">📦</text>
      <text x="130" y="142" text-anchor="middle" font-size="12" font-family="monospace">CAJA</text>
      <!-- gato ARRIBA -->
      <text x="130" y="55" text-anchor="middle" font-size="42">🐱</text>
      <text x="130" y="70" text-anchor="middle" font-size="11" font-family="monospace" fill="#c0392b">← AQUÍ</text>
    </svg>`,
    ans:'arriba',
    opts:['arriba','abajo','adentro','al lado'] },

  // 2. ¿Dónde está la pelota respecto a la silla?
  { intro:'🗺️ Mirá la escena y respondé:',
    pregunta:'¿Dónde está la ⚽ pelota?',
    svg: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
      <!-- silla -->
      <text x="100" y="100" text-anchor="middle" font-size="56">🪑</text>
      <text x="100" y="125" text-anchor="middle" font-size="12" font-family="monospace">SILLA</text>
      <!-- pelota a la derecha -->
      <text x="210" y="100" text-anchor="middle" font-size="50">⚽</text>
      <text x="210" y="125" text-anchor="middle" font-size="11" font-family="monospace" fill="#c0392b">← AQUÍ</text>
    </svg>`,
    ans:'a la derecha',
    opts:['a la derecha','a la izquierda','arriba','abajo'] },

  // 3. La biblioteca está ENTRE el banco y la farmacia — ¿qué está a sus costados?
  { intro:'🗺️ Mirá el plano del barrio:',
    pregunta:'¿Qué edificios están a los costados de la 📚 biblioteca?',
    svg: `<svg viewBox="0 0 340 115" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="340" height="115" rx="6" fill="#e8f4e8" stroke="#5D9E3A" stroke-width="2"/>
      ${bloqueEdificio(8,   12, '🏦', 'BANCO',     '#bfdbfe')}
      ${bloqueEdificio(122, 12, '📚', 'BIBLIO',    '#fef9c3', true)}
      ${bloqueEdificio(236, 12, '💊', 'FARMACIA',  '#fce7f3')}
      <!-- flechas entre bloques -->
      <line x1="103" y1="55" x2="122" y2="55" stroke="#1a1a1a" stroke-width="2" marker-end="url(#arr)"/>
      <line x1="217" y1="55" x2="236" y2="55" stroke="#1a1a1a" stroke-width="2" marker-end="url(#arr)"/>
      <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#1a1a1a"/>
      </marker></defs>
    </svg>`,
    ans:'el banco y la farmacia',
    opts:['el banco y la farmacia','la escuela y el parque','el cine y la plaza','la iglesia y el museo'] },

  // 4. El parque está DETRÁS del hospital — ¿dónde está el parque?
  { intro:'🗺️ Mirá el plano del barrio:',
    pregunta:'¿Dónde está el 🌳 parque?',
    svg: `<svg viewBox="0 0 260 210" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="260" height="210" rx="6" fill="#e8f4e8" stroke="#5D9E3A" stroke-width="2"/>
      <!-- fila trasera (arriba en el plano = detrás) -->
      ${bloqueEdificio(82,  10, '🌳', 'PARQUE',   '#bbf7d0', true)}
      <!-- fila delantera -->
      ${bloqueEdificio(82, 115, '🏥', 'HOSPITAL', '#fce7f3')}
      <text x="130" y="200" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">↑ adelante = abajo en el plano</text>
    </svg>`,
    ans:'detrás del hospital',
    opts:['detrás del hospital','delante del hospital','a la derecha','a la izquierda'] },

  // 5. La escuela está ENFRENTE del banco
  { intro:'🗺️ Mirá el plano del barrio:',
    pregunta:'¿Dónde está la 🏫 escuela respecto al 🏦 banco?',
    svg: `<svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="260" height="220" rx="6" fill="#e8f4e8" stroke="#5D9E3A" stroke-width="2"/>
      ${bloqueEdificio(82,  10, '🏦', 'BANCO',   '#bfdbfe')}
      <!-- calle -->
      <rect x="0" y="98" width="260" height="22" fill="#d1d5db"/>
      <text x="130" y="113" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">~ CALLE ~</text>
      ${bloqueEdificio(82, 123, '🏫', 'ESCUELA', '#fef9c3', true)}
    </svg>`,
    ans:'enfrente del banco',
    opts:['enfrente del banco','detrás del banco','al lado del banco','lejos del banco'] },

  // 6. El cine está ENTRE la pizzería y el supermercado
  { intro:'🗺️ Mirá el plano del barrio:',
    pregunta:'¿Qué edificio está en el MEDIO?',
    svg: `<svg viewBox="0 0 340 115" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="340" height="115" rx="6" fill="#e8f4e8" stroke="#5D9E3A" stroke-width="2"/>
      ${bloqueEdificio(8,   12, '🍕', 'PIZZERÍA',  '#fce7f3')}
      ${bloqueEdificio(122, 12, '🎬', 'CINE',      '#fef9c3', true)}
      ${bloqueEdificio(236, 12, '🛒', 'SUPER',     '#bfdbfe')}
    </svg>`,
    ans:'el cine',
    opts:['el cine','la pizzería','el supermercado','ninguno'] },

  // 7. Brújula — norte arriba, ¿qué está abajo?
  { intro:'🧭 Mirá la brújula y respondé:',
    pregunta:'En el mapa, el NORTE está arriba. ¿Qué dirección está abajo?',
    svg: `<svg viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="260" height="150" rx="6" fill="#1a2a4a"/>
      ${brujula(130, 80)}
      <!-- flecha grande apuntando arriba = norte -->
      <line x1="130" y1="56" x2="130" y2="20" stroke="#fff" stroke-width="3" marker-end="url(#arrW)"/>
      <text x="130" y="15" text-anchor="middle" font-size="14" fill="#4ade80" font-family="monospace">NORTE ↑</text>
      <defs><marker id="arrW" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#fff"/>
      </marker></defs>
    </svg>`,
    ans:'sur',
    opts:['sur','norte','este','oeste'] },

  // 8. Robot — contá los pasos
  { intro:'🤖 El robot sigue este camino:',
    pregunta:'¿Cuántos pasos dio el robot en total?',
    svg: `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="160" rx="6" fill="#1a1a2e"/>
      <!-- cuadrícula -->
      ${[0,1,2,3,4,5].map(i=>`<line x1="${35+i*50}" y1="10" x2="${35+i*50}" y2="150" stroke="#333" stroke-width="1"/>`).join('')}
      ${[0,1,2].map(i=>`<line x1="10" y1="${35+i*50}" x2="310" y2="${35+i*50}" stroke="#333" stroke-width="1"/>`).join('')}
      <!-- robot inicio -->
      <text x="35" y="128" text-anchor="middle" font-size="30">🤖</text>
      <!-- paso 1: ↑ 2 pasos -->
      <line x1="35" y1="110" x2="35" y2="28" stroke="#4ade80" stroke-width="3" marker-end="url(#arrG)"/>
      <text x="50" y="72" font-size="13" fill="#4ade80" font-family="monospace">↑2</text>
      <!-- paso 2: → 3 pasos -->
      <line x1="35" y1="28" x2="185" y2="28" stroke="#60a5fa" stroke-width="3" marker-end="url(#arrB)"/>
      <text x="95" y="22" font-size="13" fill="#60a5fa" font-family="monospace">→3</text>
      <!-- paso 3: ↓ 1 paso -->
      <line x1="185" y1="28" x2="185" y2="78" stroke="#f87171" stroke-width="3" marker-end="url(#arrR)"/>
      <text x="195" y="58" font-size="13" fill="#f87171" font-family="monospace">↓1</text>
      <!-- bandera final -->
      <text x="185" y="120" text-anchor="middle" font-size="28">🚩</text>
      <defs>
        <marker id="arrG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4ade80"/></marker>
        <marker id="arrB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa"/></marker>
        <marker id="arrR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f87171"/></marker>
      </defs>
    </svg>`,
    ans:'6',
    opts:['6','5','7','4'] },

];

function renderMathEspacio(el){
  const q = espacioPreguntas[mathState.idx % espacioPreguntas.length];
  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    <div class="espacio-svg-wrap">${q.svg}</div>
    <div class="medium-question" style="margin-top:8px">${q.pregunta}</div>
    <div class="options-grid" id="math-opts">
      ${shuffle(q.opts).map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,\`${o}\`,\`${q.ans}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 9. Unidades de medida ── */
const medidaPreguntas = {
  easy:[
    { intro:'Longitud', label:'¿Cuál es la unidad convencional para medir la altura de una persona?',
      ans:'metro', opts:['metro','litro','kilo','minuto'] },
    { intro:'Capacidad', label:'¿Qué unidad usamos para medir cuánto líquido entra en una botella?',
      ans:'litro', opts:['litro','metro','kilo','hora'] },
    { intro:'Peso', label:'¿Qué unidad usamos para pesar la harina en una receta?',
      ans:'kilo', opts:['kilo','litro','metro','segundo'] },
    { intro:'Estimación', label:'Una mesa mide aproximadamente <b>1 metro</b> de alto. Si querés medir el largo de una cancha de fútbol, ¿qué unidad usás?',
      ans:'metro', opts:['metro','litro','kilo','centímetro'] },
    { intro:'No convencional', label:'¿Cuál de estas NO es una unidad convencional de medida?',
      ans:'palmo', opts:['palmo','metro','litro','kilo'] },
    { intro:'Estimación', label:'Un vaso de jugo tiene aproximadamente <b>200 _____</b>. ¿Qué unidad completa la oración?',
      ans:'mililitros', opts:['mililitros','kilos','metros','horas'] },
  ],
  medium:[
    { intro:'Conversión', label:'1 metro = ___ centímetros',
      ans:'100', opts:['100','10','1000','50'] },
    { intro:'Conversión', label:'1 kilogramo = ___ gramos',
      ans:'1000', opts:['1000','100','500','10'] },
    { intro:'Estimación', label:'Un auto mide aproximadamente <b>4 ___</b> de largo.',
      ans:'metros', opts:['metros','centímetros','kilómetros','milímetros'] },
    { intro:'Longitud', label:'¿Cuántos centímetros hay en medio metro?',
      ans:'50', opts:['50','100','25','75'] },
    { intro:'Peso', label:'Una sandía pesa aproximadamente <b>3 ___</b>.',
      ans:'kilos', opts:['kilos','gramos','litros','metros'] },
    { intro:'Capacidad', label:'Una bañadera tiene aproximadamente <b>200 ___</b>.',
      ans:'litros', opts:['litros','kilos','metros','gramos'] },
  ],
  hard:[
    { intro:'Conversión', label:'1 km = ___ metros',
      ans:'1000', opts:['1000','100','10000','500'] },
    { intro:'Problema', label:'Una soga mide <b>3 m y 50 cm</b>. ¿Cuántos centímetros mide en total?',
      ans:'350', opts:['350','305','3050','300'] },
    { intro:'Problema', label:'Comprás <b>2,5 kg</b> de azúcar. ¿Cuántos gramos son?',
      ans:'2500', opts:['2500','250','25000','2050'] },
    { intro:'Estimación', label:'La distancia entre dos ciudades es <b>450 ___</b>.',
      ans:'kilómetros', opts:['kilómetros','metros','centímetros','milímetros'] },
    { intro:'Problema', label:'Una canilla pierde <b>5 litros</b> por hora. ¿Cuántos litros pierde en 8 horas?',
      ans:'40', opts:['40','35','45','13'] },
    { intro:'Conversión', label:'2 horas y 30 minutos = ___ minutos',
      ans:'150', opts:['150','130','230','120'] },
  ]
};
function renderMathMedida(el){
  const pool = medidaPreguntas[difficulty] || medidaPreguntas.easy;
  const q = pool[mathState.idx % pool.length];
  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    <div class="medium-question">${q.label}</div>
    <div class="options-grid" id="math-opts">
      ${shuffle(q.opts).map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,\`${o}\`,\`${q.ans}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── 10. El tiempo (calendario y reloj) ── */
const tiempoPreguntas = {
  easy:[
    { intro:'El calendario', label:'¿Cuántos días tiene una semana?',
      ans:'7', opts:['7','5','6','8'] },
    { intro:'El calendario', label:'¿Cuántos meses tiene un año?',
      ans:'12', opts:['12','10','11','13'] },
    { intro:'El reloj', label:'Si el reloj marca las <b>3:00</b>, ¿qué hora es?',
      ans:'las 3 en punto', opts:['las 3 en punto','las 12','las 6','las 9'] },
    { intro:'El calendario', label:'¿Qué día viene después del miércoles?',
      ans:'jueves', opts:['jueves','martes','viernes','lunes'] },
    { intro:'El tiempo', label:'¿Cuántos minutos tiene una hora?',
      ans:'60', opts:['60','30','100','24'] },
    { intro:'El calendario', label:'¿Cuál es el tercer mes del año?',
      ans:'marzo', opts:['marzo','enero','febrero','abril'] },
  ],
  medium:[
    { intro:'El calendario', label:'¿Cuántos días tiene el mes de febrero en un año normal?',
      ans:'28', opts:['28','29','30','31'] },
    { intro:'El reloj', label:'Si son las <b>4:30</b>, ¿cuántos minutos faltan para las 5?',
      ans:'30', opts:['30','15','45','20'] },
    { intro:'El tiempo', label:'¿Cuántas horas tiene un día?',
      ans:'24', opts:['24','12','48','36'] },
    { intro:'El calendario', label:'¿En qué estación del año hace más frío (en Argentina)?',
      ans:'invierno', opts:['invierno','verano','primavera','otoño'] },
    { intro:'El reloj', label:'El reloj marca <b>2:45</b>. ¿Cuántos minutos pasaron desde las 2?',
      ans:'45', opts:['45','15','30','20'] },
    { intro:'El tiempo', label:'Una película dura <b>1 hora y 20 minutos</b>. ¿Cuántos minutos en total?',
      ans:'80', opts:['80','70','90','120'] },
  ],
  hard:[
    { intro:'El calendario', label:'¿Cuántos días tiene un año bisiesto?',
      ans:'366', opts:['366','365','364','367'] },
    { intro:'El tiempo', label:'Un evento dura <b>3 horas y 45 minutos</b>. ¿Cuántos minutos son?',
      ans:'225', opts:['225','215','235','200'] },
    { intro:'El reloj', label:'Si salís a las <b>8:15</b> y llegás a las <b>10:00</b>, ¿cuánto tiempo tardaste?',
      ans:'1 hora 45 minutos', opts:['1 hora 45 minutos','1 hora 30 minutos','2 horas','1 hora 15 minutos'] },
    { intro:'El calendario', label:'Desde el <b>5 de marzo</b> hasta el <b>5 de abril</b> hay exactamente:',
      ans:'1 mes', opts:['1 mes','4 semanas','30 días','31 días'] },
    { intro:'El tiempo', label:'¿Cuántas semanas hay en un año (aproximadamente)?',
      ans:'52', opts:['52','48','56','365'] },
    { intro:'El reloj', label:'El minutero está en el <b>6</b>. ¿Cuántos minutos marca?',
      ans:'30', opts:['30','6','60','15'] },
  ]
};
function renderMathTiempo(el){
  const pool = tiempoPreguntas[difficulty] || tiempoPreguntas.easy;
  const q = pool[mathState.idx % pool.length];
  el.innerHTML=`
    <p class="ex-intro">${q.intro}</p>
    <div class="medium-question">${q.label}</div>
    <div class="options-grid" id="math-opts">
      ${shuffle(q.opts).map(o=>`<button class="opt-btn" onclick="checkMathGeneric(this,\`${o}\`,\`${q.ans}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="math-fb"></div>`;
  el.appendChild(renderNextBtn('math',nextMath));
}

/* ── shared checker ── */
function checkMathGeneric(btn,val,ans){
  disableOpts('math-opts');
  const fb=document.getElementById('math-fb');
  achState.totalAnswered++;
  if(String(val)===String(ans)){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); mathState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('math-opts',ans);
    onWrongAnswer();
  }
  mathState.idx++;
  document.getElementById('math-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}


/* ══════════════════════════════════════════════════════════
   ██████  LENGUA
══════════════════════════════════════════════════════════ */

let langState={};
let currentLangBook = 1;

/* ── Definición de temas por cuadernillo ── */




function selectLangBook(n){
  currentLangBook = n;
  document.querySelectorAll('.lang-book-btn').forEach(b=>b.classList.remove('active-book'));
  document.getElementById('langbook-'+n).classList.add('active-book');
  const bar = document.getElementById('lang-topic-bar');
  const [c1,c2] = BOOK_COLORS[n];
  bar.innerHTML = LANG_BOOKS[n].topics.map(t=>
    `<button class="sub-btn" style="background:linear-gradient(135deg,${c1},${c2})" onclick="loadLang('${t.id}')">${t.label}</button>`
  ).join('');
}

function getLangTopicLabel(topicId){
  for(const book of Object.values(LANG_BOOKS)){
    const t = book.topics.find(t=>t.id===topicId);
    if(t) return t.label;
  }
  return topicId;
}

function loadLang(topic){
  goToExerciseScreen('lang', getLangTopicLabel(topic));
  langState={ topic, idx:0, total:6, correct:0 };
  updateProgress('lang',0);
  _lastSec = 'lang'; _lastRewardTopic = topic;
  initLives();
  nextLang();
}

function nextLang(){
  if(langState.idx>=langState.total){ finishSection('lang',langState.correct,langState.total); return; }
  updateProgress('lang', langState.idx/langState.total*100);
  const el=document.getElementById('lang-exercise');
  el.innerHTML='';
  // dispatch by topic id
  const t = langState.topic;
  if(t==='b1_vocales')    renderB1Vocales(el);
  else if(t==='b1_digrafos')   renderB1Digrafos(el);
  else if(t==='b1_plural')     renderB1Plural(el);
  else if(t==='b1_diminutivo') renderB1Diminutivo(el);
  else if(t==='b1_verbosp')    renderB1VerbosPresente(el);
  else if(t==='b1_lectura')    renderLangReading(el, 1);
  else if(t==='b2_grupos')     renderB2Grupos(el);
  else if(t==='b2_interroga')  renderB2Interroga(el);
  else if(t==='b2_tiempos')    renderB2Tiempos(el);
  else if(t==='b2_diasest')    renderB2DiasEst(el);
  else if(t==='b2_lectura')    renderLangReading(el, 2);
  else if(t==='b3_sufijos')    renderB3Sufijos(el);
  else if(t==='b3_familias')   renderB3Familias(el);
  else if(t==='b3_compuestas') renderB3Compuestas(el);
  else if(t==='b3_verbpron')   renderB3VerbPron(el);
  else if(t==='b3_lectura')    renderLangReading(el, 3);
  // legacy topics (kept for backwards compat)
  else if(t==='reading')  renderLangReading(el, 1);
  else if(t==='writing')  renderLangWriting(el);
  else if(t==='classify') renderLangClassify(el);
}

/* ── 1. Lectura y comprensión ── */
const readingsEasy=[
  {
    text:`<strong>El perro de Tomás</strong><br><br>
Tomás tiene un perro que se llama <strong>Peluso</strong>. Peluso es grande y tiene el pelo marrón.
Todos los días, Tomás lo lleva al parque a pasear. A Peluso le encanta correr y jugar con la pelota.
Por las noches, Peluso duerme en su cama, al lado de la puerta.`,
    questions:[
      { q:'¿Cómo se llama el perro de Tomás?', opts:['Peluso','Manchas','Tobi','Roco'], ans:'Peluso' },
      { q:'¿Cómo es el pelo de Peluso?', opts:['blanco','negro','marrón','amarillo'], ans:'marrón' },
      { q:'¿Adónde lleva Tomás al perro todos los días?', opts:['al río','al parque','a la escuela','a la plaza'], ans:'al parque' },
    ]
  },
  {
    text:`<strong>El día de lluvia</strong><br><br>
Hoy llueve mucho. <strong>Sofía</strong> no puede salir a jugar.
Se queda en casa y lee un libro de cuentos. Su mamá le prepara una taza de chocolate caliente.
Sofía piensa que los días de lluvia también pueden ser lindos.`,
    questions:[
      { q:'¿Por qué Sofía no puede salir?', opts:['hace frío','llueve mucho','está enferma','no quiere'], ans:'llueve mucho' },
      { q:'¿Qué hace Sofía en casa?', opts:['duerme','dibuja','lee un libro','mira tele'], ans:'lee un libro' },
      { q:'¿Qué le prepara su mamá?', opts:['jugo','leche','chocolate caliente','sopa'], ans:'chocolate caliente' },
    ]
  },
];
const readingsMedium=[
  {
    text:`<strong>La tortuga viajera</strong><br><br>
<strong>Lenta</strong> es una tortuga que vive cerca del lago.
Un día decidió hacer un viaje muy largo para conocer el bosque.
Caminó despacio, sin apurarse, y llegó al bosque cuando el sol se estaba poniendo.
Los animales del bosque la recibieron con alegría.`,
    questions:[
      { q:'¿Dónde vive Lenta?', opts:['en el bosque','en el desierto','cerca del lago','en el mar'], ans:'cerca del lago' },
      { q:'¿Cómo caminó Lenta?', opts:['rápido','saltando','despacio','corriendo'], ans:'despacio' },
      { q:'¿Cómo la recibieron los animales?', opts:['con miedo','con alegría','con enojo','sin mirarla'], ans:'con alegría' },
    ]
  },
  {
    text:`<strong>El inventor curioso</strong><br><br>
<strong>Nicolás</strong> tiene 10 años y le encanta inventar cosas. Un día construyó un pequeño robot
con cajas de cartón y cables viejos. Su maestra quedó tan impresionada que lo invitó a presentarlo
en la feria de ciencias de la escuela. El robot no caminaba, pero prendía una lucecita azul cuando
alguien le aplaudía.`,
    questions:[
      { q:'¿Qué construyó Nicolás?', opts:['un avión','un robot','una casa','un auto'], ans:'un robot' },
      { q:'¿Qué materiales usó?', opts:['madera y pintura','hierro y tornillos','cajas de cartón y cables','papel y tijeras'], ans:'cajas de cartón y cables' },
      { q:'¿Cuándo prendía la lucecita?', opts:['al caminar','al hablar','al aplaudir','al girar'], ans:'al aplaudir' },
    ]
  },
];
const readingsHard=[
  {
    text:`<strong>El misterio del lago</strong><br><br>
En el pequeño pueblo de <strong>Villalago</strong> corría una leyenda: cada cien años, en la noche
más fría del invierno, el lago brillaba con una luz verde. Los científicos lo explicaban por el
fitoplancton bioluminiscente. Pero los ancianos del pueblo decían que era el alma de un barco
hundido hace siglos, cargado de oro. <strong>Elena</strong>, una joven investigadora, decidió
sumergirse con un equipo de buceo para descubrir la verdad. Encontró el barco, pero adentro
solo había libros y mapas antiguos. Ningún oro. Solo conocimiento.`,
    questions:[
      { q:'¿Cuál era la explicación científica del brillo?', opts:['gases subterráneos','fitoplancton bioluminiscente','electricidad natural','reflejo de la luna'], ans:'fitoplancton bioluminiscente' },
      { q:'¿Qué encontró Elena dentro del barco?', opts:['oro y monedas','armas antiguas','libros y mapas','ninguna de las anteriores'], ans:'libros y mapas' },
      { q:'¿Cada cuánto tiempo brillaba el lago?', opts:['cada año','cada diez años','cada cien años','cada luna llena'], ans:'cada cien años' },
    ]
  },
  {
    text:`<strong>La revolución del reciclaje</strong><br><br>
La ciudad de <strong>Veracruz</strong> tenía un serio problema: acumulaba más de <b>500 toneladas</b>
de basura por semana. Un grupo de jóvenes estudiantes propuso un programa de reciclaje radical.
Colocaron contenedores de colores en cada barrio, educaron a los vecinos y convirtieron el
plástico en materiales de construcción. En dos años, la cantidad de basura se redujo en un <b>60%</b>.
El programa fue adoptado por otras 12 ciudades del país.`,
    questions:[
      { q:'¿Cuánta basura acumulaba Veracruz por semana?', opts:['100 toneladas','500 toneladas','1000 toneladas','250 toneladas'], ans:'500 toneladas' },
      { q:'¿En qué convirtieron el plástico?', opts:['ropa','combustible','materiales de construcción','alimentos'], ans:'materiales de construcción' },
      { q:'¿Cuánto se redujo la basura en dos años?', opts:['40%','50%','60%','70%'], ans:'60%' },
    ]
  },
];

// backwards compat
const readings = readingsEasy;

/* ────────────────────────────────────────────────────────
   TEXTOS DE COMPRENSIÓN LECTORA POR CUADERNILLO
   (cuento base de "Aprendo leyendo")
──────────────────────────────────────────────────────── */
const readingsByBook = {
  1: [  // En la escuela
    {
      text:`<strong>📘 En la escuela — El primer día</strong><br><br>
Hoy es el primer día de clases. <strong>Iara</strong> llega a la escuela con su mochila nueva.
Su maestra se llama <strong>Úrsula</strong>. En el aula hay muchos chicos y chicas.
Iara conoce a <strong>Kiko</strong>, que tiene una remera con una <strong>k</strong> gigante.
Todos se saludan y cantan una canción juntos.`,
      questions:[
        { q:'¿Cómo se llama la nena del cuento?', opts:['Úrsula','Iara','Kiko','Ana'], ans:'Iara' },
        { q:'¿Cómo se llama la maestra?', opts:['Úrsula','Iara','Sofía','María'], ans:'Úrsula' },
        { q:'¿Qué hicieron todos juntos?', opts:['dibujaron','comieron','cantaron una canción','corrieron'], ans:'cantaron una canción' },
      ]
    },
    {
      text:`<strong>📘 En la escuela — El libro de Wanda</strong><br><br>
<strong>Wanda</strong> encontró un libro muy raro en la biblioteca.
Tenía dibujos de <strong>xilofonistas</strong> y palabras con <strong>x</strong> y <strong>w</strong>.
—¡Qué libro tan especial! — dijo Wanda.
La maestra explicó que esas letras se usan poco pero son muy importantes.`,
      questions:[
        { q:'¿Dónde encontró Wanda el libro?', opts:['en casa','en el parque','en la biblioteca','en el patio'], ans:'en la biblioteca' },
        { q:'¿Qué tenía el libro?', opts:['fotos de animales','dibujos de xilofonistas','mapas del mundo','cuentos de hadas'], ans:'dibujos de xilofonistas' },
        { q:'¿Qué dijo la maestra sobre esas letras?', opts:['que eran difíciles','que no se usaban más','que se usan poco pero son importantes','que estaban mal escritas'], ans:'que se usan poco pero son importantes' },
      ]
    },
  ],
  2: [  // En la ciudad
    {
      text:`<strong>📗 En la ciudad — El paseo en plaza</strong><br><br>
<strong>Blas</strong> y su mamá caminan por la <strong>plaza</strong>.
Hay una <strong>planta</strong> grande con flores <strong>blancas</strong>.
—¿<strong>Qué</strong> flor es esa? — pregunta Blas.
—Es un <strong>gladiolo</strong> — responde su mamá.
Blas saca una foto con el celular para mostrarle a la maestra.`,
      questions:[
        { q:'¿Con quién camina Blas?', opts:['con su papá','con su abuela','con su mamá','con un amigo'], ans:'con su mamá' },
        { q:'¿Cómo son las flores de la planta grande?', opts:['rojas','amarillas','blancas','azules'], ans:'blancas' },
        { q:'¿Cómo se llama la flor?', opts:['rosa','clavel','gladiolo','girasol'], ans:'gladiolo' },
      ]
    },
    {
      text:`<strong>📗 En la ciudad — El semáforo</strong><br><br>
<strong>Después</strong> de la escuela, <strong>Frida</strong> cruza la calle.
Mira el semáforo: está en <strong>rojo</strong>.
—<strong>¿Cuándo</strong> cruzo? — pregunta Frida.
—<strong>Cuando</strong> esté en verde — dice su papá.
El semáforo cambia. Frida cruza con cuidado.`,
      questions:[
        { q:'¿Qué hace Frida después de la escuela?', opts:['va al parque','cruza la calle','come helado','espera el colectivo'], ans:'cruza la calle' },
        { q:'¿De qué color está el semáforo al principio?', opts:['verde','amarillo','rojo','azul'], ans:'rojo' },
        { q:'¿Cuándo cruza Frida?', opts:['cuando está en rojo','cuando está en amarillo','cuando está en verde','cuando no hay autos'], ans:'cuando está en verde' },
      ]
    },
  ],
  3: [  // El bosque olvidado
    {
      text:`<strong>📙 El bosque olvidado — La exploradora</strong><br><br>
<strong>Valentina</strong> es una exploradora <strong>valiosísima</strong>.
Camina <strong>silenciosamente</strong> por el bosque.
Encuentra una flor <strong>rarísima</strong> que no aparece en ningún libro.
—Esta flor debe llamarse <em>flor del tiempo perdido</em> — piensa Valentina.
Saca su cuaderno y comienza a <strong>describir</strong> lo que ve.`,
      questions:[
        { q:'¿Cómo camina Valentina?', opts:['rápidamente','silenciosamente','torpemente','alegremente'], ans:'silenciosamente' },
        { q:'¿Qué encuentra Valentina?', opts:['un río','un animal raro','una flor rarísima','un árbol caído'], ans:'una flor rarísima' },
        { q:'¿Qué hace Valentina con su cuaderno?', opts:['dibuja un mapa','describe lo que ve','escribe una carta','anota los nombres de los árboles'], ans:'describe lo que ve' },
      ]
    },
    {
      text:`<strong>📙 El bosque olvidado — El árbol que habla</strong><br><br>
<strong>Mientras</strong> los chicos exploraban el bosque, escucharon una voz.
Era el <strong>roble</strong> más alto: —<em>Se están secando mis raíces</em>.
Los chicos decidieron hacer una <strong>reunión</strong> para organizarse.
Armaron <strong>baldecitos</strong> con botellas recicladas y regaron el árbol.
Al día siguiente, el roble tenía hojas nuevas <strong>brillantísimas</strong>.`,
      questions:[
        { q:'¿Qué escucharon los chicos?', opts:['un pájaro cantando','una voz del roble','el viento','una canción'], ans:'una voz del roble' },
        { q:'¿Qué problema tenía el árbol?', opts:['le faltaban hojas','se secaban sus raíces','tenía una herida','estaba muy frío'], ans:'se secaban sus raíces' },
        { q:'¿Con qué hicieron los baldecitos?', opts:['con barro','con madera','con botellas recicladas','con piedras'], ans:'con botellas recicladas' },
      ]
    },
  ]
};

let readingPool=[];
function renderLangReading(el, bookNum){
  const book = bookNum || 1;
  const byBookPool = readingsByBook[book];
  // Also use difficulty-based pool for legacy/generic reading
  const legacyPool = difficulty==='hard' ? readingsHard : difficulty==='medium' ? readingsMedium : readingsEasy;
  const pool = byBookPool || legacyPool;

  const stateKey = 'readPool_b'+book;
  if(langState[stateKey]===undefined){
    langState[stateKey]=shuffle([...pool]);
    langState['readIdx_b'+book]=0;
    langState['qIdx_b'+book]=0;
  }
  const stories = langState[stateKey];
  const ridx = langState['readIdx_b'+book];
  const qidx = langState['qIdx_b'+book];
  const story = stories[ridx % stories.length];
  const q = story.questions[qidx];
  const showText = qidx===0;

  el.innerHTML=`
    ${showText?`<div class="reading-box">${story.text}</div>`:''}
    <div class="medium-question">❓ ${q.q}</div>
    <div class="options-grid" id="lang-opts">
      ${shuffle([...q.opts]).map(o=>`<button class="opt-btn" onclick="checkLangReading(this,'${o.replace(/'/g,"\\'")}','${q.ans.replace(/'/g,"\\'")}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="lang-fb"></div>`;
  el.appendChild(renderNextBtn('lang',()=>{
    langState['qIdx_b'+book]++;
    if(langState['qIdx_b'+book]>=story.questions.length){
      langState['readIdx_b'+book]++;
      langState['qIdx_b'+book]=0;
    }
    nextLang();
  }));
}

function checkLangReading(btn,val,ans){
  disableOpts('lang-opts');
  const fb=document.getElementById('lang-fb');
  achState.totalAnswered++;
  if(val===ans){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); langState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('lang-opts',ans);
    onWrongAnswer();
  }
  langState.idx++;
  document.getElementById('lang-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}


/* ══════════════════════════════════════════════════════════
   ██  CUADERNILLO 1 — EN LA ESCUELA
══════════════════════════════════════════════════════════ */

/* helper genérico para ejercicios de opción múltiple */
function renderLangMC(el, intro, question, opts, ans, hint){
  el.innerHTML=`
    <p class="ex-intro">${intro}</p>
    <div class="medium-question">${question}</div>
    ${hint?`<div class="reading-box" style="font-size:1.1rem;text-align:center">${hint}</div>`:''}
    <div class="options-grid" id="lang-opts" style="max-width:520px">
      ${shuffle(opts).map(o=>`<button class="opt-btn" style="font-size:1rem"
        onclick="checkLangGeneric(this,'${o.replace(/'/g,"\\'")}','${ans.replace(/'/g,"\\'")}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="lang-fb"></div>`;
  el.appendChild(renderNextBtn('lang', nextLang));
}

function checkLangGeneric(btn,val,ans){
  disableOpts('lang-opts');
  const fb=document.getElementById('lang-fb');
  achState.totalAnswered++;
  if(val===ans){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); langState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('lang-opts', ans);
    onWrongAnswer();
  }
  langState.idx++;
  document.getElementById('lang-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}

/* ── B1: Vocales i, u ── */
const b1VocalesQ = shuffle([
  { q:'¿Qué vocal empieza la palabra "iguana"?', opts:['a','e','i','u'], ans:'i' },
  { q:'¿Con qué vocal empieza la palabra "uva"?', opts:['a','e','i','u'], ans:'u' },
  { q:'¿Cuál de estas palabras empieza con "i"?', opts:['elefante','iguana','oso','uva'], ans:'iguana' },
  { q:'¿Cuál de estas palabras empieza con "u"?', opts:['imán','arroz','uva','elefante'], ans:'uva' },
  { q:'¿Qué vocal hay en el medio de "mil"?', opts:['a','e','i','u'], ans:'i' },
  { q:'¿Qué vocal hay en "luz"?', opts:['a','e','i','u'], ans:'u' },
  { q:'¿Cuántas letras "i" tiene la palabra "ilusión"?', opts:['1','2','3','0'], ans:'2' },
  { q:'¿Cuál de estas palabras empieza con "u"?', opts:['isla','unión','elote','anillo'], ans:'unión' },
]);
let b1VocalesIdx=0;
function renderB1Vocales(el){
  const q=b1VocalesQ[b1VocalesIdx++ % b1VocalesQ.length];
  renderLangMC(el,'🔤 Vocales i, u', q.q, q.opts, q.ans, null);
}

/* ── B1: Dígrafos ch / ll / rr / qu ── */
const b1DigrafoQ = shuffle([
  { q:'¿Qué dígrafo hace el sonido de "chocolate"?', opts:['qu','ch','ll','rr'], ans:'ch' },
  { q:'¿Qué dígrafo tiene "llave"?', opts:['rr','qu','ch','ll'], ans:'ll' },
  { q:'¿Qué sonido hace "rr" en "perro"?', opts:['suave como en cara','fuerte y vibrante','igual que r simple','no suena'], ans:'fuerte y vibrante' },
  { q:'¿Con qué dígrafo se escribe "queso"?', opts:['ch','ll','rr','qu'], ans:'qu' },
  { q:'¿Cuál de estas palabras tiene el dígrafo "ch"?', opts:['lluvia','queso','chico','perro'], ans:'chico' },
  { q:'¿Cuál tiene el dígrafo "ll"?', opts:['chicle','llave','roca','queso'], ans:'llave' },
  { q:'¿Cuál tiene "rr"?', opts:['perro','chico','lluvia','queso'], ans:'perro' },
  { q:'¿Cuál usa el dígrafo "qu"?', opts:['chau','lluvia','querer','arroz'], ans:'querer' },
]);
let b1DigrafoIdx=0;
function renderB1Digrafos(el){
  const q=b1DigrafoQ[b1DigrafoIdx++ % b1DigrafoQ.length];
  renderLangMC(el,'✏️ Dígrafos ch / ll / rr / qu', q.q, q.opts, q.ans, null);
}

/* ── B1: Plural -es ── */
const b1PluralQ = shuffle([
  { q:'¿Cómo es el plural de "flor"?', opts:['flores','floreses','flors','florss'], ans:'flores' },
  { q:'¿Cómo es el plural de "árbol"?', opts:['árboles','árbolses','árbols','árbolos'], ans:'árboles' },
  { q:'¿Cómo es el plural de "ciudad"?', opts:['ciudades','ciudads','ciudads','ciudaes'], ans:'ciudades' },
  { q:'¿Cómo es el plural de "reloj"?', opts:['relojes','relojs','relojeses','relojss'], ans:'relojes' },
  { q:'¿Cuál es el plural correcto de "pared"?', opts:['paredes','paredses','pareds','paredas'], ans:'paredes' },
  { q:'¿Cuál es el plural de "animal"?', opts:['animales','animalses','animals','animaes'], ans:'animales' },
  { q:'¿Qué terminación lleva el plural de "rey"?', opts:['-es','-s','-os','-as'], ans:'-es' },
  { q:'Plural de "nariz":', opts:['narices','narizses','narizs','narizas'], ans:'narices' },
]);
let b1PluralIdx=0;
function renderB1Plural(el){
  const q=b1PluralQ[b1PluralIdx++ % b1PluralQ.length];
  renderLangMC(el,'📝 Plural con sufijo -es', q.q, q.opts, q.ans, null);
}

/* ── B1: Sufijos -ito / -ita ── */
const b1DiminQ = shuffle([
  { q:'¿Cómo queda "perro" con sufijo diminutivo?', opts:['perrito','perrote','perrón','perruco'], ans:'perrito' },
  { q:'¿Cómo queda "casa" con sufijo diminutivo?', opts:['casita','casota','casona','caseta'], ans:'casita' },
  { q:'¿Cuál es el diminutivo de "gato"?', opts:['gatito','gatote','gatón','gateo'], ans:'gatito' },
  { q:'¿Cuál es el diminutivo de "flor"?', opts:['florita','florete','florón','floruca'], ans:'florita' },
  { q:'¿Qué sufijo forma el diminutivo en "mesita"?', opts:['-ita','-ota','-ón','-uca'], ans:'-ita' },
  { q:'¿Qué sufijo forma el diminutivo en "gatito"?', opts:['-ito','-ote','-ón','-uco'], ans:'-ito' },
  { q:'Diminutivo de "libro":', opts:['librito','librote','librón','librillo'], ans:'librito' },
  { q:'Diminutivo de "niña":', opts:['niñita','niñota','niñona','niñuca'], ans:'niñita' },
]);
let b1DiminIdx=0;
function renderB1Diminutivo(el){
  const q=b1DiminQ[b1DiminIdx++ % b1DiminQ.length];
  renderLangMC(el,'💛 Sufijos -ito / -ita (diminutivos)', q.q, q.opts, q.ans, null);
}

/* ── B1: Verbos en presente simple ── */
const b1VerbPresQ = shuffle([
  { q:'¿Cuál es la forma correcta? "Yo ___ en la escuela."', opts:['como','comen','comemos','comes'], ans:'como' },
  { q:'"Ella ___ al parque todos los días."', opts:['va','van','vamos','voy'], ans:'va' },
  { q:'"Los chicos ___ en el patio."', opts:['juegan','juega','juego','jugamos'], ans:'juegan' },
  { q:'"Nosotros ___ los libros."', opts:['leemos','lee','leo','leen'], ans:'leemos' },
  { q:'"Tú ___ muy bien."', opts:['cantas','canta','cantamos','cantan'], ans:'cantas' },
  { q:'"El perro ___ mucho."', opts:['ladra','ladran','ladro','ladramos'], ans:'ladra' },
  { q:'"Yo ___ mi tarea."', opts:['hago','hace','hacen','hacemos'], ans:'hago' },
  { q:'"Ellas ___ en la pileta."', opts:['nadan','nada','nado','nadamos'], ans:'nadan' },
]);
let b1VerbPresIdx=0;
function renderB1VerbosPresente(el){
  const q=b1VerbPresQ[b1VerbPresIdx++ % b1VerbPresQ.length];
  renderLangMC(el,'⏱️ Verbos en tiempo presente', q.q, q.opts, q.ans, null);
}

/* ══════════════════════════════════════════════════════════
   ██  CUADERNILLO 2 — EN LA CIUDAD
══════════════════════════════════════════════════════════ */

/* ── B2: Grupos consonánticos pl, bl, gl, fl, cl, br, pr, tr, dr, fr, gr, cr ── */
const b2GruposQ = shuffle([
  { q:'¿Qué grupo consonántico tiene "plato"?', opts:['pl','bl','gl','cl'], ans:'pl' },
  { q:'¿Qué grupo consonántico tiene "blanco"?', opts:['bl','pl','fl','cl'], ans:'bl' },
  { q:'¿Qué grupo consonántico tiene "globo"?', opts:['gl','bl','pl','cl'], ans:'gl' },
  { q:'¿Qué grupo consonántico tiene "flor"?', opts:['fl','bl','pl','gl'], ans:'fl' },
  { q:'¿Qué grupo consonántico tiene "broma"?', opts:['br','pr','tr','dr'], ans:'br' },
  { q:'¿Qué grupo consonántico tiene "primo"?', opts:['pr','br','tr','gr'], ans:'pr' },
  { q:'¿Qué grupo consonántico tiene "tren"?', opts:['tr','pr','br','cr'], ans:'tr' },
  { q:'¿Qué grupo consonántico tiene "fruta"?', opts:['fr','gr','cr','br'], ans:'fr' },
  { q:'¿Qué grupo consonántico tiene "grasa"?', opts:['gr','fr','cr','tr'], ans:'gr' },
  { q:'¿Cuál de estas palabras tiene el grupo "cl"?', opts:['clavo','bloque','plato','globo'], ans:'clavo' },
]);
let b2GruposIdx=0;
function renderB2Grupos(el){
  const q=b2GruposQ[b2GruposIdx++ % b2GruposQ.length];
  renderLangMC(el,'🔡 Grupos consonánticos', q.q, q.opts, q.ans, null);
}

/* ── B2: Pronombres interrogativos ── */
const b2InterrogaQ = shuffle([
  { q:'¿Qué pronombre usás para preguntar por una persona?', opts:['¿Quién?','¿Qué?','¿Dónde?','¿Cuándo?'], ans:'¿Quién?' },
  { q:'¿Qué pronombre usás para preguntar por un lugar?', opts:['¿Dónde?','¿Quién?','¿Por qué?','¿Cómo?'], ans:'¿Dónde?' },
  { q:'¿Qué pronombre usás para preguntar por el momento?', opts:['¿Cuándo?','¿Dónde?','¿Quién?','¿Cuánto?'], ans:'¿Cuándo?' },
  { q:'¿Qué pronombre usás para preguntar una causa?', opts:['¿Por qué?','¿Cómo?','¿Cuándo?','¿Dónde?'], ans:'¿Por qué?' },
  { q:'"___ es tu nombre?" — completá con el pronombre correcto.', opts:['¿Cuál?','¿Cómo?','¿Quién?','¿Dónde?'], ans:'¿Cuál?' },
  { q:'"___ llegás a la escuela?" — modo en que llegás.', opts:['¿Cómo?','¿Dónde?','¿Cuándo?','¿Quién?'], ans:'¿Cómo?' },
  { q:'"___ libros tenés?" — cantidad.', opts:['¿Cuántos?','¿Qué?','¿Cómo?','¿Quién?'], ans:'¿Cuántos?' },
  { q:'"___ animal es tu mascota?" — para preguntar qué tipo de animal es.', opts:['¿Qué?','¿Cuándo?','¿Dónde?','¿Cuál?'], ans:'¿Qué?' },
]);
let b2InterrogaIdx=0;
function renderB2Interroga(el){
  const q=b2InterrogaQ[b2InterrogaIdx++ % b2InterrogaQ.length];
  renderLangMC(el,'❓ Pronombres interrogativos', q.q, q.opts, q.ans, null);
}

/* ── B2: Tiempos verbales presente / pasado / futuro ── */
const b2TiemposQ = shuffle([
  { q:'"Ayer fui al parque." ¿En qué tiempo está el verbo?', opts:['pasado','presente','futuro','imperativo'], ans:'pasado' },
  { q:'"Hoy como en casa." ¿En qué tiempo está el verbo?', opts:['presente','pasado','futuro','condicional'], ans:'presente' },
  { q:'"Mañana iré al cine." ¿En qué tiempo está el verbo?', opts:['futuro','pasado','presente','imperativo'], ans:'futuro' },
  { q:'¿Cuál es el pasado de "come"?', opts:['comió','comerá','come','comería'], ans:'comió' },
  { q:'¿Cuál es el futuro de "juega"?', opts:['jugará','jugó','juega','jugaría'], ans:'jugará' },
  { q:'"Los chicos corrieron en el patio." → tiempo:', opts:['pasado','presente','futuro','ninguno'], ans:'pasado' },
  { q:'"Ella estudiará toda la tarde." → tiempo:', opts:['futuro','presente','pasado','condicional'], ans:'futuro' },
  { q:'¿Cuál es el presente de "cantó"?', opts:['canta','cantará','cantaría','cantaba'], ans:'canta' },
]);
let b2TiemposIdx=0;
function renderB2Tiempos(el){
  const q=b2TiemposQ[b2TiemposIdx++ % b2TiemposQ.length];
  renderLangMC(el,'⏳ Tiempos verbales: presente, pasado y futuro', q.q, q.opts, q.ans, null);
}

/* ── B2: Días de la semana y estaciones del año ── */
const b2DiasEstQ = shuffle([
  { q:'¿Cuántos días tiene la semana?', opts:['7','5','6','8'], ans:'7' },
  { q:'¿Qué día viene después del miércoles?', opts:['jueves','martes','viernes','lunes'], ans:'jueves' },
  { q:'¿Cuál es el primer día de la semana?', opts:['lunes','domingo','sábado','martes'], ans:'lunes' },
  { q:'¿Cuántas estaciones tiene el año?', opts:['4','3','2','6'], ans:'4' },
  { q:'¿Qué estación viene después del verano?', opts:['otoño','invierno','primavera','ninguna'], ans:'otoño' },
  { q:'¿En qué estación caen las hojas de los árboles?', opts:['otoño','verano','primavera','invierno'], ans:'otoño' },
  { q:'¿Qué día va entre el miércoles y el viernes?', opts:['jueves','lunes','martes','sábado'], ans:'jueves' },
  { q:'¿En qué estación hay nieve?', opts:['invierno','verano','primavera','otoño'], ans:'invierno' },
]);
let b2DiasEstIdx=0;
function renderB2DiasEst(el){
  const q=b2DiasEstQ[b2DiasEstIdx++ % b2DiasEstQ.length];
  renderLangMC(el,'📅 Días de la semana y estaciones del año', q.q, q.opts, q.ans, null);
}

/* ══════════════════════════════════════════════════════════
   ██  CUADERNILLO 3 — EL BOSQUE OLVIDADO
══════════════════════════════════════════════════════════ */

/* ── B3: Sufijos -mente / -ción / -ísimo/-ísima ── */
const b3SufijosQ = shuffle([
  { q:'¿Qué sufijo convierte un adjetivo en adverbio?', opts:['-mente','-ción','-ísimo','-ito'], ans:'-mente' },
  { q:'"rápido" + sufijo -mente → ___', opts:['rápidamente','rapidación','rapidísimo','rapidito'], ans:'rápidamente' },
  { q:'"tranquilo" + sufijo -mente → ___', opts:['tranquilamente','tranquilación','tranquilísimo','tranquilito'], ans:'tranquilamente' },
  { q:'¿Qué sufijo indica "acción o resultado"?', opts:['-ción','-mente','-ísimo','-ito'], ans:'-ción' },
  { q:'"comunicar" → sustantivo con -ción:', opts:['comunicación','comunicante','comunicísimo','comunicado'], ans:'comunicación' },
  { q:'"crear" → sustantivo con -ción:', opts:['creación','creativo','creísimo','creado'], ans:'creación' },
  { q:'¿Qué sufijo da un significado superlativo?', opts:['-ísimo/-ísima','-mente','-ción','-ito/-ita'], ans:'-ísimo/-ísima' },
  { q:'"grande" en grado superlativo:', opts:['grandísimo','grandemente','grandación','grandito'], ans:'grandísimo' },
]);
let b3SufijosIdx=0;
function renderB3Sufijos(el){
  const q=b3SufijosQ[b3SufijosIdx++ % b3SufijosQ.length];
  renderLangMC(el,'🏷️ Sufijos -mente / -ción / -ísimo/-ísima', q.q, q.opts, q.ans, null);
}

/* ── B3: Familias de palabras ── */
const b3FamiliasQ = [
  { q:'¿Cuál pertenece a la familia de "pan"?', opts:['panadero','pañuelo','pantera','pantalla'], ans:'panadero' },
  { q:'¿Cuál pertenece a la familia de "libro"?', opts:['librería','libélula','licor','lira'], ans:'librería' },
  { q:'¿Cuál pertenece a la familia de "agua"?', opts:['aguacero','aguja','agujero','águila'], ans:'aguacero' },
  { q:'¿Cuál pertenece a la familia de "flor"?', opts:['florero','flotador','florido','flotar'], ans:'florero' },
  { q:'¿Cuál pertenece a la familia de "tierra"?', opts:['terreno','terror','tetera','tercio'], ans:'terreno' },
  { q:'¿Cuál pertenece a la familia de "sol"?', opts:['soleado','solapa','soltar','solicitud'], ans:'soleado' },
  { q:'¿Cuál NO pertenece a la familia de "mar"?', opts:['marea','marino','marcado','marisco'], ans:'marcado' },
  { q:'¿Cuál pertenece a la familia de "piedra"?', opts:['pedregoso','peinado','peluche','pelado'], ans:'pedregoso' },
];
let b3FamiliasIdx=0;
function renderB3Familias(el){
  const q=b3FamiliasQ[b3FamiliasIdx++ % b3FamiliasQ.length];
  renderLangMC(el,'🌳 Familias de palabras', q.q, q.opts, q.ans, null);
}

/* ── B3: Palabras compuestas ── */
const b3CompuestasQ = [
  { q:'¿Qué dos palabras forman "paraguas"?', opts:['para + aguas','par + aguas','para + guas','parag + uas'], ans:'para + aguas' },
  { q:'¿Qué dos palabras forman "sacacorchos"?', opts:['saca + corchos','sacac + orchos','s + acacorchos','sacacor + chos'], ans:'saca + corchos' },
  { q:'¿Cuál es una palabra compuesta?', opts:['sacacorchos','cuchara','flor','árbol'], ans:'sacacorchos' },
  { q:'¿Cuál es una palabra compuesta?', opts:['mesa','silla','abrelatas','libro'], ans:'abrelatas' },
  { q:'"Cumpleaños" está formada por:', opts:['cumple + años','cum + pleaños','cumplean + os','cumple + año'], ans:'cumple + años' },
  { q:'"Rascacielos" está formada por:', opts:['rasca + cielos','rascac + ielos','rasca + ciel','rascacie + los'], ans:'rasca + cielos' },
  { q:'¿Cuál es una palabra compuesta?', opts:['paraguas','libro','mesa','pared'], ans:'paraguas' },
  { q:'¿Cuál es una palabra compuesta?', opts:['limpiaparabrisas','velocidad','camino','bosque'], ans:'limpiaparabrisas' },
];
let b3CompuestasIdx=0;
function renderB3Compuestas(el){
  const q=b3CompuestasQ[b3CompuestasIdx++ % b3CompuestasQ.length];
  renderLangMC(el,'🔗 Palabras compuestas', q.q, q.opts, q.ans, null);
}

/* ── B3: Verbos pronominales ── */
const b3VerbPronQ = shuffle([
  { q:'"Me lavo las manos." ¿Qué pronombre acompaña al verbo?', opts:['me','te','se','nos'], ans:'me' },
  { q:'"Ella se peina sola." ¿Qué pronombre acompaña al verbo?', opts:['se','me','te','nos'], ans:'se' },
  { q:'"Nosotros nos levantamos temprano." → pronombre:', opts:['nos','se','me','te'], ans:'nos' },
  { q:'"Tú ___ peinás cada mañana." Completá con el pronombre.', opts:['te','me','se','nos'], ans:'te' },
  { q:'¿Cuál es un verbo pronominal?', opts:['levantarse','correr','saltar','hablar'], ans:'levantarse' },
  { q:'¿Cuál es un verbo pronominal?', opts:['peinarse','comer','beber','dormir'], ans:'peinarse' },
  { q:'"Los chicos ___ bañaron después del partido." → pronombre:', opts:['se','me','te','nos'], ans:'se' },
  { q:'"Yo ___ olvidé el libro." → pronombre:', opts:['me','se','te','nos'], ans:'me' },
]);
let b3VerbPronIdx=0;
function renderB3VerbPron(el){
  const q=b3VerbPronQ[b3VerbPronIdx++ % b3VerbPronQ.length];
  renderLangMC(el,'🔄 Verbos pronominales', q.q, q.opts, q.ans, null);
}


/* ── 2. Escritura: completar oraciones ── */
const writingEasy=[
  { sentence:['El','___','ladra','fuerte','.'], missing:'perro', bank:['perro','nube','libro','luna'] },
  { sentence:['La','mariposa','vuela','sobre','las','___','.'], missing:'flores', bank:['flores','piedras','casas','nubes'] },
  { sentence:['Los','chicos','juegan','en','el','___','.'], missing:'parque', bank:['parque','techo','río','desierto'] },
  { sentence:['Mamá','prepara','una','rica','___','caliente','.'], missing:'sopa', bank:['sopa','mesa','silla','puerta'] },
];
const writingMedium=[
  { sentence:['El','___','brilla','de','noche','.'], missing:'cielo', bank:['cielo','suelo','barco','tren'] },
  { sentence:['Mi','amiga','lee','un','___','de','cuentos','.'], missing:'libro', bank:['libro','zapato','globo','árbol'] },
  { sentence:['El','gato','duerme','sobre','la','___','.'], missing:'cama', bank:['cama','montaña','nube','piedra'] },
  { sentence:['Los','pájaros','cantan','en','el','___','.'], missing:'árbol', bank:['árbol','cajón','auto','vaso'] },
];
const writingHard=[
  { sentence:['El','científico','realizó','un','___','importante','.'], missing:'descubrimiento', bank:['descubrimiento','almuerzo','paseo','dibujo'] },
  { sentence:['La','___','del','río','arrastró','las','piedras','.'], missing:'corriente', bank:['corriente','sombra','nube','música'] },
  { sentence:['Los','astronautas','exploraron','la','superficie','del','___','.'], missing:'planeta', bank:['planeta','cajón','techo','jardín'] },
  { sentence:['El','___','aprobó','una','nueva','ley','para','proteger','el','medio','ambiente','.'], missing:'gobierno', bank:['gobierno','almuerzo','cuaderno','río'] },
];

let writingPool=[];
function renderLangWriting(el){
  const pool = difficulty==='hard' ? writingHard : difficulty==='medium' ? writingMedium : writingEasy;
  if(writingPool.length===0) writingPool=shuffle([...pool]);
  const q=writingPool[langState.idx % writingPool.length];
  const displayed=q.sentence.map(w=>w==='___'?'<span style="border-bottom:3px solid #6c5ce7;padding:0 20px;color:#6c5ce7;font-weight:bold">___</span>':w).join(' ');

  el.innerHTML=`
    <p class="ex-intro">📜 ¡El libro encantado tiene un hueco! Completá la oración del tomo</p>
    <div class="reading-box" style="font-size:1.3rem;text-align:center">${displayed}</div>
    <p style="color:#636e72;margin-bottom:10px">Elegí la palabra correcta:</p>
    <div class="word-bank" id="lang-bank">
      ${shuffle(q.bank).map(w=>`<span class="word-chip" onclick="checkLangWriting(this,'${w}','${q.missing}')">${w}</span>`).join('')}
    </div>
    <div class="feedback" id="lang-fb"></div>`;
  el.appendChild(renderNextBtn('lang',nextLang));
}

function checkLangWriting(chip,val,ans){
  document.querySelectorAll('#lang-bank .word-chip').forEach(c=>{ c.classList.add('used'); });
  const fb=document.getElementById('lang-fb');
  achState.totalAnswered++;
  if(val===ans){
    chip.classList.remove('used'); chip.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); langState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    chip.classList.remove('used'); chip.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong();
    document.querySelectorAll('#lang-bank .word-chip').forEach(c=>{ if(c.textContent===ans){ c.classList.remove('used'); c.classList.add('correct'); } });
    onWrongAnswer();
  }
  langState.idx++;
  document.getElementById('lang-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}

/* ── 3. Clasificar palabras ── */
const classifyData=[
  {
    words:shuffle([
      {w:'Argentina',type:'sustantivo propio'},
      {w:'mesa',type:'sustantivo común'},
      {w:'Lucas',type:'sustantivo propio'},
      {w:'perro',type:'sustantivo común'},
    ]),
    categories:['sustantivo propio','sustantivo común'],
    instruction:'Clasificá: ¿sustantivo propio o común?'
  },
  {
    words:shuffle([
      {w:'grande',type:'adjetivo'},
      {w:'ciudad',type:'sustantivo común'},
      {w:'colorida',type:'adjetivo'},
      {w:'libro',type:'sustantivo común'},
    ]),
    categories:['adjetivo','sustantivo común'],
    instruction:'Clasificá: ¿adjetivo o sustantivo común?'
  },
  {
    words:shuffle([
      {w:'Madrid',type:'sustantivo propio'},
      {w:'flor',type:'sustantivo común'},
      {w:'Valentina',type:'sustantivo propio'},
      {w:'auto',type:'sustantivo común'},
    ]),
    categories:['sustantivo propio','sustantivo común'],
    instruction:'Clasificá: ¿sustantivo propio o común?'
  },
  {
    words:shuffle([
      {w:'suave',type:'adjetivo'},
      {w:'rápido',type:'adjetivo'},
      {w:'escuela',type:'sustantivo común'},
      {w:'Buenos Aires',type:'sustantivo propio'},
    ]),
    categories:['adjetivo','sustantivo propio','sustantivo común'],
    instruction:'Clasificá cada palabra'
  },
  {
    words:shuffle([
      {w:'Río de Janeiro',type:'sustantivo propio'},
      {w:'alegre',type:'adjetivo'},
      {w:'silla',type:'sustantivo común'},
      {w:'pequeño',type:'adjetivo'},
    ]),
    categories:['adjetivo','sustantivo propio','sustantivo común'],
    instruction:'Clasificá cada palabra'
  },
  {
    words:shuffle([
      {w:'Sofía',type:'sustantivo propio'},
      {w:'redonda',type:'adjetivo'},
      {w:'pelota',type:'sustantivo común'},
      {w:'España',type:'sustantivo propio'},
    ]),
    categories:['adjetivo','sustantivo propio','sustantivo común'],
    instruction:'Clasificá cada palabra'
  },
];

let classifyPool=[];
function renderLangClassify(el){
  if(classifyPool.length===0) classifyPool=shuffle([...classifyData]);
  const q=classifyPool[langState.idx % classifyPool.length];
  const allCats=q.categories;

  // Show one word at a time — which category does it belong to?
  const word=q.words[langState.idx % q.words.length];

  el.innerHTML=`
    <p class="ex-intro">⚔️ ¡Misión del Overworld! ${q.instruction}</p>
    <div class="big-question">"${word.w}"</div>
    <div class="options-grid" id="lang-opts" style="max-width:500px">
      ${allCats.map(c=>`<button class="opt-btn" style="font-size:1rem" onclick="checkLangClassify(this,'${c}','${word.type}')">${c}</button>`).join('')}
    </div>
    <div class="feedback" id="lang-fb"></div>`;
  el.appendChild(renderNextBtn('lang',nextLang));
}

function checkLangClassify(btn,val,ans){
  disableOpts('lang-opts');
  const fb=document.getElementById('lang-fb');
  achState.totalAnswered++;
  if(val===ans){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); langState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('lang-opts',ans);
    onWrongAnswer();
  }
  langState.idx++;
  document.getElementById('lang-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}


/* ══════════════════════════════════════════════════════════
   ██████  INGLÉS
══════════════════════════════════════════════════════════ */

let engState={};

const townPlaces=[
  {en:'school',    es:'escuela',   emoji:'🏫'},
  {en:'hospital',  es:'hospital',  emoji:'🏥'},
  {en:'park',      es:'parque',    emoji:'🌳'},
  {en:'supermarket',es:'supermercado',emoji:'🛒'},
  {en:'library',   es:'biblioteca',emoji:'📚'},
  {en:'bank',      es:'banco',     emoji:'🏦'},
  {en:'church',    es:'iglesia',   emoji:'⛪'},
  {en:'museum',    es:'museo',     emoji:'🏛️'},
  {en:'cinema',    es:'cine',      emoji:'🎬'},
  {en:'restaurant',es:'restaurante',emoji:'🍽️'},
  {en:'pharmacy',  es:'farmacia',  emoji:'💊'},
  {en:'police station',es:'comisaría',emoji:'🚔'},
];

const prepositions=['next to','between','opposite','in front of','behind','near'];



function loadEng(topic){
  goToExerciseScreen('eng', ENG_TOPIC_LABELS[topic] || topic);
  engState={ topic, idx:0, total:6, correct:0 };
  updateProgress('eng',0);
  _lastSec = 'eng'; _lastRewardTopic = topic;
  initLives();
  nextEng();
}

function nextEng(){
  if(engState.idx>=engState.total){ finishSection('eng',engState.correct,engState.total); return; }
  updateProgress('eng', engState.idx/engState.total*100);
  const el=document.getElementById('eng-exercise');
  el.innerHTML='';
  if(engState.topic==='places')       renderEngPlaces(el);
  if(engState.topic==='prepositions') renderEngPrepositions(el);
  if(engState.topic==='isthere')      renderEngIsThere(el);
  if(engState.topic==='sentences')    renderEngSentences(el);
}

/* ── 1. Places in Town ── */
function renderEngPlaces(el){
  const mode=rand(0,1);
  const pool=shuffle([...townPlaces]).slice(0,4);
  const correct=pool[0];

  if(mode===0){
    // emoji → english name
    el.innerHTML=`
      <p class="ex-intro">🗺️ ¡Explorer! What place is this in the biome?</p>
      <div class="big-question" style="font-size:5.5rem;line-height:1.2">${correct.emoji}</div>
      <div class="options-grid" id="eng-opts">
        ${shuffle(pool).map(p=>`<button class="opt-btn" onclick="checkEngGeneric(this,'${p.en}','${correct.en}')">${p.en}</button>`).join('')}
      </div>
      <div class="feedback" id="eng-fb"></div>`;
  } else {
    // spanish → english
    el.innerHTML=`
      <p class="ex-intro">🗺️ ¡Explorer! ¿Cómo se dice en inglés?</p>
      <div class="big-question" style="font-size:4rem;line-height:1.3">${correct.emoji} ${correct.es}</div>
      <div class="options-grid" id="eng-opts">
        ${shuffle(pool).map(p=>`<button class="opt-btn" onclick="checkEngGeneric(this,'${p.en}','${correct.en}')">${p.en}</button>`).join('')}
      </div>
      <div class="feedback" id="eng-fb"></div>`;
  }
  el.appendChild(renderNextBtn('eng',nextEng));
}

/* ── 2. Prepositions ── */
const prepScenes=[
  { scene:'🏥 🏦', desc:'The bank is ___ the hospital.', ans:'next to', opts:['next to','opposite','behind','between'] },
  { scene:'🍽️ ⛪ 🎬', desc:'The church is ___ the restaurant and the cinema.', ans:'between', opts:['between','next to','behind','in front of'] },
  { scene:'🏫 ↔️ 🏦', desc:'The school is ___ the bank.', ans:'opposite', opts:['opposite','next to','behind','near'] },
  { scene:'🚔 🏛️', desc:'The police station is ___ the museum.', ans:'in front of', opts:['in front of','between','opposite','behind'] },
  { scene:'📚 🏥', desc:'The library is ___ the hospital.', ans:'near', opts:['near','between','opposite','behind'] },
  { scene:'🌳 🏦', desc:'The park is ___ the bank.', ans:'behind', opts:['behind','in front of','between','next to'] },
  { scene:'🛒 ⛪', desc:'The supermarket is ___ the church.', ans:'opposite', opts:['opposite','behind','next to','near'] },
  { scene:'💊 🏥', desc:'The pharmacy is ___ the hospital.', ans:'next to', opts:['next to','opposite','behind','between'] },
];

let prepPool=[];
function renderEngPrepositions(el){
  if(prepPool.length===0) prepPool=shuffle([...prepScenes]);
  const q=prepPool[engState.idx % prepPool.length];
  el.innerHTML=`
    <p class="ex-intro">📍 ¡Map coordinates! Choose the correct preposition</p>
    <div class="big-question" style="font-size:4.5rem;line-height:1.4;letter-spacing:10px">${q.scene}</div>
    <div class="medium-question">${q.desc.replace('___','<span style="border-bottom:3px solid #0984e3;padding:0 16px">___</span>')}</div>
    <div class="options-grid" id="eng-opts" style="max-width:500px">
      ${shuffle(q.opts).map(o=>`<button class="opt-btn" style="font-size:1rem" onclick="checkEngGeneric(this,'${o}','${q.ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="eng-fb"></div>`;
  el.appendChild(renderNextBtn('eng',nextEng));
}

/* ── 3. Is there / Are there ── */
const isThereScenes=[
  {
    mapLabel:'🏥 🏦 🌳 🏫',
    question:'Is there a hospital in the town?',
    ans:'Yes, there is.',
    opts:['Yes, there is.','No, there isn\'t.','Yes, there are.','No, there aren\'t.']
  },
  {
    mapLabel:'🏥 🏦 🌳 🏫',
    question:'Are there any cinemas in the town?',
    ans:'No, there aren\'t.',
    opts:['Yes, there are.','No, there aren\'t.','Yes, there is.','No, there isn\'t.']
  },
  {
    mapLabel:'🎬 🛒 💊 ⛪',
    question:'Is there a cinema in the town?',
    ans:'Yes, there is.',
    opts:['Yes, there is.','No, there isn\'t.','Yes, there are.','No, there aren\'t.']
  },
  {
    mapLabel:'🎬 🛒 💊 ⛪',
    question:'Are there any hospitals in the town?',
    ans:'No, there aren\'t.',
    opts:['Yes, there are.','No, there aren\'t.','Yes, there is.','No, there isn\'t.']
  },
  {
    mapLabel:'🏛️ 🚔 📚 🏥',
    question:'Are there any museums in the town?',
    ans:'Yes, there are.',
    opts:['Yes, there are.','No, there aren\'t.','Yes, there is.','No, there isn\'t.']
  },
  {
    mapLabel:'🏛️ 🚔 📚 🏥',
    question:'Is there a bank in the town?',
    ans:'No, there isn\'t.',
    opts:['Yes, there is.','No, there isn\'t.','Yes, there are.','No, there aren\'t.']
  },
  {
    mapLabel:'🍽️ 🏦 🌳 🎬',
    question:'Is there a restaurant in the town?',
    ans:'Yes, there is.',
    opts:['Yes, there is.','No, there isn\'t.','Yes, there are.','No, there aren\'t.']
  },
  {
    mapLabel:'🍽️ 🏦 🌳 🎬',
    question:'Are there any schools in the town?',
    ans:'No, there aren\'t.',
    opts:['Yes, there are.','No, there aren\'t.','Yes, there is.','No, there isn\'t.']
  },
];

let isTherePool=[];
function renderEngIsThere(el){
  if(isTherePool.length===0) isTherePool=shuffle([...isThereScenes]);
  const q=isTherePool[engState.idx % isTherePool.length];
  el.innerHTML=`
    <p class="ex-intro">❓ ¡Survey the biome! Look at the town and answer:</p>
    <div class="reading-box" style="text-align:center;font-size:4rem;line-height:1.5;letter-spacing:14px">${q.mapLabel}</div>
    <div class="medium-question">${q.question}</div>
    <div class="options-grid" id="eng-opts" style="max-width:540px">
      ${shuffle(q.opts).map(o=>`<button class="opt-btn" style="font-size:.95rem" onclick="checkEngGeneric(this,\`${o}\`,\`${q.ans}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="eng-fb"></div>`;
  el.appendChild(renderNextBtn('eng',nextEng));
}

/* ── 4. Build sentences (word order) ── */
const sentenceTemplates=[
  { words:['There','is','a','museum','next to','the','hospital','.'],  correct:'There is a museum next to the hospital.' },
  { words:['There','is','a','park','opposite','the','school','.'],     correct:'There is a park opposite the school.' },
  { words:['There','are','two','banks','near','the','cinema','.'],     correct:'There are two banks near the cinema.' },
  { words:['Is','there','a','pharmacy','next to','the','hospital','?'],correct:'Is there a pharmacy next to the hospital?' },
  { words:['There','is','a','library','between','the','museum','and','the','bank','.'], correct:'There is a library between the museum and the bank.' },
  { words:['Are','there','any','restaurants','in','the','town','?'],   correct:'Are there any restaurants in the town?' },
  { words:['There','is','no','cinema','behind','the','park','.'],      correct:'There is no cinema behind the park.' },
  { words:['The','school','is','opposite','the','police station','.'], correct:'The school is opposite the police station.' },
];

let sentPool=[];
function renderEngSentences(el){
  if(sentPool.length===0) sentPool=shuffle([...sentenceTemplates]);
  const q=sentPool[engState.idx % sentPool.length];
  // Split into chunks and ask the student to tap words in order
  // Simplified: show scrambled words, pick the correct sentence from 3 wrong variants
  const scrambled=shuffle([...q.words]).join(' ');

  // Generate 3 wrong sentences by swapping 2 words
  function wrongVariant(ws){
    const w=[...ws]; const i=rand(0,w.length-2);[w[i],w[i+1]]=[w[i+1],w[i]]; return w.join(' ');
  }
  const opts=shuffle([q.correct, wrongVariant(q.words), wrongVariant(q.words), wrongVariant(q.words)]).slice(0,4);
  // ensure correct is in opts
  if(!opts.includes(q.correct)) opts[0]=q.correct;
  const finalOpts=shuffle(opts);

  el.innerHTML=`
    <p class="ex-intro">💬 ¡The villager sent a message! Choose the correct sentence:</p>
    <div class="reading-box" style="font-size:1.1rem;color:#6c5ce7">
      🔀 Words: <em>${scrambled}</em>
    </div>
    <div id="eng-opts" style="display:flex;flex-direction:column;gap:12px;max-width:600px;margin:14px auto">
      ${finalOpts.map(o=>`<button class="opt-btn" style="font-size:.95rem;text-align:left;padding:14px 18px" onclick="checkEngGeneric(this,\`${o}\`,\`${q.correct}\`)">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="eng-fb"></div>`;
  el.appendChild(renderNextBtn('eng',nextEng));
}

/* ── shared checker ── */


function checkEngGeneric(btn,val,ans){
  disableOpts('eng-opts');
  const fb=document.getElementById('eng-fb');
  achState.totalAnswered++;
  if(val===ans){
    btn.classList.add('correct');
    fb.textContent=mcMsg(MC_CORRECT_ENG); fb.className='feedback ok';
    playCorrect(); addStar(starsForCorrect()); engState.correct++; achState.totalCorrect++;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    fb.textContent=mcMsg(MC_WRONG_ENG)+ans; fb.className='feedback err';
    playWrong(); highlightCorrect('eng-opts',ans);
    onWrongAnswer();
  }
  engState.idx++;
  document.getElementById('eng-exercise').querySelector('.next-btn').style.display='block';
  checkAchievements();
}

/* ══════════════════════════════════════════════════════════
   SISTEMA DE AUTENTICACIÓN Y PERSISTENCIA (BACKEND + LOCAL)
══════════════════════════════════════════════════════════ */
let userToken = localStorage.getItem('estudio_kids_token') || null;
let selectedProfileName = '';
let selectedAvatar = '🧒';
let playerCoins = 0;
let playerInventory = [];
let playerStreakDays = 1;
let localProfilesCache = []; // Fallback local

let subjectStats = {
  math:    { total: 0, correct: 0 },
  lang:    { total: 0, correct: 0 },
  eng:     { total: 0, correct: 0 },
  science: { total: 0, correct: 0 },
  history: { total: 0, correct: 0 },
  parcial: { total: 0, correct: 0 },
  daily:   { total: 0, correct: 0 }
};

let sessionHistory = [];

function getAvatar(name){
  let h = 0;
  for(const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return USER_AVATARS[h % USER_AVATARS.length];
}

// 1. Obtener y Renderizar Perfiles (desde API o fallback Local)
async function renderUsersScreen(){
  const grid = document.getElementById('users-grid');
  if(!grid) return;
  
  grid.innerHTML = '<p class="ex-intro" style="grid-column: 1/-1; text-align: center;">⛏️ Cargando héroes locales...</p>';
  
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const dbUsers = await res.json();
      localProfilesCache = dbUsers.map(u => ({
        id: u.id,
        name: u.username,
        avatar: u.avatar || getAvatar(u.username),
        stars: u.stars || 0,
        unlocked: u.completed_sections && u.completed_sections.unlocked ? u.completed_sections.unlocked : []
      }));
    } else {
      throw new Error('API offline');
    }
  } catch (err) {
    console.warn('⚠️ No se pudo conectar al servidor local. Usando base de datos localStorage.', err);
    try {
      const localData = JSON.parse(localStorage.getItem('aprendo_profiles')) || [];
      localProfilesCache = localData.map(p => ({
        id: null,
        name: p.name,
        avatar: getAvatar(p.name),
        stars: p.stars || 0,
        unlocked: p.unlocked || []
      }));
    } catch {
      localProfilesCache = [];
    }
  }

  const sortedProfiles = [...localProfilesCache].sort((a,b) => b.stars - a.stars);

  grid.innerHTML = sortedProfiles.map(p => {
    const safeName = p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const badges = (p.unlocked||[]).slice(0,4).map(id=>{const a=ACHIEVEMENTS.find(x=>x.id===id);return a?a.emoji:'';}).join('');
    return `
      <div class="user-card" onclick="selectUser('${safeName}')">
        <button class="uc-delete" onclick="deleteProfile('${safeName}', ${p.id}, event)">✕</button>
        <span class="uc-avatar">${p.avatar}</span>
        <div class="uc-info">
          <div class="uc-name">${p.name}</div>
          <div class="uc-stars">💎 ${p.stars} diamantes</div>
          ${badges ? `<div class="uc-badges">${badges}</div>` : ''}
        </div>
        <span class="uc-arrow">▶</span>
      </div>
    `;
  }).join('') + `
    <div class="user-card user-card-new" onclick="newUser()">
      <span class="uc-avatar">⚔️</span>
      <div class="uc-name" style="text-align:center">+ ¡Nuevo Héroe!</div>
    </div>`;
}

// 2. Selección de Usuario (Muestra Modal PIN)
function selectUser(name){
  selectedProfileName = name;
  const p = localProfilesCache.find(x => x.name === name);
  if (!p) return;

  // Si no estamos conectados al backend (id es nulo), entramos directamente
  if (p.id === null) {
    playerName = p.name;
    // Carga de local storage fallback
    const localData = JSON.parse(localStorage.getItem('aprendo_profiles')) || [];
    const lp = localData.find(x => x.name === name) || {};
    stars = lp.stars || 0;
    achState.stars = stars;
    achState.totalCorrect = lp.totalCorrect || 0;
    achState.totalAnswered = lp.totalAnswered || 0;
    achState.mathSections = lp.mathSections || 0;
    achState.langSections = lp.langSections || 0;
    achState.engSections  = lp.engSections  || 0;
    achState.perfectSections = lp.perfectSections || 0;
    achState.hardSections = lp.hardSections || 0;
    achState.mediumSections = lp.mediumSections || 0;
    achState.unlocked = new Set(lp.unlocked || []);
    
    const sc = document.getElementById('star-count');
    if(sc) sc.textContent = stars;
    const dg = document.getElementById('diff-greeting');
    if(dg) dg.textContent = `⚔️ ¡${playerName} regresa al Overworld! ¡Elegí tu bioma!`;
    goToScreen('screen-difficulty');
    return;
  }

  // Si hay servidor, abrir modal de PIN
  const modal = document.getElementById('pin-modal');
  const title = document.getElementById('pin-modal-title');
  const errEl = document.getElementById('pin-login-error');
  
  if (errEl) errEl.style.display = 'none';
  if (title) title.innerHTML = `⚔️ AUTENTICAR HÉROE<br><span style="color:#5D9E3A">${p.avatar} ${p.name}</span>`;
  
  // Limpiar PIN typed y resetear dots
  const hiddenInput = document.getElementById('hidden-pin-input');
  if (hiddenInput) hiddenInput.value = '';
  renderPinDots(0);
  
  if (modal) modal.style.display = 'flex';
}

// Dibuja exactamente N dots rellenos (los ingresados) sin mostrar posiciones vacías
function renderPinDots(count) {
  const container = document.getElementById('pin-dots-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#4ade80;border:3px solid #000;box-shadow:0 0 8px #4ade80;transition:all 0.12s;transform:scale(1.1);flex-shrink:0;';
    container.appendChild(dot);
  }
}

// Botones del teclado interactivo
function typePin(val) {
  const hiddenInput = document.getElementById('hidden-pin-input');
  if (!hiddenInput) return;
  
  let pin = hiddenInput.value;
  if (val === 'clear') {
    pin = pin.slice(0, -1); // borrar solo el último dígito
  } else {
    if (pin.length < 6) pin += val;
  }
  hiddenInput.value = pin;
  renderPinDots(pin.length);
  
  // Reproducir un tonito voxel muy suave al clickear números
  _playTone([350 + (parseInt(val) || 0)*30], 0.04, 'sine', 0.1);
}

function closePinModal() {
  const modal = document.getElementById('pin-modal');
  if (modal) modal.style.display = 'none';
}

// Iniciar sesión haciendo fetch al servidor
async function submitPinLogin() {
  const hiddenInput = document.getElementById('hidden-pin-input');
  const errEl = document.getElementById('pin-login-error');
  if (!hiddenInput) return;
  
  const pin = hiddenInput.value;
  if (pin.length < 4) {
    if (errEl) {
      errEl.textContent = '⚠️ ¡El PIN debe tener al menos 4 números!';
      errEl.style.display = 'block';
    }
    playWrong();
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: selectedProfileName, pin })
    });
    
    const data = await res.json();
    if (res.ok) {
      // Éxito de login
      userToken = data.token;
      localStorage.setItem('estudio_kids_token', userToken);
      
      // Sincronizar estado global
      playerName = data.user.username;
      stars = data.user.stars;
      achState.stars = stars;
      achState.totalCorrect = data.user.score / 10; // score = stars * 10 aproximado
      
      const comp = data.user.completed_sections || {};
      achState.totalCorrect = comp.totalCorrect || 0;
      achState.totalAnswered = comp.totalAnswered || 0;
      achState.mathSections = comp.mathSections || 0;
      achState.langSections = comp.langSections || 0;
      achState.engSections  = comp.engSections  || 0;
      achState.perfectSections = comp.perfectSections || 0;
      achState.hardSections = comp.hardSections || 0;
      achState.mediumSections = comp.mediumSections || 0;
      achState.unlocked = new Set(comp.unlocked || []);
      
      const sc = document.getElementById('star-count');
      if (sc) sc.textContent = stars;
      
      closePinModal();
      
      const dg = document.getElementById('diff-greeting');
      if (dg) dg.textContent = `⚔️ ¡${playerName} regresa al Overworld! ¡Elegí tu bioma!`;
      
      goToScreen('screen-difficulty');
      playCorrect();
    } else {
      throw new Error(data.error || 'PIN incorrecto');
    }
  } catch (err) {
    if (errEl) {
      errEl.textContent = '❌ ' + err.message;
      errEl.style.display = 'block';
    }
    playWrong();
  }
}

// 3. Crear nuevo Héroe (Pantalla de Registro)
function newUser(){
  playerName = '';
  stars = 0;
  achState.stars = 0;
  achState.totalCorrect = 0;
  achState.totalAnswered = 0;
  achState.mathSections = 0;
  achState.langSections = 0;
  achState.engSections  = 0;
  achState.perfectSections = 0;
  achState.hardSections = 0;
  achState.mediumSections = 0;
  achState.unlocked = new Set();
  
  const sc = document.getElementById('star-count');
  if(sc) sc.textContent = 0;
  
  const inp = document.getElementById('player-name-input');
  if(inp) inp.value = '';
  
  const pinInp = document.getElementById('player-pin-input');
  if(pinInp) pinInp.value = '';
  
  const errEl = document.getElementById('register-error');
  if(errEl) errEl.style.display = 'none';

  selectedAvatar = '🧒';
  renderAvatarSelector();
  validateRegisterForm();
  goToScreen('screen-welcome');
}

// Selector visual de avatares emoji
function renderAvatarSelector() {
  const el = document.getElementById('avatar-selector');
  if (!el) return;
  
  el.innerHTML = USER_AVATARS.map(av => `
    <button class="opt-btn" onclick="selectAvatarEmoji('${av}', this)" style="font-size: 1.5rem; padding: 6px; width: 44px; height: 44px; border: 3px solid ${av === selectedAvatar ? 'var(--mc-gold)' : '#000'}; background: ${av === selectedAvatar ? '#5D9E3A' : '#334155'}; cursor: pointer;">
      ${av}
    </button>
  `).join('');
}

function selectAvatarEmoji(emoji, btn) {
  selectedAvatar = emoji;
  document.querySelectorAll('#avatar-selector button').forEach(b => {
    b.style.borderColor = '#000';
    b.style.background = '#334155';
  });
  btn.style.borderColor = 'var(--mc-gold)';
  btn.style.background = '#5D9E3A';
  _playTone([600], 0.05, 'sine', 0.15);
}

function validateRegisterForm() {
  const name = document.getElementById('player-name-input').value.trim();
  const pin = document.getElementById('player-pin-input').value.trim();
  const btn = document.getElementById('btn-welcome-next');
  if (btn) {
    btn.disabled = name.length < 2 || pin.length < 4;
  }
}

// Registrar nuevo héroe por la API
async function registerNewUser() {
  const name = document.getElementById('player-name-input').value.trim();
  const pin = document.getElementById('player-pin-input').value.trim();
  const errEl = document.getElementById('register-error');
  
  if (errEl) errEl.style.display = 'none';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, pin, avatar: selectedAvatar })
    });
    
    const data = await res.json();
    if (res.ok) {
      userToken = data.token;
      localStorage.setItem('estudio_kids_token', userToken);
      
      playerName = data.user.username;
      stars = data.user.stars;
      achState.stars = stars;
      
      const dg = document.getElementById('diff-greeting');
      if(dg) dg.textContent = `⚔️ ¡${playerName}, el Héroe! Elegí tu bioma de aventura:`;
      
      goToScreen('screen-difficulty');
      playCorrect();
    } else {
      throw new Error(data.error || 'Error al registrar.');
    }
  } catch (err) {
    // Fallback standalone local si no hay backend
    if (err.message === 'Failed to fetch' || err.message === 'API offline' || err.message.includes('fetch')) {
      console.warn('⚠️ Servidor local offline, registrando localmente...');
      playerName = name;
      stars = 0;
      userToken = null;
      localStorage.removeItem('estudio_kids_token');
      
      // Guardar localmente
      const profiles = JSON.parse(localStorage.getItem('aprendo_profiles')) || [];
      const exists = profiles.some(p => p.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        if(errEl){
          errEl.textContent = '❌ ¡Ese nombre de Héroe ya existe! Elige otro.';
          errEl.style.display = 'block';
        }
        playWrong();
        return;
      }
      
      saveProfile();
      
      const dg = document.getElementById('diff-greeting');
      if(dg) dg.textContent = `⚔️ ¡${playerName}, el Héroe! Elegí tu bioma de aventura:`;
      
      goToScreen('screen-difficulty');
      playCorrect();
    } else {
      if (errEl) {
        errEl.textContent = '❌ ' + err.message;
        errEl.style.display = 'block';
      }
      playWrong();
    }
  }
}

// 4. Guardar Perfil (API local + fallback LocalStorage)
async function saveProfile(){
  if(!playerName) return;
  
  // Guardado en fallback local
  const profiles = JSON.parse(localStorage.getItem('aprendo_profiles')) || [];
  const idx = profiles.findIndex(p => p.name === playerName);
  const profile = {
    name: playerName,
    stars: stars,
    totalCorrect: achState.totalCorrect,
    totalAnswered: achState.totalAnswered,
    mathSections: achState.mathSections,
    langSections: achState.langSections,
    engSections: achState.engSections,
    perfectSections: achState.perfectSections,
    hardSections: achState.hardSections,
    mediumSections: achState.mediumSections,
    unlocked: [...achState.unlocked],
    lastPlayed: Date.now()
  };
  if(idx >= 0) profiles[idx] = profile; else profiles.push(profile);
  localStorage.setItem('aprendo_profiles', JSON.stringify(profiles));
  
  // Guardado en base de datos SQLite por la API (si hay token)
  if (userToken) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({
          stars: stars,
          score: stars * 10,
          completed_sections: {
            totalCorrect: achState.totalCorrect,
            totalAnswered: achState.totalAnswered,
            mathSections: achState.mathSections,
            langSections: achState.langSections,
            engSections: achState.engSections,
            perfectSections: achState.perfectSections,
            hardSections: achState.hardSections,
            mediumSections: achState.mediumSections,
            unlocked: [...achState.unlocked]
          }
        })
      });
    } catch (err) {
      console.error('⚠️ Sincronización en la nube local fallida:', err);
    }
  }
}

// 5. Borrar Perfil (API + local)
async function deleteProfile(name, dbId, event){
  event.stopPropagation();
  if(!confirm(`¿Borrar el perfil de Héroe de ${name}? Se perderán todos sus trofeos y diamantes.`)) return;
  
  // Borrar localmente
  const profiles = (JSON.parse(localStorage.getItem('aprendo_profiles')) || []).filter(p => p.name !== name);
  localStorage.setItem('aprendo_profiles', JSON.stringify(profiles));
  
  // Borrar en base de datos SQLite si tiene dbId
  if (dbId) {
    try {
      await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dbId })
      });
    } catch (err) {
      console.error('⚠️ Error al eliminar en base de datos relacional:', err);
    }
  }
  
  renderUsersScreen();
  _playTone([180, 120], 0.15, 'sawtooth', 0.15);
}

// 6. Obtener Ranking desde la base de datos centralizada SQLite
async function renderRanking(){
  const container = document.getElementById('ranking-container');
  if(!container) return;
  
  container.innerHTML = '<p class="ex-intro" style="text-align:center;margin-top:12px">📊 Cargando ranking general...</p>';
  
  let rankingData = [];
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      rankingData = await res.json();
    } else {
      throw new Error('Leaderboard offline');
    }
  } catch (err) {
    // Fallback ranking local
    const localData = JSON.parse(localStorage.getItem('aprendo_profiles')) || [];
    rankingData = localData.map(p => ({
      username: p.name,
      avatar: getAvatar(p.name),
      stars: p.stars || 0,
      score: p.stars * 10
    })).sort((a,b) => b.stars - a.stars);
  }
  
  if(rankingData.length === 0){
    container.innerHTML = '<p class="ex-intro" style="text-align:center;margin-top:12px">Todavía no hay jugadores registrados.</p>';
    return;
  }
  
  const medals = ['🥇','🥈','🥉'];
  container.innerHTML = `
    <table class="ranking-table">
      <thead><tr>
        <th>#</th><th>Jugador</th><th>⭐ Estrellas</th><th>💎 Puntos</th>
      </tr></thead>
      <tbody>
        ${rankingData.map((p,i) => `
          <tr class="${p.username === playerName ? 'rank-me' : ''}">
            <td class="rank-pos">${medals[i] || i+1}</td>
            <td class="rank-name">${p.avatar} ${p.username}${p.username===playerName?' ◀':''}</td>
            <td>${p.stars}</td>
            <td>${p.score || p.stars * 10}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

/* ── init ── */
renderUsersScreen();
selectLangBook(1);   // carga los temas del cuadernillo 1 al iniciar
/* ══════════════════════════════════════════════════════════
/* ══════════════════════════════════════════════════════════
   SECCIÓN PARCIAL
   Temas: Lengua (comprensión, escritura, sustantivos, adjetivos)
          Mate   (leer/escribir nros, orden/secuencias, mental, problemas)
══════════════════════════════════════════════════════════ */

/* ── Estado ── */
let parcialState = {};



function loadParcial(topic){
  const label = PARCIAL_TOPIC_LABELS[topic] || topic;
  goToExerciseScreen('parcial', label);
  
  // Obtener el pool de preguntas estáticas correspondientes al tema
  let pool = null;
  if(topic === 'p_comprension')     pool = P_TEXTOS;
  if(topic === 'p_escritura')       pool = P_ESCRITURA_Q;
  if(topic === 'p_sustantivos')     pool = P_SUST_Q;
  if(topic === 'p_adjetivos')       pool = P_ADJ_Q;
  if(topic === 'p_orden')           pool = P_ORDEN_Q;
  if(topic === 'p_problema')        pool = P_PROBLEMA_GEN;
  if(topic === 'p_eng_vocab')       pool = P_ENG_VOCAB_Q;
  if(topic === 'p_eng_grammar')     pool = P_ENG_GRAMMAR_Q;
  if(topic === 'p_eng_doquestions') pool = P_ENG_DOQUES_Q;
  if(topic === 'p_eng_where')       pool = P_ENG_WHERE_Q;
  if(topic === 'p_eng_reading')     pool = P_ENG_READING_TEXTS;
  if(topic === 'p_eng_types')       pool = P_ENG_TYPES_Q;
  if(topic === 'p_eng_truefalse')   pool = P_ENG_TF_Q;
  if(topic === 'p_eng_writesent')   pool = P_ENG_WRITESENT_Q;
  if(topic === 'p_eng_describe')    pool = P_ENG_DESCRIBE_Q;

  // Si el tema tiene un pool estático, mezclar las preguntas y guardarlas en el estado
  let questions = null;
  let total = 8;
  if (pool) {
    questions = shuffle(pool);
    total = Math.min(8, questions.length);
  }

  parcialState = { topic, idx:0, total, correct:0, questions };
  updateProgress('parcial', 0);
  _lastSec = 'parcial'; _lastRewardTopic = topic;
  initLives();
  nextParcial();
}

function nextParcial(){
  if(parcialState.idx >= parcialState.total){
    finishSection('parcial', parcialState.correct, parcialState.total);
    return;
  }
  updateProgress('parcial', parcialState.idx / parcialState.total * 100);
  const el = document.getElementById('parcial-exercise');
  el.innerHTML = '';
  const t = parcialState.topic;
  if(t === 'p_comprension')     renderPComprension(el);
  if(t === 'p_escritura')       renderPEscritura(el);
  if(t === 'p_sustantivos')     renderPSustantivos(el);
  if(t === 'p_adjetivos')       renderPAdjetivos(el);
  if(t === 'p_numread')         renderPNumRead(el);
  if(t === 'p_orden')           renderPOrden(el);
  if(t === 'p_mental')          renderPMental(el);
  if(t === 'p_problema')        renderPProblema(el);
  if(t === 'p_eng_vocab')       renderPEngVocab(el);
  if(t === 'p_eng_grammar')     renderPEngGrammar(el);
  if(t === 'p_eng_doquestions') renderPEngDoQuestions(el);
  if(t === 'p_eng_where')       renderPEngWhere(el);
  if(t === 'p_eng_reading')     renderPEngReading(el);
  if(t === 'p_eng_match')       renderPEngMatch(el);
  if(t === 'p_eng_spell')       renderPEngSpell(el);
  if(t === 'p_eng_spellsent')   renderPEngSpellSent(el);
  if(t === 'p_eng_pickanimal')  renderPEngPickAnimal(el);
  if(t === 'p_eng_habitats')    renderPEngHabitats(el);
  if(t === 'p_eng_dodoes_photo')renderPEngDoDoesPhoto(el);
  if(t === 'p_eng_types')       renderPEngTypes(el);
  if(t === 'p_eng_truefalse')   renderPEngTrueFalse(el);
  if(t === 'p_eng_writesent')   renderPEngWriteSent(el);
  if(t === 'p_eng_describe')    renderPEngDescribe(el);
  if(t === 'p_eng_bodyparts')   renderPEngBodyParts(el);
}

/* helper genérico de check para parcial */
function checkParcial(btn, chosen, correct){
  const fb = document.getElementById('parcial-fb');
  disableOpts('parcial-opts');
  highlightCorrect('parcial-opts', correct);
  parcialState.idx++;
  achState.totalAnswered++;
  if(chosen === correct){
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect());
    playCorrect();
    btn.classList.add('correct');
    if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]}</span>`;
    onCorrectAnswer();
  } else {
    playWrong();
    btn.classList.add('wrong');
    if(fb) fb.innerHTML = `<span class="fb-wrong">${pick(MC_WRONG,1)[0]}</span><br><small>✔ Era: <b>${correct}</b></small>`;
    onWrongAnswer();
  }
  checkAchievements();
}

/* template HTML de pregunta parcial */
function pqHtml(intro, question, opts, ans, extraHtml=''){
  return `
    <p class="ex-intro">${intro}</p>
    ${extraHtml}
    <div class="medium-question" style="margin:10px 0 14px">${question}</div>
    <div class="options-grid" id="parcial-opts">
      ${shuffle(opts).map(o=>`<button class="opt-btn" onclick="checkParcial(this,'${o.replace(/'/g,"\\'")}','${ans.replace(/'/g,"\\'")}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
}

/* ─────────────────────────────────────────────────────
   LENGUA — 1. Lectura y comprensión de textos breves
───────────────────────────────────────────────────── */


function renderPComprension(el){
  const questionsList = parcialState.questions || P_TEXTOS;
  const texto = questionsList[parcialState.idx % questionsList.length];
  const pIdx  = parcialState.idx % texto.preguntas.length;
  const p     = texto.preguntas[pIdx];
  el.innerHTML = pqHtml(
    '📖 Lee el texto y respondé:',
    p.q,
    p.opts, p.ans,
    `<div class="reading-box" style="font-size:0.62rem;margin-bottom:10px;line-height:1.8">${texto.texto}</div>`
  );
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   LENGUA — 2. Escritura de palabras y oraciones
   ───────────────────────────────────────────────────── */


function renderPEscritura(el){
  const questionsList = parcialState.questions || P_ESCRITURA_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, '', q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   LENGUA — 3. Sustantivos propios y comunes
   ───────────────────────────────────────────────────── */


function renderPSustantivos(el){
  const questionsList = parcialState.questions || P_SUST_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, '', q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   LENGUA — 4. Adjetivos
   ───────────────────────────────────────────────────── */


function renderPAdjetivos(el){
  const questionsList = parcialState.questions || P_ADJ_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, '', q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   MATEMÁTICA — 1. Lectura y escritura de números
───────────────────────────────────────────────────── */
function renderPNumRead(el){
  const mode = rand(0,2);
  const n = rand(10, 999);
  let intro, question, opts, ans;

  if(mode === 0){
    // Número → palabra
    ans = numToWord(n);
    const distractors = [rand(10,999), rand(10,999), rand(10,999)]
      .filter(x=>x!==n).slice(0,3).map(x=>numToWord(x));
    opts = shuffle([ans, ...distractors]);
    intro = '🔢 ¿Cómo se escribe este número con letras?';
    question = `<div class="big-question">${n}</div>`;
  } else if(mode === 1){
    // Palabra → número
    ans = String(n);
    const distractors = [rand(10,999), rand(10,999), rand(10,999)]
      .filter(x=>x!==n).slice(0,3).map(String);
    opts = shuffle([ans, ...distractors]);
    intro = '🔢 ¿Cuál es el número que dice el libro?';
    question = `<div class="big-question" style="font-size:1.1rem">${numToWord(n)}</div>`;
  } else {
    // ¿Cuántas cifras tiene?
    const cifras = String(n).length;
    ans = String(cifras);
    opts = shuffle(['1','2','3','4']).slice(0,4);
    if(!opts.includes(ans)) opts[3] = ans;
    opts = shuffle(opts);
    intro = '🔢 ¿Cuántas cifras (dígitos) tiene este número?';
    question = `<div class="big-question">${n}</div>`;
  }
  el.innerHTML = `
    <p class="ex-intro">${intro}</p>
    ${question}
    <div class="options-grid" id="parcial-opts">
      ${opts.map(o=>`<button class="opt-btn" onclick="checkParcial(this,${JSON.stringify(o)},${JSON.stringify(ans)})">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   MATEMÁTICA — 2. Orden numérico y secuencias
───────────────────────────────────────────────────── */


function renderPOrden(el){
  const questionsList = parcialState.questions || P_ORDEN_Q;
  const gen = questionsList[parcialState.idx];
  const q = gen();
  el.innerHTML = pqHtml(q.intro, '', q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   MATEMÁTICA — 3. Cálculo mental
───────────────────────────────────────────────────── */
function renderPMental(el){
  const tipo = rand(0,4);
  let intro, ans, opts;

  if(tipo===0){
    // suma simple
    const a=rand(5,50), b=rand(5,50);
    ans=String(a+b);
    const d=[a+b-1,a+b+1,a+b+10].map(String);
    intro=`🧠 ¿Cuánto es ${a} + ${b}?`;
    opts=shuffle([ans,...d]).slice(0,4);
  } else if(tipo===1){
    // resta
    const b=rand(5,40), a=rand(b+1,b+50);
    ans=String(a-b);
    const d=[a-b+1,a-b-1,a-b+10].map(String);
    intro=`🧠 ¿Cuánto es ${a} − ${b}?`;
    opts=shuffle([ans,...d]).slice(0,4);
  } else if(tipo===2){
    // doble
    const a=rand(5,50);
    ans=String(a*2);
    const d=[a*2-1,a*2+1,a*2+2].map(String);
    intro=`🧠 ¿Cuál es el DOBLE de ${a}?`;
    opts=shuffle([ans,...d]).slice(0,4);
  } else if(tipo===3){
    // mitad (número par)
    const a=rand(2,50)*2;
    ans=String(a/2);
    const d=[a/2-1,a/2+1,a/2+2].map(String);
    intro=`🧠 ¿Cuál es la MITAD de ${a}?`;
    opts=shuffle([ans,...d]).slice(0,4);
  } else {
    // completar suma: a + ? = total
    const total=rand(15,80), a=rand(5,total-5);
    const b=total-a;
    ans=String(b);
    const d=[b-1,b+1,b+5].map(String);
    intro=`🧠 ${a} + ___ = ${total} ¿Qué número falta?`;
    opts=shuffle([ans,...d]).slice(0,4);
  }

  el.innerHTML=`
    <p class="ex-intro">${intro}</p>
    <div class="options-grid" id="parcial-opts">
      ${opts.map(o=>`<button class="opt-btn" onclick="checkParcial(this,'${o}','${ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   MATEMÁTICA — 4. Situaciones problemáticas
───────────────────────────────────────────────────── */


function renderPProblema(el){
  const questionsList = parcialState.questions || P_PROBLEMA_GEN;
  const gen = questionsList[parcialState.idx];
  const { prob, ans, opts } = gen();
  const uniqOpts = [...new Set(opts)];
  while(uniqOpts.length < 4) uniqOpts.push(String(parseInt(ans)+uniqOpts.length+2));
  el.innerHTML=`
    <p class="ex-intro">📝 Leé el problema y elegí la respuesta:</p>
    <div class="reading-box" style="font-size:0.65rem;margin-bottom:12px;line-height:1.8">${prob}</div>
    <div class="options-grid" id="parcial-opts">
      ${shuffle(uniqOpts.slice(0,4)).map(o=>`<button class="opt-btn" onclick="checkParcial(this,'${o}','${ans}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}


/* ══════════════════════════════════════════════════════════
   INGLÉS PARCIAL — Unit 5: Where do they live? (Bright Ideas 2)
══════════════════════════════════════════════════════════ */

/* helper: caja de texto en inglés */
function pEngBox(text){
  return `<div class="reading-box" style="font-size:0.62rem;line-height:2;margin-bottom:12px;border-color:#4ade80">${text}</div>`;
}

/* ─────────────────────────────────────────────────────
   1. Vocabulario — animales, hábitats, acciones, tipos
───────────────────────────────────────────────────── */


function renderPEngVocab(el){
  const questionsList = parcialState.questions || P_ENG_VOCAB_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, q.q, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   2. Gramática — Presente Simple afirmativo y negativo
   ───────────────────────────────────────────────────── */


function renderPEngGrammar(el){
  const questionsList = parcialState.questions || P_ENG_GRAMMAR_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, q.q, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   3. Preguntas Do / Does + respuestas cortas
   ───────────────────────────────────────────────────── */


function renderPEngDoQuestions(el){
  const questionsList = parcialState.questions || P_ENG_DOQUES_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, q.q, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   4. Where does/do + Can / Can't
───────────────────────────────────────────────────── */


function renderPEngWhere(el){
  const questionsList = parcialState.questions || P_ENG_WHERE_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, q.q, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   5. Comprensión lectora — textos Unit 5
   ───────────────────────────────────────────────────── */


function renderPEngReading(el){
  const questionsList = parcialState.questions || P_ENG_READING_TEXTS;
  const textObj = questionsList[parcialState.idx % questionsList.length];
  const qIdx    = parcialState.idx % textObj.qs.length;
  const q       = textObj.qs[qIdx];
  el.innerHTML  = pqHtml(
    '📖 Read and answer:',
    q.q,
    q.opts, q.ans,
    pEngBox(`<strong>${textObj.title}</strong><br><br>${textObj.text}`)
  );
  el.appendChild(renderNextBtn('parcial', nextParcial));
}



/* ══════════════════════════════════════════════════════════
   MATCH THE ANIMAL — emoji grande + pista → elegir nombre
   SPELL THE ANIMAL — emoji → letras desordenadas → armar palabra
   Animales: lion, zebra, giraffe, crocodile, monkey,
             shark, whale, hippo, penguin, elephant
══════════════════════════════════════════════════════════ */



/* ── 1. Match the Animal ── */
function renderPEngMatch(el){
  // elige 1 animal correcto + 3 distractores
  const shuffled = shuffle([...ANIMALS]);
  const correct  = shuffled[0];
  const opts     = shuffle([correct.name, shuffled[1].name, shuffled[2].name, shuffled[3].name]);

  el.innerHTML = `
    <p class="ex-intro">🐾 Look at the animal and choose the correct name!</p>
    <div class="animal-card">
      <div class="animal-emoji-big">${correct.emoji}</div>
      <div class="animal-habitat-hint">${correct.hint}</div>
    </div>
    <div class="options-grid" id="parcial-opts">
      ${opts.map(o => `<button class="opt-btn" style="font-size:0.85rem;letter-spacing:1px"
        onclick="checkParcial(this,'${o}','${correct.name}')">${o}</button>`).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ── 2. Spell the Animal ── */
// Estado del ejercicio de spelling
let _spellState = { word:'', picked:[], letters:[] };

function renderPEngSpell(el){
  const animal = ANIMALS[parcialState.idx % ANIMALS.length];
  const word   = animal.name;

  // Mezclar letras — garantizar que no queden en orden
  let letters;
  do { letters = shuffle([...word]); }
  while(letters.join('') === word);

  _spellState = { word, picked: [], letters: [...letters] };

  el.innerHTML = `
    <p class="ex-intro">🔤 Tap the letters in the right order to spell the animal!</p>
    <div class="animal-card">
      <div class="animal-emoji-big">${animal.emoji}</div>
      <div class="animal-habitat-hint">${animal.hint}</div>
    </div>
    <div class="spell-answer-row" id="spell-answer">
      ${word.split('').map(() => `<div class="spell-slot"></div>`).join('')}
    </div>
    <div class="spell-tiles" id="spell-tiles">
      ${letters.map((l, i) =>
        `<div class="spell-tile" id="stile-${i}" onclick="pickSpellLetter(${i},'${l}','${word}')">${l}</div>`
      ).join('')}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function pickSpellLetter(idx, letter, word){
  if(_spellState.picked.includes(idx)) return;          // ya usada
  const fb = document.getElementById('parcial-fb');
  if(fb && fb.innerHTML) return;                         // ya evaluado

  _spellState.picked.push(idx);
  const pos = _spellState.picked.length - 1;

  // marcar tile como usada
  const tile = document.getElementById('stile-'+idx);
  if(tile) tile.classList.add('used');

  // rellenar slot
  const slots = document.querySelectorAll('.spell-slot');
  if(slots[pos]){
    slots[pos].textContent = letter;
    slots[pos].classList.add('filled');
  }

  // verificar cuando se llenaron todos los slots
  if(_spellState.picked.length === word.length){
    const attempt = _spellState.picked.map(i => _spellState.letters[i]).join('');
    const isCorrect = attempt === word;

    parcialState.idx++;
    achState.totalAnswered++;

    if(isCorrect){
      parcialState.correct++;
      achState.totalCorrect++;
      addStar(starsForCorrect());
      playCorrect();
      onCorrectAnswer();
      // colorear slots en verde
      document.querySelectorAll('.spell-slot').forEach(s => { s.style.borderColor='#4ade80'; s.style.background='#1a3a1a'; });
      if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]}</span>`;
    } else {
      playWrong();
      onWrongAnswer();
      // mostrar la palabra correcta en rojo → verde
      document.querySelectorAll('.spell-slot').forEach((s,i) => {
        s.style.borderColor = '#f87171'; s.style.background = '#3a1a1a';
      });
      if(fb) fb.innerHTML = `<span class="fb-wrong">❌ Not quite! The answer is <b>${word}</b></span>`;
    }

    checkAchievements();
    // mostrar el botón siguiente
    const nxt = document.querySelector('#parcial-exercise .next-btn');
    if(nxt) nxt.style.display = 'block';
  }
}



/* ══════════════════════════════════════════════════════════
   SPELL THE WORDS — animal emoji + múltiples grupos de letras
   Cada grupo forma una palabra; el chico arma cada palabra
   tocando letras en orden. Basado en Unit 5 Bright Ideas 2.
══════════════════════════════════════════════════════════ */

/* Datos: cada entrada tiene el animal y las palabras a deletrear */


/* Estado del ejercicio multi-grupo */
let _ssState = {
  words: [],      // array de palabras a deletrear
  groups: [],     // por cada palabra: { letters:[], picked:[], done:false }
  allDone: false,
};

function renderPEngSpellSent(el){
  const entry = SPELL_SENT_DATA[parcialState.idx % SPELL_SENT_DATA.length];

  // construir grupos: letras mezcladas por cada palabra
  const groups = entry.words.map(word => {
    let letters;
    if(word.length <= 2){
      // palabras muy cortas (a, in): mostrar directamente sin mezclar
      letters = [...word];
    } else {
      do { letters = shuffle([...word]); } while(letters.join('') === word);
    }
    return { word, letters, picked: [], done: false };
  });

  _ssState = { words: entry.words, groups, allDone: false };

  // construir HTML de los grupos
  const groupsHtml = groups.map((g, gi) => `
    <div class="ss-group" id="ssgroup-${gi}">
      <div class="spell-tiles" id="ss-tiles-${gi}">
        ${g.letters.map((l, li) =>
          `<div class="spell-tile" id="sstile-${gi}-${li}"
            onclick="pickSSTile(${gi},${li},'${l}')">${l}</div>`
        ).join('')}
      </div>
      <div class="spell-answer-row" id="ss-answer-${gi}">
        ${g.word.split('').map(() => `<div class="spell-slot"></div>`).join('')}
      </div>
    </div>`
  ).join('');

  el.innerHTML = `
    <p class="ex-intro">🔡 Tap the letters to spell each word about this animal!</p>
    <div class="animal-card">
      <div class="animal-emoji-big">${entry.animal.emoji}</div>
      <div class="animal-habitat-hint">${entry.animal.name}</div>
    </div>
    <div class="ss-groups-wrap" id="ss-groups-wrap">
      ${groupsHtml}
    </div>
    <div class="feedback" id="parcial-fb"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function pickSSTile(gi, li, letter){
  const g   = _ssState.groups[gi];
  if(!g || g.done)              return;  // grupo ya completado
  if(g.picked.includes(li))     return;  // tile ya usada
  const fb = document.getElementById('parcial-fb');
  if(_ssState.allDone)          return;  // todo ya evaluado

  g.picked.push(li);
  const pos = g.picked.length - 1;

  // marcar tile
  const tile = document.getElementById(`sstile-${gi}-${li}`);
  if(tile) tile.classList.add('used');

  // rellenar slot
  const slots = document.querySelectorAll(`#ss-answer-${gi} .spell-slot`);
  if(slots[pos]){
    slots[pos].textContent = letter;
    slots[pos].classList.add('filled');
  }

  // si se completó este grupo, verificar la palabra
  if(g.picked.length === g.word.length){
    const attempt = g.picked.map(i => g.letters[i]).join('');
    g.done = true;
    const correct = attempt === g.word;

    document.querySelectorAll(`#ss-answer-${gi} .spell-slot`).forEach(s => {
      s.style.borderColor = correct ? '#4ade80' : '#f87171';
      s.style.background  = correct ? '#1a3a1a' : '#3a1a1a';
    });

    if(!correct){
      // mostrar la palabra correcta en el slot (texto rojo)
      const slotsArr = document.querySelectorAll(`#ss-answer-${gi} .spell-slot`);
      g.word.split('').forEach((ch, i) => {
        if(slotsArr[i]){ slotsArr[i].textContent = ch; }
      });
    }

    // verificar si TODOS los grupos están listos
    const allGroupsDone = _ssState.groups.every(gr => gr.done);
    if(allGroupsDone){
      _ssState.allDone = true;
      const allCorrect = _ssState.groups.every(gr => {
        const attempt2 = gr.picked.map(i => gr.letters[i]).join('');
        return attempt2 === gr.word;
      });

      parcialState.idx++;
      achState.totalAnswered++;

      if(allCorrect){
        parcialState.correct++;
        achState.totalCorrect++;
        addStar(starsForCorrect());
        playCorrect();
        onCorrectAnswer();
        if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]}</span>`;
      } else {
        playWrong();
        onWrongAnswer();
        if(fb) fb.innerHTML = `<span class="fb-wrong">❌ Check the highlighted words!</span>`;
      }

      checkAchievements();
      const nxt = document.querySelector('#parcial-exercise .next-btn');
      if(nxt) nxt.style.display = 'block';
    }
  }
}


/* ══════════════════════════════════════════════════════════
   PICK THE ANIMAL — tarjetas visuales (Inglés Parcial)
   Muestra una oración descriptiva y el alumno elige entre
   2 tarjetas de animales cuál encaja con la descripción.
══════════════════════════════════════════════════════════ */

/* Paleta de colores para las tarjetas (rotan aleatoriamente) */


/* Base de datos: cada entrada tiene la oración, el animal correcto
   y un array de distractores (se elige 1 al azar) */


function renderPEngPickAnimal(el){
  const allQ   = shuffle(P_ENG_PICK_Q);
  const q      = allQ[parcialState.idx % P_ENG_PICK_Q.length];
  const distractor = pick(q.wrong, 1)[0];

  // Elegir colores distintos para cada tarjeta
  const colPair = shuffle(PICK_COLORS).slice(0, 2);

  // Orden aleatorio de tarjetas
  const cards = shuffle([
    { animal: q.correct,  isCorrect: true,  color: colPair[0] },
    { animal: distractor, isCorrect: false, color: colPair[1] },
  ]);

  const cardsHtml = cards.map((c, i) => `
    <button class="pick-card" id="pick-card-${i}"
            style="background:${c.color}"
            onclick="checkPickAnimal(${i}, ${c.isCorrect})">
      <span class="pc-emoji">${c.animal.emoji}</span>
      <span class="pc-name">${c.animal.name}</span>
    </button>`).join('');

  el.innerHTML = `
    <p class="ex-intro">🖼️ Read the sentence — tap the right animal!</p>
    <div class="pick-sentence">${q.sentence}</div>
    <div class="pick-grid" id="pick-grid">${cardsHtml}</div>
    <div class="feedback" id="parcial-fb" style="margin-top:8px"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function checkPickAnimal(cardIdx, isCorrect){
  // Deshabilitar ambas tarjetas
  document.querySelectorAll('.pick-card').forEach(c => c.disabled = true);

  const fb = document.getElementById('parcial-fb');
  parcialState.idx++;
  achState.totalAnswered++;

  const clickedCard = document.getElementById('pick-card-' + cardIdx);

  if(isCorrect){
    clickedCard.classList.add('pick-correct');
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect());
    playCorrect();
    if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]}</span>`;
    onCorrectAnswer();
  } else {
    clickedCard.classList.add('pick-wrong');
    // Resaltar la correcta
    document.querySelectorAll('.pick-card').forEach(c => {
      if(!c.classList.contains('pick-wrong')) c.classList.add('pick-correct');
    });
    playWrong();
    if(fb) fb.innerHTML = `<span class="fb-wrong">${pick(MC_WRONG,1)[0]}</span>`;
    onWrongAnswer();
  }

  checkAchievements();
  const nxt = document.querySelector('#parcial-exercise .next-btn');
  if(nxt) nxt.style.display = 'block';
}

/* ══════════════════════════════════════════════════════════
   NUEVO 1: MATCH THE HABITATS (Paleta superior y casilleros + fotos)
══════════════════════════════════════════════════════════ */


let _selectedHabChip = null;
let _habPlaced = {}; // { index: habId }

function renderPEngHabitats(el){
  _selectedHabChip = null;
  _habPlaced = {};

  // Orden de los hábitats en la paleta superior (mezclado o fijo estilizado)
  const paletteHabs = [...HABITAT_DATA];

  // Orden aleatorio de las tarjetas/imágenes en el tablero de abajo
  const dropHabs = shuffle([...HABITAT_DATA]);
  window._currentDropHabs = dropHabs;

  const paletteHtml = paletteHabs.map(h => `
    <div class="hab-chip" id="hab-chip-${h.id}"
         style="background:${h.color}"
         onclick="selectHabChip('${h.id}')">
      ${h.name}
    </div>`).join('');

  const gridHtml = dropHabs.map((h, i) => `
    <div class="hab-drop-card" id="hab-card-${i}">
      <div class="hab-slot" id="hab-slot-${i}" onclick="placeHabChip(${i})">
        <span class="hab-slot-placeholder">⬇️ Tap here to place</span>
      </div>
      <div class="hab-img-box">
        ${h.svg}
      </div>
    </div>`).join('');

  el.innerHTML = `
    <p class="ex-intro">🏞️ Match each habitat name to its landscape picture!</p>
    <div class="habitat-palette" id="habitat-palette">
      ${paletteHtml}
    </div>
    <div class="hab-grid-drop" id="hab-grid-drop">
      ${gridHtml}
    </div>
    <div class="feedback" id="parcial-fb" style="margin-top:10px"></div>`;

  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function selectHabChip(habId){
  // Si ya fue colocado en todos lados, ignorar
  const chipEl = document.getElementById('hab-chip-' + habId);
  if(chipEl && chipEl.classList.contains('used')) return;

  if(_selectedHabChip === habId){
    _selectedHabChip = null;
    document.querySelectorAll('.hab-chip').forEach(c => c.classList.remove('selected'));
    return;
  }
  _selectedHabChip = habId;
  document.querySelectorAll('.hab-chip').forEach(c => c.classList.remove('selected'));
  if(chipEl) chipEl.classList.add('selected');
}

function placeHabChip(slotIndex){
  const targetHab = window._currentDropHabs[slotIndex];
  const slotEl = document.getElementById('hab-slot-' + slotIndex);
  const fb = document.getElementById('parcial-fb');

  // Si ya tiene algo colocado y no hay chip seleccionado, quitarlo para volver a intentar
  if(_habPlaced[slotIndex] && !_selectedHabChip){
    const prevId = _habPlaced[slotIndex];
    delete _habPlaced[slotIndex];
    const prevChip = document.getElementById('hab-chip-' + prevId);
    if(prevChip) prevChip.classList.remove('used');
    slotEl.innerHTML = `<span class="hab-slot-placeholder">⬇️ Tap here to place</span>`;
    slotEl.style.background = '#fafafa';
    return;
  }

  if(!_selectedHabChip) {
    if(fb) fb.innerHTML = `<span class="fb-ok">💡 First select a habitat from the top bar!</span>`;
    return;
  }

  const chosenHab = HABITAT_DATA.find(h => h.id === _selectedHabChip);

  // Si este slot ya tenía otro chip, liberar el viejo
  if(_habPlaced[slotIndex]){
    const prevId = _habPlaced[slotIndex];
    const prevChip = document.getElementById('hab-chip-' + prevId);
    if(prevChip) prevChip.classList.remove('used');
  }

  // Si este chip estaba puesto en otro slot, vaciar ese otro slot
  Object.keys(_habPlaced).forEach(idx => {
    if(_habPlaced[idx] === _selectedHabChip && parseInt(idx) !== slotIndex){
      delete _habPlaced[idx];
      const otherSlot = document.getElementById('hab-slot-' + idx);
      if(otherSlot) {
        otherSlot.innerHTML = `<span class="hab-slot-placeholder">⬇️ Tap here to place</span>`;
        otherSlot.style.background = '#fafafa';
      }
    }
  });

  _habPlaced[slotIndex] = _selectedHabChip;
  slotEl.innerHTML = `
    <div class="hab-slot-filled" style="background:${chosenHab.color}">
      ${chosenHab.name} ✕
    </div>`;

  // Marcar chip como usado
  const activeChip = document.getElementById('hab-chip-' + _selectedHabChip);
  if(activeChip){
    activeChip.classList.remove('selected');
    activeChip.classList.add('used');
  }
  _selectedHabChip = null;

  // Verificar si se completaron los 6
  if(Object.keys(_habPlaced).length === 6){
    checkAllHabitats();
  }
}

function checkAllHabitats(){
  const fb = document.getElementById('parcial-fb');
  let allCorrect = true;

  window._currentDropHabs.forEach((targetHab, idx) => {
    const placedId = _habPlaced[idx];
    const cardEl = document.getElementById('hab-card-' + idx);
    const slotEl = document.getElementById('hab-slot-' + idx);
    if(placedId === targetHab.id){
      if(cardEl) cardEl.style.borderColor = '#22c55e';
    } else {
      allCorrect = false;
      if(cardEl) cardEl.style.borderColor = '#ef4444';
    }
    if(slotEl) slotEl.onclick = null;
  });

  document.querySelectorAll('.hab-chip').forEach(c => c.onclick = null);

  parcialState.idx++;
  achState.totalAnswered++;

  if(allCorrect){
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect() * 2);
    playCorrect();
    if(fb) fb.innerHTML = `<span class="fb-ok">🏆 EXCELLENT! All 6 habitats matched perfectly!</span>`;
    onCorrectAnswer();
  } else {
    playWrong();
    if(fb) fb.innerHTML = `<span class="fb-wrong">❌ Check the red borders! Some habitats were in the wrong spot.</span>`;
    onWrongAnswer();
  }

  checkAchievements();
  const nxt = document.querySelector('#parcial-exercise .next-btn');
  if(nxt) nxt.style.display = 'block';
}

/* ══════════════════════════════════════════════════════════
   NUEVO 2: DO/DOES WITH BIG PHOTO (YES, THEY DO / NO, THEY DON'T)
══════════════════════════════════════════════════════════ */


function renderPEngDoDoesPhoto(el){
  const q = DO_DOES_PHOTO_QS[parcialState.idx % DO_DOES_PHOTO_QS.length];

  // Generar los 2 botones: YES, THEY DO / NO, THEY DON'T (o en orden aleatorio o fijado con colores vivos)
  const isYesCorrect = q.correct === 'YES';
  
  // Textos completos estilizados en mayúsculas como en la imagen
  const optYes = { text: 'YES,\nTHEY DO.', val: 'YES', color: q.btnColors[1] };
  const optNo  = { text: "NO,\nTHEY DON'T.", val: 'NO',  color: q.btnColors[0] };

  // Ponemos los 2 botones en columna lateral
  const opts = [optNo, optYes]; // orden como en las fotos

  const btnsHtml = opts.map((opt, i) => `
    <button class="dophoto-choice-btn" id="dophoto-btn-${i}"
            style="background:${opt.color}"
            onclick="checkDoPhoto(this, '${opt.val}', '${q.correct}')">
      ${opt.text.replace('\n', '<br>')}
    </button>`).join('');

  el.innerHTML = `
    <div class="dophoto-container">
      <div class="dophoto-question">${q.question}</div>
      <div class="dophoto-body">
        <div class="dophoto-imgbox">
          ${q.svg}
        </div>
        <div class="dophoto-btn-col" id="dophoto-btn-col">
          ${btnsHtml}
        </div>
      </div>
      <div class="feedback" id="parcial-fb" style="margin-top:14px;min-height:36px"></div>
    </div>`;

  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function checkDoPhoto(btn, chosen, correct){
  document.querySelectorAll('.dophoto-choice-btn').forEach(b => b.disabled = true);
  const fb = document.getElementById('parcial-fb');

  parcialState.idx++;
  achState.totalAnswered++;

  if(chosen === correct){
    btn.classList.add('correct-ans');
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect());
    playCorrect();
    if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]} Correct answer!</span>`;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong-ans');
    // iluminar el correcto
    document.querySelectorAll('.dophoto-choice-btn').forEach(b => {
      if(!b.classList.contains('wrong-ans')) b.classList.add('correct-ans');
    });
    playWrong();
    if(fb) fb.innerHTML = `<span class="fb-wrong">${pick(MC_WRONG,1)[0]} The correct answer is ${correct === 'YES' ? 'YES, THEY DO.' : "NO, THEY DON'T."}</span>`;
    onWrongAnswer();
  }

  checkAchievements();
  const nxt = document.querySelector('#parcial-exercise .next-btn');
  if(nxt) nxt.style.display = 'block';
}

/* ══════════════════════════════════════════════════════════
   NUEVOS EJERCICIOS INGLÉS PARCIAL
   1. Animal Types  2. True or False  3. Complete the Sentence  4. Describe the Animal
══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   1. ANIMAL TYPES — clasificar animales por tipo
───────────────────────────────────────────────────── */


function renderPEngTypes(el){
  const questionsList = parcialState.questions || P_ENG_TYPES_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(q.intro, q.q, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   2. TRUE OR FALSE — oraciones sobre animales
   ───────────────────────────────────────────────────── */


function renderPEngTrueFalse(el){
  const questionsList = parcialState.questions || P_ENG_TF_Q;
  const q = questionsList[parcialState.idx];
  
  if (q.svg) {
    const trueColor = q.btnColors ? q.btnColors[0] : '#3b82f6';
    const falseColor = q.btnColors ? q.btnColors[1] : '#ef4444';
    
    el.innerHTML = `
      <div class="dophoto-container" style="max-width: 680px; margin: 0 auto 10px;">
        <div class="dophoto-question" style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 2.2rem; font-weight: 800; color: #111; text-align: center; margin: 6px 0 20px; line-height: 1.3; letter-spacing: -0.5px;">
          ${q.q}
        </div>
        <div class="dophoto-body" style="display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; flex-wrap: wrap;">
          <div class="dophoto-imgbox" style="width: 290px; height: 200px; border: 4px solid #000; border-radius: 12px; overflow: hidden; box-shadow: 6px 6px 0 #000; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${q.svg}
          </div>
          <div class="options-grid" id="parcial-opts" style="display: flex; flex-direction: ${q.layout === 'vertical' ? 'column' : 'row'}; gap: 16px; flex: 1; min-width: 200px; max-width: 290px; margin: 0;">
            <button class="opt-btn" style="flex: 1; padding: 18px 14px; font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 800; font-size: 1.5rem; background: ${trueColor}; color: white; border: 4px solid #000; box-shadow: 5px 5px 0 #000; border-radius: 12px; cursor: pointer; text-shadow: 1px 2px 2px rgba(0,0,0,0.3); text-align: center; line-height: 1.2;"
              onclick="checkPEngTrueFalse(this,'TRUE','${q.ans}','${q.explain.replace(/'/g,"\\'")}')">TRUE</button>
            <button class="opt-btn" style="flex: 1; padding: 18px 14px; font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 800; font-size: 1.5rem; background: ${falseColor}; color: white; border: 4px solid #000; box-shadow: 5px 5px 0 #000; border-radius: 12px; cursor: pointer; text-shadow: 1px 2px 2px rgba(0,0,0,0.3); text-align: center; line-height: 1.2;"
              onclick="checkPEngTrueFalse(this,'FALSE','${q.ans}','${q.explain.replace(/'/g,"\\'")}')">FALSE</button>
          </div>
        </div>
        <div class="feedback" id="parcial-fb" style="margin-top: 14px; min-height: 36px; text-align: center; width: 100%;"></div>
      </div>
    `;
  } else {
    const optsHtml = q.opts.map(o =>
      `<button class="opt-btn" style="font-size:1.1rem;letter-spacing:2px"
        onclick="checkPEngTrueFalse(this,'${o}','${q.ans}','${q.explain.replace(/'/g,"\\'")}')">${o}</button>`
    ).join('');
    el.innerHTML = `
      <p class="ex-intro">${q.intro}</p>
      <div class="reading-box" style="font-size:1.0rem;text-align:center;padding:18px;margin-bottom:14px;line-height:2">
        ${q.q}
      </div>
      <div class="options-grid" id="parcial-opts" style="max-width:340px">${optsHtml}</div>
      <div class="feedback" id="parcial-fb"></div>`;
  }
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function checkPEngTrueFalse(btn, chosen, correct, explain){
  disableOpts('parcial-opts');
  const fb = document.getElementById('parcial-fb');
  parcialState.idx++;
  achState.totalAnswered++;
  if(chosen === correct){
    btn.classList.add('correct');
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect());
    playCorrect();
    if(fb) fb.innerHTML = `<span class="fb-ok">${pick(MC_CORRECT,1)[0]}<br><small>💡 ${explain}</small></span>`;
    onCorrectAnswer();
  } else {
    btn.classList.add('wrong');
    // highlight correct
    document.querySelectorAll('#parcial-opts .opt-btn').forEach(b => {
      if(b.textContent.trim() === correct) b.classList.add('correct');
    });
    playWrong();
    if(fb) fb.innerHTML = `<span class="fb-wrong">${pick(MC_WRONG,1)[0]}<br><small>💡 ${explain}</small></span>`;
    onWrongAnswer();
  }
  checkAchievements();
  const nxt = document.querySelector('#parcial-exercise .next-btn');
  if(nxt) nxt.style.display = 'block';
}

/* ─────────────────────────────────────────────────────
   3. COMPLETE THE SENTENCE — gap-fill gramatical
───────────────────────────────────────────────────── */


function renderPEngWriteSent(el){
  const questionsList = parcialState.questions || P_ENG_WRITESENT_Q;
  const q = questionsList[parcialState.idx];
  const displayQ = q.q.replace('___', '<span style="border-bottom:3px solid #6c5ce7;padding:0 14px;color:#6c5ce7">___</span>');
  el.innerHTML = pqHtml(q.intro, displayQ, q.opts, q.ans);
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ─────────────────────────────────────────────────────
   4. DESCRIBE THE ANIMAL — pista + elegir el animal
   ───────────────────────────────────────────────────── */


function renderPEngDescribe(el){
  const questionsList = parcialState.questions || P_ENG_DESCRIBE_Q;
  const q = questionsList[parcialState.idx];
  el.innerHTML = pqHtml(
    q.intro,
    '👇 Which animal matches the description?',
    q.opts,
    q.ans,
    pEngBox(q.q)
  );
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

/* ══════════════════════════════════════════════════════════
   MATCH BODY PARTS — animales con flecha roja → palabra
   Basado en la imagen: rabbit→tail, parrot→feathers/wings,
   tiger→teeth, turtle→shell, monkey→tail, parrot→wings, etc.
   El alumno selecciona un animal y luego toca el casillero
   de la palabra correcta para emparejarlo.
══════════════════════════════════════════════════════════ */

/*
  Cada "round" tiene 6 animales y 6 palabras (las mismas 6 del ejercicio).
  El alumno hace clic en un animal (lo selecciona) y luego en la casilla
  de la palabra a la que quiere asignarlo.
  Cuando los 6 están colocados, se verifica todo.
  Las palabras fijas de la imagen: tail · teeth · feathers · wings · shell · fur
*/

/*
  Cada round: 6 animales, 6 palabras distintas, bijección 1-a-1.
  Palabras siempre: tail · teeth · feathers · wings · shell · fur
  Cada animal tiene UNA respuesta única dentro del round.
*/




/* ── estado del ejercicio ── */
let _bpState = {
  round: null,          // BP_ROUNDS[n]
  placed: {},           // wordIndex → animalIndex
  selectedAnimal: null, // índice del animal seleccionado
  done: false,
};

function renderPEngBodyParts(el){
  const roundIdx = parcialState.idx % BP_ROUNDS.length;
  const round    = BP_ROUNDS[roundIdx];
  // mezclar el orden de aparición de los animales (sin cambiar las respuestas)
  const shuffledAnimals = shuffle(round.animals.map((a,i)=>({...a, origIdx:i})));
  const activeRound = { animals: shuffledAnimals };
  _bpState = { round: activeRound, placed: {}, selectedAnimal: null, done: false };
  _buildBodyPartsUI(el, activeRound);
}

function _buildBodyPartsUI(el, round){
  /* ── columna izquierda: animales (3×2 grid) ── */
  const animalsHtml = round.animals.map((a, i) => `
    <div class="bp-animal-card" id="bp-animal-${i}"
         style="border-color:${a.border}"
         onclick="bpSelectAnimal(${i})">
      <div style="position:relative;display:inline-block">
        <span class="bp-animal-emoji">${a.emoji}</span>
        <span class="bp-arrow" style="color:#ef4444">➡</span>
      </div>
      <div class="bp-animal-name">${a.name}</div>
    </div>`).join('');

  /* ── grid derecho: palabras con casillas (3×2) ── */
  const wordsHtml = BP_WORDS.map((w, wi) => `
    <div class="bp-word-slot">
      <div class="bp-drop-box" id="bp-box-${wi}"
           onclick="bpDropOnWord(${wi})"></div>
      <span class="bp-word-label">${w}</span>
    </div>`).join('');

  el.innerHTML = `
    <p class="ex-intro" style="margin-bottom:8px">🦴 Tap an animal, then tap its matching body part!</p>
    <div class="bp-layout">
      <div class="bp-animals-col" id="bp-animals-col">${animalsHtml}</div>
      <div class="bp-words-grid"  id="bp-words-grid">${wordsHtml}</div>
    </div>
    <div class="feedback" id="parcial-fb" style="margin-top:6px"></div>`;
  el.appendChild(renderNextBtn('parcial', nextParcial));
}

function bpSelectAnimal(idx){
  if(_bpState.done) return;
  const round = _bpState.round;
  // si ya fue colocado, ignorar
  const alreadyPlaced = Object.values(_bpState.placed).includes(idx);
  if(alreadyPlaced) return;

  // deselect previous
  document.querySelectorAll('.bp-animal-card').forEach(c => c.classList.remove('bp-selected'));

  if(_bpState.selectedAnimal === idx){
    _bpState.selectedAnimal = null;
    return;
  }
  _bpState.selectedAnimal = idx;
  const card = document.getElementById('bp-animal-' + idx);
  if(card) card.classList.add('bp-selected');

  // hint en feedback
  const fb = document.getElementById('parcial-fb');
  if(fb) fb.innerHTML = `<span style="color:#6c5ce7;font-size:0.6rem">💡 Now tap the word box that matches <b>${round.animals[idx].emoji} ${round.animals[idx].name}</b>!</span>`;
}

function bpDropOnWord(wordIdx){
  if(_bpState.done) return;
  if(_bpState.selectedAnimal === null){
    const fb = document.getElementById('parcial-fb');
    if(fb) fb.innerHTML = `<span style="color:#f59e0b;font-size:0.6rem">👆 First select an animal on the left!</span>`;
    return;
  }

  const round = _bpState.round;
  const animalIdx = _bpState.selectedAnimal;
  const animal = round.animals[animalIdx];
  const box = document.getElementById('bp-box-' + wordIdx);

  // si este slot ya tenía un animal, liberar al anterior
  if(_bpState.placed[wordIdx] !== undefined){
    const prevAnimalIdx = _bpState.placed[wordIdx];
    const prevCard = document.getElementById('bp-animal-' + prevAnimalIdx);
    if(prevCard){ prevCard.classList.remove('bp-used','bp-selected'); }
  }

  // si este animal ya estaba en otro slot, limpiar ese slot
  Object.keys(_bpState.placed).forEach(wi => {
    if(_bpState.placed[wi] === animalIdx && parseInt(wi) !== wordIdx){
      delete _bpState.placed[wi];
      const otherBox = document.getElementById('bp-box-' + wi);
      if(otherBox){ otherBox.innerHTML = ''; otherBox.classList.remove('bp-filled'); }
    }
  });

  // colocar animal en el slot
  _bpState.placed[wordIdx] = animalIdx;
  if(box){
    box.innerHTML = animal.emoji;
    box.classList.add('bp-filled');
  }

  // marcar animal como usado
  const card = document.getElementById('bp-animal-' + animalIdx);
  if(card){ card.classList.remove('bp-selected'); card.classList.add('bp-used'); }

  _bpState.selectedAnimal = null;
  document.querySelectorAll('.bp-animal-card').forEach(c => c.classList.remove('bp-selected'));

  const fb = document.getElementById('parcial-fb');
  if(fb) fb.innerHTML = '';

  // verificar si se colocaron todos los animales (6)
  if(Object.keys(_bpState.placed).length === round.animals.length){
    _bpCheckAll();
  }
}

function _bpCheckAll(){
  _bpState.done = true;
  const round = _bpState.round;
  let allCorrect = true;

  // verificar: en cada casilla (wordIdx), el animal colocado debe tener answer === BP_WORDS[wordIdx]
  Object.keys(_bpState.placed).forEach(wi => {
    const wordIdx   = parseInt(wi);
    const animalIdx = _bpState.placed[wordIdx];
    const animal    = round.animals[animalIdx];
    const word      = BP_WORDS[wordIdx];
    const isCorrect = animal.answer === word;
    const box = document.getElementById('bp-box-' + wordIdx);
    if(box){
      box.classList.remove('bp-filled');
      box.classList.add(isCorrect ? 'bp-correct-box' : 'bp-wrong-box');
    }
    if(!isCorrect) allCorrect = false;
  });

  // deshabilitar clicks
  document.querySelectorAll('.bp-animal-card').forEach(c => { c.onclick = null; c.style.cursor='default'; });
  document.querySelectorAll('.bp-drop-box').forEach(b => { b.onclick = null; b.style.cursor='default'; });

  const fb = document.getElementById('parcial-fb');
  parcialState.idx++;
  achState.totalAnswered++;

  if(allCorrect){
    parcialState.correct++;
    achState.totalCorrect++;
    addStar(starsForCorrect() * 2);
    playCorrect();
    if(fb) fb.innerHTML = `<span class="fb-ok">🏆 PERFECT! All body parts matched! ${pick(MC_CORRECT,1)[0]}</span>`;
    onCorrectAnswer();
  } else {
    playWrong();
    if(fb) fb.innerHTML = `<span class="fb-wrong">❌ Some were wrong — check the red boxes! The green ones are correct.</span>`;
    onWrongAnswer();
  }

  checkAchievements();
  const nxt = document.querySelector('#parcial-exercise .next-btn');
  if(nxt) nxt.style.display = 'block';
}

/* ══════════════════════════════════════════════════════════
   MODO CIENCIAS NATURALES & HISTORIA
══════════════════════════════════════════════════════════ */
let scienceState = { topic: '', idx: 0, correct: 0, total: 4, questions: [] };
let historyState = { topic: '', idx: 0, correct: 0, total: 4, questions: [] };
let dailyState   = { idx: 0, correct: 0, total: 5, questions: [] };

function loadScience(topic) {
  _lastSec = 'science';
  _lastRewardTopic = topic;
  const qList = SCIENCE_QUESTIONS[topic] || [];
  scienceState = {
    topic,
    idx: 0,
    correct: 0,
    total: Math.min(4, qList.length),
    questions: shuffle([...qList]).slice(0, 4)
  };
  goToExerciseScreen('science', '🔬 Laboratorio de Ciencias');
  renderScienceExercise();
}

function renderScienceExercise() {
  const el = document.getElementById('science-exercise');
  const prog = document.getElementById('science-progress');
  if (!el) return;

  const pct = Math.round((scienceState.idx / scienceState.total) * 100);
  if (prog) prog.style.width = pct + '%';

  if (scienceState.idx >= scienceState.total) {
    finishScience();
    return;
  }

  const q = scienceState.questions[scienceState.idx];
  const finalOpts = shuffle([...q.opts]);

  el.innerHTML = `
    <p class="ex-intro">🧪 <strong>Pregunta ${scienceState.idx + 1} de ${scienceState.total}:</strong></p>
    <div class="reading-box" style="margin-bottom: 12px; font-size: 1.05rem; font-weight: bold; color: #38bdf8;">
      ${q.q}
    </div>
    <div id="science-opts" style="display: flex; flex-direction: column; gap: 10px; max-width: 600px; margin: 14px auto;">
      ${finalOpts.map(o => `
        <button class="opt-btn" onclick="checkGenericAnswer(this, \`${o}\`, \`${q.ans}\`, 'science')">
          ${o}
        </button>
      `).join('')}
    </div>
    <div class="feedback" id="science-fb"></div>
  `;
}

function finishScience() {
  const el = document.getElementById('science-exercise');
  const bonus = scienceState.correct * starsForCorrect() * 2;
  addStar(bonus);
  playerCoins += bonus * 2;
  achState.scienceSections = (achState.scienceSections || 0) + 1;
  checkAchievements();
  saveProfile();

  el.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:3rem;margin-bottom:12px;">🎉 🧪 🧬</div>
      <div class="screen-title" style="font-size:1.1rem;color:#38bdf8;margin-bottom:10px;">¡EXPERIMENTO COMPLETADO!</div>
      <p style="font-family:'Nunito',sans-serif;font-size:1.1rem;margin-bottom:14px;">
        Acertaste <strong>${scienceState.correct}</strong> de <strong>${scienceState.total}</strong> misterios científicos.<br>
        ¡Ganaste <strong>+${bonus} 💎 diamantes</strong> y <strong>+${bonus * 2} 🪙 monedas</strong>!
      </p>
      <button class="screen-btn" style="background:#0284c7" onclick="goToExercises('science')">🔬 Otros Experimentos</button>
      <br><br>
      <button class="screen-btn" style="background:#555;font-size:0.4rem;padding:8px 16px" onclick="goToSubjects()">🗺️ Volver a Misiones</button>
    </div>
  `;
  playFinish(scienceState.correct === scienceState.total);
}

function loadHistory(topic) {
  _lastSec = 'history';
  _lastRewardTopic = topic;
  const qList = HISTORY_QUESTIONS[topic] || [];
  historyState = {
    topic,
    idx: 0,
    correct: 0,
    total: Math.min(4, qList.length),
    questions: shuffle([...qList]).slice(0, 4)
  };
  goToExerciseScreen('history', '🏛️ Templo del Tiempo');
  renderHistoryExercise();
}

function renderHistoryExercise() {
  const el = document.getElementById('history-exercise');
  const prog = document.getElementById('history-progress');
  if (!el) return;

  const pct = Math.round((historyState.idx / historyState.total) * 100);
  if (prog) prog.style.width = pct + '%';

  if (historyState.idx >= historyState.total) {
    finishHistory();
    return;
  }

  const q = historyState.questions[historyState.idx];
  const finalOpts = shuffle([...q.opts]);

  el.innerHTML = `
    <p class="ex-intro">🏛️ <strong>Pregunta ${historyState.idx + 1} de ${historyState.total}:</strong></p>
    <div class="reading-box" style="margin-bottom: 12px; font-size: 1.05rem; font-weight: bold; color: #fbbf24;">
      ${q.q}
    </div>
    <div id="history-opts" style="display: flex; flex-direction: column; gap: 10px; max-width: 600px; margin: 14px auto;">
      ${finalOpts.map(o => `
        <button class="opt-btn" onclick="checkGenericAnswer(this, \`${o}\`, \`${q.ans}\`, 'history')">
          ${o}
        </button>
      `).join('')}
    </div>
    <div class="feedback" id="history-fb"></div>
  `;
}

function finishHistory() {
  const el = document.getElementById('history-exercise');
  const bonus = historyState.correct * starsForCorrect() * 2;
  addStar(bonus);
  playerCoins += bonus * 2;
  achState.historySections = (achState.historySections || 0) + 1;
  checkAchievements();
  saveProfile();

  el.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:3rem;margin-bottom:12px;">🏆 🏛️ 📜</div>
      <div class="screen-title" style="font-size:1.1rem;color:#fbbf24;margin-bottom:10px;">¡ERA HISTÓRICA CONQUISTADA!</div>
      <p style="font-family:'Nunito',sans-serif;font-size:1.1rem;margin-bottom:14px;">
        Descubriste <strong>${historyState.correct}</strong> de <strong>${historyState.total}</strong> secretos del pasado.<br>
        ¡Ganaste <strong>+${bonus} 💎 diamantes</strong> y <strong>+${bonus * 2} 🪙 monedas</strong>!
      </p>
      <button class="screen-btn" style="background:#d97706" onclick="goToExercises('history')">🏛️ Otras Eras</button>
      <br><br>
      <button class="screen-btn" style="background:#555;font-size:0.4rem;padding:8px 16px" onclick="goToSubjects()">🗺️ Volver a Misiones</button>
    </div>
  `;
  playFinish(historyState.correct === historyState.total);
}

function startDailyChallenge() {
  const challenge = getDailyChallengeData();
  dailyState = {
    idx: 0,
    correct: 0,
    total: challenge.questions.length,
    questions: challenge.questions
  };
  goToExerciseScreen('daily', '⚡ Desafío Diario');
  renderDailyExercise();
}

function renderDailyExercise() {
  const el = document.getElementById('daily-exercise');
  const prog = document.getElementById('daily-progress');
  if (!el) return;

  const pct = Math.round((dailyState.idx / dailyState.total) * 100);
  if (prog) prog.style.width = pct + '%';

  if (dailyState.idx >= dailyState.total) {
    finishDaily();
    return;
  }

  const q = dailyState.questions[dailyState.idx];
  const finalOpts = shuffle([...q.opts]);

  el.innerHTML = `
    <p class="ex-intro" style="color:#c084fc">⚡ <strong>${q.intro}</strong> (${dailyState.idx + 1} de ${dailyState.total})</p>
    <div class="reading-box" style="margin-bottom: 12px; font-size: 1.05rem; font-weight: bold; border-color: #c084fc;">
      ${q.q}
    </div>
    <div id="daily-opts" style="display: flex; flex-direction: column; gap: 10px; max-width: 600px; margin: 14px auto;">
      ${finalOpts.map(o => `
        <button class="opt-btn" onclick="checkGenericAnswer(this, \`${o}\`, \`${q.ans}\`, 'daily')">
          ${o}
        </button>
      `).join('')}
    </div>
    <div class="feedback" id="daily-fb"></div>
  `;
}

function finishDaily() {
  const el = document.getElementById('daily-exercise');
  const bonus = dailyState.correct * 5; // Gran recompensa por el desafío diario
  addStar(bonus);
  playerCoins += 50; // Gran bono de monedas
  achState.dailySections = (achState.dailySections || 0) + 1;
  checkAchievements();
  saveProfile();

  el.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:3.5rem;margin-bottom:12px;">⚡ 👑 💎</div>
      <div class="screen-title" style="font-size:1.1rem;color:#c084fc;margin-bottom:10px;">¡DESAFÍO DIARIO COMPLETADO!</div>
      <p style="font-family:'Nunito',sans-serif;font-size:1.1rem;margin-bottom:14px;">
        ¡Increíble, ${playerName}! Acertaste <strong>${dailyState.correct}</strong> de <strong>${dailyState.total}</strong> preguntas del reto diario.<br>
        ¡Recompensa especial: <strong>+${bonus} 💎 Diamantes</strong> y <strong>+50 🪙 Monedas Voxel</strong>!
      </p>
      <button class="screen-btn" style="background:#7c3aed" onclick="goToSubjects()">🗺️ Volver a Misiones</button>
    </div>
  `;
  playFinish(true);
}

function checkGenericAnswer(btn, val, ans, type) {
  const containerId = type + '-opts';
  const fb = document.getElementById(type + '-fb');
  disableOpts(containerId);

  achState.totalAnswered++;
  if (!subjectStats[type]) subjectStats[type] = { total: 0, correct: 0 };
  subjectStats[type].total++;

  if (val === ans) {
    btn.classList.add('correct');
    fb.textContent = '¡EXCELENTE! ¡Respuesta correcta!';
    fb.className = 'feedback ok';
    playCorrect();
    addStar(starsForCorrect());
    achState.totalCorrect++;
    subjectStats[type].correct++;
    onCorrectAnswer(); // monedas se suman dentro de onCorrectAnswer
    
    if (type === 'science') scienceState.correct++;
    else if (type === 'history') historyState.correct++;
    else if (type === 'daily') dailyState.correct++;
  } else {
    btn.classList.add('wrong');
    fb.textContent = '¡CUIDADO! La respuesta correcta era: ' + ans;
    fb.className = 'feedback err';
    playWrong();
    highlightCorrect(containerId, ans);
    onWrongAnswer();
  }

  setTimeout(() => {
    if (type === 'science') { scienceState.idx++; renderScienceExercise(); }
    else if (type === 'history') { historyState.idx++; renderHistoryExercise(); }
    else if (type === 'daily') { dailyState.idx++; renderDailyExercise(); }
  }, 1400);
}

/* ══════════════════════════════════════════════════════════
   TIENDA DE SKINS & AVATARES
══════════════════════════════════════════════════════════ */
function goToShop() {
  goToScreen('screen-game');
  document.getElementById('hud-player-name').textContent = '⚔️ ' + (playerName || 'Héroe');
  document.getElementById('hud-subject-label').textContent = '🛍️ Tienda de Skins';
  showSection('shop');
  renderShop();
}

function renderShop() {
  const coinsEl = document.getElementById('shop-coins-count');
  const avatarEl = document.getElementById('shop-current-avatar');
  const grid = document.getElementById('shop-grid');
  
  if (coinsEl) coinsEl.textContent = playerCoins;
  if (avatarEl) avatarEl.textContent = selectedAvatar;
  if (!grid) return;

  grid.innerHTML = SHOP_ITEMS.map(item => {
    const isOwned = item.price === 0 || playerInventory.includes(item.id);
    const isEquipped = selectedAvatar === item.emoji;

    return `
      <div class="card" style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px;background:#1e293b;border:3px solid ${isEquipped ? '#facc15' : '#475569'};">
        <div style="font-size:2.8rem;margin-bottom:6px;">${item.emoji}</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.5rem;color:#f8fafc;margin-bottom:4px;">${item.name}</div>
        <div style="font-family:'Nunito',sans-serif;font-size:0.75rem;color:#94a3b8;margin-bottom:10px;min-height:32px;">${item.desc}</div>
        
        ${isEquipped ? `
          <button class="opt-btn" disabled style="background:#5D9E3A;color:#fff;cursor:default;width:100%;font-size:0.75rem;">✓ EQUIPADO</button>
        ` : isOwned ? `
          <button class="opt-btn" onclick="equipSkin('${item.id}', '${item.emoji}')" style="background:#0284c7;color:#fff;width:100%;font-size:0.75rem;">⚡ EQUIPAR</button>
        ` : `
          <button class="opt-btn" onclick="buySkin('${item.id}', ${item.price}, '${item.emoji}')" style="background:#eab308;color:#000;width:100%;font-size:0.75rem;">
            🪙 COMPRAR (${item.price})
          </button>
        `}
      </div>
    `;
  }).join('');
}

async function buySkin(itemId, price, emoji) {
  if (playerCoins < price) {
    alert('⚠️ ¡No tenés suficientes monedas! Completá más ejercicios para ganar monedas.');
    playWrong();
    return;
  }

  if (userToken) {
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({ itemId, itemPrice: price, itemEmoji: emoji, itemType: 'skin' })
      });
      const data = await res.json();
      if (res.ok) {
        playerCoins = data.coins;
        playerInventory = data.inventory;
        selectedAvatar = data.avatar;
        achState.customSkins = (achState.customSkins || 0) + 1;
        checkAchievements();
        renderShop();
        playAchievement();
      } else {
        alert(data.error || 'Error en compra');
      }
    } catch (e) {
      // Fallback local
      playerCoins -= price;
      playerInventory.push(itemId);
      selectedAvatar = emoji;
      achState.customSkins = (achState.customSkins || 0) + 1;
      checkAchievements();
      saveProfile();
      renderShop();
      playAchievement();
    }
  } else {
    playerCoins -= price;
    playerInventory.push(itemId);
    selectedAvatar = emoji;
    achState.customSkins = (achState.customSkins || 0) + 1;
    checkAchievements();
    saveProfile();
    renderShop();
    playAchievement();
  }
}

function equipSkin(itemId, emoji) {
  selectedAvatar = emoji;
  saveProfile();
  renderShop();
  playCorrect();
}

/* ══════════════════════════════════════════════════════════
   PANEL PARA PADRES Y PROFESORES
══════════════════════════════════════════════════════════ */
function goToParentDashboard() {
  goToScreen('screen-game');
  document.getElementById('hud-player-name').textContent = '⚔️ ' + (playerName || 'Héroe');
  document.getElementById('hud-subject-label').textContent = '👨‍👩‍👧‍👦 Panel Docente';
  showSection('parent');
  renderParentDashboard();
}

function renderParentDashboard() {
  const metricsEl = document.getElementById('dashboard-metrics');
  const barsEl = document.getElementById('subject-performance-bars');
  const feedbackEl = document.getElementById('pedagogic-feedback');

  const totalAns = achState.totalAnswered || 0;
  const totalCorr = achState.totalCorrect || 0;
  const globalAccuracy = totalAns > 0 ? Math.round((totalCorr / totalAns) * 100) : 0;

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="card" style="background:#1e293b;border:2px solid #38bdf8;text-align:center;padding:10px;">
        <div style="font-size:1.6rem;">🎯</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.8rem;color:#38bdf8;margin:6px 0;">${globalAccuracy}%</div>
        <div style="font-family:'Nunito',sans-serif;font-size:0.75rem;color:#94a3b8;">Precisión Global</div>
      </div>
      <div class="card" style="background:#1e293b;border:2px solid #4ade80;text-align:center;padding:10px;">
        <div style="font-size:1.6rem;">📝</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.8rem;color:#4ade80;margin:6px 0;">${totalAns}</div>
        <div style="font-family:'Nunito',sans-serif;font-size:0.75rem;color:#94a3b8;">Ejercicios Resueltos</div>
      </div>
      <div class="card" style="background:#1e293b;border:2px solid #facc15;text-align:center;padding:10px;">
        <div style="font-size:1.6rem;">💎</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.8rem;color:#facc15;margin:6px 0;">${stars}</div>
        <div style="font-family:'Nunito',sans-serif;font-size:0.75rem;color:#94a3b8;">Diamantes de Estudio</div>
      </div>
      <div class="card" style="background:#1e293b;border:2px solid #f43f5e;text-align:center;padding:10px;">
        <div style="font-size:1.6rem;">🔥</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.8rem;color:#f43f5e;margin:6px 0;">${playerStreakDays} días</div>
        <div style="font-family:'Nunito',sans-serif;font-size:0.75rem;color:#94a3b8;">Racha de Días</div>
      </div>
    `;
  }

  const subjects = [
    { key: 'math', name: 'Matemática', color: '#ef4444' },
    { key: 'lang', name: 'Lengua & Lectura', color: '#8b5cf6' },
    { key: 'eng', name: 'Inglés (Vocab & Grammar)', color: '#10b981' },
    { key: 'science', name: 'Ciencias Naturales', color: '#0284c7' },
    { key: 'history', name: 'Historia & Sociedad', color: '#d97706' }
  ];

  if (barsEl) {
    barsEl.innerHTML = subjects.map(s => {
      const stat = subjectStats[s.key] || { total: 0, correct: 0 };
      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      return `
        <div>
          <div style="display:flex;justify-content:space-between;font-family:'Nunito',sans-serif;font-size:0.85rem;margin-bottom:4px;">
            <span><strong>${s.name}</strong> (${stat.correct}/${stat.total} aciertos)</span>
            <span><strong>${pct}%</strong></span>
          </div>
          <div style="background:#334155;height:14px;border-radius:4px;overflow:hidden;border:1px solid #000;">
            <div style="width:${pct}%;height:100%;background:${s.color};transition:width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (feedbackEl) {
    let recommendations = [];
    if (globalAccuracy >= 85) {
      recommendations.push('🌟 <strong>Excelente dominio cognitivo:</strong> El estudiante demuestra gran solidez en comprensión de consignas y agilidad de cálculo.');
    } else if (globalAccuracy >= 60) {
      recommendations.push('👍 <strong>Progreso consistente:</strong> Buen avance general. Se recomienda practicar 10 minutos diarios para afianzar retención.');
    } else {
      recommendations.push('💡 <strong>Área de oportunidad:</strong> Se sugiere repasar los desafíos en el bioma 🌿 Pradera con mayor tiempo de lectura.');
    }

    recommendations.push('📌 <strong>Sugerencia pedagógica:</strong> Estimular el uso del "Desafío Diario" para fomentar hábitos de estudio regulares y consistencia.');
    feedbackEl.innerHTML = recommendations.map(r => `<p style="margin-bottom:8px;">${r}</p>`).join('');
  }
}

/* ══════════════════════════════════════════════════════════
   INIT & SERVICE WORKER (PWA)
══════════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('✓ Service Worker registrado con éxito:', reg.scope);
    }).catch((err) => {
      console.warn('⚠️ Service Worker error:', err);
    });
  });
}
