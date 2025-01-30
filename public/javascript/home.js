var imageno =1;
var intervalId;

// Function to start the automatic slideshow
function startAutoSlide() {
    intervalId = setInterval(function() {
        nextimg(1);
    }, 3000); // Change 3000 to the desired interval in milliseconds (e.g., 5000 for 5 seconds)
}

// Function to stop the automatic slideshow
function stopAutoSlide() {
    clearInterval(intervalId);
}


displayimg(imageno);

function nextimg(n){
    displayimg(imageno += n)
}

function currentSlide(n){
    displayimg(imageno = n)
}

function displayimg(n){
    var i;
    var image = document.getElementsByClassName("image");
    var dots = document.getElementsByClassName("dot");

    if(n > image.length){
        imageno = 1;
    }

    if(n < 1){
        imageno = image.length;
    }

    for(i=0; i < image.length; i++){
        image[i].style.display = "none";
    }

    for(i=0; i < dots.length; i++){
        dots[i].className = dots[i].className.replace(" active", "");
    }

    image[imageno - 1].style.display ="block";
    dots[imageno - 1].className += " active";

}
// Start the automatic slideshow when the page loads
window.onload = function() {
    startAutoSlide();
};

// Pause the automatic slideshow when the user interacts with the slider
document.querySelector(".container").addEventListener("mouseover", stopAutoSlide);
document.querySelector(".container").addEventListener("mouseout", startAutoSlide);




let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');

    function showSlide(index) {
        if (index >= slides.length) {
            slideIndex = 0;
        } else if (index < 0) {
            slideIndex = slides.length - 1;
        }

        slides.forEach(slide => slide.style.display = 'none');
        slides[slideIndex].style.display = 'block';
    }

    function moveSlide(n) {
        slideIndex += n;
        showSlide(slideIndex);
    }

    showSlide(slideIndex);