/**
 * Spell parody data for Blingus' Bardbook
 * Regular and adult spell entries organized by spell name
 */
window.BlingusData = window.BlingusData || {};

const spells = {
  'Druidcraft': [
    {t:"Here comes the sprout, doo-doo-doo-doo; little leaf, all right, go green tonight.", s:"Here Comes the Sun", a:"The Beatles"},
    {t:"I bless the rains in this room; tiny monsoon, bloom on cue.", s:"Africa", a:"Toto"},
    {t:"I'm walking on sunshine; seedlings join in; don't it feel good? chlorophyll squeals.", s:"Walking on Sunshine", a:"Katrina and the Waves"},
    {t:"Country roads, take these spores; to the place they belong, roots sing along.", s:"Take Me Home, Country Roads", a:"John Denver"},
    {t:"Good vibrations, pollinations; bees RSVP, buzzing ovations.", s:"Good Vibrations", a:"The Beach Boys"},
    {t:"What a wonderful world; buds unfurl, happy trees do jazz hands, girl.", s:"What a Wonderful World", a:"Louis Armstrong"},
    {t:"Sweet dreams are made of this; sun, rain, a little photosynth kiss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"I'm a lumberjack and I'm okay; but these plants are better, they grow all day.", s:"Lumberjack Song", a:"Monty Python"},
    {t:"Don't worry, be happy; photosynthesis; leaves clap back, chorus of bliss.", s:"Don't Worry Be Happy", a:"Bobby McFerrin"},
    {t:"Ring of fire; sunlight's desire; leaf on fire, growth climbs higher.", s:"Ring of Fire", a:"Johnny Cash"}
  ],
  'Prestidigitation': [
    {t:"No diggity, no doubt; this mess just checked out, sparkle crowd shout.", s:"No Diggity", a:"Blackstreet"},
    {t:"Ice, ice, baby; chill that drink, rim goes bling.", s:"Ice Ice Baby", a:"Vanilla Ice"},
    {t:"Another one bites the dust; crumbs be gone, countertop struts.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Pour some sugar on me; just a dash, now the bland goes flash.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
    {t:"Beat it, grime, beat it; make it clean, defeat it.", s:"Beat It", a:"Michael Jackson"},
    {t:"Smooth operator; polish, preen; spotless exit, magazine sheen.", s:"Smooth Operator", a:"Sade"},
    {t:"Don't stop me now; I'm having such a clean time; shine so prime, lemon-lime.", s:"Don't Stop Me Now", a:"Queen"},
    {t:"Brass monkey, that funky monkey; chill the drink, clink, clink, clink.", s:"Brass Monkey", a:"Beastie Boys"},
    {t:"Shake it off; dust and grime, gone in time.", s:"Shake It Off", a:"Taylor Swift"},
    {t:"Uptown funk you up; clean that mess, fresh-dressed.", s:"Uptown Funk", a:"Bruno Mars"},
    {t:"I'm too sexy for this shirt and this stain; presto clean, no shame.", s:"I'm Too Sexy", a:"Right Said Fred"},
    {t:"Material girl; but make it clean; glitter wipe, immaculate sheen.", s:"Material Girl", a:"Madonna"}
  ],
  'Vicious Mockery': [
    {t:"You're so vain, you think this spell's about you; you're right, ego's carry-on.", s:"You're So Vain", a:"Carly Simon"},
    {t:"U can't touch this; accuracy, dignity, competence - all missed.", s:"U Can't Touch This", a:"MC Hammer"},
    {t:"Smells like teen spirit; aim like it too; here we are now, can't hit you.", s:"Smells Like Teen Spirit", a:"Nirvana"},
    {t:"Every breath you take, your hands will shake; every move you make, another mistake.", s:"Every Breath You Take", a:"The Police"},
    {t:"I get knocked down, but you stay down; no drink will keep you up.", s:"Tubthumping", a:"Chumbawamba"},
    {t:"Never gonna give you up; never gonna let you live; never gonna stop this rib.", s:"Never Gonna Give You Up", a:"Rick Astley"},
    {t:"Under pressure, your rolls depress; crumble in style, fail with finesse.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"Oops!... I did it again - missed, that is; your aim's a habit, not a hit.", s:"Oops!... I Did It Again", a:"Britney Spears"},
    {t:"Bad Romance with accuracy; ooh-la-la, you and the target are on a break.", s:"Bad Romance", a:"Lady Gaga"},
    {t:"Behind blue eyes, your failure cries; no one knows what it's like to be that guy.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Even Mystra's Weave rejects you; and she lets in half the Realms.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"Elminster called - he wants his apprentice back; 'basic competence,' he said.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"All the single ladies, all the single misses; hands up, watch 'em whiff it.", s:"Single Ladies", a:"Beyoncé"},
    {t:"I'm a survivor, but you're not; you keep survivin' the air, not the shot.", s:"Survivor", a:"Destiny's Child"},
    {t:"Bad guy, but make it worse; your villainy needs a refill on curse.", s:"Bad Guy", a:"Billie Eilish"},
    {t:"Sorry not sorry; this roast's my hobby.", s:"Sorry Not Sorry", a:"Demi Lovato"},
    {t:"Truth hurts; so does this burn; lesson learned, no return.", s:"Truth Hurts", a:"Lizzo"},
    {t:"Even Vecna's hand is giving you the finger - and he's missing fingers.", s:"D&D Lore", a:"Mockery"}
  ],
  'Bane': [
    {t:"Under pressure, tiny numbers squeal; welcome to -1, that's the deal.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"With or without you - without's the move; your bonuses packed and moved.", s:"With or Without You", a:"U2"},
    {t:"Paint it black - your odds, your mood; weekend plans, also screwed.", s:"Paint It Black", a:"The Rolling Stones"},
    {t:"Livin' on a prayer - whiffin' on a prayer; fate says no, we say 'unfair.'", s:"Livin' on a Prayer", a:"Bon Jovi"},
    {t:"Bad moon rising - bad rolls rising; stay indoors, luck's downsizing.", s:"Bad Moon Rising", a:"Creedence Clearwater Revival"},
    {t:"Nothing else matters - except these debuffs; sad trombone plus cuffs.", s:"Nothing Else Matters", a:"Metallica"},
    {t:"Behind blue eyes, the penalty lies; no one knows how it feels to roll these dice.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Even Kelemvor's scales tip against you - and he's impartial.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"Toxic - your rolls, your vibe; debuff tribe, no jive.", s:"Toxic", a:"Britney Spears"},
    {t:"I'm a mess - but you're a disaster; bane's your master.", s:"I'm a Mess", a:"Bebe Rexha"},
    {t:"Problem - yeah, you're one; bane's begun, no fun.", s:"Problem", a:"Ariana Grande"},
    {t:"Even Asmodeus is disappointed - and he's the Lord of Hell.", s:"D&D Lore", a:"Mockery"}
  ],
  'Command': [
    {t:"Stop! In the name of love - then turn around, walk away, no shove.", s:"Stop! In the Name of Love", a:"The Supremes"},
    {t:"Go your own way - specifically away; heel-toe shuffle, obey.", s:"Go Your Own Way", a:"Fleetwood Mac"},
    {t:"Hit the road, Jack - and don't you come back; hit the track, don't look back.", s:"Hit the Road Jack", a:"Ray Charles"},
    {t:"Walk this way - away; this path ain't your runway.", s:"Walk This Way", a:"Aerosmith"},
    {t:"Jump - might as well jump; into prone, gravity's number one.", s:"Jump", a:"Van Halen"},
    {t:"The Harpers would be proud - if they weren't busy ignoring you.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"Sit down, be humble - floor's your throne; command's shown, you're prone.", s:"HUMBLE.", a:"Kendrick Lamar"},
    {t:"You need to calm down - specifically, sit; command's hit, that's it.", s:"You Need to Calm Down", a:"Taylor Swift"},
    {t:"Stop! Hammer time - can't touch this; command's bliss, dismissed.", s:"U Can't Touch This", a:"MC Hammer"},
    {t:"Even a goblin would follow orders better - and they're chaotic evil.", s:"D&D Lore", a:"Mockery"}
  ],
  'Faerie Fire': [
    {t:"I can see clearly now - the glow is on; stealth clocked out, stealth is gone.", s:"I Can See Clearly Now", a:"Johnny Nash"},
    {t:"Every breath you take - we'll be watching you; because you're lit up too.", s:"Every Breath You Take", a:"The Police"},
    {t:"Mr. Brightside - now you're outlined; tutorial highlight, perfectly timed.", s:"Mr. Brightside", a:"The Killers"},
    {t:"Purple haze all around - the sneak is found; neon truth on battleground.", s:"Purple Haze", a:"Jimi Hendrix"},
    {t:"Sweet dreams are made of beams - outline schemes; target gleams.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"Black hole sun - won't you come; darkness covers all, stealth undone, run.", s:"Black Hole Sun", a:"Soundgarden"},
    {t:"Cherub rock - sparkle shock; you are outlined, can't unlock.", s:"Cherub Rock", a:"Smashing Pumpkins"},
    {t:"Even Drizzt couldn't hide from this - and he's pretty good at hiding.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"I see a red door - and I want it painted bright; faerie fire's light, no flight.", s:"Paint It Black", a:"The Rolling Stones"},
    {t:"Dancing in the dark - not anymore; neon core, stealth's tore.", s:"Dancing in the Dark", a:"Bruce Springsteen"},
    {t:"Light 'em up - like a Christmas tree; stealth's history, can't flee.", s:"Light 'Em Up", a:"Fall Out Boy"},
    {t:"Shine bright like a diamond - outline's prime; stealth's crime, caught in time.", s:"Diamonds", a:"Rihanna"},
    {t:"Even an invisible stalker would be visible - and they're literally invisible.", s:"D&D Lore", a:"Mockery"}
  ],
  'Healing Word': [
    {t:"Don't stop believin' - HP climb; hold on to that feelin', you'll be fine.", s:"Don't Stop Believin'", a:"Journey"},
    {t:"Lean on me - when you're not strong; here's some HP to carry on.", s:"Lean on Me", a:"Bill Withers"},
    {t:"I will survive - as long as I heal, you'll thrive; that's the vibe.", s:"I Will Survive", a:"Gloria Gaynor"},
    {t:"Here I go again - lifting friends up again; chorus of life, amen.", s:"Here I Go Again", a:"Whitesnake"},
    {t:"With a little help from my words - you'll get by; hearts sync, heads high.", s:"With a Little Help from My Friends", a:"The Beatles"},
    {t:"Beat it, death, beat it; pulse on the two and four, believe it.", s:"Beat It", a:"Michael Jackson"},
    {t:"Stayin' alive - ah, ah, ah, ah - stayin' alive; HP dive canceled, you thrive.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"Stronger - what doesn't kill you makes you stronger; healing power, back in the game.", s:"Stronger", a:"Kanye West"},
    {t:"I'm still standing - yeah, yeah, yeah; stand tall, heal all, better each day.", s:"I'm Still Standing", a:"Elton John"},
    {t:"Rise up - back on your feet; healing complete, defeat deleted.", s:"Rise Up", a:"Andra Day"},
    {t:"If everything could ever feel this real forever - HP restored, never sever.", s:"Everlong", a:"Foo Fighters"},
    {t:"Even Ilmater approves - and he's seen worse.", s:"Forgotten Realms Lore", a:"Mockery"},
    {t:"Shake it off - death's grip; healing's trip, no slip.", s:"Shake It Off", a:"Taylor Swift"},
    {t:"I will always love you - and heal you too; HP's new, through and through.", s:"I Will Always Love You", a:"Whitney Houston"},
    {t:"Don't stop believin' - in healing power; HP's your tower, no cower.", s:"Don't Stop Believin'", a:"Journey"},
    {t:"Fix you - when you're broken; healing's spoken, no token.", s:"Fix You", a:"Coldplay"},
    {t:"Rise up - from the floor; healing's door, no more.", s:"Rise Up", a:"Andra Day"},
    {t:"Even a rust monster appreciates this healing - and they appreciate nothing.", s:"Blingus' Obsession", a:"Mockery"}
  ],
  'Crown of Madness': [
    {t:"Let's get it started—wrong crowd; mind control's loud, hit your friend, proud.", s:"Let's Get It Started", a:"The Black Eyed Peas"},
    {t:"I put a spell on you - and now you're mine; attack your friend, it's fine.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins"},
    {t:"Under my thumb - you're controlled; do as I say, be bold.", s:"Under My Thumb", a:"The Rolling Stones"},
    {t:"Master of puppets - pulling your strings; attack your allies, chaos brings.", s:"Master of Puppets", a:"Metallica"},
    {t:"Puppet on a string - I'm pulling you; do what I want, it's true.", s:"Puppet on a String", a:"Sandie Shaw"},
    {t:"Control - I've got it now; your mind's mine, take a bow.", s:"Control", a:"Janet Jackson"},
    {t:"Friends will be friends - but not today; you're attacking them, I say.", s:"Friends Will Be Friends", a:"Queen"},
    {t:"You're my best friend - but now attack them; mind control's gem.", s:"You're My Best Friend", a:"Queen"},
    {t:"Even a rust monster is confused by this - and they're confused by everything.", s:"Blingus' Obsession", a:"Mockery"},
    {t:"I can't get no satisfaction - mind control can; make them attack, that's the plan.", s:"(I Can't Get No) Satisfaction", a:"The Rolling Stones"},
    {t:"Don't stop believin' - in attacking your friend; mind control to the end.", s:"Don't Stop Believin'", a:"Journey"}
  ],
  'Silence': [
    {t:"Hello darkness, my old friend - shhh, we ghost again; quiet to the end.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
    {t:"Enjoy the silence - words are needless; footsteps, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
    {t:"Hush, hush - keep it down now; silence's crown, no sound.", s:"Hush", a:"Deep Purple"},
    {t:"Quiet riot - silence's plot; magic's not, sound forgot.", s:"Quiet Riot", a:"Quiet Riot"},
    {t:"Shhh - silence is golden; magic's olden, sound's folden.", s:"Silence Is Golden", a:"The Tremeloes"},
    {t:"Yesterday - all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
    {t:"Turn down for what? - silence, that's what; magic's cut, sound's shut.", s:"Turn Down for What", a:"DJ Snake & Lil Jon"},
    {t:"You're like Prismeer's silence - confusing and slightly concerning.", s:"Blingus' Feywild Reference", a:"Mockery"},
    {t:"Even a banshee would be quiet - and that's saying something.", s:"D&D Lore", a:"Mockery"},
    {t:"The sound of silence - victory's song; magic's history, spell's mystery.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
    {t:"Quiet storm - silence's form; magic's norm, sound's dorm.", s:"Quiet Storm", a:"Smokey Robinson"}
  ]
};

const adultSpells = {
  'Druidcraft': [
    {t:"Let's get it on; grow strong; petals purr, photosynth along.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"Pour some sugar on me; nectar edition; bees yell 'oh honey,' pollination mission.", s:"Pour Some Sugar on Me", a:"Def Leppard", adult:true},
    {t:"Hot in herre; crack a window; blossoms blush and steal the show.", s:"Hot in Herre", a:"Nelly", adult:true}
  ],
  'Prestidigitation': [
    {t:"Push it; real good; stains slide off like bad decisions should.", s:"Push It", a:"Salt-N-Pepa", adult:true},
    {t:"My milkshake brings the shine to your gear; jealous? Thought so, dear.", s:"Milkshake", a:"Kelis", adult:true},
    {t:"You can leave your hat on; everything else gets pressed and gone.", s:"You Can Leave Your Hat On", a:"Joe Cocker", adult:true}
  ],
  'Vicious Mockery': [
    {t:"Baby got back; story checks out; your aim packed up and moved out.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
    {t:"Like a virgin; touched for the first miss; awkward silence, hit or dis?", s:"Like a Virgin", a:"Madonna", adult:true}
  ],
  'Bane': [
    {t:"Sex on Fire? Nah; luck's on fire; only smoke alarms, no choir.", s:"Sex on Fire", a:"Kings of Leon", adult:true},
    {t:"Bad to the bone? Bad to the roll; mojo's low, pay that toll.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers", adult:true}
  ],
  'Command': [
    {t:"Get down on it; yes, down; the floor's your biggest fan in town.", s:"Get Down on It", a:"Kool & The Gang", adult:true},
    {t:"Back that thang up; toward the exit, friend; we love the energy you send.", s:"Back That Thang Up", a:"Juvenile", adult:true}
  ],
  'Faerie Fire': [
    {t:"I'm bringing sexy back; outline on track; stealth cracked by neon smack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
    {t:"Lady in Red; more like LED; romance with visibility.", s:"Lady in Red", a:"Chris de Burgh", adult:true}
  ],
  'Healing Word': [
    {t:"Let's get it on; your heartbeat; slow jam lifts you to your feet.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"I kissed a girl; healed your world; don't ask the science, flags unfurled.", s:"I Kissed a Girl", a:"Katy Perry", adult:true}
  ],
  'Crown of Madness': [
    {t:"Let's get it started—bad vibes; twist their minds, friendly fire jives.", s:"Let's Get It Started", a:"The Black Eyed Peas", adult:true},
    {t:"I put a spell on you; now do what I want; mind control's the hunt.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins", adult:true},
    {t:"I want your mind and your body too; control's the game, it's true.", s:"I Want Your Sex", a:"George Michael", adult:true},
    {t:"Do what I want; attack your friend; mind control's the trend.", s:"Do What I Want", a:"Various", adult:true}
  ],
  'Silence': [
    {t:"Shhh - silence is golden; magic's olden; sound's folded.", s:"Silence Is Golden", a:"The Tremeloes", adult:true},
    {t:"Hush, hush; keep it down now; silence's crown, no sound, magic's bound.", s:"Hush", a:"Deep Purple", adult:true}
  ]
};

window.BlingusData.spells = spells;
window.BlingusData.adultSpells = adultSpells;