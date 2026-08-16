/**
 * Spell parody data (curated revamp, best song-faithful parodies per spell)
 */
window.BlingusData = window.BlingusData || {};

const spells = {
  'Druidcraft': [
    {t:"Here comes the sun, little sprouts, here we grow; lift your leaves up to the sun.", s:"Here Comes the Sun", a:"The Beatles"},
    {t:"Purple rain, purple rain, I call it down; every blossom drinks the rain.", s:"Purple Rain", a:"Prince"},
    {t:"Sweet dreams are made of this; sun, rain, a little grove-green kiss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"Good vibrations, pollinations; bees take wing, buzzing ovations.", s:"Good Vibrations", a:"The Beach Boys"},
    {t:"Blowin' in the wind, the answer, my friend; watch the petals ride the wind.", s:"Blowin' in the Wind", a:"Bob Dylan"},
    {t:"Country roads, take these spores; to the place they belong, roots sing along.", s:"Take Me Home, Country Roads", a:"John Denver"},
    {t:"What a wonderful world; buds unfurl, happy trees do a little twirl.", s:"What a Wonderful World", a:"Louis Armstrong"},
    {t:"Ring of fire; sunlight's desire; leaf on fire, growth climbs higher.", s:"Ring of Fire", a:"Johnny Cash"},
    {t:"It takes two to make a bloom go right; sun and rain, that's the rite.", s:"It Takes Two", a:"Rob Base & DJ E-Z Rock"},
    {t:"Summertime, and the livin's leafy; buds get busy, breezes breezy.", s:"Summertime", a:"DJ Jazzy Jeff & The Fresh Prince"},
  ],
  'Prestidigitation': [
    {t:"Sharp dressed man, lint be gone; cloak pressed crisp, and I move on, sharp dressed man.", s:"Sharp Dressed Man", a:"ZZ Top"},
    {t:"Magic, oh, oh, oh, it's magic; one snap, the grime is gone, pure magic.", s:"Magic", a:"Pilot"},
    {t:"Pour some sugar on me; just a dash, now the bland goes flash.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
    {t:"Brass monkey, that cheeky monkey; chill the mead, clink, clink, clink.", s:"Brass Monkey", a:"Beastie Boys"},
    {t:"Smooth operator, I buff the smudge away; sparkle's here to stay.", s:"Smooth Operator", a:"Sade"},
    {t:"Another one bites the dust; crumbs be gone, the table struts.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Uptown charm you up; clean that mess, fresh-dressed.", s:"Uptown Funk", a:"Bruno Mars"},
    {t:"Ice, ice, baby; chill that drink, frost on the rim.", s:"Ice Ice Baby", a:"Vanilla Ice"},
    {t:"It's tricky to clean a stain like that; one snap, it's gone, and that's a fact.", s:"It's Tricky", a:"Run-D.M.C."},
    {t:"Whoomp, there it is; crumbs dismissed, sparkle on the list.", s:"Whoomp! (There It Is)", a:"Tag Team"},
  ],
  'Vicious Mockery': [
    {t:"Every breath you take, your hands will shake; every move you make, another mistake.", s:"Every Breath You Take", a:"The Police"},
    {t:"Smells like cheap courage; aim like it too; here we are now, can't hit you.", s:"Smells Like Teen Spirit", a:"Nirvana"},
    {t:"Never gonna give you up; never gonna let you live; never gonna stop this rib.", s:"Never Gonna Give You Up", a:"Rick Astley"},
    {t:"Behind blue eyes, your failure cries; no one knows what it's like to miss that wide.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Under pressure, your rolls depress; crumble in style, fail with finesse.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"We will rock you, well, mock you; your aim's a farce, so we mock you.", s:"We Will Rock You", a:"Queen"},
    {t:"Beat it, no, really, just beat it; your swing's so sad the dice repeat it.", s:"Beat It", a:"Michael Jackson"},
    {t:"You're so vain, I bet you think this jab's not true; it is, and so are you, so vain.", s:"You're So Vain", a:"Carly Simon"},
    {t:"Mama said knock you out; your aim's a joke, that's what I'm talkin' about.", s:"Mama Said Knock You Out", a:"LL Cool J"},
    {t:"Insane in the membrane; your swing's insane, and so's the shame.", s:"Insane in the Brain", a:"Cypress Hill"},
  ],
  'Bane': [
    {t:"Knockin' on heaven's door, nah, knockin' on minus-four; bad luck's at the door.", s:"Knockin' on Heaven's Door", a:"Bob Dylan"},
    {t:"Bad moon rising - bad rolls rising; stay indoors, luck's declining.", s:"Bad Moon Rising", a:"Creedence Clearwater Revival"},
    {t:"Nothing else matters - except these curses; sad horns plus manacles.", s:"Nothing Else Matters", a:"Metallica"},
    {t:"Behind blue eyes, the penalty lies; no one knows how it feels to roll these dice.", s:"Behind Blue Eyes", a:"The Who"},
    {t:"Highway to hell, your luck took the dark path; every save's a cramp, highway to hell.", s:"Highway to Hell", a:"AC/DC"},
    {t:"Under pressure, tiny numbers squeal; welcome to -1, that's the deal.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"With or without you - without's the move; your bonuses lost, removed.", s:"With or Without You", a:"U2"},
    {t:"Bad day, you're gonna have a bad day; every roll just turns away.", s:"Bad Day", a:"Daniel Powter"},
    {t:"Been spendin' most their luck livin' in a bane's paradise; minus on the dice.", s:"Gangsta's Paradise", a:"Coolio"},
    {t:"Mo rolls, mo problems; every save just gobbles 'em.", s:"Mo Money Mo Problems", a:"The Notorious B.I.G."},
  ],
  'Command': [
    {t:"Walk this way - away; this path ain't yours today.", s:"Walk This Way", a:"Aerosmith"},
    {t:"Should I stay or should I go, you'll go; I said it once, now go.", s:"Should I Stay or Should I Go", a:"The Clash"},
    {t:"Hit the road, Jack - and don't you come back; hit the path, don't look back.", s:"Hit the Road Jack", a:"Ray Charles"},
    {t:"Stand, now stand, command's command; rise on cue, understand, and stand.", s:"Stand", a:"R.E.M."},
    {t:"Stop! Hammer time - can't touch this; command's bliss, dismissed.", s:"U Can't Touch This", a:"MC Hammer"},
    {t:"Stop! In the name of love - then turn around, walk away, no shove.", s:"Stop! In the Name of Love", a:"The Supremes"},
    {t:"Sit down, be humble - floor's your throne; command's shown, you're prone.", s:"HUMBLE.", a:"Kendrick Lamar"},
    {t:"Jump, go ahead and jump; one word from me, you jump.", s:"Jump", a:"Van Halen"},
    {t:"Jump around, jump around; one word, you leave the ground.", s:"Jump Around", a:"House of Pain"},
    {t:"Gettin' jiggy with it; I said go, now commit.", s:"Gettin' Jiggy Wit It", a:"Will Smith"},
  ],
  'Faerie Fire': [
    {t:"Blinding lights, I stained you bright; no more hiding from the blinding lights.", s:"Blinding Lights", a:"The Weeknd"},
    {t:"Witchlight inferno, burn, baby, burn; outlined every way you turn, witchlight inferno.", s:"Disco Inferno", a:"The Trammps"},
    {t:"Firework, boom, you're outlined like a firework; stealth gone, sparkle berserk, firework.", s:"Firework", a:"Katy Perry"},
    {t:"Every breath you take - we'll be watching you; because you're lit up too.", s:"Every Breath You Take", a:"The Police"},
    {t:"Sweet dreams are made of beams - outline schemes; target gleams.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"Cherub rock - sparkle shock; you are outlined, can't slip the lock.", s:"Cherub Rock", a:"Smashing Pumpkins"},
    {t:"Purple haze all around - the sneak is found; neon truth on battleground.", s:"Purple Haze", a:"Jimi Hendrix"},
    {t:"Black hole sun - won't you come; darkness covers all, stealth undone, run.", s:"Black Hole Sun", a:"Soundgarden"},
    {t:"This is how we do it; outline on you, no one can miss it.", s:"This Is How We Do It", a:"Montell Jordan"},
    {t:"Hip hop hooray, ho, hey, ho; you're lit up, nowhere to go.", s:"Hip Hop Hooray", a:"Naughty by Nature"},
  ],
  'Healing Word': [
    {t:"Stayin' alive - ah, ah, ah, ah - stayin' alive; HP dive canceled, you thrive.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"Bring me to life, wake up inside; I call your spirit back to life.", s:"Bring Me to Life", a:"Evanescence"},
    {t:"The power of love, heals the wound; back on your feet, the power of love.", s:"The Power of Love", a:"Huey Lewis & The News"},
    {t:"With a little help from my words - you'll get by; hearts sync, heads high.", s:"With a Little Help from My Friends", a:"The Beatles"},
    {t:"Stronger - what doesn't kill you makes you stronger; healing power, back to the fray.", s:"Stronger", a:"Kanye West"},
    {t:"I will always love you - and heal you too; HP's new, through and through.", s:"I Will Always Love You", a:"Whitney Houston"},
    {t:"Don't stop believin' - HP climb; hold on to that feelin', you'll be fine.", s:"Don't Stop Believin'", a:"Journey"},
    {t:"Lean on me, when you're not strong; I'll patch you up and carry you along.", s:"Lean on Me", a:"Bill Withers"},
    {t:"Regulate, I modulate; HP up, now you're straight.", s:"Regulate", a:"Warren G & Nate Dogg"},
    {t:"Return of the mack; you're back, HP on track.", s:"Return of the Mack", a:"Mark Morrison"},
  ],
  'Crown of Madness': [
    {t:"Mind games, we're playing those; your former friends are now your foes, mind games.", s:"Mind Games", a:"John Lennon"},
    {t:"Psycho killer, qu'est-ce que c'est; swing at your friends, psycho killer.", s:"Psycho Killer", a:"Talking Heads"},
    {t:"Control - I've got it now; your mind's mine, take a bow.", s:"Control", a:"Janet Jackson"},
    {t:"Friends will be friends - but not today; you're attacking them, I say.", s:"Friends Will Be Friends", a:"Queen"},
    {t:"Hypnotize, you will obey; turn on your allies, attack today.", s:"Hypnotize", a:"The Notorious B.I.G."},
    {t:"Under my thumb - you're controlled; do as I say, be bold.", s:"Under My Thumb", a:"The Rolling Stones"},
    {t:"Master of puppets - pulling your strings; attack your allies, chaos brings.", s:"Master of Puppets", a:"Metallica"},
    {t:"Puppet on a string - I'm pulling you; do what I want, it's true.", s:"Puppet on a String", a:"Sandie Shaw"},
    {t:"My mind's playing tricks on me; now swing at your company.", s:"Mind Playing Tricks on Me", a:"Geto Boys"},
    {t:"Check yo self before you wreck yo self; crown's on, you swing at someone else.", s:"Check Yo Self", a:"Ice Cube"},
  ],
  'Silence': [
    {t:"Silent night, holy and still; not one word leaves your lips tonight, silent night.", s:"Silent Night", a:"Traditional"},
    {t:"Hello, is it me you're, nope; lips move, nothing, just hello.", s:"Hello", a:"Adele"},
    {t:"Turn down for what? - silence, that's what; the weave is cut, sound is shut.", s:"Turn Down for What", a:"DJ Snake & Lil Jon"},
    {t:"The sound of silence, hello darkness, my old friend; no spell, no sound, the sound of silence.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
    {t:"Enjoy the silence - words are needless; footsteps, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
    {t:"Quiet riot - silence's plot; magic's not, sound forgot.", s:"Quiet Riot", a:"Quiet Riot"},
    {t:"Yesterday - all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
    {t:"Quiet storm - silence's form; magic's norm, sound is gone.", s:"Quiet Storm", a:"Smokey Robinson"},
    {t:"Don't believe the hype; no sound, no type, silence is ripe.", s:"Don't Believe the Hype", a:"Public Enemy"},
    {t:"Parents just don't understand; neither do you, the sound is banned.", s:"Parents Just Don't Understand", a:"DJ Jazzy Jeff & The Fresh Prince"},
  ],
  'True Strike': [
    {t:"Eye of the tiger, next swing's a thunder; glow on the blade, then I land her.", s:"Eye of the Tiger", a:"Survivor"},
    {t:"Hit me with your best shot; I already marked the spot.", s:"Hit Me With Your Best Shot", a:"Pat Benatar"},
    {t:"The stroke, you take, I take; radiant rider on the wake.", s:"The Stroke", a:"Billy Squier"},
    {t:"We will rock you, well, mark you; next hit's true, I don't spark you.", s:"We Will Rock You", a:"Queen"},
    {t:"Smooth criminal, aim so criminal; glow on the edge, then the hit's inevitable.", s:"Smooth Criminal", a:"Michael Jackson"},
    {t:"Another one bites, after this light; I called the mark, now it's polite.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Lightning crashes, a little flash is; next attack claiming all the lashes.", s:"Lightning Crashes", a:"Live"},
    {t:"Sharp dressed man, sharp dressed plan; gild the dagger, then I land, sharp dressed man.", s:"Sharp Dressed Man", a:"ZZ Top"},
    {t:"Today was a good day; next hit's already on the way.", s:"It Was a Good Day", a:"Ice Cube"},
    {t:"Still, still aiming; next swing's the one I'm claiming.", s:"Still D.R.E.", a:"Dr. Dre"},
  ],
  "Tasha's Hideous Laughter": [
    {t:"Don't stop me now, I'm having a laugh; you can't stand up, that's the gaffe.", s:"Don't Stop Me Now", a:"Queen"},
    {t:"I gotta feeling that tonight's a giggle; knees go weak, dignity's a riddle.", s:"I Gotta Feeling", a:"The Black Eyed Peas"},
    {t:"Tears of a clown, when there's no one around; you're howling facedown on the ground.", s:"The Tears of a Clown", a:"Smokey Robinson & The Miracles"},
    {t:"Happy, clap along if you feel; you're cackling so hard you can't kneel.", s:"Happy", a:"Pharrell Williams"},
    {t:"Dancing queen, laughing machine; prone on the floor in a glittering scene.", s:"Dancing Queen", a:"ABBA"},
    {t:"Stayin' alive? Nah, stayin' in stitches; WIS save misses, pride in ditches.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"I will survive, you will not rise; the joke's on you, and it multiplies.", s:"I Will Survive", a:"Gloria Gaynor"},
    {t:"Don't stop believin' you can stand; Tasha's laugh is the last laugh planned.", s:"Don't Stop Believin'", a:"Journey"},
    {t:"Bust a move; bust a gut; prone in the dust, that's the cut.", s:"Bust a Move", a:"Young MC"},
    {t:"Do the humpty hump; you laugh and slump; pride takes the jump.", s:"The Humpty Dance", a:"Digital Underground"},
  ],
  'Identify': [
    {t:"I want to know what this is; ritual hum, no more quiz.", s:"I Want to Know What Love Is", a:"Foreigner"},
    {t:"Superstition, wrote the wrong edition; I read the aura, skip the superstition.", s:"Superstition", a:"Stevie Wonder"},
    {t:"The logical song, what it does, how long; curse or blessing, I hum along.", s:"The Logical Song", a:"Supertramp"},
    {t:"Magic, oh, oh, oh, I name it; properties tamed, I claim it.", s:"Magic", a:"Pilot"},
    {t:"What is love? Baby, don't hurt me; this blade's a plus-one, it won't desert me.", s:"What Is Love", a:"Haddaway"},
    {t:"Secret, I've got a secret; your mystery item, I un-keep it.", s:"Secret", a:"Madonna"},
    {t:"The knowledge, I got the knowledge; attunement, charges, every college.", s:"Knowledge", a:"Operation Ivy"},
    {t:"Mystify, no more mystify; I pierce the glamer with a ritual eye.", s:"Mystify", a:"INXS"},
    {t:"Informer, informer; I name the charm, that's the primer.", s:"Informer", a:"Snow"},
    {t:"Can I kick it? Yes you can; I read the rune, that's the plan.", s:"Can I Kick It?", a:"A Tribe Called Quest"},
  ],
  'Dissonant Whispers': [
    {t:"Runaway, runaway; my whisper's a lash and you run, hey.", s:"Runaway", a:"Del Shannon"},
    {t:"I ran, I ran so far away; one sour note and you flee the fray.", s:"I Ran (So Far Away)", a:"A Flock of Seagulls"},
    {t:"Go your own way, you can go your own way; psychic shove, that's the play.", s:"Go Your Own Way", a:"Fleetwood Mac"},
    {t:"Disturbia, your mind's a blurrier; flee the verse, get scurrier.", s:"Disturbia", a:"Rihanna"},
    {t:"Somebody's watching you, no, whispering you; take your flight, the fear is true.", s:"Somebody's Watching Me", a:"Rockwell"},
    {t:"Psycho killer, qu'est-ce que c'est; one hissed chord and you run away.", s:"Psycho Killer", a:"Talking Heads"},
    {t:"Don't fear the reaper, fear the ear-curse; it crawls in, then you squirm.", s:"(Don't Fear) The Reaper", a:"Blue Öyster Cult"},
    {t:"Whisper, just a whisper; then you're sprinting like a blister.", s:"Whisper", a:"Evanescence"},
    {t:"I wish I was a little bit taller; I wish you'd run a little bit farther.", s:"I Wish", a:"Skee-Lo"},
    {t:"You've got to fight for your right to flee; one sour note, that's the decree.", s:"(You Gotta) Fight for Your Right (To Party!)", a:"Beastie Boys"},
  ],
  'Misty Step': [
    {t:"Here I go again on my own; thirty feet of fog and I'm gone.", s:"Here I Go Again", a:"Whitesnake"},
    {t:"Slip slidin' away, slip slidin' away; bonus-action mist, I'm mid-ballet.", s:"Slip Slidin' Away", a:"Paul Simon"},
    {t:"Into the mystic, I fade from the fray; step back grinning a hallway away.", s:"Into the Mystic", a:"Van Morrison"},
    {t:"Smoke on the water, and I on the breeze; you swing at vapor, I sip the tease.", s:"Smoke on the Water", a:"Deep Purple"},
    {t:"Jump, I jump the gap; mist for a cloak, then a clap.", s:"Jump", a:"Van Halen"},
    {t:"Fly like an eagle, let my spirit carry me; thirty feet of fairy ferry.", s:"Fly Like an Eagle", a:"Steve Miller Band"},
    {t:"Fast car, I want a ticket to anywhere; mist is my coach, I'm already there.", s:"Fast Car", a:"Tracy Chapman"},
    {t:"Come and go with me, to that land; I go alone, you miss the hand.", s:"Come and Go With Me", a:"The Dell-Vikings"},
    {t:"Intergalactic, planetary; thirty feet of mist, and I vanish barely.", s:"Intergalactic", a:"Beastie Boys"},
    {t:"California love; mist above; thirty feet later, that's the shove.", s:"California Love", a:"2Pac"},
  ],
  'Enlarge': [
    {t:"Big time, I'm on my way, I'm making it; grow the friend, watch the hit.", s:"Big Time", a:"Peter Gabriel"},
    {t:"We are the champions, my friend; extra size, extra end.", s:"We Are the Champions", a:"Queen"},
    {t:"The wanderer, yeah the wanderer; I resize the room, then I wander.", s:"The Wanderer", a:"Dion"},
    {t:"Fat-bottomed girls, you make the rocking world go; enlarge the pal, watch the show.", s:"Fat Bottomed Girls", a:"Queen"},
    {t:"Big poppa, grow the fighter; extra size, hit 'em brighter.", s:"Big Poppa", a:"The Notorious B.I.G."},
    {t:"Rump shaker, rump shaker; grow the friend, that's the wager.", s:"Rump Shaker", a:"Wreckx-n-Effect"},
  ],
  'Reduce': [
    {t:"It's a small world after all; pinch the brute, that's how I call.", s:"It's a Small World", a:"Sherman Brothers"},
    {t:"Tiny dancer, in my hand; shrink the brute, that's the plan.", s:"Tiny Dancer", a:"Elton John"},
    {t:"Little lies, little lies; or big truths when the ogre diminishes.", s:"Little Lies", a:"Fleetwood Mac"},
    {t:"Short people got no reason; I can arrange a whole season.", s:"Short People", a:"Randy Newman"},
    {t:"Smalltown boy, never gonna be the same; I pinch the brute down to a name.", s:"Smalltown Boy", a:"Bronski Beat"},
  ],
  'Dispel Magic': [
    {t:"Let it go, let it go; that glamer's gone, I told you so.", s:"Let It Go", a:"Idina Menzel"},
    {t:"Don't speak, I know what you're thinking; I snuff the spell in one blinking.", s:"Don't Speak", a:"No Doubt"},
    {t:"Breaking up is hard to do; not for me, I unmake you.", s:"Breaking Up Is Hard to Do", a:"Neil Sedaka"},
    {t:"The end, my friend; your ward's a rumor I just penned.", s:"The End", a:"The Doors"},
    {t:"We gotta get out of this place; your ward, your haste, I erase.", s:"We Gotta Get Out of This Place", a:"The Animals"},
    {t:"Magic, oh, oh, oh, it's over; one word, the weave rolls over.", s:"Magic", a:"Pilot"},
    {t:"Another one bites the dust; that concentration's broke, no fuss.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Undo, I undo you; third-level shears through the woo.", s:"Undo", a:"Björk"},
    {t:"Nowadays everybody wanna talk about the ward; I forgot that spell, that's the word.", s:"Forgot About Dre", a:"Dr. Dre"},
    {t:"Check yo self before you wreck yo self; that buff's back on the shelf.", s:"Check Yo Self", a:"Ice Cube"},
  ],
  'Mass Healing Word': [
    {t:"We are family, I got all my sisters with me; one word, the whole party's HP.", s:"We Are Family", a:"Sister Sledge"},
    {t:"Heal the world, make it a better place; bonus action, every friendly face.", s:"Heal the World", a:"Michael Jackson"},
    {t:"With a little help from my words, you'll get by; all of you, not just the guy.", s:"With a Little Help from My Friends", a:"The Beatles"},
    {t:"Lean on me, when you're not strong; group patch, then we move along.", s:"Lean on Me", a:"Bill Withers"},
    {t:"Come together, right now, over heal; three friends up, that's the deal.", s:"Come Together", a:"The Beatles"},
    {t:"Help! I need somebody; wait, I am somebody, mass somebody.", s:"Help!", a:"The Beatles"},
    {t:"Stayin' alive, ah, ah, ah, ah, the party; one shout, nobody's a casualty.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"Like a bridge over troubled water, I will lay me down; group lift, no one drowns.", s:"Bridge Over Troubled Water", a:"Simon & Garfunkel"},
    {t:"No diggity, no doubt; whole party's HP up and out.", s:"No Diggity", a:"Blackstreet"},
    {t:"It was all a dream; now the whole team's HP is gleam.", s:"Juicy", a:"The Notorious B.I.G."},
  ],
};

const adultSpells = {
  'Druidcraft': [
    {t:"Pour some sugar on me; nectar edition; bees yell 'oh honey,' pollination mission.", s:"Pour Some Sugar on Me", a:"Def Leppard", adult:true},
    {t:"Let's get it on; grow strong; petals purr, photosynth along.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"Hot in herre; crack a window; blossoms blush and steal the show.", s:"Hot in Herre", a:"Nelly", adult:true},
    {t:"Wild thing, I think I love you; blossoms blush, the grove does too.", s:"Wild Thing", a:"Tone Loc", adult:true},
  ],
  'Prestidigitation': [
    {t:"You can leave your hat on; everything else gets pressed and gone.", s:"You Can Leave Your Hat On", a:"Joe Cocker", adult:true},
    {t:"My milkshake brings the shine to your gear; jealous? Thought so, dear.", s:"Milkshake", a:"Kelis", adult:true},
    {t:"Push it; real good; stains slide off like bad decisions should.", s:"Push It", a:"Salt-N-Pepa", adult:true},
    {t:"Shoop, shoop-ba-doop; I shine your kit, then I scoop.", s:"Shoop", a:"Salt-N-Pepa", adult:true},
  ],
  'Vicious Mockery': [
    {t:"Baby got back; the tale checks out; your aim packed off and cleared out.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
    {t:"SexyBack, you brought ugly back; aim's whack, your whole attack is wack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
    {t:"Like a virgin; touched for the first miss; awkward silence, hit or dis?", s:"Like a Virgin", a:"Madonna", adult:true},
    {t:"Funky cold medina; your aim's a mess, that's the demeanor.", s:"Funky Cold Medina", a:"Tone Loc", adult:true},
  ],
  'Bane': [
    {t:"Highway to hell, your fortune walked out; nothing left but minus and doubt.", s:"Highway to Hell", a:"AC/DC", adult:true},
    {t:"Sex on Fire? Nah; luck's on fire; only smoke and cinders, no choir.", s:"Sex on Fire", a:"Kings of Leon", adult:true},
    {t:"Bad to the bone? Bad to the roll; mojo's low, pay that toll.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers", adult:true},
    {t:"With my mind on my minus and my minus on my mind.", s:"Gin and Juice", a:"Snoop Dogg", adult:true},
  ],
  'Command': [
    {t:"Back that thang up; toward the exit, friend; we love the haste that you send.", s:"Back That Thang Up", a:"Juvenile", adult:true},
    {t:"Get down on it; yes, down; the floor's your biggest fan in town.", s:"Get Down on It", a:"Kool & The Gang", adult:true},
    {t:"Rump shaker, rump shaker; I said kneel, that's the wager.", s:"Rump Shaker", a:"Wreckx-n-Effect", adult:true},
  ],
  'Faerie Fire': [
    {t:"Blinding lights, now everyone can see; lit up loud, no modesty.", s:"Blinding Lights", a:"The Weeknd", adult:true},
    {t:"I'm bringing sexy back; outline on track; stealth cracked by neon smack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
    {t:"Lady in Red; marked in red; romance with visibility.", s:"Lady in Red", a:"Chris de Burgh", adult:true},
    {t:"It's a glow thang, baby; outlined loud, no maybe.", s:"Nuthin' but a 'G' Thang", a:"Dr. Dre", adult:true},
  ],
  'Healing Word': [
    {t:"I kissed a girl; healed your world; don't ask the weave, flags unfurled.", s:"I Kissed a Girl", a:"Katy Perry", adult:true},
    {t:"Let's get it on; your heartbeat; slow jam lifts you to your feet.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"Whatta man, whatta man, whatta mighty good heal; back on your feet, that's the deal.", s:"Whatta Man", a:"Salt-N-Pepa", adult:true},
  ],
  'Crown of Madness': [
    {t:"Let's get it started, ill will; twist their minds, friendly fire still.", s:"Let's Get It Started", a:"The Black Eyed Peas", adult:true},
    {t:"I put a spell on you; now do what I want; mind control's the hunt.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins", adult:true},
    {t:"I want your mind and your body too; control's the game, it's true.", s:"I Want Your Sex", a:"George Michael", adult:true},
    {t:"O.P.P., how can I explain it; other people's pals, now you swing to maim it.", s:"O.P.P.", a:"Naughty by Nature", adult:true},
  ],
  'Silence': [
    {t:"Shhh - silence is golden; magic's olden; sound's folded.", s:"Silence Is Golden", a:"The Tremeloes", adult:true},
    {t:"The sound of silence, not a peep, not a moan; you're hushed to the bone.", s:"The Sound of Silence", a:"Simon & Garfunkel", adult:true},
    {t:"Hush, hush; keep it down now; silence's crown, no sound, magic's bound.", s:"Hush", a:"Deep Purple", adult:true},
    {t:"Don't believe the hype, or the moan; silence owns this zone.", s:"Don't Believe the Hype", a:"Public Enemy", adult:true},
  ],
  'True Strike': [
    {t:"Hit me with your best shot; I pre-gilded the naughty spot.", s:"Hit Me With Your Best Shot", a:"Pat Benatar", adult:true},
    {t:"SexyBack, I brought aim back; next thrust glows, then the smack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
    {t:"Mama said knock you out; next swing's the one I'm talkin' about.", s:"Mama Said Knock You Out", a:"LL Cool J", adult:true},
  ],
  "Tasha's Hideous Laughter": [
    {t:"I want your laugh, I want your knees; down you go, say please.", s:"I Want Your Sex", a:"George Michael", adult:true},
    {t:"Baby got back, on the floor, in fact; cackling so hard you can't act.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
    {t:"Do the humpty hump; you laugh and slump; dignity takes the jump.", s:"The Humpty Dance", a:"Digital Underground", adult:true},
  ],
  'Identify': [
    {t:"Let's talk about this, baby, let's talk about this; cursed, blessed, or just a kiss.", s:"Let's Talk About Sex", a:"Salt-N-Pepa", adult:true},
    {t:"I want to know what this is; no more mystery in your satchel, sis.", s:"I Want to Know What Love Is", a:"Foreigner", adult:true},
    {t:"Informer, you no say daddy me know; I name the charm, then I show.", s:"Informer", a:"Snow", adult:true},
  ],
  'Dissonant Whispers': [
    {t:"Toxic, baby, I'm slipping under; one dirty whisper and you thunder-plunder out.", s:"Toxic", a:"Britney Spears", adult:true},
    {t:"Crazy, I'm crazy for feeling so lonely; you're crazy for staying after I named thee.", s:"Crazy", a:"Patsy Cline", adult:true},
    {t:"Insane in the membrane; one hiss and you flee the lane.", s:"Insane in the Brain", a:"Cypress Hill", adult:true},
  ],
  'Misty Step': [
    {t:"Get outta my dreams, get into my mist; thirty feet later, you never were kissed.", s:"Get Outta My Dreams, Get Into My Car", a:"Billy Ocean", adult:true},
    {t:"You can leave your hat on; I already left, the mist is gone.", s:"You Can Leave Your Hat On", a:"Joe Cocker", adult:true},
    {t:"California love; mist above; thirty feet later, no kiss, just shove.", s:"California Love", a:"2Pac", adult:true},
  ],
  'Enlarge': [
    {t:"Baby got back, and then some; enlarge the pal, reduce the scum.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
    {t:"Rump shaker, rump shaker; grow the friend, that's the wager.", s:"Rump Shaker", a:"Wreckx-n-Effect", adult:true},
  ],
  'Reduce': [
    {t:"Little red corvette, baby you're much too fast; shrink the brute, make the moment last.", s:"Little Red Corvette", a:"Prince", adult:true},
    {t:"Whip it, whip it good; shrink the brute like you should.", s:"Whip It", a:"Devo", adult:true},
  ],
  'Dispel Magic': [
    {t:"I put a spell on you, then I take it back; third-level shears, that's the knack.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins", adult:true},
    {t:"Let's get it ended; your ward's suspended, magic upended.", s:"Let's Get It Started", a:"The Black Eyed Peas", adult:true},
    {t:"Nowadays everybody wanna talk about that ward; I forgot that spell, that's the word.", s:"Forgot About Dre", a:"Dr. Dre", adult:true},
  ],
  'Mass Healing Word': [
    {t:"Let's get it on, the whole party's heartbeat; one word, everybody back on their feet.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
    {t:"I kissed a girl, healed the world; don't ask the weave, flags unfurled, company edition.", s:"I Kissed a Girl", a:"Katy Perry", adult:true},
    {t:"No diggity, no doubt; whole party's HP up and out.", s:"No Diggity", a:"Blackstreet", adult:true},
  ],
};

window.BlingusData.spells = spells;
window.BlingusData.adultSpells = adultSpells;

window.BlingusData.SPELL_LEVELS = {
  'Vicious Mockery': 'cantrip',
  'Prestidigitation': 'cantrip',
  'True Strike': 'cantrip',
  'Druidcraft': 'cantrip',
  'Healing Word': '1',
  'Bane': '1',
  'Command': '1',
  "Tasha's Hideous Laughter": '1',
  'Identify': '1',
  'Dissonant Whispers': '1',
  'Faerie Fire': '1',
  'Silence': '2',
  'Crown of Madness': '2',
  'Misty Step': '2',
  'Enlarge': '2',
  'Reduce': '2',
  'Enlarge/Reduce': '2',
  'Dispel Magic': '3',
  'Mass Healing Word': '3',
};

window.BlingusData.SPELL_LEVEL_LABELS = [
  { id: 'cantrip', label: 'Cantrips' },
  { id: '1', label: '1st Level' },
  { id: '2', label: '2nd Level' },
  { id: '3', label: '3rd Level' },
  { id: 'other', label: 'Other' },
];

function parseSpellLevelFromNotes(notes) {
  const n = String(notes || '');
  if (/cantrip/i.test(n)) return 'cantrip';
  if (/\b1st\b|\bfirst\b/i.test(n)) return '1';
  if (/\b2nd\b|\bsecond\b/i.test(n)) return '2';
  if (/\b3rd\b|\bthird\b/i.test(n)) return '3';
  return '';
}

window.BlingusData.getSpellTree = function getSpellTree() {
  const seen = new Map();
  const levels = {};

  function add(name, level) {
    const key = String(name || '').trim();
    if (!key) return;
    const lk = key.toLowerCase();
    if (!seen.has(lk)) seen.set(lk, key);
    if (level && !levels[lk]) levels[lk] = level;
  }

  const sheetSpells = (window.CharacterSheet && window.CharacterSheet.get)
    ? (window.CharacterSheet.get().spells || [])
    : [];
  function addNamed(name, level) {
    const key = String(name || '').trim();
    if (!key) return;
    if (/^enlarge\/reduce$/i.test(key)) {
      add('Enlarge', level || '2');
      add('Reduce', level || '2');
      return;
    }
    add(key, level);
  }

  sheetSpells.forEach((s) => {
    const parsed = parseSpellLevelFromNotes(s.notes);
    const fallback = window.BlingusData.SPELL_LEVELS[s.name] || 'other';
    addNamed(s.name, parsed || fallback);
  });

  Object.keys(window.BlingusData.spells || {}).forEach((name) => {
    addNamed(name, window.BlingusData.SPELL_LEVELS[name] || 'other');
  });
  Object.keys(window.BlingusData.adultSpells || {}).forEach((name) => {
    addNamed(name, window.BlingusData.SPELL_LEVELS[name] || 'other');
  });

  return window.BlingusData.SPELL_LEVEL_LABELS.map((group) => ({
    id: group.id,
    label: group.label,
    ids: Array.from(seen.entries())
      .filter(([lk]) => (levels[lk] || 'other') === group.id)
      .map(([, name]) => name),
  })).filter((group) => group.ids.length);
};
