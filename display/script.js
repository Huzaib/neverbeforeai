document.addEventListener('DOMContentLoaded', () => {
    // Carousel logic
    const carousel = document.getElementById('carousel');
    const cards = carousel.querySelector('.carousel--cards');
    const contactForm = document.getElementById('contact-form');
    const btn = document.getElementById('button');
    
    let activeIndex = 3;
    const totalCards = 7;

    function createClassName(index) {
        return `carousel--card carousel--card-${index}`;
    }

    function shift(direction) {
        // Pause only visible videos to improve performance
        cards.querySelectorAll('.carousel--card video').forEach(video => video.pause());

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
        if (centerVideo) {
            centerVideo.play();
        } else {
            console.warn('No center video found');
        }
    }

    // Add click event listeners to all videos
    cards.querySelectorAll('video').forEach((video) => {
        video.addEventListener('click', () => {
            const cardElement = video.closest('.carousel--card');
            const currentCardId = Number(cardElement.getAttribute('data-card-id'));

            if (currentCardId < 3) {
                shift(1);
            } else if (currentCardId > 3) {
                shift(-1);
            }
        });
    });

    // Initial play of center video
    const initialCenterVideo = cards.querySelector(`.carousel--card-3 video`);
    if (initialCenterVideo) {
        initialCenterVideo.play();
    } else {
        console.warn('Initial center video not found');
    }

    // EmailJS: Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form elements
            const nameInput = this.querySelector('input[name="name"]');
            const emailInput = this.querySelector('input[name="email"]');
            const messageInput = this.querySelector('textarea[name="message"]');

            // Validate inputs
            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                alert('Please fill out all fields');
                return;
            }
            
            // Disable submit button during send
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Send email using EmailJS
            const templateParams = {
                from_name: nameInput.value,
                from_email: emailInput.value,
                message: messageInput.value,
            };

            // Comprehensive error handling
            emailjs.send("default_service", "template_fg2e5j3", templateParams)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    submitButton.textContent = 'Send Message';
                    submitButton.disabled = false;
                    alert('Your message has been sent successfully!');
                    contactForm.reset();
                })
                .catch((error) => {
                    console.error('FAILED...', error);
                    console.error('Error details:', {
                        status: error.status,
                        text: error.text,
                        type: typeof error,
                        fullError: JSON.stringify(error)
                    });

                    submitButton.textContent = 'Send Message';
                    submitButton.disabled = false;
                    alert('Sorry, there was an issue sending your message. Please try again.');
                });
        });
    }
});