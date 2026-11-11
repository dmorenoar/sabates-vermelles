/* =====================================================================
   dades.js · Les dades i la configuració del mur

   TRES MANERES D'OMPLIR EL MUR (de la més senzilla a la més professional)

   NIVELL 1 · Les frases dins d'aquest fitxer (ara només com a dades d'exemple)
     Flux: Google Forms → full de càlcul → les passes aquí a mà o amb un
     petit script. Avantatges: zero servidors i tu revises cada frase
     abans de publicar-la (moderació gratuïta). Inconvenient: cada
     frase nova demana tocar el fitxer.

   NIVELL 2 · Google Forms + Google Sheets publicat com a CSV  (ACTIU ARA)
     La pàgina llegeix el full en directe amb fetch(). Encara no cal
     backend. Mira la funció obtenirFrases() de sota.

   NIVELL 3 · Backend propi (API REST)
     Node + Express + una base de dades (SQLite, per exemple). El
     formulari és a la pròpia web i hi ha un panell per aprovar frases.
     És el que farien en una empresa. Esbós comentat al final.

   LA IDEA CLAU: en els tres nivells només canvia la funció
   obtenirFrases(). app.js no es toca mai. Això és separar la CAPA DE
   DADES de la CAPA DE PRESENTACIÓ.

   Per què no fem servir mòduls ES (import/export)? Perquè els navegadors
   els bloquegen si obres index.html amb doble clic (protocol file://).
   Amb scripts clàssics funciona des de qualsevol lloc. El pas següent,
   més professional, seria passar a mòduls i treballar amb un servidor
   local (extensió Live Server de VS Code).
   ===================================================================== */


/* ---------------------------------------------------------------------
   CONFIGURACIÓ
   Tot el que canvia d'una edició a una altra, en un sol lloc.
   --------------------------------------------------------------------- */
const CONFIG = {
  // Enllaç al curtmetratge (YouTube, Vimeo, el servidor de l'ITB…).
  // Mentre estigui buit, el botó apareix desactivat.
  urlCurt: "https://drive.google.com/file/d/1GVnDHvcqdXGwg3Xt_cyDbRS3RCUCWXrC/view",

  // Enllaç al formulari de Google Forms on l'alumnat deixa la frase.
  urlFormulari: "https://docs.google.com/forms/d/e/1FAIpQLSdhDr14V567pnlairoaU8YYrG76_O5O-5RKxuHx5zzbOM-sgg/viewform",

  // URL de la pestanya «Publicades» del full de càlcul, publicada com a CSV.
  // Si la deixes buida, la web fa servir les frases d'exemple de sota (FRASES_EXEMPLE).
  urlCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWnBd_nanxm56jAz17jW2BWrPdAOhgom3KGK7BQx6t4bnc7AOEW2pUzOFZKd58bB3LUG8fyqjszTLX/pub?gid=1119069832&single=true&output=csv",

  // Cada quants MINUTS la web torna a llegir el full per afegir frases noves
  // sense que ningú hagi de recarregar la pàgina. 0 = no ho fa mai.
  minutsRefresc: 20
};


/* ---------------------------------------------------------------------
   ETAPES EDUCATIVES
   PFI = Programes de Formació i Inserció
   CFGM / CFGS = Cicles Formatius de Grau Mitjà / Grau Superior

   És una llista TANCADA i ORDENADA. Per què?
   1) L'ordre dels filtres és el que volem (de menys a més nivell), no
      l'alfabètic: en ordre alfabètic «PFI» quedaria l'última.
   2) Si al formulari es pot escriure text lliure, sortiran «cfgs»,
      «CFGS », «Cicle superior»… i cada variant seria un filtre diferent.
      Per això, al Google Forms, la pregunta d'etapa ha de ser una LLISTA
      DESPLEGABLE amb exactament aquestes cinc opcions.
      (A la informàtica això es diu «vocabulari controlat».)
   --------------------------------------------------------------------- */
const ETAPES = ["PFI", "CFGM", "CFGS", "MÀSTER", "PERSONAL DEL CENTRE"];


