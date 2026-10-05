/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO
========================================================= */

const scenes = document.querySelectorAll(".scene");

const progressBar = document.getElementById("progressBar");

const currentScene =
    document.getElementById("currentScene");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const soundButton =
    document.getElementById("soundButton");


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SCENE_TIME = 7500;

let current = 0;

let timer = null;

let progressTimer = null;

let started = false;

let muted = false;


/* =========================================================
   AUDIO
========================================================= */

const music = new Audio("audio/musica.mp3");

music.loop = true;

music.volume = 0.16;


/*
    Si todavía no tienes las narraciones,
    no pasa nada.

    El video funcionará solamente con música.

    Cuando tengas los audios puedes agregarlos así:

    const narrations = [
        "audio/escena1.mp3",
        "audio/escena2.mp3",
        "audio/escena3.mp3",
        "audio/escena4.mp3",
        "audio/escena5.mp3",
        "audio/escena6.mp3",
        "audio/escena7.mp3"
    ];
*/

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
   INICIAR
========================================================= */

startButton.addEventListener("click", () => {

    started = true;

    startScreen.style.opacity = "0";

    startScreen.style.pointerEvents = "none";

    document.body.classList.add("recording");

    music.play().catch(() => {});

    playScene(0);

});


/* =========================================================
   ESCENA
========================================================= */

function playScene(index) {

    clearTimeout(timer);

    clearInterval(progressTimer);

    if (narrationAudio) {

        narrationAudio.pause();

        narrationAudio.currentTime = 0;

        narrationAudio = null;
    }


    scenes.forEach((scene, i) => {

        scene.classList.toggle(
            "active",
            i === index
        );

    });


    current = index;


    currentScene.textContent =
        String(index + 1).padStart(2, "0");


    startProgress();


    /*
        Narración
    */

    if (
        narrations[index] &&
        !muted
    ) {

        narrationAudio =
            new Audio(narrations[index]);

        narrationAudio.volume = .95;

        narrationAudio.play().catch(() => {});

        /*
            Baja la música mientras habla
        */

        music.volume = .05;

        narrationAudio.addEventListener(
            "ended",
            () => {

                music.volume = .16;

            }
        );

    } else {

        music.volume = .16;

    }


    timer = setTimeout(() => {

        nextScene();

    }, SCENE_TIME);

}


/* =========================================================
   SIGUIENTE
========================================================= */

function nextScene() {

    let next = current + 1;

    if (next >= scenes.length) {

        next = 0;

    }

    playScene(next);
}


/* =========================================================
   ANTERIOR
========================================================= */

function previousScene() {

    let previous = current - 1;

    if (previous < 0) {

        previous = scenes.length - 1;

    }

    playScene(previous);
}


/* =========================================================
   PROGRESO
========================================================= */

function startProgress() {

    let start = Date.now();

    progressBar.style.width = "0%";

    progressTimer = setInterval(() => {

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

soundButton.addEventListener("click", (event) => {

    event.stopPropagation();

    muted = !muted;

    if (muted) {

        music.volume = 0;

        if (narrationAudio) {
            narrationAudio.volume = 0;
        }

        soundButton.textContent = "🔇";

    } else {

        music.volume = .16;

        if (narrationAudio) {
            narrationAudio.volume = .95;
        }

        soundButton.textContent = "🔊";
    }

});


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (!started) return;

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
   TOQUE EN CELULAR
========================================================= */

let touchStartX = 0;

let touchEndX = 0;


document.addEventListener(
    "touchstart",
    (event) => {

        if (!started) return;

        touchStartX =
            event.changedTouches[0].screenX;

    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    (event) => {

        if (!started) return;

        touchEndX =
            event.changedTouches[0].screenX;

        handleSwipe();

    },
    { passive: true }
);


function handleSwipe() {

    const difference =
        touchStartX - touchEndX;

    /*
        Deslizar hacia la izquierda
        = siguiente
    */

    if (difference > 60) {

        nextScene();

    }

    /*
        Deslizar hacia la derecha
        = anterior
    */

    if (difference < -60) {

        previousScene();

    }

}


/* =========================================================
   PRELOAD DE IMÁGENES
========================================================= */

const imagePaths = [

    "img/logo_amaya.png",
    "img/pos_amaya.png",
    "img/ticket_amaya.png",
    "img/escaneo_qr.png",
    "img/historial_pagos.png"

];


imagePaths.forEach(path => {

    const img =
        new Image();

    img.src = path;

});


/* =========================================================
   PRELOAD AUDIO
========================================================= */

music.preload = "auto";


/* =========================================================
   PREVENIR ZOOM ACCIDENTAL
========================================================= */

document.addEventListener(
    "gesturestart",
    event => {
        event.preventDefault();
    }
);


/* =========================================================
   VISIBILIDAD
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!started) return;

        if (document.hidden) {

            clearTimeout(timer);

            clearInterval(progressTimer);

            music.pause();

            if (narrationAudio) {
                narrationAudio.pause();
            }

        } else {

            music.play().catch(() => {});

            playScene(current);

        }

    }
);
