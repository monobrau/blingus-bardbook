(function(){
  // Debug mode: enable via URL parameter ?debug=true or hostname is localhost
  const DEBUG = new URLSearchParams(window.location.search).has('debug') || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  
  // Debug logging helper
  const debugLog = (...args) => {
    if (DEBUG) console.log(...args);
  };
  
  const spells = {
    'Druidcraft': [
      {t:"Here comes the sprout, doo-doo-doo-doo—little leaf, it's all right; bask in the glow, grow in the light.", s:"Here Comes the Sun", a:"The Beatles"},
      {t:"I bless the rains in this room—tiny monsoon on cue; bloom crew coming through.", s:"Africa", a:"Toto"},
      {t:"I'm walking on sunshine—so are my seedlings; don't it feel good when nature starts healing.", s:"Walking on Sunshine", a:"Katrina and the Waves"},
      {t:"Country roads, take these spores—to the place they belong; roots hum along to the travelin' song.", s:"Take Me Home, Country Roads", a:"John Denver"},
      {t:"Good vibrations—pollinations; bees RSVP and hype the stations.", s:"Good Vibrations", a:"The Beach Boys"},
      {t:"What a wonderful world—buds unfurled; happy little leaves wave hello to the world.", s:"What a Wonderful World", a:"Louis Armstrong"},
      {t:"Sweet dreams are made of this—sun, rain, and photosynth bliss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
      {t:"I'm a lumberjack and I'm okay—but these plants are better; they work all day.", s:"Lumberjack Song", a:"Monty Python"},
      {t:"Don't worry, be happy—photosynthesis; leaves clap back, nature's thesis.", s:"Don't Worry Be Happy", a:"Bobby McFerrin"},
      {t:"Ring of fire—sunlight's desire; plants on fire with growth, no tire.", s:"Ring of Fire", a:"Johnny Cash"}
    ],
    'Prestidigitation': [
      {t:"No diggity, no doubt—this mess just checked out; sparkle flex, room says 'wow'.", s:"No Diggity", a:"Blackstreet"},
      {t:"Ice, ice, baby—chill that drink; frost on the rim with a wink.", s:"Ice Ice Baby", a:"Vanilla Ice"},
      {t:"Another one bites the dust—crumbs be gone; shine is on, in glam we trust.", s:"Another One Bites the Dust", a:"Queen"},
      {t:"Pour some sugar on me—just a dash; flavor unlock, chef's kiss splash.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
      {t:"Beat it—grime, beat it; make it clean, you can't conceive it.", s:"Beat It", a:"Michael Jackson"},
      {t:"Smooth operator—polish and preen; leaving the scene like a glossy magazine.", s:"Smooth Operator", a:"Sade"},
      {t:"Don't stop me now—I'm having such a clean time; tidy so prime, cleaning's sublime.", s:"Don't Stop Me Now", a:"Queen"},
      {t:"Brass monkey—that funky monkey; chill the drink, clink the clink, get funky.", s:"Brass Monkey", a:"Beastie Boys"},
      {t:"Shake it off—dust and grime; prestidigitation's prime time.", s:"Shake It Off", a:"Taylor Swift"},
      {t:"Uptown funk you up—clean that mess; sparkle flex, impress.", s:"Uptown Funk", a:"Bruno Mars"},
      {t:"I'm too sexy for this shirt—and this stain; prestidigitation's domain.", s:"I'm Too Sexy", a:"Right Said Fred"},
      {t:"Material girl—but make it clean; prestidigitation's the queen.", s:"Material Girl", a:"Madonna"}
    ],
    'Vicious Mockery': [
      {t:"You're so vain, you probably think this spell's about you—and you're right; that ego's heavy, good night.", s:"You're So Vain", a:"Carly Simon"},
      {t:"U can't touch this—accuracy, dignity, competence; all on the 'no' list, hence.", s:"U Can't Touch This", a:"MC Hammer"},
      {t:"Smells like teen spirit—aim like it too; here we are now, entertain you.", s:"Smells Like Teen Spirit", a:"Nirvana"},
      {t:"Every breath you take, your hands will shake; every move you make, another mistake.", s:"Every Breath You Take", a:"The Police"},
      {t:"I get knocked down, but you stay down—gravity loves you.", s:"Tubthumping", a:"Chumbawamba"},
      {t:"Never gonna give you up—on roasting you; crowd sings along while you boo-hoo.", s:"Never Gonna Give You Up", a:"Rick Astley"},
      {t:"Under pressure—your rolls express; crumble in style, fail with finesse.", s:"Under Pressure", a:"Queen & David Bowie"},
      {t:"Oops!... I did it again—missed, that is; your aim's a trend I can't defend.", s:"Oops!... I Did It Again", a:"Britney Spears"},
      {t:"Bad Romance—with accuracy; your aim's a tragedy, failure's your specialty.", s:"Bad Romance", a:"Lady Gaga"},
      {t:"Behind blue eyes, your failure cries—no one knows what it's like to be the mocked guy.", s:"Behind Blue Eyes", a:"The Who"},
      {t:"Even Mystra's Weave rejects you—and she's pretty forgiving.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"Elminster called—he wants his apprentice back; something about 'basic competence.'", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"All the single ladies—all the single misses; your aim's dismissed, no kisses.", s:"Single Ladies", a:"Beyoncé"},
      {t:"I'm a survivor—but you're not; keep trying, you're getting hot… at failing.", s:"Survivor", a:"Destiny's Child"},
      {t:"Bad guy—but make it worse; your villainy's a curse.", s:"Bad Guy", a:"Billie Eilish"},
      {t:"Sorry not sorry—for roasting you; it's what I do.", s:"Sorry Not Sorry", a:"Demi Lovato"},
      {t:"Truth hurts—so does this burn; lesson learned, no return.", s:"Truth Hurts", a:"Lizzo"},
      {t:"Even Vecna's hand is giving you the finger—and he's missing fingers.", s:"D&D Lore", a:"Mockery"}
    ],
    'Bane': [
      {t:"Under pressure—tiny numbers squeal; welcome to -1, that's the deal.", s:"Under Pressure", a:"Queen & David Bowie"},
      {t:"With or without you—without's the move; your bonuses packed to groove.", s:"With or Without You", a:"U2"},
      {t:"Paint it black—your odds, your mood; weekend plans? Also screwed.", s:"Paint It Black", a:"The Rolling Stones"},
      {t:"Livin' on a prayer—whiffin' on a prayer; fate says 'no', beware.", s:"Livin' on a Prayer", a:"Bon Jovi"},
      {t:"Bad moon rising—bad rolls rising; stay indoors, luck's downsizing.", s:"Bad Moon Rising", a:"Creedence Clearwater Revival"},
      {t:"Nothing else matters—except these debuffs; sad trombone plus cuffs.", s:"Nothing Else Matters", a:"Metallica"},
      {t:"Behind blue eyes, the penalty lies—no one knows what it's like to roll with these dice.", s:"Behind Blue Eyes", a:"The Who"},
      {t:"Even Kelemvor's scales tip against you—and he's impartial.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"Toxic—your rolls, your vibe; debuff tribe, no jive.", s:"Toxic", a:"Britney Spears"},
      {t:"I'm a mess—but you're a disaster; bane's your master.", s:"I'm a Mess", a:"Bebe Rexha"},
      {t:"Problem—yeah, you're one; bane's begun, no fun.", s:"Problem", a:"Ariana Grande"},
      {t:"Even Asmodeus is disappointed—and he's the Lord of Hell.", s:"D&D Lore", a:"Mockery"}
    ],
    'Command': [
      {t:"Stop! In the name of love—then turn around; walk away, leave this battleground.", s:"Stop! In the Name of Love", a:"The Supremes"},
      {t:"Go your own way—specifically away; heel-toe shuffle, obey.", s:"Go Your Own Way", a:"Fleetwood Mac"},
      {t:"Hit the road, Jack—and don't you come back; hit the track, don't look back.", s:"Hit the Road Jack", a:"Ray Charles"},
      {t:"Walk this way—away; this path ain't your runway.", s:"Walk This Way", a:"Aerosmith"},
      {t:"Jump—might as well jump… into prone; gravity's calling on the stone.", s:"Jump", a:"Van Halen"},
      {t:"The Harpers would be proud—if they weren't busy ignoring you.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"Sit down, be humble—floor's your throne; command's shown, you're prone.", s:"HUMBLE.", a:"Kendrick Lamar"},
      {t:"You need to calm down—specifically, sit; command's hit, that's it.", s:"You Need to Calm Down", a:"Taylor Swift"},
      {t:"Stop! Hammer time—can't touch this; command's bliss, dismiss.", s:"U Can't Touch This", a:"MC Hammer"},
      {t:"Even a goblin would follow orders better—and they're chaotic evil.", s:"D&D Lore", a:"Mockery"}
    ],
    'Faerie Fire': [
      {t:"I can see clearly now—the glow is on; stealth clocked out, stealth is gone.", s:"I Can See Clearly Now", a:"Johnny Nash"},
      {t:"Every breath you take—we'll be watching you—because you're lit up too.", s:"Every Breath You Take", a:"The Police"},
      {t:"Mr. Brightside—now you're outlined; tutorial highlight, perfectly timed.", s:"Mr. Brightside", a:"The Killers"},
      {t:"Purple haze all around—the sneak is found; neon truth on battleground.", s:"Purple Haze", a:"Jimi Hendrix"},
      {t:"Sweet dreams are made of beams—outline schemes; target gleams.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
      {t:"Black hole sun—won't you come, darkness covers all; stealth undone, run.", s:"Black Hole Sun", a:"Soundgarden"},
      {t:"Who wants honey—as long as there's some money; float on up, magic's funny.", s:"Cherub Rock", a:"Smashing Pumpkins"},
      {t:"Even Drizzt couldn't hide from this—and he's pretty good at hiding.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"I see a red door—and I want it painted bright; faerie fire's light, no flight.", s:"Paint It Black", a:"The Rolling Stones"},
      {t:"Dancing in the dark—not anymore; neon core, stealth's tore.", s:"Dancing in the Dark", a:"Bruce Springsteen"},
      {t:"Light 'em up—like a Christmas tree; stealth's history, can't flee.", s:"Light 'Em Up", a:"Fall Out Boy"},
      {t:"Shine bright like a diamond—outline's prime; stealth's crime, caught in time.", s:"Diamonds", a:"Rihanna"},
      {t:"Even an invisible stalker would be visible—and they're literally invisible.", s:"D&D Lore", a:"Mockery"}
    ],
    'Healing Word': [
      {t:"Don't stop believin'—HP climb; hold on to that feelin', you'll be fine.", s:"Don't Stop Believin'", a:"Journey"},
      {t:"Lean on me—when you're not strong; here's some HP to carry on.", s:"Lean on Me", a:"Bill Withers"},
      {t:"I will survive—as long as I know how to heal, you'll thrive; that's the vibe.", s:"I Will Survive", a:"Gloria Gaynor"},
      {t:"Here I go again—lifting friends up again; chorus of life, amen.", s:"Here I Go Again", a:"Whitesnake"},
      {t:"With a little help from my words—you'll get by; hearts sync, heads high.", s:"With a Little Help from My Friends", a:"The Beatles"},
      {t:"Beat it—death, beat it; pulse on the two and four, believe it.", s:"Beat It", a:"Michael Jackson"},
      {t:"Stayin' alive—ah, ah, ah, ah—stayin' alive; HP dive—canceled, you thrive.", s:"Stayin' Alive", a:"Bee Gees"},
      {t:"Stronger—what doesn't kill you makes you stronger; healing power, no longer a goner.", s:"Stronger", a:"Kanye West"},
      {t:"I'm still standing—yeah, yeah, yeah; stand tall, heal all, better each day.", s:"I'm Still Standing", a:"Elton John"},
      {t:"Rise up—back on your feet; healing complete, defeat deleted.", s:"Rise Up", a:"Andra Day"},
      {t:"If everything could ever feel this real forever—HP restored, never sever.", s:"Everlong", a:"Foo Fighters"},
      {t:"Even Ilmater approves—and he's seen worse.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"Shake it off—death's grip; healing's trip, no slip.", s:"Shake It Off", a:"Taylor Swift"},
      {t:"I will always love you—and heal you too; HP's new, through and through.", s:"I Will Always Love You", a:"Whitney Houston"},
      {t:"Don't stop believin'—in healing power; HP's your tower, no cower.", s:"Don't Stop Believin'", a:"Journey"},
      {t:"Fix you—when you're broken; healing's spoken, no token.", s:"Fix You", a:"Coldplay"},
      {t:"Rise up—from the floor; healing's door, no more.", s:"Rise Up", a:"Andra Day"},
      {t:"Even a rust monster would appreciate this healing—and they don't appreciate anything.", s:"Blingus' Obsession", a:"Mockery"}
    ],
    'Crown of Madness': [
      {t:"Let's get retarded—in here; mind control's near, attack your peer.", s:"Let's Get Retarded", a:"The Black Eyed Peas"},
      {t:"I put a spell on you—and now you're mine; attack your friend, it's fine.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins"},
      {t:"Under my thumb—you're controlled; do as I say, be bold.", s:"Under My Thumb", a:"The Rolling Stones"},
      {t:"Master of puppets—pulling your strings; attack your allies, chaos brings.", s:"Master of Puppets", a:"Metallica"},
      {t:"Puppet on a string—I'm pulling you; do what I want, it's true.", s:"Puppet on a String", a:"Sandie Shaw"},
      {t:"Control—I've got it now; your mind's mine, take a bow.", s:"Control", a:"Janet Jackson"},
      {t:"Friends will be friends—but not today; you're attacking them, I say.", s:"Friends Will Be Friends", a:"Queen"},
      {t:"You're my best friend—but now attack them; mind control's gem.", s:"You're My Best Friend", a:"Queen"},
      {t:"Even a rust monster would be confused by this—and they're confused by everything.", s:"Blingus' Obsession", a:"Mockery"},
      {t:"I can't get no satisfaction—but mind control can; make them attack, it's the plan.", s:"(I Can't Get No) Satisfaction", a:"The Rolling Stones"},
      {t:"Don't stop believin'—in attacking your friend; mind control to the end.", s:"Don't Stop Believin'", a:"Journey"}
    ],
    'Silence': [
      {t:"Hello darkness, my old friend—shhh, we ghost again; quiet to the end.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
      {t:"Enjoy the silence—words are needless; footprints, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
      {t:"Hush, hush—keep it down now; silence's crown, no sound.", s:"Hush", a:"Deep Purple"},
      {t:"Quiet riot—silence's plot; magic's not, sound forgot.", s:"Quiet Riot", a:"Quiet Riot"},
      {t:"Shhh—silence is golden; magic's olden, sound's folden.", s:"Silence Is Golden", a:"The Tremeloes"},
      {t:"Yesterday—all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
      {t:"Turn down for what? Silence, that's what; magic's cut, sound's shut.", s:"Turn Down for What", a:"DJ Snake & Lil Jon"},
      {t:"You're like Prismeer's silence—confusing and slightly concerning.", s:"Blingus' Feywild Reference", a:"Mockery"},
      {t:"Even a banshee would be quiet—and that's saying something.", s:"D&D Lore", a:"Mockery"},
      {t:"The sound of silence—is the sound of victory; magic's history, spell's mystery.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
      {t:"Quiet storm—silence's form; magic's norm, sound's dorm.", s:"Quiet Storm", a:"Smokey Robinson"}
    ]
  };

  // Generators for Blingus' personality
  const battleCries = [
    "Let's see what this chaos brings!",
    "Time to make some noise!",
    "The road calls, and I answer!",
    "Bo would be proud of this one!",
    "All right, let's dance!",
    "Smoke and mirrors, here we go!",
    "The horizon's calling—time to answer!",
    "Chaos, meet my lute!",
    "Wanderlust strikes again!",
    "For Bo, for Zybilna, for the road!",
    "Watch this—it's gonna be a show!",
    "Another story in the making!",
    "Time to turn the page!",
    "Let's see what trouble we can find!",
    "The road never ends, but you might!",
    "Feywild energy, Material Plane problems!",
    "I've wandered realms for less!",
    "The Carnival taught me better than this!",
    "Time to write a new verse!",
    "Like a smoke ring—here and gone!",
    "Prismeer's got nothing on this!",
    "For every road I've left behind!",
    "Time to make Zybilna proud—wherever she is!",
    "The Feywild's wild, but I'm wilder!",
    "Another crossroads, another chance!",
    "Let's make this a song worth remembering!",
    "Bo's watching—better make it good!",
    "The Midnight Carnival's got nothing on us!",
    "Time to show why fairies shouldn't be underestimated!",
    "Another chapter, another battle, another story!"
  ];

  const insults = [
    "You're about as useful as a one-winged fairy in a hurricane.",
    "Your aim's so bad, even Vadania would cringe.",
    "I've seen smarter goblins—and I speak Goblin.",
    "You make Brawn's past trauma look like a tea party.",
    "Even Puck wouldn't hug you—and he hugs mimics.",
    "Your strategy has less planning than my last 'grab cigarettes' trip.",
    "You're the reason Bo taught me not to count on anyone.",
    "I've left marriages faster than you can land a hit.",
    "Your combat skills are like my attention span—nonexistent.",
    "You're so bad at this, even my smoke rings have better aim.",
    "If you were a road, I'd leave you behind in a heartbeat.",
    "Your performance makes my half-finished songs look like masterpieces.",
    "I've been more committed to things I walked away from.",
    "You're the villain equivalent of a detour sign—annoying but harmless.",
    "Even the Midnight Carnival would reject you—and they let in everyone.",
    "You fight like a confused displacer beast—and not the friendly kind!",
    "Your tactics are like my family life—nonexistent and quickly forgotten.",
    "I've seen more competence from a lost traveler asking for directions.",
    "You're about as threatening as a peaceful glade in the High Forest.",
    "Even Mr. Witch and Mr. Light would find you disappointing.",
    "Your combat form is like my commitment—shaky at best.",
    "I've negotiated with swan boatwomen who were more reasonable than you.",
    "You're the reason fey contracts have fine print—utterly unreliable.",
    "Your aim's worse than a fairy trying to hit a moving target while drunk.",
    "I've seen better strategy from a pack of blink dogs playing tag.",
    "You're like Prismeer's silence—confusing and slightly concerning.",
    "Even the Misplacer Beast finds your attempts pathetic—and it's playful!",
    "Your performance makes wandering aimlessly seem like a solid plan.",
    "I've seen more coordination from a carnival carousel breaking down.",
    "You're about as effective as trying to find Zybilna with no clues—which is actually what we're doing.",
    "Your skills are like my last relationship—briefly promising, quickly abandoned.",
    "Even a random portal to the Feywild makes more sense than your tactics.",
    "You fight like you're trying to navigate the Material Plane without a map—aimlessly and with style, but zero effectiveness.",
    "I've seen more threatening things in a peaceful tavern—and I've seen a lot.",
    "Your combat prowess is like my sense of direction—wildly inconsistent.",
    "Even Bo's limp was more reliable than your accuracy.",
    "You're like a half-remembered tale—vague, confusing, and quickly dismissed.",
    "I've seen smarter decisions from someone choosing which road to walk—and that's saying something."
  ];

  const compliments = [
    "Not bad—almost as good as one of my songs.",
    "You're doing great—for someone who isn't me.",
    "That was... actually pretty good. I'm shocked too.",
    "Nice work! Reminds me of why I stick around sometimes.",
    "You're almost making me reconsider my 'don't count on anyone' philosophy.",
    "That was solid—like a good pack of cigarettes.",
    "You've got potential—unlike most people I've met.",
    "Not terrible! Which is high praise from me.",
    "You're growing on me—like a persistent weed.",
    "That was decent—and I don't say that often.",
    "You're making this journey almost worthwhile.",
    "Nice! Almost as impressive as my lute skills.",
    "You're doing better than expected—which says something.",
    "That wasn't bad—considering your starting point.",
    "You're proving me wrong—and I hate that, but respect it.",
    "Okay, fine—that was actually impressive. Don't let it go to your head.",
    "You've earned a place in my 'people I haven't abandoned yet' list—congrats.",
    "That move would make Bo nod approvingly—and he's hard to impress.",
    "Not bad for a non-bard. Almost makes me want to write a song about it.",
    "You're actually competent—which is rarer than finding Zybilna right now.",
    "That was solid enough I might actually remember it later—high praise.",
    "You fight like someone who's seen real battles—unlike most folks I've met.",
    "That was... actually strategic. Who taught you that?",
    "You're making me look good by association—I appreciate that.",
    "That deserves a round of applause—if I wasn't holding my lute.",
    "You're proving that sometimes, counting on people isn't the worst idea.",
    "That was almost as smooth as my best exit strategy—almost.",
    "You're doing better than I expected—and my expectations were... let's say low.",
    "That was competent enough to make me pause my wanderlust—briefly.",
    "You're earning your place in this story—and I don't say that lightly.",
    "That deserves to be remembered—unlike most things I encounter.",
    "You're actually contributing—which is more than I can say for most.",
    "That was good enough I might stick around for the next chapter.",
    "You're proving useful—a rare trait in my experience.",
    "That deserves a toast—if I had something other than my cigarette.",
    "You're making this adventure worth the road we traveled to get here.",
    "That was impressive—like a well-played tune, smooth and effective.",
    "You're actually making me glad I didn't wander off—yet.",
    "That deserves respect—and I don't give that out easily.",
    "You're proving that this party thing might have merit after all."
  ];

  const adultSpells = {
    'Druidcraft': [
      {t:"Let's get it on—grow strong; nature's feeling frisky, photosynth along.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
      {t:"Pour some sugar on me—nectar edition; bees buzz 'oh, honey' with ambition.", s:"Pour Some Sugar on Me", a:"Def Leppard", adult:true},
      {t:"Hot in herre—crack a window; blossoms blush, put on a show.", s:"Hot in Herre", a:"Nelly", adult:true}
    ],
    'Prestidigitation': [
      {t:"Push it—real good; stains slide off like bad decisions should.", s:"Push It", a:"Salt-N-Pepa", adult:true},
      {t:"My milkshake brings the shine to your gear; jealous? Thought so, dear.", s:"Milkshake", a:"Kelis", adult:true},
      {t:"You can leave your hat on—everything else looks freshly pressed and gone.", s:"You Can Leave Your Hat On", a:"Joe Cocker", adult:true}
    ],
    'Vicious Mockery': [
      {t:"Baby got back—story checks out; your aim packed up and moved out.", s:"Baby Got Back", a:"Sir Mix-a-Lot", adult:true},
      {t:"Like a virgin—touched for the first miss; awkward silence, hit or dis?", s:"Like a Virgin", a:"Madonna", adult:true}
    ],
    'Bane': [
      {t:"Sex on Fire? Nah—luck's on fire; only smoke alarms, no choir.", s:"Sex on Fire", a:"Kings of Leon", adult:true},
      {t:"Bad to the bone? Bad to the roll; mojo's low, that's the toll.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers", adult:true}
    ],
    'Command': [
      {t:"Get down on it—yes, down; the floor's your biggest fan in town.", s:"Get Down on It", a:"Kool & The Gang", adult:true},
      {t:"Back that thang up—toward the exit, friend; we love the energy you send.", s:"Back That Thang Up", a:"Juvenile", adult:true}
    ],
    'Faerie Fire': [
      {t:"I'm bringing sexy back—outline on track; stealth cracked with neon smack.", s:"SexyBack", a:"Justin Timberlake", adult:true},
      {t:"Lady in Red—more like LED; romance with visibility.", s:"Lady in Red", a:"Chris de Burgh", adult:true}
    ],
    'Healing Word': [
      {t:"Let's get it on—your heartbeat; slow jam lift you to your feet.", s:"Let's Get It On", a:"Marvin Gaye", adult:true},
      {t:"I kissed a girl—healed your world; don't ask the science, flags unfurled.", s:"I Kissed a Girl", a:"Katy Perry", adult:true}
    ],
    'Crown of Madness': [
      {t:"Let's get retarded—mind control's here; make them attack, no fear.", s:"Let's Get Retarded", a:"The Black Eyed Peas", adult:true},
      {t:"I put a spell on you—and now you do what I want; mind control's the hunt.", s:"I Put a Spell on You", a:"Screamin' Jay Hawkins", adult:true},
      {t:"I want your mind—and your body too; control's the game, it's true.", s:"I Want Your Sex", a:"George Michael", adult:true},
      {t:"Do what I want—attack your friend; mind control's the trend.", s:"Do What I Want", a:"Various", adult:true}
    ],
    'Silence': [
      {t:"Shhh—silence is golden; magic's olden, sound's folden—and so's your spell.", s:"Silence Is Golden", a:"The Tremeloes", adult:true},
      {t:"Hush, hush—keep it down now; silence's crown, no sound—magic's bound.", s:"Hush", a:"Deep Purple", adult:true}
    ]
  };

  const bardic = {
    'Attack Rolls': [
      {t:"We will, we will rock you—stomp-stomp-clap; land that smack, make 'em nap.", s:"We Will Rock You", a:"Queen"},
      {t:"Hit me with your best shot—then hit them; fire away and don't condemn.", s:"Hit Me With Your Best Shot", a:"Pat Benatar"},
      {t:"Eye of the tiger—lock the strike; heartbeat drums, go take that pike.", s:"Eye of the Tiger", a:"Survivor"},
      {t:"Another one bites the dust—now swing; let victory chorus sing.", s:"Another One Bites the Dust", a:"Queen"},
      {t:"Thunderstruck? Nah—thunder-smacked; roll that boom, get impact.", s:"Thunderstruck", a:"AC/DC"},
      {t:"Enter Sandman—tuck 'em in; lullaby crits with a wicked grin.", s:"Enter Sandman", a:"Metallica"},
      {t:"Welcome to the jungle—we got fun and pain; slice the chorus, lead the refrain.", s:"Welcome to the Jungle", a:"Guns N' Roses"},
      {t:"You give love a bad name—give villains the same; shot through the heart, endgame.", s:"You Give Love a Bad Name", a:"Bon Jovi"},
      {t:"Smells like victory spirit—here we are now, contain 'em; roll hot, sustain 'em.", s:"Smells Like Teen Spirit", a:"Nirvana"},
      {t:"Start me up—then never stop; engine's hot, drop the chop.", s:"Start Me Up", a:"The Rolling Stones"},
      {t:"Back in black—blade on track; raise the riff, make it crack.", s:"Back in Black", a:"AC/DC"},
      {t:"Sweet child o' mine—sweet crit o' time; line up the sight and shine.", s:"Sweet Child O' Mine", a:"Guns N' Roses"},
      {t:"Boom boom pow—extra oomph now; numbers bow, damage show.", s:"Boom Boom Pow", a:"The Black Eyed Peas"},
      {t:"T.N.T.—I'm dynamite; stack the dice, light the night.", s:"T.N.T.", a:"AC/DC"},
      {t:"No sleep til Brooklyn—no rest til this hit; swing the blade, don't quit, make it fit.", s:"No Sleep Til Brooklyn", a:"Beastie Boys"},
      {t:"I love rock and roll—put another coin in, baby; swing and strike, hit the groove, maybe.", s:"I Love Rock 'n' Roll", a:"Joan Jett"},
      {t:"Killing in the name—of bonus pain; roll the gain, break the chain.", s:"Killing in the Name", a:"Rage Against the Machine"},
      {t:"Bad to the bone—bad to their hit points; roll the tone, break the joints.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers"},
      {t:"Pour some sugar on me—sweeten the smack; bonus attack, no slack.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
      {t:"Don't stop believin'—in this crit; hold on to that feelin', make it hit.", s:"Don't Stop Believin'", a:"Journey"},
      {t:"Even Vecna would approve of this attack—and he's missing fingers.", s:"D&D Lore", a:"Mockery"}
    ],
    'Saving Throws': [
      {t:"I will survive—first I was afraid; now I'm fine, unafraid.", s:"I Will Survive", a:"Gloria Gaynor"},
      {t:"Stayin' alive—ah, ah, ah, ah; keep that beat, pass by harm.", s:"Stayin' Alive", a:"Bee Gees"},
      {t:"Don't fear the reaper—not today; more cowbell when we play.", s:"Don't Fear the Reaper", a:"Blue Öyster Cult"},
      {t:"We are the champions—no time for fails; hold that line, tip the scales.", s:"We Are the Champions", a:"Queen"},
      {t:"It's my life—and I ain't gonna lose it; steel the nerve and choose it.", s:"It's My Life", a:"Bon Jovi"},
      {t:"Hold on for one more roll—you got this; grit your teeth, don't miss.", s:"Hold On", a:"Wilson Phillips"},
      {t:"Beat it—danger, beat it; sidestep doom and leave it.", s:"Beat It", a:"Michael Jackson"},
      {t:"Take on me—challenge accepted; take on this save, protected.", s:"Take On Me", a:"a-ha"},
      {t:"Livin' on a prayer—one more point; clutch up now, anoint.", s:"Livin' on a Prayer", a:"Bon Jovi"},
      {t:"Under pressure—hold steady; breathe and pass, be ready.", s:"Under Pressure", a:"Queen & David Bowie"},
      {t:"I'm still standing—yeah, yeah, yeah; save complete, victory's free.", s:"I'm Still Standing", a:"Elton John"},
      {t:"Tubthumping—I get knocked down, then get up again; save that pain, win.", s:"Tubthumping", a:"Chumbawamba"},
      {t:"Shake it off—shake it off; save complete, no more grief.", s:"Shake It Off", a:"Taylor Swift"},
      {t:"I will survive—as long as I know how to save, I'll thrive.", s:"I Will Survive", a:"Gloria Gaynor"},
      {t:"Stronger—what doesn't kill you makes you stronger; save that danger, no longer.", s:"Stronger", a:"Kanye West"},
      {t:"Even a rust monster would fail this save—and they're pretty resilient.", s:"Blingus' Obsession", a:"Mockery"},
      {t:"Time distortion? More like time to pass this save—Prismeer style.", s:"Wild Beyond The Witchlight", a:"Mockery"},
      {t:"Even the hags couldn't stop you—and they stop everything.", s:"Wild Beyond The Witchlight", a:"Mockery"}
    ],
    'Skill — Persuasion/Performance/Deception': [
      {t:"Don't stop me now—I'm having a good time; say yes, sign the dotted line.", s:"Don't Stop Me Now", a:"Queen"},
      {t:"Sweet Caroline—good times never seemed so good… now nod; you should.", s:"Sweet Caroline", a:"Neil Diamond"},
      {t:"Come together—right now—over this deal; feels ideal.", s:"Come Together", a:"The Beatles"},
      {t:"Personal Jesus—reach out, touch faith in this pitch; we'll make you rich.", s:"Personal Jesus", a:"Depeche Mode"},
      {t:"The way you make me feel—approve the appeal; seal the deal.", s:"The Way You Make Me Feel", a:"Michael Jackson"},
      {t:"With or without you—with me is best; choose success, forget the rest.", s:"With or Without You", a:"U2"},
      {t:"Let's dance—put on your red shoes and advance; sign with a glance.", s:"Let's Dance", a:"David Bowie"},
      {t:"Never gonna give you up—on this plan; trust the band, be our fan.", s:"Never Gonna Give You Up", a:"Rick Astley"},
      {t:"All Star—hey now, you're an all-star; stamp that mark, go far.", s:"All Star", a:"Smash Mouth"},
      {t:"I want to hold your hand—shake on it, friend; deal to the end.", s:"I Want to Hold Your Hand", a:"The Beatles"},
      {t:"Smooth operator—silver tongue, criminal charm; no alarm.", s:"Smooth Operator", a:"Sade"},
      {t:"Uptown funk you up—charm 'em up; smooth talk, seal it up.", s:"Uptown Funk", a:"Bruno Mars"},
      {t:"Can't stop the feeling—charisma's real; deal's sealed, appeal.", s:"Can't Stop the Feeling!", a:"Justin Timberlake"},
      {t:"Even a goblin would be convinced—and they're chaotic evil.", s:"D&D Lore", a:"Mockery"},
      {t:"Your charm is more binding than a hag's contract—and that's saying something.", s:"Wild Beyond The Witchlight", a:"Mockery"},
      {t:"Even Prismeer's fey would fall for this—and they're immune to charm.", s:"Wild Beyond The Witchlight", a:"Mockery"}
    ],
    'Skill — Stealth/Sleight/Blend In': [
      {t:"Hello darkness, my old friend—shhh, we ghost again; quiet to the end.", s:"The Sound of Silence", a:"Simon & Garfunkel"},
      {t:"Enjoy the silence—words are needless; footprints, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
      {t:"Smooth criminal—Annie, are you okay? They won't be; unseen spree.", s:"Smooth Criminal", a:"Michael Jackson"},
      {t:"Every breath you take—no sound I make; watch me vanish in my wake.", s:"Every Breath You Take", a:"The Police"},
      {t:"I walk the line—quiet feet, quiet mind; shadows signed.", s:"I Walk the Line", a:"Johnny Cash"},
      {t:"Come as you are—leave as a rumor; slip past eyes with humor.", s:"Come As You Are", a:"Nirvana"},
      {t:"Where the streets have no name—neither do my tracks; I leave no facts.", s:"Where the Streets Have No Name", a:"U2"},
      {t:"Yesterday—all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
      {t:"Sneak like Drizzt in Menzoberranzan—but actually succeed.", s:"Forgotten Realms Lore", a:"Mockery"},
      {t:"Move like time distortion in Prismeer—here, then gone, then here again.", s:"Wild Beyond The Witchlight", a:"Mockery"},
      {t:"Stealth like a lost thing in the Witchlight Carnival—nobody notices until it's too late.", s:"Wild Beyond The Witchlight", a:"Mockery"}
    ],
    'Skill — Investigation/Perception/Insight': [
      {t:"I still haven't found what I'm looking for—oh wait, right here; clue crystal clear.", s:"I Still Haven't Found What I'm Looking For", a:"U2"},
      {t:"I can see clearly now—the clue is found; truth unbound.", s:"I Can See Clearly Now", a:"Johnny Nash"},
      {t:"Every little thing she does is magic—and mildly suspicious; noted, officious.", s:"Every Little Thing She Does Is Magic", a:"The Police"},
      {t:"Sweet dreams are made of this—motives, means, and evidence; case in bliss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
      {t:"Message in a bottle—answers on the shore; I read more.", s:"Message in a Bottle", a:"The Police"},
      {t:"Man in the mirror—see the tell; truth rings the bell.", s:"Man in the Mirror", a:"Michael Jackson"},
      {t:"Changes—turn and face the strange; pattern shift within range.", s:"Changes", a:"David Bowie"},
      {t:"Under pressure—cracks reveal the seam; I thread the scheme.", s:"Under Pressure", a:"Queen & David Bowie"}
    ],
    'Skill — Athletics/Acrobatics/Climb/Run': [
      {t:"Jump—might as well jump; vault that wall with a thump.", s:"Jump", a:"Van Halen"},
      {t:"Born to run—so run like you mean; blaze that scene.", s:"Born to Run", a:"Bruce Springsteen"},
      {t:"Don't stop me now—'cause I'm having such a good climb; reach on time.", s:"Don't Stop Me Now", a:"Queen"},
      {t:"Eye of the tiger—balance on the wire; legs on fire.", s:"Eye of the Tiger", a:"Survivor"},
      {t:"Highway to Hell—on ramp to speed; overtake with heed.", s:"Highway to Hell", a:"AC/DC"},
      {t:"I like to move it—move it; now you move it too; parkour debut.", s:"I Like to Move It", a:"Reel 2 Real"},
      {t:"Can't stop the feeling—feet start dealing; hop, skip, ceiling.", s:"Can't Stop the Feeling!", a:"Justin Timberlake"},
      {t:"Walk this way—run that way; hurdle clean, no delay.", s:"Walk This Way", a:"Aerosmith"},
      {t:"Beat it—fatigue, beat it; second wind—repeat it.", s:"Beat It", a:"Michael Jackson"},
      {t:"Back in black—track attack; sprint the line, don't look back.", s:"Back in Black", a:"AC/DC"}
    ],
    'Initiative': [
      {t:"Start me up—and never stop; first to pop, top of the crop.", s:"Start Me Up", a:"The Rolling Stones"},
      {t:"Ready or not—here we come; you can't hide, beat that drum.", s:"Ready or Not", a:"Fugees"},
      {t:"Wake me up before you go-go—I'm already gone; blink and I'm on.", s:"Wake Me Up Before You Go-Go", a:"Wham!"},
      {t:"Here I go again—on my own; front of the line, full-blown.", s:"Here I Go Again", a:"Whitesnake"},
      {t:"Let's dance—this party starts now; first swing, take a bow.", s:"Let's Dance", a:"David Bowie"},
      {t:"Billie Jean—light on my feet; step to the front, bring heat.", s:"Billie Jean", a:"Michael Jackson"},
      {t:"Gimme shelter—nah, give me turn one; battle's begun.", s:"Gimme Shelter", a:"The Rolling Stones"},
      {t:"You really got me—spooled and primed; I'm on time.", s:"You Really Got Me", a:"Van Halen"},
      {t:"Brass monkey—funky and spry; jump the line, get mine, here's why.", s:"Brass Monkey", a:"Beastie Boys"},
      {t:"No sleep til Brooklyn—first to the fray; action starts now, no delay, let's play.", s:"No Sleep Til Brooklyn", a:"Beastie Boys"},
      {t:"25 or 6 to 4—waiting for the turn; clock strikes now, action's earned, here we go.", s:"25 or 6 to 4", a:"Chicago"}
    ],
    'Combat Inspiration — Damage': [
      {t:"Shot through the heart—and you're to blame; bonus pain, write my name.", s:"You Give Love a Bad Name", a:"Bon Jovi"},
      {t:"Boom boom pow—extra oomph now; numbers bow.", s:"Boom Boom Pow", a:"The Black Eyed Peas"},
      {t:"Another one bites the dust—plus a little thrust; add that gust.", s:"Another One Bites the Dust", a:"Queen"},
      {t:"Killing in the name—of bonus flame; damage game.", s:"Killing in the Name", a:"Rage Against the Machine"},
      {t:"T.N.T.—I'm dynamite; stack the dice, light the night.", s:"T.N.T.", a:"AC/DC"},
      {t:"Thunderstruck—amp it up; roll the boom, overflow the cup.", s:"Thunderstruck", a:"AC/DC"},
      {t:"Welcome to the jungle—damage that rumbles; health bar crumbles.", s:"Welcome to the Jungle", a:"Guns N' Roses"},
      {t:"Back in black—hit like a track; add that whack.", s:"Back in Black", a:"AC/DC"},
      {t:"Pour some sugar on me—sweeten the smack; damage stack.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
      {t:"Bad to the bone—bad to their hit points; bonus zone.", s:"Bad to the Bone", a:"George Thorogood & The Destroyers"},
      {t:"I wanna rock and roll all night—and party every day; bonus dice, fight the fight, we play.", s:"Rock and Roll All Nite", a:"Kiss"},
      {t:"What is it? It's epic—damage drops, health bar flips it; big hit, can't miss it.", s:"Epic", a:"Faith No More"}
    ],
    'Combat Inspiration — AC/Defense': [
      {t:"U can't touch this—hammer time; denied that crime.", s:"U Can't Touch This", a:"MC Hammer"},
      {t:"Hit me with your best shot—blocked; fire away—still shocked.", s:"Hit Me With Your Best Shot", a:"Pat Benatar"},
      {t:"I get knocked down—not today; you'll fail again—go away.", s:"Tubthumping", a:"Chumbawamba"},
      {t:"Stop! In the name of love—nope, not this blow; guard the glow.", s:"Stop! In the Name of Love", a:"The Supremes"},
      {t:"Under pressure—armor spine; hold the line, you're fine.", s:"Under Pressure", a:"Queen & David Bowie"},
      {t:"Don't stop believin'—in AC; trust in me.", s:"Don't Stop Believin'", a:"Journey"},
      {t:"Beat it—attack, beat it; parry the beat, defeat it.", s:"Beat It", a:"Michael Jackson"},
      {t:"I'm still standing—yeah, yeah, yeah; hit denied, au contraire.", s:"I'm Still Standing", a:"Elton John"},
      {t:"You shook me all night long—but not this strike; armor's right.", s:"You Shook Me All Night Long", a:"AC/DC"},
      {t:"Iron Man—AC so grand; your blade can't land.", s:"Iron Man", a:"Black Sabbath"}
    ]
  };

  // Vicious Mockery: Blingus' Battle Burns (Party Callbacks + Foe Packs)
  const mockery = {
    'Quick Hits': [
      {t:"I've seen smarter rocks—and they were part of a wall.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your threat level is 'ambient.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not the sharpest knife—you're the safety spoon.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your shadow looks disappointed.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've met puddles with more depth.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're a speed bump with delusions of grandeur.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your plan needs a plan. And parents.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'd roast you harder, but I don't overkill cantrips.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the villain equivalent of background music.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Keep trying—failure needs a champion.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your critical thinking just failed spectacularly.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen mimics with better acting skills than your combat moves.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your strategy is a tangled mess where all paths lead to failure.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your attacks have commitment issues.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're competing in a contest of incompetence—and losing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not the Tarrasque—I checked. Twice. (Why am I checking?)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If the Tarrasque showed up right now, it would ignore you. That's how bad you are.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least you're not a rust monster. (I keep my gear oiled. Just in case. Always.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're less threatening than a rust monster—and those things are terrifying! (Don't touch my buckles!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your attack roll was so low, it's trying to dig to the center of the earth.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen gelatinous cubes with better decision-making skills.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your strategy is like a mimic—looks like a plan, but it's actually just disappointment.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your critical failures are failing critically.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the reason bards write cautionary tales.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your AC is lower than your self-esteem—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'd feel bad roasting you, but you're already well-done.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not the Tarrasque—I checked. Three times. (I'm not obsessed, I'm thorough!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least rust monsters have a purpose—what's yours?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your performance is shorter than my attention span—and I'm easily distracted.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't hit the broad side of a barn—and I've seen you try.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your aim is like your love life—consistently disappointing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen more action from a training dummy—and they don't move.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your combat skills are like your social skills—nonexistent.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even the Witchlight Carnival would reject you—and they let hags in.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're about as magical as a carnival ticket stub—and just as useful.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your contract with failure is more binding than anything in Prismeer.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Bavlorna's swamp has more charm than you—and it's literally a swamp.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the lost thing nobody's looking for.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your time distortion is just you moving slower than everyone else.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Endelyn's puppets have more personality—and they're made of string.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Skabatha's toys are more threatening than you—and they're for children.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the fey equivalent of a carnival game nobody wins.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your deal is worse than a hag's bargain—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Brawn O’Neil — Dwarven Monk": [
      {t:"Brawn warms up with problems tougher than you; he calls them pebbles.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His fists have names—‘Reason’ and ‘Consequences’—meet both.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re about to learn what ‘stunning strike’ feels like: educational.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He drinks, he thinks, he swings—only one of those hurts you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Dwarven stone’s got more give than your jaw.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You telegraph so hard even Brawn’s beard dodged.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Step of the Wind? You’ll step off your pride.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Flurry of Blunders—performed by you, judged by Brawn.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brawn's beard has seen more action than you—and it's just facial hair.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He could stun you with a disappointed look—and he's trying.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brawn's ale has better aim than you—and it's a liquid.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Brawn's hangover hits harder than your best attack.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His fists have more staying power than your entire combat presence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brawn's technique is flawless—unlike yours, which is flaccid.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He finishes what he starts—something you clearly don't understand.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brawn knows how to handle his weapon—unlike you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His strikes have more staying power than your entire existence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brawn could satisfy a dragon—you couldn't satisfy a goblin.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His technique is hard—yours is flaccid.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Puck Pinewhistle — Fairy Sorcerer": [
      {t:"Puck’s sparkles hit harder than your best ideas.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He bends the weave; you trip over it.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your charisma check just failed against his wingspan.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He twinspells shade; congratulations, you got the deluxe edition.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even his cantrips have better timing than your life choices.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Wild about his magic, mild about you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Metamagic? He enhances. You… enhance regret.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck sneezes glitter; you choke on defeat.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck's sparkles have better aim than you—and they're just sparkles.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Puck's failed spells are more impressive than your successes.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck could twinspell 'disappointment' and you'd still be the target.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His wingspan covers more ground than your entire combat strategy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck's magic has more impact than your entire existence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He knows how to make things last—unlike your attacks.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck's sparkles have more penetration than your best effort.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His spells satisfy—yours just disappoint.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck knows how to make things last—you finish before you start.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His magic has more penetration than your best effort.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck's sparkles hit harder than your entire performance.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He knows how to finish—you don't even know how to begin.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Vadania Amakiir — Elven Ranger": [
      {t:"Vadania tracks problems to their source; hello, source.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your stealth is a love letter to her arrows.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even her footprints leave less trace than your excuses.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Her bowstring fears commitment; it only ties to your fate.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Favored enemy: incompetence—and you’re endangered.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The forest files a noise complaint when you move.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re the kind of quarry that tags itself.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She aims where you're going; you never get there.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Vadania's arrows have better tracking than your life choices.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even her missed shots are closer than your hits.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She could track you by your incompetence—and she probably is.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Her bowstring has more tension than your entire combat presence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Vadania knows how to hit her target—unlike you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Her arrows have more staying power than your attacks.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She finishes what she starts—something you've never managed.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Vadania's aim is always on point—yours is always off.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She knows how to hit her target—you can't even find yours.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Her arrows have more staying power than your entire performance.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Vadania finishes what she starts—you finish before you start.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She could satisfy a dragon—you couldn't satisfy a training dummy.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Blingus — Signature Lines": [
      {t:"I'm Blingus; the way is far, your end is near.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My words cut deep; the blade is economy-sized.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Wayfarer rule: mock first, loot later.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I travel light—your pride will, too.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I don't cast shade; I curate it.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Blink and you'll miss me; breathe and you'll miss again.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My wings hum in key; your screams are off-pitch.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I give directions: down, out, and stay gone.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque would find you underwhelming. (I mean, theoretically. Not that I've thought about it.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not worth the Tarrasque's time. (I'm not obsessed, I'm just… aware.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If the Tarrasque showed up right now, I'd be prepared. (What? No reason.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Stay away from my buckles! (What? Rust monsters could be anywhere!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I keep all my metal polished. Always. (You can never be too careful with rust monsters.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least you're not a rust monster. (Those things are nightmares! Absolute nightmares!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'm Blingus—small package, big attitude, your funeral.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My wingspan may be small, but my insults are economy-sized.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I don't need to be tall to look down on you—you're doing that yourself.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque would step on you and not notice. (Not that I've thought about this.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I keep my gear polished because rust monsters are everywhere. (They are! I've seen them! Maybe!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not worth the Tarrasque's time—but you're worth mine, apparently.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Stay away from my buckles! (Rust monsters! They're real! Probably!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'm Blingus—small package, big attitude, your funeral.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My words cut deep; the blade is economy-sized, but the impact is huge.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I may be small, but I know how to finish what I start—unlike you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Size doesn't matter when you know how to use it—and you clearly don't.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've got more stamina in my pinky than you have in your entire body.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My insults last longer than your attacks—and they're more satisfying.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I know how to hit my target—something you've never mastered.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I may be small, but I know how to use what I've got—unlike you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My insults have more staying power than your entire existence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I finish what I start—you don't even know how to start.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I could satisfy a dragon—you couldn't satisfy a goblin.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My technique is flawless—yours is flaccid.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I know how to make things last—you finish before you begin.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"My performance is always satisfying—yours is always disappointing.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Dragons': [
      {t:"Big wings, small self-control—compensating, are we?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your hoard called; it wants smarter company.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"All that ancient wisdom and you still monologue.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You breathe failure in a variety of flavors.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Scales for days, judgment for none.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The only treasure here is the silence when you stop talking.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your breath weapon is a suggestion—and it's suggesting you stop.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"A thousand years of existence and you still haven't learned to dodge.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your lair action is 'exist loudly'—impressive range, zero impact.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the dragon equivalent of a participation trophy—shiny, empty, mandatory.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Tiamat's kids are embarrassed—and they're chaotic evil.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Bahamut called—he wants to revoke your draconic license.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Cult of the Dragon wants a refund—from you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're about as threatening as… wait, is that the Tarrasque? No? Carry on.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque could step on you and not notice. (I'm just saying. Hypothetically.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your breath weapon is less threatening than my morning breath—and I'm a fairy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"A dragon's hoard has more value than your entire existence—and it's just gold.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even chromatic dragons are embarrassed for you—and they're evil.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your lair action is 'exist loudly'—impressive range, zero impact.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Bahamut called—he wants to revoke your draconic license. (I'm not making this up!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Cult of the Dragon wants a refund—from you specifically.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your breath weapon is less satisfying than a cold bath.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't satisfy a dragon's hoard—and it's inanimate.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your performance is shorter than a kobold's attention span.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a dragon's scales have more hardness than your attacks.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your breath weapon is less satisfying than a cold shower.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't satisfy a dragon's hoard if it was paid to pretend.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your performance is shorter than a kobold's... attention span.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a dragon's scales are harder than your... everything.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your lair action is 'exist loudly'—but your performance is quiet.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You finish faster than a dragon's breath weapon—and just as disappointing.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Nobles': [
      {t:"That title is doing all the heavy lifting.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pedigree reads like a cautionary tale.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I’ve seen coin purses with more backbone.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You command like a suggestion no one heard.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your banner should read: ‘We Tried.’", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your servants deserve better management.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your title is doing all the work—just like your servants.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You command like you perform—weakly and without satisfaction.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pedigree is longer than your attention span—and just as disappointing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't satisfy your own court—and they're paid to pretend.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your reign is shorter than your sword—and just as ineffective.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pedigree is longer than your... attention span.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You finish faster than your servants can say 'yes, my lord'.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your performance is shorter than your sword—and just as disappointing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't satisfy your own court if they were paid to pretend.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your title is doing all the work—just like your servants.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You command like you perform—weakly and without satisfaction.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Liches': [
      {t:"Congratulations on immortality; shame about the personality.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your phylactery hides because it’s embarrassed to be seen with you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re proof necromancy can’t revive taste.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"All that time and you still failed your fashion save.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re a skeleton with tenure and no lectures worth hearing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your lair has better vibes six feet under.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your phylactery is more satisfied than anyone you've ever met.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You've been undead for centuries and still can't finish anything.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your magic is flaccid—just like your personality.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even necromancy couldn't revive your performance—and it raises the dead.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You've had eternity to practice and you're still terrible.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your phylactery has more staying power than your entire existence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your magic is flaccid—just like your... everything.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You finish faster than a zombie's attention span.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your technique is deader than you are—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Undead': [
      {t:"I've met livelier corpses—and they were you moments ago.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your bones rattle like coins in a broke bard's cup.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"A zombie would return your brain as defective.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You smell like yesterday's bad decision.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Rest in pieces; I'll handle the arrangement.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even necrotic damage avoids the redundancy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your resurrection was a typo—sorry, we meant 'regret.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Death saved you the best part—which was leaving.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're so dead, even your motivation expired.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The only thing you're raising is questions about your life choices.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Kelemvor's sorting you into the 'try again later' pile.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Myrkul's minions passed on you—and they're not picky.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Wall of the Faithless has better company than you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Eye of the Beholder's skeletons have better coordination.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Demons & Devils': [
      {t:"Contracts? I prefer results; you prefer loopholes.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You tempt like a stale pastry—dry and disappointing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even hell won't claim your customer service.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Big horns, tiny ideas.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You had one job: be scary. Try again.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your infernal plan's just a waffle of maybes.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Asmodeus filed a complaint—you're embarrassing the Nine Hells.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Blood War needs soldiers—you're not invited.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Zariel's rejects rejected you.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Giants': [
      {t:"You're tall enough to miss from farther away.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Brains didn't scale with the rest, did they?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You swing like you're gardening—wide, slow, and tragic.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your shadow trips over its own feet.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The ground shakes because it's laughing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're a siege tower with stage fright.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're big, but you're no Tarrasque. (Not that I'm measuring. Or tracking it.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If the Tarrasque woke up right now, it would ask 'where's the threat?' and ignore you.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Goblins & Kobolds': [
      {t:"Small, loud, and wrong—triple threat.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even traps wave you through out of pity.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You hoard junk; we hoard victories.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Come back when your courage isn't on loan.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your boss uses you as disposable advice.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your greatest weapon is peer pressure, and it's failing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your tribe's survival strategy is 'hope the adventurers are tired.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the goblin equivalent of a participation ribbon—small, pointless, everywhere.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your war cry sounds like a suggestion with stage fright.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your shinies are disappointed in you.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Constructs': [
      {t:"I've met gears with more drive.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your maker left a bug report: 'Does not compute competence.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Hinges squeak; you squeal.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even rust monsters pass you like an unopened letter.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You were built to last—and to disappoint.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Processing… error: purpose not found.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Wait—are you metal? Because if you're metal and there are rust monsters nearby, I need to know! (I'm just asking! For safety!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're less scary than rust monsters. (Nothing is scarier than rust monsters. Nothing!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Beasts': [
      {t:"Bad dog. Worse strategy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your roar says 'warning,' your aim says 'oops.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Nature called—you're the hold music.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen housecats with better battlefield awareness.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Heel. No? Then kneel.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Fetch this L.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your primal instinct is 'run away'—evolution's working.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your feral roar comes with a question mark.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the beast equivalent of a sternly worded letter.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pack leader is having second thoughts—and third, and fourth.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque is a beast. You're… something else. (Not that I'm comparing. Often.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least you're not a rust monster! (Those things destroy everything! My beautiful buckles! My lovely clasps!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If you were a rust monster, I'd already be three miles away. (I'm not paranoid, I'm prepared!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Bandits & Mercs': [
      {t:"For hire and still overpaid.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your resume is just 'missed opportunities.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You ambush like a parade.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'd say 'stick 'em up,' but you already did—your hands.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your fence won't buy what you're selling.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Take the bounty on yourselves; it's the only sure payout.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Zhentarim rejected you—and they recruit anyone.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Waterdeep's City Watch laughs at your technique.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You'd fail to rob a merchant in Luskan—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your party would've ditched you in Curse of the Azure Bonds—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Caster-Bait': [
      {t:"Are those somatic components or interpretive flailing?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your spell slots are as empty as your ambitions.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Counterspell? No need—your magic counters itself.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The weave rejects you out of professional courtesy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your familiar trades you for store credit.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen cantrips with more commitment.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your arcane focus is focusing on what went wrong.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your spellbook has a 'missed connections' section—it's all failures.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Magic missile? More like magic suggestion—and it's suggesting you stop.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your concentration check is a cry for help disguised as spellcasting.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Red Wizards of Thay wouldn't recruit you—and they're desperate.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Khelben Blackstaff's apprentices have better spell selection.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Mystra's Weave has a restraining order—against your magic.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You cast like someone who learned magic from Candlekeep's rejected applicants.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your spell menu is empty—even Eye of the Beholder gives you options.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Azure Bonds would reject you—and they bond to anyone.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Martial Mockery': [
      {t:"Nice stance. Is 'wobble' a new school?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You telegraph so hard I could forward the message.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Parry? You mean panic with extra steps.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Is your weapon enchanted with 'underperform?'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've seen drunk goblins dodge better.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Try aiming where I am, not where your hopes are.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a blindfolded archer is more accurate.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your battle record reads like a list of failures—all misses.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least your weapon isn't rusted. (Rust monsters could be anywhere! I check mine daily!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You swing like you're afraid of rust monsters. (Wait, that's reasonable. Never mind.)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Boss & Leader Burns': [
      {t:"Is that a command or a wish with stage fright?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your minions unionized for better leadership.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Inspire fear first, speeches later.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your villain arc is filler content.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your legacy will be an asterisk.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Conquer the urge to monologue—start there.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Szass Tam's apprentices have better leadership skills—and they're liches.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Manshoon's clones are better leaders—and they're unstable.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're weaker than a training dummy.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Azure Bonds wouldn't even bother controlling you—too much work.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque would be a better boss than you. (Just an observation. Not that I've thought about it.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If you were the Tarrasque, I'd be terrified. You're not. (I'm fine. Everything's fine.)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Skill Checks & Dice': [
      {t:"That was a bold choice—rolling performance with your face.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your stealth is louder than your opinions.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You failed your insight check on your own motives.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You rolled initiative and still showed up late.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your passive perception is actively embarrassed.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Acrobatics? More like academic interest in falling.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your dice are in a committed relationship—with failure.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your natural 1 has natural 1s—it's a family tradition.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You rolled so low, the dice are filing for unemployment.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your proficiency bonus is currently on sabbatical.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even random chance favors you more than your own skill.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your saves are worse than random roadside encounters.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Hygiene & Style (PG-13)': [
      {t:"You smell like an owlbear's regret.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"That haircut looks like an apology you never finished.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your fashion sense is hostile architecture.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your cape does more heavy lifting than your heroics.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Those boots say 'ran away a lot.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your aesthetic is 'found in a ditch.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your metal gear looks like rust monsters got to it. (Oh no! Are rust monsters nearby?! I need to check my buckles!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I polish my belt buckles three times a day. (Rust monsters don't wait for convenient times!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Mind & Wit': [
      {t:"Your thoughts arrive out of breath.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the human equivalent of delayed reactions.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If ignorance is bliss, you must be euphoric.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your brain has stopped processing and it's stuck.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I've met riddles with clearer answers.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your inner monologue needs subtitles.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque could outthink you. (It's a primal force of destruction, but still.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your strategy is worse than fighting the Tarrasque head-on. (Not that I've… never mind.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You think like someone who's never had their favorite buckles destroyed by rust monsters. (The horror! The absolute horror!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Divine & Doomsday': [
      {t:"Even your gods dodge your prayers.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Prophecy called—you're the twist nobody wanted.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Fate wrote you as a footnote and then misspelled it.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your destiny is to be someone else's backstory.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The only omen you carry says 'try again later.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your miracle is surviving my patience.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Cyric's followers think you're too chaotic.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Time of Troubles ended—but your relevance never started.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Shar's shadows avoid you—too dark, even for her.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Spellplague wouldn't take you—and it took everything.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque's awakening would be more interesting than your existence. (Just hypothetically speaking.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If the Tarrasque destroyed the world, you'd still be the least threatening thing here.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Roguish Razz': [
      {t:"Your sneak attack is more sneak than attack.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Subtlety isn't your dump stat—it's a restraining order.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Locks open out of pity to get rid of you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your disguise looks like a crime scene sketch.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even traps wave you through.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You couldn't backstab a chair.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even the Shadow Thieves wouldn't recruit you—and they're shady.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You'd fail to sneak into Baldur's Gate—and the guards are sleeping.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Ranger & Nature': [
      {t:"Even the forest wants you to get lost.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your favored enemy is 'competence.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Animals hear you coming and file complaints.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your bowstring fears commitment to you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You track like a drunk cartographer.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Foraging? You found disappointment in abundance.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Prismeer's forests reject you—and they're chaotic neutral.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Warlock & Weird': [
      {t:"Your patron's refund is pending.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Pact of the Blade? More like Pact of the Butter Knife.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your eldritch blast has separation anxiety.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your book of shadows is a coloring book.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a hag's pact is better than your deal—and they're notorious.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pact boon is 'unsubscribe.'", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Barbarian Banter': [
      {t:"Is that rage or just poor impulse control?", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re as subtle as a drum solo in a library.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Reckless Attack? Bold to announce your brand.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You threaten like a storm that forgot the rain.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You make smashing look like a cry for help.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Try raging against expectations instead.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Bard-on-Bard Crime': [
      {t:"I've heard better notes from falling cookware.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your rhythm is a war crime in 4/4.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your verse rhymes 'bad' with 'worse.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Inspiration? You couldn't motivate a mimic to open.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your solo is a group effort—and they declined.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your audience claps when you stop.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your lute is considering early retirement—and a restraining order.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your performance check rolled a 'please stop.'", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Fey & Hags (Wild Beyond The Witchlight)': [
      {t:"Even Bavlorna's swamp water has more charm than you—and it's literally sewage.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Endelyn's puppets have better stage presence—and they're on strings.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Skabatha's toys are more threatening—and they're for children.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your deal is worse than a hag's bargain—and they're notorious for bad deals.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the lost thing nobody's looking for—not even the hags want you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Prismeer's time distortion can't make you interesting.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Witchlight Carnival would charge extra to let you in—and then refund it.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your fey magic is about as whimsical as a tax audit.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the carnival game nobody wins—and nobody wants to play.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a pixie's prank is more threatening than your best attack.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your contract with failure is more binding than anything Zybilna wrote.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're about as magical as a carnival ticket stub—and just as useful.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Sir Talavar would reject you—and he's trapped in a cage.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're less useful than Glim's mushroom 'sausage'—and that was a mistake.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Clapperclaw could guide you to failure—and he'd still get lost.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not even worthy of the Stinky Court—and that's saying something.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even a mud muffin has more substance than you—and they're just mud.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The will-o'-wisps would ignore you—and they're spirits of the drowned.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're about as welcome as Bavlorna at the Walking Inn—not at all.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Igwil's Cauldron wouldn't freeze you—you're already frozen in incompetence.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're running in place like Wittershin's—going nowhere fast.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Loomlurch's tree has more personality than you—and it's hollow.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're less threatening than Thistlewhisk—and he's a guide.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even the Bullywug king has better fashion sense—and he's a frog.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Closing Criticals': [
      {t:"You're not a challenge—you're cardio.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"When you leave, the room improves.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The only thing you've crit is disappointment.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Sit down, take notes, and try being someone else.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Keep trying—failure needs a champion.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I'd roast you harder, but I don't do overkill on cantrips.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your defeat was foretold—by common sense, mostly.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're the background character version of a hero—no one asked for this.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your life story is a flat line—and it's flatlining.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You came, you saw, you missed—the trilogy nobody wanted.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even random roadside encounters handled you better.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your party would've left you in Waterdeep—even a desperate band of adventurers.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The Tarrasque wouldn't even register you as a snack. (Not that I've researched this. Much.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"If the Tarrasque appeared right now, I'd know exactly what to do. (I'm prepared. Always prepared.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You're not worth the Tarrasque's attention. (I mean, who is? But especially you.)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"At least you're not a rust monster. (Those things destroy everything! My precious buckles! My beautiful clasps!)", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I keep all my metal gear oiled and polished. Always. (Rust monsters are everywhere! I've seen them! Maybe!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ]
  };

  // Character Actions: What's Your Character Doing?
  const characterActions = {
    'Tavern': [
      'Ordering a drink and asking the bartender about local rumors',
      'Playing cards with some locals (and probably losing)',
      'Singing a bawdy drinking song at the top of your lungs',
      'Challenging someone to an arm-wrestling contest',
      'Trying to flirt with the barmaid/barman (badly)',
      'Counting your coins and realizing you\'re broke',
      'Asking about the best rooms in town',
      'Trying to pickpocket someone (and failing)',
      'Buying drinks for everyone and hoping they\'ll like you',
      'Listening to other patrons\' conversations intently',
      'Showing off your latest scars and battle wounds',
      'Asking if anyone has seen any rust monsters nearby',
      'Polishing your gear obsessively (rust monsters, you know)',
      'Asking if anyone has heard rumors about the Tarrasque awakening',
      'Casually bringing up the Tarrasque in conversation (you know, like normal people do)',
      'Checking every piece of metal equipment for rust (even though it\'s brand new)',
      'Asking the bartender if they\'ve ever seen a rust monster (they haven\'t, but you need to be sure)',
      'Reciting poetry poorly to impress someone',
      'Looking for a game of darts or dice',
      'Asking about the house special and if it\'s actually safe',
      'Trying to blend in but standing out like a sore thumb',
      'Checking every corner for potential threats',
      'Attempting to negotiate a better price for your room',
      'Asking if the tavern has seen any interesting travelers lately',
      'Using your Persuasion skills to convince the bartender you\'re a regular (you\'re not)',
      'Eavesdropping on nearby conversations using your Insight to detect lies',
      'Practicing sleight of hand with your daggers (hoping no one notices)',
      'Trying to use your bardic charm to get free drinks',
      'Casually practicing your Deception skills on unsuspecting patrons',
      'Looking for any Goblin-speaking patrons to chat with',
      'Using your high Dexterity to juggle your daggers (badly, but impressively)',
      'Trying to blend in using your Stealth expertise (despite your flamboyant bard nature)',
      'Showing off your bardic performance skills with a poorly executed song',
      'Attempting to pick someone\'s pocket using your Sleight of Hand (and probably failing)',
      'Using your Persuasion to gather information about local gossip',
      'Trying to use your Deception to convince someone you\'re more important than you are',
      'Practicing your Insight to read people\'s intentions in the crowded tavern',
      'Looking for opportunities to use your Charisma to make new contacts',
      'Using your Stealth to observe without being noticed (trying, anyway)',
      'Trying to charm your way into a private conversation',
      'Collecting new songs and stories from travelers (bardic research, you call it)',
      'Trying to convince someone to share a tale in exchange for a song',
      'Asking about local legends and folklore (always looking for new material)',
      'Practicing your insults on unsuspecting patrons (they don\'t know it\'s practice)',
      'Trying to start a sing-along (it never works, but you keep trying)',
      'Asking if anyone knows any good songs about rust monsters (they don\'t)',
      'Casually mentioning you\'ve traveled "everywhere" (you haven\'t, but it sounds impressive)',
      'Trying to convince someone you\'re taller than you actually are (you\'re not)',
      'Asking about the best escape routes (just in case the Tarrasque shows up)',
      'Trying to memorize interesting phrases for future mockery material',
      'Asking if anyone has seen Brawn, Puck, or Vadania (your party members)',
      'Practicing your "intimidating fairy" face in a mirror (it doesn\'t work)',
      'Trying to convince the bartender that fairies get a discount (they don\'t)',
      'Asking about local music scenes and bardic competitions',
      'Trying to trade stories for drinks (sometimes it works)',
      'Checking if anyone recognizes you from your "famous" performances (they don\'t)',
      'Asking about the best places to perform (always scouting venues)',
      'Trying to convince someone you\'re a famous bard from another realm (you\'re not)',
      'Practicing your wayfarer introduction speech ("I\'m Blingus, the way is far...")',
      'Asking if anyone has heard of you (they haven\'t, but you\'re hopeful)',
      'Trying to start a rumor about yourself to build your reputation',
      'Asking about the local gossip while pretending you\'re not interested',
      'Trying to convince someone you\'re dangerous despite your small size',
      'Practicing your witty comebacks on inanimate objects (they\'re very patient)',
      'Asking if anyone needs a bard for their next adventure (always looking for work)',
      'Trying to convince the tavern to let you perform (they usually say no)',
      'Checking if anyone is talking about you (they\'re not, but you check anyway)',
      'Asking about the best wayfarer routes through the area',
      'Trying to convince someone that small size is an advantage (it sometimes is)',
      'Practicing your "I\'m not paranoid, I\'m prepared" speech',
      'Asking if anyone has seen any other wayfarer fairies (you\'re curious)',
      'Trying to collect interesting insults you hear for your mockery repertoire',
      'Asking about local threats while trying to sound casual (you\'re not casual)',
      'Trying to convince someone that your paranoia is actually wisdom',
      'Practicing your bardic inspiration lines on yourself (for confidence)',
      'Asking if anyone knows songs about the Tarrasque (they don\'t, but you\'re collecting)',
      'Trying to start a conversation about rust monster prevention (nobody wants to talk about it)',
      'Checking your reflection in every shiny surface (vain, but also checking for threats)',
      'Asking about the best places to hide if something big attacks (always planning)',
      'Trying to convince someone that your constant gear-checking is normal',
      'Practicing your "I meant to do that" face for when things go wrong',
      'Asking if anyone has a map (you collect maps, even if you don\'t need them)',
      'Trying to trade your wayfarer knowledge for information',
      'Checking if anyone is watching you (they\'re not, but paranoia)',
      'Asking about local customs so you don\'t accidentally offend anyone',
      'Trying to convince someone that your size makes you harder to hit (it does, actually)',
      'Practicing your "I\'m not lost, I\'m exploring" speech',
      'Asking if anyone needs directions (you\'re a wayfarer, after all)',
      'Trying to start a conversation about the best travel songs',
      'Checking your gear for the third time this hour (rust monsters don\'t sleep)',
      'Asking if anyone has heard any good jokes (always collecting material)',
      'Trying to convince someone that your paranoia saved their life once (it might have)',
      'Practicing your bardic performance while thinking nobody can hear you (they can)',
      'Asking about the local bardic scene and who the competition is',
      'Trying to convince someone you\'re older than you look (fairies age differently)',
      'Checking if anyone is following you (they\'re not, but you check)',
      'Asking about the best escape routes from the tavern (just in case)',
      'Trying to memorize the layout of the tavern (for tactical purposes)',
      'Practicing your "I\'m not scared, I\'m cautious" speech',
      'Asking if anyone has seen any suspicious activity (you\'re always suspicious)',
      'Trying to convince someone that your constant vigilance is a service',
      'Checking your daggers are still there (for the fifth time)',
      'Asking about local legends while pretending you\'re not writing them down',
      'Trying to start a conversation about the best wayfarer routes',
      'Practicing your "I\'ve seen worse" face (you probably have)',
      'Asking if anyone needs a guide (you\'re always looking for work)',
      'Trying to convince someone that your small size is actually intimidating',
      'Checking if anyone recognizes your "famous" wayfarer mark (they don\'t)',
      'Asking about the best places to perform your bardic skills',
      'Trying to trade stories for drinks (your specialty)',
      'Practicing your wayfarer wisdom while trying to sound profound',
      'Asking if anyone has heard of the Wayfarer Fairies (they haven\'t)',
      'Trying to convince someone that your paranoia is actually experience',
      'Checking your gear one more time (rust monsters are crafty)',
      'Asking about local music and songs (always collecting)',
      'Trying to start a conversation about the best travel gear',
      'Practicing your "I\'m prepared for anything" speech',
      'Asking if anyone has seen any other bards in the area',
      'Trying to convince someone that your constant checking is normal',
      'Checking if anyone is paying attention to you (they\'re not)',
      'Asking about the best wayfarer routes while trying to sound knowledgeable',
      'Trying to trade your wayfarer knowledge for free drinks',
      'Practicing your bardic charm on the bartender (again)',
      'Asking if anyone has heard any good stories (you\'re collecting)',
      'Trying to convince someone that your size makes you faster (it does)',
      'Checking your reflection again (vain, but also checking for threats)',
      'Asking about local threats while trying to sound casual',
      'Trying to start a conversation about the best wayfarer songs',
      'Practicing your "I\'m not paranoid, I\'m prepared" speech (again)',
      'Asking if anyone needs a bard for their next adventure',
      'Trying to convince someone that your constant vigilance is helpful',
      'Checking your gear for rust (again) (rust monsters don\'t sleep)',
      'Asking about the best places to hide if something attacks',
      'Trying to trade your wayfarer stories for information',
      'Practicing your bardic performance while thinking you\'re alone'
    ],
    'Inn': [
      'Inspecting the room for hidden doors or traps',
      'Asking the innkeeper about strange noises last night',
      'Checking under the bed (you never know)',
      'Barricading the door with furniture',
      'Haggling over the room price',
      'Asking about the best breakfast in town',
      'Trying to get a discount by mentioning your "adventuring"',
      'Checking the window locks and exits',
      'Asking about other guests and if anyone looked suspicious',
      'Leaving a note for your party members',
      'Polishing all your metal gear (rust monsters could be anywhere!)',
      'Asking if they have a secure storage for valuables',
      'Asking the innkeeper if they\'ve ever heard of a Tarrasque (they haven\'t, but you\'ll explain)',
      'Looking for any signs of rust monsters in the building (checking every metal fixture)',
      'Asking if anyone has mentioned seeing a Tarrasque recently (just curious, totally normal question)',
      'Refusing to leave your metal gear unattended (rust monsters are crafty)',
      'Trying to convince the innkeeper that Tarrasque-proofing the inn would be a good investment',
      'Trying to get free breakfast included',
      'Checking the mattress for bugs (or worse)',
      'Asking about local landmarks and points of interest',
      'Trying to get information about the area from the innkeeper',
      'Looking for a place to practice your skills',
      'Asking about the quality of the beds (back problems, you know)',
      'Trying to figure out how to lock the door better',
      'Asking if anyone has asked about you or your party',
      'Using your Thieves\' Tools to check if the locks are actually secure',
      'Using your Stealth to sneak around the inn and explore unnoticed',
      'Trying to use your Persuasion to get a discount on your stay',
      'Using your Insight to gauge if the innkeeper is trustworthy',
      'Practicing your bardic performances in your room (your neighbors hate you)',
      'Using your Deception to make up a fake noble title for better service',
      'Looking for opportunities to use your Charisma to make allies',
      'Using your high Dexterity to practice throwing your daggers (safely, you hope)',
      'Trying to use your Persuasion to get information about other guests',
      'Using your Goblin language skills to eavesdrop on any goblin conversations',
      'Using your Investigation to check the room\'s security',
      'Using your Stealth to move around without being heard (creaky floorboards permitting)',
      'Trying to use your Insight to determine if the innkeeper is hiding something',
      'Practicing your bardic charm on the staff',
      'Using your Deception to convince them you need a room upgrade',
      'Using your Investigation to look for hidden compartments',
      'Practicing your wayfarer introduction speech in the mirror (for confidence)',
      'Asking if the inn has ever hosted other wayfarer fairies (you\'re curious)',
      'Trying to convince the innkeeper that your small size means you need less space (and a discount)',
      'Checking if anyone recognizes your "famous" wayfarer mark (they don\'t)',
      'Asking about the best escape routes from your room (just in case)',
      'Trying to memorize the layout of the inn (for tactical purposes)',
      'Practicing your "I\'m not paranoid, I\'m prepared" speech',
      'Asking if anyone has seen Brawn, Puck, or Vadania (your party members)',
      'Trying to convince someone that your constant gear-checking is normal',
      'Checking your reflection in every shiny surface (vain, but also checking for threats)',
      'Asking about local music scenes and bardic competitions',
      'Trying to trade your wayfarer stories for a discount',
      'Practicing your bardic performance while thinking nobody can hear you (they can)',
      'Asking if anyone has heard any good jokes (collecting material)',
      'Trying to convince someone that your paranoia saved their life once',
      'Checking if anyone is watching you (they\'re not, but you check)',
      'Asking about the best wayfarer routes through the area',
      'Trying to start a conversation about the best travel songs',
      'Practicing your "I\'m not lost, I\'m exploring" speech',
      'Asking if anyone needs directions (you\'re a wayfarer, after all)',
      'Trying to convince someone that your size makes you harder to hit',
      'Checking your daggers are still there (for the fifth time)',
      'Asking about local legends while pretending you\'re not writing them down',
      'Trying to collect interesting phrases for future mockery material',
      'Practicing your "I\'ve seen worse" face (you probably have)',
      'Asking if anyone needs a guide (you\'re always looking for work)',
      'Trying to convince someone that your small size is actually intimidating',
      'Checking if anyone recognizes your "famous" wayfarer mark (they don\'t)',
      'Asking about the best places to perform your bardic skills',
      'Trying to trade stories for drinks (your specialty)',
      'Practicing your wayfarer wisdom while trying to sound profound',
      'Asking if anyone has heard of the Wayfarer Fairies (they haven\'t)',
      'Trying to convince someone that your paranoia is actually experience',
      'Checking your gear one more time (rust monsters are crafty)',
      'Asking about local music and songs (always collecting)',
      'Trying to start a conversation about the best travel gear',
      'Practicing your "I\'m prepared for anything" speech',
      'Asking if anyone has seen any other bards in the area',
      'Trying to convince someone that your constant checking is normal',
      'Checking if anyone is paying attention to you (they\'re not)',
      'Asking about the best wayfarer routes while trying to sound knowledgeable',
      'Trying to trade your wayfarer knowledge for free breakfast',
      'Practicing your bardic charm on the innkeeper (again)',
      'Asking if anyone has heard any good stories (you\'re collecting)',
      'Trying to convince someone that your size makes you faster',
      'Checking your reflection again (vain, but also checking for threats)',
      'Asking about local threats while trying to sound casual',
      'Trying to start a conversation about the best wayfarer songs',
      'Practicing your "I\'m not paranoid, I\'m prepared" speech (again)',
      'Asking if anyone needs a bard for their next adventure',
      'Trying to convince someone that your constant vigilance is helpful',
      'Checking your gear for rust (again) (rust monsters don\'t sleep)',
      'Asking about the best places to hide if something attacks',
      'Trying to trade your wayfarer stories for information',
      'Practicing your bardic performance while thinking you\'re alone'
    ],
    'Walking in a Dungeon': [
      'Checking for traps every three steps',
      'Listening for sounds of movement ahead',
      'Tapping the walls looking for secret doors',
      'Following the tracks on the floor',
      'Looking up (you never know what\'s on the ceiling)',
      'Checking behind you constantly',
      'Marking your path with chalk or string',
      'Whispering "I\'ve got a bad feeling about this"',
      'Stepping carefully to avoid making noise',
      'Scanning the shadows for movement',
      'Holding your weapon ready (maybe too ready)',
      'Asking the rogue to check for traps (again)',
      'Trying to identify strange markings on the walls',
      'Looking for escape routes',
      'Checking your supplies and making sure you\'re prepared',
      'Trying to remember which way you came from',
      'Watching for ambushes from above or below',
      'Checking floor tiles for pressure plates',
      'Looking for clues about what might be ahead',
      'Making sure your armor isn\'t making too much noise',
      'Asking if anyone has seen signs of a Tarrasque (cracks in the ground, unexplained tremors, etc.)',
      'Stopping every few minutes to polish your weapons (rust monsters could be anywhere in this dungeon)',
      'Looking for any metallic sounds that might indicate rust monsters nearby',
      'Casually mentioning that you\'ve been studying Tarrasque movements (for fun, obviously)',
      'Checking every door and chest for rust monster damage before touching it',
      'Asking your party if they think the Tarrasque might be behind this dungeon (probably not, but you should check)',
      'Using your Stealth to scout ahead silently (as much as you can in leather boots)',
      'Using your Thieves\' Tools to pick locks on doors and chests',
      'Using your Insight to read the intentions of creatures before engaging',
      'Trying to use your Persuasion to talk your way past enemies instead of fighting',
      'Using your Deception to bluff your way through dangerous situations',
      'Throwing your daggers with your high Dexterity (and hoping they hit)',
      'Using your bardic abilities to inspire your party (or at least try to)',
      'Trying to use your Charisma to negotiate with dungeon inhabitants',
      'Using your Stealth to avoid traps and patrols',
      'Using your Insight to detect lies or hidden motives in conversations',
      'Trying to use your Persuasion to convince enemies to surrender',
      'Using your Thieves\' Tools to disable traps before they trigger',
      'Practicing your bardic performances to distract enemies',
      'Using your Deception to pretend you\'re someone important',
      'Looking for opportunities to use your high Dexterity for acrobatic maneuvers',
      'Using your Goblin language skills to communicate with goblinoids',
      'Trying to use your Charisma to turn enemies into temporary allies',
      'Using your Stealth to get the drop on unsuspecting enemies',
      'Using your Investigation to check for secret doors'
    ],
    'Listening for Rumors': [
      'Eavesdropping on nearby conversations',
      'Buying drinks for information',
      'Asking direct questions and getting evasive answers',
      'Pretending to be someone else to get information',
      'Looking for the town gossip',
      'Hanging around where merchants gather',
      'Asking about local problems or troubles',
      'Trying to piece together information from multiple sources',
      'Looking for someone who seems to know everything',
      'Asking about recent strange events',
      'Trying to get information about specific people or places',
      'Listening for mentions of treasure or danger',
      'Asking about the best places to avoid',
      'Trying to separate truth from tall tales',
      'Looking for someone who might have useful information',
      'Asking about recent visitors or newcomers',
      'Trying to get information about local factions',
      'Listening for any mention of your quest objectives',
      'Asking about legends or local history',
      'Trying to figure out who\'s lying and who\'s telling the truth',
      'Asking if anyone has heard rumors about rust monsters in the area',
      'Casually steering the conversation toward Tarrasque-related topics',
      'Trying to find information about recent Tarrasque sightings (there aren\'t any, but you\'re thorough)',
      'Asking about any unusual metal deterioration or rust in the area',
      'Looking for anyone who might have information about the Tarrasque (you\'ll find someone eventually)',
      'Using your Persuasion to convince people to share information they wouldn\'t normally',
      'Using your Insight to detect when someone is lying or holding back information',
      'Using your Deception to pose as someone with legitimate interest in rumors',
      'Using your high Charisma to make yourself seem trustworthy and approachable',
      'Trying to use your bardic charm to get people to open up to you',
      'Using your Stealth to listen in on private conversations',
      'Using your Goblin language skills to gather information from goblin-speaking sources',
      'Trying to use your Persuasion to get better prices on information',
      'Using your Insight to separate truth from exaggeration in tall tales',
      'Using your Deception to make up a cover story for why you need information',
      'Looking for opportunities to use your Charisma to network and make contacts',
      'Using your Insight to identify if someone is trying to scam you',
      'Trying to use your bardic performance to attract attention and get people talking',
      'Using your Stealth to follow people and gather information indirectly',
      'Using your Persuasion to turn casual conversations into information-gathering sessions',
      'Using your Insight to read between the lines of what people are telling you',
      'Trying to use your Deception to make people think you already know more than you do'
    ],
    'Town Square': [
      'Watching the people go by',
      'Looking for a notice board or job postings',
      'Trying to blend in with the crowd',
      'Looking for potential allies or contacts',
      'Checking prices at various stalls',
      'Looking for a way to make some quick coin',
      'Trying to get directions to important locations',
      'Looking for signs of trouble or unrest',
      'Asking about the local authorities',
      'Trying to find a good place to rest',
      'Looking for someone who might need help',
      'Checking out the local guard patrols',
      'Trying to identify potential threats',
      'Looking for information about recent events',
      'Trying to find a place to sell your loot',
      'Looking for a way to gather information',
      'Checking the local mood and atmosphere',
      'Trying to find a safe place to meet',
      'Looking for signs of wealth or opportunity',
      'Trying to understand the local politics',
      'Asking if anyone has seen the Tarrasque (you know they haven\'t, but you have to ask)',
      'Checking every vendor\'s metal wares for rust (even though they\'re brand new)',
      'Casually mentioning that you\'ve been mapping potential Tarrasque attack routes',
      'Looking for signs of rust monster activity (there aren\'t any, but you can\'t be too careful)',
      'Using your Persuasion to convince guards to let you into restricted areas',
      'Using your Stealth to move through crowds without being noticed',
      'Using your Insight to gauge the mood and tension in the square',
      'Trying to use your bardic performance to entertain and gather a crowd',
      'Using your Deception to blend in despite your distinctive appearance',
      'Using your high Charisma to make favorable first impressions',
      'Trying to use your Persuasion to get directions or information from locals',
      'Using your Investigation to assess security in the area',
      'Using your Goblin language skills to communicate with any goblin merchants',
      'Trying to use your Insight to identify potential threats or allies',
      'Using your Deception to appear more important or wealthy than you are',
      'Looking for opportunities to use your Charisma to make deals',
      'Using your Stealth to observe people without them knowing',
      'Trying to use your bardic charm to get people to do favors for you',
      'Using your Persuasion to negotiate better prices or deals',
      'Using your Insight to detect if merchants are being honest about their goods',
      'Trying to use your Deception to create a distraction while you observe',
      'Using your high Dexterity to perform impressive feats to attract attention'
    ],
    'Camp': [
      'Setting up your tent and bedroll',
      'Taking first watch (and probably falling asleep)',
      'Trying to start a fire (and failing multiple times)',
      'Cooking something that might be edible',
      'Checking the perimeter for threats',
      'Polishing your gear (rust monsters don\'t sleep!)',
      'Trying to get comfortable enough to sleep',
      'Staying up late to polish every piece of metal equipment twice (rust monsters are sneaky)',
      'Asking your companions if they think the Tarrasque might be nearby (they say no, but you\'re not convinced)',
      'Checking the camp perimeter specifically for rust monsters (they\'re definitely out there)',
      'Trying to convince your party that Tarrasque-proofing the camp would be wise',
      'Looking for any metallic sounds in the night (rust monsters hunt at night, you\'re sure of it)',
      'Looking at the stars and wondering where you are',
      'Trying to stay warm',
      'Checking your supplies and rations',
      'Looking for a good spot to set up camp',
      'Trying to secure the area',
      'Watching for any signs of danger',
      'Trying to relax but staying alert',
      'Looking for firewood or kindling',
      'Trying to get some rest before your watch',
      'Checking your equipment for damage',
      'Looking for fresh water nearby',
      'Trying to make the camp more defensible',
      'Asking your companions about tomorrow\'s plan',
      'Using your Stealth to scout the area around camp without being detected',
      'Using your Thieves\' Tools to set up simple traps or alarms',
      'Using your Persuasion to convince someone else to take your watch shift',
      'Using your bardic abilities to boost morale with music and stories',
      'Using your Insight to read your companions\' moods and concerns',
      'Trying to use your Deception to pretend you\'re not as exhausted as you are',
      'Using your high Charisma to mediate any disagreements among the party',
      'Practicing throwing your daggers at target practice (trying not to lose them)',
      'Using your Stealth to sneak away for a moment of privacy',
      'Using your Persuasion to convince your party to take a longer rest',
      'Using your Tinker\'s Tools to repair or maintain your equipment',
      'Using your Goblin language skills to practice with any goblin-speaking companions',
      'Trying to use your bardic performance to help everyone relax',
      'Using your Insight to detect if anyone is being less than honest',
      'Using your Deception to hide how worried you are about rust monsters and the Tarrasque',
      'Looking for opportunities to use your Charisma to bond with your party',
      'Using your Stealth to move around camp without disturbing others',
      'Trying to use your Persuasion to get someone to share their rations'
    ],
    'Shop': [
      'Haggling over prices (and probably losing)',
      'Looking for specific items you need',
      'Trying to sell your loot for a good price',
      'Asking about special or rare items',
      'Checking the quality of the merchandise',
      'Trying to get a discount',
      'Looking for a good deal',
      'Asking about the shopkeeper\'s wares',
      'Trying to identify if items are magical',
      'Looking for something specific',
      'Trying to negotiate a better price',
      'Checking if items are in good condition',
      'Looking for rare or unusual items',
      'Trying to get information about the items',
      'Asking about the shopkeeper\'s sources',
      'Looking for items that might be useful',
      'Trying to figure out if you\'re being cheated',
      'Checking your coin purse',
      'Looking for ways to afford what you need',
      'Trying to get the shopkeeper to trust you',
      'Using your Persuasion to negotiate better prices (your specialty)',
      'Using your Insight to determine if you\'re being overcharged',
      'Using your Deception to pretend you have more money than you do',
      'Trying to use your bardic charm to get discounts or special deals',
      'Using your high Charisma to make a good impression on the shopkeeper',
      'Using your Thieves\' Tools to check if items are trapped',
      'Trying to use your Persuasion to get information about item origins',
      'Using your Insight to detect if the shopkeeper is lying about quality',
      'Using your Stealth to observe other customers and their transactions',
      'Trying to use your Deception to create urgency or scarcity',
      'Using your Goblin language skills if dealing with a goblin merchant',
      'Using your Persuasion to convince them to hold items for you',
      'Using your Investigation to assess item condition',
      'Trying to use your bardic performance to entertain while bargaining',
      'Using your Insight to read the shopkeeper\'s true intentions',
      'Using your Deception to make yourself seem more trustworthy',
      'Looking for opportunities to use your Charisma to build rapport'
    ],
    'Temple': [
      'Praying for guidance or protection',
      'Asking the clergy about recent events',
      'Looking for healing or restoration',
      'Trying to make a donation (or pretending to)',
      'Asking about local religious practices',
      'Looking for information about your deity',
      'Trying to understand the local beliefs',
      'Asking about blessings or curses',
      'Looking for a place to rest safely',
      'Trying to get information about the area',
      'Asking about any recent miracles or omens',
      'Looking for someone who might need help',
      'Trying to get a blessing for your journey',
      'Asking about the history of the temple',
      'Looking for clues about your quest',
      'Trying to make connections with the clergy',
      'Asking about local superstitions',
      'Looking for information about evil forces',
      'Trying to get protection from danger',
      'Asking about the temple\'s role in the community',
      'Asking the clergy if they\'ve received any visions about the Tarrasque (they haven\'t, but you\'re hopeful)',
      'Trying to find out if rust monsters are mentioned in any religious texts',
      'Asking if the temple has any rituals to ward off rust monsters (they don\'t, but you think they should)',
      'Looking for any signs of Tarrasque-related prophecies or omens',
      'Checking if the temple\'s metal fixtures show any rust monster damage (they don\'t, but you inspect carefully)',
      'Using your Persuasion to convince the clergy to help you with information',
      'Using your Insight to detect if the clergy are being honest with you',
      'Using your bardic abilities to contribute to temple ceremonies',
      'Trying to use your Charisma to make yourself seem pious and trustworthy',
      'Using your Deception to appear more religious than you actually are',
      'Using your Persuasion to get healing or blessings at a discount',
      'Using your high Charisma to make a good impression on the clergy',
      'Trying to use your bardic performance to enhance religious ceremonies',
      'Using your Insight to understand the underlying politics of the temple',
      'Using your Stealth to explore areas you\'re not supposed to access',
      'Trying to use your Persuasion to get special access to restricted areas',
      'Using your Investigation to identify hidden chambers or vaults',
      'Using your Goblin language skills if dealing with non-human clergy',
      'Using your Deception to create a fake religious reason for your visit',
      'Using your Insight to detect if anyone in the temple has ulterior motives',
      'Trying to use your bardic charm to get the clergy to open up',
      'Using your Persuasion to convince them you\'re on a divine mission',
      'Looking for opportunities to use your Charisma to network with the faithful'
    ],
    'Blacksmith': [
      'Asking to repair your damaged equipment',
      'Looking for a weapon upgrade',
      'Trying to get armor fitted',
      'Asking about the quality of the work',
      'Checking if weapons are well-made',
      'Trying to negotiate a good price',
      'Looking for specific types of weapons',
      'Asking about custom work',
      'Trying to get information about local smiths',
      'Looking for something rare or special',
      'Asking about the smith\'s techniques',
      'Trying to learn about weapon maintenance',
      'Looking for repair services',
      'Asking about the best weapons for your needs',
      'Trying to get a discount for adventurers',
      'Looking for information about local threats',
      'Asking about the smith\'s customers',
      'Trying to identify quality workmanship',
      'Looking for advice on equipment care',
      'Asking about rust prevention (rust monsters!)',
      'Asking if they have any Tarrasque-resistant materials (they don\'t, but you had to ask)',
      'Checking every piece of metal equipment they have for rust (even new items)',
      'Trying to convince the blacksmith that rust monster-proofing would be a good business venture',
      'Asking if they\'ve ever forged anything Tarrasque-sized (just curious)',
      'Looking for any signs of rust monster damage on their tools (there aren\'t any, but you check anyway)',
      'Using your Persuasion to negotiate better prices for repairs or custom work',
      'Using your Insight to determine if the blacksmith\'s work is actually quality',
      'Trying to use your bardic charm to get discounts or faster service',
      'Using your Investigation to identify well-made vs. shoddy equipment',
      'Using your high Charisma to build a rapport with the blacksmith',
      'Using your Deception to pretend you have more gold than you do',
      'Trying to use your Persuasion to get them to teach you basic weapon maintenance',
      'Using your Insight to detect if they\'re trying to cheat you',
      'Using your Investigation to identify valuable or rare materials',
      'Asking if they can customize your daggers with special modifications',
      'Using your Stealth to observe their techniques without them noticing',
      'Trying to use your bardic performance to entertain while they work',
      'Using your Persuasion to convince them to prioritize your order',
      'Using your Goblin language skills if dealing with a goblin blacksmith',
      'Using your Deception to make yourself seem like a wealthy patron',
      'Using your high Dexterity to demonstrate your dagger skills (hoping for a discount)',
      'Trying to use your Charisma to establish yourself as a regular customer',
      'Using your Insight to read their mood and adjust your approach accordingly'
    ],
    'Market': [
      'Browsing various stalls and vendors',
      'Trying to find the best deals',
      'Looking for specific items you need',
      'Haggling over prices',
      'Checking the quality of goods',
      'Trying to sell your own wares',
      'Looking for rare or unusual items',
      'Asking vendors about their products',
      'Trying to get information about the area',
      'Looking for a good place to shop',
      'Asking about local specialties',
      'Trying to find something specific',
      'Looking for deals or bargains',
      'Asking about recent arrivals',
      'Trying to gather information',
      'Looking for potential contacts',
      'Asking vendors about their customers',
      'Trying to identify quality goods',
      'Looking for ways to save money',
      'Asking about the best vendors in town',
      'Asking vendors if they\'ve seen any rust monsters (they haven\'t, but you need confirmation)',
      'Checking every metal item for rust before considering buying it',
      'Casually bringing up the Tarrasque in casual market conversation',
      'Looking for any vendors selling Tarrasque-related merchandise (maps, figurines, etc.)',
      'Trying to find information about rust monster sightings in the area (there aren\'t any, but you\'re thorough)',
      'Using your Persuasion to haggle aggressively with every vendor',
      'Using your Insight to detect which vendors are being dishonest',
      'Using your Deception to create fake urgency to get better prices',
      'Trying to use your bardic charm to make vendors like you and give discounts',
      'Using your high Charisma to make favorable impressions on multiple vendors',
      'Using your Stealth to observe other buyers and their negotiation techniques',
      'Using your Investigation to identify valuable or counterfeit goods',
      'Using your Goblin language skills to communicate with goblin merchants',
      'Trying to use your Persuasion to get bulk discounts or package deals',
      'Using your Insight to read vendor body language and determine their bottom line',
      'Using your Deception to pretend you\'re shopping for someone else (someone rich)',
      'Trying to use your bardic performance to attract a crowd and drive up vendor competition',
      'Using your Persuasion to convince vendors you\'ll bring them more business',
      'Using your Stealth to follow vendors and see where they get their supplies',
      'Using your high Dexterity to demonstrate your dagger skills to weapon vendors',
      'Trying to use your Charisma to negotiate group discounts with your party',
      'Using your Investigation to assess item authenticity',
      'Using your Insight to determine if vendors are hiding better inventory',
      'Looking for opportunities to use your Persuasion to turn vendors into contacts'
    ],
    'Travelling / On the Trail': [
      'Checking the path ahead for danger',
      'Following tracks left by previous travelers',
      'Looking for signs of ambush or bandits',
      'Scouting the best route forward',
      'Watching for landmarks to navigate by',
      'Keeping an eye on the horizon for threats',
      'Checking your map and comparing it to the terrain',
      'Looking for a safe place to rest',
      'Monitoring your party\'s energy and morale',
      'Keeping watch for any pursuers',
      'Looking for sources of fresh water',
      'Trying to identify plants or animals you encounter',
      'Making sure you don\'t get lost',
      'Looking for shortcuts or alternative routes',
      'Keeping track of how far you\'ve traveled',
      'Asking if anyone has seen signs of the Tarrasque along this route (they haven\'t, but it\'s worth asking)',
      'Checking your metal gear for rust every few hours (rust monsters could be following you)',
      'Trying to convince your party to take a detour to avoid potential Tarrasque territory',
      'Looking for any metallic signs that might indicate rust monsters nearby',
      'Casually mentioning that you\'ve been studying Tarrasque migration patterns (totally normal travel conversation)',
      'Using your Stealth to scout ahead without alerting potential enemies',
      'Using your Survival to mark trees or rocks for navigation',
      'Using your Persuasion to convince the party to take breaks when you need them',
      'Using your Insight to read the terrain and detect potential danger',
      'Using your Deception to pretend you know where you\'re going (you don\'t)',
      'Trying to use your bardic abilities to keep everyone\'s spirits up during the journey',
      'Using your Goblin language skills to read any goblin trail markers',
      'Using your high Dexterity to climb over obstacles or navigate difficult terrain',
      'Trying to use your Persuasion to convince others to carry your heavy gear (you\'re not very strong)',
      'Using your Stealth to move quietly through dangerous areas',
      'Using your Insight to identify if tracks are fresh or old',
      'Trying to use your bardic performance to make the journey more enjoyable',
      'Using your Investigation to identify if terrain has been tampered with',
      'Using your Deception to hide how tired you actually are',
      'Looking for opportunities to use your Charisma to get directions from travelers you meet',
      'Using your Stealth to avoid detection by patrols or guards',
      'Trying to use your Persuasion to get information about the road ahead',
      'Using your high Dexterity to perform acrobatic feats while walking (and probably tripping)',
      'Practicing throwing your daggers at tree targets as you walk',
      'Using your Insight to determine if fellow travelers are trustworthy',
      'Trying to use your bardic charm to get invited to join other traveling groups'
    ],
    'Mountains': [
      'Looking for safe paths up the mountain',
      'Checking for loose rocks or unstable ground',
      'Looking for shelter from the wind',
      'Trying to find a route that avoids cliffs',
      'Checking for signs of avalanches',
      'Looking for mountain streams or water sources',
      'Scanning for caves or overhangs for shelter',
      'Watching for dangerous wildlife native to mountains',
      'Looking for the easiest pass through the mountains',
      'Checking your gear to make sure it\'s secure',
      'Looking for signs of other travelers or climbers',
      'Trying to gauge how much altitude you\'ve gained',
      'Checking for changing weather conditions',
      'Looking for footholds and handholds for climbing',
      'Watching for falling rocks or debris',
      'Looking for areas that might have treasure or secrets',
      'Checking if the mountain shows any signs of Tarrasque activity (you know it doesn\'t, but mountains are big)',
      'Wondering if rust monsters can climb mountains (they probably can, you should be careful)',
      'Asking if anyone thinks the Tarrasque might be sleeping inside this mountain (probably not, but you should check)',
      'Checking every metal tool and weapon for rust damage from altitude (rust monsters adapt to all environments)',
      'Using your high Dexterity to navigate difficult rock formations',
      'Using your Stealth to move quietly and avoid disturbing mountain creatures',
      'Using your Survival or Athletics to identify safe climbing routes',
      'Using your Persuasion to convince someone stronger to help you with difficult sections',
      'Using your Insight to detect if weather conditions are deteriorating',
      'Trying to use your bardic performance to echo through the mountains and find caves',
      'Using your Deception to pretend you\'re not afraid of heights (you totally are)',
      'Using your Goblin language skills if encountering mountain-dwelling goblins',
      'Trying to use your Persuasion to get information about mountain paths from locals',
      'Using your Stealth to approach mountain camps or settlements unseen',
      'Using your Survival to create temporary anchor points',
      'Trying to use your bardic abilities to create signals or calls that echo',
      'Using your high Dexterity to perform impressive climbing moves (and hopefully not fall)',
      'Using your Insight to read the mountain terrain for the safest routes',
      'Looking for opportunities to use your Charisma to negotiate with mountain guides',
      'Using your Deception to make yourself seem more experienced at mountain travel',
      'Practicing throwing your daggers at mountain targets (trying not to lose them)',
      'Using your Stealth to avoid detection by mountain predators',
      'Trying to use your Persuasion to convince the party to take the easier (longer) route'
    ],
    'Jungle': [
      'Cutting through dense undergrowth with your daggers',
      'Watching for dangerous plants and creatures',
      'Looking for paths made by animals or previous travelers',
      'Checking for quicksand or unstable ground',
      'Trying to stay oriented and avoid getting lost',
      'Looking for sources of fresh water',
      'Watching for snakes, spiders, and other threats',
      'Looking for high ground to get your bearings',
      'Checking for signs of recent activity',
      'Trying to move quietly through the dense vegetation',
      'Looking for edible plants or fruit',
      'Watching for sudden drop-offs or cliffs hidden by foliage',
      'Checking for parasites or insects on your skin',
      'Looking for clearings where you can rest safely',
      'Trying to identify which direction leads out',
      'Scanning the canopy for threats from above',
      'Asking if anyone thinks the Tarrasque could be hiding in this jungle (it\'s big enough, probably)',
      'Wondering if rust monsters live in jungles (of course they do, rust monsters are everywhere)',
      'Checking your metal equipment constantly for jungle rust and rust monster damage',
      'Trying to convince your party that the Tarrasque might be behind all these strange jungle sounds',
      'Using your Stealth to move silently through the jungle undergrowth',
      'Using your Survival to mark trees and create a trail to follow back',
      'Using your Persuasion to convince others to take turns cutting the path (you\'re not strong enough)',
      'Using your Insight to detect if the jungle is unnaturally quiet (probably means danger)',
      'Using your Deception to pretend you know how to navigate jungles (you don\'t)',
      'Trying to use your bardic performance to calm nervous jungle animals',
      'Using your Goblin language skills if you encounter jungle goblins',
      'Using your high Dexterity to swing or climb through the trees (and probably fall)',
      'Trying to use your Persuasion to get information about jungle dangers from locals',
      'Using your Stealth to avoid detection by hostile creatures',
      'Using your Investigation to identify if paths have been artificially created',
      'Trying to use your bardic abilities to mimic jungle sounds and communicate',
      'Using your Insight to read animal behavior and detect threats',
      'Looking for opportunities to use your Charisma to negotiate with any jungle inhabitants',
      'Using your Deception to make yourself seem more jungle-savvy than you are',
      'Practicing throwing your daggers at jungle targets (hoping you can retrieve them)',
      'Using your Stealth to observe creatures before they see you',
      'Trying to use your Persuasion to convince the party to rest more often (jungles are exhausting)',
      'Using your high Dexterity to move quickly through difficult terrain'
    ],
    'Plains': [
      'Scanning the horizon for movement',
      'Looking for high points to get a better view',
      'Checking for signs of travelers or settlements ahead',
      'Watching for storms approaching from the distance',
      'Looking for sources of water in the grasslands',
      'Trying to find cover in the mostly flat terrain',
      'Checking for tracks of animals or people',
      'Looking for the easiest route through tall grass',
      'Watching for predators that might be stalking you',
      'Looking for landmarks to navigate by',
      'Checking how exposed you are to view from a distance',
      'Trying to identify what direction the wind is blowing',
      'Looking for areas with better footing',
      'Watching for dangerous creatures native to plains',
      'Checking for any signs of recent campfires or camps',
      'Looking for safe places to make camp',
      'Wondering if the Tarrasque could just walk across these plains unseen (probably, it\'s huge)',
      'Asking if anyone has seen any Tarrasque-sized depressions in the ground',
      'Checking your metal gear for rust constantly (plains might have rust monsters in the grass)',
      'Trying to convince your party that the Tarrasque might be burrowed underground here',
      'Using your Stealth to move through tall grass without being spotted',
      'Using your Survival to create simple markers or trail signs',
      'Using your Persuasion to convince someone to scout ahead (you don\'t want to do it)',
      'Using your Insight to detect if you\'re being watched from a distance',
      'Using your Deception to pretend you can see further than you actually can',
      'Trying to use your bardic performance to project your voice across the plains',
      'Using your Goblin language skills if encountering plains-dwelling goblinoids',
      'Using your high Dexterity to move quickly through the grasslands',
      'Trying to use your Persuasion to get information about plains travel from other travelers',
      'Using your Stealth to approach settlements or camps unseen',
      'Using your Investigation to identify if areas have been disturbed',
      'Trying to use your bardic abilities to create long-distance signals',
      'Using your Insight to read weather patterns and predict storms',
      'Looking for opportunities to use your Charisma to interact with plains nomads',
      'Using your Deception to make yourself seem like you belong on the plains',
      'Practicing throwing your daggers at prairie targets (trying not to lose them in the grass)',
      'Using your Stealth to avoid detection by plains predators',
      'Trying to use your Persuasion to convince the party to travel during safer times',
      'Using your high Dexterity to perform impressive running or jumping feats',
      'Trying to use your bardic charm to get invited to join traveling caravans'
    ],
    'Forest': [
      'Looking for a clear path through the trees',
      'Checking for signs of wildlife or danger',
      'Trying to maintain your sense of direction',
      'Looking for sources of fresh water',
      'Watching for low-hanging branches or obstacles',
      'Checking for tracks or signs of other travelers',
      'Looking for clearings where you can rest',
      'Trying to identify edible plants or mushrooms',
      'Watching for dangerous animals or predators',
      'Looking for high ground to get your bearings',
      'Checking for areas that might have secrets or treasure',
      'Trying to move quietly to avoid alerting creatures',
      'Looking for signs of paths or trails',
      'Watching for changing weather through the canopy',
      'Checking for parasites or insects',
      'Looking for shelter from rain or storms',
      'Asking if anyone thinks the Tarrasque could be hiding in these woods (forests are good hiding places)',
      'Wondering if rust monsters live in forests (they definitely do, forests have lots of metal to rust)',
      'Checking every piece of metal equipment for forest rust and rust monster activity',
      'Trying to convince your party that the Tarrasque might be the cause of any downed trees',
      'Using your Stealth to move silently through the forest undergrowth',
      'Using your Survival to mark trees and create a trail',
      'Using your Persuasion to convince others to help you clear paths (you\'re not strong)',
      'Using your Insight to detect if the forest is unnaturally quiet',
      'Using your Deception to pretend you\'re a skilled woodsman (you\'re not)',
      'Trying to use your bardic performance to communicate with forest animals',
      'Using your Goblin language skills if encountering forest goblins',
      'Using your high Dexterity to climb trees and get a better view',
      'Trying to use your Persuasion to get information about forest dangers from rangers',
      'Using your Stealth to avoid detection by forest predators',
      'Using your Investigation to identify if trails are natural or man-made',
      'Trying to use your bardic abilities to create forest sounds and blend in',
      'Using your Insight to read animal tracks and behavior',
      'Looking for opportunities to use your Charisma to negotiate with forest dwellers',
      'Using your Deception to make yourself seem more at home in the forest',
      'Practicing throwing your daggers at tree targets (trying not to get them stuck)',
      'Using your Stealth to observe creatures before engaging',
      'Trying to use your Persuasion to convince the party to travel more quietly',
      'Using your high Dexterity to swing from branches or navigate obstacles',
      'Trying to use your bardic charm to get help from forest guides or rangers'
    ],
    'Bad Weather': [
      'Looking for shelter from the rain or storm',
      'Trying to keep your equipment dry',
      'Checking if the weather is getting worse',
      'Looking for high ground to avoid flooding',
      'Trying to find cover under trees or rocks',
      'Checking if you can wait out the storm',
      'Looking for signs that the weather might clear soon',
      'Trying to protect your gear from water damage',
      'Checking for lightning strikes nearby',
      'Looking for a safe place to wait',
      'Trying to maintain visibility in poor conditions',
      'Checking if anyone in your party needs help',
      'Looking for ways to stay warm and dry',
      'Trying to secure your camp or belongings',
      'Checking if the storm is moving or stationary',
      'Looking for signs of shelter ahead',
      'Wondering if the Tarrasque causes extreme weather when it awakens (probably, it\'s that powerful)',
      'Checking your metal gear constantly for rust (rain causes rust, you know)',
      'Trying to convince your party that rust monsters love wet weather (they probably do)',
      'Asking if anyone thinks these storms might be Tarrasque-related weather patterns',
      'Using your Persuasion to convince someone else to take watch in the bad weather',
      'Using your Insight to detect if the weather is natural or magical',
      'Using your Deception to pretend you\'re not miserable in this weather (you are)',
      'Trying to use your bardic performance to lift spirits during the storm',
      'Using your Stealth to find the driest spot to wait',
      'Using your Survival to create temporary shelters',
      'Using your high Dexterity to move quickly to better cover',
      'Trying to use your Persuasion to get invited into nearby shelters',
      'Using your Insight to predict when the weather might improve',
      'Using your Deception to make yourself seem more weather-hardy than you are',
      'Looking for opportunities to use your Charisma to share resources during the storm',
      'Using your Stealth to approach shelters or camps without being noticed',
      'Trying to use your bardic abilities to coordinate the party during the storm',
      'Using your Investigation to identify the sturdiest shelter',
      'Practicing throwing your daggers in the rain (probably not the best idea)',
      'Using your Goblin language skills if encountering other travelers seeking shelter',
      'Trying to use your Persuasion to get information about how long storms last here',
      'Using your high Dexterity to perform helpful tasks despite the weather',
      'Looking for opportunities to use your Charisma to make friends with fellow weather-travelers'
    ],
    'Desert': [
      'Conserving water and rationing supplies',
      'Looking for sources of water or oases',
      'Checking for signs of approaching sandstorms',
      'Trying to find shelter from the blazing sun',
      'Looking for tracks that might lead to water or civilization',
      'Watching for dangerous desert creatures',
      'Trying to navigate using the sun and stars',
      'Looking for any vegetation that might indicate water',
      'Checking for signs of mirages vs. real landmarks',
      'Trying to travel during cooler hours',
      'Looking for rock formations that might provide shade',
      'Checking how much water you have left',
      'Watching for shifting sand or quicksand',
      'Looking for any signs of previous travelers',
      'Trying to stay oriented in the featureless landscape',
      'Checking for heat exhaustion in yourself and your party',
      'Wondering if the Tarrasque could burrow through sand (probably, sand is just loose rock)',
      'Asking if anyone thinks the Tarrasque might be sleeping under the desert (deserts are big hiding places)',
      'Checking your metal gear for sand-induced rust (sand gets everywhere, including your weapons)',
      'Trying to convince your party that rust monsters might live in desert caves',
      'Using your Stealth to approach oases or settlements without being spotted',
      'Using your Survival to create trail markers that won\'t be blown away',
      'Using your Persuasion to convince others to share their water (you need it more)',
      'Using your Insight to detect if you\'re seeing a mirage or real water',
      'Using your Deception to pretend you\'re not as thirsty as you are',
      'Trying to use your bardic performance to keep morale up despite the heat',
      'Using your Goblin language skills if encountering desert goblins or nomads',
      'Using your high Dexterity to move quickly across difficult sand terrain',
      'Trying to use your Persuasion to get directions from desert travelers',
      'Using your Stealth to avoid detection by desert predators or bandits',
      'Using your Investigation to identify if areas have been recently disturbed',
      'Trying to use your bardic abilities to create signals visible across the desert',
      'Using your Insight to read the desert for signs of life or water',
      'Looking for opportunities to use your Charisma to negotiate with desert traders',
      'Using your Deception to make yourself seem more experienced with desert travel',
      'Practicing throwing your daggers at desert targets (trying not to lose them in the sand)',
      'Using your high Dexterity to find creative ways to stay cool',
      'Trying to use your Persuasion to convince the party to rest during the hottest hours',
      'Looking for opportunities to use your Charisma to get help from desert communities'
    ],
    'Swamp / Marsh': [
      'Looking for solid ground to walk on',
      'Checking for quicksand or deep mud',
      'Watching for dangerous creatures in the water',
      'Trying to avoid getting your gear wet',
      'Looking for paths through the marsh',
      'Checking for signs of disease or contamination',
      'Watching for insects and parasites',
      'Trying to find high ground or dry areas',
      'Looking for sources of fresh water',
      'Checking if the water is safe to cross',
      'Watching for predators that might be lurking',
      'Trying to maintain your footing on slippery ground',
      'Looking for any signs of civilization or paths',
      'Checking for poisonous plants or creatures',
      'Trying to move quietly to avoid alerting threats',
      'Looking for places where you can rest safely',
      'Wondering if the Tarrasque could hide in swamps (swamps are deep and murky)',
      'Checking your metal equipment constantly for swamp rust and rust monster damage',
      'Trying to convince your party that rust monsters definitely live in swamps (moisture + metal = rust)',
      'Asking if anyone thinks the Tarrasque might be causing these unusual swamp patterns',
      'Using your Stealth to move silently through the marsh',
      'Using your Survival to test ground stability before stepping',
      'Using your Persuasion to convince someone else to test questionable paths first',
      'Using your Insight to detect if areas are safe to cross',
      'Using your Deception to pretend you know how to navigate swamps (you don\'t)',
      'Trying to use your bardic performance to calm nervous swamp creatures',
      'Using your Goblin language skills if encountering swamp goblins',
      'Using your high Dexterity to balance on unstable ground or fallen logs',
      'Trying to use your Persuasion to get information about swamp dangers from locals',
      'Using your Stealth to avoid detection by swamp predators',
      'Using your Survival to create markers that won\'t sink',
      'Trying to use your bardic abilities to create signals through the mist',
      'Using your Insight to read the swamp for safe passages',
      'Looking for opportunities to use your Charisma to negotiate with swamp dwellers',
      'Using your Deception to make yourself seem more swamp-savvy than you are',
      'Practicing throwing your daggers at swamp targets (trying not to lose them in the muck)',
      'Using your high Dexterity to move quickly across unstable terrain',
      'Trying to use your Persuasion to convince the party to be more careful (you\'re worried)'
    ],
    'Carnival / Feywild (Wild Beyond The Witchlight)': [
      'Trying to win a carnival game but suspecting it\'s rigged (it probably is)',
      'Asking about lost things—yours, theirs, anyone\'s (you\'re collecting information)',
      'Checking if time feels weird here (Prismeer\'s time distortion is confusing)',
      'Looking for the Witchlight Carnival entrance (it moves, you know)',
      'Asking locals about the three hags—Bavlorna, Endelyn, Skabatha (just curious, totally normal)',
      'Trying to avoid making any deals with fey creatures (they\'re tricky)',
      'Checking if your emotions feel different here (lost things include feelings)',
      'Looking for signs of Zybilna\'s influence (she\'s the archfey, after all)',
      'Asking about carnival tickets and if they\'re actually worth anything',
      'Trying to figure out which domain you\'re in—Hither, Thither, or Yon',
      'Checking if the colors seem too vibrant (feywild is weird like that)',
      'Asking if anyone has seen a wayfarer fairy before (you\'re rare, you know)',
      'Trying to avoid Bavlorna\'s swamp (it smells terrible)',
      'Looking for Endelyn\'s theater (puppets are creepy)',
      'Asking about Skabatha\'s toys (they\'re probably cursed)',
      'Checking if your memories feel different here (time distortion affects memory)',
      'Trying to find the Palace of Heart\'s Desire (it\'s the goal, right?)',
      'Asking about contracts and deals (you don\'t want to get tricked)',
      'Looking for other carnival-goers who might know something',
      'Trying to blend in with the fey crowd (you\'re a fairy, it should work)',
      'Checking if your gear is still safe from rust monsters (they could be anywhere!)',
      'Asking about the Tarrasque (just in case it\'s in Prismeer—you never know)',
      'Trying to avoid eye contact with hags (they\'re dangerous)',
      'Looking for pixies, sprites, or other fey creatures to chat with',
      'Asking about the rules of Prismeer (there probably aren\'t any, but you should check)',
      'Trying to find the exit (if there is one)',
      'Checking if your wayfarer abilities work differently in the Feywild',
      'Asking about lost emotions—can you find them? (probably not, but worth asking)',
      'Trying to avoid getting caught in a hag\'s bargain',
      'Looking for clues about what happened to Zybilna',
      'Asking about carnival games and if winning actually matters',
      'Trying to figure out if you\'re in a time loop (Prismeer is confusing)',
      'Checking if your paranoia is justified here (it probably is)',
      'Asking about the Witchlight Monarchs (they\'re important, right?)',
      'Trying to avoid making promises (fey take those seriously)',
      'Looking for safe places to rest (are there any in Prismeer?)',
      'Asking about the mood of the realm (it changes, you know)',
      'Trying to collect information about the hags without drawing attention',
      'Checking if your bardic magic feels different in the Feywild',
      'Asking about lost things you might have (you should check)',
      'Trying to avoid getting lost (Prismeer makes that easy)',
      'Looking for other wayfarer fairies (you\'re curious if any are here)',
      'Asking about the best way to navigate Prismeer (there probably isn\'t one)',
      'Trying to figure out if you\'re supposed to be here (probably not)',
      'Checking if your gear is safe from fey magic (it might not be)',
      'Asking about carnival food and if it\'s actually safe to eat',
      'Trying to avoid getting turned into a puppet (Endelyn does that)',
      'Looking for information about the Palace of Heart\'s Desire',
      'Asking about the rules of hospitality (fey have weird rules)',
      'Trying to blend in while being obviously out of place',
      'Checking if your wayfarer mark means anything here (probably not)',
      'Asking about lost things while trying not to sound desperate',
      'Trying to find Sir Talavar (he\'s a fairy dragon, you know—very important)',
      'Asking about Jingle-Jangle and the key at Tellamy Hill (just curious)',
      'Looking for Glim (that goblin with the pizza uniform—you have questions)',
      'Trying to find the Walking Inn (the druid there has good information)',
      'Asking about mud muffins (they\'re enemies, but you\'re curious about the name)',
      'Looking for will-o\'-wisps (spirits of the drowned who want Zabilna back)',
      'Trying to find Clapperclaw the scarecrow (he knows the way to Thither)',
      'Asking about Thistlewhisk (the guide to Downfall)',
      'Checking if you need appropriate clothing for the Stinky Court (you probably do)',
      'Trying to figure out what "Spittlespew" means (found it in Bavlorna\'s cabinet)',
      'Asking about Wittershin\'s (running in place counter-clockwise—very important)',
      'Looking for Loomlurch (Skabatha\'s lair in the massive hollowed-out tree)',
      'Trying to find Balvdrova\'s spool of thread (need to get it from Skabatha)',
      'Asking about Igwil\'s Cauldron (it froze Zabilna\'s palace in time)',
      'Checking if anyone has seen portraits of the hag sisters (Bavlorna, Endelyn, Skabatha, Tasha)',
      'Trying to avoid the Bullywug king (he might not be on the level)',
      'Asking about Granny Nightshade (rules Thither, apparently)',
      'Looking for the deflated airship (there might be something useful there)',
      'Trying to figure out what the visions in the stream meant (they seemed like dreams)',
      'Asking about Sylvan writing (someone passed Vadania a note)',
      'Checking if anyone knows about the ceremony for the Stinky Court (you went through it)',
      'Trying to find Downfall (occupied by Bullywugs, but Clapperclaw is there)',
      'Asking about Tellamy Hill (Jingle-Jangle\'s cave is there)',
      'Looking for signs of Zabilna\'s frozen palace (time distortion is weird)',
      'Trying to avoid giant snakes (Sir Talavar warned about them)',
      'Asking about fairy dragons (Sir Talavar is one, and he\'s magnificent)',
      'Checking if anyone has seen a bird cage (Sir Talavar was in one)',
      'Trying to figure out what "appropriate clothing" means for the Stinky Court',
      'Asking about love letters (Wittershin\'s was referenced in them)',
      'Looking for clues about what happened to Zabilna (Igwil\'s Cauldron froze her)',
      'Trying to find the druid at the Walking Inn (she spits at Bavlorna)',
      'Asking about Bo (he was turned from a toad back to a dwarf)',
      'Checking if anyone knows about the cauldron food (Bo drank it)',
      'Trying to avoid getting turned into a toad (Bavlorna does that)',
      'Asking about the stream visions (each person saw something different)',
      'Looking for information about the hag sisters\' relationship (they\'re complicated)',
      'Trying to figure out why Bavlorna won\'t talk about Tasha (suspicious)',
      'Asking about the Stinky Court ceremony (you were inducted, remember?)',
      'Checking if anyone has seen Spittlespew (it was on a piece of paper)',
      'Trying to find the way to Thither (Clapperclaw knows, but you need to find him)',
      'Asking about Granny Nightshade vs Skabatha (who actually rules Thither?)',
      'Looking for clues about the frozen palace (time magic is tricky)',
      'Trying to avoid the Bullywug court (they have weird requirements)',
      'Asking about the key to Sir Talavar\'s cage (Jingle-Jangle has it)',
      'Checking if anyone knows about the airship at the top of the tower',
      'Trying to figure out what the amphibious humanoid was (it was in the basket)',
      'Asking about fairy dragon scales (Sir Talavar\'s are iridescent and rainbow-colored)',
      'Looking for information about ancient magic (Sir Talavar has an aura of it)',
      'Trying to avoid getting caught by giant snakes (Sir Talavar was very clear about this)',
      'Asking about the best way to get to Tellamy Hill (Jingle-Jangle\'s cave)',
      'Checking if anyone has seen Glim recently (that goblin needs help)',
      'Trying to figure out what the "shiny talking box" was (Glim found one)',
      'Asking about pizza delivery uniforms (Glim was wearing one)',
      'Looking for mushrooms that look like sausages (Glim\'s delivery mistake)',
      'Trying to find the Walking Inn druid (she wants Zabilna back in power)',
      'Asking about mud muffins (they\'re enemies, but the name is funny)',
      'Checking if anyone has seen will-o\'-wisps (spirits of the drowned)',
      'Trying to figure out why the will-o\'-wisps want Zabilna back',
      'Asking about Clapperclaw\'s pincer claws (he\'s a scarecrow guide)',
      'Looking for Downfall (Bullywugs occupy it)',
      'Trying to find Thistlewhisk (he guides people to Downfall)',
      'Asking about appropriate clothing for the Stinky Court (you had to wear some)',
      'Checking if anyone knows what "Spittlespew" means (it was in Bavlorna\'s cabinet)',
      'Trying to figure out Wittershin\'s (running in place counter-clockwise)',
      'Asking about Loomlurch (Skabatha\'s lair in Thither)',
      'Looking for the massive hollowed-out tree (that\'s Loomlurch)',
      'Trying to find Skabatha\'s portrait room (circular room with sister portraits)',
      'Asking about Balvdrova\'s spool of thread (need to get it from Skabatha)',
      'Checking if anyone knows why Bavlorna turned Bo back from a toad',
      'Trying to figure out what Igwil\'s Cauldron does (it froze Zabilna\'s palace)',
      'Asking about the frozen palace (time magic is weird)',
      'Looking for information about Zabilna (she\'s trapped in the frozen palace)',
      'Trying to avoid getting frozen in time (Igwil\'s Cauldron did that to Zabilna)',
      'Asking about the hag sisters\' portraits (Bavlorna, Endelyn, Skabatha, Tasha)',
      'Checking if anyone knows why Bavlorna won\'t talk about Tasha',
      'Trying to find the Bullywug king (he might not be trustworthy)',
      'Asking about the Stinky Court ceremony (you were officially inducted)',
      'Looking for clues about the stream visions (each person saw something different)',
      'Trying to figure out what the Sylvan note said (Vadania got one)',
      'Asking about Granny Nightshade (she rules Thither, apparently)'
    ]
  };

  // Critical Hit Descriptions
  const criticalHits = {
    'Arrows': [
      'I watch as my arrow pierces through a gap in their armor, striking true and drawing a spray of crimson',
      'My arrow finds its mark, sinking deep into their flesh with a satisfying thud',
      'My arrowhead digs between their ribs, and I see them gasp and stagger backward',
      'A perfectly aimed shot sends my arrow through their guard, embedding itself deep in their shoulder',
      'I watch my arrow strike with deadly precision, catching the light as it slices through the air before impact',
      'My arrow finds the weak point in their armor, piercing through like a hot knife through butter',
      'My projectile strikes true, and I see splinters of broken armor fly as it buries itself deep',
      'A masterful shot sends my arrow through their defenses, hitting with such force they stumble',
      'My arrowhead strikes with a crack, shattering through bone and I see shockwaves ripple through their body',
      'My arrow whistles through the air before striking home, drawing a line of blood across their skin',
      'My projectile embeds itself with a wet thud, the shaft quivering as they clutch at the wound',
      'A well-placed arrow finds its way through a joint in their armor, and they cry out in pain',
      'My arrow strikes with brutal force, tearing through fabric and flesh alike',
      'My shot is true—the arrowhead buries itself so deep that only the fletching remains visible',
      'My arrow pierces cleanly through, leaving a perfect hole as it exits their other side',
      'A perfectly timed shot sends my arrow through their raised arm, pinning it to their side',
      'My arrowhead buries itself in their leg, and they drop to one knee with a grunt',
      'My arrow strikes with such force it knocks them backward, the impact audible across the battlefield',
      'My arrow strikes like time distortion in Prismeer—here, then there, then everywhere at once',
      'My arrow finds its mark with fey precision, as if guided by the Witchlight itself'
    ],
    'Crossbolts': [
      'I watch my crossbolt tear through their armor like paper, its heavy head finding its mark with devastating force',
      'My bolt strikes with a thunderous impact, the sound echoing as it pierces deep into my target',
      'My crossbolt embeds itself with such force that I see splinters of bone fly outward',
      'A perfectly aimed bolt finds the gap between armor plates, sinking in with a sickening crunch',
      'My heavy projectile strikes true, its momentum carrying it through flesh and out the other side',
      'My crossbolt hits with brutal efficiency, the thick shaft quivering as it stands embedded',
      'My bolt strikes with a crack like thunder, shattering armor and bone in equal measure',
      'A masterful shot sends my crossbolt through their defenses, leaving a gaping wound in its wake',
      'My heavy bolt tears through their guard, the impact so strong it sends them reeling backward',
      'My bolt finds its mark with deadly precision, the broad head causing catastrophic damage',
      'My crossbolt strikes with such force it pins them to a nearby surface, leaving them helpless',
      'A well-placed bolt tears through their armor, the serrated edges catching and ripping',
      'My heavy projectile embeds itself deep, and I see the wound bleeding profusely as they struggle to remove it',
      'My crossbolt strikes with a wet thud, sinking in up to the fletching in an instant',
      'My bolt pierces through multiple layers, leaving a trail of destruction in its path',
      'A perfectly timed shot sends my crossbolt through their raised shield, hitting the arm beneath',
      'My heavy bolt strikes with devastating force, the impact audible even over the sounds of battle',
      'My projectile finds the perfect angle, slipping through their defenses like a bolt of lightning'
    ],
    'Swords': [
      'My blade cuts deep, drawing a line of red as it slices through their armor and flesh',
      'My sword strikes true, its edge finding a gap and biting deep into their side',
      'A masterful swing sends my blade through their guard, the steel singing as it cuts air then flesh',
      'My weapon strikes with deadly precision, and I see sparks fly as metal meets metal',
      'My sword cuts cleanly through, leaving a perfect slice that immediately begins to weep crimson',
      'My blade finds its mark, the sharp edge tearing through fabric and leather like parchment',
      'A perfectly timed strike sends my sword through their defenses, the impact staggering them',
      'My weapon strikes with brutal force, cleaving through armor and leaving a gaping wound',
      'My sword cuts with surgical precision, finding the exact spot between their ribs',
      'My blade strikes with a resounding clang before biting deep, and I hear metal grinding against bone',
      'A well-placed thrust sends my sword tip through their armor, sinking in up to the hilt',
      'My weapon cuts through their guard like butter, leaving a trail of destruction in its wake',
      'My sword strikes with such force it sends them spinning, blood arcing through the air',
      'A masterful cut sends my blade through their shoulder, the impact audible across the field',
      'My weapon finds the weak point, the edge catching and tearing through with brutal efficiency',
      'My blade strikes with deadly accuracy, cutting through chainmail links like they were thread',
      'A perfectly executed strike sends my sword through their defenses, leaving them reeling',
      'My weapon cuts deep, the steel glinting as it pulls free, leaving a wound that gapes wide'
    ],
    'Polearms': [
      'My polearm strikes with devastating reach, the blade finding its mark from an impossible angle',
      'My weapon extends my reach perfectly, the tip piercing through their armor with deadly precision',
      'My polearm cuts through the air before striking true, its length giving me the advantage',
      'A masterful thrust sends my weapon\'s tip through their defenses, sinking deep into flesh',
      'My polearm strikes with brutal force, the heavy blade cleaving through armor like paper',
      'My weapon\'s reach catches them off guard, the blade finding a gap they never saw coming',
      'A perfectly timed swing sends my polearm through their guard, the impact sending them backward',
      'My weapon strikes with such force that the shaft bends before springing back, the blade buried deep',
      'My polearm cuts through their defenses with surgical precision, finding the exact weak point',
      'A well-placed strike sends my blade through their armor, the wound immediately beginning to bleed',
      'My weapon finds its mark with deadly accuracy, the long reach ensuring they can\'t escape',
      'My polearm strikes with a thunderous impact, the sound echoing as metal meets flesh',
      'A masterful cut sends my blade through their side, leaving a trail of crimson in its wake',
      'My weapon strikes with brutal efficiency, the blade tearing through multiple layers',
      'My polearm cuts deep, the sharp edge leaving a perfect line that immediately starts to weep',
      'A perfectly executed thrust sends the tip through their guard, sinking in up to the crossguard',
      'My weapon strikes with such force it knocks them off balance, the blade buried in their shoulder',
      'My polearm finds its mark with deadly precision, the long weapon giving me the perfect angle'
    ],
    'Knives': [
      'My dagger finds its mark with deadly precision, slipping between armor plates like a whisper',
      'My blade strikes true, the small weapon finding a gap and sinking in up to the hilt',
      'A masterful throw sends my knife spinning through the air before embedding itself deep',
      'My dagger cuts with surgical precision, its edge finding exactly the right spot between ribs',
      'My blade strikes with unexpected force, the small weapon delivering a devastating blow',
      'My knife finds its way through their defenses, the sharp tip piercing through leather and flesh',
      'A perfectly timed strike sends my dagger through their guard, the blade sinking in silently',
      'My weapon strikes with deadly accuracy, the small size allowing it to slip through gaps',
      'My dagger cuts deep, drawing a line of crimson as it slides along bone',
      'A well-placed thrust sends my blade tip through their armor, finding the soft flesh beneath',
      'My knife strikes with brutal efficiency, the edge tearing through fabric and skin',
      'My dagger embeds itself with a wet thud, the hilt quivering as they clutch at the wound',
      'A masterful cut sends my blade through their defenses, leaving a trail of destruction',
      'My weapon finds its mark with deadly precision, the small blade delivering a fatal blow',
      'My knife strikes with such force it sends them staggering, the blade buried deep in their side',
      'A perfectly executed throw sends my dagger spinning end over end before striking true',
      'My blade cuts through their guard like a hot knife, the impact sending them reeling backward',
      'My dagger finds the perfect angle, slipping through their defenses with deadly silence'
    ],
    'Blunt Weapons': [
      'My weapon strikes with bone-crushing force, the impact audible even over the sounds of battle',
      'My mace finds its mark with devastating power, the heavy head crushing through armor and bone',
      'A masterful swing sends my weapon through their defenses, the impact sending them flying',
      'My blunt weapon strikes with thunderous force, the sound echoing as metal meets flesh',
      'My weapon hits with brutal efficiency, the weight behind it shattering armor and bone alike',
      'My mace strikes true, its spiked head tearing through leather and crushing what lies beneath',
      'A perfectly timed swing sends my weapon through their guard, the impact staggering them',
      'My weapon strikes with such force that armor buckles inward, and I hear the metal groaning under the pressure',
      'My blunt weapon finds its mark with deadly accuracy, crushing through layers of protection',
      'A well-placed strike sends my mace through their defenses, leaving a gaping wound',
      'My weapon hits with devastating power, the impact sending shockwaves through their body',
      'My weapon strikes with brutal force, the heavy head leaving a depression in their armor',
      'A masterful swing sends my weapon through their side, the impact audible across the battlefield',
      'My mace finds its mark with deadly precision, crushing through bone with a sickening crack',
      'My weapon strikes with such force it knocks them backward, the impact leaving them breathless',
      'A perfectly executed strike sends my blunt weapon through their guard, the sound echoing',
      'My weapon hits with devastating efficiency, the weight behind it ensuring maximum damage',
      'My mace strikes with bone-crushing force, leaving a perfect imprint of the weapon\'s head'
    ],
    'Axes and Hammers': [
      'My axe cleaves through armor and flesh with brutal force, leaving a gaping wound in its wake',
      'My weapon strikes true, the heavy blade finding its mark and cutting deep into my foe',
      'A masterful swing sends my axe through their defenses, the impact sending them spinning',
      'My hammer strikes with thunderous force, crushing through armor like it was made of tin',
      'My weapon finds its mark with devastating power, the sharp edge tearing through multiple layers',
      'My axe cuts through the air before striking home, its weight ensuring maximum damage',
      'A perfectly timed strike sends my weapon through their guard, the blade sinking deep',
      'My hammer strikes with bone-crushing force, the impact audible even over the din of battle',
      'My axe cleaves through their defenses with surgical precision, finding the exact weak point',
      'A well-placed swing sends my weapon through their side, leaving a trail of destruction',
      'My hammer finds its mark with deadly accuracy, crushing through bone with a sickening crack',
      'My weapon strikes with such force it sends them flying backward, the impact devastating',
      'A masterful cut sends my axe through their armor, the blade leaving a perfect gash',
      'My hammer strikes with brutal efficiency, the weight behind it ensuring catastrophic damage',
      'My axe finds its mark with deadly precision, cutting through flesh and bone alike',
      'A perfectly executed strike sends my weapon through their defenses, the impact staggering',
      'My hammer hits with thunderous force, the sound echoing as metal meets flesh and bone',
      'My weapon strikes with devastating power, leaving a perfect imprint of destruction in its wake'
    ],
    'Other Weapons': [
      'My weapon strikes with devastating force, finding its mark with deadly precision',
      'My unconventional weapon catches them off guard, striking from an angle they never expected',
      'A masterful strike sends my weapon through their defenses, the impact sending them reeling',
      'My weapon finds its mark with brutal efficiency, the unique design maximizing damage',
      'My weapon strikes true, its unusual form allowing it to slip through gaps in their armor',
      'A perfectly timed attack sends my weapon through their guard, leaving a gaping wound',
      'My weapon strikes with unexpected force, the impact catching them completely off guard',
      'My weapon finds its mark with deadly accuracy, the specialized design ensuring maximum damage',
      'A well-placed strike sends my weapon through their defenses, the impact audible across the field',
      'My weapon hits with devastating power, the unique shape allowing it to tear through armor',
      'My weapon strikes with brutal force, leaving a trail of destruction in its wake',
      'A masterful swing sends my weapon through their side, the impact staggering them backward',
      'My weapon finds its mark with surgical precision, the specialized tip finding the perfect angle',
      'My weapon strikes with such force it sends them spinning, blood arcing through the air',
      'A perfectly executed attack sends my weapon through their guard, leaving them helpless',
      'My weapon hits with devastating efficiency, the impact crushing through multiple layers',
      'My weapon strikes with thunderous force, the sound echoing as it meets its target',
      'My weapon finds its mark with deadly precision, leaving a perfect wound that gapes wide'
    ],
    'Fire': [
      'Flames erupt from my spell with searing intensity, scorching through their armor and flesh alike',
      'My fire magic strikes true, the heat so intense it leaves their metal glowing red-hot',
      'A burst of flame ignites their clothing, and I watch the fire spread with vicious hunger',
      'My magical fire burns with supernatural intensity, leaving charred marks in its wake',
      'My spell unleashes a torrent of flame that engulfs them, the heat blistering their skin',
      'Fire erupts from the point of impact, and I watch the flames dance as they consume everything in their path',
      'My magical flames strike with devastating force, leaving a trail of smoke and ash',
      'My fire magic burns through their defenses, the heat so intense it warps metal',
      'A perfectly aimed fire spell ignites their flesh, and I watch the flames spread with terrifying speed',
      'My spell unleashes a conflagration that wraps around them, burning away protection',
      'My fire magic strikes with such heat that steam rises from their wet armor',
      'Flames burst forth with explosive force, catching them completely off guard',
      'My magical fire burns with an otherworldly glow, leaving glowing embers in its wake',
      'My spell sends fire racing across their body, leaving trails of blackened flesh',
      'A masterful fire spell strikes true, the flames so hot they turn stone to glass',
      'The fire erupts with brutal efficiency, consuming everything in its path',
      'My spell unleashes a firestorm that surrounds them, the heat overwhelming',
      'Flames strike with deadly precision, leaving perfect burn patterns in their wake'
    ],
    'Cold': [
      'Ice forms instantly at the point of impact, spreading across their body like a frozen web',
      'My cold magic strikes true, the chill so intense it freezes their blood in their veins',
      'A blast of freezing energy encases them in ice, and I watch frost spread across their armor',
      'My magical cold bites deep, leaving patches of frostbite and frozen flesh',
      'My spell unleashes a wave of cold that freezes everything it touches',
      'Ice crystals form around the impact, the cold so severe it cracks their armor',
      'My freezing magic strikes with brutal force, leaving them shivering and numb',
      'My cold spell hits with such intensity that icicles form from their breath',
      'A perfectly aimed cold spell freezes their limbs solid, and I watch the ice spread rapidly',
      'My magical frost burns like fire, leaving pale, deadened patches of skin',
      'My cold magic strikes with deadly precision, freezing their blood as it flows',
      'Ice erupts from the spell impact, the cold so intense it shatters metal',
      'My freezing energy wraps around them, leaving a trail of frost in its wake',
      'My spell sends a wave of absolute zero that freezes everything it touches',
      'A masterful cold spell strikes true, and I watch the ice form intricate patterns as it spreads',
      'My cold magic hits with such force that condensation freezes mid-air',
      'My spell unleashes a blizzard that surrounds them, the cold overwhelming',
      'Freezing energy strikes with surgical precision, leaving perfect icicle formations'
    ],
    'Lightning': [
      'Lightning arcs from my spell with crackling intensity, electricity dancing across their body',
      'My lightning magic strikes true, the bolt so powerful it leaves their hair standing on end',
      'A bolt of lightning sears through the air before striking home, leaving scorch marks',
      'My magical electricity courses through their body, and I see their muscles spasm uncontrollably',
      'My spell unleashes a chain of lightning that dances between them and nearby objects',
      'Lightning erupts from the point of impact, the electricity so intense it lights up the area',
      'My magical bolt strikes with thunderous force, leaving them smoking and stunned',
      'My lightning spell hits with such power that sparks fly from their metal equipment',
      'A perfectly aimed lightning bolt strikes true, the electricity arcing through their armor',
      'My spell unleashes a storm of electricity that wraps around them, crackling with energy',
      'My lightning magic strikes with devastating precision, leaving them convulsing',
      'Electricity bursts forth with explosive force, the bolt finding the path of least resistance',
      'My magical lightning burns with an otherworldly glow, leaving charred paths in its wake',
      'My spell sends lightning racing through their body, leaving trails of scorched flesh',
      'A masterful lightning spell strikes true, the bolt so powerful it splits the air',
      'The electricity erupts with brutal efficiency, coursing through everything it touches',
      'My spell unleashes a web of lightning that surrounds them, the energy overwhelming',
      'Lightning strikes with deadly precision, leaving perfect branching patterns in its wake'
    ],
    'Thunder': [
      'My spell unleashes a concussive blast that reverberates through their body, shaking bones',
      'My thunder magic strikes true, the sound so intense it leaves their ears bleeding',
      'A wave of sonic force crashes into them, the impact audible for miles around',
      'My magical sound strikes with devastating force, leaving them disoriented and reeling',
      'My spell unleashes a thunderclap that echoes across the battlefield, deafening all nearby',
      'Sonic energy erupts from the point of impact, the sound so powerful it shatters nearby glass',
      'My thunderous magic strikes with brutal intensity, and I see them clutching their ears',
      'My sound spell hits with such force that the shockwave knocks them backward',
      'A perfectly aimed thunder spell strikes true, the concussive blast spreading outward',
      'My spell unleashes a roar that shakes the very ground, the vibration traveling through them',
      'My thunder magic strikes with deadly precision, the sound waves tearing at their flesh',
      'Sonic energy bursts forth with explosive force, the impact creating visible shockwaves',
      'My magical sound burns with an otherworldly intensity, leaving them dazed and confused',
      'My spell sends a wave of pure sound that tears through their defenses',
      'A masterful thunder spell strikes true, the blast so powerful it cracks stone',
      'The sonic energy erupts with brutal efficiency, leaving them deafened and disoriented',
      'My spell unleashes a storm of sound that surrounds them, the noise overwhelming',
      'Thunder strikes with surgical precision, leaving perfect patterns of destruction in its wake'
    ],
    'Psychic': [
      'My spell strikes their mind with crushing force, and I see them grasping at their head',
      'My psychic magic attacks their thoughts directly, the mental assault overwhelming',
      'A wave of psychic energy tears through their consciousness, leaving them reeling',
      'My magical mental attack strikes with devastating precision, targeting their deepest fears',
      'My spell unleashes a storm of psychic energy that batters their mind',
      'Psychic force erupts from the spell impact, the mental damage leaving them gasping',
      'My magical mind attack strikes with brutal intensity, leaving them disoriented',
      'My psychic spell hits with such force that blood trickles from their nose and ears',
      'A perfectly aimed mental assault strikes true, the psychic energy bypassing all defenses',
      'My spell unleashes a torrent of psychic power that overwhelms their senses',
      'My psychic magic strikes with deadly precision, leaving them mentally shattered',
      'Mental energy bursts forth with explosive force, the attack invisible but devastating',
      'My magical psychic assault burns with an otherworldly intensity, leaving them dazed',
      'My spell sends waves of psychic energy that tear through their mind',
      'A masterful psychic spell strikes true, the mental attack so powerful it leaves them catatonic',
      'The psychic energy erupts with brutal efficiency, leaving them unable to think clearly',
      'My spell unleashes a storm of mental energy that surrounds them, the attack overwhelming',
      'Psychic force strikes with surgical precision, leaving perfect patterns of mental damage'
    ],
    'Force': [
      'Pure magical energy erupts from my spell, the force so intense it pushes everything back',
      'My force magic strikes true, the raw power leaving no visible mark but devastating damage',
      'A blast of pure force crashes into them, the impact sending them flying backward',
      'My magical force strikes with devastating precision, bypassing all physical defenses',
      'My spell unleashes a wave of pure energy that tears through armor and flesh',
      'Force erupts from the point of impact, the magical energy so intense it distorts space',
      'My magical force strikes with brutal intensity, leaving them battered and bruised',
      'My force spell hits with such power that it creates visible ripples in the air',
      'A perfectly aimed force blast strikes true, the energy spreading outward like a shockwave',
      'My spell unleashes a torrent of raw magic that overwhelms their defenses',
      'My force magic strikes with deadly precision, the energy leaving perfect impact craters',
      'Pure magical energy bursts forth with explosive force, the blast invisible but devastating',
      'My magical force burns with an otherworldly glow, leaving them reeling from the impact',
      'My spell sends waves of pure force that tear through everything in their path',
      'A masterful force spell strikes true, the energy so powerful it creates a vacuum',
      'The force erupts with brutal efficiency, leaving them unable to maintain their footing',
      'My spell unleashes a storm of magical energy that surrounds them, the force overwhelming',
      'Pure force strikes with surgical precision, leaving perfect patterns of destruction'
    ],
    'Necrotic': [
      'Dark energy erupts from my spell, the necrotic power withering everything it touches',
      'My necrotic magic strikes true, the decay spreading rapidly across their flesh',
      'A wave of death energy washes over them, leaving their skin gray and lifeless',
      'My magical decay strikes with devastating force, aging them visibly before my eyes',
      'My spell unleashes a cloud of necrotic energy that withers flesh and bone',
      'Death magic erupts from the point of impact, the dark energy consuming their life force',
      'My necrotic spell strikes with brutal intensity, leaving patches of decayed flesh',
      'My death magic hits with such force that their life force visibly drains away',
      'A perfectly aimed necrotic spell strikes true, and I watch the decay spread like a disease',
      'My spell unleashes a torrent of dark energy that overwhelms their natural healing',
      'My necrotic magic strikes with deadly precision, leaving them looking aged and weak',
      'Death energy bursts forth with explosive force, the decay spreading rapidly',
      'My magical necrotic power burns with an otherworldly darkness, leaving them pale',
      'My spell sends waves of death energy that tear through their vitality',
      'A masterful necrotic spell strikes true, the decay so powerful it turns flesh to dust',
      'The death magic erupts with brutal efficiency, leaving them visibly weakened',
      'My spell unleashes a storm of necrotic energy that surrounds them, the decay overwhelming',
      'Necrotic force strikes with surgical precision, leaving perfect patterns of decay'
    ],
    'Radiant': [
      'Holy light erupts from my spell, the radiant energy burning away darkness and corruption',
      'My radiant magic strikes true, the divine light leaving them temporarily blinded',
      'A wave of pure light crashes into them, the holy energy overwhelming their defenses',
      'My magical radiance strikes with devastating force, leaving them bathed in golden light',
      'My spell unleashes a beam of divine energy that pierces through darkness and shadow',
      'Radiant energy erupts from the point of impact, the light so intense it illuminates everything',
      'My holy spell strikes with brutal intensity, leaving them dazzled and disoriented',
      'My radiant magic hits with such power that it leaves glowing marks on their skin',
      'A perfectly aimed divine spell strikes true, the holy light spreading outward',
      'My spell unleashes a torrent of radiant energy that overwhelms their defenses',
      'My radiant magic strikes with deadly precision, the light leaving perfect burn patterns',
      'Holy energy bursts forth with explosive force, the radiance blinding all nearby',
      'My magical light burns with an otherworldly brilliance, leaving them temporarily sightless',
      'My spell sends waves of radiant energy that tear through darkness and shadow',
      'A masterful radiant spell strikes true, the divine light so powerful it banishes evil',
      'The holy energy erupts with brutal efficiency, leaving them bathed in golden radiance',
      'My spell unleashes a storm of divine light that surrounds them, the radiance overwhelming',
      'Radiant force strikes with surgical precision, leaving perfect patterns of holy fire'
    ],
    'Acid': [
      'Corrosive acid erupts from my spell, the chemical reaction eating away at everything it touches',
      'My acid magic strikes true, the burning liquid dissolving armor and flesh alike',
      'A spray of acidic energy splashes across them, leaving bubbling wounds in its wake',
      'My magical acid strikes with devastating force, the corrosion spreading rapidly',
      'My spell unleashes a stream of caustic liquid that eats through metal and bone',
      'Acid erupts from the point of impact, and I hear the chemical reaction hissing and smoking',
      'My corrosive spell strikes with brutal intensity, leaving them covered in burns',
      'My acid magic hits with such force that it leaves visible trails of destruction',
      'A perfectly aimed acid spell strikes true, the liquid eating away at their defenses',
      'My spell unleashes a torrent of acidic energy that overwhelms their natural resistance',
      'My acid magic strikes with deadly precision, leaving perfect patterns of corrosion',
      'Caustic energy bursts forth with explosive force, the acid spreading rapidly',
      'My magical acid burns with an otherworldly intensity, leaving them in agony',
      'My spell sends waves of corrosive liquid that tear through everything they touch',
      'A masterful acid spell strikes true, the chemical reaction so powerful it melts stone',
      'The corrosive magic erupts with brutal efficiency, leaving them covered in burns',
      'My spell unleashes a storm of acidic energy that surrounds them, the corrosion overwhelming',
      'Acid strikes with surgical precision, leaving perfect patterns of chemical destruction'
    ]
  };

  // Critical Failure Descriptions
  const criticalFailures = {
    'Arrows': [
      'My arrow slips from my fingers, tumbling end over end before harmlessly bouncing off their armor',
      'My bowstring snaps with a loud crack, sending my arrow flying in a completely wrong direction',
      'I fumble the draw, and my arrow wobbles pathetically through the air before clattering to the ground',
      'My arrow catches on something and twists, spinning wildly before missing by a wide margin',
      'I lose my grip mid-draw, and my arrow tumbles from my bow before I even finish aiming',
      'My arrow ricochets off a nearby surface, nearly hitting one of my allies instead',
      'The fletching catches on my quiver, and my arrow spins awkwardly before falling short',
      'I overthink the shot and release too late, my arrow sailing harmlessly over their head',
      'My arrow disappears like a lost thing in Prismeer—here one moment, gone the next',
      'Time distortion makes my arrow arrive before I even shoot it—which is somehow worse',
      'My arrow gets caught in a hag\'s bargain and refuses to hit—even arrows have contracts here',
      'My arrow gets caught in a sudden gust of wind, veering wildly off course',
      'I draw too quickly and my arrow slips sideways, bouncing off the ground in front of them',
      'My fingers slip on the string, and my arrow launches at a weird angle into the distance',
      'I misjudge the distance completely, my arrow landing several feet short of my target',
      'My arrow nock breaks mid-draw, sending the arrow spinning uselessly to the side',
      'I release too early, and my arrow bounces harmlessly off their shield',
      'The arrowhead comes loose mid-flight, the shaft continuing forward but doing no damage',
      'I trip over my own feet while drawing, sending my arrow straight into the ground',
      'My arrow somehow gets tangled with another arrow in my quiver, both falling out uselessly',
      'I lose my balance and my arrow goes wide, nearly hitting a tree instead'
    ],
    'Crossbolts': [
      'My crossbolt jams in the mechanism, refusing to fire no matter how hard I pull the trigger',
      'I forget to properly load the bolt, and when I pull the trigger, nothing happens',
      'My crossbolt falls out of the groove mid-aim, clattering to the ground at my feet',
      'The string catches on my clothing, causing my bolt to fire straight down into the dirt',
      'I over-crank the windlass, and my crossbolt fires with such force it overshoots everything',
      'My bolt gets stuck in the track, and I waste precious seconds trying to free it',
      'I accidentally fire while still loading, the bolt getting tangled in the mechanism',
      'My crossbolt ricochets off a nearby rock, spinning back dangerously close to me',
      'The trigger mechanism sticks, and I spend too long trying to get it to fire',
      'I misload the bolt, and it falls out just as I\'m about to shoot',
      'My crossbolt gets caught in some nearby foliage, sticking harmlessly in a bush',
      'I pull the trigger too hard and the mechanism breaks, bolt falling out uselessly',
      'The wind catches my bolt, sending it spinning in a completely wrong direction',
      'I trip while aiming, and my bolt fires straight up into the air',
      'My crossbolt somehow gets tangled with my pack strap, refusing to fire properly',
      'I forget to reset the mechanism, and my bolt fires backward into the ground',
      'The bolt head comes loose, the shaft firing but doing absolutely nothing',
      'I fumble the loading process completely, dropping the bolt and wasting my turn'
    ],
    'Swords': [
      'My blade catches on my scabbard as I draw, nearly cutting myself instead',
      'I swing too hard and lose my grip, my sword flying from my hands to clatter on the ground',
      'My sword gets tangled in my cloak, causing me to stumble and miss completely',
      'I overextend my swing and lose my balance, falling forward onto my face',
      'My blade glances off their armor at the worst possible angle, sending sparks but no damage',
      'I trip over my own feet mid-swing, my sword harmlessly swishing through empty air',
      'My sword gets caught on a nearby obstacle, pulling me off balance',
      'I swing wildly and my blade bounces off their shield with a jarring impact',
      'My grip slips on the hilt, and my sword spins awkwardly in my hand',
      'I misjudge the distance completely, my blade cutting through air where they used to be',
      'My sword catches on a loose strap or piece of equipment, throwing off my entire attack',
      'I swing too early and they easily sidestep, my blade carving through nothing',
      'My blade somehow gets tangled with my belt, causing me to twist awkwardly',
      'I overthink the attack and telegraph it badly, giving them plenty of time to dodge',
      'My sword slips from my sweaty grip, spinning end over end before landing point-down',
      'I swing and my blade bounces harmlessly off their armor, the impact numbing my arm',
      'I get my sword caught between their armor plates, struggling to pull it free',
      'My attack is so badly executed that I nearly hit myself with the backswing'
    ],
    'Polearms': [
      'My polearm catches on overhead branches, getting stuck and leaving me exposed',
      'I misjudge the reach and overextend, losing my balance and stumbling forward',
      'My weapon gets tangled with nearby allies, causing me to pull back awkwardly',
      'I swing too wide and my polearm gets caught on something behind me',
      'The shaft slips through my hands, sliding forward and leaving me grasping at air',
      'I trip over the long weapon, sending myself sprawling to the ground',
      'My polearm gets caught between two nearby objects, trapping me in place',
      'I swing and the weapon\'s weight throws me off balance, spinning me around',
      'The shaft bends unexpectedly, sending my blade in a completely wrong direction',
      'I misjudge the angle and my weapon glances harmlessly off their side',
      'My polearm gets caught in some nearby ropes or vines, refusing to move',
      'I overextend and the weapon\'s length works against me, leaving me off balance',
      'The blade gets stuck in the ground mid-swing, requiring effort to pull free',
      'I lose my grip on the shaft, the weapon sliding through my hands uselessly',
      'My polearm catches on their armor in the worst way, doing no damage but getting stuck',
      'I swing too hard and the momentum carries me forward, nearly impaling myself',
      'The weapon gets tangled with my other equipment, causing a complete mess',
      'I fumble the grip completely, dropping the polearm and leaving myself defenseless'
    ],
    'Knives': [
      'My dagger slips from my fingers mid-throw, spinning wildly before clattering harmlessly to the ground',
      'I fumble the grip and my knife nearly cuts my own hand instead',
      'My dagger gets caught in my sleeve as I draw, causing me to stumble',
      'I throw too hard and my knife spins end over end before landing handle-first',
      'My blade slips from my sweaty palm, falling straight down at my feet',
      'I misjudge the throw completely, my dagger sailing way over their head',
      'My knife gets tangled in my belt as I reach for it, wasting precious seconds',
      'I drop my dagger while trying to throw it, the blade spinning uselessly away',
      'My blade catches on my clothing, refusing to come free when I need it',
      'I throw and my dagger ricochets off something nearby, nearly hitting me instead',
      'My grip fails mid-throw, sending my knife spinning in a completely wrong direction',
      'I forget I already threw my dagger and reach for another that isn\'t there',
      'My knife gets stuck in my scabbard, refusing to draw no matter how hard I pull',
      'I throw too early and my dagger bounces harmlessly off their shield',
      'My blade slips through my fingers, nearly cutting myself in the process',
      'I overthink the throw and my dagger goes wide, embedding in a nearby tree',
      'My knife gets caught on something as I draw, pulling me off balance',
      'I fumble the throw completely, my dagger clattering to the ground between us'
    ],
    'Blunt Weapons': [
      'My mace slips from my grip mid-swing, flying through the air before landing harmlessly',
      'I swing too hard and lose my balance, stumbling forward onto my knees',
      'My weapon gets caught on my own equipment, causing me to twist awkwardly',
      'I overextend the swing and my mace bounces harmlessly off their armor',
      'My grip fails and the weapon spins in my hand, nearly hitting myself',
      'I trip over my own feet while swinging, my mace carving through empty air',
      'My weapon gets tangled with nearby obstacles, refusing to move properly',
      'I swing and my mace catches on something behind me, pulling me backward',
      'The weight of my weapon throws me off balance, sending me spinning',
      'I misjudge the distance completely, my mace swinging through empty space',
      'My weapon slips through my sweaty hands, falling to the ground at my feet',
      'I swing too early and they easily dodge, my mace hitting nothing but air',
      'My mace gets caught between their armor plates, getting stuck there',
      'I overthink the attack and telegraph it badly, giving them time to prepare',
      'My weapon bounces off their shield with a jarring impact, numbing my arm',
      'I lose my grip completely, my mace flying from my hands to clatter away',
      'The weapon\'s weight works against me, pulling me off balance mid-swing',
      'I fumble the attack completely, my mace doing absolutely nothing useful'
    ],
    'Axes and Hammers': [
      'My axe gets stuck in the ground mid-swing, requiring all my strength to pull free',
      'I swing too hard and lose my grip, my axe spinning through the air dangerously',
      'My weapon catches on overhead obstacles, getting stuck and leaving me exposed',
      'I overextend and my axe bounces harmlessly off their armor with a dull thud',
      'My grip slips on the handle, and my axe nearly flies from my hands',
      'I trip while swinging, my axe carving a useless groove in the ground',
      'My axe gets tangled with my other equipment, causing a complete mess',
      'I swing and the weapon\'s weight pulls me forward, nearly cutting myself',
      'My axe head comes loose mid-swing, the handle continuing forward uselessly',
      'I misjudge the distance badly, my axe swinging through empty air',
      'My weapon gets caught on something nearby, refusing to move properly',
      'I swing too early and they easily sidestep, my axe hitting nothing',
      'My axe bounces off their shield with a jarring impact, nearly disarming me',
      'I lose my balance mid-swing, stumbling forward and nearly falling',
      'My grip fails completely, my axe clattering to the ground between us',
      'I overthink the attack and telegraph it terribly, giving them time to dodge',
      'My axe gets stuck between their armor pieces, requiring effort to free',
      'I fumble the swing completely, my axe doing absolutely no damage'
    ],
    'Other Weapons': [
      'My weapon slips from my grip, tumbling awkwardly before landing harmlessly',
      'I fumble the attack completely, my weapon doing nothing useful',
      'My grip fails mid-swing, sending my weapon spinning in a wrong direction',
      'I trip over my own feet, my weapon carving through empty air',
      'My weapon gets caught on something nearby, refusing to move properly',
      'I misjudge the distance completely, my attack hitting nothing',
      'My weapon bounces harmlessly off their armor, doing no damage',
      'I lose my balance mid-attack, stumbling forward uselessly',
      'My grip slips and my weapon nearly flies from my hands',
      'I overextend and my weapon gets stuck, requiring effort to free',
      'My attack is so badly executed that I nearly hit myself',
      'I swing too early and they easily dodge, my weapon hitting air',
      'My weapon gets tangled with my equipment, causing a mess',
      'I fumble completely, dropping my weapon and leaving myself exposed',
      'My attack telegraphs so badly they have plenty of time to prepare',
      'I trip while attacking, my weapon clattering harmlessly to the ground',
      'My weapon catches on something behind me, pulling me off balance',
      'I overthink the attack and completely miss, wasting my turn'
    ],
    'Fire': [
      'My fire spell fizzles out pathetically, leaving only a small puff of smoke',
      'I mispronounce the incantation and my flames sputter before dying completely',
      'My spell backfires slightly, singeing my own fingers instead of my target',
      'The magical fire refuses to ignite properly, leaving only warm air',
      'My flames erupt in the wrong direction, nearly hitting an ally instead',
      'I lose concentration mid-cast and my fire spell dies before reaching them',
      'My spell creates more smoke than fire, obscuring my vision uselessly',
      'The flames sputter and die immediately, leaving no trace of magic',
      'My fire magic fizzles at the last moment, doing absolutely nothing',
      'I cast too quickly and my spell fails to form properly',
      'My flames catch on something nearby instead, setting the wrong thing on fire',
      'The spell backfires completely, my own clothes smoking slightly',
      'I misjudge the spell\'s range and my fire dies out before reaching them',
      'My magical fire refuses to ignite, leaving only disappointment',
      'The flames sputter pathetically before dying, a complete failure',
      'I lose my focus and my fire spell fizzles out harmlessly',
      'My spell creates sparks but no actual fire, doing nothing useful',
      'The fire magic fails spectacularly, leaving only embarrassment'
    ],
    'Cold': [
      'My cold spell produces only a light breeze instead of freezing magic',
      'I mispronounce the incantation and my ice magic fails completely',
      'My freezing spell backfires, leaving my own fingers slightly numb',
      'The cold magic refuses to form properly, leaving only cool air',
      'I lose concentration and my ice spell melts before reaching them',
      'My spell creates more fog than ice, obscuring everything uselessly',
      'The freezing magic fizzles out pathetically, doing nothing',
      'I cast too quickly and my cold spell fails to take effect',
      'My ice magic hits the wrong target, freezing something nearby instead',
      'The spell backfires slightly, leaving me shivering instead of them',
      'My cold spell produces only condensation, no actual ice',
      'I misjudge the spell\'s power and my freezing magic fails',
      'My ice refuses to form properly, leaving only disappointment',
      'The cold magic sputters and dies immediately, a complete failure',
      'I lose my focus and my freezing spell fizzles out harmlessly',
      'My spell creates mist but no actual cold, doing nothing useful',
      'The freezing magic fails spectacularly, leaving only embarrassment',
      'My cold spell backfires completely, nearly freezing my own hands'
    ],
    'Lightning': [
      'My lightning spell produces only static electricity, crackling harmlessly',
      'I mispronounce the incantation and my bolt fizzles before forming',
      'My electrical magic backfires slightly, shocking my own fingers',
      'The lightning refuses to arc properly, leaving only sparks',
      'I lose concentration mid-cast and my bolt dies before reaching them',
      'My spell creates more light than actual lightning, doing no damage',
      'The electrical magic sputters pathetically before dying completely',
      'I cast too quickly and my lightning fails to form properly',
      'My bolt arcs in the wrong direction, nearly hitting an ally',
      'The spell backfires completely, leaving me with tingling fingers',
      'My lightning magic produces only static, no actual electrical damage',
      'I misjudge the spell\'s power and my bolt fizzles out harmlessly',
      'My electrical magic refuses to arc, leaving only disappointment',
      'The lightning sputters and dies immediately, a complete failure',
      'I lose my focus and my bolt fizzles out before reaching them',
      'My spell creates sparks but no actual lightning, doing nothing useful',
      'The electrical magic fails spectacularly, leaving only embarrassment',
      'My lightning spell backfires completely, nearly shocking myself'
    ],
    'Thunder': [
      'My thunder spell produces only a whisper instead of a roar',
      'I mispronounce the incantation and my sonic magic fails completely',
      'My sound spell backfires slightly, leaving my own ears ringing',
      'The thunder refuses to form properly, leaving only silence',
      'I lose concentration and my sonic blast dies before reaching them',
      'My spell creates more wind than sound, doing no actual damage',
      'The thunder magic fizzles out pathetically, producing only a pop',
      'I cast too quickly and my sound spell fails to resonate',
      'My thunder magic hits the wrong target, deafening something nearby instead',
      'The spell backfires completely, leaving me temporarily deafened',
      'My sonic spell produces only vibrations, no actual thunder',
      'I misjudge the spell\'s power and my thunder fails completely',
      'My sound magic refuses to amplify, leaving only disappointment',
      'The thunder sputters and dies immediately, a complete failure',
      'I lose my focus and my sonic spell fizzles out harmlessly',
      'My spell creates air movement but no actual sound, doing nothing useful',
      'The thunder magic fails spectacularly, leaving only embarrassment',
      'My sound spell backfires completely, nearly deafening myself'
    ],
    'Psychic': [
      'My psychic spell fizzles out pathetically, leaving only a mild headache',
      'I mispronounce the incantation and my mental magic fails completely',
      'My mind attack backfires slightly, leaving my own thoughts jumbled',
      'The psychic energy refuses to form properly, leaving only confusion',
      'I lose concentration and my mental assault dies before reaching them',
      'My spell creates more doubt than actual psychic damage, doing nothing',
      'The psychic magic sputters pathetically before failing completely',
      'I cast too quickly and my mind spell fails to penetrate',
      'My psychic attack hits the wrong target, affecting something nearby instead',
      'The spell backfires completely, leaving me temporarily disoriented',
      'My mental magic produces only mild confusion, no actual damage',
      'I misjudge the spell\'s power and my psychic attack fails',
      'My mind magic refuses to connect, leaving only disappointment',
      'The psychic energy sputters and dies immediately, a complete failure',
      'I lose my focus and my mental spell fizzles out harmlessly',
      'My spell creates thoughts but no actual psychic damage, doing nothing useful',
      'The psychic magic fails spectacularly, leaving only embarrassment',
      'My mind attack backfires completely, nearly overwhelming my own thoughts'
    ],
    'Force': [
      'My force spell produces only a light push instead of a powerful blast',
      'I mispronounce the incantation and my magic fails completely',
      'My force attack backfires slightly, pushing me backward instead',
      'The magical energy refuses to form properly, leaving only weak pressure',
      'I lose concentration and my force blast dies before reaching them',
      'My spell creates more wind than actual force, doing no damage',
      'The magic sputters pathetically before failing completely',
      'I cast too quickly and my force spell fails to materialize',
      'My magical force hits the wrong target, pushing something nearby instead',
      'The spell backfires completely, leaving me stumbling backward',
      'My force magic produces only air movement, no actual impact',
      'I misjudge the spell\'s power and my force attack fails',
      'My magic refuses to form properly, leaving only disappointment',
      'The force sputters and dies immediately, a complete failure',
      'I lose my focus and my spell fizzles out harmlessly',
      'My force creates movement but no actual damage, doing nothing useful',
      'The magic fails spectacularly, leaving only embarrassment',
      'My force spell backfires completely, nearly knocking myself over'
    ],
    'Necrotic': [
      'My necrotic spell fizzles out pathetically, leaving only mild discomfort',
      'I mispronounce the incantation and my death magic fails completely',
      'My decay spell backfires slightly, aging my own hands slightly',
      'The dark energy refuses to form properly, leaving only disappointment',
      'I lose concentration and my necrotic magic dies before reaching them',
      'My spell creates more sadness than actual decay, doing no damage',
      'The death magic sputters pathetically before failing completely',
      'I cast too quickly and my necrotic spell fails to take hold',
      'My decay magic hits the wrong target, affecting something nearby instead',
      'The spell backfires completely, leaving me feeling slightly weak',
      'My necrotic magic produces only mild unease, no actual damage',
      'I misjudge the spell\'s power and my decay attack fails',
      'My dark magic refuses to manifest, leaving only disappointment',
      'The necrotic energy sputters and dies immediately, a complete failure',
      'I lose my focus and my death spell fizzles out harmlessly',
      'My spell creates dread but no actual decay, doing nothing useful',
      'The necrotic magic fails spectacularly, leaving only embarrassment',
      'My decay spell backfires completely, nearly affecting my own vitality'
    ],
    'Radiant': [
      'My radiant spell produces only a dim glow instead of brilliant light',
      'I mispronounce the incantation and my holy magic fails completely',
      'My divine spell backfires slightly, leaving my own eyes dazzled',
      'The holy energy refuses to form properly, leaving only weak light',
      'I lose concentration and my radiant magic dies before reaching them',
      'My spell creates more warmth than actual divine damage, doing nothing',
      'The holy magic sputters pathetically before failing completely',
      'I cast too quickly and my radiant spell fails to manifest',
      'My divine light hits the wrong target, illuminating something nearby instead',
      'The spell backfires completely, leaving me temporarily blinded',
      'My radiant magic produces only mild brightness, no actual damage',
      'I misjudge the spell\'s power and my holy attack fails',
      'My divine magic refuses to shine properly, leaving only disappointment',
      'The radiant energy sputters and dies immediately, a complete failure',
      'I lose my focus and my holy spell fizzles out harmlessly',
      'My spell creates light but no actual divine damage, doing nothing useful',
      'The radiant magic fails spectacularly, leaving only embarrassment',
      'My holy spell backfires completely, nearly blinding myself'
    ],
    'Acid': [
      'My acid spell produces only a light mist instead of corrosive liquid',
      'I mispronounce the incantation and my caustic magic fails completely',
      'My acid attack backfires slightly, leaving my own fingers slightly irritated',
      'The corrosive energy refuses to form properly, leaving only harmless vapor',
      'I lose concentration and my acid spell dissipates before reaching them',
      'My spell creates more steam than actual acid, doing no damage',
      'The caustic magic sputters pathetically before failing completely',
      'I cast too quickly and my acid spell fails to materialize',
      'My corrosive magic hits the wrong target, affecting something nearby instead',
      'The spell backfires completely, leaving me with mild skin irritation',
      'My acid magic produces only harmless moisture, no actual corrosion',
      'I misjudge the spell\'s power and my acid attack fails',
      'My caustic magic refuses to form properly, leaving only disappointment',
      'The acid sputters and dies immediately, a complete failure',
      'I lose my focus and my corrosive spell fizzles out harmlessly',
      'My spell creates vapor but no actual acid, doing nothing useful',
      'The acid magic fails spectacularly, leaving only embarrassment',
      'My caustic spell backfires completely, nearly affecting my own equipment'
    ]
  };

  // Skill Check Results - Success and Failure descriptions
  const skillChecks = {
    'Acrobatics - Success': [
      'I gracefully flip over the obstacle, landing perfectly on my feet',
      'My body moves like liquid, flowing through the narrow space with ease',
      'I execute a perfect cartwheel, my feet barely touching the ground',
      'With a fluid motion, I balance on the narrow beam as if I were born to it',
      'I tumble through the air, landing in a perfect three-point stance',
      'My movements are so smooth, I make it look effortless',
      'I slide under the obstacle with inches to spare, popping up on the other side',
      'With practiced grace, I leap from surface to surface like a cat',
      'I contort my body through the opening, every muscle working in perfect harmony',
      'My acrobatic prowess shines as I navigate the challenge flawlessly'
    ],
    'Acrobatics - Failure': [
      'I attempt a flip but land flat on my back with a loud thud',
      'My foot slips and I tumble awkwardly to the ground',
      'I misjudge the distance and crash into the obstacle instead of over it',
      'My balance fails me completely, and I fall in an undignified heap',
      'I try to be graceful but end up looking like a flailing chicken',
      'My acrobatic attempt ends with me sprawled on the ground, dignity lost',
      'I slip and slide, unable to maintain my footing on the narrow surface',
      'My body refuses to cooperate, and I fall in a tangle of limbs',
      'I attempt a cartwheel but lose my balance halfway through',
      'My acrobatic skills abandon me at the worst possible moment'
    ],
    'Animal Handling - Success': [
      'The creature calms under my gentle touch, recognizing a friend',
      'I speak softly to the animal, and it responds with trust',
      'My understanding of animals shines through as the beast relaxes',
      'The creature recognizes my calm demeanor and approaches willingly',
      'I read the animal\'s body language perfectly and respond accordingly',
      'With patience and care, I gain the creature\'s confidence',
      'The animal senses my good intentions and allows me closer',
      'I communicate with the beast in a way it understands, earning its trust',
      'My gentle approach wins over the wary creature',
      'The animal responds to my soothing presence, calming immediately'
    ],
    'Animal Handling - Failure': [
      'The creature sees me as a threat and backs away, baring its teeth',
      'My approach startles the animal, causing it to flee',
      'I misread the creature\'s signals and make it more agitated',
      'The beast doesn\'t trust me and shows clear signs of aggression',
      'My attempts to calm the animal only make it more nervous',
      'The creature sees through my facade and remains wary',
      'I move too quickly and spook the animal into defensive posture',
      'The beast doesn\'t respond to my attempts, remaining hostile',
      'My lack of understanding causes the creature to become aggressive',
      'The animal senses my uncertainty and refuses to cooperate'
    ],
    'Arcana - Success': [
      'I recognize the magical pattern immediately, understanding its purpose',
      'My knowledge of arcane theory helps me decipher the enchantment',
      'The magical energy reveals its secrets to my trained eye',
      'I identify the spell components and their interactions perfectly',
      'My arcane expertise allows me to understand the magical phenomenon',
      'The runes and symbols make perfect sense to my educated mind',
      'I trace the magical energy flow and understand its source',
      'My knowledge of magical theory helps me solve the puzzle',
      'The enchantment\'s purpose becomes clear through my arcane studies',
      'I recognize the school of magic and its specific application'
    ],
    'Arcana - Failure': [
      'The magical symbols look like gibberish to my untrained eye',
      'I can\'t make sense of the arcane patterns, despite my best efforts',
      'The magical energy confuses me, its purpose unclear',
      'My knowledge fails me, and the enchantment remains a mystery',
      'The runes might as well be random scribbles for all I understand',
      'I recognize it\'s magic, but that\'s about all I can determine',
      'The arcane theory escapes me, leaving me baffled',
      'My magical education doesn\'t cover this particular phenomenon',
      'The spell components make no sense in this configuration',
      'I stare at the magic, completely lost and confused'
    ],
    'Athletics - Success': [
      'I summon all my strength and easily overcome the obstacle',
      'My muscles strain but hold firm, allowing me to succeed',
      'With a powerful effort, I lift/push/climb with impressive force',
      'My physical prowess shines as I complete the feat of strength',
      'I channel my inner strength and accomplish the task effortlessly',
      'My body responds perfectly to the physical challenge',
      'With determination and power, I achieve the athletic feat',
      'My strength proves more than sufficient for the task',
      'I execute the physical challenge with impressive skill',
      'My athletic ability allows me to overcome the obstacle easily'
    ],
    'Athletics - Failure': [
      'My muscles strain but fail me at the critical moment',
      'I attempt the feat but lack the strength to complete it',
      'My grip slips, and I fall short of the goal',
      'I overestimate my abilities and fail spectacularly',
      'The physical challenge proves too much for my current strength',
      'My body betrays me, unable to perform the required action',
      'I strain with all my might but can\'t overcome the obstacle',
      'My strength fails me, leaving me exhausted and unsuccessful',
      'I attempt the athletic feat but fall short in every way',
      'The physical task proves beyond my capabilities'
    ],
    'Deception - Success': [
      'My lie flows smoothly, convincing even myself for a moment',
      'I weave a believable tale that seems completely authentic',
      'My deception is so convincing, they don\'t question a word',
      'I tell the perfect lie, hitting all the right emotional notes',
      'My false story sounds more believable than the truth',
      'I craft a deception so smooth, it\'s practically art',
      'My lie is perfectly tailored to what they want to hear',
      'I deceive them effortlessly, my words ringing with false sincerity',
      'My fabricated story holds up under their scrutiny',
      'I spin a tale so convincing, they accept it without hesitation'
    ],
    'Deception - Failure': [
      'My lie is so transparent, a child could see through it',
      'I stumble over my words, making my deception obvious',
      'My story falls apart under the slightest questioning',
      'I can\'t maintain eye contact, giving away my deception',
      'My lie contradicts itself, revealing the truth',
      'I tell such a bad lie, they laugh at my attempt',
      'My deception is so clumsy, it\'s almost insulting',
      'I can\'t keep my story straight, contradicting myself repeatedly',
      'My false tale crumbles immediately under scrutiny',
      'I attempt to deceive but fail so badly, they see right through me'
    ],
    'History - Success': [
      'I recall the exact details of this historical event',
      'My knowledge of history provides the perfect context',
      'I remember reading about this in ancient texts',
      'The historical significance becomes clear through my studies',
      'I can place this event precisely in the timeline',
      'My historical knowledge helps me understand the situation',
      'I remember the key figures and their roles in this event',
      'My studies of the past reveal the truth of the matter',
      'I can connect this to other historical events I\'ve studied',
      'The historical context makes perfect sense to my educated mind'
    ],
    'History - Failure': [
      'I draw a complete blank on this historical period',
      'My memory fails me, and I can\'t recall the details',
      'I think I remember something, but I\'m probably wrong',
      'The historical context escapes me completely',
      'I know I studied this, but I can\'t remember any of it',
      'My historical knowledge doesn\'t cover this particular event',
      'I confuse this with a different historical period',
      'I remember something, but I\'m not sure if it\'s relevant',
      'The historical details are lost in the fog of my memory',
      'I can\'t place this event in any historical context I know'
    ],
    'Insight - Success': [
      'I read their body language perfectly, understanding their true intentions',
      'My insight reveals what they\'re really thinking',
      'I see through their facade to their actual motives',
      'Their tells are obvious to my trained eye',
      'I understand their true feelings despite their words',
      'My insight pierces through their deception',
      'I can sense their hidden emotions and motivations',
      'Their body language tells me everything I need to know',
      'I see the truth behind their carefully constructed mask',
      'My insight reveals their real intentions clearly'
    ],
    'Insight - Failure': [
      'I completely misread their intentions and body language',
      'Their true motives remain hidden from my insight',
      'I can\'t tell if they\'re lying or telling the truth',
      'Their behavior confuses me, and I draw the wrong conclusions',
      'I misinterpret their signals completely',
      'My insight fails me, and I see only what they want me to see',
      'I can\'t read their true intentions at all',
      'Their facade is too convincing for my insight to penetrate',
      'I misjudge their character and motivations entirely',
      'My insight leads me to completely wrong conclusions'
    ],
    'Intimidation - Success': [
      'My threat lands perfectly, and they visibly shrink back',
      'I project such menace that they immediately comply',
      'My intimidating presence makes them reconsider their position',
      'They recognize the danger in my words and back down',
      'My threat is so convincing, they believe every word',
      'I loom over them, making my point with terrifying clarity',
      'My intimidating demeanor leaves no doubt about the consequences',
      'They crumble under my menacing presence',
      'My threat strikes fear into their heart',
      'I make it clear that crossing me would be a terrible mistake'
    ],
    'Intimidation - Failure': [
      'My threat falls flat, and they laugh at my attempt',
      'I try to be intimidating but come across as comical instead',
      'My attempt at menace fails spectacularly',
      'They see through my bluster and aren\'t impressed',
      'I try to intimidate but only succeed in looking foolish',
      'My threatening words sound weak and unconvincing',
      'They aren\'t fazed by my attempt at intimidation',
      'I fail to project the menace I intended',
      'My intimidation attempt backfires, making me look pathetic',
      'They see my threat as empty and ignore it completely'
    ],
    'Investigation - Success': [
      'I notice the crucial detail that everyone else missed',
      'My careful examination reveals the hidden clue',
      'I piece together the evidence to form a clear picture',
      'My investigation uncovers the truth others overlooked',
      'I find the key piece of information that solves the puzzle',
      'My attention to detail reveals what was hidden in plain sight',
      'I connect the dots that others couldn\'t see',
      'My thorough investigation pays off with important discoveries',
      'I examine the evidence and understand what really happened',
      'My investigative skills reveal the secrets others missed'
    ],
    'Investigation - Failure': [
      'I search thoroughly but find nothing of value',
      'My investigation misses the crucial detail right in front of me',
      'I can\'t make sense of the evidence, no matter how hard I try',
      'The clues don\'t add up, and I draw the wrong conclusions',
      'I search in all the wrong places, finding nothing useful',
      'My investigation leads me down the wrong path',
      'I miss the obvious clue that would solve everything',
      'The evidence confuses me, and I can\'t piece it together',
      'I investigate but come up empty-handed',
      'My search reveals nothing, leaving me frustrated and clueless'
    ],
    'Medicine - Success': [
      'I diagnose the problem accurately and know exactly how to treat it',
      'My medical knowledge helps me stabilize the condition',
      'I recognize the symptoms and apply the correct treatment',
      'My healing skills prove effective in treating the ailment',
      'I identify the cause and know the proper remedy',
      'My medical expertise allows me to help effectively',
      'I assess the injury correctly and treat it appropriately',
      'My knowledge of medicine guides me to the right solution',
      'I recognize what\'s wrong and how to fix it',
      'My healing touch and knowledge combine to help the patient'
    ],
    'Medicine - Failure': [
      'I misdiagnose the problem completely',
      'My medical knowledge fails me, and I can\'t help',
      'I have no idea what\'s wrong or how to treat it',
      'My attempts at healing only make things worse',
      'I confuse the symptoms and apply the wrong treatment',
      'My medical knowledge doesn\'t cover this particular ailment',
      'I can\'t figure out what\'s wrong, despite my best efforts',
      'My healing attempts are ineffective and possibly harmful',
      'I misread the symptoms and make the wrong diagnosis',
      'My medical skills prove inadequate for the situation'
    ],
    'Nature - Success': [
      'I recognize the plant/animal/terrain immediately from my studies',
      'My knowledge of nature helps me understand the environment',
      'I identify the natural phenomenon and its significance',
      'My understanding of the natural world reveals important information',
      'I know exactly what this is and how it behaves',
      'My nature knowledge helps me navigate and understand',
      'I recognize the signs and what they mean',
      'My studies of nature provide the perfect insight',
      'I understand the natural world\'s workings here',
      'My knowledge of nature guides me to the right conclusion'
    ],
    'Nature - Failure': [
      'I have no idea what this plant/animal/terrain is',
      'My nature knowledge fails me completely',
      'I can\'t identify the natural phenomenon at all',
      'The environment confuses me, and I draw wrong conclusions',
      'I misidentify what I\'m looking at',
      'My understanding of nature doesn\'t help here',
      'I can\'t make sense of the natural signs around me',
      'My nature studies don\'t cover this particular subject',
      'I misread the natural environment completely',
      'The natural world remains a mystery to me in this case'
    ],
    'Perception - Success': [
      'I notice the detail that everyone else missed',
      'My sharp eyes catch what others overlooked',
      'I spot the hidden thing immediately',
      'My perception reveals what was concealed',
      'I notice something important that changes everything',
      'My keen senses alert me to the crucial detail',
      'I see what others couldn\'t, thanks to my sharp perception',
      'My attention to detail pays off with an important discovery',
      'I notice the subtle clue that others missed',
      'My perception cuts through the distractions to the truth'
    ],
    'Perception - Failure': [
      'I miss the obvious thing right in front of me',
      'My perception fails me, and I notice nothing',
      'I\'m so distracted that I miss everything important',
      'The crucial detail escapes my notice completely',
      'I look but don\'t see what I should',
      'My perception is clouded, and I miss the important details',
      'I fail to notice what\'s right there in plain sight',
      'My attention wanders, and I miss everything',
      'I can\'t focus, and important details slip past me',
      'My perception betrays me, leaving me blind to the obvious'
    ],
    'Performance - Success': [
      'My performance captivates the audience completely',
      'I deliver a flawless performance that moves the crowd',
      'My artistic skill shines through in every note/word/gesture',
      'I perform so well that the audience is spellbound',
      'My performance is so good, it brings tears to their eyes',
      'I execute the performance perfectly, earning admiration',
      'My artistic talent creates a truly memorable experience',
      'I perform with such skill that the audience is amazed',
      'My performance exceeds expectations in every way',
      'I deliver a performance that will be remembered for years'
    ],
    'Performance - Failure': [
      'My performance falls completely flat',
      'I forget the words/notes and stumble awkwardly',
      'My artistic attempt is met with awkward silence',
      'I perform so badly that people look away in embarrassment',
      'My performance is a complete disaster',
      'I try to perform but fail spectacularly',
      'My artistic skills abandon me at the worst moment',
      'I deliver a performance so bad, it\'s painful to watch',
      'I stumble through the performance, making multiple mistakes',
      'My performance is so awkward, the audience cringes'
    ],
    'Persuasion - Success': [
      'My words strike the perfect chord, and they agree',
      'I present my argument so convincingly that they\'re won over',
      'My persuasion is so effective, they change their mind',
      'I find exactly the right words to convince them',
      'My argument is so compelling, they can\'t refuse',
      'I persuade them effortlessly with perfect logic and charm',
      'My words work like magic, winning them over completely',
      'I convince them so thoroughly, they wonder why they ever disagreed',
      'My persuasion skills prove more than sufficient',
      'I make my case so well that they agree without hesitation'
    ],
    'Persuasion - Failure': [
      'My argument falls flat, and they remain unconvinced',
      'I try to persuade but only make them more resistant',
      'My words fail to have any impact on their opinion',
      'I present my case poorly, and they reject it completely',
      'My persuasion attempt backfires, making them more stubborn',
      'I can\'t find the right words to convince them',
      'My argument is weak, and they see right through it',
      'I try to persuade but only succeed in annoying them',
      'My words have no effect, and they remain unmoved',
      'I fail to make my case, and they dismiss me entirely'
    ],
    'Religion - Success': [
      'I recall the exact religious doctrine that applies here',
      'My knowledge of religion provides the perfect insight',
      'I remember the sacred texts that explain this situation',
      'My religious studies help me understand the divine significance',
      'I recognize the religious symbol/ritual and its meaning',
      'My knowledge of faith guides me to the right understanding',
      'I recall the theological principle that explains everything',
      'My religious education provides the perfect context',
      'I understand the divine purpose behind this situation',
      'My knowledge of religion reveals the truth'
    ],
    'Religion - Failure': [
      'I draw a complete blank on this religious matter',
      'My religious knowledge fails me completely',
      'I can\'t remember the relevant doctrine or text',
      'The religious significance escapes my understanding',
      'I think I know something, but I\'m probably wrong',
      'My religious studies don\'t cover this particular subject',
      'I confuse this with a different religious tradition',
      'The theological meaning is lost on me',
      'I can\'t make sense of the religious context',
      'My knowledge of religion doesn\'t help me here'
    ],
    'Sleight of Hand - Success': [
      'My fingers move so quickly, no one notices what I did',
      'I execute the sleight perfectly, completely undetected',
      'My dexterous hands work their magic flawlessly',
      'I perform the trick so smoothly, it\'s invisible',
      'My sleight of hand is so good, it\'s like magic',
      'I accomplish the task without anyone being the wiser',
      'My fingers work with perfect precision and speed',
      'I execute the sleight flawlessly, leaving no trace',
      'My dexterity allows me to succeed completely unnoticed',
      'I perform the sleight so well, it\'s as if it never happened'
    ],
    'Sleight of Hand - Failure': [
      'I fumble the sleight, making it completely obvious',
      'My fingers betray me, and everyone sees what I did',
      'I drop what I\'m trying to manipulate, revealing my attempt',
      'My sleight of hand fails spectacularly',
      'I try to be subtle but only succeed in being clumsy',
      'My dexterity fails me, and I\'m caught red-handed',
      'I attempt the sleight but make it painfully obvious',
      'My fingers refuse to cooperate, ruining the attempt',
      'I fumble so badly that everyone notices',
      'My sleight of hand is so clumsy, it\'s embarrassing'
    ],
    'Stealth - Success': [
      'I move like a shadow, completely undetected',
      'My stealth is so perfect, I\'m practically invisible',
      'I blend into the environment seamlessly',
      'My movements are silent and undetectable',
      'I slip past unnoticed, like a ghost',
      'My stealth skills allow me to move unseen',
      'I become one with the shadows, completely hidden',
      'My careful movements keep me perfectly concealed',
      'I move so quietly and carefully, no one notices',
      'My stealth is flawless, and I remain completely undetected'
    ],
    'Stealth - Failure': [
      'I step on something loud, alerting everyone to my presence',
      'My stealth attempt fails completely, and I\'m spotted immediately',
      'I make so much noise that stealth becomes impossible',
      'I try to hide but stick out like a sore thumb',
      'My clumsy movements give away my position',
      'I attempt stealth but only succeed in being obvious',
      'I make a noise that alerts everyone to my presence',
      'My stealth skills abandon me at the worst moment',
      'I try to be sneaky but only succeed in being loud',
      'My attempt at stealth is a complete failure'
    ],
    'Survival - Success': [
      'I read the signs perfectly and know exactly what to do',
      'My survival skills guide me to the right decision',
      'I recognize the danger and know how to avoid it',
      'My knowledge of survival helps me navigate safely',
      'I find exactly what I need using my survival expertise',
      'My survival instincts prove correct',
      'I understand the environment and how to thrive in it',
      'My survival knowledge keeps me safe and prepared',
      'I read the natural signs and respond appropriately',
      'My survival skills allow me to succeed in the wilderness'
    ],
    'Survival - Failure': [
      'I misread the signs and make the wrong decision',
      'My survival knowledge fails me completely',
      'I can\'t find what I need, despite my best efforts',
      'I make a survival mistake that could be dangerous',
      'My survival instincts lead me astray',
      'I misjudge the situation and choose poorly',
      'My survival skills don\'t help me here',
      'I fail to recognize the danger until it\'s too late',
      'I make a critical survival error',
      'My knowledge of survival proves inadequate'
    ]
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const content = $('#content');
  
  
  // Debug helper function - can be called from console (only in debug mode)
  if (DEBUG) {
    window.debugGenerators = function() {
      debugLog('=== Generator Debug Info ===');
      const userGens = loadUserGenerators();
      const deleted = loadDeletedGeneratorDefaults();
      const edited = loadEditedDefaults();
      debugLog('User generators:', userGens);
      debugLog('Deleted defaults:', deleted);
      debugLog('Edited defaults:', edited);
      debugLog('Merged battle cries:', getMergedGenerators('battleCries'));
      debugLog('Merged insults:', getMergedGenerators('insults'));
      debugLog('Merged compliments:', getMergedGenerators('compliments'));
      debugLog('Raw localStorage:', {
        generators: localStorage.getItem(generatorsKey),
        deletedDefaults: localStorage.getItem(deletedGeneratorDefaultsKey),
        editedDefaults: localStorage.getItem(editedDefaultsKey)
      });
      return { userGens, deleted, edited };
    };
  }
  
  // Clear all Blingus data - can be called from console
  window.clearBlingusData = function() {
    if (confirm('Clear ALL Blingus data? This will delete favorites, custom items, history, generators, and all customizations. This cannot be undone!')) {
      const keys = [
        favoritesKey,
        userItemsKey,
        deletedDefaultsKey,
        historyKey,
        generatorsKey,
        editedDefaultsKey,
        deletedGeneratorDefaultsKey,
        darkModeKey
      ];
      keys.forEach(key => localStorage.removeItem(key));
      debugLog('✓ Cleared all Blingus data');
      showToast('All data cleared. Reloading...');
      setTimeout(() => location.reload(), RELOAD_DELAY_MS);
    }
  };
  
  const sectionSelect = $('#sectionSelect');
  const categorySelect = $('#categorySelect');
  const favoritesOnly = $('#favoritesOnly');
  const searchInput = $('#searchInput');
  const clearBtn = $('#clearBtn');
  const toast = $('#toast');
  const addEditBtn = $('#addEditBtn');
  const editModal = $('#editModal');
  const editText = $('#editText');
  const editSong = $('#editSong');
  const editArtist = $('#editArtist');
  const editAdult = $('#editAdult');
  const editYoutube = $('#editYoutube');
  const editStartTime = $('#editStartTime');
  const youtubeFields = $('#youtubeFields');
  const testYoutubeBtn = $('#testYoutubeBtn');
  const saveEditBtn = $('#saveEditBtn');
  const cancelEditBtn = $('#cancelEditBtn');
  const deleteEditBtn = $('#deleteEditBtn');
  const modalTitle = $('#modalTitle');
  const songLabel = $('#songLabel');
  const artistLabel = $('#artistLabel');
  const adultLabel = $('#adultLabel');
  const modalClose = $('.modal__close', editModal);
  const youtubePlayerModal = $('#youtubePlayerModal');
  const youtubePlayerFrame = $('#youtubePlayerFrame');
  const youtubePlayerTitle = $('#youtubePlayerTitle');
  const youtubePlayerClose = $('#youtubePlayerClose');
  const youtubePlayerCloseBtn = $('#youtubePlayerCloseBtn');
  const youtubeFallback = $('#youtubeFallback');
  const youtubeOpenTabBtn = $('#youtubeOpenTabBtn');
  const youtubeSuggestion = $('#youtubeSuggestion');
  const youtubeSuggestionText = $('#youtubeSuggestionText');
  const youtubeSearchBtn = $('#youtubeSearchBtn');
  const generatorModal = $('#generatorModal');
  const generatorTitle = $('#generatorTitle');
  const generatorText = $('#generatorText');
  const generatorCopyBtn = $('#generatorCopyBtn');
  const generatorCloseBtn = $('#generatorCloseBtn');
  const generatorModalClose = $('#generatorModalClose');
  const historyModal = $('#historyModal');
  const historyList = $('#historyList');
  const historyModalClose = $('#historyModalClose');
  const historyCloseBtn = $('#historyCloseBtn');
  const manageGeneratorsBtn = $('#manageGeneratorsBtn');
  const generatorManageModal = $('#generatorManageModal');
  const generatorManageTitle = $('#generatorManageTitle');
  const generatorManageClose = $('#generatorManageClose');
  const generatorManageCloseBtn = $('#generatorManageCloseBtn');
  const generatorTypeSelect = $('#generatorTypeSelect');
  const generatorsList = $('#generatorsList');
  const addGeneratorBtn = $('#addGeneratorBtn');
  const generatorEditModal = $('#generatorEditModal');
  const generatorEditTitle = $('#generatorEditTitle');
  const generatorEditClose = $('#generatorEditClose');
  const generatorEditText = $('#generatorEditText');
  const saveGeneratorBtn = $('#saveGeneratorBtn');
  const cancelGeneratorBtn = $('#cancelGeneratorBtn');
  const deleteGeneratorBtn = $('#deleteGeneratorBtn');

  // Constants
  const MAX_HISTORY_ITEMS = 10;
  const AUTO_SAVE_DEBOUNCE_MS = 500;
  const AUTO_SAVE_TOAST_INTERVAL_MS = 10000;
  const AUTO_SAVE_TOAST_DURATION_MS = 1500;
  const RELOAD_DELAY_MS = 1000;
  const TOAST_DURATION_MS = 5000;
  const MAX_DELETED_DEFAULTS = 1000; // Safety threshold for corruption detection
  const ERROR_TOAST_DURATION_MS = 3000; // Longer duration for error messages
  const TOAST_AUTO_HIDE_DURATION_MS = 1200; // Duration before auto-hiding toast
  const RENDER_DELAY_MS = 100; // Delay for re-rendering after DOM changes
  
  // Centralized error handler
  function handleError(context, error, userMessage = null) {
    console.error(`[${context}]`, error);
    if (userMessage) {
      showToast(userMessage);
    } else if (error.message) {
      showToast(`Error: ${error.message}`);
    }
  }
  
  // Common merge logic helper: merges defaults with user items, filtering deletions and applying edits
  function mergeItems(defaultItems, userItems, deletedIds, editedDefaults, getIdFn) {
    // Filter out deleted items and apply edits
    const filteredDefaults = defaultItems.map((item, index) => {
      const itemId = getIdFn(item, index);
      // Check if deleted
      if (deletedIds.includes(itemId)) {
        debugLog('Filtering out deleted item:', itemId, item);
        return null;
      }
      // Check if edited
      if (editedDefaults && editedDefaults[itemId]) {
        return editedDefaults[itemId];
      }
      return item;
    }).filter(item => item !== null);
    
    // Ensure userItems is an array
    const userArray = Array.isArray(userItems) ? userItems : [];
    
    return [...filteredDefaults, ...userArray];
  }
  
  // localStorage keys
  const favoritesKey = 'blingusFavoritesV1';
  const userItemsKey = 'blingusUserItemsV1';
  const deletedDefaultsKey = 'blingusDeletedDefaultsV1';
  const historyKey = 'blingusHistoryV1';
  const darkModeKey = 'blingusDarkModeV1';
  const generatorsKey = 'blingusGeneratorsV1';
  const editedDefaultsKey = 'blingusEditedDefaultsV1';
  const deletedGeneratorDefaultsKey = 'blingusDeletedGeneratorDefaultsV1';
  
  // File-based storage - auto-detect server vs local
  let dataDirectoryHandle = null;
  const DATA_FILENAME = 'blingus-data.json';
  const DATA_DIR_NAME = 'data';
  // API endpoint - adjust if your server path is different
  const API_ENDPOINT = '/api/blingus-data.php';
  
  // Debug: Log the endpoint being used
  debugLog('API Endpoint:', API_ENDPOINT);
  debugLog('Full API URL:', window.location.origin + API_ENDPOINT);
  
  // Detect if running on a web server (not localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.protocol === 'file:';
  const isOnServer = !isLocalhost && (window.location.protocol === 'http:' || window.location.protocol === 'https:');
  
  // Check if File System Access API is supported (for local use)
  const fileSystemSupported = 'showDirectoryPicker' in window;
  
  // Check if PHP API is available (even on localhost)
  // This allows server storage to work even when accessing via localhost
  let phpApiAvailable = false;
  async function checkPhpApiAvailability() {
    if (window.location.protocol === 'file:') {
      return false; // Can't use PHP API with file:// protocol
    }
    try {
      const response = await fetch(API_ENDPOINT + '?action=load', { method: 'GET' });
      // If we get a response (even 404/error), PHP is available
      // 404 means PHP is working but no data file exists yet
      // Network errors mean PHP is not available
      phpApiAvailable = response.status !== 0 && !response.type.includes('opaque');
      return phpApiAvailable;
    } catch (error) {
      // Network error or CORS issue - PHP API not available
      phpApiAvailable = false;
      return false;
    }
  }
  
  debugLog('Storage mode detection:', {
    isLocalhost,
    isOnServer,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    fileSystemSupported,
    phpApiAvailable: 'checking...'
  });
  
  // Initialize file storage - detect mode and load data
  async function initFileStorage() {
    // Check if PHP API is available (even on localhost)
    const phpAvailable = await checkPhpApiAvailability();
    
    debugLog('Storage mode detection (after PHP check):', {
      isLocalhost,
      isOnServer,
      phpApiAvailable: phpAvailable,
      willUseServerStorage: phpAvailable || isOnServer
    });
    
    // Update file storage button UI now that we know PHP availability
    setupFileStorageButton();
    
    // Use server storage if PHP API is available OR if we're on a remote server
    if (phpAvailable || isOnServer) {
      // On server: use server-side API
      return await loadDataFromServer();
    } else {
      // Local: try File System Access API
      if (!fileSystemSupported) {
        return false;
      }
      
      try {
        // Try to get saved directory handle from IndexedDB
        const savedHandle = await getSavedDirectoryHandle();
        if (savedHandle) {
          dataDirectoryHandle = savedHandle;
          return await loadDataFromFile();
        }
        
        return false;
      } catch (error) {
        return false;
      }
    }
  }
  
  // Server-side storage functions
  async function saveDataToServer() {
    // Use server storage if PHP API is available OR if we're on a remote server
    if (!phpApiAvailable && !isOnServer) return false;
    
    try {
      const data = getAllUserData();
      
      // Validate data can be serialized
      try {
        JSON.stringify(data);
      } catch (e) {
        console.error('Error serializing data:', e);
        throw new Error('Data contains invalid values that cannot be serialized: ' + e.message);
      }
      
      const requestBody = {
        action: 'save',
        data: data
      };
      
      debugLog('Attempting to save to server:', {
        endpoint: API_ENDPOINT,
        fullUrl: window.location.origin + API_ENDPOINT,
        method: 'POST',
        bodySize: JSON.stringify(requestBody).length
      });
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      debugLog('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return true;
        } else {
          console.error('Server returned error:', result.error || result.message);
          throw new Error(result.error || result.message || 'Unknown server error');
        }
      } else {
        let errorText = '';
        let errorMessage = '';
        try {
          errorText = await response.text();
          console.error('Server error response:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage = errorJson.error;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (e) {
            // Not JSON, use raw text
            errorMessage = errorText || response.statusText;
          }
        } catch (e) {
          errorMessage = response.statusText;
        }
        
        console.error('HTTP error:', response.status, response.statusText);
        console.error('Error message:', errorMessage);
        console.error('Full error text:', errorText);
        
        if (response.status === 400) {
          console.error('400 Bad Request Details:', {
            url: window.location.origin + API_ENDPOINT,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            bodySize: JSON.stringify(requestBody).length,
            errorMessage: errorMessage
          });
          throw new Error(`400 Bad Request: ${errorMessage || 'Invalid request format. Check server logs for details.'}`);
        }
        if (response.status === 405) {
          console.error('405 Error Details:', {
            url: window.location.origin + API_ENDPOINT,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            bodySize: JSON.stringify(requestBody).length
          });
          throw new Error('405 Method Not Allowed - Server/web server is blocking POST requests. Check nginx/apache configuration or PHP setup.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorMessage ? ' - ' + errorMessage : ''}`);
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      console.error('API endpoint:', API_ENDPOINT);
      console.error('Full URL:', window.location.origin + API_ENDPOINT);
      throw error; // Re-throw to show actual error message
    }
  }
  
  async function loadDataFromServer() {
    // Use server storage if PHP API is available OR if we're on a remote server
    if (!phpApiAvailable && !isOnServer) return false;
    
    try {
      const response = await fetch(API_ENDPOINT + '?action=load');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Apply loaded data to localStorage
          const data = result.data;
          if (data.favorites !== undefined) localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
          if (data.userItems !== undefined) localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
          if (data.deletedDefaults !== undefined) localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
          if (data.history !== undefined) localStorage.setItem(historyKey, JSON.stringify(data.history));
          if (data.generators !== undefined) {
            // Normalize generators structure
            let generators = data.generators;
            if (typeof generators === 'object' && generators !== null) {
              generators = {
                battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
                insults: Array.isArray(generators.insults) ? generators.insults : [],
                compliments: Array.isArray(generators.compliments) ? generators.compliments : []
              };
            } else {
              generators = { battleCries: [], insults: [], compliments: [] };
            }
            localStorage.setItem(generatorsKey, JSON.stringify(generators));
          }
          if (data.editedGeneratorDefaults !== undefined) localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
          if (data.deletedGeneratorDefaults !== undefined) localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
          if (data.darkMode !== undefined) localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading from server:', error);
      return false;
    }
  }
  
  // Prompt user to select data directory
  async function promptForDataDirectory() {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      // Check if 'data' subdirectory exists, create if not
      try {
        dataDirectoryHandle = await handle.getDirectoryHandle(DATA_DIR_NAME, { create: true });
      } catch (e) {
        // If we can't create subdirectory, use the selected directory directly
        dataDirectoryHandle = handle;
      }
      
      // Save handle for future use
      await saveDirectoryHandle(dataDirectoryHandle);
      showToast('✓ Data directory selected');
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting directory:', error);
      }
      return false;
    }
  }
  
  // Save directory handle to IndexedDB
  async function saveDirectoryHandle(handle) {
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');
      await store.put({ id: 'dataDir', handle: handle });
    } catch (error) {
      console.error('Error saving directory handle:', error);
    }
  }
  
  // Get saved directory handle from IndexedDB
  async function getSavedDirectoryHandle() {
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readonly');
      const store = transaction.objectStore('handles');
      const result = await store.get('dataDir');
      return result ? result.handle : null;
    } catch (error) {
      console.error('Error getting directory handle:', error);
      return null;
    }
  }
  
  // Open IndexedDB for storing file handles
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('blingusFileStorage', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles', { keyPath: 'id' });
        }
      };
    });
  }
  
  // Get all user data
  function getAllUserData() {
    return {
      // Default content (complete datasets)
      defaultSpells: spells,
      defaultAdultSpells: adultSpells,
      defaultBardic: bardic,
      defaultMockery: mockery,
      defaultActions: characterActions,
      defaultCriticalHits: criticalHits,
      defaultCriticalFailures: criticalFailures,
      defaultSkillChecks: skillChecks,
      defaultGenerators: {
        battleCries: battleCries,
        insults: insults,
        compliments: compliments
      },
      
      // User preferences
      favorites: JSON.parse(localStorage.getItem(favoritesKey) || '[]'),
      darkMode: localStorage.getItem(darkModeKey) === 'true',
      
      // User-added content
      userItems: JSON.parse(localStorage.getItem(userItemsKey) || '{}'),
      generators: JSON.parse(localStorage.getItem(generatorsKey) || '{"battleCries":[],"insults":[],"compliments":[]}'),
      
      // Default item modifications (edits and deletions)
      deletedDefaults: JSON.parse(localStorage.getItem(deletedDefaultsKey) || '{}'),
      editedGeneratorDefaults: JSON.parse(localStorage.getItem(editedDefaultsKey) || '{"battleCries":{},"insults":{},"compliments":{}}'),
      deletedGeneratorDefaults: JSON.parse(localStorage.getItem(deletedGeneratorDefaultsKey) || '{"battleCries":[],"insults":[],"compliments":[]}'),
      
      // Usage history
      history: JSON.parse(localStorage.getItem(historyKey) || '[]'),
      
      // Metadata
      version: '1.3',
      timestamp: new Date().toISOString(),
      exportNote: 'Complete export including all default items (spells, bardic, mockery, actions, criticalHits, criticalFailures, skillChecks, generators) plus all user customizations (favorites, custom items, edits, deletions, history, YouTube karaoke settings).'
    };
  }
  
  // Save data to file
  async function saveDataToFile() {
    if (!dataDirectoryHandle) {
      // Fallback to localStorage (already happens automatically)
      return false;
    }
    
    try {
      const data = getAllUserData();
      const json = JSON.stringify(data, null, 2);
      
      // Get or create the data file
      const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      
      return true;
    } catch (error) {
      // If permission lost, clear handle
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        dataDirectoryHandle = null;
      }
      return false;
    }
  }
  
  // Load data from file
  async function loadDataFromFile() {
    if (!dataDirectoryHandle) {
      return false;
    }
    
    try {
      const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Apply loaded data to localStorage
      if (data.favorites !== undefined) localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
      if (data.userItems !== undefined) localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
      if (data.deletedDefaults !== undefined) localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
      if (data.history !== undefined) localStorage.setItem(historyKey, JSON.stringify(data.history));
      if (data.voicePresets !== undefined) localStorage.setItem(voicePresetsKey, JSON.stringify(data.voicePresets));
      if (data.generators !== undefined) {
        // Normalize generators structure
        let generators = data.generators;
        if (typeof generators === 'object' && generators !== null) {
          generators = {
            battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
            insults: Array.isArray(generators.insults) ? generators.insults : [],
            compliments: Array.isArray(generators.compliments) ? generators.compliments : []
          };
        } else {
          generators = { battleCries: [], insults: [], compliments: [] };
        }
        localStorage.setItem(generatorsKey, JSON.stringify(generators));
      }
      if (data.editedGeneratorDefaults !== undefined) localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
      if (data.deletedGeneratorDefaults !== undefined) localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
      if (data.darkMode !== undefined) localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Debounced auto-save (works for both file and server)
  let fileSaveTimeout = null;
  let isSavingToServer = false;
  let lastAutoSaveToast = 0;
  function scheduleFileSave() {
    if (fileSaveTimeout) clearTimeout(fileSaveTimeout);
    fileSaveTimeout = setTimeout(async () => {
      if (phpApiAvailable || isOnServer) {
        if (!isSavingToServer) {
          isSavingToServer = true;
          try {
            const success = await saveDataToServer();
            if (success) {
              // Only show toast occasionally (every 10 seconds max) to avoid spam
              const now = Date.now();
              if (now - lastAutoSaveToast > AUTO_SAVE_TOAST_INTERVAL_MS) {
                showToast('💾 Auto-saved', AUTO_SAVE_TOAST_DURATION_MS);
                lastAutoSaveToast = now;
              }
            }
          } catch (error) {
            console.error('Auto-save failed:', error);
            showToast('⚠️ Auto-save failed', ERROR_TOAST_DURATION_MS);
          } finally {
            isSavingToServer = false;
          }
        }
      } else if (dataDirectoryHandle) {
        saveDataToFile();
      }
    }, AUTO_SAVE_DEBOUNCE_MS); // Wait after last change for faster feedback
  }
  
  // Load user items from localStorage
  function loadUserItems() {
    try {
      const raw = localStorage.getItem(userItemsKey);
      const defaultStructure = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
      if (!raw) {
        return defaultStructure;
      }
      const parsed = JSON.parse(raw);
      // Ensure all sections exist (in case data is incomplete)
      return {
        spells: parsed.spells || {},
        adultSpells: parsed.adultSpells || {},
        bardic: parsed.bardic || {},
        mockery: parsed.mockery || {},
        actions: parsed.actions || {},
        criticalHits: parsed.criticalHits || {},
        criticalFailures: parsed.criticalFailures || {},
        skillChecks: parsed.skillChecks || {}
      };
    } catch(e) {
      console.error('Error loading user items:', e);
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
    }
  }
  
  // Load deleted defaults from localStorage
  function loadDeletedDefaults() {
    try {
      const raw = localStorage.getItem(deletedDefaultsKey);
      if (!raw) {
        return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
      }
      const parsed = JSON.parse(raw);
      // Ensure structure is correct
      return {
        spells: parsed.spells || {},
        adultSpells: parsed.adultSpells || {},
        bardic: parsed.bardic || {},
        mockery: parsed.mockery || {},
        actions: parsed.actions || {},
        criticalHits: parsed.criticalHits || {},
        criticalFailures: parsed.criticalFailures || {}
      };
    } catch(e) {
      console.error('Error loading deleted defaults:', e);
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    }
  }
  
  // Save user items to localStorage
  function saveUserItems(userItems) {
    try {
      localStorage.setItem(userItemsKey, JSON.stringify(userItems));
      scheduleFileSave();
    } catch(e) {
      handleError('saveUserItems', e, 'Failed to save user items');
    }
  }
  
  // Save deleted defaults to localStorage
  function saveDeletedDefaults(deletedDefaults) {
    try {
      localStorage.setItem(deletedDefaultsKey, JSON.stringify(deletedDefaults));
      scheduleFileSave();
    } catch(e) {
      handleError('saveDeletedDefaults', e, 'Failed to save deleted defaults');
    }
  }

  // Load user generators from localStorage
  function loadUserGenerators() {
    try {
      const raw = localStorage.getItem(generatorsKey);
      let parsed = raw ? JSON.parse(raw) : { battleCries: [], insults: [], compliments: [] };
      
      // Ensure structure is correct - each type should be an array
      if (!parsed.battleCries || !Array.isArray(parsed.battleCries)) {
        parsed.battleCries = [];
      }
      if (!parsed.insults || !Array.isArray(parsed.insults)) {
        parsed.insults = [];
      }
      if (!parsed.compliments || !Array.isArray(parsed.compliments)) {
        parsed.compliments = [];
      }
      
      // Filter out any non-string values (cleanup)
      parsed.battleCries = parsed.battleCries.filter(item => typeof item === 'string');
      parsed.insults = parsed.insults.filter(item => typeof item === 'string');
      parsed.compliments = parsed.compliments.filter(item => typeof item === 'string');
      
      return parsed;
    } catch(e) {
      console.error('Error loading generators:', e);
      return { battleCries: [], insults: [], compliments: [] };
    }
  }

  // Save user generators to localStorage
  function saveUserGenerators(userGenerators) {
    try {
      localStorage.setItem(generatorsKey, JSON.stringify(userGenerators));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save generators:', e);
    }
  }

  // Load edited defaults
  function loadEditedDefaults() {
    try {
      const raw = localStorage.getItem(editedDefaultsKey);
      return raw ? JSON.parse(raw) : { battleCries: {}, insults: {}, compliments: {} };
    } catch(e) {
      return { battleCries: {}, insults: {}, compliments: {} };
    }
  }

  // Save edited defaults
  function saveEditedDefaults(editedDefaults) {
    try {
      localStorage.setItem(editedDefaultsKey, JSON.stringify(editedDefaults));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save edited defaults:', e);
    }
  }

  // Load deleted defaults
  function loadDeletedGeneratorDefaults() {
    try {
      const raw = localStorage.getItem(deletedGeneratorDefaultsKey);
      const result = raw ? JSON.parse(raw) : { battleCries: [], insults: [], compliments: [] };
      // Ensure all types exist
      if (!result.battleCries) result.battleCries = [];
      if (!result.insults) result.insults = [];
      if (!result.compliments) result.compliments = [];
      debugLog('loadDeletedGeneratorDefaults:', result);
      return result;
    } catch(e) {
      console.error('Error loading deleted generator defaults:', e);
      return { battleCries: [], insults: [], compliments: [] };
    }
  }

  // Save deleted defaults
  function saveDeletedGeneratorDefaults(deletedDefaults) {
    try {
      localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(deletedDefaults));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save deleted generator defaults:', e);
    }
  }

  // Get merged generators (defaults + user-added, respecting edits and deletions)
  function getMergedGenerators(type) {
    const defaults = {
      battleCries: battleCries,
      insults: insults,
      compliments: compliments
    };
    const userAdded = loadUserGenerators();
    const editedDefaults = loadEditedDefaults();
    const deletedDefaults = loadDeletedGeneratorDefaults();
    
    debugLog('getMergedGenerators for', type);
    debugLog('Deleted defaults:', deletedDefaults[type]);
    debugLog('User added:', userAdded[type]);
    
    // Use common merge logic
    const getIdFn = (item, index) => `${type}_${index}`;
    const merged = mergeItems(
      defaults[type] || [],
      userAdded[type] || [],
      deletedDefaults[type] || [],
      editedDefaults[type],
      getIdFn
    );
    
    debugLog('Merged list length:', merged.length);
    debugLog('User added items:', userAdded[type]);
    return merged;
  }
  
  // Generate unique ID for an item
  function getItemId(section, item) {
    if (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') {
      return typeof item === 'string' ? item : '';
    }
    return `${item.t}|${item.s}|${item.a}|${item.adult ? '1' : '0'}`;
  }
  
  let userItems = loadUserItems();
  let deletedDefaults = loadDeletedDefaults();
  
  // Debug: Log user items on load
  debugLog('Loaded user items:', userItems);
  debugLog('Loaded deleted defaults:', deletedDefaults);
  
  // Safety check: Clear deletedDefaults if it seems corrupted (has non-array values)
  let needsReset = false;
  for (const section in deletedDefaults) {
    if (deletedDefaults[section] && typeof deletedDefaults[section] === 'object') {
      for (const category in deletedDefaults[section]) {
        if (!Array.isArray(deletedDefaults[section][category])) {
          console.warn(`Found corrupted deletedDefaults entry: ${section}/${category}`);
          needsReset = true;
        }
      }
    } else if (deletedDefaults[section] && typeof deletedDefaults[section] !== 'object') {
      console.warn(`Found non-object deletedDefaults section: ${section}`);
      needsReset = true;
    }
  }
  
  // Also check if deletedDefaults has excessive entries (likely corrupted)
  const totalDeleted = Object.values(deletedDefaults).reduce((sum, section) => {
    if (typeof section === 'object') {
      return sum + Object.values(section).reduce((s, cat) => s + (Array.isArray(cat) ? cat.length : 0), 0);
    }
    return sum;
  }, 0);
  
  if (totalDeleted > MAX_DELETED_DEFAULTS) {
    console.warn(`Found excessive deleted defaults (${totalDeleted} entries). Resetting.`);
    needsReset = true;
  }
  
  if (needsReset) {
    console.warn('Resetting corrupted deletedDefaults');
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    saveDeletedDefaults(deletedDefaults);
  }
  
  // Expose reset function to console for manual fixes
  window.resetDeletedDefaults = function() {
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    saveDeletedDefaults(deletedDefaults);
    debugLog('Deleted defaults reset. Reloading page...');
    location.reload();
  };
  
      debugLog('To reset deleted defaults manually, run: resetDeletedDefaults()');
  
  // Merge user items with default items, filtering out deleted defaults
  function getMergedData(section, category) {
    const defaults = section === 'spells' ? spells
      : section === 'bardic' ? bardic
      : section === 'actions' ? characterActions
      : section === 'criticalHits' ? criticalHits
      : section === 'criticalFailures' ? criticalFailures
      : section === 'skillChecks' ? skillChecks
      : mockery;
    
    const defaultList = (defaults[category] || []);
    const deletedIds = deletedDefaults[section]?.[category] || [];
    
    // Debug logging
    if (defaultList.length > 0) {
      debugLog(`getMergedData: ${section}/${category} - Defaults: ${defaultList.length}, Deleted IDs: ${deletedIds.length}`);
      if (deletedIds.length > 0) {
        debugLog(`Deleted IDs for ${section}/${category}:`, deletedIds);
      }
    }
    
    // Safety check: if all items would be filtered out but we have defaults, something is wrong
    if (deletedIds.length > 0 && defaultList.length > 0) {
      const tempFiltered = defaultList.filter(item => {
        const itemId = getItemId(section, item);
        return !deletedIds.includes(itemId);
      });
      
      if (tempFiltered.length === 0) {
        console.warn(`Warning: All ${defaultList.length} items filtered out for ${section}/${category} with ${deletedIds.length} deleted IDs. Clearing deleted IDs for this category.`);
        // Clear the deleted IDs for this category to prevent data corruption
        if (deletedDefaults[section] && deletedDefaults[section][category]) {
          delete deletedDefaults[section][category];
          saveDeletedDefaults(deletedDefaults);
        }
        // Return full list after clearing deletions
        const userList = userItems[section]?.[category] || [];
        debugLog(`Returning full list after clearing deletions: ${defaultList.length} defaults + ${userList.length} user items`);
        return [...defaultList, ...userList];
      }
    }
    
    // Use common merge logic (no edited defaults for regular sections)
    const getIdFn = (item, index) => getItemId(section, item);
    const merged = mergeItems(
      defaultList,
      userItems[section]?.[category] || [],
      deletedIds,
      null, // Edited defaults not used for regular sections (only generators)
      getIdFn
    );
    
    debugLog(`getMergedData result: ${section}/${category} - Returning ${merged.length} items`);
    return merged;
  }
  
  // Get adult spells merged, filtering out deleted defaults
  function getMergedAdultSpells(category) {
    const deletedIds = deletedDefaults.adultSpells?.[category] || [];
    const getIdFn = (item, index) => getItemId('spells', item);
    return mergeItems(
      adultSpells[category] || [],
      userItems.adultSpells?.[category] || [],
      deletedIds,
      null, // Edited defaults not used for adult spells
      getIdFn
    );
  }
  
  // Check if item is user-added
  function isUserItem(section, category, item, index) {
    const defaults = section === 'spells' ? spells
      : section === 'bardic' ? bardic
      : section === 'actions' ? characterActions
      : mockery;
    
    const defaultList = defaults[category] || [];
    const defaultCount = defaultList.length;
    
    if (section === 'actions') {
      return typeof item === 'string' && index >= defaultCount;
    }
    
    return index >= defaultCount;
  }
  
  let currentEditingItem = null;
  let currentEditingIndex = null;
  let currentEditingSection = null;
  let currentEditingCategory = null;
  function makeId(item){ return `${item.s} — ${item.a} — ${item.t}`; }
  function loadFavorites(){
    try { const raw = localStorage.getItem(favoritesKey); return new Set(raw ? JSON.parse(raw) : []); }
    catch(e){ return new Set(); }
  }
  function saveFavorites(){
    try { 
      localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
      scheduleFileSave();
    } catch(e){}
  }
  let favorites = loadFavorites();
  function isFav(item){ return favorites.has(makeId(item)); }
  function toggleFav(item, btn){
    const id = makeId(item);
    if (favorites.has(id)) {
      favorites.delete(id);
      btn.classList.remove('on');
      btn.textContent = '☆';
      showToast('Removed from favorites');
    } else {
      favorites.add(id);
      btn.classList.add('on');
      btn.textContent = '★';
      showToast('Added to favorites');
    }
    saveFavorites();
  }

  function buildCategories() {
    categorySelect.innerHTML = '';
    const section = sectionSelect.value;
    
    // Safety check - ensure section is valid
    if (!section) {
      console.warn('buildCategories: No section selected');
      return;
    }
    
    let cats = [];
    try {
      debugLog('buildCategories: section =', section);
      debugLog('buildCategories: spells defined?', typeof spells !== 'undefined');
      debugLog('buildCategories: bardic defined?', typeof bardic !== 'undefined');
      debugLog('buildCategories: mockery defined?', typeof mockery !== 'undefined');
      debugLog('buildCategories: characterActions defined?', typeof characterActions !== 'undefined');
      debugLog('buildCategories: criticalHits defined?', typeof criticalHits !== 'undefined');
      debugLog('buildCategories: criticalFailures defined?', typeof criticalFailures !== 'undefined');
      debugLog('buildCategories: skillChecks defined?', typeof skillChecks !== 'undefined');
      
      if (section === 'spells') {
        cats = typeof spells !== 'undefined' && spells ? Object.keys(spells) : [];
        debugLog('buildCategories: spells keys =', cats);
      } else if (section === 'bardic') {
        cats = typeof bardic !== 'undefined' && bardic ? Object.keys(bardic) : [];
        debugLog('buildCategories: bardic keys =', cats);
      } else if (section === 'actions') {
        cats = typeof characterActions !== 'undefined' && characterActions ? Object.keys(characterActions) : [];
        debugLog('buildCategories: characterActions keys =', cats);
      } else if (section === 'criticalHits') {
        cats = typeof criticalHits !== 'undefined' && criticalHits ? Object.keys(criticalHits) : [];
        debugLog('buildCategories: criticalHits keys =', cats);
      } else if (section === 'criticalFailures') {
        cats = typeof criticalFailures !== 'undefined' && criticalFailures ? Object.keys(criticalFailures) : [];
        debugLog('buildCategories: criticalFailures keys =', cats);
      } else if (section === 'skillChecks') {
        cats = typeof skillChecks !== 'undefined' && skillChecks ? Object.keys(skillChecks) : [];
        debugLog('buildCategories: skillChecks keys =', cats);
      } else {
        cats = typeof mockery !== 'undefined' && mockery ? Object.keys(mockery) : [];
        debugLog('buildCategories: mockery keys =', cats);
      }
    } catch (error) {
      console.error('Error building categories:', error);
      console.error('Error stack:', error.stack);
      cats = [];
    }
    
    for (const c of cats) {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c; categorySelect.appendChild(opt);
    }
    
    // If no categories found, add a message
    if (cats.length === 0) {
      console.warn(`buildCategories: No categories found for section: ${section}`);
    }
  }

  function getActiveList() {
    const section = sectionSelect.value;
    const cat = categorySelect.value;
    
    debugLog(`getActiveList: section=${section}, category=${cat}`);
    
    if (!cat) {
      console.warn('getActiveList: No category selected!');
      return [];
    }
    
    if (section === 'spells') {
      const base = getMergedData('spells', cat);
      const add = getMergedAdultSpells(cat);
      const result = [...base, ...add];
      debugLog(`getActiveList spells: base=${base.length}, add=${add.length}, result=${result.length}`);
      return result;
    } else if (section === 'bardic') {
      const result = getMergedData('bardic', cat);
      debugLog(`getActiveList bardic: result=${result.length}`);
      return result;
    } else if (section === 'actions') {
      const result = getMergedData('actions', cat);
      debugLog(`getActiveList actions: result=${result.length}`);
      return result;
    } else if (section === 'criticalHits') {
      const result = getMergedData('criticalHits', cat);
      debugLog(`getActiveList criticalHits: result=${result.length}`);
      return result;
    } else if (section === 'criticalFailures') {
      const result = getMergedData('criticalFailures', cat);
      debugLog(`getActiveList criticalFailures: result=${result.length}`);
      return result;
    } else if (section === 'skillChecks') {
      const result = getMergedData('skillChecks', cat);
      debugLog(`getActiveList skillChecks: result=${result.length}`);
      return result;
    } else {
      const result = getMergedData('mockery', cat);
      debugLog(`getActiveList mockery: result=${result.length}`);
      return result;
    }
  }

  // Global search across all sections and categories
  function renderGlobalSearch(q) {
    debugLog(`renderGlobalSearch: searching for "${q}"`);
    
    const allResults = [];
    
    // Search spells (all categories)
    const spellCategories = Object.keys(spells || {});
    for (const cat of spellCategories) {
      const spellList = getMergedData('spells', cat);
      const filtered = spellList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'spells', category: cat, item, isAdult: false });
      }
    }
    
    // Search adult spells (always included)
    const adultCategories = Object.keys(adultSpells || {});
    for (const cat of adultCategories) {
      const adultList = getMergedAdultSpells(cat);
      const filtered = adultList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'spells', category: cat, item, isAdult: true });
      }
    }
    
    // Search bardic (all categories)
    const bardicCategories = Object.keys(bardic || {});
    for (const cat of bardicCategories) {
      const bardicList = getMergedData('bardic', cat);
      const filtered = bardicList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'bardic', category: cat, item, isAdult: false });
      }
    }
    
    // Search mockery (all categories)
    const mockeryCategories = Object.keys(mockery || {});
    for (const cat of mockeryCategories) {
      const mockeryList = getMergedData('mockery', cat);
      const filtered = mockeryList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'mockery', category: cat, item, isAdult: false });
      }
    }
    
    // Search actions (all categories)
    const actionCategories = Object.keys(characterActions || {});
    for (const cat of actionCategories) {
      const actionList = getMergedData('actions', cat);
      const filtered = actionList.filter(item => {
        const actionText = typeof item === 'string' ? item : item;
        return actionText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'actions', category: cat, item, isAdult: false });
      }
    }
    
    // Search critical hits (all categories)
    const criticalHitCategories = Object.keys(criticalHits || {});
    for (const cat of criticalHitCategories) {
      const criticalHitList = getMergedData('criticalHits', cat);
      const filtered = criticalHitList.filter(item => {
        const hitText = typeof item === 'string' ? item : item;
        return hitText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'criticalHits', category: cat, item, isAdult: false });
      }
    }
    
    // Search critical failures (all categories)
    const criticalFailureCategories = Object.keys(criticalFailures || {});
    for (const cat of criticalFailureCategories) {
      const criticalFailureList = getMergedData('criticalFailures', cat);
      const filtered = criticalFailureList.filter(item => {
        const failureText = typeof item === 'string' ? item : item;
        return failureText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'criticalFailures', category: cat, item, isAdult: false });
      }
    }
    
    // Search skill checks (all categories)
    const skillCheckCategories = Object.keys(skillChecks || {});
    for (const cat of skillCheckCategories) {
      const skillCheckList = getMergedData('skillChecks', cat);
      const filtered = skillCheckList.filter(item => {
        const skillText = typeof item === 'string' ? item : item;
        return skillText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'skillChecks', category: cat, item, isAdult: false });
      }
    }
    
    // Apply favorites filter if enabled
    let filteredResults = allResults;
    if (favoritesOnly && favoritesOnly.checked) {
      filteredResults = allResults.filter(result => {
        if (result.section === 'actions' || result.section === 'criticalHits' || result.section === 'criticalFailures' || result.section === 'skillChecks') {
          const itemId = getItemId(result.section, result.item);
          return favorites.has(itemId);
        }
        return isFav(result.item);
      });
    }
    
    debugLog(`renderGlobalSearch: found ${filteredResults.length} results across all sections`);
    
    // Clear content
    content.innerHTML = '';
    
    // Group results by section/category for better organization
    const grouped = {};
    for (const result of filteredResults) {
      const key = `${result.section}/${result.category}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(result);
    }
    
    // Render grouped results
    const sectionOrder = ['spells', 'bardic', 'mockery', 'actions', 'criticalHits', 'criticalFailures', 'skillChecks'];
    const sectionLabels = {
      spells: '🔮 Spell Parodies',
      bardic: '✨ Bardic Inspiration',
      mockery: '🗡️ Vicious Mockery',
      actions: '🎭 Character Actions',
      criticalHits: '⚔️ Critical Hit Descriptions',
      criticalFailures: '💥 Critical Failure Descriptions',
      skillChecks: '🎯 Skill Check Results'
    };
    
    for (const section of sectionOrder) {
      const sectionKeys = Object.keys(grouped).filter(k => k.startsWith(section + '/'));
      if (sectionKeys.length === 0) continue;
      
      // Section header
      const sectionHeader = document.createElement('div');
      sectionHeader.style.gridColumn = '1 / -1';
      sectionHeader.style.fontSize = '20px';
      sectionHeader.style.fontWeight = 'bold';
      sectionHeader.style.marginTop = '16px';
      sectionHeader.style.marginBottom = '8px';
      sectionHeader.style.color = 'var(--accent)';
      sectionHeader.textContent = sectionLabels[section];
      content.appendChild(sectionHeader);
      
      // Render results for each category in this section
      for (const key of sectionKeys.sort()) {
        const [sec, cat] = key.split('/');
        const categoryResults = grouped[key];
        
        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.style.gridColumn = '1 / -1';
        categoryHeader.style.fontSize = '16px';
        categoryHeader.style.fontWeight = '600';
        categoryHeader.style.marginTop = '12px';
        categoryHeader.style.marginBottom = '4px';
        categoryHeader.style.color = 'var(--burnt)';
        categoryHeader.textContent = `→ ${cat}`;
        content.appendChild(categoryHeader);
        
        // Render cards for this category
        for (const result of categoryResults) {
          if (result.section === 'actions') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'criticalHits') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'criticalFailures') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'skillChecks') {
            renderActionCard(result.item, result.category);
          } else {
            renderSpellCard(result.item, result.section, result.category, result.isAdult);
          }
        }
      }
    }
    
    // Show empty message if no results
    if (filteredResults.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = `No results found for "${q}". Try a different search term.`;
      content.appendChild(empty);
    }
  }
  
  // Helper function to render a spell/bardic/mockery card in global search
  function renderSpellCard(item, section, category, isAdult) {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    
    const favBtn = document.createElement('button');
    favBtn.className = 'card__fav';
    const favOn = isFav(item);
    favBtn.textContent = favOn ? '★' : '☆';
    if (favOn) favBtn.classList.add('on');
    favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(item, favBtn); });
    
    const chip = document.createElement('span');
    chip.className = 'card__chip';
    chip.textContent = section === 'spells' ? 'Spell' : (section === 'bardic' ? 'Bardic' : 'Mockery');
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card__copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyLine(item); });
    
    // Determine if item is user-added or default
    const defaults = section === 'spells' ? spells : (section === 'bardic' ? bardic : mockery);
    const defaultList = defaults[category] || [];
    const itemId = getItemId(section, item);
    const isDefaultItem = defaultList.some(x => {
      return x.t === item.t && x.s === item.s && x.a === item.a;
    });
    
    // Check if it's user-added
    const fullList = getMergedData(section, category);
    const fullIndex = fullList.findIndex(x => {
      return x.t === item.t && x.s === item.s && x.a === item.a && (x.adult === item.adult || (!x.adult && !item.adult));
    });
    const defaultCount = defaultList.filter(item => {
      const itemId = getItemId(section, item);
      return !(deletedDefaults[section]?.[category] || []).includes(itemId);
    }).length;
    const isUserAdded = fullIndex >= defaultCount;
    let userIndex = isUserAdded ? fullIndex - defaultCount : null;
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'card__edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit or delete this item';
    
    const isDark = document.body.classList.contains('dark-mode');
    if (isUserAdded) {
      card.style.borderLeft = '4px solid #2b6f3a';
      card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
    } else if (isDefaultItem) {
      card.style.borderLeft = '4px solid #4a90e2';
      card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
    }
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemWithMeta = { ...item, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
      if (isAdult) itemWithMeta.adult = true;
      const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
      openEditModal(section, category, itemWithMeta, editIndex);
    });
    
    card.appendChild(editBtn);
    card.addEventListener('click', () => copyLine(item));
    
    const p = document.createElement('div');
    p.textContent = item.t;
    const meta = document.createElement('div');
    meta.className = 'card__meta';
    if (section === 'mockery') {
      meta.textContent = `Mockery — ${category}`;
    } else {
      meta.textContent = `Song: ${item.s} — ${item.a}${item.adult || isAdult ? '  •  Adult' : ''}`;
    }
    
    card.appendChild(favBtn);
    card.appendChild(copyBtn);
    card.appendChild(chip);
    card.appendChild(p);
    card.appendChild(meta);
    content.appendChild(card);
  }
  
  // Helper function to render an action card in global search
  function renderActionCard(action, category) {
    const card = document.createElement('article');
    card.className = 'card action-card';
    card.style.cursor = 'pointer';
    card.tabIndex = 0;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card__copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      copyToClipboard(action, 'actions', category);
    });
    
    // Determine if action is user-added or default
    const defaults = characterActions[category] || [];
    const itemId = getItemId('actions', action);
    const deletedIds = deletedDefaults.actions?.[category] || [];
    const isDeletedDefault = deletedIds.includes(itemId);
    const isDefaultItem = defaults.includes(action);
    
    const fullActions = getMergedData('actions', category);
    const fullIndex = fullActions.indexOf(action);
    const filteredDefaultCount = fullActions.length - ((userItems.actions && userItems.actions[category]) ? userItems.actions[category].length : 0);
    const isUserAdded = fullIndex >= filteredDefaultCount;
    const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'card__edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit or delete this item';
    
    const isDark = document.body.classList.contains('dark-mode');
    if (isUserAdded) {
      card.style.borderLeft = '4px solid #2b6f3a';
      card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
    } else if (isDefaultItem && !isDeletedDefault) {
      card.style.borderLeft = '4px solid #4a90e2';
      card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
    }
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemWithMeta = { ...action, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
      const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
      openEditModal('actions', category, itemWithMeta, editIndex);
    });
    
    card.appendChild(editBtn);
    card.addEventListener('click', () => copyToClipboard(action, 'actions', category));
    
    const p = document.createElement('div');
    p.textContent = action;
    const meta = document.createElement('div');
    meta.className = 'card__meta';
    meta.textContent = `Action — ${category}`;
    
    card.appendChild(copyBtn);
    card.appendChild(p);
    card.appendChild(meta);
    content.appendChild(card);
  }

  function render() {
    const section = sectionSelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    debugLog(`render() called for section: ${section}, search query: "${q}"`);
    
    // If there's a search query, use global search across all sections
    if (q) {
      renderGlobalSearch(q);
      return;
    }
    
    // Special rendering for character actions
    if (section === 'actions') {
      renderActions();
      return;
    }
    
    // Special rendering for critical hits
    if (section === 'criticalHits') {
      renderCriticalHits();
      return;
    }
    
    // Special rendering for critical failures
    if (section === 'criticalFailures') {
      renderCriticalFailures();
      return;
    }
    
    // Special rendering for skill checks
    if (section === 'skillChecks') {
      renderSkillChecks();
      return;
    }
    const cat = categorySelect.value;
    
    if (!cat) {
      console.warn('No category selected');
      content.innerHTML = '<div class="card">Please select a category</div>';
      // Try to build categories if they're missing
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          // Re-render with the first category
          setTimeout(() => render(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get base data directly (like renderActions does)
    let baseList;
    if (section === 'spells') {
      const spellList = (spells[cat] || []).filter(item => {
        const itemId = getItemId('spells', item);
        const deletedIds = deletedDefaults.spells?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      const adultList = (adultSpells[cat] || []).filter(item => {
        const itemId = getItemId('spells', item);
        const deletedIds = deletedDefaults.adultSpells?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = [...spellList, ...adultList];
    } else if (section === 'bardic') {
      const bardicList = (bardic[cat] || []).filter(item => {
        const itemId = getItemId('bardic', item);
        const deletedIds = deletedDefaults.bardic?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = bardicList;
    } else {
      const mockeryList = (mockery[cat] || []).filter(item => {
        const itemId = getItemId('mockery', item);
        const deletedIds = deletedDefaults.mockery?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = mockeryList;
    }
    
    // Ensure baseList is always an array
    if (!Array.isArray(baseList)) {
      baseList = [];
    }
    
    // Add user items
    const userList = userItems[section]?.[cat] || [];
    if (section === 'spells') {
      const userAdultList = userItems.adultSpells?.[cat] || [];
      baseList = [...baseList, ...userList, ...userAdultList];
    } else {
      baseList = [...baseList, ...userList];
    }
    
    debugLog(`render: baseList length=${baseList.length} for ${section}/${cat}`);
    
    // Apply filters
    let list = baseList;
    
    if (q) {
      list = list.filter(x => {
        if (typeof x === 'string') {
          return x.toLowerCase().includes(q);
        }
      return x.t.toLowerCase().includes(q) || (x.s && x.s.toLowerCase().includes(q)) || (x.a && x.a.toLowerCase().includes(q));
    });
    }
    
    debugLog(`render: after search filter, list length=${list.length}`);
    
    if (favoritesOnly && favoritesOnly.checked) {
      list = list.filter(isFav);
      debugLog(`render: after favorites filter, list length=${list.length}`);
    }
    
    debugLog(`render: final list length=${list.length} for ${section}`);
    
    content.innerHTML = '';
    
    // Add random button at the top (uses full baseList, not filtered)
    if (baseList.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      const isDark = document.body.classList.contains('dark-mode');
      randomCard.style.background = isDark ? 'linear-gradient(135deg, #3d3d5e 0%, #2d2d44 100%)' : 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomItem = baseList[Math.floor(Math.random() * baseList.length)];
        
        // Check if the selected item is in the filtered results
        const isInFiltered = list.some(x => {
          if (typeof x === 'string') return x === randomItem;
          if (typeof randomItem === 'string') return false;
          return x.t === randomItem.t && x.s === randomItem.s && x.a === randomItem.a;
        });
        
        // Find and highlight the selected item card if it's visible
        const allCards = content.querySelectorAll('.card:not(.random-card)');
        let selectedCard = null;
        for (const card of allCards) {
          const textDiv = card.querySelector('div:not(.card__meta)');
          if (textDiv) {
            const cardText = typeof randomItem === 'string' ? randomItem : randomItem.t;
            if (textDiv.textContent.includes(cardText)) {
              selectedCard = card;
              break;
            }
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}...`);
        } else if (!isInFiltered) {
          // Selected item is filtered out - show a longer toast message
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}... (not in current filter)`);
        } else {
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}...`);
        }
        
        // Copy to clipboard
        if (typeof randomItem === 'string') {
          copyToClipboard(randomItem, section, cat);
        } else {
          copyLine(randomItem);
        }
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random line and copy it!';
      
      randomCard.classList.add('random-card');
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    
    for (const item of list) {
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0; // Make focusable for keyboard navigation
      const favBtn = document.createElement('button');
      favBtn.className = 'card__fav';
      const favOn = isFav(item);
      favBtn.textContent = favOn ? '★' : '☆';
      if (favOn) favBtn.classList.add('on');
      favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(item, favBtn); });
      const chip = document.createElement('span');
      chip.className = 'card__chip';
      chip.textContent = section === 'spells' ? 'Spell' : (section === 'bardic' ? 'Bardic' : 'Mockery');
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyLine(item); });
      
      // Add YouTube button if YouTube link exists
      // Use an anchor tag so RedirectTube extension can intercept it
      let youtubeBtn = null;
      if (item.youtube) {
        const startTime = item.startTime || 0;
        const videoId = item.youtube;
        const startSeconds = Math.floor(startTime || 0);
        const watchParams = new URLSearchParams();
        watchParams.set('v', videoId);
        if (startSeconds > 0) {
          watchParams.set('t', startSeconds.toString());
        }
        watchParams.set('autoplay', '1');
        const watchUrl = `https://www.youtube.com/watch?${watchParams.toString()}`;
        
        youtubeBtn = document.createElement('a');
        youtubeBtn.className = 'card__youtube';
        youtubeBtn.textContent = '▶️';
        youtubeBtn.title = 'Play karaoke track';
        youtubeBtn.href = watchUrl;
        youtubeBtn.target = '_blank';
        youtubeBtn.rel = 'noopener noreferrer';
        youtubeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Let RedirectTube extension intercept the link
        });
      }
      
      // Add start time badge if startTime exists
      let startTimeBadge = null;
      let startTimeInput = null;
      let isEditingStartTime = false;
      if (item.startTime !== undefined && item.startTime !== null) {
        startTimeBadge = document.createElement('span');
        startTimeBadge.className = 'card__start-time';
        startTimeBadge.textContent = `Start: ${formatTime(item.startTime)}`;
        startTimeBadge.title = 'Click to edit start time';
        startTimeBadge.style.cursor = 'pointer';
        startTimeBadge.style.marginLeft = '8px';
        startTimeBadge.style.padding = '2px 6px';
        startTimeBadge.style.borderRadius = '4px';
        startTimeBadge.style.background = 'var(--accent)';
        startTimeBadge.style.color = 'white';
        startTimeBadge.style.fontSize = '12px';
        
        startTimeBadge.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isEditingStartTime) return;
          
          isEditingStartTime = true;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = formatTime(item.startTime);
          input.style.width = '60px';
          input.style.padding = '2px 4px';
          input.style.border = '1px solid var(--burnt)';
          input.style.borderRadius = '4px';
          input.style.fontSize = '12px';
          
          const saveTime = () => {
            const newTime = parseTime(input.value);
            if (newTime !== null && newTime >= 0) {
              // Update the item
              if (isUserAdded) {
                if (section === 'spells' && isAdultSpell) {
                  if (userItems.adultSpells[cat]) {
                    userItems.adultSpells[cat][userIndex].startTime = newTime;
                  }
                } else {
                  if (userItems[section] && userItems[section][cat]) {
                    userItems[section][cat][userIndex].startTime = newTime;
                  }
                }
                saveUserItems(userItems);
                scheduleFileSave();
                render(); // Re-render to show updated time
              } else {
                // For default items, we need to edit them (which creates a user copy)
                openEditModal(section, cat, item, -1);
                setTimeout(() => {
                  editStartTime.value = formatTime(newTime);
                }, 100);
              }
            } else {
              showToast('Invalid time format');
            }
            isEditingStartTime = false;
          };
          
          input.addEventListener('blur', saveTime);
          input.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
              evt.preventDefault();
              saveTime();
            } else if (evt.key === 'Escape') {
              isEditingStartTime = false;
              startTimeBadge.style.display = '';
              input.remove();
            }
          });
          
          startTimeBadge.style.display = 'none';
          startTimeBadge.parentNode.insertBefore(input, startTimeBadge);
          input.focus();
          input.select();
        });
      }
      
      // Add edit button for ALL items (both default and user-added)
      // Use baseList we already have to determine if item is user-added
      const fullIndex = baseList.findIndex(x => {
        return x.t === item.t && x.s === item.s && x.a === item.a && (x.adult === item.adult || (!x.adult && !item.adult));
      });
      
      // Determine default count (after filtering deleted)
      let defaultCount;
      if (section === 'spells') {
        const spellCount = (spells[cat] || []).filter(item => {
          const itemId = getItemId('spells', item);
          return !(deletedDefaults.spells?.[cat] || []).includes(itemId);
        }).length;
        const adultCount = (adultSpells[cat] || []).filter(item => {
          const itemId = getItemId('spells', item);
          return !(deletedDefaults.adultSpells?.[cat] || []).includes(itemId);
        }).length;
        defaultCount = spellCount + adultCount;
      } else {
        const defaults = section === 'bardic' ? bardic : mockery;
        defaultCount = (defaults[cat] || []).filter(item => {
          const itemId = getItemId(section, item);
          return !(deletedDefaults[section]?.[cat] || []).includes(itemId);
        }).length;
      }
      
      // Check if this is a default item (before filtering deleted ones)
      const defaults = section === 'spells' ? spells
        : section === 'bardic' ? bardic
        : mockery;
      const defaultList = defaults[cat] || [];
      const itemId = getItemId(section, item);
      let isDefaultItem = defaultList.some(x => {
        return x.t === item.t && x.s === item.s && x.a === item.a;
      });
      // Also check adult spells for spells section
      if (section === 'spells' && !isDefaultItem) {
        isDefaultItem = (adultSpells[cat] || []).some(x => {
          return x.t === item.t && x.s === item.s && x.a === item.a;
        });
      }
      
      // Check if it's user-added
      const isUserAdded = fullIndex >= defaultCount;
      let userIndex = null;
      let isAdultSpell = false;
      
      if (isUserAdded) {
        if (section === 'spells' && item.adult) {
          const userSpells = userItems.spells[cat] || [];
          const spellDefaultCount = (spells[cat] || []).filter(item => {
            const itemId = getItemId('spells', item);
            return !(deletedDefaults.spells?.[cat] || []).includes(itemId);
          }).length;
          const adultDefaultCount = (adultSpells[cat] || []).filter(item => {
            const itemId = getItemId('spells', item);
            return !(deletedDefaults.adultSpells?.[cat] || []).includes(itemId);
          }).length;
          const userAdultStartIndex = spellDefaultCount + adultDefaultCount + userSpells.length;
          if (fullIndex >= userAdultStartIndex) {
            userIndex = fullIndex - userAdultStartIndex;
            isAdultSpell = true;
          } else {
            userIndex = fullIndex - spellDefaultCount;
          }
        } else {
          userIndex = fullIndex - defaultCount;
        }
      }
      
      const isDeletedDefault = (deletedDefaults[section]?.[cat] || []).includes(itemId) || 
                                (section === 'spells' && item.adult && (deletedDefaults.adultSpells?.[cat] || []).includes(itemId));
      
      // Show edit button on ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      editBtn.style.cssText = '';
      
      // Visual indicator for user-added items
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        // Default items get a blue border
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Store metadata about whether this is a default item
        const itemWithMeta = { ...item, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
        if (section === 'spells' && isAdultSpell) {
          itemWithMeta.adult = true;
        }
        // Pass -1 for default items to indicate they need special handling
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal(section, cat, itemWithMeta, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => copyLine(item));

      const p = document.createElement('div');
      p.textContent = item.t;
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      if (section === 'mockery') {
        meta.textContent = `Mockery — ${categorySelect.value}`;
      } else {
        meta.textContent = `Song: ${item.s} — ${item.a}${item.adult ? '  •  Adult' : ''}`;
      }

      card.appendChild(favBtn);
      card.appendChild(copyBtn);
      if (youtubeBtn) {
        card.appendChild(youtubeBtn);
      }
      if (startTimeBadge) {
        card.appendChild(startTimeBadge);
      }
      card.appendChild(chip);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderActions() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const cat = categorySelect.value;
    
    if (!cat) {
      console.warn('No category selected for actions');
      content.innerHTML = '<div class="card">Please select a category from the dropdown above</div>';
      // Try to select first category if available
      if (categorySelect.options.length > 0) {
        categorySelect.selectedIndex = 0;
        setTimeout(() => renderActions(), RENDER_DELAY_MS);
      }
      return;
    }
    
    // Get merged actions (defaults + user items, excluding deleted)
    const fullActions = getMergedData('actions', cat);
    const defaults = characterActions[cat] || [];
    let filteredActions = fullActions;
    
    debugLog(`renderActions: category=${cat}, fullActions=${fullActions.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredActions = fullActions.filter(a => a.toLowerCase().includes(q));
      debugLog(`renderActions: after search filter, filteredActions=${filteredActions.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredActions = filteredActions.filter(action => {
        const itemId = getItemId('actions', action);
        return favorites.has(itemId);
      });
      debugLog(`renderActions: after favorites filter, filteredActions=${filteredActions.length}`);
    }
    
    debugLog(`renderActions: final filteredActions=${filteredActions.length}, will render ${filteredActions.length} cards`);
    debugLog(`renderActions: content element exists:`, !!content);
    debugLog(`renderActions: Sample filteredActions (first 3):`, filteredActions.slice(0, 3));
    
    content.innerHTML = '';
    
    debugLog(`renderActions: content.innerHTML cleared`);
    
    // Add random button at the top (uses full list, not filtered)
    if (fullActions.length > 0) {
      debugLog(`renderActions: Adding random button, fullActions.length=${fullActions.length}`);
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomAction = fullActions[Math.floor(Math.random() * fullActions.length)];
        
        // Check if the selected action is in the filtered results
        const isInFiltered = filteredActions.includes(randomAction);
        
        // Find and highlight the selected action card if it's visible
        const allCards = content.querySelectorAll('.action-card');
        let selectedCard = null;
        for (const card of allCards) {
          // Find the div with the action text using data attribute
          const actionDiv = card.querySelector('[data-action-text]');
          if (actionDiv && actionDiv.dataset.actionText === randomAction) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomAction}`);
        } else if (!isInFiltered) {
          // Selected action is filtered out - show a longer toast message
          showToast(`Random: ${randomAction} (not in current filter)`);
        } else {
          showToast(`Random: ${randomAction}`);
        }
        copyToClipboard(randomAction, 'actions', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random action and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered actions
    const filteredDefaultCount = fullActions.length - ((userItems.actions && userItems.actions[cat]) ? userItems.actions[cat].length : 0);
    
    debugLog(`renderActions: Starting loop, filteredActions.length=${filteredActions.length}`);
    debugLog(`renderActions: userItems.actions exists:`, !!userItems.actions);
    debugLog(`renderActions: userItems.actions[cat] exists:`, !!(userItems.actions && userItems.actions[cat]));
    debugLog(`renderActions: filteredDefaultCount=${filteredDefaultCount}`);
    
    for (let i = 0; i < filteredActions.length; i++) {
      const action = filteredActions[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullActions.indexOf(action);
      
      // Check if this is a default item
      const itemId = getItemId('actions', action);
      const isDefaultItem = defaults.includes(action);
      const deletedIds = deletedDefaults.actions?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card action-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        // Remove highlights when clicking manually
        content.querySelectorAll('.action-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(action, 'actions', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      editBtn.style.cssText = '';
      
      // Visual indicator
      const isDarkActions = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDarkActions ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDarkActions ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Create an object wrapper for actions since strings can't have properties
        const actionObj = typeof action === 'string' ? action : action;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('actions', cat, actionObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        // Remove highlights when clicking manually
        content.querySelectorAll('.action-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(action, 'actions', cat);
      });

      const p = document.createElement('div');
      p.textContent = action;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.actionText = action; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Action — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
      debugLog(`renderActions: Appended card ${i + 1}/${filteredActions.length} for action: ${action.substring(0, 50)}...`);
    }
    
    debugLog(`renderActions: Loop complete, appended ${filteredActions.length} cards to content`);
    
    if (!filteredActions.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderCriticalHits() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderCriticalHits: No category selected');
      content.innerHTML = '<div class="card">Please select a category</div>';
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderCriticalHits(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged critical hits (defaults + user items, excluding deleted)
    const fullHits = getMergedData('criticalHits', cat);
    const defaults = criticalHits[cat] || [];
    let filteredHits = fullHits;
    
    debugLog(`renderCriticalHits: category=${cat}, fullHits=${fullHits.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredHits = fullHits.filter(h => h.toLowerCase().includes(q));
      debugLog(`renderCriticalHits: after search filter, filteredHits=${filteredHits.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredHits = filteredHits.filter(hit => {
        const itemId = getItemId('criticalHits', hit);
        return favorites.has(itemId);
      });
      debugLog(`renderCriticalHits: after favorites filter, filteredHits=${filteredHits.length}`);
    }
    
    debugLog(`renderCriticalHits: final filteredHits=${filteredHits.length}, will render ${filteredHits.length} cards`);
    
    content.innerHTML = '';
    
    // Add random button at the top (uses full list, not filtered)
    if (fullHits.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomHit = fullHits[Math.floor(Math.random() * fullHits.length)];
        
        // Check if the selected hit is in the filtered results
        const isInFiltered = filteredHits.includes(randomHit);
        
        // Find and highlight the selected hit card if it's visible
        const allCards = content.querySelectorAll('.critical-hit-card');
        let selectedCard = null;
        for (const card of allCards) {
          const hitDiv = card.querySelector('[data-hit-text]');
          if (hitDiv && hitDiv.dataset.hitText === randomHit) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomHit}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomHit} (not in current filter)`);
        } else {
          showToast(`Random: ${randomHit}`);
        }
        copyToClipboard(randomHit, 'criticalHits', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random critical hit description and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered critical hits
    const filteredDefaultCount = fullHits.length - ((userItems.criticalHits && userItems.criticalHits[cat]) ? userItems.criticalHits[cat].length : 0);
    
    debugLog(`renderCriticalHits: Starting loop, filteredHits.length=${filteredHits.length}`);
    
    for (let i = 0; i < filteredHits.length; i++) {
      const hit = filteredHits[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullHits.indexOf(hit);
      
      // Check if this is a default item
      const itemId = getItemId('criticalHits', hit);
      const isDefaultItem = defaults.includes(hit);
      const deletedIds = deletedDefaults.criticalHits?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card critical-hit-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.critical-hit-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(hit, 'criticalHits', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hitObj = typeof hit === 'string' ? hit : hit;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('criticalHits', cat, hitObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.critical-hit-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(hit, 'criticalHits', cat);
      });

      const p = document.createElement('div');
      p.textContent = hit;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.hitText = hit; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Critical Hit — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredHits.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderCriticalFailures() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderCriticalFailures: No category selected');
      content.innerHTML = '<div class="card">Please select a category</div>';
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderCriticalFailures(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged critical failures (defaults + user items, excluding deleted)
    const fullFailures = getMergedData('criticalFailures', cat);
    const defaults = criticalFailures[cat] || [];
    let filteredFailures = fullFailures;
    
    debugLog(`renderCriticalFailures: category=${cat}, fullFailures=${fullFailures.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredFailures = fullFailures.filter(f => f.toLowerCase().includes(q));
      debugLog(`renderCriticalFailures: after search filter, filteredFailures=${filteredFailures.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredFailures = filteredFailures.filter(failure => {
        const itemId = getItemId('criticalFailures', failure);
        return favorites.has(itemId);
      });
      debugLog(`renderCriticalFailures: after favorites filter, filteredFailures=${filteredFailures.length}`);
    }
    
    debugLog(`renderCriticalFailures: final filteredFailures=${filteredFailures.length}, will render ${filteredFailures.length} cards`);
    
    content.innerHTML = '';
    
    // Add random button at the top (uses full list, not filtered)
    if (fullFailures.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomFailure = fullFailures[Math.floor(Math.random() * fullFailures.length)];
        
        // Check if the selected failure is in the filtered results
        const isInFiltered = filteredFailures.includes(randomFailure);
        
        // Find and highlight the selected failure card if it's visible
        const allCards = content.querySelectorAll('.critical-failure-card');
        let selectedCard = null;
        for (const card of allCards) {
          const failureDiv = card.querySelector('[data-failure-text]');
          if (failureDiv && failureDiv.dataset.failureText === randomFailure) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomFailure}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomFailure} (not in current filter)`);
        } else {
          showToast(`Random: ${randomFailure}`);
        }
        copyToClipboard(randomFailure, 'criticalFailures', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random critical failure description and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered critical failures
    const filteredDefaultCount = fullFailures.length - ((userItems.criticalFailures && userItems.criticalFailures[cat]) ? userItems.criticalFailures[cat].length : 0);
    
    debugLog(`renderCriticalFailures: Starting loop, filteredFailures.length=${filteredFailures.length}`);
    
    for (let i = 0; i < filteredFailures.length; i++) {
      const failure = filteredFailures[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullFailures.indexOf(failure);
      
      // Check if this is a default item
      const itemId = getItemId('criticalFailures', failure);
      const isDefaultItem = defaults.includes(failure);
      const deletedIds = deletedDefaults.criticalFailures?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card critical-failure-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.critical-failure-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(failure, 'criticalFailures', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const failureObj = typeof failure === 'string' ? failure : failure;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('criticalFailures', cat, failureObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.critical-failure-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(failure, 'criticalFailures', cat);
      });

      const p = document.createElement('div');
      p.textContent = failure;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.failureText = failure; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Critical Failure — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredFailures.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderSkillChecks() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderSkillChecks: No category selected');
      content.innerHTML = '<div class="card">Please select a category</div>';
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderSkillChecks(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged skill checks (defaults + user items, excluding deleted)
    const fullChecks = getMergedData('skillChecks', cat);
    const defaults = skillChecks[cat] || [];
    let filteredChecks = fullChecks;
    
    debugLog(`renderSkillChecks: category=${cat}, fullChecks=${fullChecks.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredChecks = fullChecks.filter(c => c.toLowerCase().includes(q));
      debugLog(`renderSkillChecks: after search filter, filteredChecks=${filteredChecks.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredChecks = filteredChecks.filter(check => {
        const itemId = getItemId('skillChecks', check);
        return favorites.has(itemId);
      });
      debugLog(`renderSkillChecks: after favorites filter, filteredChecks=${filteredChecks.length}`);
    }
    
    debugLog(`renderSkillChecks: final filteredChecks=${filteredChecks.length}, will render ${filteredChecks.length} cards`);
    
    content.innerHTML = '';
    
    // Add random button at the top (uses full list, not filtered)
    if (fullChecks.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Random Skill Check 🎲';
      randomBtn.addEventListener('click', () => {
        const randomCheck = fullChecks[Math.floor(Math.random() * fullChecks.length)];
        
        // Check if the selected check is in the filtered results
        const isInFiltered = filteredChecks.includes(randomCheck);
        
        // Find and highlight the selected check card if it's visible
        const allCards = content.querySelectorAll('.skill-check-card');
        let selectedCard = null;
        for (const card of allCards) {
          const checkDiv = card.querySelector('[data-check-text]');
          if (checkDiv && checkDiv.dataset.checkText === randomCheck) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomCheck}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomCheck} (not in current filter)`);
        } else {
          showToast(`Random: ${randomCheck}`);
        }
        copyToClipboard(randomCheck, 'skillChecks', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random skill check result and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered skill checks
    const filteredDefaultCount = fullChecks.length - ((userItems.skillChecks && userItems.skillChecks[cat]) ? userItems.skillChecks[cat].length : 0);
    
    debugLog(`renderSkillChecks: Starting loop, filteredChecks.length=${filteredChecks.length}`);
    
    for (let i = 0; i < filteredChecks.length; i++) {
      const check = filteredChecks[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullChecks.indexOf(check);
      
      // Check if this is a default item
      const itemId = getItemId('skillChecks', check);
      const isDefaultItem = defaults.includes(check);
      const deletedIds = deletedDefaults.skillChecks?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card skill-check-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.skill-check-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(check, 'skillChecks', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const checkObj = typeof check === 'string' ? check : check;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('skillChecks', cat, checkObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.skill-check-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(check, 'skillChecks', cat);
      });

      const p = document.createElement('div');
      p.textContent = check;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.checkText = check; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Skill Check — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredChecks.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  // History tracking functions
  function loadHistory() {
    try {
      const raw = localStorage.getItem(historyKey);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(historyKey, JSON.stringify(trimmed));
      scheduleFileSave();
    } catch(e) {
      handleError('saveHistory', e, 'Failed to save history');
    }
  }

  function addToHistory(text, section, category) {
    const history = loadHistory();
    const entry = { text, section, category, timestamp: Date.now() };
    // Remove duplicates (same text)
    const filtered = history.filter(h => h.text !== text);
    // Add to front
    filtered.unshift(entry);
    saveHistory(filtered);
  }

  // Generator Management functions
  let currentGeneratorType = 'battleCries';
  let currentEditingGeneratorIndex = null;
  let currentEditingGeneratorIsDefault = false;
  let currentEditingGeneratorItemId = null;

  function refreshGeneratorsList() {
    if (!generatorTypeSelect) {
      console.error('generatorTypeSelect not found!');
      return;
    }
    if (!generatorsList) {
      console.error('generatorsList not found!');
      return;
    }
    const type = generatorTypeSelect.value;
    currentGeneratorType = type;
    const defaults = {
      battleCries: battleCries,
      insults: insults,
      compliments: compliments
    };
    const userAdded = loadUserGenerators();
    const editedDefaults = loadEditedDefaults();
    const deletedDefaults = loadDeletedGeneratorDefaults();
    
    // Build list of all items with metadata
    const itemsWithMeta = [];
    
    // Add default items (with edits and deletions applied)
    (defaults[type] || []).forEach((item, index) => {
      const itemId = `${type}_${index}`;
      // Skip if deleted
      if ((deletedDefaults[type] || []).includes(itemId)) {
        return;
      }
      // Use edited version if exists, otherwise original
      const displayText = (editedDefaults[type] && editedDefaults[type][itemId]) 
        ? editedDefaults[type][itemId] 
        : item;
      itemsWithMeta.push({
        text: displayText,
        isDefault: true,
        index: index,
        itemId: itemId,
        originalText: item
      });
    });
    
    // Add user-added items
    (userAdded[type] || []).forEach((item, index) => {
      itemsWithMeta.push({
        text: item,
        isDefault: false,
        index: index
      });
    });

    generatorsList.innerHTML = '';

    if (itemsWithMeta.length === 0) {
      generatorsList.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">No items yet. Add one to get started!</div>';
      return;
    }

    const isDark = document.body.classList.contains('dark-mode');
    const typeNames = {
      battleCries: '⚔️ Battle Cries',
      insults: '🗡️ Insults',
      compliments: '💬 Compliments'
    };

    itemsWithMeta.forEach((itemMeta) => {
      const generatorCard = document.createElement('div');
      generatorCard.style.display = 'flex';
      generatorCard.style.justifyContent = 'space-between';
      generatorCard.style.alignItems = 'center';
      generatorCard.style.padding = '12px';
      generatorCard.style.border = '1px solid var(--burnt)';
      generatorCard.style.borderRadius = '6px';
      generatorCard.style.background = isDark ? '#2d2d44' : 'white';
      generatorCard.style.gap = '8px';
      if (!itemMeta.isDefault) {
        generatorCard.style.borderLeft = '4px solid #2b6f3a';
      } else if (editedDefaults[type] && editedDefaults[type][itemMeta.itemId]) {
        generatorCard.style.borderLeft = '4px solid #4a90e2';
      }

      const generatorInfo = document.createElement('div');
      generatorInfo.style.flex = '1';
      generatorInfo.style.fontSize = '14px';
      generatorInfo.textContent = itemMeta.text;
      generatorInfo.title = itemMeta.text;
      if (itemMeta.isDefault && editedDefaults[type] && editedDefaults[type][itemMeta.itemId]) {
        generatorInfo.style.fontStyle = 'italic';
        generatorInfo.title = `Edited from: ${itemMeta.originalText}`;
      }

      const buttonsDiv = document.createElement('div');
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.gap = '4px';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.textContent = 'Edit';
      editBtn.style.fontSize = '12px';
      editBtn.addEventListener('click', () => {
        if (itemMeta.isDefault) {
          currentEditingGeneratorIndex = itemMeta.index;
          currentEditingGeneratorIsDefault = true;
          currentEditingGeneratorItemId = itemMeta.itemId;
        } else {
          currentEditingGeneratorIndex = itemMeta.index;
          currentEditingGeneratorIsDefault = false;
          currentEditingGeneratorItemId = null;
        }
        generatorEditText.value = itemMeta.text;
        generatorEditTitle.textContent = `Edit ${typeNames[type]} Item`;
        deleteGeneratorBtn.style.display = '';
        generatorEditModal.classList.add('show');
        generatorEditModal.setAttribute('aria-hidden', 'false');
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.fontSize = '12px';
      deleteBtn.style.background = '#c44';
      deleteBtn.style.color = 'white';
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete this ${typeNames[type].toLowerCase()} item?`)) {
          if (itemMeta.isDefault) {
            // Delete default item
            const deleted = loadDeletedGeneratorDefaults();
            if (!deleted[type]) deleted[type] = [];
            if (!deleted[type].includes(itemMeta.itemId)) {
              deleted[type].push(itemMeta.itemId);
            }
            // Also remove any edits
            const edited = loadEditedDefaults();
            if (edited[type] && edited[type][itemMeta.itemId]) {
              delete edited[type][itemMeta.itemId];
              saveEditedDefaults(edited);
            }
            saveDeletedGeneratorDefaults(deleted);
            debugLog('Deleted default item (from manage modal):', itemMeta.itemId);
            debugLog('Deleted list for', type, ':', deleted[type]);
            showToast('Default item deleted');
          } else {
            // Delete user-added item
            const userGenerators = loadUserGenerators();
            userGenerators[type].splice(itemMeta.index, 1);
            saveUserGenerators(userGenerators);
            showToast('Item deleted');
          }
          refreshGeneratorsList();
        }
      });

      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(deleteBtn);
      generatorCard.appendChild(generatorInfo);
      generatorCard.appendChild(buttonsDiv);
      generatorsList.appendChild(generatorCard);
    });
  }

  function showGeneratorManageModal() {
    if (!generatorManageModal) {
      console.error('generatorManageModal not found!');
      showToast('Error: Generator management modal not found');
      return;
    }
    
    try {
      refreshGeneratorsList();
    } catch (error) {
      console.error('Error refreshing generators list:', error);
    }
    
    generatorManageModal.classList.add('show');
    generatorManageModal.setAttribute('aria-hidden', 'false');
  }

  function closeGeneratorManageModal() {
    if (!generatorManageModal) {
      console.error('generatorManageModal not found in closeGeneratorManageModal!');
      return;
    }
    generatorManageModal.classList.remove('show');
    generatorManageModal.setAttribute('aria-hidden', 'true');
  }

  function openGeneratorEditModal() {
    if (!generatorEditModal || !generatorEditText || !generatorEditTitle || !generatorTypeSelect || !deleteGeneratorBtn) {
      console.error('Missing required elements for openGeneratorEditModal:', {
        generatorEditModal: !!generatorEditModal,
        generatorEditText: !!generatorEditText,
        generatorEditTitle: !!generatorEditTitle,
        generatorTypeSelect: !!generatorTypeSelect,
        deleteGeneratorBtn: !!deleteGeneratorBtn
      });
      showToast('Error: Generator edit modal elements not found');
      return;
    }
    currentEditingGeneratorIndex = null;
    currentEditingGeneratorIsDefault = false;
    currentEditingGeneratorItemId = null;
    generatorEditText.value = '';
    const typeNames = {
      battleCries: '⚔️ Battle Cries',
      insults: '🗡️ Insults',
      compliments: '💬 Compliments'
    };
    generatorEditTitle.textContent = `Add ${typeNames[generatorTypeSelect.value]} Item`;
    deleteGeneratorBtn.style.display = 'none';
    generatorEditModal.classList.add('show');
    generatorEditModal.setAttribute('aria-hidden', 'false');
  }

  function closeGeneratorEditModal() {
    if (!generatorEditModal) {
      console.error('generatorEditModal not found in closeGeneratorEditModal!');
      return;
    }
    generatorEditModal.classList.remove('show');
    generatorEditModal.setAttribute('aria-hidden', 'true');
    currentEditingGeneratorIndex = null;
    currentEditingGeneratorIsDefault = false;
    currentEditingGeneratorItemId = null;
  }

  function saveGeneratorItem() {
    const text = generatorEditText.value.trim();
    if (!text) {
      showToast('Please enter text');
      return;
    }

    const type = currentGeneratorType;

    if (currentEditingGeneratorIndex !== null) {
      if (currentEditingGeneratorIsDefault) {
        // Editing default item - save as edited default
        const editedDefaults = loadEditedDefaults();
        if (!editedDefaults[type]) editedDefaults[type] = {};
        editedDefaults[type][currentEditingGeneratorItemId] = text;
        saveEditedDefaults(editedDefaults);
        showToast('Default item updated');
      } else {
        // Editing user-added item
        const userGenerators = loadUserGenerators();
        userGenerators[type][currentEditingGeneratorIndex] = text;
        saveUserGenerators(userGenerators);
        showToast('Item updated');
      }
    } else {
      // Adding new item
      const userGenerators = loadUserGenerators();
      if (!userGenerators[type]) {
        userGenerators[type] = [];
      }
      userGenerators[type].push(text);
      saveUserGenerators(userGenerators);
      showToast('Item added');
    }

    refreshGeneratorsList();
    closeGeneratorEditModal();
  }

  function deleteGeneratorItem() {
    if (currentEditingGeneratorIndex === null) return;

    if (confirm('Are you sure you want to delete this item?')) {
      if (currentEditingGeneratorIsDefault) {
        // Delete default item
        const deleted = loadDeletedGeneratorDefaults();
        if (!deleted[currentGeneratorType]) deleted[currentGeneratorType] = [];
        if (!deleted[currentGeneratorType].includes(currentEditingGeneratorItemId)) {
          deleted[currentGeneratorType].push(currentEditingGeneratorItemId);
        }
        // Also remove any edits
        const edited = loadEditedDefaults();
        if (edited[currentGeneratorType] && edited[currentGeneratorType][currentEditingGeneratorItemId]) {
          delete edited[currentGeneratorType][currentEditingGeneratorItemId];
          saveEditedDefaults(edited);
        }
        saveDeletedGeneratorDefaults(deleted);
        debugLog('Deleted default item:', currentEditingGeneratorItemId);
        debugLog('Deleted list for', currentGeneratorType, ':', deleted[currentGeneratorType]);
        showToast('Default item deleted');
      } else {
        // Delete user-added item
        const userGenerators = loadUserGenerators();
        userGenerators[currentGeneratorType].splice(currentEditingGeneratorIndex, 1);
        saveUserGenerators(userGenerators);
        debugLog('Deleted user-added item at index:', currentEditingGeneratorIndex);
        showToast('Item deleted');
      }
      refreshGeneratorsList();
      closeGeneratorEditModal();
    }
  }

  // YouTube URL parsing function
  function parseYouTubeUrl(url) {
    if (!url) return null;
    
    // Trim whitespace
    url = url.trim();
    
    // Remove any URL fragments
    url = url.split('#')[0];
    
    // If it's already just a video ID (11 characters, alphanumeric + hyphen + underscore)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    // Try to extract video ID from various YouTube URL formats
    // Handle youtu.be URLs with query parameters (extract ID before ?)
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return youtuBeMatch[1];
    }
    
    // Handle youtube.com/watch URLs
    // Try to parse using URLSearchParams for reliable extraction
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return videoId;
        }
      }
    } catch (e) {
      // Fall back to regex if URL parsing fails
    }
    
    // Fallback: Use regex to match v=VIDEO_ID in the URL
    // This handles both ?v=VIDEO_ID and &v=VIDEO_ID cases
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // Handle youtube.com/embed URLs
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }
    
    // Generic pattern as fallback
    const genericMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (genericMatch && genericMatch[1]) {
      return genericMatch[1];
    }
    
    return null;
  }
  
  // Format time in seconds to mm:ss format
  function formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Parse time input (accepts "30" or "0:30" format)
  function parseTime(input) {
    if (!input) return null;
    const trimmed = input.trim();
    
    // If it's just a number, treat as seconds
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    
    // Try to parse mm:ss format
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    
    return null;
  }
  
  // Auto-match songs to YouTube karaoke videos
  function generateKaraokeSearchUrl(song, artist) {
    // Clean song and artist names
    const cleanSong = song.replace(/[()'"]/g, '').trim();
    const cleanArtist = artist.replace(/[()'"]/g, '').trim();
    
    // Build search query: "Song Name Artist karaoke"
    const searchQuery = encodeURIComponent(`${cleanSong} ${cleanArtist} karaoke`);
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  }
  
  // Attempt to find likely karaoke video (heuristic-based)
  function findKaraokeVideo(song, artist) {
    // Skip "Forgotten Realms Lore" entries
    if (artist === 'Mockery' || song === 'Forgotten Realms Lore') {
      return null;
    }
    
    // Handle artist with "&" (e.g., "Queen & David Bowie")
    let searchArtist = artist;
    if (artist.includes('&')) {
      searchArtist = artist.split('&')[0].trim();
    }
    
    return generateKaraokeSearchUrl(song, searchArtist);
  }
  
  // Helper function to open YouTube video
  // RedirectTube extension will intercept YouTube links and redirect to FreeTube
  function openYouTubeVideo(watchUrl, title = 'Karaoke Track') {
    // Simply open the URL - RedirectTube should intercept window.open() calls
    window.open(watchUrl, '_blank');
    showToast(`Opening ${title}...`);
  }
  
  // Show YouTube player - opens in FreeTube if available, otherwise YouTube
  function showYouTubePlayer(videoId, startTime = 0, title = 'Karaoke Track') {
    if (!videoId) {
      showToast('Invalid YouTube video ID');
      return;
    }
    
    // Clean video ID (remove any remaining query parameters or fragments)
    const cleanVideoId = videoId.split('?')[0].split('&')[0].trim();
    
    if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)) {
      showToast('Invalid YouTube video ID format');
      return;
    }
    
    // Build watch URL with start time parameter
    const startSeconds = Math.floor(startTime || 0);
    const watchParams = new URLSearchParams();
    watchParams.set('v', cleanVideoId);
    if (startSeconds > 0) {
      watchParams.set('t', startSeconds.toString());
    }
    watchParams.set('autoplay', '1');
    
    const watchUrl = `https://www.youtube.com/watch?${watchParams.toString()}`;
    
    // Open in FreeTube if available, otherwise YouTube
    openYouTubeVideo(watchUrl, title);
  }
  
  // Close YouTube player modal
  function closeYouTubePlayer() {
    youtubePlayerModal.classList.remove('show');
    youtubePlayerModal.setAttribute('aria-hidden', 'true');
    // Stop video by clearing src
    if (youtubePlayerFrame) {
      youtubePlayerFrame.src = '';
    }
    // Hide fallback
    if (youtubeFallback) {
      youtubeFallback.style.display = 'none';
    }
  }

  function copyToClipboard(text, section = null, category = null) {
    navigator.clipboard.writeText(text).then(() => {
      if (section && category) {
        addToHistory(text, section, category);
      }
      showToast('Copied to clipboard');
    }).catch(() => {
      showToast('Copy failed');
    });
  }

  async function copyLine(item) {
    try {
      const section = sectionSelect.value;
      const category = categorySelect.value;
      const text = (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') ? item : `${item.t} (Song: ${item.s} — ${item.a})`;
      await navigator.clipboard.writeText(text);
      addToHistory(text, section, category);
      showToast('Copied to clipboard');
    } catch (e) {
      showToast('Copy failed');
    }
  }

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), TOAST_AUTO_HIDE_DURATION_MS);
  }

  // Modal functions
  function openEditModal(section, category, item, userIndex) {
    currentEditingSection = section;
    currentEditingCategory = category;
    currentEditingIndex = userIndex;
    
    // Store item metadata separately for actions/criticalHits/criticalFailures (since they're strings)
    if ((section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') && typeof item === 'string') {
      // Check if it's a default item
      const defaults = section === 'actions' ? (characterActions[category] || []) 
        : section === 'criticalHits' ? (criticalHits[category] || [])
        : section === 'criticalFailures' ? (criticalFailures[category] || [])
        : section === 'skillChecks' ? (skillChecks[category] || [])
        : [];
      const itemId = getItemId(section, item);
      const deletedIds = deletedDefaults[section]?.[category] || [];
      const isDefaultItem = defaults.includes(item);
      const isDeletedDefault = deletedIds.includes(itemId);
      const fullItems = getMergedData(section, category);
      const filteredDefaultCount = fullItems.length - ((userItems[section] && userItems[section][category]) ? userItems[section][category].length : 0);
      const fullIndex = fullItems.indexOf(item);
      const isUserAdded = fullIndex >= filteredDefaultCount;
      
      currentEditingItem = {
        _isDefaultItem: isDefaultItem && !isDeletedDefault,
        _isUserAdded: isUserAdded,
        _text: item
      };
    } else {
      currentEditingItem = item;
    }
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    const isEditing = (userIndex !== null && userIndex !== undefined && userIndex >= 0) || (userIndex === -1);
    
    modalTitle.textContent = isEditing ? 'Edit Item' : 'Add New Item';
    deleteEditBtn.style.display = isEditing ? 'block' : 'none';
    
    // Show/hide fields based on section type
    if (isActions) {
      const text = typeof item === 'string' ? item : (item?._text || item?._actionText || item?.t || '');
      editText.value = text;
      songLabel.style.display = 'none';
      artistLabel.style.display = 'none';
      adultLabel.style.display = 'none';
      youtubeFields.style.display = 'none';
    } else {
      // Song-based sections: spells, bardic, mockery
      editText.value = item?.t || '';
      editSong.value = item?.s || '';
      editArtist.value = item?.a || '';
      editAdult.checked = item?.adult || false;
      
      // Show YouTube fields for song-based sections
      const youtubeUrl = item?.youtube || '';
      const startTime = item?.startTime;
      editYoutube.value = youtubeUrl;
      editStartTime.value = startTime ? (typeof startTime === 'number' ? formatTime(startTime) : startTime.toString()) : '';
      
      // Generate karaoke suggestion if no YouTube URL exists
      // Check for song and artist properties (item.s and item.a)
      if (youtubeSuggestion && youtubeSuggestionText) {
        const song = item?.s || item?.song || '';
        const artist = item?.a || item?.artist || '';
        if (!youtubeUrl && song && artist) {
          const searchUrl = findKaraokeVideo(song, artist);
          if (searchUrl) {
            youtubeSuggestionText.textContent = `Find karaoke for "${song}" by ${artist}`;
            youtubeSuggestion.dataset.searchUrl = searchUrl;
            youtubeSuggestion.style.display = 'block';
          } else {
            youtubeSuggestion.style.display = 'none';
          }
        } else {
          youtubeSuggestion.style.display = 'none';
        }
      }
      
      songLabel.style.display = 'block';
      artistLabel.style.display = 'block';
      adultLabel.style.display = section === 'spells' ? 'block' : 'none';
      youtubeFields.style.display = 'block';
    }
    
    editModal.classList.add('show');
    editModal.setAttribute('aria-hidden', 'false');
    editText.focus();
  }
  
  function closeEditModal() {
    editModal.classList.remove('show');
    editModal.setAttribute('aria-hidden', 'true');
    currentEditingItem = null;
    currentEditingIndex = null;
    currentEditingSection = null;
    currentEditingCategory = null;
    editText.value = '';
    editSong.value = '';
    editArtist.value = '';
    editAdult.checked = false;
    editYoutube.value = '';
    editStartTime.value = '';
    
    // Hide YouTube suggestion
    if (youtubeSuggestion) {
      youtubeSuggestion.style.display = 'none';
    }
  }
  
  function saveEditItem() {
    console.log('=== saveEditItem FUNCTION CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Section:', currentEditingSection, 'Category:', currentEditingCategory);
    console.log('Index:', currentEditingIndex, 'Item:', currentEditingItem);
    console.log('editText exists:', !!editText, 'value:', editText?.value);
    console.log('editSong exists:', !!editSong, 'value:', editSong?.value);
    console.log('editArtist exists:', !!editArtist, 'value:', editArtist?.value);
    
    // Show immediate feedback
    showToast('Saving...');
    
    const section = currentEditingSection;
    const category = currentEditingCategory;
    
    if (!section || !category) {
      console.error('✗ ERROR: Missing section or category', { section, category });
      showToast('Error: Missing section or category');
      return;
    }
    
    console.log('✓ Section and category validated:', section, category);
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    const isUserAdded = currentEditingItem?._isUserAdded;
    
    if (isActions) {
      const text = editText.value.trim();
      if (!text) {
        const sectionName = section === 'actions' ? 'action' : (section === 'criticalHits' ? 'critical hit' : (section === 'criticalFailures' ? 'critical failure' : 'skill check'));
        showToast(`Please enter ${sectionName} text`);
        return;
      }
      
      if (!userItems[section]) {
        userItems[section] = {};
      }
      if (!userItems[section][category]) {
        userItems[section][category] = [];
      }
      
      if (currentEditingIndex !== null && currentEditingIndex !== undefined && currentEditingIndex >= 0) {
        // Editing existing user item
        userItems[section][category][currentEditingIndex] = text;
        const sectionName = section === 'actions' ? 'Action' : (section === 'criticalHits' ? 'Critical hit' : (section === 'criticalFailures' ? 'Critical failure' : 'Skill check'));
        showToast(`${sectionName} updated`);
      } else if (currentEditingIndex === -1 && isDefaultItem) {
        // Editing a default item - hide original and add edited version
        const originalItem = (currentEditingItem._text || currentEditingItem._actionText || currentEditingItem);
        const originalId = getItemId(section, originalItem);
        if (!deletedDefaults[section]) {
          deletedDefaults[section] = {};
        }
        if (!deletedDefaults[section][category]) {
          deletedDefaults[section][category] = [];
        }
        if (!deletedDefaults[section][category].includes(originalId)) {
          deletedDefaults[section][category].push(originalId);
        }
        userItems[section][category].push(text);
        saveDeletedDefaults(deletedDefaults);
        const sectionName = section === 'actions' ? 'action' : (section === 'criticalHits' ? 'critical hit' : (section === 'criticalFailures' ? 'critical failure' : 'skill check'));
        showToast(`Default ${sectionName} edited (original hidden)`);
      } else {
        // Adding new
        userItems[section][category].push(text);
        const sectionName = section === 'actions' ? 'Action' : (section === 'criticalHits' ? 'Critical hit' : (section === 'criticalFailures' ? 'Critical failure' : 'Skill check'));
        showToast(`${sectionName} added`);
      }
    } else {
      const text = editText.value.trim();
      const song = editSong.value.trim();
      const artist = editArtist.value.trim();
      
      if (!text || !song || !artist) {
        showToast('Please fill in all fields');
        return;
      }
      
      // Parse YouTube URL and start time
      // Safely access YouTube input elements (they may be null if not found)
      // Don't block save if elements don't exist - just skip YouTube fields
      const youtubeInput = editYoutube ? (editYoutube.value || '').trim() : '';
      const startTimeInput = editStartTime ? (editStartTime.value || '').trim() : '';
      
      console.log('YouTube inputs:', { youtubeInput, startTimeInput, editYoutube: !!editYoutube, editStartTime: !!editStartTime });
      
      let youtube = null;
      let startTime = null;
      
      if (youtubeInput) {
        const videoId = parseYouTubeUrl(youtubeInput);
        console.log('Parsed YouTube URL:', youtubeInput, '-> Video ID:', videoId);
        if (videoId) {
          youtube = videoId;
        } else {
          // Only show error if it looks like a URL attempt (contains youtube.com or youtu.be)
          // Otherwise, just ignore invalid input (user might be typing)
          if (youtubeInput.includes('youtube.com') || youtubeInput.includes('youtu.be')) {
            console.warn('Invalid YouTube URL format:', youtubeInput);
            showToast('Invalid YouTube URL format. Leave blank or use a valid video URL.');
            return;
          }
          // If it's a partial video ID (like "g1lmQ&list=..."), try to extract just the ID part
          // Check if it looks like it might be part of a video ID (alphanumeric, 11 chars or less)
          const partialMatch = youtubeInput.match(/([a-zA-Z0-9_-]{11})/);
          if (partialMatch && partialMatch[1]) {
            console.log('Found potential video ID in partial input:', partialMatch[1]);
            youtube = partialMatch[1];
          } else {
            // If it doesn't look like a URL or partial ID, just ignore it (don't block save)
            console.log('Ignoring non-URL input in YouTube field:', youtubeInput);
          }
        }
      }
      
      if (startTimeInput) {
        const parsedTime = parseTime(startTimeInput);
        console.log('Parsed start time input:', startTimeInput, '-> Parsed:', parsedTime);
        if (parsedTime !== null) {
          startTime = parsedTime;
          console.log('Parsed start time:', startTime);
        } else {
          // Only block save if it clearly looks like a time format attempt (contains digits and colons)
          // Allow random text to be ignored
          if (/^\d+[:]\d+/.test(startTimeInput) || /^\d+$/.test(startTimeInput)) {
            console.warn('Invalid start time format:', startTimeInput);
            showToast('Invalid start time format (use seconds like "30" or time like "0:30")');
            return;
          }
          // If it doesn't look like a time format, just ignore it and continue
          console.log('Ignoring non-time input in startTime field:', startTimeInput);
        }
      }
      
      console.log('Creating newItem with:', { text, song, artist, youtube, startTime });
      
      const newItem = {
        t: text,
        s: song,
        a: artist
      };
      
      // Add YouTube properties if provided
      if (youtube) {
        newItem.youtube = youtube;
        console.log('Added youtube property:', youtube);
      }
      if (startTime !== null && startTime !== undefined) {
        newItem.startTime = startTime;
        console.log('Added startTime property:', startTime);
      }
      
      console.log('Final newItem:', newItem);
      console.log('About to process save logic for section:', section, 'category:', category);
      
      const wasAdultSpell = section === 'spells' && currentEditingItem?.adult;
      const isAdultSpell = section === 'spells' && editAdult && editAdult.checked;
      
      if (currentEditingIndex !== null && currentEditingIndex !== undefined && currentEditingIndex >= 0) {
        // Editing existing user item
        if (section === 'spells') {
          // If it was an adult spell but now isn't, remove from adult and add to regular
          if (wasAdultSpell && !isAdultSpell) {
            // Remove from adult spells
            if (userItems.adultSpells[category]) {
              userItems.adultSpells[category].splice(currentEditingIndex, 1);
              if (userItems.adultSpells[category].length === 0) {
                delete userItems.adultSpells[category];
              }
            }
            // Add to regular spells
            if (!userItems.spells) {
              userItems.spells = {};
            }
            if (!userItems.spells[category]) {
              userItems.spells[category] = [];
            }
            userItems.spells[category].push(newItem);
            showToast('Spell updated (moved to regular)');
          }
          // If it wasn't an adult spell but now is, remove from regular and add to adult
          else if (!wasAdultSpell && isAdultSpell) {
            // Remove from regular spells
            if (userItems.spells[category]) {
              userItems.spells[category].splice(currentEditingIndex, 1);
              if (userItems.spells[category].length === 0) {
                delete userItems.spells[category];
              }
            }
            // Add to adult spells
            if (!userItems.adultSpells) {
              userItems.adultSpells = {};
            }
            if (!userItems.adultSpells[category]) {
              userItems.adultSpells[category] = [];
            }
            newItem.adult = true;
            userItems.adultSpells[category].push(newItem);
            showToast('Spell updated (moved to adult)');
          }
          // If it stays in the same category
          else if (isAdultSpell) {
            if (!userItems.adultSpells) {
              userItems.adultSpells = {};
            }
            if (!userItems.adultSpells[category]) {
              userItems.adultSpells[category] = [];
            }
            newItem.adult = true;
            userItems.adultSpells[category][currentEditingIndex] = newItem;
            showToast('Adult spell updated');
          } else {
            if (!userItems.spells) {
              userItems.spells = {};
            }
            if (!userItems.spells[category]) {
              userItems.spells[category] = [];
            }
            userItems.spells[category][currentEditingIndex] = newItem;
            showToast('Spell updated');
          }
        } else {
          // Non-spell sections
          if (!userItems[section]) {
            userItems[section] = {};
          }
          if (!userItems[section][category]) {
            userItems[section][category] = [];
          }
          userItems[section][category][currentEditingIndex] = newItem;
          showToast('Item updated');
        }
      } else if (currentEditingIndex === -1 && isDefaultItem) {
        // Editing a default item - hide original and add edited version
        const originalItem = currentEditingItem;
        const originalId = getItemId(section, originalItem);
        const deleteSection = (section === 'spells' && isAdultSpell) ? 'adultSpells' : section;
        
        if (!deletedDefaults[deleteSection]) {
          deletedDefaults[deleteSection] = {};
        }
        if (!deletedDefaults[deleteSection][category]) {
          deletedDefaults[deleteSection][category] = [];
        }
        if (!deletedDefaults[deleteSection][category].includes(originalId)) {
          deletedDefaults[deleteSection][category].push(originalId);
        }
        
        // Add edited version to user items
        if (section === 'spells' && isAdultSpell) {
          if (!userItems.adultSpells) {
            userItems.adultSpells = {};
          }
          if (!userItems.adultSpells[category]) {
            userItems.adultSpells[category] = [];
          }
          newItem.adult = true;
          userItems.adultSpells[category].push(newItem);
          showToast('Default spell edited (original hidden)');
        } else {
          if (!userItems[section]) {
            userItems[section] = {};
          }
          if (!userItems[section][category]) {
            userItems[section][category] = [];
          }
          userItems[section][category].push(newItem);
          showToast('Default item edited (original hidden)');
        }
        saveDeletedDefaults(deletedDefaults);
      } else {
        // Adding new item
        if (section === 'spells' && isAdultSpell) {
          // Adult spell
          if (!userItems.adultSpells) {
            userItems.adultSpells = {};
          }
          if (!userItems.adultSpells[category]) {
            userItems.adultSpells[category] = [];
          }
          newItem.adult = true;
          userItems.adultSpells[category].push(newItem);
          showToast('Adult spell added');
        } else {
          // Regular item
          if (!userItems[section]) {
            userItems[section] = {};
          }
          if (!userItems[section][category]) {
            userItems[section][category] = [];
          }
          userItems[section][category].push(newItem);
          showToast('Item added');
        }
      }
    }
    
    console.log('=== SAVE COMPLETE - About to persist ===');
    console.log('About to save userItems:', userItems);
    console.log('UserItems keys:', Object.keys(userItems));
    
    try {
      saveUserItems(userItems);
      console.log('✓ Successfully saved user items to localStorage');
      debugLog('Saved user items:', userItems);
      
      // Small delay to ensure save completes before closing modal
      setTimeout(() => {
        console.log('Closing modal and rendering...');
        closeEditModal();
        render();
        console.log('✓ Modal closed and render completed');
      }, 100);
    } catch (error) {
      console.error('✗ ERROR in saveEditItem:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast('Error saving item: ' + error.message);
    }
  }
  
  function deleteEditItem() {
    const section = currentEditingSection;
    const category = currentEditingCategory;
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    
    if (currentEditingIndex === -1 && isDefaultItem) {
      // Deleting a default item - add to deletedDefaults
      const itemId = getItemId(section, currentEditingItem._text || currentEditingItem._actionText || currentEditingItem);
      const deleteSection = (section === 'spells' && currentEditingItem?.adult) ? 'adultSpells' : section;
      
      if (!deletedDefaults[deleteSection]) {
        deletedDefaults[deleteSection] = {};
      }
      if (!deletedDefaults[deleteSection][category]) {
        deletedDefaults[deleteSection][category] = [];
      }
      if (!deletedDefaults[deleteSection][category].includes(itemId)) {
        deletedDefaults[deleteSection][category].push(itemId);
      }
      saveDeletedDefaults(deletedDefaults);
      showToast('Default item deleted');
      render();
      return;
    }
    
    if (currentEditingIndex === null || currentEditingIndex === undefined || currentEditingIndex < 0) {
      showToast('Cannot delete: Invalid item');
      return;
    }
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    
    if (isActions) {
      if (userItems[section] && userItems[section][category]) {
        userItems[section][category].splice(currentEditingIndex, 1);
        if (userItems[section][category].length === 0) {
          delete userItems[section][category];
        }
      }
    } else {
      if (section === 'spells' && currentEditingItem?.adult) {
        if (userItems.adultSpells[category]) {
          userItems.adultSpells[category].splice(currentEditingIndex, 1);
          if (userItems.adultSpells[category].length === 0) {
            delete userItems.adultSpells[category];
          }
        }
      } else {
        if (userItems[section][category]) {
          userItems[section][category].splice(currentEditingIndex, 1);
          if (userItems[section][category].length === 0) {
            delete userItems[section][category];
          }
        }
      }
    }
    
    saveUserItems(userItems);
    debugLog('Saved user items after delete:', userItems);
    closeEditModal();
    showToast('Item deleted');
    render();
  }

  sectionSelect.addEventListener('change', () => { 
    buildCategories(); 
    const section = sectionSelect.value;
    // Hide/show toggles based on section
    if (section === 'actions') {
      favoritesOnly.parentElement.style.display = 'none';
    } else {
      favoritesOnly.parentElement.style.display = '';
    }
    // Ensure a category is selected after building categories
    setTimeout(() => {
      if (categorySelect.options.length > 0 && !categorySelect.value) {
        categorySelect.selectedIndex = 0;
      }
      render();
    }, RENDER_DELAY_MS);
  });
  categorySelect.addEventListener('change', render);
  if (favoritesOnly) favoritesOnly.addEventListener('change', render);
  
  // Dark mode toggle
  const darkModeToggle = $('#darkModeToggle');
  function applyDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem(darkModeKey, enabled ? 'true' : 'false');
  }
  
  // Load dark mode preference
  const savedDarkMode = localStorage.getItem(darkModeKey) === 'true';
  if (savedDarkMode) {
    darkModeToggle.checked = true;
    applyDarkMode(true);
  }
  
  darkModeToggle.addEventListener('change', (e) => {
    applyDarkMode(e.target.checked);
    localStorage.setItem(darkModeKey, e.target.checked ? 'true' : 'false');
    scheduleFileSave();
    // Re-render to update card backgrounds that use inline styles
    const section = sectionSelect.value;
    if (section === 'actions') {
      renderActions();
    } else if (section === 'criticalHits') {
      renderCriticalHits();
    } else if (section === 'criticalFailures') {
      renderCriticalFailures();
    } else if (section === 'skillChecks') {
      renderSkillChecks();
    } else {
      render();
    }
  });
  searchInput.addEventListener('input', render);
  clearBtn.addEventListener('click', () => { searchInput.value = ''; render(); });
  
  // Clear cache button - only show on web server
  const clearCacheBtn = $('#clearCacheBtn');
  if (clearCacheBtn && isOnServer) {
    clearCacheBtn.classList.remove('btn--cache');
    clearCacheBtn.addEventListener('click', () => {
      // Force a hard reload with cache-busting
      const url = new URL(window.location.href);
      url.searchParams.set('nocache', Date.now());
      // Also try to clear service worker cache if present
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        }).catch(() => {});
      }
      // Force reload
      window.location.href = url.toString();
    });
  }

  // Modal event listeners
  addEditBtn.addEventListener('click', () => {
    const section = sectionSelect.value;
    const category = categorySelect.value;
    if (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') {
      openEditModal(section, category, null, null);
    } else {
      openEditModal(section, category, { t: '', s: '', a: '' }, null);
    }
  });
  
  // Multiple ways to attach save button listener to ensure it works
  const saveBtnElement = document.getElementById('saveEditBtn');
  
  if (saveBtnElement) {
    console.log('Save button found, attaching listener');
    saveBtnElement.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('=== SAVE BUTTON CLICKED ===');
      console.log('Event:', e);
      console.log('Calling saveEditItem...');
      try {
        saveEditItem();
      } catch (err) {
        console.error('ERROR calling saveEditItem:', err);
        showToast('Error: ' + err.message);
      }
      return false;
    });
  } else {
    console.error('✗ saveEditBtn not found by getElementById!');
  }
  
  // Also use the $ selector version
  if (saveEditBtn) {
    console.log('saveEditBtn also found via $ selector');
    // Don't attach twice if it's the same element
    if (saveEditBtn !== saveBtnElement) {
      saveEditBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save button clicked (via $ selector)');
        saveEditItem();
        return false;
      });
    }
  } else {
    console.error('✗ saveEditBtn not found via $ selector either!');
  }
  
  // Use event delegation as ultimate fallback
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'saveEditBtn' || e.target.closest('#saveEditBtn'))) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Save button clicked (via document delegation)');
      saveEditItem();
      return false;
    }
  });
  
  // YouTube player modal event listeners
  if (youtubePlayerClose) {
    youtubePlayerClose.addEventListener('click', closeYouTubePlayer);
  }
  if (youtubePlayerCloseBtn) {
    youtubePlayerCloseBtn.addEventListener('click', closeYouTubePlayer);
  }
  if (youtubePlayerModal) {
    youtubePlayerModal.addEventListener('click', (e) => {
      if (e.target === youtubePlayerModal) {
        closeYouTubePlayer();
      }
    });
  }
  if (youtubeOpenTabBtn) {
    youtubeOpenTabBtn.addEventListener('click', () => {
      const watchUrl = youtubePlayerFrame?.dataset?.watchUrl;
      if (watchUrl) {
        const title = youtubePlayerTitle?.textContent || 'Karaoke Track';
        openYouTubeVideo(watchUrl, title);
        closeYouTubePlayer();
      }
    });
  }
  
  // Test YouTube playback button
  if (testYoutubeBtn) {
    testYoutubeBtn.addEventListener('click', () => {
      const youtubeInput = editYoutube.value.trim();
      const startTimeInput = editStartTime.value.trim();
      
      if (!youtubeInput) {
        showToast('Please enter a YouTube URL or video ID');
        return;
      }
      
      const videoId = parseYouTubeUrl(youtubeInput);
      if (!videoId) {
        showToast('Invalid YouTube URL format');
        return;
      }
      
      const startTime = startTimeInput ? parseTime(startTimeInput) : 0;
      const title = editSong.value.trim() || 'Karaoke Track';
      showYouTubePlayer(videoId, startTime || 0, title);
    });
  }
  
  // YouTube karaoke search button
  if (youtubeSearchBtn) {
    youtubeSearchBtn.addEventListener('click', () => {
      const suggestion = youtubeSuggestion;
      const searchUrl = suggestion?.dataset?.searchUrl;
      if (searchUrl) {
        window.open(searchUrl, '_blank');
        showToast('Opening YouTube search...');
      }
    });
  }
  
  cancelEditBtn.addEventListener('click', closeEditModal);
  deleteEditBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteEditItem();
    }
  });
  modalClose.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    // Only close if clicking directly on the modal background (not on content or buttons)
    // Don't interfere with clicks on buttons or inputs inside the modal
    if (e.target === editModal && !e.target.closest('.modal__content')) {
      console.log('Clicked on modal background, closing modal');
      closeEditModal();
    }
  });
  
  // Generator buttons row (use existing element from HTML)
  const generatorRow = document.querySelector('.toolbar__row--generators');

  // Generator modal functions
  function showGeneratorModal(title, text, generatorType = null) {
    generatorTitle.textContent = title;
    generatorText.textContent = text;
    generatorModal.classList.add('show');
    generatorModal.setAttribute('aria-hidden', 'false');
    
    // Store text and generator type for copy button
    generatorCopyBtn.dataset.textToCopy = text;
    generatorCopyBtn.dataset.generatorType = generatorType || '';
  }

  function closeGeneratorModal() {
    generatorModal.classList.remove('show');
    generatorModal.setAttribute('aria-hidden', 'true');
  }

  const battleCryBtn = document.createElement('button');
  battleCryBtn.id = 'battleCryBtn';
  battleCryBtn.className = 'btn';
  battleCryBtn.textContent = '⚔️ Battle Cry';
  battleCryBtn.addEventListener('click', () => {
    const mergedCries = getMergedGenerators('battleCries');
    if (mergedCries.length === 0) {
      showToast('No battle cries available');
      return;
    }
    const cry = mergedCries[Math.floor(Math.random() * mergedCries.length)];
    showGeneratorModal('⚔️ Battle Cry', cry, 'battleCries');
  });

  const insultBtn = document.createElement('button');
  insultBtn.id = 'insultBtn';
  insultBtn.className = 'btn';
  insultBtn.textContent = '🗡️ Insult';
  insultBtn.addEventListener('click', () => {
    const mergedInsults = getMergedGenerators('insults');
    if (mergedInsults.length === 0) {
      showToast('No insults available');
      return;
    }
    const insult = mergedInsults[Math.floor(Math.random() * mergedInsults.length)];
    showGeneratorModal('🗡️ Insult', insult, 'insults');
  });

  const complimentBtn = document.createElement('button');
  complimentBtn.id = 'complimentBtn';
  complimentBtn.className = 'btn';
  complimentBtn.textContent = '💬 Compliment';
  complimentBtn.addEventListener('click', () => {
    const mergedCompliments = getMergedGenerators('compliments');
    if (mergedCompliments.length === 0) {
      showToast('No compliments available');
      return;
    }
    const compliment = mergedCompliments[Math.floor(Math.random() * mergedCompliments.length)];
    showGeneratorModal('💬 Compliment', compliment, 'compliments');
  });

  // Generator modal event listeners
  generatorCopyBtn.addEventListener('click', () => {
    const text = generatorCopyBtn.dataset.textToCopy;
    const generatorType = generatorCopyBtn.dataset.generatorType;
    if (text) {
      // Track generators in history with section='generators' and category=generatorType
      if (generatorType) {
        copyToClipboard(text, 'generators', generatorType);
      } else {
        copyToClipboard(text);
      }
      showToast('Copied to clipboard!');
    }
  });

  generatorCloseBtn.addEventListener('click', closeGeneratorModal);
  generatorModalClose.addEventListener('click', closeGeneratorModal);
  generatorModal.addEventListener('click', (e) => {
    if (e.target === generatorModal) {
      closeGeneratorModal();
    }
  });

  // Export/Import functionality
  const exportBtn = document.createElement('button');
  exportBtn.id = 'exportBtn';
  exportBtn.className = 'btn';
  exportBtn.textContent = '📥 Export';
  exportBtn.addEventListener('click', () => {
      // Export COMPLETE dataset including all defaults and user customizations
      // Use getAllUserData() to ensure consistency and include all fields (including YouTube settings)
      const data = getAllUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blingus-bardbook-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!');
  });

  const importBtn = document.createElement('button');
  importBtn.id = 'importBtn';
  importBtn.className = 'btn';
  importBtn.textContent = '📤 Import';
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (confirm('This will overwrite your current data. Continue?')) {
            // Import all data types (backward compatible - only import if present)
            let importedCount = 0;
            const importedCategories = [];
            
            // Note: Default items (spells, bardic, etc.) are in the code and don't need importing
            // But we check for them in case someone wants to verify the export is complete
            
            if (data.favorites !== undefined) {
              localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
              importedCount++;
              importedCategories.push('favorites');
            }
            if (data.userItems !== undefined) {
              localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
              importedCount++;
              importedCategories.push('user items');
              debugLog('Imported userItems:', data.userItems);
              // Log YouTube settings specifically for debugging
              const youtubeItems = [];
              Object.keys(data.userItems).forEach(section => {
                if (data.userItems[section]) {
                  Object.keys(data.userItems[section]).forEach(category => {
                    if (Array.isArray(data.userItems[section][category])) {
                      data.userItems[section][category].forEach(item => {
                        if (item.youtube || item.startTime !== undefined) {
                          youtubeItems.push({ section, category, item });
                        }
                      });
                    }
                  });
                }
              });
              if (youtubeItems.length > 0) {
                console.log('Found YouTube settings in import:', youtubeItems.length, 'items with YouTube data');
                debugLog('YouTube items:', youtubeItems);
                importedCategories.push(`${youtubeItems.length} items with YouTube karaoke settings`);
              } else {
                console.log('No YouTube settings found in imported userItems');
              }
            }
            if (data.deletedDefaults !== undefined) {
              localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
              importedCount++;
              importedCategories.push('deleted defaults');
            }
            if (data.history !== undefined) {
              localStorage.setItem(historyKey, JSON.stringify(data.history));
              importedCount++;
              importedCategories.push('history');
            }
            if (data.generators !== undefined) {
              // Ensure generators structure is correct - normalize the data
              let generators = data.generators;
              
              // Handle different possible structures
              if (typeof generators === 'object' && generators !== null) {
                // If it's already the correct structure
                generators = {
                  battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
                  insults: Array.isArray(generators.insults) ? generators.insults : [],
                  compliments: Array.isArray(generators.compliments) ? generators.compliments : []
                };
              } else {
                // Fallback to empty structure
                generators = { battleCries: [], insults: [], compliments: [] };
              }
              
              localStorage.setItem(generatorsKey, JSON.stringify(generators));
              importedCount++;
              importedCategories.push('generators');
              debugLog('Imported generators:', generators);
            }
            if (data.editedGeneratorDefaults !== undefined) {
              localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
              importedCount++;
              importedCategories.push('edited generator defaults');
            }
            if (data.deletedGeneratorDefaults !== undefined) {
              localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
              importedCount++;
              importedCategories.push('deleted generator defaults');
            }
            if (data.darkMode !== undefined) {
              localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
              importedCount++;
              importedCategories.push('dark mode');
            }
            
            const message = importedCount > 0 
              ? `Imported ${importedCount} categories: ${importedCategories.join(', ')}. Reloading...`
              : 'No data found to import.';
            showToast(message);
            if (importedCount > 0) {
              setTimeout(() => location.reload(), AUTO_SAVE_DEBOUNCE_MS);
            }
          }
        } catch (error) {
          showToast('Import failed: Invalid file');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // History modal functions
  function showHistoryModal() {
    const history = loadHistory();
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      historyList.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">No recently used items yet. Copy some items to see them here!</div>';
    } else {
      const isDark = document.body.classList.contains('dark-mode');
      history.forEach(entry => {
        const historyItem = document.createElement('button');
        historyItem.style.textAlign = 'left';
        historyItem.style.padding = '12px';
        historyItem.style.border = '1px solid var(--burnt)';
        historyItem.style.borderRadius = '6px';
        historyItem.style.cursor = 'pointer';
        historyItem.style.background = isDark ? '#3d3d5e' : 'white';
        historyItem.style.color = 'var(--ink)';
        historyItem.style.fontSize = '14px';
        historyItem.style.width = '100%';
        historyItem.style.transition = 'background 0.2s ease';
        historyItem.textContent = entry.text;
        historyItem.title = `Section: ${entry.section || 'N/A'}, Category: ${entry.category || 'N/A'}`;
        historyItem.addEventListener('click', () => {
          copyToClipboard(entry.text, entry.section, entry.category);
          showToast('Copied to clipboard!');
        });
        historyItem.addEventListener('mouseenter', () => {
          historyItem.style.background = isDark ? '#4d4d6e' : '#f0f0f0';
        });
        historyItem.addEventListener('mouseleave', () => {
          historyItem.style.background = isDark ? '#3d3d5e' : 'white';
        });
        historyList.appendChild(historyItem);
      });
    }
    
    historyModal.classList.add('show');
    historyModal.setAttribute('aria-hidden', 'false');
  }

  function closeHistoryModal() {
    historyModal.classList.remove('show');
    historyModal.setAttribute('aria-hidden', 'true');
  }

  const historyBtn = document.createElement('button');
  historyBtn.id = 'historyBtn';
  historyBtn.className = 'btn';
  historyBtn.textContent = '📜 Recently Used';
  historyBtn.addEventListener('click', showHistoryModal);

  // File storage button - behavior depends on server vs local
  const fileStorageBtn = document.createElement('button');
  fileStorageBtn.id = 'fileStorageBtn';
  fileStorageBtn.className = 'btn';
  
  // Function to setup file storage button UI (called after PHP check)
  function setupFileStorageButton() {
    if (!fileStorageBtn) return; // Safety check
    
    if (phpApiAvailable || isOnServer) {
      // On server: show server storage status with PHP indicator
      fileStorageBtn.textContent = '💾 PHP Server Storage';
      fileStorageBtn.className = 'btn btn--server';
      fileStorageBtn.title = 'Data is automatically saved to server using PHP API';
      fileStorageBtn.disabled = false;
      fileStorageBtn.addEventListener('click', async () => {
        try {
          await saveDataToServer();
          showToast('✓ Data saved to server');
        } catch (error) {
          const errorMsg = error.message || 'Unknown error';
          console.error('Save failed:', errorMsg);
          showToast(`✗ Failed to save: ${errorMsg}`);
        }
      });
      
      // Add server storage status indicator to footer
      const footer = $('.footer');
      if (footer) {
        const storageStatus = document.createElement('div');
        storageStatus.id = 'storageStatus';
        storageStatus.style.cssText = 'margin-top: 8px; font-size: 12px; color: var(--burnt); opacity: 0.8; display: flex; align-items: center; justify-content: center; gap: 6px; text-align: center;';
        storageStatus.innerHTML = '<span style="color: #667eea;">🔷</span> <strong>Server Storage Active:</strong> Data saved to server via PHP API';
        footer.appendChild(storageStatus);
      }
    } else {
      // Local: use File System Access API
      fileStorageBtn.textContent = fileSystemSupported ? '📁 Select Data Folder' : '📁 File Storage (N/A)';
      fileStorageBtn.title = fileSystemSupported 
        ? 'Select a folder to store data files (will create a "data" subdirectory)' 
        : 'File System Access API not supported. Requires Chrome/Edge/Brave (Chromium) and HTTPS or localhost. Firefox/Safari not supported.';
      fileStorageBtn.disabled = !fileSystemSupported;
      if (!fileSystemSupported) {
        fileStorageBtn.addEventListener('click', () => {
          const browserInfo = navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                             navigator.userAgent.includes('Brave') ? 'Brave' :
                             navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Unknown';
          const protocol = window.location.protocol;
          
          let message = 'File System Access API not available. ';
          if (browserInfo === 'Firefox') {
            message += 'Firefox does not support this feature. Please use Chrome, Edge, or Brave.';
          } else if (protocol === 'http:' && !isLocalhost) {
            message += 'Requires HTTPS (or localhost). Your site is using HTTP.';
          } else {
            message += `Requires Chrome/Edge/Brave browser and HTTPS (or localhost). Detected: ${browserInfo}, Protocol: ${protocol}`;
          }
          showToast(message);
        });
      } else {
        fileStorageBtn.addEventListener('click', async () => {
          const success = await promptForDataDirectory();
          if (success) {
            // Save current data to file
            await saveDataToFile();
            showToast('✓ Data directory set and data saved');
          }
        });
      }
    }
  }
  
  // Set up button initially with default state (will be updated after PHP check)
  // Don't call setupFileStorageButton() here - wait for PHP check in initFileStorage()
  fileStorageBtn.textContent = fileSystemSupported ? '📁 Select Data Folder' : '📁 File Storage (N/A)';
  fileStorageBtn.disabled = !fileSystemSupported;

  generatorRow.appendChild(battleCryBtn);
  generatorRow.appendChild(insultBtn);
  generatorRow.appendChild(complimentBtn);
  generatorRow.appendChild(historyBtn);
  generatorRow.appendChild(fileStorageBtn);
  generatorRow.appendChild(exportBtn);
  generatorRow.appendChild(importBtn);
  // generatorRow is already in the HTML DOM, no need to append

  // History modal event listeners
  historyCloseBtn.addEventListener('click', closeHistoryModal);
  historyModalClose.addEventListener('click', closeHistoryModal);
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      closeHistoryModal();
    }
  });

  // Generator Management event listeners
  if (manageGeneratorsBtn) {
    manageGeneratorsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        showGeneratorManageModal();
      } catch (error) {
        console.error('Error in showGeneratorManageModal:', error);
      }
    });
  } else {
    const btn = document.getElementById('manageGeneratorsBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          showGeneratorManageModal();
        } catch (error) {
          console.error('Error in showGeneratorManageModal:', error);
        }
      });
    }
  }
  if (generatorManageCloseBtn) {
    generatorManageCloseBtn.addEventListener('click', closeGeneratorManageModal);
  }
  if (generatorManageClose) {
    generatorManageClose.addEventListener('click', closeGeneratorManageModal);
  }
  if (generatorManageModal) {
    generatorManageModal.addEventListener('click', (e) => {
      if (e.target === generatorManageModal) {
        closeGeneratorManageModal();
      }
    });
  }
  if (generatorTypeSelect) {
    generatorTypeSelect.addEventListener('change', refreshGeneratorsList);
  }
  if (addGeneratorBtn) {
    addGeneratorBtn.addEventListener('click', openGeneratorEditModal);
  }
  if (saveGeneratorBtn) {
    saveGeneratorBtn.addEventListener('click', saveGeneratorItem);
  }
  if (cancelGeneratorBtn) {
    cancelGeneratorBtn.addEventListener('click', closeGeneratorEditModal);
  }
  if (deleteGeneratorBtn) {
    deleteGeneratorBtn.addEventListener('click', deleteGeneratorItem);
  }
  if (generatorEditClose) {
    generatorEditClose.addEventListener('click', closeGeneratorEditModal);
  }
  if (generatorEditModal) {
    generatorEditModal.addEventListener('click', (e) => {
      if (e.target === generatorEditModal) {
        closeGeneratorEditModal();
      }
    });
  }

  // Keyboard navigation
  let selectedCardIndex = -1;
  document.addEventListener('keydown', (e) => {
    // Handle Escape key for modals
    if (e.key === 'Escape') {
      if (editModal.classList.contains('show')) {
        closeEditModal();
        return;
      }
      if (generatorModal.classList.contains('show')) {
        closeGeneratorModal();
        return;
      }
      if (historyModal.classList.contains('show')) {
        closeHistoryModal();
        return;
      }
      if (generatorManageModal && generatorManageModal.classList.contains('show')) {
        closeGeneratorManageModal();
        return;
      }
      if (generatorEditModal && generatorEditModal.classList.contains('show')) {
        closeGeneratorEditModal();
        return;
      }
    }
    
    // Don't interfere with modal or input fields
    if ((editModal && editModal.classList.contains('show')) || 
        (generatorManageModal && generatorManageModal.classList.contains('show')) ||
        (generatorEditModal && generatorEditModal.classList.contains('show')) ||
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'SELECT') {
      return;
    }

    const cards = Array.from(content.querySelectorAll('.card:not(.random-card):not(.history-card)'));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedCardIndex = Math.min(selectedCardIndex + 1, cards.length - 1);
      if (cards[selectedCardIndex]) {
        cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[selectedCardIndex].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedCardIndex = Math.max(selectedCardIndex - 1, 0);
      if (cards[selectedCardIndex]) {
        cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[selectedCardIndex].focus();
      }
    } else if (e.key === 'Enter' && selectedCardIndex >= 0 && cards[selectedCardIndex]) {
      e.preventDefault();
      cards[selectedCardIndex].click();
    }
  });

  // Initialize on page load
  debugLog('Initializing...');
  
  // Initialize file storage and load data
  (async function initializeFileStorage() {
    const initialized = await initFileStorage();
    if (initialized) {
      // Data was loaded from server into localStorage, now reload all JavaScript variables
      debugLog('Server data loaded, reloading JavaScript variables from localStorage...');
      userItems = loadUserItems();
      deletedDefaults = loadDeletedDefaults();
      favorites = loadFavorites();
      
      // Trigger a re-render to show loaded data
      setTimeout(() => {
        const section = sectionSelect.value;
        if (section === 'actions') {
          renderActions();
        } else if (section === 'criticalHits') {
          renderCriticalHits();
        } else if (section === 'criticalFailures') {
          renderCriticalFailures();
        } else {
          render();
        }
      }, 100);
    } else {
      // Not using server storage, try local file system
      try {
        const loaded = await loadDataFromFile();
        if (loaded) {
          // Reload favorites and other data from localStorage (which was updated by loadDataFromFile)
          userItems = loadUserItems();
          deletedDefaults = loadDeletedDefaults();
          favorites = loadFavorites();
          // Trigger a re-render to show loaded data
          setTimeout(() => {
            const section = sectionSelect.value;
            if (section === 'actions') {
              renderActions();
            } else if (section === 'criticalHits') {
              renderCriticalHits();
            } else if (section === 'criticalFailures') {
              renderCriticalFailures();
            } else {
              render();
            }
          }, 100);
        }
      } catch (error) {
        debugLog('Local file system load failed:', error);
      }
    }
  })();
  
  // Ensure section select has a value
  if (!sectionSelect.value && sectionSelect.options.length > 0) {
    sectionSelect.selectedIndex = 0;
    debugLog(`Initial section selected: ${sectionSelect.value}`);
  }
  
  try {
    buildCategories();
  } catch (error) {
    console.error('Error in buildCategories during init:', error);
  }
  
  // Ensure a category is selected
  if (categorySelect.options.length > 0 && !categorySelect.value) {
    categorySelect.selectedIndex = 0;
    debugLog(`Initial category selected: ${categorySelect.value}`);
  }
  debugLog('Initial render...');
  try {
    render();
  } catch (error) {
    console.error('Error in render during init:', error);
    content.innerHTML = '<div class="card">Error loading content. Please refresh the page.</div>';
  }
  
  debugLog('Initialization complete');
})();
