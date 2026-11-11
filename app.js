"use strict";

/* =====================================================================
   app.js · Comportament de la pàgina «Sabates vermelles»

   Ordre del fitxer (de dalt a baix, com el flux mental del programa):
     1. Estat         → les dades que canvien (filtre actiu, frase oberta…)
     2. DOM           → referències als elements que necessitem
     3. Funcions      → pintar filtres, pintar la graella, obrir el detall
     4. Esdeveniments → què passa quan l'usuari clica
     5. Inici         → carregar les dades i pintar-ho tot

   Idea clau: «estat → pintar». Quan canvia l'estat, tornem a pintar la vista
   a partir d'ell. Així mai hi ha dues veritats que es contradiguin. És la
   mateixa idea de fons de React, Jetpack Compose o Flutter, en petit.

   «use strict» (primera línia) fa que JavaScript doni error en errors
   típics, com fer servir una variable sense declarar, en comptes de callar.
   ===================================================================== */


/* 1. ESTAT ------------------------------------------------------------ */
const TOTES = "Totes";   // valor especial del filtre: «no filtris res»

const estat = {
  frases: [],            // totes les frases (arriben des de dades.js)
  etapa: TOTES,          // etapa educativa seleccionada al filtre
  index: 0               // posició de la frase oberta dins de la llista FILTRADA
};

// Angles (en graus) per torçar una mica cada sabata. Escrit a mà i no amb
// Math.random() perquè així la pàgina es veu igual a cada visita.
const GIRS = [-5, 3, -2, 6, -4, 2, -6, 4];

// La imatge de la sabata. Posar ample i alçada evita que la pàgina «salti»
// mentre la imatge es carrega: el navegador ja reserva el forat.
const SABATA = { src: "sabata.webp", ample: 440, alcada: 232 };


/* 2. DOM -------------------------------------------------------------- */
// Drecera: $("#id") en lloc d'escriure document.querySelector(...) cada cop
const $ = (selector) => document.querySelector(selector);

const elFiltres = $("#filtres");
const elGrid = $("#grid");
const elRecompte = $("#recompte");
const elBuit = $("#buit");
const elDetall = $("#detall");
const elAnterior = $("#anterior");
const elSeguent = $("#seguent");
const elTema = $("#tema");
const elCarrusel = $("#carrusel");


/* 3. FUNCIONS --------------------------------------------------------- */

/* --- 3.1 Lògica de dades (no toquen el DOM: fàcils de provar) --- */

// Retorna les etapes que tenen almenys una frase, en l'ordre de ETAPES
// (definit a dades.js). Per què no ordenem alfabèticament? Perquè l'ordre
// que volem és de menys a més nivell, i l'alfabet el trencaria.
// Si a les dades hi ha una etapa que NO és a ETAPES (una errada d'escriptura),
// la posem al final: així es veu l'error en lloc de perdre la frase en silenci.
function llistarEtapes(frases) {
  const presents = new Set(frases.map((f) => f.etapa));          // Set: sense repetits
  const conegudes = ETAPES.filter((etapa) => presents.has(etapa));
  const desconegudes = [...presents].filter((etapa) => !ETAPES.includes(etapa));
  return [...conegudes, ...desconegudes];
}

function frasesFiltrades() {
  if (estat.etapa === TOTES) return estat.frases;
  return estat.frases.filter((f) => f.etapa === estat.etapa);
}

function comptarEtapa(etapa) {
  if (etapa === TOTES) return estat.frases.length;
  return estat.frases.filter((f) => f.etapa === etapa).length;
}

/* --- 3.2 Pintar (creen i actualitzen elements del DOM) ---

   IMPORTANT · Per què fem servir textContent i NO innerHTML?
   Les frases les escriu l'alumnat. Si algú escrivís <script>…</script> i
   nosaltres ho enganxéssim amb innerHTML, el navegador l'executaria
   (atac XSS). Amb textContent, el navegador ho tracta sempre com a text
   pla. Regla d'or: tot el que ve de fora és text, mai codi. */

// Crea els botons de filtre. Només es fa UNA vegada, en carregar.
function pintarFiltres() {
  const botons = [TOTES, ...llistarEtapes(estat.frases)].map((etapa) => {
    const boto = document.createElement("button");
    boto.type = "button";
    boto.className = "filtre";
    boto.dataset.etapa = etapa;                // guardem l'etapa a l'element: data-etapa="CFGS"

    const recompte = document.createElement("span");
    recompte.className = "filtre__n";
    recompte.textContent = comptarEtapa(etapa);

    boto.append(etapa, recompte);
    return boto;
  });
  elFiltres.replaceChildren(...botons);
}

