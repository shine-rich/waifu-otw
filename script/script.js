const form = document.getElementById('form');
const input = document.getElementById('message');
const messages = document.getElementById('messages');
const loader = document.getElementById('loader');

var foundVoice = null;
const femaleVoices = [
  'Female',
  'Susan',
  'Moira',
  'Tessa',
  'Karen',
  'Mei-Ja',
  'Tian-Tian',
  'Kyoko',
  'Zira'
];
window.speechSynthesis.onvoiceschanged = () => { 
  console.warn('voices are ready', window.speechSynthesis.getVoices()); 
  foundVoice = speechSynthesis.getVoices()
    .find(({ name }) => includesAnySubstring(name, femaleVoices));
  console.log("foundVoice,", foundVoice);
};

/* Handle async loader things */
const modules = [];

window.LOADED = (thing) => {
  modules.push(thing);
  if (modules.length === 2) loader.style.display = 'none';
}

/* begin */
const createMessage = (sender, message) => {
  const div = document.createElement('div');

  div.className = sender;
  div.innerText = message;

  messages.append(div);
  div.scrollIntoView();
}

const includesAnySubstring = (string, array) => {
  return array.some(substring => string.includes(substring));
}

const processMessage = (message) => {
  // random delay for "authenticity"
  const delay = Math.random() * 2000 + 300;

  NLP
    .process(message)
    .then((e) => {
      const answer = e.answer || "Sorry, I don't speak that language";

      var T2S; 
      if("speechSynthesis" in window || speechSynthesis){ // Checking If speechSynthesis Is Supported.
          T2S = window.speechSynthesis || speechSynthesis; // Storing speechSynthesis API as variable - T2S
          var utter = new SpeechSynthesisUtterance(answer); // To Make The Utterance
          if (foundVoice) utter.voice = foundVoice;

          var mouthValue = 0;
          window.APP.ticker.add(() => {
            // mimic the interpolation value, 0-1
            mouthValue = Math.sin(performance.now() / 200) / 2 + 0.5;
          });
          const updateFn = window.MODEL.internalModel.motionManager.update;

          window.MODEL.internalModel.motionManager.update = () => {
            updateFn.call(window.MODEL.internalModel.motionManager);

            // overwrite the parameter after calling original update function
            window.MODEL.internalModel.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthValue);
          };
          // start mouth movement when speaking starts
          utter.onstart = () => { window.APP.ticker.start() }
          
          // stop mouth movement after speaking
          const clear = () => { window.APP.ticker.stop() }
          utter.onerror = clear;
          utter.onend = clear;

          T2S.speak(utter); // To Speak The Utterance
          
          window.onbeforeunload = function(){
              T2S.cancel(); // To Stop Speaking If the Page Is Closed.
          }
      }

      setTimeout(() => createMessage('chiai', answer), delay)
    });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = input.value.trim();

  if (!message.length) return;

  createMessage('me', message);
  processMessage(message);

  input.value = '';
});
