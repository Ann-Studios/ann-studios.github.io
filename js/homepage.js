let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let thumbnails = document.querySelectorAll('.thumbnail .item');

// config param
let countItem = items.length;
let itemActive = 0;
// event next click
next.onclick = function () {
    itemActive = itemActive + 1;
    if (itemActive >= countItem) {
        itemActive = 0;
    }
    showSlider();
}
//event prev click
prev.onclick = function () {
    itemActive = itemActive - 1;
    if (itemActive < 0) {
        itemActive = countItem - 1;
    }
    showSlider();
}
// auto run slider
let refreshInterval = setInterval(() => {
    next.click();
}, 5000)
function showSlider() {
    // remove item active old
    let itemActiveOld = document.querySelector('.slider .list .item.active');
    let thumbnailActiveOld = document.querySelector('.thumbnail .item.active');
    itemActiveOld.classList.remove('active');
    thumbnailActiveOld.classList.remove('active');

    // active new item
    items[itemActive].classList.add('active');
    thumbnails[itemActive].classList.add('active');

    // clear auto time run slider
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        next.click();
    }, 5000)
}

// click thumbnail
thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        itemActive = index;
        showSlider();
    })
})

// Function to handle the modal popup for each game
function openModal(gameName) {
    // Get the corresponding modal element
    var modal = document.getElementById(gameName + "Modal");

    // Display the modal
    modal.style.display = "block";

    // Get the close button inside the modal
    var closeButton = modal.querySelector('.close');

    // When the user clicks on the close button, close the modal
    closeButton.addEventListener('click', function () {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", function () {
    // Get all the game names
    var gameNames = document.querySelectorAll('.game-name');

    // Add click event listeners to each game name
    gameNames.forEach(function (game) {
        game.addEventListener('click', function () {
            // Extract the game name from the clicked element
            var gameName = game.innerText.toLowerCase().replace(/\s+/g, '');

            // Open the corresponding modal for the clicked game
            openModal(gameName);
        });
    });
});
