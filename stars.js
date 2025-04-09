// Enhanced Star Animation with faster random movement and directional changes on click
document.addEventListener('DOMContentLoaded', () => {
    // Target only the hero section
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Create canvas element for stars
    const starsCanvas = document.createElement('canvas');
    starsCanvas.id = 'stars-canvas';
    
    // Set canvas size and position
    starsCanvas.style.position = 'absolute';
    starsCanvas.style.top = '0';
    starsCanvas.style.left = '0';
    starsCanvas.style.width = '100%';
    starsCanvas.style.height = '100%';
    starsCanvas.style.zIndex = '0';
    starsCanvas.style.pointerEvents = 'none'; // Change to 'none' to allow clicks to pass through
    
    // Insert canvas as first child of hero section
    heroSection.insertBefore(starsCanvas, heroSection.firstChild);
    
    // Get canvas context for drawing
    const ctx = starsCanvas.getContext('2d', { alpha: true });
    
    // Game state
    let stars = [];
    let mousePosition = null;
    let clickEffects = [];
    
    // Remove the star instructions text if it exists
    const starInstructions = document.querySelector('.star-instructions');
    if (starInstructions) {
        starInstructions.style.display = 'none';
    }

    // Make hero content clickable through to the canvas
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.pointerEvents = 'none'; // This makes the hero content click-through
        
        // But keep buttons and links clickable
        const clickableElements = heroContent.querySelectorAll('a, button');
        clickableElements.forEach(element => {
            element.style.pointerEvents = 'auto';
        });
    }
    
    // Resize canvas to match hero section
    function resizeCanvas() {
        const rect = heroSection.getBoundingClientRect();
        starsCanvas.width = rect.width;
        starsCanvas.height = rect.height;
        createStars();
    }
    
    // Create stars with optimized properties
    function createStars() {
        stars = [];
        
        // Create more stars based on screen size - INCREASED by 2x
        const maxStars = Math.min(240, Math.floor(starsCanvas.width * starsCanvas.height / 3000));
        
        for (let i = 0; i < maxStars; i++) {
            // Random position
            const x = Math.random() * starsCanvas.width;
            const y = Math.random() * starsCanvas.height;
            
            // White to blue color palette (theme matching)
            const blueIntensity = Math.random();
            const r = Math.floor(220 + blueIntensity * 35); // 220-255 (white to light blue)
            const g = Math.floor(220 + blueIntensity * 35); // 220-255
            const b = 255; // Always full blue
            const a = 0.6 + Math.random() * 0.4; // 0.6-1.0 opacity
            
            // Create star with faster initial velocity
            const star = {
                x,
                y,
                originalX: x,
                originalY: y,
                radius: Math.random() * 1.5 + 0.5,
                baseRadius: Math.random() * 1.5 + 0.5,
                color: `rgba(${r}, ${g}, ${b}, ${a})`,
                // Increased initial velocity for faster movement (increased by 2x)
                vx: (Math.random() - 0.5) * 1.0,
                vy: (Math.random() - 0.5) * 1.0,
                returnSpeed: 0.003 + Math.random() * 0.008, // Reduced return speed to allow more wandering
                twinkleSpeed: 0.003 + Math.random() * 0.005,
                twinklePhase: Math.random() * Math.PI *
                 2,
                directionChangeTimer: Math.random() * 100 // Random timer for direction changes
            };
            
            stars.push(star);
        }
    }
    
    // Draw stars with optimized rendering
    function drawStars() {
        // Use a semi-transparent clear for trail effect
        ctx.fillStyle = 'rgba(13, 26, 61, 0.15)';
        ctx.fillRect(0, 0, starsCanvas.width, starsCanvas.height);
        
        // Draw each star with glow effect
        stars.forEach(star => {
            // Apply twinkle effect
            star.twinklePhase += star.twinkleSpeed;
            const twinkleFactor = 0.7 + 0.3 * Math.sin(star.twinklePhase);
            const currentRadius = star.radius * twinkleFactor;
            
            ctx.beginPath();
            
            // Add glow effect (only for larger stars to improve performance)
            if (currentRadius > 1.2) {
                ctx.shadowBlur = currentRadius * 2;
                ctx.shadowColor = star.color;
            }
            
            ctx.arc(star.x, star.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();
            
            // Reset shadow for next drawing
            if (currentRadius > 1.2) {
                ctx.shadowBlur = 0;
            }
        });
        
        // Draw click effects
        clickEffects.forEach((effect, index) => {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                effect.x, effect.y, 0, 
                effect.x, effect.y, effect.radius
            );
            gradient.addColorStop(0, `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.alpha})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            // Update effect
            effect.radius += effect.speed;
            effect.alpha -= 0.015;
            
            // Remove faded effects
            if (effect.alpha <= 0) {
                clickEffects.splice(index, 1);
            }
        });
    }
    
    // Update star positions with improved physics
    function updateStars() {
        stars.forEach(star => {
            // Apply velocity with improved sensitivity
            star.x += star.vx;
            star.y += star.vy;
            
            // Decrease direction change timer
            star.directionChangeTimer -= 1;
            
            // Randomly change direction when timer reaches zero
            if (star.directionChangeTimer <= 0) {
                star.vx = (Math.random() - 0.5) * 1.0; // New random velocity - increased
                star.vy = (Math.random() - 0.5) * 1.0; // increased
                star.directionChangeTimer = Math.random() * 150 + 50; // Reset timer
            }
            
            // Apply more aggressive acceleration for more dynamic movement - increased
            star.vx += (Math.random() - 0.5) * 0.02;
            star.vy += (Math.random() - 0.5) * 0.02;
            
            // Limit max velocity for stability, but higher than before
            const maxVel = 1.2; // increased from 0.8
            star.vx = Math.max(-maxVel, Math.min(maxVel, star.vx));
            star.vy = Math.max(-maxVel, Math.min(maxVel, star.vy));
            
            // Very slight return to original position (just enough to keep stars in view)
            star.x += (star.originalX - star.x) * star.returnSpeed * 0.1;
            star.y += (star.originalY - star.y) * star.returnSpeed * 0.1;
            
            // Bounce off canvas edges with damping
            if (star.x < star.radius) {
                star.x = star.radius;
                star.vx *= -0.8;
            } else if (star.x > starsCanvas.width - star.radius) {
                star.x = starsCanvas.width - star.radius;
                star.vx *= -0.8;
            }
            
            if (star.y < star.radius) {
                star.y = star.radius;
                star.vy *= -0.8;
            } else if (star.y > starsCanvas.height - star.radius) {
                star.y = starsCanvas.height - star.radius;
                star.vy *= -0.8;
            }
        });
    }
    
    // Handle click or tap with direction change behavior
    function handleInteraction(x, y) {
        // Create click effect
        const colorOptions = [
            {r: 255, g: 255, b: 255}, // white
            {r: 200, g: 225, b: 255}, // light blue
            {r: 100, g: 180, b: 255}  // medium blue
        ];
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        
        clickEffects.push({
            x,
            y,
            radius: 2,
            maxRadius: 100,
            speed: 5, // Faster expanding effect
            alpha: 0.7,
            color
        });
        
        // Change direction of ALL stars on click (not just nearby ones)
        stars.forEach(star => {
            // Change direction completely with higher velocity
            star.vx = (Math.random() - 0.5) * 1.5; // Higher velocity on click (increased)
            star.vy = (Math.random() - 0.5) * 1.5; // Higher velocity on click (increased)
            
            // Reset direction change timer
            star.directionChangeTimer = Math.random() * 200 + 50;
            
            // Additionally apply force from click point for nearby stars
            const dx = star.x - x;
            const dy = star.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) { // Increased radius of effect
                const force = (1 - distance / 200) * 4; // Increased force
                star.vx += (dx / distance) * force;
                star.vy += (dy / distance) * force;
                
                // Reset twinkle phase for affected stars
                star.twinklePhase = Math.random() * Math.PI * 2;
            }
        });
    }
    
    // Since canvas now has pointer-events: none, we need to listen to clicks on the hero section
    function handleMouseClick(event) {
        const rect = heroSection.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        handleInteraction(mouseX, mouseY);
    }
    
    // Handle touch on mobile
    function handleTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = heroSection.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            handleInteraction(touchX, touchY);
        }
    }
    
    // Handle mouse move for subtle interaction
    function handleMouseMove(event) {
        const rect = heroSection.getBoundingClientRect();
        mousePosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        // More noticeable effect on nearby stars
        stars.forEach(star => {
            const dx = star.x - mousePosition.x;
            const dy = star.y - mousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) { // Increased radius of effect
                const force = (1 - distance / 80) * 0.08; // Increased force
                star.vx += (dx / distance) * force;
                star.vy += (dy / distance) * force;
            }
        });
    }
    
    // Main animation loop with requestAnimationFrame
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;
    
    function animate(currentTime) {
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > interval) {
            lastTime = currentTime - (deltaTime % interval);
            drawStars();
            updateStars();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Set up event listeners
    window.addEventListener('resize', resizeCanvas);
    // Changed from starsCanvas to heroSection for event listeners since canvas has pointer-events: none
    heroSection.addEventListener('click', handleMouseClick);
    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Initialize
    resizeCanvas();
    requestAnimationFrame(animate);
});