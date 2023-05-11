'use strict';

const CACHE_ESTATICO = "fifa_players";

const ARQUIVOS_ESTATICOS = [
    'css/bootstrap.min.css',
    'css/styles.css',
    'fonts/Roboto-Medium.ttf',
    'fonts/Roboto-Regular.ttf',
    'fonts/Roboto-Bold.ttf',
    'imgs/logo.png',
    'imgs/search_icon.png',
    'js/app.js',
    'js/bootstrap.bundle.min.js',
    'offline.html'
];

//Instalação
self.addEventListener("install", (evt) => {

    evt.waitUntil(

        caches.open(CACHE_ESTATICO).then((cache) => {

            return cache.addAll(ARQUIVOS_ESTATICOS);

        })
    );

    self.skipWaiting();

});


//Ativação
self.addEventListener("install", (evt) => {

    evt.waitUntil(

        caches.keys().then((keylist) => {

            return Promise.all(keylist.map((key) =>{

                if(key !== CACHE_ESTATICO){
                    return caches.delete(key);
                }

            }));

        })

    );

});

//Offline - Fetch

self.addEventListener("fetch", (evt) => {

    if(evt.request.mode !== 'navigate'){
        return;
    }

    evt.respondWith(

        fetch(evt.request).catch(()=>{

            return caches.open(CACHE_ESTATICO).then((cache) =>{

                return cache.match('offline.html');

            });

        })

    );

});