
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

const intro = document.getElementById("intro");
const button = document.getElementById("pressButton");
const message = document.getElementById("message");

let width, height;
let started = false;
let formingHeart = false;

let rockets = [];
let particles = [];
let stars = [];

let heartCenter = { x: 0, y: 0 };
let heartScale = 1;
let animationTime = 0;

const PARTICLE_COUNT = 900;


const launchSound = document.getElementById("launchSound");
const explosionSound = document.getElementById("explosionSound");

// Play rocket launch sound
function playLaunchSound() {
    const sound = launchSound.cloneNode();
    sound.volume = 0.65;
    sound.play().catch(() => {});
}

// Play explosion sound
function playExplosionSound() {
    const sound = explosionSound.cloneNode();
    sound.volume = 0.8;
    sound.play().catch(() => {});
}


function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    heartCenter = {
        x: width / 2,
        y: height * 0.40
    };

    stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.7 + 0.3,
        alpha: Math.random()
    }));
}

window.addEventListener("resize", resize);
resize();

// HEART MATHEMATICAL SHAPE

function heartPosition(t, fill) {
    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

    const scale = Math.min(width * 0.017, height * 0.012);

    const radius = fill ? Math.sqrt(Math.random()) : 1;

    return {
        x: heartCenter.x + x * scale * radius,
        y: heartCenter.y - y * scale * radius
    };
}

// ROCKET

class Rocket {
    
    constructor(x) {
        this.x = x;
        this.y = height + 10;

        this.targetY = height * (0.20 + Math.random() * 0.13);
        this.speed = 9 + Math.random() * 3;

        this.trail = [];
        this.exploded = false;

        this.color = [
            "#ff1744",
            "#ff69b4",
            "#ffd700",
            "#ffffff"
        ][Math.floor(Math.random() * 4)];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });

        if (this.trail.length > 12) {
            this.trail.shift();
        }

        this.y -= this.speed;

        if (this.y <= this.targetY) {
            this.explode();
            this.exploded = true;
        }
    }

    draw() {
        ctx.beginPath();

        this.trail.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    explode() {
        playExplosionSound();
        const colors = [
            "#ff1744",
            "#ff69b4",
            "#ffb6c1",
            "#ffd700",
            "#ffffff"
        ];

        for (let i = 0; i < PARTICLE_COUNT / 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 1;

            particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)]
            ));
        }
    }
}

// PARTICLE

class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;

        this.vx = vx;
        this.vy = vy;

        this.color = color;
        this.alpha = 1;

        this.size = Math.random() * 2.5 + 1;

        this.target = null;
        this.sparkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.08 + 0.02;
    }

    update() {
        this.sparkle += this.twinkleSpeed;

        if (formingHeart && this.target) {

            const pulse = 1 + Math.sin(animationTime * 0.045) * 0.035;

            const targetX =
                heartCenter.x +
                (this.target.x - heartCenter.x) * pulse;

            const targetY =
                heartCenter.y +
                (this.target.y - heartCenter.y) * pulse;

            this.x += (targetX - this.x) * 0.075;
            this.y += (targetY - this.y) * 0.075;

            this.vx *= 0.9;
            this.vy *= 0.9;

            this.alpha = 0.75 + Math.sin(this.sparkle) * 0.25;

        } else {

            this.x += this.vx;
            this.y += this.vy;

            this.vx *= 0.985;
            this.vy *= 0.985;

            this.vy += 0.035;

            this.alpha -= 0.006;
        }
    }

    draw() {
        const sparkle = 0.65 + Math.sin(this.sparkle) * 0.35;

        ctx.globalAlpha = Math.max(0, this.alpha * sparkle);

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size * (formingHeart ? 1.15 : 1),
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;
        ctx.shadowBlur = formingHeart ? 18 : 12;
        ctx.shadowColor = this.color;

        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// CREATE HEART PARTICLE TARGETS

function formHeart() {
    formingHeart = true;

    const heartParticles = particles.slice(0, PARTICLE_COUNT);

    heartParticles.forEach(particle => {
        const t = Math.random() * Math.PI * 2;

        particle.target = heartPosition(t, true);
    });

    // Add extra sparkling particles if needed

    while (particles.length < PARTICLE_COUNT) {
        const t = Math.random() * Math.PI * 2;
        const target = heartPosition(t, true);

        const particle = new Particle(
            heartCenter.x,
            heartCenter.y,
            0,
            0,
            ["#ff1744", "#ff69b4", "#ffd700", "#ffffff"][
                Math.floor(Math.random() * 4)
            ]
        );

        particle.target = target;
        particles.push(particle);
    }

    setTimeout(() => {
        message.classList.add("show");
    }, 2500);
}

// START SHOW

button.addEventListener("click", () => {
    if (started) return;

    started = true;
    playLaunchSound();
    intro.classList.add("hide");

    const positions = [
        width * 0.20,
        width * 0.80,
        width * 0.35,
        width * 0.65,
        width * 0.50
    ];

    positions.forEach((x, i) => {
        setTimeout(() => {
            playLaunchSound();
            rockets.push(new Rocket(x));
        }, i * 550);
    });

    setTimeout(() => {
        formHeart();
    }, 4500);
});

// BACKGROUND STARS

function drawStars() {
    stars.forEach(star => {
        const alpha = 0.25 + Math.random() * 0.65;

        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        ctx.fillStyle = "white";
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

// HEART GLOW

function drawHeartGlow() {
    if (!formingHeart) return;

    const pulse = 1 + Math.sin(animationTime * 0.045) * 0.035;

    ctx.save();

    ctx.translate(heartCenter.x, heartCenter.y);
    ctx.scale(pulse, pulse);
    ctx.translate(-heartCenter.x, -heartCenter.y);

    ctx.beginPath();

    for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * Math.PI * 2;
        const point = heartPosition(t, false);

        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    ctx.closePath();

    ctx.strokeStyle = "rgba(255, 23, 68, 0.12)";
    ctx.lineWidth = 10;
    ctx.shadowBlur = 40;
    ctx.shadowColor = "#ff1744";
    ctx.stroke();

    ctx.restore();
}

// ANIMATION LOOP

function animate() {
    animationTime++;

    ctx.fillStyle = "rgba(2, 2, 11, 0.22)";
    ctx.fillRect(0, 0, width, height);

    drawStars();
    drawHeartGlow();

    // Rockets

    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update();
        rockets[i].draw();

        if (rockets[i].exploded) {
            rockets.splice(i, 1);
        }
    }

    // Particles

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (!formingHeart && particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();
