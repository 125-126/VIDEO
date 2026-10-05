/* =========================================================
   COMERCIAL AMAYA
   VIDEO CORPORATIVO
   MOTOR PRINCIPAL
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const scenes =
    document.querySelectorAll(".scene");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const progressBar =
    document.getElementById("progressBar");

const currentScene =
    document.getElementById("currentScene");

const soundButton =
    document.getElementById("soundButton");


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SCENE_TIME =
    7000;

const MUSIC_VOLUME =
    0.35;


/* =========================================================
   ESTADO
========================================================= */

let current =
    0;

let timer =
    null;

let progressTimer =
    null;

let started =
    false;

let muted =
    false;

let finished =
    false;

let pausedByVisibility =
    false;


/* =========================================================
   MÚSICA
========================================================= */

const music =
    new Audio("audio/musica.mp3");

music.preload =
    "auto";

music.loop =
    true;

music.volume =
    MUSIC_VOLUME;


/* =========================================================
   NARRACIONES
========================================================= */

/*
 * Más adelante podemos agregar narración.
 *
 * Ejemplo:
 *
 * "audio/escena1.mp3"
 *
 * Por ahora están vacías.
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

let narrationAudio =
    null;


/* =========================================================
   INICIO DEL VIDEO
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startVideo
    );

}


/* =========================================================
   FUNCIÓN PRINCIPAL DE INICIO
========================================================= */

function startVideo() {

    if (started) {

        return;

    }


    started =
        true;


    finished =
        false;


    /*
     * Ocultar pantalla inicial.
     */

    if (startScreen) {

        startScreen.classList.add(
            "hidden"
        );

    }


    /*
     * Modo limpio para grabación.
     */

    document.body.classList.add(
        "recording"
    );


    /*
     * Comenzar música.
     */

    if (!muted) {

        music.volume =
            MUSIC_VOLUME;

        music.currentTime =
            0;

        music.play().catch(
            error => {

                console.log(
                    "No se pudo reproducir la música:",
                    error
                );

            }
        );

    }


    /*
     * Comenzar desde escena 1.
     */

    playScene(0);

}


/* =========================================================
   REPRODUCIR ESCENA
========================================================= */

function playScene(index) {

    if (finished) {

        return;

    }


    if (
        index < 0 ||
        index >= scenes.length
    ) {

        return;

    }


    /*
     * Limpiar temporizadores.
     */

    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
     * Detener narración anterior.
     */

    stopNarration();


    /*
     * Activar escena.
     */

    scenes.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === index
            );

        }
    );


    current =
        index;


    /*
     * Actualizar contador.
     */

    if (currentScene) {

        currentScene.textContent =
            String(index + 1)
                .padStart(2, "0");

    }


    /*
     * Reiniciar progreso.
     */

    startProgress();


    /*
     * Narración.
     */

    playNarration(index);


    /*
     * Música.
     */

    if (
        !muted &&
        music.paused
    ) {

        music.play().catch(
            () => {}
        );

    }


    /*
     * Programar siguiente escena.
     */

    timer =
        setTimeout(
            nextScene,
            SCENE_TIME
        );

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


    if (
        next >= scenes.length
    ) {

        finishVideo();

        return;

    }


    playScene(next);

}


/* =========================================================
   ESCENA ANTERIOR
========================================================= */

function previousScene() {

    if (
        !started ||
        finished ||
        current <= 0
    ) {

        return;

    }


    playScene(
        current - 1
    );

}


/* =========================================================
   FINAL
========================================================= */

function finishVideo() {

    if (finished) {

        return;

    }


    finished =
        true;


    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
     * Mostrar última escena.
     */

    scenes.forEach(
        (scene, index) => {

            scene.classList.toggle(
                "active",
                index === scenes.length - 1
            );

        }
    );


    current =
        scenes.length - 1;


    /*
     * Contador.
     */

    if (currentScene) {

        currentScene.textContent =
            String(scenes.length)
                .padStart(2, "0");

    }


    /*
     * Detener narración.
     */

    stopNarration();


    /*
     * Detener música.
     */

    music.pause();

    music.currentTime =
        0;


    /*
     * Estado final.
     */

    document.body.classList.add(
        "video-finished"
    );

}


