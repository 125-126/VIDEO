/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO
   INICIO CON BOTÓN + AUDIO
========================================================= */

const scenes = document.querySelectorAll(".scene");

const progressBar =
    document.getElementById("progressBar");

const currentScene =
    document.getElementById("currentScene");

const soundButton =
    document.getElementById("soundButton");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SCENE_TIME = 7500;

const MUSIC_VOLUME = 0.35;

const MUSIC_DUCK_VOLUME = 0.10;

const NARRATION_VOLUME = 1.0;


let current = 0;

let timer = null;

let progressTimer = null;

let started = false;

let muted = false;

let finished = false;


/* =========================================================
   AUDIO PRINCIPAL
========================================================= */

const music =
    new Audio("audio/musica.mp3");

music.loop = true;

music.preload = "auto";

music.volume =
    MUSIC_VOLUME;


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
   BOTÓN DE INICIO
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            if (started) {
                return;
            }


            started = true;


            /*
             * Ocultar pantalla inicial.
             */

            if (startScreen) {

                startScreen.classList.add(
                    "hidden"
                );

            }


            /*
             * Ocultar controles
             * durante el video.
             */

            document.body.classList.add(
                "recording"
            );


            /*
             * Configurar volumen.
             */

            music.volume =
                muted
                    ? 0
                    : MUSIC_VOLUME;


            /*
             * Reproducir música.
             *
             * Como esto ocurre después
             * del clic del usuario,
             * el navegador permite el audio.
             */

            music.play().catch(
                (error) => {

                    console.log(
                        "No se pudo reproducir la música:",
                        error
                    );

                }
            );


            /*
             * Comenzar escena 1.
             */

            playScene(0);

        }
    );

}


/* =========================================================
   REPRODUCIR ESCENA
========================================================= */

function playScene(index) {

    if (
        finished ||
        index < 0 ||
        index >= scenes.length
    ) {

        return;

    }


    /*
     * Limpiar temporizadores anteriores.
     */

    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
     * Detener narración anterior.
     */

    if (narrationAudio) {

        narrationAudio.pause();

        narrationAudio.currentTime = 0;

        narrationAudio = null;

    }


    /*
     * Activar solamente la escena actual.
     */

    scenes.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === index
            );

        }
    );


    current = index;


    /* =====================================================
       CONTADOR
    ===================================================== */

    if (currentScene) {

        currentScene.textContent =
            String(index + 1)
                .padStart(2, "0");

    }


    /* =====================================================
       PROGRESO
    ===================================================== */

    startProgress();


    /* =====================================================
       NARRACIÓN
    ===================================================== */

    if (
        narrations[index] &&
        !muted
    ) {

        narrationAudio =
            new Audio(
                narrations[index]
            );


        narrationAudio.preload =
            "auto";


        narrationAudio.volume =
            NARRATION_VOLUME;


        /*
         * Bajar música mientras
         * se reproduce la narración.
         */

        music.volume =
            MUSIC_DUCK_VOLUME;


        narrationAudio
            .play()
            .catch(
                () => {}
            );


        narrationAudio.addEventListener(
            "ended",
            () => {

                if (
                    !muted &&
                    !finished
                ) {

                    music.volume =
                        MUSIC_VOLUME;

                }

            }
        );

    } else {

        /*
         * Música normal.
         */

        music.volume =
            muted
                ? 0
                : MUSIC_VOLUME;

    }


    /* =====================================================
       ASEGURAR MÚSICA
    ===================================================== */

    if (
        !muted &&
        music.paused
    ) {

        music
            .play()
            .catch(
                () => {}
            );

    }


    /* =====================================================
       TIEMPO DE ESCENA
    ===================================================== */

    timer =
        setTimeout(
            () => {

                nextScene();

            },
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
   FINAL DEL VIDEO
   NO REPETIR
========================================================= */

function finishVideo() {

    if (finished) {
        return;
    }


    finished = true;


    /*
     * Detener temporizadores.
     */

    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
     * Mantener visible la última escena.
     */

    scenes.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === scenes.length - 1
            );

        }
    );


    current =
        scenes.length - 1;


    /*
     * Contador final.
     */

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
     * Marcar video terminado.
     */

    document.body.classList.add(
        "video-finished"
    );


    /*
     * Detener narración.
     */

    if (narrationAudio) {

        narrationAudio.pause();

        narrationAudio.currentTime = 0;

        narrationAudio = null;

    }


    /*
     * DETENER MÚSICA.
     *
     * El video NO vuelve a empezar.
     */

    music.pause();

    music.currentTime = 0;

}


