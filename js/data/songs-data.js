/**
 * General karaoke songbook. Not tied to spells.
 * Used by non-bard party books (and anyone with hasSongbook).
 */
window.BlingusData = window.BlingusData || {};

function karaokeSong(title, artist) {
  return { t: title, s: title, a: artist };
}

const songs = {
  'Classics': [
    karaokeSong("Don't Stop Believin'", 'Journey'),
    karaokeSong('Bohemian Rhapsody', 'Queen'),
    karaokeSong('Sweet Caroline', 'Neil Diamond'),
    karaokeSong("Livin' on a Prayer", 'Bon Jovi'),
    karaokeSong('I Will Survive', 'Gloria Gaynor'),
    karaokeSong('Piano Man', 'Billy Joel'),
    karaokeSong('Wonderwall', 'Oasis'),
    karaokeSong('Mr. Brightside', 'The Killers'),
  ],
  '80s & 90s': [
    karaokeSong('Take On Me', 'a-ha'),
    karaokeSong('Africa', 'Toto'),
    karaokeSong('Total Eclipse of the Heart', 'Bonnie Tyler'),
    karaokeSong('Come On Eileen', 'Dexys Midnight Runners'),
    karaokeSong('I Wanna Dance with Somebody', 'Whitney Houston'),
    karaokeSong('Wannabe', 'Spice Girls'),
    karaokeSong('...Baby One More Time', 'Britney Spears'),
    karaokeSong('Semi-Charmed Life', 'Third Eye Blind'),
  ],
  'Rap & Hip-Hop': [
    karaokeSong('Jump Around', 'House of Pain'),
    karaokeSong('Ice Ice Baby', 'Vanilla Ice'),
    karaokeSong("U Can't Touch This", 'MC Hammer'),
    karaokeSong("Gangsta's Paradise", 'Coolio'),
    karaokeSong('California Love', '2Pac'),
    karaokeSong('Baby Got Back', 'Sir Mix-a-Lot'),
    karaokeSong('Mama Said Knock You Out', 'LL Cool J'),
    karaokeSong("It's Tricky", 'Run-D.M.C.'),
    karaokeSong('No Diggity', 'Blackstreet'),
    karaokeSong('This Is How We Do It', 'Montell Jordan'),
  ],
  'Campfire': [
    karaokeSong('Take Me Home, Country Roads', 'John Denver'),
    karaokeSong('Wagon Wheel', 'Old Crow Medicine Show'),
    karaokeSong('House of the Rising Sun', 'The Animals'),
    karaokeSong('Sweet Home Alabama', 'Lynyrd Skynyrd'),
    karaokeSong('Ring of Fire', 'Johnny Cash'),
    karaokeSong('Blowin\' in the Wind', 'Bob Dylan'),
    karaokeSong('What a Wonderful World', 'Louis Armstrong'),
    karaokeSong('Stand By Me', 'Ben E. King'),
  ],
};

const classSongs = {
  ranger: {
    'Trail Mix': [
      karaokeSong('On the Road Again', 'Willie Nelson'),
      karaokeSong('Take Me Home, Country Roads', 'John Denver'),
      karaokeSong('The Sound of Silence', 'Simon & Garfunkel'),
      karaokeSong('Wanted Dead or Alive', 'Bon Jovi'),
      karaokeSong('Eye of the Tiger', 'Survivor'),
      karaokeSong('Folsom Prison Blues', 'Johnny Cash'),
    ],
  },
  monk: {
    'Ring Fight': [
      karaokeSong('Mama Said Knock You Out', 'LL Cool J'),
      karaokeSong('Eye of the Tiger', 'Survivor'),
      karaokeSong('Beat It', 'Michael Jackson'),
      karaokeSong("U Can't Touch This", 'MC Hammer'),
      karaokeSong('Jump Around', 'House of Pain'),
      karaokeSong("It's My Life", 'Bon Jovi'),
    ],
  },
  sorcerer: {
    'Weave Pop': [
      karaokeSong("Oops!... I Did It Again", 'Britney Spears'),
      karaokeSong('Weird Science', 'Oingo Boingo'),
      karaokeSong('You Spin Me Round (Like a Record)', 'Dead or Alive'),
      karaokeSong('Firework', 'Katy Perry'),
      karaokeSong('Great Balls of Fire', 'Jerry Lee Lewis'),
      karaokeSong('I Wanna Dance with Somebody', 'Whitney Houston'),
    ],
  },
};

function songsForActive() {
  const key = window.CharacterSheet?.classLinesKey?.() || '';
  const extra = classSongs[key] || {};
  return Object.assign({}, songs, extra);
}

window.BlingusData.songs = songs;
window.BlingusData.classSongs = classSongs;
window.BlingusData.songsForActive = songsForActive;
