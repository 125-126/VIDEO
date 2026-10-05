/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const scenes =
    document.querySelectorAll(".scene");

const progressBar =
    document.getElementById("progressBar");

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

let finished = false;


/* =========================================================
   AUDIO
========================================================= */

const music =
    new Audio("audio/musica.mp3");

music.loop = true;

music.preload = "auto";

/*
   VOLUMEN PRINCIPAL

   Antes:
   0.16

   Ahora:
   0.25
*/

const MUSIC_VOLUME = 0.25;


/*
   VOLUMEN DURANTE NARRACIÓN
*/

const MUSIC_DUCK_VOLUME = 0.07;


/*
   VOLUMEN DE LA NARRACIÓN
*/

const NARRATION_VOLUME = 0.95;


/*
   Volumen inicial
*/

music.volume = MUSIC_VOLUME;


/* =========================================================
   NARRACIONES
========================================================= */

/*
    Si todavía no tienes las narraciones,
    puedes dejar todo en null.

    El video funcionará solamente con música.

    Cuando tengas los audios:

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
   INICIAR EXPERIENCIA
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        /*
           Si ya terminó, no volver a iniciar.
        */

        if (finished) return;


        started = true;


        /*
           Ocultar pantalla inicial
        */

        startScreen.style.opacity = "0";

        startScreen.style.pointerEvents = "none";


        /*
           Modo grabación

           Oculta controles para que el video
           quede limpio al grabarlo.
        */

        document.body.classList.add(
            "recording"
        );


        /*
           Iniciar música
        */

        music.volume =
            muted
                ? 0
                : MUSIC_VOLUME;

        music.play().catch(() => {});


        /*
           Comenzar primera escena
        */

        playScene(0);

    }
);


/* =========================================================
   REPRODUCIR ESCENA
========================================================= */

function playScene(index) {

    /*
       Seguridad:
       nunca permitir índices inválidos.
    */

    if (
        index < 0 ||
        index >= scenes.length
    ) {
        return;
    }


    /*
       Si el video ya terminó,
       no volver a reproducir.
    */

    if (finished) {
        return;
    }


    /*
       Limpiar temporizadores anteriores
    */

    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
       Detener narración anterior
    */

    if (narrationAudio) {

        narrationAudio.pause();

        narrationAudio.currentTime = 0;

        narrationAudio = null;
    }


    /*
       Activar solamente la escena actual
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
       Guardar escena actual
    */

    current = index;


    /*
       Actualizar contador
    */

    currentScene.textContent =
        String(index + 1).padStart(
            2,
            "0"
        );


    /*
       Iniciar barra de progreso
    */

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

        narrationAudio.volume =
            NARRATION_VOLUME;


        /*
           Bajar música mientras habla
        */

        music.volume =
            MUSIC_DUCK_VOLUME;


        /*
           Reproducir narración
        */

        narrationAudio
            .play()
            .catch(() => {});


        /*
           Cuando termina la narración,
           devolver música a volumen normal.
        */

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

        /*
           Sin narración:
           música normal.
        */

        music.volume =
            muted
                ? 0
                : MUSIC_VOLUME;
    }


    /* =====================================================
       TEMPORIZADOR DE ESCENA
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

    /*
       Si ya terminó, no hacer nada.
    */

    if (finished) {
        return;
    }


    const next =
        current + 1;


    /*
       ======================================================
       ÚLTIMA ESCENA
       ======================================================
    */

    if (
        next >= scenes.length
    ) {

        finishVideo();

        return;
    }


    /*
       Ir a la siguiente escena
    */

    playScene(next);
}


/* =========================================================
   FINALIZAR VIDEO
========================================================= */

function finishVideo() {

    /*
       Evitar que se ejecute dos veces.
    */

    if (finished) {
        return;
    }


    finished = true;


    /*
       Detener temporizadores
    */

    clearTimeout(timer);

    clearInterval(progressTimer);


    /*
       Asegurar que estamos en la última escena
    */

    scenes.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === scenes.length - 1
            );

        }
    );


    /*
       Actualizar estado
    */

    current =
        scenes.length - 1;


    currentScene.textContent =
        String(
            scenes.length
        ).padStart(
            2,
            "0"
        );


    /*
       Completar barra
    */

    progressBar.style.width =
        "100%";


    /*
       Marcar video terminado
    */

    document.body.classList.add(
        "video-finished"
    );


    /*
       La música puede continuar suavemente
       en la pantalla final.

       Si quieres que se detenga completamente
       al final, cambia MUSIC_VOLUME por 0.
    */

    if (!muted) {

        music.volume =
            MUSIC_VOLUME;

    }


    /*
       Detener narración
       para que no quede reproduciéndose.
    */

    if (narrationAudio) {

        narrationAudio.pause();

        narrationAudio.currentTime = 0;

        narrationAudio = null;
    }
}


