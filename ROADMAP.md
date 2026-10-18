# Roadmap — App de progression au piano

> Objectif : transformer la méthode du `30_day_piano_triad_progression_challenge.md`
> en une application web interactive, hors-ligne, qui fait **progresser** (pas mémoriser),
> avec un fil conducteur « style du jour → progression → arpège », l'écoute/lecture et
> la lecture à vue.

---

## 0. Exigences verrouillées

- [ ] App **web** (navigateur), installable **hors-ligne** (PWA).
- [ ] Entrée **MIDI** (piano numérique branché) ; clavier à l'écran en secours.
- [ ] Public : **débutant** (< 2 mois) — sait monter les 12 gammes, reconnaître triades et renversements, mais pas encore enchaîner une progression avec un **voice leading** propre.
- [ ] **3 modules** : A) Progressions + voice leading, B) Gammes/mélodie/impro, C) Lecture/déchiffrement/lecture à vue.
- [ ] **6 styles** v1 : Pop, Rock, Blues, Jazz, Gospel/Soul, Classique.
- [ ] Galerie **hors-ligne de 2-3 backing tracks par style** + `CREDITS.md`.
- [ ] Chaque exercice de progression **génère le résultat attendu** (clavier, portée, audio, alternatives classées).
- [ ] Concept « **style du jour** » : style + arpège + progression, catalogue qui grandit avec l'élève.
- [ ] UI cohérente (une seule ligne graphique), composants réutilisés.

---

## 1. Décisions techniques (verrouillées)

| Sujet | Choix recommandé | Alternative | Pourquoi |
|---|---|---|---|
| Build | **Vite + React 18 + TypeScript** | Next.js | App locale, pas besoin de SSR |
| Styles | **Tailwind CSS v4** | — | Rapide, tokens, cohérent avec shadcn |
| Composants | **shadcn/ui (Radix)** | daisyUI | Primliblés accessibles (dialog, tabs, slider, select, popover, tooltip, toast) + contrôle total du style → consistance |
| État | **Zustand** (+ persist) | Redux/Jotai | Léger, simple |
| Théorie musicale | **tonal** | écrire soi-même | Accords, renversements, gammes, transposition |
| Audio | **Tone.js** + **smplr** / `@tonejs/piano` | synthétiseur pur | Son piano réaliste + lecture/backing généré |
| Notation | **VexFlow** (MIT) | OpenSheetMusicDisplay | Génération d'exercices/scores légère ; OSMD si import MusicXML plus tard |
| MIDI | **Web MIDI API** | — | Natif navigateur, timestamps pour le rythme |
| Persistance | **IndexedDB (Dexie)** + localStorage | — | Progrès + audio de la galerie hors-ligne |
| PWA / offline | **vite-plugin-pwa** | — | Mode avion au piano |
| Tests | **Vitest** + Testing Library ; Playwright e2e | — | Moteur harmonique = logique pure testable |
| Lint/format | **ESLint + Prettier** | Biome | Standard |
| Langue UI | **Français** d'abord (i18n prêt) | i18n multi dès le début | YAGNI |
| Gestionnaire de paquets | npm (ou pnpm) | — | Selon ton habitude |

---

## 2. Phase 0 — Fondations projet

- [ ] `git init`, `.gitignore`, `README.md`, licence.
- [ ] Scaffold Vite + React + TS ; alias `@/*`.
- [ ] Tailwind v4 + couche de **design tokens** (couleurs, typo, espacements, rayons, ombres).
- [ ] Init **shadcn/ui** (composants de base : Button, Card, Tabs, Dialog, Select, Slider, Toggle, Tooltip, Toast).
- [ ] ESLint + Prettier + conventions de nommage.
- [ ] Vitest configuré (+ 1 test passe) ; Playwright installé.
- [ ] `vite-plugin-pwa` (manifest, service worker, icônes).
- [ ] Structure dossiers : `src/core` (moteur pur), `src/features` (modules), `src/ui` (composants), `src/data` (styles, gammes, progressions), `src/services` (midi, audio, storage), `assets/`.