// Actualitza quin botó apareix premut. Per què no tornem a crear els botons?
// Perquè si els recreem, el teclat perd el focus i l'usuari ha de tornar a començar.
function marcarFiltreActiu() {
  for (const boto of elFiltres.querySelectorAll(".filtre")) {
    boto.setAttribute("aria-pressed", String(boto.dataset.etapa === estat.etapa));
  }
}

// Crea UNA casella (un <button>) a partir d'una frase.
// Per què un <button> i no un <div>? Perquè ja és accessible amb teclat
// (Tab, Enter, Espai) i l'entenen els lectors de pantalla, sense escriure res més.
function crearTessella(frase, posicio) {
  const boto = document.createElement("button");
  boto.type = "button";
  boto.className = "tessella";
  boto.dataset.index = posicio;
  boto.setAttribute("aria-label", `Llegeix la frase de ${frase.nom}, ${frase.etapa}`);

  // La sabata: una <img>. alt="" perquè és decorativa (el botó ja té aria-label).
  const img = document.createElement("img");
  img.src = SABATA.src;
  img.alt = "";
  img.width = SABATA.ample;
  img.height = SABATA.alcada;
  img.decoding = "async";
  img.classList.add("sabata", "tessella__sabata");
  if (posicio % 2 === 1) img.classList.add("girada");          // una sí, una no, mirall
  img.style.setProperty("--gir", GIRS[posicio % GIRS.length] + "deg");   // JS → variable CSS

  const nom = document.createElement("span");
  nom.className = "tessella__nom";
  nom.textContent = frase.nom;

  const etapa = document.createElement("span");
  etapa.className = "tessella__etapa";
  etapa.textContent = frase.etapa;

  boto.append(img, nom, etapa);
  return boto;
}

function pintarGrid() {
  const llista = frasesFiltrades();

  // map(crearTessella) crida crearTessella(frase, posicio) per cada element:
  // map ja ens passa la posició com a segon argument.
  elGrid.replaceChildren(...llista.map(crearTessella));

  const n = llista.length;
  const text = `${n} ${n === 1 ? "frase" : "frases"}`;
  elRecompte.textContent = estat.etapa === TOTES ? text : `${text} · ${estat.etapa}`;
  elBuit.hidden = n > 0;
}

// Cada canvi d'estat passa per aquí: «estat → pintar».
function actualitzar() {
  marcarFiltreActiu();
  pintarGrid();
}

/* --- 3.2b Carrusel ---

   Tres peces petites, cadascuna amb una sola feina:
     barrejar()         → ordre aleatori
     pintarCarrusel()   → crea les diapositives
     engegarCarrusel()  → l'avanç automàtic (setInterval) */

const MS_CARRUSEL = 4500;     // temps entre diapositives (mil·lèsimes de segon)
let rellotgeCarrusel = null;  // l'identificador del setInterval, per poder-lo aturar

// Barreja una llista amb l'algoritme de Fisher-Yates: recorrem de darrere
// cap endavant i canviem cada element per un altre d'una posició anterior
// triada a l'atzar. Per què no fer .sort(() => Math.random() - 0.5)? Perquè
// és un truc molt estès però NO barreja bé (alguns ordres surten més sovint).
// Treballem sobre una còpia ([...llista]) per no alterar l'ordre original.
function barrejar(llista) {
  const copia = [...llista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));   // enter de 0 a i, tots dos inclosos
    [copia[i], copia[j]] = [copia[j], copia[i]];     // intercanvi sense variable temporal
  }
  return copia;
}

function crearDiapositiva(frase) {
  const targeta = document.createElement("figure");   // <figure>: bloc amb contingut autònom
  targeta.className = "diapositiva";

  const img = document.createElement("img");
  img.src = SABATA.src;
  img.alt = "";
  img.width = SABATA.ample;
  img.height = SABATA.alcada;
  img.className = "sabata diapositiva__sabata";

  const etapa = document.createElement("span");
  etapa.className = "diapositiva__etapa";
  etapa.textContent = frase.etapa;

  // <blockquote> és l'element semàntic per a una cita. textContent, no innerHTML (XSS)
  const cita = document.createElement("blockquote");
  cita.className = "diapositiva__frase";
  cita.textContent = frase.frase;

  const nom = document.createElement("figcaption");
  nom.className = "diapositiva__nom";
  nom.textContent = frase.nom;

  targeta.append(img, etapa, cita, nom);
  return targeta;
}

