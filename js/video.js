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

let touchStartX =
    0;

let touchEndX =
    0;


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

const narrations = [

    "audio/narracion_01.mp3",
    "audio/narracion_02.mp3",
    "audio/narracion_03.mp3",
    "audio/narracion_04.mp3",
    "audio/narracion_05.mp3",
    "audio/narracion_06.mp3",
    "audio/narracion_07.mp3"

];

let narrationAudio =
    null;


/* =========================================================
   UTILIDADES
========================================================= */

function clearTimers() {

    clearTimeout(timer);

    clearInterval(progressTimer);

    timer = null;

    progressTimer = null;

}


/* =========================================================
   INICIO
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startVideo
    );

}


/* =========================================================
   INICIAR VIDEO
========================================================= */

function startVideo() {

    if (started) {

        return;

    }


    started =
        true;

    finished =
        false;

    pausedByVisibility =
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
     * Activar modo de grabación.
     */

    document.body.classList.add(
        "recording"
    );


    /*
     * Asegurar que no exista
     * un estado final anterior.
     */

    document.body.classList.remove(
        "video-finished"
    );


    /*
     * Preparar música.
     */

    music.currentTime =
        0;

    music.volume =
        muted
            ? 0
            : MUSIC_VOLUME;


    /*
     * Reproducir música.
     */

    if (!muted) {

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

    clearTimers();


    /*
     * Detener narración anterior.
     */

    stopNarration();


    /*
     * Activar únicamente
     * la escena correspondiente.
     */

    scenes.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === index
            );

        }
    );


    /*
     * Actualizar escena actual.
     */

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
     * Reiniciar barra.
     */

    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    /*
     * Iniciar progreso.
     */

    startProgress();


    /*
     * Reproducir narración
     * si existe.
     */

    playNarration(index);


    /*
     * Mantener música activa.
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

    if (
        !started ||
        finished
    ) {

        return;

    }


    const next =
        current + 1;


    /*
     * Si ya estamos en la última,
     * finalizar el video.
     */

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
        finished
    ) {

        return;

    }


    if (current <= 0) {

        return;

    }


    playScene(
        current - 1
    );

}


/* =========================================================
   FINAL DEL VIDEO
========================================================= */

function finishVideo() {

    if (finished) {

        return;

    }


    finished =
        true;


    /*
     * Detener absolutamente
     * todos los temporizadores.
     */

    clearTimers();


    /*
     * Detener narración.
     */

    stopNarration();


    /*
     * Activar solamente
     * la última escena.
     */

    scenes.forEach(
        (scene, index) => {

            scene.classList.toggle(
                "active",
                index === scenes.length - 1
            );

        }
    );


    /*
     * Actualizar escena.
     */

    current =
        scenes.length - 1;


    if (currentScene) {

        currentScene.textContent =
            String(scenes.length)
                .padStart(2, "0");

    }


    /*
     * Completar barra.
     */

    if (progressBar) {

        progressBar.style.width =
            "100%";

    }


    /*
     * Detener música.
     */

    music.pause();

    music.currentTime =
        0;


    /*
     * Marcar video terminado.
     */

    document.body.classList.add(
        "video-finished"
    );

}


/* =========================================================
   PROGRESO DE ESCENA
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

                if (
                    finished
                ) {

                    clearInterval(
                        progressTimer
                    );

                    return;

                }


                const elapsed =
                    Date.now() -
                    startTime;


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


    soundButton.setAttribute(
        "aria-label",
        muted
            ? "Activar sonido"
            : "Silenciar sonido"
    );

}


if (soundButton) {

    soundButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            muted =
                !muted;


            if (muted) {

                /*
                 * Silenciar música.
                 */

                music.volume =
                    0;


                /*
                 * Silenciar narración.
                 */

                if (narrationAudio) {

                    narrationAudio.volume =
                        0;

                }

            } else {

                /*
                 * Restaurar música.
                 */

                music.volume =
                    MUSIC_VOLUME;


                /*
                 * Restaurar narración.
                 */

                if (narrationAudio) {

                    narrationAudio.volume =
                        1;

                }


                /*
                 * Reanudar música si
                 * el video continúa.
                 */

                if (
                    started &&
                    !finished &&
                    music.paused
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

        /*
         * No hacer nada antes
         * de iniciar el video.
         */

        if (
            !started ||
            finished
        ) {

            return;

        }


        /*
         * Siguiente.
         */

        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            nextScene();

            return;

        }


        /*
         * Anterior.
         */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            previousScene();

            return;

        }


        /*
         * Espacio = pausa/reanudar música.
         */

        if (
            event.key ===
            " "
        ) {

            event.preventDefault();


            if (music.paused) {

                if (!muted) {

                    music.play().catch(
                        () => {}
                    );

                }

            } else {

                music.pause();

            }

        }

    }
);


/* =========================================================
   TOUCH / SWIPE
========================================================= */

document.addEventListener(
    "touchstart",
    event => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        if (
            !event.changedTouches ||
            !event.changedTouches.length
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


        if (
            !event.changedTouches ||
            !event.changedTouches.length
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


        /*
         * Swipe izquierda.
         */

        if (
            difference > 60
        ) {

            nextScene();

            return;

        }


        /*
         * Swipe derecha.
         */

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


        /*
         * Pestaña oculta.
         */

        if (document.hidden) {

            pausedByVisibility =
                true;


            clearTimers();


            music.pause();


            if (narrationAudio) {

                narrationAudio.pause();

            }


            return;

        }


        /*
         * Pestaña visible nuevamente.
         */

        if (
            !pausedByVisibility
        ) {

            return;

        }


        pausedByVisibility =
            false;


        /*
         * Reanudar música.
         */

        if (!muted) {

            music.play().catch(
                () => {}
            );

        }


        /*
         * Reiniciar el ciclo
         * de la escena actual.
         */

        playScene(current);

    }
);


/* =========================================================
   PREVENIR DOBLE CLIC ACCIDENTAL
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "dblclick",
        event => {

            event.preventDefault();

        }
    );

}


/* =========================================================
   ESTADO INICIAL
========================================================= */

updateSoundButton();


/* =========================================================
   ASEGURAR ESCENA INICIAL
========================================================= */

scenes.forEach(
    (scene, index) => {

        scene.classList.toggle(
            "active",
            index === 0
        );

    }
);