---

## 3. Phase 1 — Design system (skill `impeccable`)

- [ ] `impeccable init` → **PRODUCT.md** (visiteur, mode « Operate », promesse, contraintes).
- [ ] Nouvelle surface → **DESIGN.md** + **tokens** (un seul monde visuel, identité « piano »).
- [ ] Coque d'app : header, navigation/sidebar, zone d'exercice, barre d'état (MIDI connecté, tempo, style du jour), responsive desktop/tablette.
- [ ] Inventaire de composants mappé sur shadcn (liste ci-dessous).
- [ ] Plancher d'accessibilité (contrastes, focus, tailles cliquables) + raccourcis clavier (espace = lecture/pause, flèches = navigation).
- [ ] Thème clair/sombre.

**Inventaire UI de départ** : AppShell, NavItem, StyleOfTheDay card, KeySelector, ProgressionSelector, DegreeStrip (I–V–vi–IV), PianoKeyboard, ChordDisplay, VoiceLeadingTable, MovementBadge (note commune / ½ ton / ton), StaffView, ExerciseRunner, ScoreStars (1–5), TempoSlider, MetronomeToggle, MidiStatus, BackingTrackPlayer, GalleryCard, ScaleExplorer, ImproOverlay, ProgressDashboard, SettingsDialog.

---

## 4. Phase 2 — Socle musical (moteur pur, sans UI)

- [x] Modèle note/pitch (nom, classe de hauteur, numéro MIDI, octave).
- [x] Accords & **renversements** (intervalles + calcul du renversement).
- [x] **Générateur de voicings** : tous les voicings d'un accord dans une fenêtre de registre.
- [x] **Solveur de voice leading** : coût = Σ demi-tons → voicing optimal (voix triées, sans croisement).
- [x] Contraintes : main G/D/les deux, écart max (`maxSpan`), registre.
- [x] Modèle de **progression** + import des 90 progressions du challenge + **générateur aléatoire**.
- [x] Bibliothèque de **gammes** (pentatoniques, mineures, modes, blues) + usage.
- [x] Bibliothèque de **styles** (6) : progressions-types, arpèges, sources.
- [x] Rendu portée via **données VexFlow** (sérialisation MusicXML reportée).
- [x] **Tests unitaires** (27) sur le moteur.

---

## 5. Phase 3 — Entrées / sorties

- [x] Composant **PianoKeyboard** (clavier écran, surlignage, notes actives).
- [x] Service **Web MIDI** : détection devices, `noteOn/noteOff`, **timestamps**.
- [x] **Métronome** + playback (**Tone.js**) + **échantillons piano** (`smplr`, repli synthé).
- [x] Rendu **portée** (VexFlow).
- [x] Lecture audio du **résultat attendu**.

---

## 6. Phase 4 — Module A : Progressions & voice leading

- [x] Sélection : tonalité, mode, progression (liste/random), main(s), renversement de départ.
- [x] **Résultat attendu généré** : clavier + portée + audio + tableau du voice leading.
- [x] Détection **live** de ce qui est joué (accord + renversement), comparaison à l'optimal.
- [x] Annotations : notes communes, mouvements ½ ton / ton, coût par enchaînement.
- [x] Chrono de **fluidité**, score 1–5, randomisation + inversion de départ.
- [x] Historique de session (persisté).

---

## 7. Phase 5 — Module B : Gammes / mélodie / improvisation

- [x] Explorateur de gammes + explication d'usage (sur quels accords/renversements ça sonne).
- [x] **Backing track player** (galerie hors-ligne + pistes générées).
- [x] Surlignage des **notes cibles** de l'accord sur le clavier.
- [x] Mode **call & response** (motif aléatoire + réécoute ; validation de la reproduction à venir).
- [x] Guide d'impro (cibles, notes de passage, tension/résolution).

