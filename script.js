const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth, 800); // Limit max width to 800px
    canvas.height = Math.min(window.innerHeight * 0.8, 600); // Limit max height to 600px
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const bubbles = [];
const bullets = [];
const shooter = { x: canvas.width / 2, y: canvas.height - 30, radius: 15, color: 'white' };
let angle = 0;
let score = 0;
let scoreHistory = [];

// Create random bubbles
for (let i = 0; i < 50; i++) {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        radius: 15,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    });
}

// Draw a bubble
function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.closePath();
}

// Draw the shooter
function drawShooter() {
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, shooter.radius, 0, Math.PI * 2);
    ctx.fillStyle = shooter.color;
    ctx.fill();
    ctx.closePath();

    // Draw the short-range aiming line
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(shooter.x + Math.cos(angle) * 100, shooter.y + Math.sin(angle) * 100); // Reduced range to 100
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();
}

// Draw a bullet
function drawBullet(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.closePath();
}

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove bullets that go off-screen
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    });
}

// Update the score display
function updateScore() {
    document.getElementById('scoreBoard').textContent = `Score: ${score}`;
}

// Update the score history display
function updateScoreHistory() {
    const historyElement = document.getElementById('scoreHistory');
    historyElement.textContent = `Score History: ${scoreHistory.join(', ')}`;
}

// Restart the game
function restartGame() {
    scoreHistory.push(score);
    score = 0;
    updateScore();
    updateScoreHistory();

    // Reset bubbles and bullets
    bubbles.length = 0;
    bullets.length = 0;

    // Recreate random bubbles
    for (let i = 0; i < 50; i++) {
        bubbles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            radius: 15,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        });
    }
}

// Check for collisions
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        bubbles.forEach((bubble, bubIndex) => {
            const dist = Math.hypot(bullet.x - bubble.x, bullet.y - bubble.y);
            if (dist < bullet.radius + bubble.radius) {
                // Remove the bubble and the bullet
                bubbles.splice(bubIndex, 1);
                bullets.splice(bIndex, 1);

                // Increment the score
                score++;
                updateScore();
            }
        });
    });
}

// Update the game
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(drawBubble);
    bullets.forEach(drawBullet);
    drawShooter();

    updateBullets();
    checkCollisions();
}

// Handle mouse movement
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

// Handle shooting
canvas.addEventListener('click', () => {
    const bullet = {
        x: shooter.x,
        y: shooter.y,
        radius: 5,
        color: 'red',
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
    };
    bullets.push(bullet);
});

// Handle touch movement for aiming
canvas.addEventListener('touchmove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    angle = Math.atan2(touchY - shooter.y, touchX - shooter.x);
});

// Handle touch for shooting
canvas.addEventListener('touchstart', () => {
    const bullet = {
        x: shooter.x,
        y: shooter.y,
        radius: 5,
        color: 'red',
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
    };
    bullets.push(bullet);
});

// Add event listener for the restart button
document.getElementById('restartButton').addEventListener('click', restartGame);

// Game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

gameLoop();
