(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const art = window.CupArt;
  const key = "homebound-cup.season.v1";
  const groups = ["Arms","Chest","Legs"];
  const judges = {impact:"Brass",balance:"Lyra"};
  const phases = ["arrival","ticket","training","stage","result"];
  const places = ["first","second","third"];
  const screens = ["home","story","gym","final"];
  let season = readSeason();
  let choice = lastWorkout();
  let pace = 1;
  let openingPortrait = false;
  let alternate = false;
  let audio = null;
  let soundOn = false;

  function readSeason() {
    try {
      const s = JSON.parse(localStorage.getItem(key));
      if (!s || s.v!==1 || !Number.isInteger(s.seed) || s.seed<0 || s.seed>0xffffffff) return null;
      if (!phases.includes(s.phase) || !Array.isArray(s.log) || s.log.length>30 || !s.log.every(n=>[0,1,2].includes(n))) return null;
      if (["arrival","ticket"].includes(s.phase) && s.log.length) return null;
      if (["stage","result"].includes(s.phase) !== (s.log.length===30)) return null;
      return s;
    } catch { return null; }
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(season)); }
    catch { /* A browser with storage disabled can still play this season in memory. */ }
  }
  function lastWorkout() { return season?.log.at(-1) ?? null; }
  function newSeason() {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    season = {v:1,seed:buffer[0],phase:"arrival",log:[]};
    choice=null; pace=1; openingPortrait=false; alternate=false;
    persist();
  }
  function tallies() {
    const counts=[0,0,0];
    for (const item of season.log) counts[item]++;
    return counts;
  }
  function opposite(lead) { return lead==="impact" ? "balance" : "impact"; }
  function leadJudge() { return season.seed%2===0 ? "impact" : "balance"; }

  // Generate one cast per season. Refreshing and swapping judges reuse the same rivals.
  function contestants() {
    let state=season.seed;
    function next() { state=(Math.imul(state,1664525)+1013904223)>>>0; return state/4294967296; }
    function shuffle(items) {
      for(let i=items.length-1;i>0;i--) {
        const j=Math.floor(next()*(i+1));
        [items[i],items[j]]=[items[j],items[i]];
      }
      return items;
    }
    const names=shuffle(["Juno Jet","Kip Comet","Taro Volt","Nova Finch","Vika Lux","Miro Flint"]);
    const looks=shuffle([...art.visitors]);
    const peak=19+Math.floor(next()*7);
    const low=1+Math.floor(next()*3);
    const offset=1+Math.floor(next()*4);
    const builds=shuffle([shuffle([peak,30-peak-low,low]),shuffle([10+offset,10,10-offset])]);
    return [
      {id:"left",name:names[0],counts:builds[0],look:looks[0]},
      {id:"you",name:"You",counts:tallies(),look:art.player},
      {id:"right",name:names[1],counts:builds[1],look:looks[1]}
    ];
  }
  function standings(entries,lead) {
    const ranked=entries.map(e=>{
      const high=Math.max(...e.counts);
      const gap=high-Math.min(...e.counts);
      const impact=Math.round(50+(high-10)*2.5);
      const balance=Math.round(100-gap*50/30);
      const weighted=lead==="impact" ? 2*impact+balance : impact+2*balance;
      return {...e,impact,balance,total:Math.round(weighted*10/3)/10};
    }).sort((a,b)=>b.total-a.total);
    for(const e of ranked) e.place=1+ranked.filter(other=>other.total>e.total).length;
    return ranked;
  }

  function playTone(notes) {
    if (!soundOn || !audio || audio.state!=="running") return;
    for(const [index,hz] of notes.entries()) {
      const begin=audio.currentTime+index*.095;
      const osc=audio.createOscillator(), gain=audio.createGain();
      osc.type="sine"; osc.frequency.value=hz;
      gain.gain.setValueAtTime(.0001,begin);
      gain.gain.exponentialRampToValueAtTime(.065,begin+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,begin+.18);
      osc.connect(gain); gain.connect(audio.destination);
      osc.start(begin); osc.stop(begin+.20);
    }
  }
  $("sound").addEventListener("click",async()=>{
    if (!soundOn) {
      try {
        const Audio=window.AudioContext || window.webkitAudioContext;
        audio ||= new Audio();
        await audio.resume();
      } catch { $("sound").querySelector("span").textContent="Sound unavailable"; return; }
    }
    soundOn=!soundOn;
    $("sound").setAttribute("aria-pressed",String(soundOn));
    $("sound").setAttribute("aria-label",soundOn?"Mute game sounds":"Enable game sounds");
    $("sound").querySelector("use").setAttribute("href",soundOn?"#i-sound":"#i-mute");
    $("sound").querySelector("span").textContent=soundOn?"Sound on":"Sound off";
    playTone([392,523]);
  });

  function show(id) {
    for(const screen of screens) $(screen).hidden=screen!==id;
  }
  function topFocus(id) {
    $(id).focus({preventScroll:true});
    window.scrollTo({top:0,behavior:"instant"});
  }
  function homeLabel() {
    $("fresh").hidden=!season;
    let label="Start the story";
    if(season){
      if(season.phase==="training") label=`Resume Day ${season.log.length+1}`;
      else if(season.phase==="stage") label="Return to the final";
      else if(season.phase==="result") label="View my result";
      else label="Continue the story";
    }
    $("play-link").querySelector("span").textContent=label;
  }
  function route() {
    const hash=location.hash;
    homeLabel();
    if(hash==="#play"){
      if(!season) newSeason();
      if(season.phase==="arrival" || season.phase==="ticket"){
        show("story"); renderStory(); topFocus("story-title");
      } else if(season.phase==="training"){
        show("gym"); renderGym(); topFocus("gym-title");
      } else {
        show("final"); renderFinal(); topFocus("final-title");
      }
    } else {
      show("home");
      if(hash==="#rules" || hash==="#about"){
        requestAnimationFrame(()=>$(hash.slice(1)).scrollIntoView({block:"start",behavior:"instant"}));
      } else window.scrollTo({top:0,behavior:"instant"});
    }
  }
  function startAgain(){
    newSeason();
    if(location.hash==="#play") route();
    else location.hash="play";
  }
  $("fresh").addEventListener("click",()=>{ $("reset-dialog").returnValue=""; $("reset-dialog").showModal(); });
  $("reset-dialog").addEventListener("close",()=>{ if($("reset-dialog").returnValue==="restart") startAgain(); });
  $("replay").addEventListener("click",startAgain);
  document.querySelector(".skip").addEventListener("click",event=>{
    event.preventDefault(); $("content").focus(); $("content").scrollIntoView({block:"start"});
  });

  function renderStory() {
    const ticket=season.phase==="ticket";
    const lead=leadJudge();
    $("story-frame").classList.toggle("ticket-scene",ticket);
    $("story-place").textContent=ticket?"Vela Arena · Box office":"Planet Vela · The outer terraces";
    $("story-title").textContent=ticket?"First place flies home.":"That’s a second moon.";
    $("story-text").innerHTML=ticket?
      `<p>Behind the glass, an alien clerk holds up a pair of orange shorts. Your name is stitched into the waistband.</p><p>“The Homebound Cup opens in thirty days,” she says. “Take first place in our bodybuilding final and the gate will take you back to Earth.”</p><p>She circles <strong>${judges[lead]}</strong> on your entry ticket. “Head judge this season. That score counts twice.” The locker room door clicks open.</p>`:
      `<p>Your alarm goes off. You reach for your phone and come up with a handful of purple sand. One moon is setting. A second one is still climbing.</p><p>Something buzzes in your pocket. A silver ticket, warm against your thumb, bears a picture of Earth. From the arena below, a loudspeaker calls your name.</p>`;
    $("story-prop").innerHTML=ticket?`<div class="paper-ticket"><div class="ticket-top"><span>Vela Arena</span><span>Final</span></div><strong>EARTH<br>RETURN</strong><div class="ticket-stub"><div><small>Head judge</small><b>${judges[lead]} · ${lead==="impact"?"Impact":"Balance"}</b></div><div class="barcode"></div></div></div>`:"";
    $("next-story").textContent=ticket?"Enter the training room":"Follow the announcement";
    if(ticket) pulse(document.querySelector(".story-copy"),"turn");
  }
  $("next-story").addEventListener("click",()=>{
    if(season.phase==="arrival") season.phase="ticket";
    else if(season.phase==="ticket") season.phase="training";
    else return;
    persist(); playTone([330,440]); route();
  });

  function pulse(element,cls) {
    element.classList.remove(cls);
    void element.offsetWidth;
    element.classList.add(cls);
  }
  function afterWorkout(index,total) {
    const comments=[
      ["Your wrist wraps feel a little tighter.","The tailor adds another seam to each sleeve.","You catch sight of a biceps peak out of the corner of each eye.","You peek between your biceps to find the mirror."],
      ["A new fold runs across your singlet.","The sponsor’s patch starts to stretch.","Your race number now curves around both sides of your chest.","The tailor measures your singlet with a length of climbing rope."],
      ["Your shorts sit a little differently.","Your calves cast their own shadows.","You need a wider stance to see your shoes.","The locker room bench suddenly looks very narrow."]
    ];
    const stage=total>=23?3:total>=14?2:total>=6?1:0;
    return comments[index][stage];
  }

  function controls() {
    const remaining=30-season.log.length;
    if(remaining===1) pace=1;
    for(const input of document.querySelectorAll('input[name="group"]')) input.checked=Number(input.value)===choice;
    for(const input of document.querySelectorAll('input[name="pace"]')){
      input.checked=Number(input.value)===pace;
      input.disabled=Number(input.value)===5 && remaining===1;
    }
    $("long-block").textContent=remaining===1?"5 days":`${Math.min(5,remaining)} days`;
    const n=Math.min(pace,remaining);
    $("train").disabled=choice===null;
    let label="Train & sleep";
    if(choice!==null) label=n===1?`Train ${groups[choice].toLowerCase()} & sleep`:`Train ${groups[choice].toLowerCase()} for ${n} days`;
    $("train").querySelector("span").textContent=label;
  }
  function renderMirror() {
    const shown=openingPortrait?[0,0,0]:tallies();
    $("gym-canvas").classList.remove("recover");
    $("gym-canvas").innerHTML=art.athlete(shown);
    $("gym-canvas").setAttribute("role","img");
    $("gym-canvas").setAttribute("aria-label",`Athlete flexing both arms after ${shown[0]} arm, ${shown[1]} chest, and ${shown[2]} leg workouts.`);
    $("mirror-label").textContent=openingPortrait?"Opening-day portrait":"Training mirror";
    $("compare").querySelector("span").textContent=openingPortrait?"View current athlete":"View Day 1";
    $("compare").setAttribute("aria-pressed",String(openingPortrait));
    $("compare").disabled=season.log.length===0;
    $("mirror-foot").textContent=openingPortrait?"Day 1 · Before your first workout":season.log.length===0?
      "Your starting physique":"Current physique · "+groups.map((name,i)=>name+" "+shown[i]).join(" / ");
  }
  function judgeRemark(lead,counts) {
    const high=Math.max(...counts), low=Math.min(...counts);
    if(!high) return lead==="impact"?
      "My score goes up with your most-trained muscle. Pick one you want me to remember.":
      "I look at the gap between your most- and least-trained muscles. Give each one a turn.";
    if(lead==="impact"){
      const leaders=groups.filter((_,i)=>counts[i]===high);
      if(leaders.length>1) return "Your strongest groups are neck and neck. Which one should I remember when you leave the stage?";
      return [
        "Those arms caught my eye. Give me a curl I can see from the last row.",
        "That chest makes quite an entrance. I could pick your silhouette out of a crowd.",
        "I noticed those legs from the press box. That stance belongs on a poster."
      ][counts.indexOf(high)];
    }
    if(high===low) return "All three groups have had an equal turn. That earns my highest balance score.";
    const under=groups.filter((_,i)=>counts[i]===low).map(g=>g.toLowerCase()).join(" or ");
    return `Your widest gap is ${high-low} ${high-low===1?"session":"sessions"}. If you want my vote, consider training ${under} next.`;
  }
  function renderGym(message) {
    const counts=tallies(), completed=season.log.length;
    $("day").textContent=String(completed+1).padStart(2,"0")+" / 30";
    renderMirror(); controls();
    $("log-count").textContent=`${completed} / 30 sessions`;
    $("log").innerHTML=Array.from({length:30},(_,day)=>{
      const group=groups[season.log[day]];
      return `<i class="${group?.toLowerCase()||""}" title="Day ${day+1} · ${group||"Upcoming"}"></i>`;
    }).join("");
    $("log").setAttribute("role","img");
    $("log").setAttribute("aria-label",completed?season.log.map((n,i)=>`Day ${i+1}, ${groups[n]}`).join(". "):"No workouts recorded.");
    $("totals").innerHTML=groups.map((name,i)=>`<span><i aria-hidden="true" style="background:var(--${["arm","chest","leg"][i]})"></i>${name} <b>${counts[i]}</b></span>`).join("");
    const lead=leadJudge();
    const advice=judgeRemark(lead,counts);
    $("coach").innerHTML=`<span class="portrait" aria-hidden="true">${art.portrait(lead)}</span><div><h3>${judges[lead]} · Head judge</h3><p>“${advice}”</p></div>`;
    $("feedback").textContent=message || (completed?afterWorkout(lastWorkout(),counts[lastWorkout()]):"Choose a muscle group to begin.");
  }
  for(const input of document.querySelectorAll('input[name="group"]')) input.addEventListener("change",()=>{
    choice=Number(input.value); controls(); playTone([290+choice*60]);
  });
  for(const input of document.querySelectorAll('input[name="pace"]')) input.addEventListener("change",()=>{
    pace=Number(input.value); controls();
  });
  $("compare").addEventListener("click",()=>{ openingPortrait=!openingPortrait; renderMirror(); });
  $("train").addEventListener("click",()=>{
    if(season.phase!=="training" || choice===null) return;
    const length=Math.min(pace,30-season.log.length);
    season.log.push(...Array(length).fill(choice));
    openingPortrait=false;
    if(season.log.length===30){
      season.phase="stage"; persist(); playTone([392,494,587]); route();
      return;
    }
    persist();
    const message=`${length===1?"One night later":length+" nights later"} · ${afterWorkout(choice,tallies()[choice])}`;
    renderGym(message); pulse($("gym-canvas"),"recover"); playTone([330,415,494]);
  });

  function renderTable() {
    const lead=leadJudge(), entries=contestants();
    const official=standings(entries,lead);
    const panel=alternate?opposite(lead):lead;
    const ranked=alternate?standings(entries,panel):official;
    const finish=ranked.find(e=>e.id==="you");
    $("swap").textContent=alternate?"Restore official panel":"Swap head judges";
    $("swap").setAttribute("aria-pressed",String(alternate));
    const tie=ranked.filter(e=>e.total===finish.total).length>1;
    const placeText=`${tie?"tied for ":"in "}${places[finish.place-1]} place`;
    const officialFinish=official.find(e=>e.id==="you");
    $("score-caption").textContent=alternate?
      `Alternate panel · ${judges[panel]} leads. Your official total was ${officialFinish.total.toFixed(1)}. With the ${panel} score counted twice, you earn ${finish.total.toFixed(1)} and finish ${placeText}.`:
      `Official panel · ${judges[panel]} leads. With the ${panel} score counted twice, you finish ${placeText}.`;
    $("scores").innerHTML=ranked.map(e=>`<tr class="${e.id==="you"?"you":""}"><td>${e.place}</td><th scope="row">${e.name}</th><td>${e.impact}</td><td>${e.balance}</td><td>${e.total.toFixed(1)}</td></tr>`).join("");
  }
  function renderFinal() {
    const entries=contestants(), lead=leadJudge();
    const result=season.phase==="result";
    $("lineup").innerHTML=entries.map(e=>`<figure class="contestant ${e.id==="you"?"player":""}" aria-label="${e.name}, ${e.counts[0]} arm, ${e.counts[1]} chest, and ${e.counts[2]} leg workouts">${art.athlete(e.counts,e.look)}<figcaption>${e.name}</figcaption></figure>`).join("");
    $("curtain-call").hidden=result;
    $("verdict").hidden=!result;
    $("stage-call").textContent=`You flex between ${entries[0].name} and ${entries[2].name}. ${judges[lead]} raises the deciding card.`;
    $("final-title").textContent=result?"The official verdict.":"The Cup final.";
    if(!result){pulse($("stage"),"enter");return;}
    $("stage").classList.remove("enter");
    const ranked=standings(entries,lead);
    const you=ranked.find(e=>e.id==="you");
    const win=you.place===1;
    const tied=ranked.filter(e=>e.place===you.place).length>1;
    const note=win?(tied?"You share the title. The gate widens for everyone who tied for first.":"The clerk presses the Cup into your hands. The gate lights up blue.")+
      (you.counts[0]>=23?" You turn sideways, squeeze your biceps through, and land beside your own bed.":" You step onto your bedroom rug. There is purple sand in your shoes."):
      `The gate opens for ${ranked.filter(e=>e.place===1).map(e=>e.name).join(" and ")}. Back at your locker, you find a fresh ticket tucked into your shoes. Someone has penciled in next season’s date.`;
    $("ending").classList.toggle("win",win);
    $("ending").innerHTML=`<p class="eyebrow">${tied?"Shared ":""}${places[you.place-1]} place · ${you.total.toFixed(1)} points</p><h2>${win?"Next stop, Earth.":"One more season on Vela."}</h2><p>${note}</p>`;
    renderTable();
  }
  $("reveal").addEventListener("click",()=>{
    if(season.phase!=="stage") return;
    season.phase="result"; alternate=false; persist();
    renderFinal(); playTone([392,494,587,784]);
    $("ending").setAttribute("tabindex","-1"); $("ending").focus({preventScroll:true});
    $("ending").scrollIntoView({block:"nearest",behavior:"instant"});
  });
  $("swap").addEventListener("click",()=>{alternate=!alternate;renderTable();playTone([392,523]);});

  for(const node of document.querySelectorAll("[data-portrait]")) node.innerHTML=art.portrait(node.dataset.portrait);
  window.addEventListener("hashchange",route);
  window.addEventListener("storage",event=>{
    if(event.key!==key && event.key!==null) return;
    season=readSeason(); choice=lastWorkout(); openingPortrait=false; alternate=false; route();
  });
  route();
})();
