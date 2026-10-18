#!/usr/bin/env bash
# Télécharge les backing tracks de la galerie (Pixabay, licence libre sans attribution).
# Usage : bash scripts/fetch-backing-tracks.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/backing-tracks"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

# style|nom-de-fichier|url
TRACKS=(
  "blues|aurec-blues-587560.mp3|https://cdn.pixabay.com/download/audio/2026/08/18/audio_69802a5f83.mp3?filename=aurec-blues-587560.mp3"
  "blues|alex-morgan-blues-jazz-midnight-club-552798.mp3|https://cdn.pixabay.com/download/audio/2026/06/16/audio_d01cbc3ef3.mp3?filename=alex-morgan-blues-jazz-midnight-club-552798.mp3"
  "blues|alex-morgan-blues-jazz-rainy-night-552797.mp3|https://cdn.pixabay.com/download/audio/2026/06/16/audio_29f2746481.mp3?filename=alex-morgan-blues-jazz-rainy-night-552797.mp3"

  "rock|jonasblakewood-surf-rock-611687.mp3|https://cdn.pixabay.com/download/audio/2026/10/04/audio_ae491c1af4.mp3?filename=jonasblakewood-surf-rock-611687.mp3"
  "rock|jonasblakewood-rock-rock-music-611689.mp3|https://cdn.pixabay.com/download/audio/2026/10/04/audio_343d8d4ed0.mp3?filename=jonasblakewood-rock-rock-music-611689.mp3"
  "rock|jonasblakewood-powerful-rock-611690.mp3|https://cdn.pixabay.com/download/audio/2026/10/04/audio_5aeaaffd6b.mp3?filename=jonasblakewood-powerful-rock-611690.mp3"

  "pop|the_mountain-pop-pop-music-576583.mp3|https://cdn.pixabay.com/download/audio/2026/07/29/audio_7c68415810.mp3?filename=the_mountain-pop-pop-music-576583.mp3"
  "pop|vibemode-pop-barcelona-545899.mp3|https://cdn.pixabay.com/download/audio/2026/06/09/audio_f5373767a1.mp3?filename=vibemode-pop-barcelona-545899.mp3"
  "pop|atlasaudio-pop-593056.mp3|https://cdn.pixabay.com/download/audio/2026/08/27/audio_e2cb13868e.mp3?filename=atlasaudio-pop-593056.mp3"

  "jazz|alex-morgan-jazz-restaurant-music-563578.mp3|https://cdn.pixabay.com/download/audio/2026/07/13/audio_3f895b8721.mp3?filename=alex-morgan-jazz-restaurant-music-563578.mp3"
  "jazz|atlasaudio-jazz-519632.mp3|https://cdn.pixabay.com/download/audio/2026/04/14/audio_9380236fdf.mp3?filename=atlasaudio-jazz-519632.mp3"
  "jazz|lnplusmusic-jazz-jazz-music-611049.mp3|https://cdn.pixabay.com/download/audio/2026/09/27/audio_d13fc4c644.mp3?filename=lnplusmusic-jazz-jazz-music-611049.mp3"

  "gospel|atlasaudio-gospel-gospel-music-589983.mp3|https://cdn.pixabay.com/download/audio/2026/08/21/audio_5bd5ce086a.mp3?filename=atlasaudio-gospel-gospel-music-589983.mp3"
  "gospel|echoes_of_lumen-gospel-song-praise-worship-586981.mp3|https://cdn.pixabay.com/download/audio/2026/08/17/audio_e04000bf45.mp3?filename=echoes_of_lumen-gospel-song-praise-worship-586981.mp3"
  "gospel|atlasaudio-gospel-589984.mp3|https://cdn.pixabay.com/download/audio/2026/08/21/audio_9cf43d7978.mp3?filename=atlasaudio-gospel-589984.mp3"

  "classical|the_mountain-piano-classical-380679.mp3|https://cdn.pixabay.com/download/audio/2025/07/26/audio_4b5fedc621.mp3?filename=the_mountain-piano-classical-380679.mp3"
  "classical|andriih-classical-classical-piano-590653.mp3|https://cdn.pixabay.com/download/audio/2026/08/23/audio_2f7195036f.mp3?filename=andriih-classical-classical-piano-590653.mp3"
  "classical|the_mountain-classical-piano-375979.mp3|https://cdn.pixabay.com/download/audio/2025/07/17/audio_cf69170f28.mp3?filename=the_mountain-classical-piano-375979.mp3"
)

for entry in "${TRACKS[@]}"; do
  IFS='|' read -r style name url <<< "$entry"
  mkdir -p "$DEST/$style"
  if [ -f "$DEST/$style/$name" ]; then
    echo "déjà présent : $style/$name"
    continue
  fi
  echo "téléchargement : $style/$name"
  curl -sL -A "$UA" -e "https://pixabay.com/" "$url" -o "$DEST/$style/$name"
done

echo "Terminé."
