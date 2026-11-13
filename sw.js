/* =====================================================================
   sw.js · Service Worker de la web (el que la converteix en PWA)

   Un service worker és un script que el navegador executa EN SEGON PLA,
   separat de la pàgina, i que s'interposa entre la web i la xarxa: cada
   petició (HTML, CSS, imatges, dades…) passa per ell i decideix si la
   respon des de la memòria (caché) o des d'Internet.

   ESTRATÈGIES (de la més senzilla a la més fina):
   1) Cache first   : mira primer la caché; només va a la xarxa si no hi és.
                      Molt ràpid i funciona sense connexió, però pot servir
                      còpies velles.  → ho fem servir per a imatges i logo.
   2) Network first : prova primer la xarxa; si falla (sense connexió),
                      cau a la caché.  → ho fem servir per a l'HTML, el CSS
                      i el JS, perquè un canvi publicat es vegi de seguida.
   3) Mai a la caché: les FRASES (el CSV de Google). Han de ser sempre les
                      d'ara mateix; si no hi ha xarxa, app.js ja mostra el seu
                      missatge d'error. Així mai es veu una frase retirada.

   IMPORTANT: quan canviïs algun fitxer de PRECACHE o vulguis forçar que
   tothom renovi la caché, puja el número de VERSIO.
   ===================================================================== */

const VERSIO = "v1";
const CACHE = "sabates-" + VERSIO;

// Els fitxers que desem d'entrada perquè la web s'obri sense connexió.
// Rutes RELATIVES (sense «/» al davant): la web viu a /sabates-vermelles/,
// no a l'arrel del domini, i així funciona a qualsevol carpeta.
const PRECACHE = [
  "./",
  "index.html",
  "estils.css",
  "dades.js",
  "app.js",
  "sabata.webp",
  "logo-itb.svg",
  "favicon.png",
  "apple-touch-icon.png",
  "icona-192.png",
  "icona-512.png",
  "manifest.webmanifest"
];

// 1) INSTAL·LACIÓ: es dispara un cop, quan el navegador descobreix el SW.
//    waitUntil() = «no donis la instal·lació per acabada fins que això no acabi».
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// 2) ACTIVACIÓ: neteja les caché de versions anteriors (si no, s'acumularien).
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((nom) => nom !== CACHE).map((nom) => caches.delete(nom))))
      .then(() => self.clients.claim())   // agafa el control de les pestanyes ja obertes
  );
});

// 3) CADA PETICIÓ passa per aquí.
self.addEventListener("fetch", (event) => {
  const peticio = event.request;
  if (peticio.method !== "GET") return;                 // només gestionem lectures

  const url = new URL(peticio.url);

  // Altres orígens (Google Sheets amb les frases, Google Fonts…): no hi toquem.
  // Les frases han de ser sempre fresques; el navegador ja cacheja les tipografies.
  if (url.origin !== self.location.origin) return;

  // Imatges i logo: cache first (canvien molt poc).
  if (/\.(webp|png|svg)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(peticio).then((guardada) => guardada || desarDesDeXarxa(peticio))
    );
    return;
  }

  // La resta (HTML, CSS, JS, manifest): network first amb la caché de reserva.
  event.respondWith(
    fetch(peticio)
      .then((resposta) => {
        const copia = resposta.clone();                  // una resposta només es pot llegir un cop: en fem una còpia
        caches.open(CACHE).then((cache) => cache.put(peticio, copia));
        return resposta;
      })
      .catch(() => caches.match(peticio).then((guardada) => guardada || caches.match("index.html")))
  );
});

// Demana a la xarxa, desa còpia i retorna la resposta.
function desarDesDeXarxa(peticio) {
  return fetch(peticio).then((resposta) => {
    const copia = resposta.clone();
    caches.open(CACHE).then((cache) => cache.put(peticio, copia));
    return resposta;
  });
}