/* =========================================================
   PROGRESO
========================================================= */

function startProgress() {

    clearInterval(
        progressTimer
    );


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    const startTime =
        Date.now();


    progressTimer =
        setInterval(
            () => {

                const elapsed =
                    Date.now() - startTime;


                const percentage =
                    Math.min(
                        (
                            elapsed /
                            SCENE_TIME
                        ) * 100,
                        100
                    );


                if (progressBar) {

                    progressBar.style.width =
                        percentage + "%";

                }

            },
            30
        );

}


/* =========================================================
   NARRACIÓN
========================================================= */

function playNarration(index) {

    const narration =
        narrations[index];


    if (
        !narration ||
        muted
    ) {

        return;

    }


    narrationAudio =
        new Audio(narration);


    narrationAudio.preload =
        "auto";

    narrationAudio.volume =
        1;


    narrationAudio.play().catch(
        () => {}
    );

}


function stopNarration() {

    if (!narrationAudio) {

        return;

    }


    narrationAudio.pause();

    narrationAudio.currentTime =
        0;

    narrationAudio =
        null;

}


/* =========================================================
   SONIDO
========================================================= */

function updateSoundButton() {

    if (!soundButton) {

        return;

    }


    soundButton.textContent =
        muted
            ? "🔇"
            : "🔊";

}


if (soundButton) {

    soundButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            muted =
                !muted;


            if (muted) {

                music.volume =
                    0;


                if (narrationAudio) {

                    narrationAudio.volume =
                        0;

                }

            } else {

                music.volume =
                    MUSIC_VOLUME;


                if (narrationAudio) {

                    narrationAudio.volume =
                        1;

                }


                if (
                    started &&
                    !finished
                ) {

                    music.play().catch(
                        () => {}
                    );

                }

            }


            updateSoundButton();

        }
    );

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextScene();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousScene();

        }


        if (
            event.key ===
            " "
        ) {

            event.preventDefault();


            if (music.paused) {

                music.play().catch(
                    () => {}
                );

            } else {

                music.pause();

            }

        }

    }
);


/* =========================================================
   TOUCH / SWIPE
========================================================= */

let touchStartX =
    0;

let touchEndX =
    0;


document.addEventListener(
    "touchstart",
    event => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        touchStartX =
            event
                .changedTouches[0]
                .screenX;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    event => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        touchEndX =
            event
                .changedTouches[0]
                .screenX;


        const difference =
            touchStartX -
            touchEndX;


        if (
            difference > 60
        ) {

            nextScene();

        }


        if (
            difference < -60
        ) {

            previousScene();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   PRECARGAR IMÁGENES
========================================================= */

const imagePaths = [

    "img/logo_amaya.jpeg",

    "img/pos_amaya.png",

    "img/ticket_amaya.png",

    "img/escaneo_qr.png",

    "img/historial_pagos.png"

];


imagePaths.forEach(
    path => {

        const image =
            new Image();

        image.src =
            path;

    }
);


/* =========================================================
   VISIBILIDAD DE PESTAÑA
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        if (
            document.hidden
        ) {

            pausedByVisibility =
                true;

            clearTimeout(timer);

            clearInterval(
                progressTimer
            );

            music.pause();

            if (narrationAudio) {

                narrationAudio.pause();

            }

        } else {

            if (
                !pausedByVisibility
            ) {

                return;

            }


            pausedByVisibility =
                false;


            if (
                !muted
            ) {

                music.play().catch(
                    () => {}
                );

            }


            /*
             * Continuar la escena actual
             * con un nuevo ciclo completo.
             */

            playScene(current);

        }

    }
);


/* =========================================================
   ESTADO INICIAL
========================================================= */

updateSoundButton();
