# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un seul utilisateur : l'auteur de l'app, **débutant au piano** (pratique depuis moins de 2 mois). Il sait monter les 12 gammes majeures et reconnaître/identifier triades et renversements, et les jouer — mais n'enchaîne **pas encore** une progression de façon fluide. Il pratique seul, à domicile, devant un **piano numérique branché en MIDI**. Son besoin n'est pas de mémoriser des exercices figés, mais de développer des **réflexes durables** et d'élargir son jeu à plusieurs styles.

## Product Purpose

Transformer une méthode d'entraînement (progressions + renversements + voice leading, gammes/mélodie/impro, lecture) en application interactive qui **vérifie, guide et corrige en temps réel** ce qui est joué. Succès = à terme : naviguer entre accords sans reconstruire chaque accord depuis sa fondamentale, choisir spontanément le meilleur renversement, lire à vue et improviser sur une grille.

## Positioning

Le mécanisme différenciant : pour **chaque exercice**, l'app **génère le résultat attendu** (voicing nécessitant le moins de mouvement, notes communes, mouvements d'un demi-ton / d'un ton) et le **compare à ce qui est réellement joué au MIDI**, avec écoute du résultat. S'y ajoute un fil conducteur « **style du jour** » (style + progression-type + arpège + backing tracks jouables hors-ligne) qui fait grandir le répertoire. Un PDF, une grille statique ou une simple piste YouTube ne peuvent ni générer la solution optimale, ni l'écouter, ni valider le jeu réel.

## Operating Context

- Pratique quotidienne à domicile, sessions courtes (**30–45 min**), parfois **sans internet**.
- Piano numérique connecté en **MIDI** ; clavier à l'écran en secours.
- Interface en **français**.
- Ressources existantes de l'utilisateur : `30_day_piano_triad_progression_challenge.md` (méthode + 90 progressions), dossier `../backing-tracks-gospel/`, PDFs pédagogiques (cycle des quintes, circle of fifths).

## Capabilities and Constraints

- **Modules** : A) progressions & voice leading ; B) gammes / mélodie / improvisation ; C) lecture / déchiffrement / lecture à vue.
- **Entrée** : Web MIDI (piano numérique) ; clavier à l'écran en secours.
- **6 styles v1** : Pop, Rock, Blues, Jazz, Gospel/Soul, Classique.
- **Galerie hors-ligne** : 2-3 backing tracks par style + fichier `CREDITS.md`.
- **Contraintes** : 100 % local, hors-ligne (PWA), sans compte ni serveur ; français ; web.
- **Pile (en place)** : Vite + React 19 + TypeScript, Tailwind v4 + shadcn/ui, tonal, Tone.js + smplr, VexFlow, Zustand, vite-plugin-pwa, Vitest, pnpm.
- **Décidé** : shadcn/ui · VexFlow · échantillons piano · pnpm.
- **Non décidé (assumé)** : identité visuelle définitive (traitée en new-work) ; extension au-delà des triades (7e, voicings avancés) reportée après v1.

## Brand Commitments

- **Nom : Asaje Piano.**
- Langue de l'interface : **français**.

## Evidence on Hand

- `30_day_piano_triad_progression_challenge.md` — méthode et 90 progressions.
- `../backing-tracks-gospel/` — backing tracks gospel réels (usage personnel).
- PDFs pédagogiques (cycle des quintes).
- **À ne pas fabriquer** : témoignages, chiffres, artistes ou partenariats inexistants.

## Product Principles

1. Le **résultat attendu est toujours montrable** (clavier, portée, audio) et comparable au jeu réel.
2. Développer un **réflexe de décision**, jamais une position figée à mémoriser.
3. Progresser = **ouvrir des styles**, pas se limiter à un répertoire.
4. **Une seule ligne d'UI**, cohérente, pilotée par des tokens.
5. **Hors-ligne d'abord** : le réseau est un bonus, jamais une dépendance.

## Accessibility & Inclusion

Utilisateur unique ; prévoir néanmoins des contrastes suffisants, une navigation clavier complète, des cibles cliquables confortables, et le clavier à l'écran comme solution de repli du MIDI.