/* =========================================================
   ESCENA ANTERIOR
========================================================= */

function previousScene() {

    if (
        finished ||
        current === 0
    ) {

        return;

    }


    playScene(
        current - 1
    );

}


/* =========================================================
   BARRA DE PROGRESO
========================================================= */

function startProgress() {

    clearInterval(
        progressTimer
    );


    const start =
        Date.now();


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    progressTimer =
        setInterval(
            () => {

                const elapsed =
                    Date.now() - start;


                const percent =
                    Math.min(
                        (
                            elapsed /
                            SCENE_TIME
                        ) * 100,
                        100
                    );


                if (progressBar) {

                    progressBar.style.width =
                        percent + "%";

                }

            },
            30
        );

}


/* =========================================================
   BOTÓN DE SONIDO
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
        (event) => {

            event.stopPropagation();


            muted =
                !muted;


            if (muted) {

                /*
                 * Silenciar música.
                 */

                music.volume = 0;


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
                        NARRATION_VOLUME;

                }


                /*
                 * Continuar música.
                 */

                if (
                    started &&
                    !finished
                ) {

                    music
                        .play()
                        .catch(
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
    (event) => {

        if (
            !started ||
            finished
        ) {

            return;

        }


        /*
         * SIGUIENTE
         */

        if (
            event.key ===
            "ArrowRight"
        ) {

            nextScene();

        }


        /*
         * ANTERIOR
         */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousScene();

        }


        /*
         * ESPACIO = PAUSAR / CONTINUAR MÚSICA
         */

        if (
            event.key === " "
        ) {

            event.preventDefault();


            if (
                music.paused
            ) {

                music
                    .play()
                    .catch(
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

let touchStartX = 0;

let touchEndX = 0;


document.addEventListener(
    "touchstart",
    (event) => {

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
    (event) => {

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


        handleSwipe();

    },
    {
        passive: true
    }
);


function handleSwipe() {

    if (finished) {
        return;
    }


    const difference =
        touchStartX -
        touchEndX;


    /*
     * Deslizar hacia la izquierda
     * = siguiente.
     */

    if (
        difference > 60
    ) {

        nextScene();

    }


    /*
     * Deslizar hacia la derecha
     * = anterior.
     */

    if (
        difference < -60
    ) {

        previousScene();

    }

}


/* =========================================================
   PRE-CARGAR IMÁGENES
========================================================= */

const imagePaths = [

    "img/logo_amaya.jpeg",

    "img/pos_amaya.png",

    "img/ticket_amaya.png",

    "img/escaneo_qr.png",

    "img/historial_pagos.png"

];


imagePaths.forEach(
    (path) => {

        const img =
            new Image();

        img.src = path;

    }
);


/* =========================================================
   PRE-CARGAR AUDIO
========================================================= */

music.preload =
    "auto";


/* =========================================================
   VISIBILITY
   Si se cambia de pestaña, pausamos.
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

            /*
             * Pausar temporizadores.
             */

            clearTimeout(timer);

            clearInterval(
                progressTimer
            );


            /*
             * Pausar música.
             */

            music.pause();


            /*
             * Pausar narración.
             */

            if (narrationAudio) {

                narrationAudio.pause();

            }

        } else {

            /*
             * Regresar a la pestaña.
             */

            if (finished) {
                return;
            }


            /*
             * Continuar música.
             */

            if (!muted) {

                music
                    .play()
                    .catch(
                        () => {}
                    );

            }


            /*
             * Continuar escena actual.
             */

            playScene(current);

        }

    }
);


/* =========================================================
   ESTADO INICIAL
========================================================= */

/*
 * El video NO comienza automáticamente.
 *
 * Espera a que el usuario pulse:
 *
 * ▶ REPRODUCIR VIDEO
 *
 * Esto permite que la música
 * pueda comenzar correctamente.
 */

updateSoundButton();