// El carrusel mostra TOTES les frases (no depèn del filtre) en ordre aleatori
function pintarCarrusel() {
  elCarrusel.replaceChildren(...barrejar(estat.frases).map(crearDiapositiva));
}

// Avança una diapositiva. Quan arribem al final, tornem al principi
// AMB UNA BARREJA NOVA: així l'ordre no es repeteix mai igual. I com que
// barregem estat.frases (el total), si l'alumnat afegeix frases noves al Sheet
// entren soles al carrusel, sense tocar res.
function avancarCarrusel() {
  const primera = elCarrusel.firstElementChild;
  if (!primera) return;
  const maxim = elCarrusel.scrollWidth - elCarrusel.clientWidth;   // fins on es pot desplaçar
  if (maxim <= 0) return;                                           // tot hi cap: no cal moure res
  const buit = parseFloat(getComputedStyle(elCarrusel).columnGap) || 0;
  const pas = primera.getBoundingClientRect().width + buit;         // el que ocupa una diapositiva
  const alFinal = elCarrusel.scrollLeft >= maxim - 4;               // -4: marge per als decimals
  if (alFinal) {
    pintarCarrusel();                // nova barreja de totes les frases
    elCarrusel.scrollLeft = 0;       // tornem a l'inici de cop (sense animació)
    return;
  }
  elCarrusel.scrollTo({ left: elCarrusel.scrollLeft + pas, behavior: "smooth" });
}

function engegarCarrusel() {
  // Respectem «reduir moviment»: qui ho té activat no veu res movent-se sol
  // (ho pot recórrer amb el dit o el teclat).
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  aturarCarrusel();                                  // evita tenir dos rellotges alhora
  rellotgeCarrusel = setInterval(avancarCarrusel, MS_CARRUSEL);
}

function aturarCarrusel() {
  clearInterval(rellotgeCarrusel);
  rellotgeCarrusel = null;
}

/* --- 3.3 Finestra de detall --- */

function mostrarDetall() {
  const llista = frasesFiltrades();
  const frase = llista[estat.index];

  $("#detall-frase").textContent = frase.frase;
  $("#detall-nom").textContent = frase.nom;
  $("#detall-etapa").textContent = frase.etapa;
  $("#posicio").textContent = `${estat.index + 1} / ${llista.length}`;

  // Amb una sola frase no té sentit navegar
  elAnterior.disabled = llista.length < 2;
  elSeguent.disabled = llista.length < 2;
}

function obrirDetall(index) {
  estat.index = index;
  mostrarDetall();
  // showModal() és del <dialog> natiu: bloqueja la resta de la pàgina,
  // atrapa el focus a dins i tanca amb Esc. I en tancar, el focus torna
  // a la casella que l'havia obert.
  elDetall.showModal();
}

// pas = -1 (anterior) o +1 (següent). L'operador % fa la navegació circular:
// després de l'última frase tornem a la primera. El «+ total» evita
// resultats negatius quan retrocedim des de la posició 0.
function moureDetall(pas) {
  const total = frasesFiltrades().length;
  if (total < 2) return;
  estat.index = (estat.index + pas + total) % total;
  mostrarDetall();
}

/* --- 3.4 Configuració (enllaços) --- */

function configurarEnllac(element, url) {
  if (url) {
    element.href = url;
    element.removeAttribute("aria-disabled");
  } else {
    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
  }
}

function aplicarConfiguracio() {
  configurarEnllac($("#enllac-curt"), CONFIG.urlCurt);
  configurarEnllac($("#enllac-formulari"), CONFIG.urlFormulari);
}

/* --- 3.5 Tema clar / fosc ---

   Com funciona (tres capes, de la més bàsica a la més personal):
   1) Per defecte, estils.css segueix el tema del sistema operatiu
      (prefers-color-scheme).
   2) Si l'usuari tria «Clar» o «Fosc», posem data-theme="light|dark" a
      l'element <html>. El CSS ho detecta i guanya sobre el sistema.
   3) Recordem l'elecció a localStorage per a la propera visita.

   Per què només canviem UN atribut? Perquè tots els colors són variables
   CSS (tokens): en canviar l'atribut, canvien les variables i la pàgina
   sencera es repinta sola. Cap línia de JS toca cap color. */

