
const state = { companion: false };



const scenes = {
  start: {
    label: "Intake",
    text: "You are locked in Cell Block C. You have been here four years for speaking out against the government.\n\nTonight, many guards are away dealing with trouble in another wing. Few guards are watching you. This might be your only chance to escape.",
    choices: [
      { glyph: "A", label: "Wait for the guards to change shift tonight", next: "nightWatch" },
      { glyph: "B", label: "Move now, while the guards are busy", next: "alarmChaos" }
    ]
  },

  nightWatch: {
    label: "Late at Night",
    text: "You wait. The lights in the hallway grow dim, just like every night. You have studied this hallway for months. Two paths could lead you toward the outer wall.",
    choices: [
      { glyph: "A", label: "Pick the lock on the supply room door", next: "pickLock" },
      { glyph: "B", label: "Crawl through the old vent", next: "ventShaft" }
    ]
  },

  pickLock: {
    label: "The Supply Room Door",
    text: "You kneel by the door and try to open the lock with a sharpened spoon. Every second that passes, a guard could walk by.",
    choices: [],
    resolve: () => (Math.random() * 100 < 60)
      ? { text: "The lock opens! You slip through the door into the dark, holding your breath.", next: "gate" }
      : { text: "The spoon breaks. You hear footsteps coming around the corner.", next: "endingCaptured" }
  },

  ventShaft: {
    label: "The Vent",
    text: "You pull the metal cover off and climb inside the narrow vent. It creaks loudly as you crawl through it.",
    choices: [],
    resolve: () => (Math.random() * 100 < 55)
      ? { text: "You make it to the other side without being seen. You keep moving toward the wall.", next: "gate" }
      : { text: "The metal cover falls and makes a loud noise. An alarm starts to ring.", next: "endingCaptured" }
  },

  alarmChaos: {
    label: "The East Wing",
    text: "Smoke fills the hallway and people are shouting. Through the noise, you hear someone calling for help. It's a prisoner named Mira, locked alone in a small cell.",
    choices: [
      { glyph: "A", label: "Stop and break the lock to free her", next: "freeMira" },
      { glyph: "B", label: "Keep moving. It's too risky to stop.", next: "leaveMira" }
    ]
  },

  freeMira: {
    label: "A Choice Made",
    text: "You push hard against the door until the lock breaks. Mira runs out and grabs your arm. \"Thank you,\" she says. \"I won't forget this.\" You run together toward the wall.",
    choices: [],
    resolve: () => { state.companion = true; return { text: "", next: "gate" }; }
  },

  leaveMira: {
    label: "A Choice Made",
    text: "You keep running and her voice fades behind you. You tell yourself you had no other choice. You almost believe it.",
    choices: [],
    resolve: () => ({ text: "", next: "gate" })
  },

  gate: {
    label: "The Outer Wall",
    text: "You reach the last checkpoint. One guard tower stands between you and the fence. You must make one more choice.",
    choices: [
      { glyph: "A", label: "Sneak through quietly, by yourself", next: "endingAlone" },
      { glyph: "B", label: "Turn on the floodlights so other prisoners can run too", next: "diversion" }
    ]
  },

  diversion: {
    label: "The Big Risk",
    text: "You flip the switch. Every light in the yard flashes bright, then goes dark. Alarms start blaring. Behind you, cell doors begin to open.",
    choices: [],
    resolve: () => (Math.random() * 100 < 50)
      ? { text: "In all the noise and confusion, many people run toward the trees. You are one of them.", next: "endingTogether" }
      : { text: "The guard in the tower turns his light on you before you reach the fence.", next: "endingCaptured" }
  },

  endingCaptured: {
    label: "Verdict",
    text: "Guards grab your arms and pull you back. The cell door shuts again, harder this time. Someone adds another note to your file. Freedom always has a price — tonight, you couldn't pay it.",
    ending: "captured"
  },

  endingAlone: {
    label: "Verdict",
    text: () => state.companion
      ? "You and Mira sneak through the fence together and disappear into the trees. No alarms follow you. You are free — but you know other people were left behind who could have been free too. Freedom always comes with a cost. You will be paying it for a long time."
      : "You sneak through the fence by yourself and disappear into the trees. No alarms follow you. You are free — but completely alone with that thought. Behind you, the cells are still full. Freedom always comes with a cost. You will be paying it for a long time.",
    ending: "alone"
  },

  endingTogether: {
    label: "Verdict",
    text: () => state.companion
      ? "You, Mira, and many others run into the dark as bright lights flash behind you. Not everyone made it out safely — you heard the guards shooting, and you know some people were caught. But more people are free tonight because of you. That is the price, and you paid it."
      : "Many prisoners run into the dark around you as bright lights flash behind you. Not everyone made it out safely — you heard the guards shooting, and you know some people were caught. But more people are free tonight because of you. That is the price, and you paid it."
    ,
    ending: "together"
  }
};


const storyEl = document.getElementById('storyText');
const choicesEl = document.getElementById('choices');
const labelEl = document.getElementById('sceneLabel');

function typeText(text, onDone){
  storyEl.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  let i = 0;
  const speed = 100;

  function step(){
    if(i <= text.length){
      storyEl.textContent = text.slice(0, i);
      storyEl.appendChild(cursor);
      i++;
      setTimeout(step, speed);
    } else {
      cursor.remove();
      if(onDone) onDone();
    }
  }
  step();
}

function renderScene(key){
  const scene = scenes[key];
  labelEl.textContent = scene.label;
  choicesEl.classList.add('hidden');
  choicesEl.innerHTML = '';

  const text = typeof scene.text === 'function' ? scene.text() : scene.text;

  typeText(text, () => {
    if(scene.ending){
      showEnding(scene.ending);
      return;
    }
    if(scene.resolve){
      const result = scene.resolve();
      setTimeout(() => {
        if(result.text){
          typeText(result.text, () => renderScene(result.next));
        } else {
          renderScene(result.next);
        }
      }, 400);
      return;
    }
    if(scene.choices && scene.choices.length){
      scene.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="glyph">${choice.glyph}</span><span>${choice.label}</span><span class="redact" style="--d:${idx * 0.15 + 0.1}s"></span>`;
        btn.onclick = () => renderScene(choice.next);
        choicesEl.appendChild(btn);
      });
      choicesEl.classList.remove('hidden');
    }
  });
}

function showEnding(type){
  const wrap = document.createElement('div');
  wrap.className = 'ending-wrap';

  const stamp = document.createElement('div');
  stamp.className = 'stamp ' +
    (type === 'captured' ? 'stamp-captured' : type === 'alone' ? 'stamp-alone' : 'stamp-together');
  stamp.textContent =
    type === 'captured' ? 'RECAPTURED' :
    type === 'alone' ? 'ESCAPED — ALONE' :
    'ESCAPED — TOGETHER';

  const restart = document.createElement('button');
  restart.className = 'restart-btn';
  restart.textContent = 'Play Again';
  restart.onclick = () => { state.companion = false; renderScene('start'); };

  wrap.appendChild(stamp);
  choicesEl.innerHTML = '';
  choicesEl.appendChild(wrap);
  choicesEl.appendChild(restart);
  choicesEl.classList.remove('hidden');
}

renderScene('start');