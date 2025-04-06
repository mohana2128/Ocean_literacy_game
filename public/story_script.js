 // script.js
const storyText = document.getElementById("story-text");

// Narration Story Content
const storyParts = [
  "Green turtles are one of the most ancient creatures on our planet, dating back millions of years.",
  "But today, they are endangered due to human activities.",
  "Pollution, especially plastic waste, is destroying their habitats.",
  "Many turtles mistake plastic bags for jellyfish, leading to fatal consequences.",
  "Climate change is another major threat, affecting their nesting beaches and gender ratios.",
  "Together, we can save these gentle creatures by reducing waste and protecting their habitats."
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
  } else {
    narrateStory();
  }
}