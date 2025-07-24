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
let startTime = Date.now();
let gameOver = false;

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

// Function to update the score history display
function updateScoreHistory() {
    const historyElement = document.getElementById('scoreHistory');
    historyElement.textContent = `Score History: ${scoreHistory.join(', ')}`;
}

// Function to spawn a single bubble at the top
function spawnBubble() {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: -20, // Start above the canvas
        radius: 15,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        dy: 1 + Math.random() * 0.1, // Random downward speed
    });
}

// Function to continuously spawn bubbles
function spawnBubblesContinuously() {
    setInterval(() => {
        if (!gameOver) {
            spawnBubble();
        }
    }, 1000); // Spawn a new bubble every second
}

// Update bubbles to make them drop
function updateBubbles() {
    bubbles.forEach((bubble, index) => {
        bubble.y += bubble.dy; // Move the bubble downward

        // Remove bubbles that go off the bottom of the canvas
        if (bubble.y - bubble.radius > canvas.height) {
            bubbles.splice(index, 1);
            gameOver = true; // End the game if a bubble reaches the bottom
            displayResults();
        }
    });
}

// Function to format time into minutes and seconds
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
}

// Function to display the result modal
function displayResults() {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Time in seconds
    let finalScore = score; // Final score based on the current score

    // Ensure the final score is not negative
    if (finalScore < 0) {
        finalScore = 0;
    }

    // Push the final score to the score history
    scoreHistory.push(finalScore);
    updateScoreHistory(); // Update the score history display

    const resultModal = document.getElementById('resultModal');
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = `Game Over! Final Score: ${finalScore}. Time Taken: ${formatTime(timeTaken)}.`;
    resultModal.style.display = 'block';
}

// Close the result modal
document.getElementById('closeModalButton').addEventListener('click', () => {
    const resultModal = document.getElementById('resultModal');
    resultModal.style.display = 'none';
    restartGame(); // Restart the game after closing the modal
});

// Restart the game
function restartGame() {
    score = 0; // Reset the score
    updateScore(); // Update the score display
    bubbles.length = 0; // Clear existing bubbles
    bullets.length = 0; // Clear existing bullets
    gameOver = false; // Reset the game over flag
    startTime = Date.now(); // Reset the start time
    spawnBubble(); // Spawn the first bubble
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
    if (gameOver) return; // Stop updating if the game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBubbles(); // Update bubble positions
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
    const bulletSpeed = 10; // Increased bullet speed
    const bullet = {
        x: shooter.x,
        y: shooter.y,
        radius: 5,
        color: 'red',
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed,
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
    const bulletSpeed = 10; // Increased bullet speed
    const bullet = {
        x: shooter.x,
        y: shooter.y,
        radius: 5,
        color: 'red',
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed,
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

// Initialize the game
spawnBubble(); // Spawn the first bubble
spawnBubblesContinuously(); // Start spawning bubbles continuously
