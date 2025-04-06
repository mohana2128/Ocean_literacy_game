const storyText = document.getElementById("story-text");

// Narration Story Content for Vaquitas
const storyParts = [
  "Vaquitas are the world's most endangered marine mammals, found only in the northern Gulf of California, Mexico.",
  "Their population has declined drastically due to bycatch in illegal fishing for Totoaba fish.",
  "The swim bladder of Totoaba is highly prized, leading to the widespread use of deadly gillnets.",
  "Less than 10 Vaquitas remain today, making conservation efforts critical for their survival.",
  "Together, we can save Vaquitas by ending illegal fishing and protecting their habitat."
];

let currentPart = 0;
let charIndex = 0;

// Typing Effect
function typeText() {
  if (charIndex < storyParts[currentPart].length) {
    storyText.textContent += storyParts[currentPart][charIndex];
    charIndex++;
    setTimeout(typeText, 50); // Adjust typing speed
  } else if (currentPart < storyParts.length - 1) {
    currentPart++;
    charIndex = 0;
    setTimeout(() => {
      storyText.textContent = ""; // Clear for the next part
      typeText();
    }, 2000); // Pause before next part
  }
}

// Start Typing
typeText();

// Voice Narration
const speech = new SpeechSynthesisUtterance();
speech.rate = 1; // Speed of speech
speech.pitch = 1; // Pitch of voice
speech.volume = 1; // Volume of speech

// Read the story
function narrateStory() {
  if (currentPart < storyParts.length) {
    speech.text = storyParts[currentPart];
    window.speechSynthesis.speak(speech);
    speech.onend = () => {
      currentPart++;
      narrateStory();
    };
  }
}

// Play Narration
narrateStory();

// Mute/Unmute Voice
function toggleVoice() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.getElementById("mute-button").textContent = "🔊 Unmute";
  } else {
    narrateStory();
    document.getElementById("mute-button").textContent = "🔇 Mute";
  }
}

// Add event listener for mute/unmute button
document.getElementById("mute-button").addEventListener("click", toggleVoice);