/* ---------------------------------------------------------------------
   NIVELL 1 · Les dades
   Un array d'objectes: cada objecte és una frase amb tres camps
   (nom, etapa i frase). L'etapa ha de ser una de les de ETAPES.
   ATENCIÓ: aquestes frases i noms són INVENTATS. Només es fan servir si
   CONFIG.urlCsv és buit (per provar el disseny sense connexió).
   Per privacitat, millor només el nom de pila (i amb permís).
   --------------------------------------------------------------------- */
const FRASES_EXEMPLE = [
  { nom: "Àlex",    etapa: "PFI",    frase: "Crec en un món on ningú tingui por de dir que no." },
  { nom: "Nil",     etapa: "PFI",    frase: "Si la violència comença amb paraules, la prevenció també." },
  { nom: "Hugo",    etapa: "PFI",    frase: "Una broma que humilia no és una broma." },

  { nom: "Berta",   etapa: "CFGM",   frase: "Recordem-les amb noms, no amb xifres." },
  { nom: "Èric",    etapa: "CFGM",   frase: "Canviar la manera de mirar també és una manera de protegir." },
  { nom: "Irene",   etapa: "CFGM",   frase: "Demanar ajuda no és una debilitat. Oferir-la és responsabilitat de tothom." },

  { nom: "Aina",    etapa: "CFGS",   frase: "Vull poder tornar a casa sola, a l'hora que sigui, sense mirar enrere." },
  { nom: "Pau",     etapa: "CFGS",   frase: "Callar davant d'una agressió també és prendre partit." },
  { nom: "Martina", etapa: "CFGS",   frase: "Si algú et diu què has de vestir o amb qui has de parlar, això no és amor: és control." },
  { nom: "Laia",    etapa: "CFGS",   frase: "Cada parell de sabates buit és una conversa que ja no podrà tenir lloc." },
  { nom: "Marc",    etapa: "CFGS",   frase: "No és un problema de les dones, és un problema de tota la societat." },
  { nom: "Núria",   etapa: "CFGS",   frase: "Educar en igualtat és la millor manera de prevenir." },
  { nom: "Arnau",   etapa: "CFGS",   frase: "Quan veig una amiga angoixada, ja no miro cap a una altra banda." },
  { nom: "Júlia",   etapa: "CFGS",   frase: "Parlar-ne no és exagerar. És el primer pas per canviar-ho." },
  { nom: "Carla",   etapa: "CFGS",   frase: "Ningú hauria de caminar amb por pel seu propi carrer." },

  { nom: "Biel",    etapa: "MÀSTER", frase: "Els homes també hem de fer-nos responsables de canviar aquesta realitat." },
  { nom: "Mar",     etapa: "MÀSTER", frase: "Estimar no fa mal. Si fa mal, no és estimar." },

  { nom: "Jordi",   etapa: "PERSONAL DEL CENTRE", frase: "He après que escoltar sense jutjar pot canviar el rumb d'una vida." },
  { nom: "Oriol",   etapa: "PERSONAL DEL CENTRE", frase: "El respecte no es demana: es practica cada dia, també a les xarxes." },
  { nom: "Sara",    etapa: "PERSONAL DEL CENTRE", frase: "Aquestes sabates no caminaran més, però nosaltres sí que podem caminar cap a la igualtat." }
];


/* ---------------------------------------------------------------------
   NIVELL 2 · Google Sheets publicat com a CSV  (ACTIU)

   Flux: Google Forms → pestanya de respostes → pestanya «Publicades» →
   CSV públic → aquesta pàgina.

   A la pestanya «Publicades» hi ha una fórmula FILTER que només deixa
   passar les files amb «SI» a la columna Publicar (moderació) i, de passada,
   es queda només amb el NOM DE PILA (per privacitat). El CSV públic només
   té tres columnes: Nom, Etapa i Frase. Les dades privades no hi surten mai.

   Per què «async»? Perquè llegir un fitxer per xarxa tarda, i app.js fa
   «await obtenirFrases()»: espera sense bloquejar la pàgina.
   --------------------------------------------------------------------- */

