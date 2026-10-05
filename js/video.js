/* =========================================================
   COMERCIAL AMAYA
   CINEMATIC EXPERIENCE ENGINE
========================================================= */

const scenes = [

    {
        duration: 7000,
        narration: "audio/escena1.mp3"
    },

    {
        duration: 8000,
        narration: "audio/escena2.mp3"
    },

    {
        duration: 7500,
        narration: "audio/escena3.mp3"
    },

    {
        duration: 8000,
        narration: "audio/escena4.mp3"
    },

    {
        duration: 8500,
        narration: "audio/escena5.mp3"
    },

    {
        duration: 8500,
        narration: "audio/escena6.mp3"
    },

    {
        duration: 9000,
        narration: "audio/escena7.mp3"
    }

];


const sceneElements =
    document.querySelectorAll(".scene");

const progressBar =
    document.querySelector(".progress-bar");

const currentScene =
    document.getElementById("currentScene");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const backgroundMusic =
    document.getElementById("backgroundMusic");

const narration =
    document.getElementById("narration");


let current = 0;

let timer = null;

let progressTimer = null;

let running = false;

let musicStarted = false;


/* =========================================================
   AUDIO
========================================================= */

backgroundMusic.volume = 0.14;

narration.volume = 1;


function startMusic(){

    if(musicStarted){

        return;

    }

    musicStarted = true;

    backgroundMusic
        .play()
        .catch(() => {});

}


function playNarration(index){

    const file =
        scenes[index].narration;

    if(!file){

        return;

    }

    narration.pause();

    narration.currentTime = 0;

    narration.src = file;

    narration.load();

    narration
        .play()
        .then(() => {

            backgroundMusic.volume = 0.045;

        })
        .catch(() => {

            backgroundMusic.volume = 0.14;

        });

}


narration.addEventListener(
    "ended",
    () => {

        backgroundMusic.volume = 0.14;

    }
);


/* =========================================================
   SCENE TRANSITION
========================================================= */

function showScene(index){

    if(index < 0){

        index = scenes.length - 1;

    }

    if(index >= scenes.length){

        index = 0;

    }


    current = index;


    sceneElements.forEach(
        (scene, i) => {

            scene.classList.toggle(
                "active",
                i === current
            );

        }
    );


    currentScene.textContent =
        String(current + 1).padStart(2, "0");


    resetProgress();

    playNarration(current);


    runSceneAnimation(current);


    clearTimeout(timer);


    timer = setTimeout(
        () => {

            nextScene();

        },
        scenes[current].duration
    );

}


/* =========================================================
   PROGRESS
========================================================= */

function resetProgress(){

    clearInterval(progressTimer);

    progressBar.style.width = "0%";

    const duration =
        scenes[current].duration;

    const start =
        performance.now();


    function animateProgress(now){

        if(!running){

            return;

        }

        const elapsed =
            now - start;

        const percent =
            Math.min(
                100,
                elapsed / duration * 100
            );

        progressBar.style.width =
            percent + "%";


        if(percent < 100){

            progressTimer =
                requestAnimationFrame(
                    animateProgress
                );

        }

    }


    progressTimer =
        requestAnimationFrame(
            animateProgress
        );

}


/* =========================================================
   NAVIGATION
========================================================= */

function nextScene(){

    showScene(current + 1);

}


function previousScene(){

    showScene(current - 1);

}


/* =========================================================
   SPECIAL SCENE ANIMATIONS
========================================================= */

function runSceneAnimation(index){

    const scene =
        sceneElements[index];


    /*
       Reinicia animaciones CSS.
    */

    const animated =
        scene.querySelectorAll(
            "[class*='image'], [class*='logo'], h1, h2, .small-label"
        );


    animated.forEach(element => {

        element.style.animation = "none";

        void element.offsetWidth;

        element.style.animation = "";

    });


    /*
       QR
    */

    if(index === 3){

        const laser =
            scene.querySelector(".qr-laser");

        if(laser){

            laser.style.animation =
                "none";

            void laser.offsetWidth;

            laser.style.animation =
                "laserScan 2.4s ease-in-out infinite";

        }

    }


    /*
       SCAN
    */

    if(index === 4){

        const scan =
            scene.querySelector(".phone-scan");

        if(scan){

            scan.style.animation =
                "none";

            void scan.offsetWidth;

            scan.style.animation =
                "phoneScan 2s ease-in-out infinite";

        }

    }

}


/* =========================================================
   START
========================================================= */

startButton.addEventListener(
    "click",
    async () => {

        startMusic();

        startScreen.classList.add("hide");

        running = true;

        showScene(0);

    }
);


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "ArrowRight"){

            nextScene();

        }


        if(event.key === "ArrowLeft"){

            previousScene();

        }


        if(event.code === "Space"){

            event.preventDefault();

            togglePlay();

        }

    }
);


/* =========================================================
   PAUSA / REANUDAR
========================================================= */

function togglePlay(){

    if(!running){

        running = true;

        showScene(current);

        return;

    }


    running = false;

    clearTimeout(timer);

    cancelAnimationFrame(progressTimer);

    narration.pause();

    backgroundMusic.pause();

}


document.addEventListener(
    "visibilitychange",
    () => {

        if(document.hidden){

            narration.pause();

            backgroundMusic.pause();

        }

    }
);


/* =========================================================
   PRELOAD IMÁGENES
========================================================= */

const imageFiles = [

    "img/logo_amaya.png",
    "img/pos_amaya.png",
    "img/ticket_amaya.png",
    "img/escaneo_qr.png",
    "img/historial_pagos.png"

];


imageFiles.forEach(
    src => {

        const img =
            new Image();

        img.src = src;

    }
);


/* =========================================================
   PRELOAD AUDIO
========================================================= */

const audioFiles = scenes
    .map(scene => scene.narration)
    .filter(Boolean);


audioFiles.forEach(
    src => {

        const audio =
            new Audio();

        audio.src = src;

    }
);


/* =========================================================
   EVITAR ARRASTRE
========================================================= */

document.addEventListener(
    "dragstart",
    event => {

        if(event.target.tagName === "IMG"){

            event.preventDefault();

        }

    }
);
