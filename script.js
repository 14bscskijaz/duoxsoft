$(document).ready(function () {
    const words = ["Excellence", "Creativity", "Quality"];
    let index = 0;
    let letterIndex = 0;
    let direction = 1;
    let currentWord = words[0];
    let interval;

    function typeWriter() {
        const word = words[index];
        if (letterIndex < word.length) {
            $("#typing-text").text(
                $("#typing-text").text() + word.charAt(letterIndex)
            );
            letterIndex++;
        } else {
            clearInterval(interval);
            interval = setInterval(eraseText, 150); // Delay between typing and erasing
        }
    }

    function eraseText() {
        if (letterIndex >= 0) {
            const text = currentWord.substring(0, letterIndex);
            $("#typing-text").text(text);
            letterIndex--;
        } else {
            clearInterval(interval);
            index = (index + direction) % words.length;
            if (index < 0) index = words.length - 1;
            currentWord = words[index];
            interval = setInterval(typeWriter, 150); 
        }
    }

    interval = setInterval(typeWriter, 150);

    const $background = $('.background');
            let lastHoveredImage = $('.card').first().data('bg');

            function updateBackground(image) {
                $background.css('background-image', image);
            }
            updateBackground(lastHoveredImage);

            function attachHoverEvents() {
                $('.card').on('mouseenter', function() {
                    const bgImage = $(this).data('bg');
                    updateBackground(bgImage);
                    lastHoveredImage = bgImage;
                });

                $('.card').on('mouseleave', function() {
                    updateBackground(lastHoveredImage);
                });
            }

            $('#recipeCarousel').carousel({
                interval: 10000
            }).on('slide.bs.carousel', function() {
                attachHoverEvents();
            });

            $('.carousel .carousel-item').each(function() {
                var minPerSlide = 3;
                var next = $(this).next();
                if (!next.length) {
                    next = $(this).siblings(':first');
                }
                next.children(':first-child').clone().appendTo($(this));

                for (var i = 0; i < minPerSlide; i++) {
                    next = next.next();
                    if (!next.length) {
                        next = $(this).siblings(':first');
                    }
                    next.children(':first-child').clone().appendTo($(this));
                }
            });

            attachHoverEvents();
});