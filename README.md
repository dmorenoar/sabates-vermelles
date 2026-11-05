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
| `index.html` | L'estructura de la pàgina i el dibuix de la sabata, que es defineix una vegada i es reutilitza. |
| `estils.css` | L'aspecte: colors i tipografies com a variables CSS, disposició i tema clar/fosc. |
| `dades.js` | La configuració, la llista d'etapes, les frases i la funció `obtenirFrases()`. |
| `app.js` | El comportament: filtrar, pintar la graella, obrir el detall i canviar de tema. |

`app.js` no sap d'on vénen les frases: només crida `obtenirFrases()`. Per això, quan les dades passin d'un fitxer a un full de càlcul, només caldrà canviar aquesta funció.

## Com provar-la en local

Obre `index.html` amb doble clic. Funciona sense servidor perquè no fem servir mòduls ES, que els navegadors bloquegen amb el protocol `file://`. Per fer proves amb més comoditat, es pot fer servir l'extensió Live Server de VS Code.

## Com afegir o canviar frases

Ara les frases són dins de `dades.js`, a la llista `FRASES`. Cada frase és un objecte amb tres camps:

```js
{ nom: "Aina", etapa: "CFGS", frase: "El text de la frase." }
```

El camp `etapa` ha de ser un dels valors de `ETAPES`, escrit exactament igual. Les frases que hi ha ara són d'exemple.

En desar el canvi a GitHub, GitHub Pages torna a publicar la web en un o dos minuts.

## Enllaços del curtmetratge i del formulari

Es posen a `CONFIG`, dins de `dades.js` (`urlCurt` i `urlFormulari`). Mentre estiguin buits, els dos botons surten desactivats.

## Pla: formulari de Google i full de càlcul

Les frases arribaran des d'un formulari de Google. El pla és aquest:

1. Un formulari amb tres preguntes, `Nom`, `Etapa` i `Frase`. L'etapa és una llista desplegable amb les cinc opcions de `ETAPES`, escrites igual. També hi ha una casella obligatòria de permís per publicar.
2. Un full de respostes privat, amb una columna `Publicar` on s'escriu `SI` a les frases revisades.
3. Una pestanya `Publicades` que, amb una fórmula `QUERY`, agafa només `Nom`, `Etapa` i `Frase` de les files aprovades. Només aquesta pestanya es publica com a CSV.
4. `obtenirFrases()` llegeix aquest CSV, buscant les columnes pel nom de la capçalera. A `dades.js` hi ha un esbós comentat (nivell 2).

Un CSV publicat és públic, i Google triga uns minuts a refrescar-lo.

## Privacitat

El repositori i la web són públics. Només s'hi han de posar noms de pila, i només amb el permís de la persona, sobretot si és menor d'edat.

## Pendent

- Substituir les frases d'exemple per les reals.
- Posar els enllaços del curtmetratge i del formulari.
- Connectar el full de càlcul.
- Verificar els telèfons d'ajuda amb la font oficial abans de difondre la web (el 016 encara no està contrastat).
