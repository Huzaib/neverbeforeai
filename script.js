document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const cards = carousel.querySelector('.carousel--cards');

    let activeIndex = 3;
    const totalCards = 7;

    function createClassName(index, hover = false) {
        return `carousel--card carousel--card-${index}${hover ? ' carousel--card-hover' : ''}`;
    }

    function shift(direction) {
        // Pause all videos
        cards.querySelectorAll('video').forEach(video => video.pause());

        // Shift card indexes
        for (const card of cards.children) {
            const currentIndex = Number(card.getAttribute('data-card-id'));
            const newIndex = (currentIndex + direction + totalCards) % totalCards;
            card.setAttribute('data-card-id', newIndex);
            card.setAttribute('class', createClassName(newIndex));
        }

        // Update active index
        activeIndex = (activeIndex - direction + totalCards) % totalCards;

        // Play center video
        const centerVideo = cards.querySelector(`.carousel--card-3 video`);
        if (centerVideo) centerVideo.play();
    }

    // Add click event listeners to all videos
    cards.querySelectorAll('video').forEach((video, index) => {
        video.addEventListener('click', () => {
            // Determine direction based on video's position
            const cardElement = video.closest('.carousel--card');
            const currentCardId = Number(cardElement.getAttribute('data-card-id'));
            
            // If video is on the left side, shift right
            if (currentCardId < 3) {
                shift(1);
            } 
            // If video is on the right side, shift left
            else if (currentCardId > 3) {
                shift(-1);
            }
        });
    });

    // Initial play of center video
    const initialCenterVideo = cards.querySelector(`.carousel--card-3 video`);
    if (initialCenterVideo) initialCenterVideo.play();
});