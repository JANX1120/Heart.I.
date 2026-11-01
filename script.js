
/* =========================
   ELEMENTS
========================= */

const container = document.getElementById("rose-container");
const intro = document.querySelector(".intro");

let roseCount = 0;
let surpriseShown = false;


/* =========================
   MAGICAL SOUND ENGINE
========================= */

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    if (audioContext?.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

// Play a magical tone
function playTone(frequency, duration, volume = 0.08, type = "sine", delay = 0) {

    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
        frequency,
        ctx.currentTime + delay
    );

    gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);

    gain.gain.exponentialRampToValueAtTime(
        volume,
        ctx.currentTime + delay + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + delay + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.05);
}

// 1. Rose planting sound
function playPlantSound() {
    playTone(660, 0.25, 0.07, "sine");
    playTone(880, 0.35, 0.045, "sine", 0.08);
}

// 2. Rose blooming sound
function playBloomSound() {
    playTone(440, 0.45, 0.045, "sine");
    playTone(554, 0.45, 0.045, "sine", 0.15);
    playTone(784, 0.65, 0.055, "sine", 0.30);
}

// 3. Special surprise sound
function playSurpriseSound() {
    playTone(523, 0.5, 0.08, "sine");
    playTone(659, 0.5, 0.08, "sine", 0.18);
    playTone(784, 0.6, 0.08, "sine", 0.36);
    playTone(1047, 1.0, 0.09, "sine", 0.55);
}


/* =========================
   ROSE COUNTER
========================= */

const counter = document.createElement("div");

counter.id = "rose-counter";
counter.innerHTML = "🌹 Roses: 0";

document.body.appendChild(counter);

/* =========================
   ROSE COLOR COLLECTION
========================= */

const roseColors = [
    // Ruby Red
    {
        light: "#ff9aaa",
        main: "#e60039",
        dark: "#650019"
    },

    // Snow White
    {
        light: "#ffffff",
        main: "#f4e6e8",
        dark: "#b9a0ad"
    },

    // Golden Yellow
    {
        light: "#fff3a6",
        main: "#ffbd21",
        dark: "#a85b08"
    },

    // Royal Purple
    {
        light: "#e5b5ff",
        main: "#9835d6",
        dark: "#43105f"
    },

    // Peach Pink
    {
        light: "#ffe0bd",
        main: "#ff805e",
        dark: "#a93438"
    },

    // Ocean Blue
    {
        light: "#b5eaff",
        main: "#318de0",
        dark: "#123a80"
    }
];

/* =========================
   CREATE A ROSE
========================= */

function createRose(x, y) {

    roseCount++;

counter.innerHTML = `🌹 Roses: ${roseCount}`;

// Play planting sound
playPlantSound();

    // Check 10 Rose Surprise
    if (roseCount >= 10 && !surpriseShown) {

        surpriseShown = true;

        setTimeout(() => {

            const surprise = document.getElementById("surprise-message");

            if (surprise) {
                surprise.classList.add("show");
                playSurpriseSound();
            }

        }, 2500);
    }

    // Create rose wrapper
    const rose = document.createElement("div");

    rose.className = "rose";

    // Random size and rotation
    const size = 0.7 + Math.random() * 0.6;
    const rotation = Math.random() * 30 - 15;

    rose.style.left = x + "px";
    rose.style.top = y + "px";

    rose.style.setProperty("--size", size);
    rose.style.setProperty("--rotation", rotation + "deg");

    /* =========================
       SELECT RANDOM COLOR
    ========================= */

    const selectedColor =
        roseColors[Math.floor(Math.random() * roseColors.length)];

    rose.style.setProperty("--rose-light", selectedColor.light);
    rose.style.setProperty("--rose-main", selectedColor.main);
    rose.style.setProperty("--rose-dark", selectedColor.dark);

    /* =========================
       CREATE STEM
    ========================= */

    const stem = document.createElement("div");

    stem.className = "stem";

    /* =========================
       CREATE LEAVES
    ========================= */

    const leafLeft = document.createElement("div");

    leafLeft.className = "leaf leaf-left";

    const leafRight = document.createElement("div");

    leafRight.className = "leaf leaf-right";

    /* =========================
       CREATE FLOWER HEAD
    ========================= */

    const flower = document.createElement("div");

    flower.className = "flower";

    /* =========================
       CREATE PETAL LAYERS
    ========================= */

    const layers = [
        {
            name: "outer",
            count: 7,
            distance: 13
        },

        {
            name: "middle",
            count: 5,
            distance: 7
        },

        {
            name: "inner",
            count: 4,
            distance: 2
        }
    ];

    let delay = 0;

    layers.forEach((layer, layerIndex) => {

        for (let i = 0; i < layer.count; i++) {

            const petal = document.createElement("div");

            petal.className = `petal ${layer.name}`;

            // Petal rotation
            const angle =
                (360 / layer.count) * i +
                (layerIndex * 24) +
                (Math.random() * 12 - 6);

            petal.style.setProperty(
                "--angle",
                angle + "deg"
            );

            petal.style.setProperty(
                "--distance",
                layer.distance + "px"
            );

            petal.style.setProperty(
                "--delay",
                delay + "s"
            );

            flower.appendChild(petal);

            delay += 0.06;
        }

    });

    /* =========================
       ROSE CENTER
    ========================= */

    const center = document.createElement("div");

    center.className = "rose-center";

    flower.appendChild(center);

    /* =========================
       ASSEMBLE ROSE
    ========================= */

    rose.appendChild(stem);

    rose.appendChild(leafLeft);

    rose.appendChild(leafRight);

    rose.appendChild(flower);

    container.appendChild(rose);

    // Play blooming sound
    setTimeout(() => {
    playBloomSound();
    }, 1300);

    /* =========================
       CREATE SPARKLES
    ========================= */

    createSparkles(x, y);

    /* =========================
       HIDE INTRO
    ========================= */

    if (roseCount === 1) {

        intro.style.transition = "opacity 1.5s ease";

        intro.style.opacity = "0";
    }
}

/* =========================
   SPARKLE EFFECT
========================= */

function createSparkles(x, y) {

    for (let i = 0; i < 8; i++) {

        const sparkle = document.createElement("span");

        sparkle.className = "sparkle";

        sparkle.style.left = x + "px";

        sparkle.style.top = y + "px";

        // Random horizontal movement
        sparkle.style.setProperty(
            "--spark-x",
            (Math.random() * 100 - 50) + "px"
        );

        // Random vertical movement
        sparkle.style.setProperty(
            "--spark-y",
            (Math.random() * 100 - 50) + "px"
        );

        container.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => {

            sparkle.remove();

        }, 1200);
    }
}

/* =========================
   DESKTOP AND MOBILE
   INTERACTION
========================= */

document.addEventListener("pointerdown", (event) => {

    // Don't plant roses on the surprise overlay
    if (event.target.closest("#surprise-message")) {
        return;
    }

    createRose(event.clientX, event.clientY);

});

/* =========================
   CLOSE SURPRISE MESSAGE
========================= */

function closeSurprise() {

    const surprise = document.getElementById("surprise-message");

    if (surprise) {

        surprise.classList.remove("show");

    }
}
