const form = document.querySelector("#chat-form");
const promptBox = document.querySelector("#prompt");
const messages = document.querySelector("#messages");
const micButton = document.querySelector("#mic-button");
const micStatus = document.querySelector("#mic-status");
const systemStatus = document.querySelector("#system-status");
const coreState = document.querySelector("#core-state");
const aiMetric = document.querySelector("#ai-metric");
const messageCount = document.querySelector("#message-count");

let count = 1;
const savedMessages = JSON.parse(localStorage.getItem("jarvis-chat") || "[]");

function addMessage(role, text, save = true) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  const tag = document.createElement("span");
  tag.className = "message-tag";
  tag.textContent = role === "user" ? "YOU" : "JARVIS";
  const p = document.createElement("p");
  p.textContent = text;
  item.append(tag, p);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  count++;
  messageCount.textContent = `${String(count).padStart(2, "0")} / MESSAGES`;
  if (save) {
    savedMessages.push({ role, text });
    localStorage.setItem("jarvis-chat", JSON.stringify(savedMessages.slice(-40)));
  }
}

savedMessages.forEach(m => addMessage(m.role, m.text, false));

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage("user", clean);
  promptBox.value = "";
  coreState.textContent = "PROCESSING INPUT";
  systemStatus.textContent = "PROCESSING";
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    // Backend is added in the next build step. Never put API keys in browser code.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: clean })
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const data = await response.json();
    if (!data.reply) throw new Error("The backend returned no reply.");
    addMessage("assistant", data.reply);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply));
    }
  } catch (error) {
    addMessage("assistant", "The interface is working, but my secure AI backend is not connected yet. Next we will connect Groq without exposing your API key.");
    console.error(error);
  } finally {
    button.disabled = false;
    coreState.textContent = "AWAITING INPUT";
    systemStatus.textContent = "SYSTEM ONLINE";
    promptBox.focus();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(promptBox.value);
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;
  let finalTranscript = "";
  micButton.addEventListener("click", () => {
    try {
      finalTranscript = "";
      recognition.start();
      micStatus.textContent = "VOICE INPUT: LISTENING";
      coreState.textContent = "LISTENING";
    } catch (e) {
      micStatus.textContent = "VOICE INPUT: ALREADY ACTIVE";
    }
  });
  recognition.onresult = event => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    promptBox.value = finalTranscript || interim;
  };
  recognition.onend = () => {
    micStatus.textContent = "VOICE INPUT: READY";
    coreState.textContent = "AWAITING INPUT";
    if (finalTranscript.trim()) sendMessage(finalTranscript);
  };
  recognition.onerror = () => {
    micStatus.textContent = "VOICE INPUT: CHECK MICROPHONE PERMISSION";
    coreState.textContent = "AWAITING INPUT";
  };
} else {
  micButton.disabled = true;
  micStatus.textContent = "VOICE INPUT: NOT SUPPORTED IN THIS BROWSER";
}

aiMetric.textContent = "BACKEND PENDING";
