# Asaje Piano

Application web (PWA, hors-ligne) pour progresser au piano : progressions d'accords
avec **voice leading**, gammes / mélodie / improvisation, et **lecture / déchiffrage**.
Conçue pour un usage personnel, local, avec un **piano numérique branché en MIDI**.

## Pile technique

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix) — design system par tokens
- **tonal** (théorie, prévu), **Tone.js** + **smplr** (audio), **VexFlow** (portées)
- **Web MIDI API** (entrée clavier), **Zustand** (état) + **IndexedDB** (persistance)
- **vite-plugin-pwa** (hors-ligne), **Vitest** (tests)

## Démarrer

```bash
pnpm install
pnpm dev
```

Ouvrir http://localhost:5173, brancher le piano numérique (Web MIDI : Chrome/Edge),
puis « Connecter le piano ».

## Les modules

- **Progressions** — choisis une progression (les 90 du challenge ou aléatoire),
  une tonalité, une main et un renversement de départ. L'app **génère le résultat
  attendu** (clavier + portée + audio) et analyse le **voice leading** (notes
  communes, mouvements ½ ton / ton). Tu joues : détection live, chrono, score 1–5.
- **Gammes & impro** — style du jour, galerie de backing tracks hors-ligne,
  générateur d'accompagnement (motifs main gauche), explorateur de gammes avec
  notes cibles, motif « call & response » et guide d'improvisation.
- **Lecture** — nommer une note, jouer une note / un accord, **lecture à vue** au
  métronome, et mode « oreille ».
- **Progrès** — série de jours, statistiques, séance du jour à cocher, progressions
  « à retravailler », export / import des données (JSON).

## Backing tracks

Galerie hors-ligne (3 pistes par style) dans `public/backing-tracks/<style>/`.
Sources et licences : voir [`CREDITS.md`](CREDITS.md). Re-téléchargement :

```bash
bash scripts/fetch-backing-tracks.sh
```

## Scripts

| Commande | Description |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production (typecheck + Vite + PWA) |
| `pnpm preview` | Prévisualiser le build |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm lint` | Lint (oxlint) |
| `pnpm format` | Formatage (Prettier) |
| `pnpm test` / `pnpm test:run` | Tests (watch / une passe) |

## Structure

```
src/
  components/    layout, piano (clavier), notation (portée), midi, ui (shadcn)
  core/          moteur musical pur (pitch, accords, voicing, progressions, gammes, lecture)
  data/          styles, challenge (90 progressions), backing tracks
  features/      progressions, scales, reading, progress, styles
  services/      midi, audio, player, backing, idbStorage
  hooks/         useMidi
  test/          setup Vitest
```

Voir `ROADMAP.md` pour le plan complet et l'état d'avancement.
