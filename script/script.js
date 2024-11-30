const form = document.getElementById('form');
const input = document.getElementById('message');
const messages = document.getElementById('messages');
const loader = document.getElementById('loader');

/* Handle async loader things */
const modules = [];
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
window.LOADED = (thing) => {
  modules.push(thing);
  if (modules.length === 2) loader.style.display = 'none';
}
window.speechSynthesis.onvoiceschanged = () => { 
  console.warn('voices are ready', window.speechSynthesis.getVoices()); 
  foundVoice = speechSynthesis.getVoices()
    .find(({ name }) => includesAnySubstring(name, femaleVoices));
  console.log("foundVoice,", foundVoice);
};

/* begin */
const createMessage = (sender, message) => {
  const div = document.createElement('div');

  div.className = sender;
  div.innerText = message;

  messages.append(div);
  div.scrollIntoView();
}
const includesAnySubstring = (string, array) => {
  console.log("name", string)
  console.log("array", array)
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

          // var text = prompt("What Text To Say?") || `Text To Speech is Over Powered`; // Ask What To Say or use Default
          
          T2S = window.speechSynthesis || speechSynthesis; // Storing speechSynthesis API as variable - T2S
          // var voiceOptioins = T2S.getVoices();
          // var voiceChoice = voiceOptioins[1];
          var utter = new SpeechSynthesisUtterance(answer); // To Make The Utterance
          if (foundVoice) utter.voice = foundVoice;
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
