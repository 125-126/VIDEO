/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO
   INICIO AUTOMÁTICO
========================================================= */

const scenes = document.querySelectorAll(".scene");
const progressBar = document.getElementById("progressBar");
const currentScene = document.getElementById("currentScene");
const soundButton = document.getElementById("soundButton");

/* CONFIG */
const SCENE_TIME = 7500;

let current = 0;
let timer = null;
let progressTimer = null;
let started = false;
let muted = false;
let finished = false;

/* =========================================================
   AUDIO
========================================================= */

const music = new Audio("audio/musica.mp3");

music.loop = true;
music.preload = "auto";

const MUSIC_VOLUME = 0.25;
const MUSIC_DUCK_VOLUME = 0.07;
const NARRATION_VOLUME = 0.95;

music.volume = MUSIC_VOLUME;


/* =========================================================
   NARRACIONES
========================================================= */

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
   INICIAR AUTOMÁTICAMENTE
========================================================= */

window.addEventListener("load", () => {

    started = true;

    document.body.classList.add("recording");

    /*
     * Intentamos iniciar la música automáticamente.
     * Algunos navegadores pueden bloquear audio
     * hasta que exista interacción del usuario.
     */
    music.play().catch(() => {
        console.log("El navegador bloqueó el audio automático.");
    });

    playScene(0);
});


/* =========================================================
   PLAY SCENE
========================================================= */

function playScene(index) {

    if (index < 0 || index >= scenes.length) {
        return;
    }

    if (finished) {
        return;
    }

    clearTimeout(timer);
    clearInterval(progressTimer);


    /* Detener narración anterior */

    if (narrationAudio) {

        narrationAudio.pause();
        narrationAudio.currentTime = 0;
        narrationAudio = null;
    }


    /* Activar escena */

    scenes.forEach((scene, i) => {

        scene.classList.toggle(
            "active",
            i === index
        );

    });


    current = index;


    /* Número de escena */

    currentScene.textContent =
        String(index + 1).padStart(2, "0");


    /* Barra de progreso */

    startProgress();


    /* Narración */

    if (narrations[index] && !muted) {

        narrationAudio =
            new Audio(narrations[index]);

        narrationAudio.volume =
            NARRATION_VOLUME;

        music.volume =
            MUSIC_DUCK_VOLUME;


        narrationAudio.play().catch(() => {});


        narrationAudio.addEventListener(
            "ended",
            () => {

                if (!muted) {
                    music.volume =
                        MUSIC_VOLUME;
                }

            }
        );

    } else {

        music.volume =
            muted ? 0 : MUSIC_VOLUME;
    }


    /* Tiempo de escena */

    timer = setTimeout(() => {

        nextScene();

    }, SCENE_TIME);
}


/* =========================================================
   SIGUIENTE ESCENA
========================================================= */

function nextScene() {

    if (finished) {
        return;
    }

    const next =
        current + 1;


    if (next >= scenes.length) {

        finishVideo();

        return;
    }


    playScene(next);
}


/* =========================================================
   FINAL DEL VIDEO
========================================================= */

function finishVideo() {

    if (finished) {
        return;
    }

    finished = true;


    clearTimeout(timer);
    clearInterval(progressTimer);


    /* Mantener la última escena */

    scenes.forEach((scene, i) => {

        scene.classList.toggle(
            "active",
            i === scenes.length - 1
        );

    });


    current =
        scenes.length - 1;


    currentScene.textContent =
        String(scenes.length).padStart(2, "0");


    progressBar.style.width =
        "100%";


    document.body.classList.add(
        "video-finished"
    );


    /* Detener narración */

    if (narrationAudio) {

        narrationAudio.pause();
        narrationAudio.currentTime = 0;
        narrationAudio = null;
    }


    /* Mantener música suave */

    if (!muted) {

        music.volume =
            MUSIC_VOLUME;
    }
}


/* =========================================================
   ESCENA ANTERIOR
========================================================= */

function previousScene() {

    if (finished) {
        return;
    }

    let previous =
        current - 1;


    if (previous < 0) {
        previous = 0;
    }


    playScene(previous);
}


/* =========================================================
   PROGRESO
========================================================= */

function startProgress() {

    clearInterval(progressTimer);


    const start =
        Date.now();


    progressBar.style.width =
        "0%";


    progressTimer =
        setInterval(() => {

            const elapsed =
                Date.now() - start;


            let percent =
                (elapsed / SCENE_TIME) * 100;


            if (percent > 100) {
                percent = 100;
            }


            progressBar.style.width =
                percent + "%";

        }, 30);
}


/* =========================================================
   SONIDO
========================================================= */

if (soundButton) {

    soundButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            muted = !muted;


            if (muted) {

                music.volume = 0;


                if (narrationAudio) {
                    narrationAudio.volume = 0;
                }


                soundButton.textContent =
                    "🔇";

            } else {

                music.volume =
                    MUSIC_VOLUME;


                if (narrationAudio) {

                    narrationAudio.volume =
                        NARRATION_VOLUME;
                }


                soundButton.textContent =
                    "🔊";


                if (started && !finished) {

                    music.play().catch(() => {});
                }
            }
        }
    );
}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (!started) {
            return;
        }

        if (finished) {
            return;
        }


        if (event.key === "ArrowRight") {

            nextScene();
        }


        if (event.key === "ArrowLeft") {

            previousScene();
        }


        if (event.key === " ") {

            event.preventDefault();


            if (music.paused) {

                music.play().catch(() => {});

            } else {

                music.pause();
            }
        }
    }
);


/* =========================================================
   TOUCH / SWIPE
========================================================= */

let touchStartX = 0;
let touchEndX = 0;


document.addEventListener(
    "touchstart",
    (event) => {

        if (!started || finished) {
            return;
        }


        touchStartX =
            event.changedTouches[0].screenX;

    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    (event) => {

        if (!started || finished) {
            return;
        }


        touchEndX =
            event.changedTouches[0].screenX;


        handleSwipe();

    },
    { passive: true }
);


function handleSwipe() {

    if (finished) {
        return;
    }


    const difference =
        touchStartX - touchEndX;


    if (difference > 60) {

        nextScene();
    }


    if (difference < -60) {

        previousScene();
    }
}


/* =========================================================
   PRELOAD IMÁGENES
========================================================= */

const imagePaths = [

    "img/logo_amaya.png",
    "img/pos_amaya.png",
    "img/ticket_amaya.png",
    "img/escaneo_qr.png",
    "img/historial_pagos.png"

];


imagePaths.forEach((path) => {

    const img =
        new Image();

    img.src = path;
});


/* =========================================================
   PRELOAD AUDIO
========================================================= */

music.preload = "auto";


/* =========================================================
   PREVENT ZOOM
========================================================= */

document.addEventListener(
    "gesturestart",
    (event) => {

        event.preventDefault();

    }
);


/* =========================================================
   VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!started) {
            return;
        }


        if (document.hidden) {

            clearTimeout(timer);
            clearInterval(progressTimer);

            music.pause();


            if (narrationAudio) {
                narrationAudio.pause();
            }

        } else {

            if (finished) {
                return;
            }


            if (!muted) {

                music.play().catch(() => {});
            }


            playScene(current);
        }
    }
);
