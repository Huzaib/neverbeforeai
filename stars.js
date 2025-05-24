// Interactive Constellation Animation
document.addEventListener('DOMContentLoaded', () => {
    // Target only the hero section
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    
    // Insert canvas as first child of hero section
    heroSection.insertBefore(canvas, heroSection.firstChild);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Stars and effects arrays
    let stars = [];
    let constellationLines = [];
    let blastWaves = [];
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationId;
    
    // Resize canvas
    function resizeCanvas() {
        const rect = heroSection.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        console.log('Canvas resized:', canvas.width, 'x', canvas.height);
        initStars();
    }
    
    // Initialize stars
    function initStars() {
        stars = [];
        blastWaves = [];
        particles = [];
        
        const numberOfStars = Math.min(300, Math.floor(canvas.width * canvas.height / 5000));
        console.log('Creating', numberOfStars, 'stars');
        
        for (let i = 0; i < numberOfStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                baseSize: Math.random() * 3.5 + 0.5,
                size: 0,
                brightness: Math.random() * 0.6 + 0.4,
                pulseSpeed: Math.random() * 0.03 + 0.02,
                pulsePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.05 + 0.02,
                twinklePhase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                orbitRadius: Math.random() * 30 + 10,
                orbitSpeed: Math.random() * 0.002 + 0.001,
                orbitPhase: Math.random() * Math.PI * 2
            });
        }
        console.log('Stars created:', stars.length);
    }
    
    // Find nearby stars for constellation
    function findNearbyStars(x, y, radius) {
        return stars.filter(star => {
            const dx = star.x - x;
            const dy = star.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }
    
    // Update constellation lines based on mouse position
    function updateConstellations() {
        constellationLines = [];
        const nearbyStars = findNearbyStars(mouseX, mouseY, 200);
        
        // Connect nearby stars to each other
        for (let i = 0; i < nearbyStars.length; i++) {
            for (let j = i + 1; j < nearbyStars.length; j++) {
                const star1 = nearbyStars[i];
                const star2 = nearbyStars[j];
                const dx = star2.x - star1.x;
                const dy = star2.y - star1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const distanceToMouse1 = Math.sqrt((star1.x - mouseX) ** 2 + (star1.y - mouseY) ** 2);
                    const distanceToMouse2 = Math.sqrt((star2.x - mouseX) ** 2 + (star2.y - mouseY) ** 2);
                    const averageDistance = (distanceToMouse1 + distanceToMouse2) / 2;
                    const opacity = Math.max(0, 1 - averageDistance / 200);
                    
                    constellationLines.push({
                        x1: star1.x,
                        y1: star1.y,
                        x2: star2.x,
                        y2: star2.y,
                        opacity: opacity * 0.5,
                        brightness: (star1.brightness + star2.brightness) / 2
                    });
                }
            }
        }
    }
    
    // Update stars
    function update() {
        // Update star positions with dynamic movement
        stars.forEach(star => {
            // Pulse effect
            star.pulsePhase += star.pulseSpeed;
            star.twinklePhase += star.twinkleSpeed;
            star.orbitPhase += star.orbitSpeed;
            
            // Dynamic size with twinkling
            const pulse = Math.sin(star.pulsePhase) * 0.3 + 0.7;
            const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5;
            star.size = star.baseSize * pulse * (0.5 + twinkle * 0.5);
            
            // Orbital movement around original position
            const orbitX = Math.cos(star.orbitPhase) * star.orbitRadius * 0.3;
            const orbitY = Math.sin(star.orbitPhase) * star.orbitRadius * 0.3;
            
            // Dynamic velocity changes
            star.vx += (Math.random() - 0.5) * 0.02;
            star.vy += (Math.random() - 0.5) * 0.02;
            
            // Apply velocity with damping
            star.x += star.vx + orbitX * 0.01;
            star.y += star.vy + orbitY * 0.01;
            star.vx *= 0.98;
            star.vy *= 0.98;
            
            // Mouse attraction/repulsion
            const dx = star.x - mouseX;
            const dy = star.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200 && distance > 0) {
                const force = (1 - distance / 200) * 0.5;
                // Create swirling effect
                star.vx += (-dy / distance) * force * 0.3; // Perpendicular force
                star.vy += (dx / distance) * force * 0.3;
                
                // Slight attraction
                star.vx -= (dx / distance) * force * 0.1;
                star.vy -= (dy / distance) * force * 0.1;
            }
            
            // Bounce off edges with some randomness
            if (star.x < 0 || star.x > canvas.width) {
                star.vx *= -0.8;
                star.vx += (Math.random() - 0.5) * 0.5;
            }
            if (star.y < 0 || star.y > canvas.height) {
                star.vy *= -0.8;
                star.vy += (Math.random() - 0.5) * 0.5;
            }
            
            // Keep in bounds
            star.x = Math.max(5, Math.min(canvas.width - 5, star.x));
            star.y = Math.max(5, Math.min(canvas.height - 5, star.y));
        });
        
        updateConstellations();
        updateBlasts();
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = 'rgba(13, 26, 61, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Debug: Draw a test circle to make sure canvas is working
        if (stars.length === 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(100, 100, 50, 0, Math.PI * 2);
            ctx.fill();
            console.log('No stars to draw!');
        }
        
        // Draw constellation lines
        constellationLines.forEach(line => {
            const gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
            gradient.addColorStop(0, `rgba(100, 150, 255, ${line.opacity})`);
            gradient.addColorStop(0.5, `rgba(150, 200, 255, ${line.opacity})`);
            gradient.addColorStop(1, `rgba(100, 150, 255, ${line.opacity})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });
        
        // Draw stars
        stars.forEach((star, index) => {
            const pulse = Math.sin(star.pulsePhase) * 0.3 + 0.7;
            const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5;
            const brightness = star.brightness * pulse * twinkle;
            
            // Check if star is near mouse
            const dx = star.x - mouseX;
            const dy = star.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const isNearMouse = distance < 200;
            
            // Multi-layered glow effect
            if (isNearMouse || star.size > 3) {
                const glowIntensity = isNearMouse ? (1 - distance / 200) : 0.3;
                const glowSize = star.size * (3 + glowIntensity * 3);
                
                // Outer glow
                const gradient1 = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
                gradient1.addColorStop(0, `rgba(150, 200, 255, ${brightness * glowIntensity * 0.3})`);
                gradient1.addColorStop(0.4, `rgba(100, 150, 255, ${brightness * glowIntensity * 0.2})`);
                gradient1.addColorStop(1, 'rgba(50, 100, 255, 0)');
                
                ctx.fillStyle = gradient1;
                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner glow
                const gradient2 = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
                gradient2.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
                gradient2.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.8})`);
                gradient2.addColorStop(1, `rgba(150, 200, 255, ${brightness * 0.3})`);
                
                ctx.fillStyle = gradient2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw star core with color variation
            const colorVariation = (index % 3);
            let coreColor;
            if (colorVariation === 0) {
                coreColor = `rgba(255, 255, 255, ${brightness})`; // Pure white
            } else if (colorVariation === 1) {
                coreColor = `rgba(255, 240, 200, ${brightness})`; // Warm white
            } else {
                coreColor = `rgba(200, 220, 255, ${brightness})`; // Cool blue-white
            }
            
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Enhanced twinkle effect for all stars
            if (twinkle > 0.7) {
                ctx.save();
                ctx.translate(star.x, star.y);
                ctx.rotate(star.twinklePhase);
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * twinkle * 0.5})`;
                ctx.lineWidth = 0.5;
                const spikeLength = star.size * (4 + twinkle * 2);
                
                // Four-pointed star spikes
                ctx.beginPath();
                ctx.moveTo(-spikeLength, 0);
                ctx.lineTo(spikeLength, 0);
                ctx.moveTo(0, -spikeLength);
                ctx.lineTo(0, spikeLength);
                
                // Diagonal spikes for extra sparkle
                const diagLength = spikeLength * 0.7;
                ctx.moveTo(-diagLength, -diagLength);
                ctx.lineTo(diagLength, diagLength);
                ctx.moveTo(-diagLength, diagLength);
                ctx.lineTo(diagLength, -diagLength);
                
                ctx.stroke();
                ctx.restore();
            }
        });
        
        // Draw blast effects on top
        drawBlasts();
    }
    
    // Update blast waves
    function updateBlasts() {
        blastWaves = blastWaves.filter(wave => {
            wave.radius += wave.speed;
            wave.opacity -= 0.02;
            wave.speed *= 0.98;
            return wave.opacity > 0;
        });
        
        particles = particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.vy += 0.3; // gravity
            particle.life -= 0.02;
            particle.size *= 0.98;
            return particle.life > 0;
        });
    }
    
    // Draw blast effects
    function drawBlasts() {
        // Draw particles
        particles.forEach(particle => {
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw shockwaves
        blastWaves.forEach(wave => {
            const gradient = ctx.createRadialGradient(wave.x, wave.y, wave.radius * 0.7, wave.x, wave.y, wave.radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.7, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius * 0.9, 0, Math.PI * 2);
            ctx.stroke();
        });
    }
    
    // Animation loop
    function animate() {
        update();
        draw();
        animationId = requestAnimationFrame(animate);
    }
    
    // Mouse move handler
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
    
    // Mouse click handler
    function handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createBlast(x, y);
    }
    
    // Touch handler for mobile
    function handleTouch(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX - rect.left;
            mouseY = e.touches[0].clientY - rect.top;
        }
    }
    
    // Touch start for blast on mobile
    function handleTouchStart(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length > 0) {
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            createBlast(x, y);
        }
    }
    
    // Mouse leave handler
    function handleMouseLeave() {
        mouseX = -200;
        mouseY = -200;
    }
    
    // Initialize
    resizeCanvas();
    animate();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('click', (e) => {
        // Check if click is not on a button or link
        if (!e.target.closest('a, button')) {
            handleClick(e);
        }
    });
    heroSection.addEventListener('touchmove', handleTouch);
    heroSection.addEventListener('touchstart', (e) => {
        if (!e.target.closest('a, button')) {
            handleTouchStart(e);
        }
    });
    heroSection.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
});