/* =========================================================
   ESCENA ANTERIOR
========================================================= */

function previousScene() {

    /*
       Si el video terminó,
       no permitir regresar y repetirlo.
    */

    if (finished) {
        return;
    }


    let previous =
        current - 1;


    /*
       No hacer loop hacia la última escena.

       Si estamos en la primera,
       simplemente permanecemos ahí.
    */

    if (previous < 0) {

        previous = 0;

    }


    playScene(previous);
}


/* =========================================================
   PROGRESO DE ESCENA
========================================================= */

function startProgress() {

    /*
       Limpiar progreso anterior.
    */

    clearInterval(
        progressTimer
    );


    const start =
        Date.now();


    progressBar.style.width =
        "0%";


    progressTimer =
        setInterval(
            () => {

                const elapsed =
                    Date.now() - start;


                let percent =
                    (
                        elapsed /
                        SCENE_TIME
                    ) * 100;


                if (percent > 100) {

                    percent = 100;

                }


                progressBar.style.width =
                    percent + "%";


            },
            30
        );
}


/* =========================================================
   SONIDO
========================================================= */

soundButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        muted =
            !muted;


        /* =================================================
           SILENCIAR
        ================================================= */

        if (muted) {

            music.volume = 0;


            if (narrationAudio) {

                narrationAudio.volume = 0;

            }


            soundButton.textContent =
                "🔇";


        }


        /* =================================================
           ACTIVAR SONIDO
        ================================================= */

        else {

            /*
               Música vuelve a volumen normal.
            */

            music.volume =
                MUSIC_VOLUME;


            /*
               Narración vuelve a volumen normal.
            */

            if (narrationAudio) {

                narrationAudio.volume =
                    NARRATION_VOLUME;

            }


            soundButton.textContent =
                "🔊";


            /*
               Intentar continuar música.
            */

            if (
                started &&
                !finished
            ) {

                music
                    .play()
                    .catch(() => {});

            }

        }

    }
);


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (!started) return;


        /*
           Si terminó,
           bloquear navegación.
        */

        if (finished) {
            return;
        }


        /*
           SIGUIENTE
        */

        if (
            event.key ===
            "ArrowRight"
        ) {

            nextScene();

        }


        /*
           ANTERIOR
        */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousScene();

        }


        /*
           ESPACIO = PAUSAR / REANUDAR MÚSICA
        */

        if (
            event.key === " "
        ) {

            event.preventDefault();


            if (music.paused) {

                music
                    .play()
                    .catch(() => {});

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


/*
   TOQUE INICIAL
*/

document.addEventListener(
    "touchstart",
    (event) => {

        if (!started) return;

        if (finished) return;


        touchStartX =
            event
                .changedTouches[0]
                .screenX;

    },
    {
        passive: true
    }
);


/*
   FIN DEL TOQUE
*/

document.addEventListener(
    "touchend",
    (event) => {

        if (!started) return;

        if (finished) return;


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


/* =========================================================
   DETECTAR SWIPE
========================================================= */

function handleSwipe() {

    /*
       Si terminó, no hacer nada.
    */

    if (finished) {
        return;
    }


    const difference =
        touchStartX -
        touchEndX;


    /*
       Deslizar hacia la izquierda
       = siguiente
    */

    if (
        difference > 60
    ) {

        nextScene();

    }


    /*
       Deslizar hacia la derecha
       = anterior
    */

    if (
        difference < -60
    ) {

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


imagePaths.forEach(
    (path) => {

        const img =
            new Image();

        img.src = path;

    }
);


/* =========================================================
   PRELOAD AUDIO
========================================================= */

music.preload =
    "auto";


/* =========================================================
   PREVENIR ZOOM ACCIDENTAL
========================================================= */

document.addEventListener(
    "gesturestart",
    (event) => {

        event.preventDefault();

    }
);


/* =========================================================
   VISIBILIDAD DE LA PÁGINA
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
           Si todavía no comenzó,
           no hacemos nada.
        */

        if (!started) {
            return;
        }


        /* =================================================
           PÁGINA OCULTA
        ================================================= */

        if (document.hidden) {

            /*
               Pausar temporizadores
            */

            clearTimeout(timer);

            clearInterval(
                progressTimer
            );


            /*
               Pausar música
            */

            music.pause();


            /*
               Pausar narración
            */

            if (narrationAudio) {

                narrationAudio.pause();

            }

        }


        /* =================================================
           PÁGINA VISIBLE OTRA VEZ
        ================================================= */

        else {

            /*
               Si ya terminó,
               NO volver a iniciar nada.
            */

            if (finished) {

                return;

            }


            /*
               Volver a reproducir música
            */

            if (!muted) {

                music
                    .play()
                    .catch(() => {});

            }


            /*
               Continuar exactamente
               desde la escena actual.
            */

            playScene(current);

        }

    }
);