// Analitza un text CSV i el converteix en un array de files.
// Per què no fem text.split(","), que seria el més fàcil? Perquè una
// frase pot contenir comes i salts de línia entre cometes. Cal recórrer
// el text caràcter a caràcter recordant si som «dins de cometes».
function analitzarCsv(text) {
  const files = [];
  let fila = [];
  let camp = "";
  let entreCometes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (entreCometes) {
      if (c === '"' && text[i + 1] === '"') { camp += '"'; i++; } // "" vol dir una cometa literal
      else if (c === '"') entreCometes = false;
      else camp += c;
    } else if (c === '"') {
      entreCometes = true;
    } else if (c === ",") {
      fila.push(camp); camp = "";
    } else if (c === "\n") {
      fila.push(camp); files.push(fila); fila = []; camp = "";
    } else if (c !== "\r") {
      camp += c;
    }
  }
  if (camp !== "" || fila.length > 0) { fila.push(camp); files.push(fila); }
  return files;
}

async function obtenirFrases() {
  // Sense URL configurada: dades d'exemple (útil per provar en local)
  if (!CONFIG.urlCsv) return FRASES_EXEMPLE;

  // cache: "no-store" → no fem servir cap còpia guardada pel navegador: volem la versió
  // d'ara mateix del full (sense això, el refresc podria rellegir les dades velles).
  const resposta = await fetch(CONFIG.urlCsv, { cache: "no-store" });
  if (!resposta.ok) throw new Error("No s'ha pogut llegir el full (" + resposta.status + ")");

  const files = analitzarCsv(await resposta.text());
  const capcalera = files.shift().map((titol) => titol.trim().toLowerCase());

  // Busquem cada columna pel NOM de la capçalera i no per la posició.
  // Així, si algú afegeix o mou una columna al full, la web no es trenca.
  const colNom = capcalera.indexOf("nom");
  const colEtapa = capcalera.indexOf("etapa");
  const colFrase = capcalera.indexOf("frase");
  if (colNom < 0 || colEtapa < 0 || colFrase < 0) {
    throw new Error("Falten columnes al full: calen Nom, Etapa i Frase");
  }

  return files.map((fila) => ({
    nom: (fila[colNom] || "").trim(),
    // toUpperCase: defensa extra contra «cfgs » o «Màster» (la llista ETAPES va en majúscules)
    etapa: (fila[colEtapa] || "").trim().toUpperCase(),
    frase: (fila[colFrase] || "").trim()
  }));
}

/* Per al desenvolupament: si vols tornar a les dades d'exemple, posa
   CONFIG.urlCsv = "". El bloc NIVELL 1 de dalt (FRASES_EXEMPLE) segueix aquí. */


/* ---------------------------------------------------------------------
   NIVELL 3 · API pròpia  (esbós comentat)

   Del costat del navegador, la funció és gairebé igual:

   async function obtenirFrases() {
     const resposta = await fetch("/api/frases");
     if (!resposta.ok) throw new Error("Error " + resposta.status);
     return resposta.json();
   }

   I del costat del servidor (Node + Express + better-sqlite3), l'esquema:

   // La base de dades també garanteix l'etapa: no entra res que no sigui d'aquesta llista
   CREATE TABLE frases (
     id INTEGER PRIMARY KEY,
     nom TEXT NOT NULL,
     etapa TEXT NOT NULL CHECK (etapa IN ('PFI','CFGM','CFGS','MÀSTER','PERSONAL DEL CENTRE')),
     frase TEXT NOT NULL,
     aprovada INTEGER NOT NULL DEFAULT 0
   );

   app.get("/api/frases", (req, res) => {
     const files = db.prepare("SELECT nom, etapa, frase FROM frases WHERE aprovada = 1").all();
     res.json(files);
   });

   app.post("/api/frases", (req, res) => {
     // 1) validar que hi ha nom, etapa i frase i que no són massa llargs
     // 2) desar amb aprovada = 0: cal que algú del professorat l'aprovi
     // 3) respondre 201
   });

   Què s'aprèn amb aquest nivell: validació al servidor (mai fiar-se del
   navegador), restriccions a la base de dades, moderació, SQL amb
   paràmetres i desplegament.
   --------------------------------------------------------------------- */
