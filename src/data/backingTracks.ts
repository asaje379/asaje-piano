export interface BackingTrack {
  id: string
  title: string
  author: string
  /** Chemin public servi par l'app. */
  file: string
  sourceUrl: string
  license: string
}

const PIXABAY_LICENSE =
  'Pixabay Content License (usage libre, sans attribution)'

function track(
  style: string,
  file: string,
  title: string,
  author: string,
  sourceUrl: string,
): BackingTrack {
  return {
    id: `${style}/${file}`,
    title,
    author,
    file: `/backing-tracks/${style}/${file}`,
    sourceUrl,
    license: PIXABAY_LICENSE,
  }
}

export const BACKING_TRACKS: Record<string, BackingTrack[]> = {
  blues: [
    track(
      'blues',
      'aurec-blues-587560.mp3',
      'Blues',
      'Aurec',
      'https://pixabay.com/music/blues-blues-587560/',
    ),
    track(
      'blues',
      'alex-morgan-blues-jazz-midnight-club-552798.mp3',
      'Blues Jazz Midnight Club',
      'Alex Morgan',
      'https://pixabay.com/music/blues-blues-jazz-midnight-club-552798/',
    ),
    track(
      'blues',
      'alex-morgan-blues-jazz-rainy-night-552797.mp3',
      'Blues Jazz Rainy Night',
      'Alex Morgan',
      'https://pixabay.com/music/blues-blues-jazz-rainy-night-552797/',
    ),
  ],
  rock: [
    track(
      'rock',
      'jonasblakewood-surf-rock-611687.mp3',
      'Surf Rock',
      'JonasBlakewood',
      'https://pixabay.com/music/rock-surf-rock-611687/',
    ),
    track(
      'rock',
      'jonasblakewood-rock-rock-music-611689.mp3',
      'Rock Music',
      'JonasBlakewood',
      'https://pixabay.com/music/rock-rock-rock-music-611689/',
    ),
    track(
      'rock',
      'jonasblakewood-powerful-rock-611690.mp3',
      'Powerful Rock',
      'JonasBlakewood',
      'https://pixabay.com/music/rock-powerful-rock-611690/',
    ),
  ],
  pop: [
    track(
      'pop',
      'the_mountain-pop-pop-music-576583.mp3',
      'Pop Music',
      'The_Mountain',
      'https://pixabay.com/music/pop-pop-pop-music-576583/',
    ),
    track(
      'pop',
      'vibemode-pop-barcelona-545899.mp3',
      'Barcelona',
      'VibeMode',
      'https://pixabay.com/music/pop-pop-barcelona-545899/',
    ),
    track(
      'pop',
      'atlasaudio-pop-593056.mp3',
      'Pop',
      'AtlasAudio',
      'https://pixabay.com/music/pop-pop-593056/',
    ),
  ],
  jazz: [
    track(
      'jazz',
      'alex-morgan-jazz-restaurant-music-563578.mp3',
      'Jazz Restaurant Music',
      'Alex Morgan',
      'https://pixabay.com/music/modern-jazz-jazz-restaurant-music-563578/',
    ),
    track(
      'jazz',
      'atlasaudio-jazz-519632.mp3',
      'Jazz',
      'AtlasAudio',
      'https://pixabay.com/music/smooth-jazz-jazz-519632/',
    ),
    track(
      'jazz',
      'lnplusmusic-jazz-jazz-music-611049.mp3',
      'Jazz Music',
      'lNPLUSMUSIC',
      'https://pixabay.com/music/modern-jazz-jazz-jazz-music-611049/',
    ),
  ],
  gospel: [
    track(
      'gospel',
      'atlasaudio-gospel-gospel-music-589983.mp3',
      'Gospel Music',
      'AtlasAudio',
      'https://pixabay.com/music/gospel-gospel-gospel-music-589983/',
    ),
    track(
      'gospel',
      'echoes_of_lumen-gospel-song-praise-worship-586981.mp3',
      'Gospel Song Praise Worship',
      'Echoes of Lumen',
      'https://pixabay.com/music/religious-theme-gospel-song-praise-worship-586981/',
    ),
    track(
      'gospel',
      'atlasaudio-gospel-589984.mp3',
      'Gospel',
      'AtlasAudio',
      'https://pixabay.com/music/gospel-gospel-589984/',
    ),
  ],
  classical: [
    track(
      'classical',
      'the_mountain-piano-classical-380679.mp3',
      'Piano Classical',
      'The_Mountain',
      'https://pixabay.com/music/modern-classical-piano-classical-380679/',
    ),
    track(
      'classical',
      'andriih-classical-classical-piano-590653.mp3',
      'Classical Piano',
      'Andrii H',
      'https://pixabay.com/music/modern-classical-classical-classical-piano-590653/',
    ),
    track(
      'classical',
      'the_mountain-classical-piano-375979.mp3',
      'Classical Piano',
      'The_Mountain',
      'https://pixabay.com/music/modern-classical-classical-piano-375979/',
    ),
  ],
}

export function tracksForStyle(styleId: string): BackingTrack[] {
  return BACKING_TRACKS[styleId] ?? []
}
