const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

async function initThree() {
  try {
    const THREE = await import("./vendor/three.module.min.js");
const canvas = document.querySelector("#world");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090707, 0.055);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.1, 8.6);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const stage = new THREE.Group();
stage.position.set(2.75, 0.1, 0);
scene.add(stage);

const coreMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xef2b22,
  emissive: 0x4d0300,
  emissiveIntensity: 0.95,
  metalness: 0.72,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.14,
});

const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.88, 0.23, 180, 24, 2, 3), coreMaterial);
core.rotation.set(0.7, 0.2, -0.25);
stage.add(core);

const inner = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.62, 2),
  new THREE.MeshBasicMaterial({ color: 0xffd8c7, wireframe: true, transparent: true, opacity: 0.28 })
);
stage.add(inner);

const rings = new THREE.Group();
[
  { radius: 1.55, tube: 0.017, color: 0xef2b22, tilt: [1.2, 0.1, 0.3] },
  { radius: 2.05, tube: 0.011, color: 0xf2ede5, tilt: [0.4, 1.15, -0.25] },
  { radius: 2.65, tube: 0.008, color: 0xef2b22, tilt: [1.3, 0.8, 0.8] },
].forEach(({ radius, tube, color, tilt }) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 10, 180),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: color === 0xf2ede5 ? 0.32 : 0.72 })
  );
  ring.rotation.set(...tilt);
  rings.add(ring);
});
stage.add(rings);

const shardGeometry = new THREE.TetrahedronGeometry(0.06, 0);
const shardMaterial = new THREE.MeshStandardMaterial({ color: 0xef2b22, metalness: 0.7, roughness: 0.25 });
const shards = new THREE.Group();
for (let i = 0; i < 28; i += 1) {
  const shard = new THREE.Mesh(shardGeometry, shardMaterial);
  const radius = 2.7 + Math.random() * 2.3;
  const angle = Math.random() * Math.PI * 2;
  shard.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4.8, Math.sin(angle) * radius * 0.35);
  shard.scale.setScalar(0.7 + Math.random() * 2.5);
  shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  shards.add(shard);
}
stage.add(shards);

const starCount = window.innerWidth < 700 ? 350 : 700;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  starPositions[i * 3] = (Math.random() - 0.5) * 24;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0xf2ede5, size: 0.018, transparent: true, opacity: 0.52, sizeAttenuation: true })
);
scene.add(stars);

scene.add(new THREE.AmbientLight(0xffeee8, 0.35));
const keyLight = new THREE.PointLight(0xff3a30, 34, 18, 2);
keyLight.position.set(4.2, 2.6, 4.5);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xffffff, 18, 18, 2);
rimLight.position.set(0, -3.5, 1.5);
scene.add(rimLight);

const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

const clock = new THREE.Clock();
let frameId;
function animate() {
  const elapsed = clock.getElapsedTime();
  const scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 2);
  const motionScale = prefersReducedMotion.matches ? 0.08 : 1;

  core.rotation.x = 0.7 + elapsed * 0.16 * motionScale;
  core.rotation.y = 0.2 + elapsed * 0.22 * motionScale;
  inner.rotation.x = -elapsed * 0.15 * motionScale;
  inner.rotation.y = elapsed * 0.21 * motionScale;
  rings.rotation.y = elapsed * 0.055 * motionScale;
  rings.rotation.z = elapsed * 0.035 * motionScale;
  shards.rotation.y = -elapsed * 0.035 * motionScale;
  stars.rotation.y = elapsed * 0.006 * motionScale;

  stage.rotation.y += ((pointer.x * 0.13) - stage.rotation.y) * 0.035;
  stage.rotation.x += ((-pointer.y * 0.09) - stage.rotation.x) * 0.035;
  stage.position.y = 0.1 + Math.sin(elapsed * 0.7) * 0.09 * motionScale - scrollProgress * 0.45;
  stage.scale.setScalar(1 - scrollProgress * 0.08);

  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
}

function positionStage() {
  if (window.innerWidth < 700) {
    stage.position.x = 0.85;
    stage.position.z = -1.4;
    stage.scale.setScalar(0.72);
  } else if (window.innerWidth < 1000) {
    stage.position.x = 2;
    stage.position.z = -0.8;
    stage.scale.setScalar(0.9);
  } else {
    stage.position.x = 2.75;
    stage.position.z = 0;
    stage.scale.setScalar(1);
  }
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  positionStage();
}

window.addEventListener("resize", resize, { passive: true });
positionStage();
animate();
requestAnimationFrame(() => canvas.classList.add("ready"));

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(frameId);
  } else {
    clock.getDelta();
    animate();
  }
});

  } catch (error) {
    console.warn("The 3D background could not start; the site remains fully usable.", error);
  }
}

initThree();

const header = document.querySelector(".site-header");
const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 32);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
});
navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
}));

