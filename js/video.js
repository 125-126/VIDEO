
/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO - AUDIO CORREGIDO
========================================================= */

const scenes = document.querySelectorAll(".scene");
const progressBar = document.getElementById("progressBar");
const currentScene = document.getElementById("currentScene");
const soundButton = document.getElementById("soundButton");

const SCENE_TIME = 7500;
const MUSIC_VOLUME = 0.35;
const NARRATION_VOLUME = 1.0;
const MUSIC_DUCK_VOLUME = 0.10;

let current = 0;
let timer = null;
let progressTimer = null;
let started = false;
let muted = false;
let finished = false;
let audioUnlocked = false;
let pausedForVisibility = false;

const music = new Audio("audio/musica.mp3");
music.loop = true;
music.preload = "auto";
music.volume = MUSIC_VOLUME;

const narrations = [
    null,
    null,
    null,
    null,
    null,
    null,
    null
];

let narrationAudio = null;

/* =========================================================
   INICIO AUTOMÁTICO DEL VIDEO
========================================================= */

window.addEventListener("load", () => {
    started = true;
    document.body.classList.add("recording");

    playScene(0);

    // El navegador podría bloquear este intento.
    tryStartMusic();
});

/* =========================================================
   INTENTAR ACTIVAR LA MÚSICA
========================================================= */

async function tryStartMusic() {
    if (muted || document.hidden || finished) return;

    try {
        await music.play();
        audioUnlocked = true;
        updateSoundButton();
    } catch (error) {
        // Esperaremos al primer toque o clic del usuario.
        console.log("Esperando interacción para activar el audio.");
    }
}

/* =========================================================
   ACTIVAR AUDIO CON EL PRIMER TOQUE O CLIC
   No aparece ninguna pantalla de inicio.
========================================================= */

async function unlockAudio() {
    if (audioUnlocked || muted || finished) return;

    try {
        await music.play();
        audioUnlocked = true;
        updateSoundButton();
    } catch (error) {
        console.log("El navegador todavía bloquea el audio.");
    }

    if (
        narrationAudio &&
        narrationAudio.paused &&
        !muted
    ) {
        narrationAudio.play().catch(() => {});
    }
}

document.addEventListener("pointerdown", unlockAudio, {
    passive: true
});

/* =========================================================
   REPRODUCIR ESCENA
========================================================= */

function playScene(index) {
    if (finished || index < 0 || index >= scenes.length) return;

    clearTimeout(timer);
    clearInterval(progressTimer);

    if (narrationAudio) {
        narrationAudio.pause();
        narrationAudio.currentTime = 0;
        narrationAudio = null;
    }

    scenes.forEach((scene, i) => {
        scene.classList.toggle("active", i === index);
    });

    current = index;

    if (currentScene) {
        currentScene.textContent =
            String(index + 1).padStart(2, "0");
    }

    startProgress();

    if (narrations[index]) {
        narrationAudio = new Audio(narrations[index]);
        narrationAudio.preload = "auto";
        narrationAudio.volume = NARRATION_VOLUME;

        if (!muted && audioUnlocked) {
            music.volume = MUSIC_DUCK_VOLUME;

            narrationAudio.play().catch(() => {
                console.log("No se pudo iniciar la narración.");
            });
        }

        narrationAudio.addEventListener("ended", () => {
            if (!muted && !finished) {
                music.volume = MUSIC_VOLUME;
            }
        });
    }

    if (!muted && audioUnlocked) {
        music.volume = MUSIC_VOLUME;
        music.play().catch(() => {});
    }

    timer = setTimeout(nextScene, SCENE_TIME);
}

/* =========================================================
   SIGUIENTE ESCENA
========================================================= */

function nextScene() {
    if (finished) return;

    if (current + 1 >= scenes.length) {
        finishVideo();
        return;
    }

    playScene(current + 1);
}

/* =========================================================
   FINAL: NO REPETIR EL VIDEO
========================================================= */

function finishVideo() {
    if (finished) return;

    finished = true;

    clearTimeout(timer);
    clearInterval(progressTimer);

    scenes.forEach((scene, i) => {
        scene.classList.toggle(
            "active",
            i === scenes.length - 1
        );
    });

    current = scenes.length - 1;

    if (currentScene) {
        currentScene.textContent =
            String(scenes.length).padStart(2, "0");
    }

    if (progressBar) {
        progressBar.style.width = "100%";
    }

    document.body.classList.add("video-finished");

    if (narrationAudio) {
        narrationAudio.pause();
        narrationAudio = null;
    }

    // La música termina junto con la presentación.
    music.pause();
}

/* =========================================================
   ESCENA ANTERIOR
========================================================= */

function previousScene() {
    if (finished || current === 0) return;
    playScene(current - 1);
}

/* =========================================================
   BARRA DE PROGRESO
========================================================= */

function startProgress() {
    clearInterval(progressTimer);

    const start = Date.now();

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    progressTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.min(
            (elapsed / SCENE_TIME) * 100,
            100
        );

        if (progressBar) {
            progressBar.style.width = percent + "%";
        }
    }, 50);
}

/* =========================================================
   BOTÓN DE SONIDO, SI EXISTE EN EL HTML
========================================================= */

function updateSoundButton() {
    if (!soundButton) return;

    soundButton.textContent = muted ? "🔇" : "🔊";
}

if (soundButton) {
    soundButton.addEventListener("click", async (event) => {
        event.stopPropagation();

        muted = !muted;

        if (muted) {
            music.pause();

            if (narrationAudio) {
                narrationAudio.pause();
            }
        } else {
            await tryStartMusic();

            if (narrationAudio && audioUnlocked) {
                narrationAudio.play().catch(() => {});
            }
        }

        updateSoundButton();
    });
}

/* =========================================================
   TECLADO
========================================================= */

document.addEventListener("keydown", (event) => {
    if (!started || finished) return;

    if (event.key === "ArrowRight") nextScene();
    if (event.key === "ArrowLeft") previousScene();

    if (event.key === " ") {
        event.preventDefault();

        if (music.paused) {
            unlockAudio();
            tryStartMusic();
        } else {
            music.pause();
        }
    }
});

/* =========================================================
   DESLIZAR EN CELULAR
========================================================= */

let touchStartX = 0;

document.addEventListener("touchstart", (event) => {
    if (!started || finished) return;

    touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener("touchend", (event) => {
    if (!started || finished) return;

    const difference =
        touchStartX - event.changedTouches[0].screenX;

    if (difference > 60) nextScene();
    if (difference < -60) previousScene();
}, { passive: true });

/* =========================================================
   PRE-CARGAR IMÁGENES
========================================================= */

[
    "img/logo_amaya.png",
    "img/pos_amaya.png",
    "img/ticket_amaya.png",
    "img/escaneo_qr.png",
    "img/historial_pagos.png"
].forEach((path) => {
    const img = new Image();
    img.src = path;
});

/* =========================================================
   PESTAÑA EN SEGUNDO PLANO
========================================================= */

document.addEventListener("visibilitychange", () => {
    if (!started || finished) return;

    if (document.hidden) {
        pausedForVisibility = true;
        clearTimeout(timer);
        clearInterval(progressTimer);
        music.pause();

        if (narrationAudio) narrationAudio.pause();
    } else if (pausedForVisibility) {
        pausedForVisibility = false;
        playScene(current);
        tryStartMusic();
    }
});
