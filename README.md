# Sabates vermelles · 25N

Web de l'Institut Tecnològic de Barcelona (ITB) per al 25N, Dia internacional per a l'eliminació de la violència contra les dones. Va lligada a un curtmetratge sobre les sabates vermelles: després de veure'l, l'alumnat i el personal del centre deixen una frase, i cada frase és una casella d'un mur que es pot filtrar per etapa educativa.

**Web publicada:** https://dmorenoar.github.io/sabates-vermelles/

## Què fa

- Mostra un mur de caselles, una per frase. En clicar una casella s'obre la frase en una finestra, amb botons per anar a l'anterior i a la següent.
- Filtra per etapa educativa: PFI, CFGM, CFGS, MÀSTER i PERSONAL DEL CENTRE.
- Té tema clar i tema fosc. Per defecte segueix el del sistema i es pot canviar a mà.
- Inclou un apartat amb telèfons d'ajuda.
- No necessita llibreries ni cap procés de compilació: només HTML, CSS i JavaScript.

## Estructura

Cada fitxer fa una sola feina:

| Fitxer | Què conté |
| --- | --- |
| `index.html` | L'estructura de la pàgina. |
| `estils.css` | L'aspecte: colors i tipografies com a variables CSS, disposició i tema clar/fosc. |
| `dades.js` | La configuració, la llista d'etapes, les frases i la funció `obtenirFrases()`. |
| `app.js` | El comportament: filtrar, pintar la graella, obrir el detall i canviar de tema. |
| `sabata.webp` | La imatge de les sabates (fons transparent, 440×232 px). |

`app.js` no sap d'on vénen les frases: només crida `obtenirFrases()`. Per això, quan les dades passin d'un fitxer a un full de càlcul, només caldrà canviar aquesta funció.

## D'on surten les frases

Les frases arriben d'un full de càlcul de Google que omple el formulari. Funciona així:

1. El formulari desa les respostes a la pestanya `Respuestas de formulario 1`. Hi ha una columna `Publicar`: s'hi escriu `SI` a les frases revisades.
2. La pestanya `Publicades` té una fórmula `FILTER` que només agafa les files amb `SI` i es queda amb el **nom de pila**, l'etapa i la frase. Aquesta és l'**única** pestanya publicada com a CSV, així que cognoms i marques de temps no surten mai a la web.
3. `obtenirFrases()` (a `dades.js`) llegeix aquest CSV buscant les columnes pel nom de la capçalera (`Nom`, `Etapa`, `Frase`).

L'adreça del CSV és a `CONFIG.urlCsv`, dins de `dades.js`. Si la deixes buida, la web mostra les frases d'exemple (`FRASES_EXEMPLE`). Google triga uns minuts a refrescar un CSV publicat.

El camp `etapa` ha de ser un dels valors de `ETAPES`, escrit exactament igual (per això la pregunta del formulari és una llista desplegable).

## Enllaços del curtmetratge i del formulari

Es posen a `CONFIG`, dins de `dades.js` (`urlCurt` i `urlFormulari`). Mentre estiguin buits, els dos botons surten desactivats.

## Privacitat

El repositori i la web són públics. La web només mostra el nom de pila.