document.documentElement.classList.add("motion-ready");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -4%" });
document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const carousel = document.querySelector("#game-carousel");
const carouselCards = [...carousel.querySelectorAll(".preview-card")];
const carouselCurrent = document.querySelector("#carousel-current");
const carouselProgress = document.querySelector("#carousel-progress-bar");
const carouselPrevious = document.querySelector("#carousel-prev");
const carouselNext = document.querySelector("#carousel-next");
const carouselImage = document.querySelector("#carousel-image");
const carouselTitle = document.querySelector("#carousel-title");
const carouselGenre = document.querySelector("#carousel-genre");
const carouselDescription = document.querySelector("#carousel-description");
const carouselDetails = document.querySelector("#carousel-details");
const carouselTray = document.querySelector(".carousel-preview-tray");
let activeGameIndex = 0;
let carouselSwapTimer;

function updateCarouselStatus(index) {
  activeGameIndex = (index + carouselCards.length) % carouselCards.length;
  const selected = carouselCards[activeGameIndex];
  carouselCurrent.textContent = String(activeGameIndex + 1).padStart(2, "0");
  carouselProgress.style.width = `${((activeGameIndex + 1) / carouselCards.length) * 100}%`;
  carousel.style.setProperty("--slide-accent", selected.dataset.accent);
  carouselCards.forEach((card, cardIndex) => {
    const isActive = cardIndex === activeGameIndex;
    card.classList.toggle("active", isActive);
    card.setAttribute("aria-selected", String(isActive));
  });

  window.clearTimeout(carouselSwapTimer);
  carousel.classList.add("switching");
  carouselSwapTimer = window.setTimeout(() => {
    carouselImage.src = selected.dataset.image;
    carouselImage.alt = `${selected.dataset.title} preview`;
    carouselTitle.textContent = selected.dataset.title;
    carouselGenre.textContent = selected.dataset.genre;
    carouselDescription.textContent = selected.dataset.description;
    carouselDetails.dataset.game = selected.dataset.game;
    carousel.classList.remove("switching");
  }, prefersReducedMotion.matches ? 0 : 160);

  carouselTray.scrollTo({
    left: selected.offsetLeft - carouselTray.offsetLeft,
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
}

function moveToGame(index) {
  const nextIndex = (index + carouselCards.length) % carouselCards.length;
  updateCarouselStatus(nextIndex);
}

carouselCards.forEach((card, index) => card.addEventListener("click", () => moveToGame(index)));
carouselPrevious.addEventListener("click", () => moveToGame(activeGameIndex - 1));
carouselNext.addEventListener("click", () => moveToGame(activeGameIndex + 1));
carousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    moveToGame(activeGameIndex + (event.key === "ArrowRight" ? 1 : -1));
  }
});

updateCarouselStatus(0);

const games = {
  "chicken-mafia": {
    title: "Chicken Mafia",
    genre: "Strategy / Empire",
    image: "./assets/keyart-chicken-mafia.webp",
    description: "Recruit your crew, take over rival coops and build an empire where loyalty, strategy and a well-timed getaway decide who rules the roost.",
  },
  "bear-baker": {
    title: "Bear Baker",
    genre: "Cozy / Management",
    image: "./assets/keyart-bear-baker.webp",
    description: "Mix, bake and decorate delightful treats, serve a cast of adorable customers and grow one tiny bakery into a warm, wonderful legend.",
  },
  "duck-racer": {
    title: "Duck Racer",
    genre: "Arcade / Racing",
    image: "./assets/keyart-duck-racer.webp",
    description: "Drift through farm fields, frozen lakes and neon city streets. Master wild power-ups and prove you are the fastest duck on any track.",
  },
  "hamster-hacker": {
    title: "Hamster Hacker",
    genre: "Cyber / Adventure",
    image: "./assets/keyart-hamster-hacker.webp",
    description: "Scan, infiltrate and outsmart high-tech security as a tiny hacker with huge ambition, ingenious gadgets and a taste for impossible jobs.",
  },
  "pigeon-empire": {
    title: "Pigeon Empire",
    genre: "City / Builder",
    image: "./assets/keyart-pigeon-empire.webp",
    description: "Gather resources, build your flock and rise from humble pavement pecker to the undisputed ruler of a living, competitive city.",
  },
};

const dialog = document.querySelector("#game-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogGenre = document.querySelector("#dialog-genre");
const dialogImage = document.querySelector("#dialog-image");
const dialogDescription = document.querySelector("#dialog-description");
const closeButton = document.querySelector(".dialog-close");
let lastTrigger;

function openDialog(gameId, trigger) {
  const game = games[gameId];
  if (!game) return;
  lastTrigger = trigger;
  dialogTitle.textContent = game.title;
  dialogGenre.textContent = game.genre;
  dialogImage.src = game.image;
  dialogImage.alt = `${game.title} concept art`;
  dialogDescription.textContent = game.description;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog() {
  dialog.close();
  document.body.classList.remove("dialog-open");
  lastTrigger?.focus();
}

document.querySelectorAll(".card-open").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.game, button));
});
closeButton.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
document.querySelector("[data-close-dialog]").addEventListener("click", closeDialog);

document.querySelector("#year").textContent = new Date().getFullYear();
