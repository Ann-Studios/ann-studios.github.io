const stage = document.querySelector("#intro");
const replayButton = document.querySelector("#replay");
const status = document.querySelector("#sequence-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const loopEnabled = new URLSearchParams(window.location.search).get("loop") === "1";

const sequenceDuration = 5200;
const loopPause = 1100;
let completionTimer;
let loopTimer;

function clearSequenceTimers() {
  window.clearTimeout(completionTimer);
  window.clearTimeout(loopTimer);
}

function showFinalLogo() {
  clearSequenceTimers();
  stage.classList.remove("is-playing");
  stage.classList.add("is-complete");
  status.textContent = "Ann Studios logo displayed.";
}

function playIntro() {
  if (reducedMotion.matches) {
    showFinalLogo();
    return;
  }

  clearSequenceTimers();
  stage.classList.remove("is-playing", "is-complete");
  void stage.offsetWidth;
  stage.classList.add("is-playing");
  status.textContent = "Playing Ann Studios logo intro.";

  completionTimer = window.setTimeout(() => {
    stage.classList.add("is-complete");
    status.textContent = "Ann Studios logo intro complete.";

    if (loopEnabled) {
      loopTimer = window.setTimeout(playIntro, loopPause);
    }
  }, sequenceDuration);
}

replayButton.addEventListener("click", playIntro);

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

  if (!isTyping && (event.key.toLowerCase() === "r" || event.code === "Space")) {
    event.preventDefault();
    playIntro();
  }
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) showFinalLogo();
  else playIntro();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && loopEnabled) playIntro();
});

playIntro();