---

## 8. Phase 6 — Module C : Lecture / déchiffrement / lecture à vue

- [x] Rendu portée (clés sol/fa, **armures**, altérations, rythmes, couleur selon le thème).
- [x] Générateur d'exercices **progressifs** :
  - [x] nommer une note affichée ;
  - [x] jouer la note, l'**intervalle** et l'accord affichés (MIDI) ;
  - [x] accords depuis **la progression du module A** (ou aléatoires) ;
  - [x] **lecture à vue** : mélodie / rythme aléatoire à tempo.
- [x] Validation (précision, erreurs, **timing avance/retard**) + métronome (avec décompte).
- [x] Bonus : mode « oreille » (entendre → identifier).

---

## 9. Phase 7 — Styles & galerie

- [x] Données des 6 styles + mapping arpèges.
- [x] **Acquérir 3 titres/style** hors-ligne → `public/backing-tracks/<style>/` (18 MP3 Pixabay).
- [x] Méthode d'acquisition : `scripts/fetch-backing-tracks.sh` (licence libre, sans attribution).
- [x] `CREDITS.md` : auteur, licence, lien, par fichier.
- [x] **Générateur de backing track** (Tone.js) : suit la progression/tonalité/tempo + motifs main gauche.
- [x] Logique « **style du jour** ».

---

## 10. Phase 8 — Plan de pratique & suivi

- [x] Constructeur de **session quotidienne** (style + arpège + progression + lecture).
- [x] **Révision (répétition espacée)** : liste « à retravailler » + relance directe dans le module A.
- [x] Série (streak) + **tableau de bord** de progrès ; objectifs à venir.
- [x] Persistance **IndexedDB** ; **export/import** des données (JSON).
- [x] **Parcours guidé** (6 semaines, styles ouverts un par un).

---

## 11. Phase 9 — Qualité & finition

- [x] Détecteur Impeccable lancé (0 anomalie) ; passes `polish`/`audit`/`harden` complètes à venir.
- [x] Tests d'**intégration** (App) ; runner **e2e** Playwright à ajouter.
- [ ] Vérification **offline/PWA** réelle sur appareil.
- [ ] Perf (rendu clavier/portée, latence MIDI) — contrôles ponctuels faits.
- [x] README d'exécution + guide utilisateur.

---

## 12. Ordre de livraison (jalons)

- [x] **M0** : projet qui tourne (`pnpm dev`), design system posé, clavier affiché.
- [x] **M1** : MIDI connecté + notes affichées + moteur de voice leading testé.
- [x] **M2** : **Module A** complet avec résultat attendu généré.
- [x] **M3** : galerie hors-ligne + générateur de backing track + « style du jour ».
- [x] **M4** : **Module B**.
- [x] **M5** : **Module C**.
- [x] **M6** : suivi, PWA, finition, README.

---

## 13. Risques & points d'attention

- [ ] **Téléchargement des galeries** : anti-bot (403 en `curl`) → passer par navigateur/automation ou liens manuels ; prioriser licences sans attribution.
- [ ] **Latence MIDI** et précision rythmique (tester tôt).
- [ ] **Périmètre** : ne pas ajouter accords de 7e/voicings avancés dans le module A v1 (garder le focus triades).
- [ ] **Taille des assets audio** (échantillons piano + galerie) vs poids PWA → compression/cache.
- [ ] **Compatibilité Web MIDI** (Chrome/Edge ok ; Firefox/Safari partiels) → clavier écran en secours.

---

## 14. Décisions verrouillées (avant M0)

- [x] Composants : **shadcn/ui** (Radix).
- [x] Notation : **VexFlow**.
- [x] Gestionnaire de paquets : **pnpm**.
- [x] Son piano : **échantillons** (smplr / Salamander).
- [x] UI : **français uniquement**.
