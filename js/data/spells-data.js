/**
 * Spell parody data (curated revamp — best song-faithful parodies per spell)
 */
window.BlingusData = window.BlingusData || {};

const spells = {
  'Druidcraft': [
    {t:"Sweet dreams are made of this; sun, rain, a little photosynth kiss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"Good vibrations, pollinations; bees RSVP, buzzing ovations.", s:"Good Vibrations", a:"The Beach Boys"},
    {t:"Country roads, take these spores; to the place they belong, roots sing along.", s:"Take Me Home, Country Roads", a:"John Denver"},
    {t:"What a wonderful world; buds unfurl, happy trees do jazz hands, girl.", s:"What a Wonderful World", a:"Louis Armstrong"},
    {t:"Ring of fire; sunlight's desire; leaf on fire, growth climbs higher.", s:"Ring of Fire", a:"Johnny Cash"},
  ],
  'Prestidigitation': [
    {t:"Pour some sugar on me; just a dash, now the bland goes flash.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
    {t:"Brass monkey, that funky monkey; chill the drink, clink, clink, clink.", s:"Brass Monkey", a:"Beastie Boys"},
    {t:"Another one bites the dust; crumbs be gone, countertop struts.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Uptown funk you up; clean that mess, fresh-dressed.", s:"Uptown Funk", a:"Bruno Mars"},
    {t:"Ice, ice, baby; chill that drink, rim goes bling.", s:"Ice Ice Baby", a:"Vanilla Ice"},
  ],
  'Vicious Mockery': [
    {t:"Every breath you take, your hands will shake; every move you make, another mistake.", s:"Every Breath You Take", a:"The Police"},
    {t:"Smells like teen spirit; aim like it too; here we are now, can't hit you.", s:"Smells Like Teen Spirit", a:"Nirvana"},
    {t:"Never gonna give you up; never gonna let you live; never gonna stop this rib.", s:"Never Gonna Give You Up", a:"Rick Astley"},
    {t:"Behind blue eyes, your failure cries; no one knows what it's like to be that guy.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Under pressure, your rolls depress; crumble in style, fail with finesse.", s:"Under Pressure", a:"Queen & David Bowie"},
  ],
  'Bane': [
    {t:"Bad moon rising - bad rolls rising; stay indoors, luck's downsizing.", s:"Bad Moon Rising", a:"Creedence Clearwater Revival"},
    {t:"Nothing else matters - except these debuffs; sad trombone plus cuffs.", s:"Nothing Else Matters", a:"Metallica"},
    {t:"Behind blue eyes, the penalty lies; no one knows how it feels to roll these dice.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Under pressure, tiny numbers squeal; welcome to -1, that's the deal.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"With or without you - without's the move; your bonuses packed and moved.", s:"With or Without You", a:"U2"},
  ],
  'Command': [
    {t:"Walk this way - away; this path ain't your runway.", s:"Walk This Way", a:"Aerosmith"},
    {t:"Hit the road, Jack - and don't you come back; hit the track, don't look back.", s:"Hit the Road Jack", a:"Ray Charles"},
    {t:"Stop! Hammer time - can't touch this; command's bliss, dismissed.", s:"U Can't Touch This", a:"MC Hammer"},
    {t:"Stop! In the name of love - then turn around, walk away, no shove.", s:"Stop! In the Name of Love", a:"The Supremes"},
    {t:"Sit down, be humble - floor's your throne; command's shown, you're prone.", s:"HUMBLE.", a:"Kendrick Lamar"},
  ],
  'Faerie Fire': [
    {t:"Every breath you take - we'll be watching you; because you're lit up too.", s:"Every Breath You Take", a:"The Police"},
    {t:"Sweet dreams are made of beams - outline schemes; target gleams.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"Cherub rock - sparkle shock; you are outlined, can't unlock.", s:"Cherub Rock", a:"Smashing Pumpkins"},
    {t:"Purple haze all around - the sneak is found; neon truth on battleground.", s:"Purple Haze", a:"Jimi Hendrix"},
    {t:"Black hole sun - won't you come; darkness covers all, stealth undone, run.", s:"Black Hole Sun", a:"Soundgarden"},
  ],
  'Healing Word': [
    {t:"Stayin' alive - ah, ah, ah, ah - stayin' alive; HP dive canceled, you thrive.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"With a little help from my words - you'll get by; hearts sync, heads high.", s:"With a Little Help from My Friends", a:"The Beatles"},
    {t:"Stronger - what doesn't kill you makes you stronger; healing power, back in the game.", s:"Stronger", a:"Kanye West"},
    {t:"I will always love you - and heal you too; HP's new, through and through.", s:"I Will Always Love You", a:"Whitney Houston"},
    {t:"Don't stop believin' - HP climb; hold on to that feelin', you'll be fine.", s:"Don't Stop Believin'", a:"Journey"},
  ],
  'Crown of Madness': [
    {t:"Control - I've got it now; your mind's mine, take a bow.", s:"Control", a:"Janet Jackson"},
    {t:"Friends will be friends - but not today; you're attacking them, I say.", s:"Friends Will Be Friends", a:"Queen"},
    {t:"Under my thumb - you're controlled; do as I say, be bold.", s:"Under My Thumb", a:"The Rolling Stones"},
    {t:"Master of puppets - pulling your strings; attack your allies, chaos brings.", s:"Master of Puppets", a:"Metallica"},
    {t:"Puppet on a string - I'm pulling you; do what I want, it's true.", s:"Puppet on a String", a:"Sandie Shaw"},
  ],
  'Silence': [
    {t:"Turn down for what? - silence, that's what; magic's cut, sound's shut.", s:"Turn Down for What", a:"DJ Snake & Lil Jon"},
    {t:"Enjoy the silence - words are needless; footsteps, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
    {t:"Quiet riot - silence's plot; magic's not, sound forgot.", s:"Quiet Riot", a:"Quiet Riot"},
    {t:"Yesterday - all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
    {t:"Quiet storm - silence's form; magic's norm, sound's dorm.", s:"Quiet Storm", a:"Smokey Robinson"},
  ],
};

const adultSpells = {
  'Druidcraft': [
    {t:"Pour some sugar on me; nectar edition; bees yell 'oh honey,' pollination mission.", s:"Pour Some Sugar on Me", a:"Def Leppard", adult:true},
    {t:"Let's get it on; grow strong; petals purr, photosynth along.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"Hot in herre; crack a window; blossoms blush and steal the show.", s:"Hot in Herre", a:"Nelly", adult:true},
  ],
  'Prestidigitation': [
    {t:"You can leave your hat on; everything else gets pressed and gone.", s:"You Can Leave Your Hat On", a:"Joe Cocker", adult:true},
    {t:"My milkshake brings the shine to your gear; jealous? Thought so, dear.", s:"Milkshake", a:"Kelis", adult:true},
    {t:"Push it; real good; stains slide off like bad decisions should.", s:"Push It", a:"Salt-N-Pepa", adult:true},
  ],
  'Vicious Mockery': [
    {t:"Baby got back; story checks out; your aim packed up and moved out.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
    {t:"Like a virgin; touched for the first miss; awkward silence, hit or dis?", s:"Like a Virgin", a:"Madonna", adult:true},
  ],
  'Bane': [
    {t:"Sex on Fire? Nah; luck's on fire; only smoke alarms, no choir.", s:"Sex on Fire", a:"Kings of Leon", adult:true},
    {t:"Bad to the bone? Bad to the roll; mojo's low, pay that toll.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers", adult:true},
  ],
  'Command': [
    {t:"Back that thang up; toward the exit, friend; we love the energy you send.", s:"Back That Thang Up", a:"Juvenile", adult:true},
    {t:"Get down on it; yes, down; the floor's your biggest fan in town.", s:"Get Down on It", a:"Kool & The Gang", adult:true},
  ],
  'Faerie Fire': [
    {t:"I'm bringing sexy back; outline on track; stealth cracked by neon smack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
    {t:"Lady in Red; more like LED; romance with visibility.", s:"Lady in Red", a:"Chris de Burgh", adult:true},
  ],
  'Healing Word': [
    {t:"I kissed a girl; healed your world; don't ask the science, flags unfurled.", s:"I Kissed a Girl", a:"Katy Perry", adult:true},
    {t:"Let's get it on; your heartbeat; slow jam lifts you to your feet.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
  ],
  'Crown of Madness': [
    {t:"Let's get it started—bad vibes; twist their minds, friendly fire jives.", s:"Let's Get It Started", a:"The Black Eyed Peas", adult:true},
    {t:"I put a spell on you; now do what I want; mind control's the hunt.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins", adult:true},
    {t:"I want your mind and your body too; control's the game, it's true.", s:"I Want Your Sex", a:"George Michael", adult:true},
  ],
  'Silence': [
    {t:"Shhh - silence is golden; magic's olden; sound's folded.", s:"Silence Is Golden", a:"The Tremeloes", adult:true},
    {t:"Hush, hush; keep it down now; silence's crown, no sound, magic's bound.", s:"Hush", a:"Deep Purple", adult:true},
  ],
};

window.BlingusData.spells = spells;
window.BlingusData.adultSpells = adultSpells;
