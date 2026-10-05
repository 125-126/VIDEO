/* =========================================================
   COMERCIAL AMAYA
   MOTOR DEL VIDEO CORPORATIVO
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const scenes = [

    {
        duration: 7000,
        narration: "audio/escena1.mp3"
    },

    {
        duration: 7500,
        narration: "audio/escena2.mp3"
    },

    {
        duration: 7000,
        narration: "audio/escena3.mp3"
    },

    {
        duration: 7500,
        narration: "audio/escena4.mp3"
    },

    {
        duration: 7500,
        narration: "audio/escena5.mp3"
    },

    {
        duration: 7500,
        narration: "audio/escena6.mp3"
    },

    {
        duration: 8500,
        narration: "audio/escena7.mp3"
    }

];


/* =========================================================
   ELEMENTOS
========================================================= */

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const videoStage =
    document.getElementById("videoStage");

const sceneElements =
    document.querySelectorAll(".scene");

const progressBar =
    document.getElementById("progressBar");

const backgroundMusic =
    document.getElementById("backgroundMusic");

const narration =
    document.getElementById("narration");

const soundIndicator =
    document.getElementById("soundIndicator");


/* =========================================================
   VARIABLES
========================================================= */

let currentScene = 0;

let sceneTimer = null;

let progressTimer = null;

let experienceStarted = false;

let musicStarted = false;


/* =========================================================
   VOLUMEN
========================================================= */

const MUSIC_NORMAL_VOLUME = 0.16;

const MUSIC_VOICE_VOLUME = 0.055;


/* =========================================================
   INICIAR EXPERIENCIA
========================================================= */

startButton.addEventListener("click", async () => {

    if (experienceStarted) {
        return;
    }

    experienceStarted = true;


    /*
     * El navegador permite el audio porque
     * todo ocurre después del clic.
     */

    try {

        backgroundMusic.volume =
            MUSIC_NORMAL_VOLUME;

        await backgroundMusic.play();

        musicStarted = true;

    } catch (error) {

        console.log(
            "La música todavía no pudo reproducirse:",
            error
        );

    }


    /*
     * Ocultar pantalla inicial
     */

    startScreen.classList.add("hidden");


    /*
     * Mostrar indicador de sonido
     */

    soundIndicator.classList.add("visible");


    /*
     * Iniciar primera escena
     */

    currentScene = 0;

    showScene(currentScene);


    /*
     * Ocultar indicador después de unos segundos
     */

    setTimeout(() => {

        soundIndicator.classList.remove(
            "visible"
        );

    }, 4000);

});


/* =========================================================
   MOSTRAR ESCENA
========================================================= */

function showScene(index) {

    clearTimeout(sceneTimer);

    clearInterval(progressTimer);


    /*
     * Evitar valores fuera del rango
     */

    if (index >= scenes.length) {

        index = 0;

    }

    if (index < 0) {

        index = scenes.length - 1;

    }


    currentScene = index;


    /*
     * Cambiar escenas
     */

    sceneElements.forEach((scene, i) => {

        scene.classList.toggle(
            "active",
            i === currentScene
        );

    });


    /*
     * Reproducir narración
     */

    playNarration(
        scenes[currentScene].narration
    );


    /*
     * Reiniciar barra
     */

    progressBar.style.transition = "none";

    progressBar.style.width = "0%";


    /*
     * Forzar reflow
     */

    void progressBar.offsetWidth;


    /*
     * Animar barra
     */

    const duration =
        scenes[currentScene].duration;


    progressBar.style.transition =
        `width ${duration}ms linear`;

    progressBar.style.width = "100%";


    /*
     * Programar siguiente escena
     */

    sceneTimer = setTimeout(() => {

        nextScene();

    }, duration);

}


/* =========================================================
   SIGUIENTE ESCENA
========================================================= */

function nextScene() {

    let next =
        currentScene + 1;


    if (next >= scenes.length) {

        next = 0;

    }


    showScene(next);

}


/* =========================================================
   NARRACIÓN
========================================================= */

async function playNarration(file) {

    /*
     * Detener narración anterior
     */

    narration.pause();

    narration.currentTime = 0;

    narration.src = "";


    /*
     * Si no existe el archivo,
     * simplemente continuamos sin voz.
     */

    if (!file) {

        restoreMusic();

        return;

    }


    narration.src = file;

    narration.volume = 1;


    /*
     * Bajar música mientras habla la voz
     */

    fadeMusic(
        MUSIC_VOICE_VOLUME,
        700
    );


    try {

        await narration.play();

    } catch (error) {

        console.log(
            "Narración no disponible:",
            file
        );

        restoreMusic();

    }


    /*
     * Cuando termina la narración,
     * subimos nuevamente la música.
     */

    narration.onended = () => {

        restoreMusic();

    };

}


/* =========================================================
   RESTAURAR MÚSICA
========================================================= */

function restoreMusic() {

    fadeMusic(
        MUSIC_NORMAL_VOLUME,
        1000
    );

}


/* =========================================================
   FADE DE MÚSICA
========================================================= */

function fadeMusic(
    targetVolume,
    duration
) {

    if (!musicStarted) {
        return;
    }


    const startVolume =
        backgroundMusic.volume;

    const difference =
        targetVolume - startVolume;

    const startTime =
        performance.now();


    function animateMusic(time) {

        const elapsed =
            time - startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        backgroundMusic.volume =
            startVolume +
            difference * progress;


        if (progress < 1) {

            requestAnimationFrame(
                animateMusic
            );

        }

    }


    requestAnimationFrame(
        animateMusic
    );

}


/* =========================================================
   REINICIAR VIDEO
========================================================= */

function restartExperience() {

    clearTimeout(sceneTimer);

    clearInterval(progressTimer);

    currentScene = 0;

    showScene(0);

}


/* =========================================================
   CLIC / TOQUE
   Si alguien toca la pantalla durante la reproducción,
   podemos mostrar brevemente el indicador.
========================================================= */

let indicatorTimeout = null;


videoStage.addEventListener(
    "click",
    () => {

        if (!experienceStarted) {
            return;
        }


        soundIndicator.classList.add(
            "visible"
        );


        clearTimeout(
            indicatorTimeout
        );


        indicatorTimeout =
            setTimeout(() => {

                soundIndicator.classList.remove(
                    "visible"
                );

            }, 1500);

    }
);


/* =========================================================
   TECLADO
   Útil para probar desde la computadora.
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (!experienceStarted) {
            return;
        }


        if (event.key === "ArrowRight") {

            showScene(
                currentScene + 1
            );

        }


        if (event.key === "ArrowLeft") {

            showScene(
                currentScene - 1
            );

        }


        if (event.key === "r" ||
            event.key === "R") {

            restartExperience();

        }

    }
);


/* =========================================================
   PRE-CARGA DE IMÁGENES
========================================================= */

const imageFiles = [

    "img/logo_amaya.png",
    "img/pos_amaya.png",
    "img/ticket_amaya.png",
    "img/escaneo_qr.png",
    "img/historial_pagos.png"

];


imageFiles.forEach(file => {

    const image =
        new Image();

    image.src = file;

});


/* =========================================================
   VISIBILIDAD DE LA PÁGINA
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!experienceStarted) {
            return;
        }


        if (document.hidden) {

            backgroundMusic.pause();

            narration.pause();

            clearTimeout(sceneTimer);

        } else {

            if (musicStarted) {

                backgroundMusic.play()
                    .catch(() => {});

            }

            narration.play()
                .catch(() => {});


            /*
             * Continuar con la escena actual.
             */

            showScene(currentScene);

        }

    }
);