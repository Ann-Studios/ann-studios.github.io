// countdown.js

const websiteRelatedOneLiners = [
    "We're sprucing up. Stay tuned for the makeover!",
    "We're under construction. Sorry for the dust!",
    "Hang tight! We're getting a facelift.",
    "We're taking a short nap. We'll wake up soon!",
    "Why did we go to therapy? We had too many broken links!",
    "We're like fine wine—we're aging gracefully!",
    "Don't worry, we'll be back with a fresh look!",
];

let currentIndex = 0;

function displayWebsiteOneLiner() {
    document.getElementById("website-one-liner").textContent = websiteRelatedOneLiners[currentIndex];
    currentIndex = (currentIndex + 1) % websiteRelatedOneLiners.length;
}

function updateCountdown() {
    const endDate = new Date("2024-07-25T00:00:00").getTime();
    const now = new Date().getTime();
    const timeRemaining = endDate - now;

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days.toString().padStart(2, '0');
    document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);
setInterval(displayWebsiteOneLiner, 5000);