const CLAU_TEMA = "tema-sabates";   // la mateixa clau que fa servir el petit script de l'index.html

// Quin tema s'està veient ARA?
function temaActual() {
  const triat = document.documentElement.dataset.theme;     // "light", "dark" o undefined
  if (triat === "light" || triat === "dark") return triat;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Marca com a premut el botó del tema actiu (mateix patró que els filtres)
function marcarTema() {
  const actual = temaActual();
  for (const boto of elTema.querySelectorAll(".tema__opcio")) {
    boto.setAttribute("aria-pressed", String(boto.dataset.tema === actual));
  }
}

function triarTema(tema) {
  document.documentElement.dataset.theme = tema;
  // try/catch: localStorage pot estar bloquejat (mode privat, privacitat…).
  // Si falla, el tema canvia igualment; només que no el recordarem.
  try {
    localStorage.setItem(CLAU_TEMA, tema);
  } catch (error) {
    console.warn("No s'ha pogut desar el tema:", error);
  }
  marcarTema();
}


/* 4. ESDEVENIMENTS ---------------------------------------------------- */

/* DELEGACIÓ D'ESDEVENIMENTS: en lloc de posar un listener a cada botó
   (20, 200 o 2000 caselles…), en posem UN al contenidor i preguntem
   «quin element s'ha clicat?» amb closest(). Menys codi, menys memòria, i
   funciona també amb els elements que creem després. */
elFiltres.addEventListener("click", (event) => {
  const boto = event.target.closest(".filtre");
  if (!boto) return;                    // el clic ha caigut en un espai buit
  estat.etapa = boto.dataset.etapa;
  actualitzar();
});

elGrid.addEventListener("click", (event) => {
  const tessella = event.target.closest(".tessella");
  if (!tessella) return;
  obrirDetall(Number(tessella.dataset.index));   // dataset sempre és text: el convertim a número
});

elAnterior.addEventListener("click", () => moureDetall(-1));
elSeguent.addEventListener("click", () => moureDetall(1));
$("#tancar").addEventListener("click", () => elDetall.close());

// Selector de tema (delegació d'esdeveniments, igual que els filtres)
elTema.addEventListener("click", (event) => {
  const boto = event.target.closest(".tema__opcio");
  if (!boto) return;
  triarTema(boto.dataset.tema);
});

// Si el tema canvia per un altre camí (l'usuari canvia el del sistema o el
// del propi visor), el botó es manté sincronitzat. MutationObserver avisa
// quan canvia un atribut d'un element: aquí, data-theme de <html>.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", marcarTema);
new MutationObserver(marcarTema).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"]
});

// Pausa del carrusel mentre l'usuari el mira (ratolí a sobre) o l'enfoca
// amb el teclat: res més molest que una frase que fuig mentre la llegeixes.
elCarrusel.addEventListener("pointerenter", aturarCarrusel);
elCarrusel.addEventListener("pointerleave", engegarCarrusel);
elCarrusel.addEventListener("focusin", aturarCarrusel);
elCarrusel.addEventListener("focusout", engegarCarrusel);

// Clicar al fons fosc tanca la finestra. Quan es clica el fons, el
// «target» és el propi <dialog> (el contingut ocupa tot l'interior).
elDetall.addEventListener("click", (event) => {
  if (event.target === elDetall) elDetall.close();
});

// Fletxes del teclat per passar de frase en frase
elDetall.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moureDetall(-1);
  if (event.key === "ArrowRight") moureDetall(1);
});


/* 5. INICI ------------------------------------------------------------ */

// async/await: «espera» que arribin les dades sense bloquejar la pàgina.
// try/catch: si obtenirFrases() falla (xarxa, full mal publicat…), mostrem
// un missatge amable en lloc de deixar la pàgina en blanc.
async function iniciar() {
  aplicarConfiguracio();
  marcarTema();                  // el selector ha de funcionar encara que les dades fallin

  try {
    const dades = await obtenirFrases();
    // Validem: ens quedem només amb les entrades completes. Mai fiar-se
    // d'unes dades que no hem escrit nosaltres.
    estat.frases = dades.filter((f) => f.nom && f.etapa && f.frase);
  } catch (error) {
    console.error(error);
    elBuit.textContent = "No s'han pogut carregar les frases. Torna-ho a provar d'aquí a una estona.";
    elBuit.hidden = false;
    return;
  }

  pintarFiltres();
  actualitzar();
  pintarCarrusel();
  engegarCarrusel();
}

iniciar();
