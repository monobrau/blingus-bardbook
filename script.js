(function(){
  const spells = {
    'Druidcraft': [
      {t:"Here comes the sprout, doo-doo-doo-doo—little leaf, it's all right; bask in the glow, grow in the light.", s:"Here Comes the Sun", a:"The Beatles"},
      {t:"I bless the rains in this room—tiny monsoon on cue; bloom crew coming through.", s:"Africa", a:"Toto"},
      {t:"I'm walking on sunshine—so are my seedlings; don't it feel good when nature starts healing.", s:"Walking on Sunshine", a:"Katrina and the Waves"},
      {t:"Country roads, take these spores—to the place they belong; roots hum along to the travelin' song.", s:"Take Me Home, Country Roads", a:"John Denver"},
      {t:"Good vibrations—pollinations; bees RSVP and hype the stations.", s:"Good Vibrations", a:"The Beach Boys"},
      {t:"What a wonderful world—buds unfurled; happy little leaves wave hello to the world.", s:"What a Wonderful World", a:"Louis Armstrong"},
      {t:"Sweet dreams are made of this—sun, rain, and photosynth bliss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"}
    ],
    'Prestidigitation': [
      {t:"No diggity, no doubt—this mess just checked out; sparkle flex, room says 'wow'.", s:"No Diggity", a:"Blackstreet"},
      {t:"Ice, ice, baby—chill that drink; frost on the rim with a wink.", s:"Ice Ice Baby", a:"Vanilla Ice"},
      {t:"Another one bites the dust—crumbs be gone; shine is on, in glam we trust.", s:"Another One Bites the Dust", a:"Queen"},
      {t:"Pour some sugar on me—just a dash; flavor unlock, chef's kiss splash.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
      {t:"Beat it—grime, beat it; make it clean, you can't conceive it.", s:"Beat It", a:"Michael Jackson"},
      {t:"Smooth operator—polish and preen; leaving the scene like a glossy magazine.", s:"Smooth Operator", a:"Sade"},
      {t:"Don't stop me now—I'm having such a clean time; tidy so prime, cleaning's sublime.", s:"Don't Stop Me Now", a:"Queen"},
      {t:"Brass monkey—that funky monkey; chill the drink, clink the clink, get funky.", s:"Brass Monkey", a:"Beastie Boys"}
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
      {t:"Elminster called—he wants his apprentice back; something about 'basic competence.'", s:"Forgotten Realms Lore", a:"Mockery"}
    ],
    'Bane': [
      {t:"Under pressure—tiny numbers squeal; welcome to -1, that's the deal.", s:"Under Pressure", a:"Queen & David Bowie"},
      {t:"With or without you—without's the move; your bonuses packed to groove.", s:"With or Without You", a:"U2"},
      {t:"Paint it black—your odds, your mood; weekend plans? Also screwed.", s:"Paint It Black", a:"The Rolling Stones"},
      {t:"Livin' on a prayer—whiffin' on a prayer; fate says 'no', beware.", s:"Livin' on a Prayer", a:"Bon Jovi"},
      {t:"Bad moon rising—bad rolls rising; stay indoors, luck's downsizing.", s:"Bad Moon Rising", a:"Creedence Clearwater Revival"},
      {t:"Nothing else matters—except these debuffs; sad trombone plus cuffs.", s:"Nothing Else Matters", a:"Metallica"},
      {t:"Behind blue eyes, the penalty lies—no one knows what it's like to roll with these dice.", s:"Behind Blue Eyes", a:"The Who"},
      {t:"Even Kelemvor's scales tip against you—and he's impartial.", s:"Forgotten Realms Lore", a:"Mockery"}
    ],
    'Command': [
      {t:"Stop! In the name of love—then turn around; walk away, leave this battleground.", s:"Stop! In the Name of Love", a:"The Supremes"},
      {t:"Go your own way—specifically away; heel-toe shuffle, obey.", s:"Go Your Own Way", a:"Fleetwood Mac"},
      {t:"Hit the road, Jack—and don't you come back; hit the track, don't look back.", s:"Hit the Road Jack", a:"Ray Charles"},
      {t:"Walk this way—away; this path ain't your runway.", s:"Walk This Way", a:"Aerosmith"},
      {t:"Jump—might as well jump… into prone; gravity's calling on the stone.", s:"Jump", a:"Van Halen"},
      {t:"The Harpers would be proud—if they weren't busy ignoring you.", s:"Forgotten Realms Lore", a:"Mockery"}
    ],
    'Faerie Fire': [
      {t:"I can see clearly now—the glow is on; stealth clocked out, stealth is gone.", s:"I Can See Clearly Now", a:"Johnny Nash"},
      {t:"Every breath you take—we'll be watching you—because you're lit up too.", s:"Every Breath You Take", a:"The Police"},
      {t:"Mr. Brightside—now you're outlined; tutorial highlight, perfectly timed.", s:"Mr. Brightside", a:"The Killers"},
      {t:"Purple haze all around—the sneak is found; neon truth on battleground.", s:"Purple Haze", a:"Jimi Hendrix"},
      {t:"Sweet dreams are made of beams—outline schemes; target gleams.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
      {t:"Black hole sun—won't you come, darkness covers all; stealth undone, run.", s:"Black Hole Sun", a:"Soundgarden"},
      {t:"Who wants honey—as long as there's some money; float on up, magic's funny.", s:"Cherub Rock", a:"Smashing Pumpkins"},
      {t:"Even Drizzt couldn't hide from this—and he's pretty good at hiding.", s:"Forgotten Realms Lore", a:"Mockery"}
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
      {t:"Even Ilmater approves—and he's seen worse.", s:"Forgotten Realms Lore", a:"Mockery"}
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
      {t:"I love rock and roll—put another coin in, baby; swing and strike, hit the groove, maybe.", s:"I Love Rock 'n' Roll", a:"Joan Jett"}
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
      {t:"Tubthumping—I get knocked down, then get up again; save that pain, win.", s:"Tubthumping", a:"Chumbawamba"}
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
      {t:"Smooth operator—silver tongue, criminal charm; no alarm.", s:"Smooth Operator", a:"Sade"}
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
      {t:"Sneak like Drizzt in Menzoberranzan—but actually succeed.", s:"Forgotten Realms Lore", a:"Mockery"}
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
      {t:"You're less threatening than a rust monster—and those things are terrifying! (Don't touch my buckles!)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Brawn O’Neil — Dwarven Monk": [
      {t:"Brawn warms up with problems tougher than you; he calls them pebbles.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"His fists have names—‘Reason’ and ‘Consequences’—meet both.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re about to learn what ‘stunning strike’ feels like: educational.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He drinks, he thinks, he swings—only one of those hurts you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Dwarven stone’s got more give than your jaw.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You telegraph so hard even Brawn’s beard dodged.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Step of the Wind? You’ll step off your pride.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Flurry of Blunders—performed by you, judged by Brawn.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Puck Pinewhistle — Fairy Sorcerer": [
      {t:"Puck’s sparkles hit harder than your best ideas.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He bends the weave; you trip over it.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your charisma check just failed against his wingspan.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"He twinspells shade; congratulations, you got the deluxe edition.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even his cantrips have better timing than your life choices.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Wild about his magic, mild about you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Metamagic? He enhances. You… enhance regret.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Puck sneezes glitter; you choke on defeat.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    "Vadania Amakiir — Elven Ranger": [
      {t:"Vadania tracks problems to their source; hello, source.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your stealth is a love letter to her arrows.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even her footprints leave less trace than your excuses.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Her bowstring fears commitment; it only ties to your fate.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Favored enemy: incompetence—and you’re endangered.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"The forest files a noise complaint when you move.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re the kind of quarry that tags itself.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"She aims where you’re going; you never get there.", s:"Blingus' Battle Burns", a:"Mockery"}
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
      {t:"At least you're not a rust monster. (Those things are nightmares! Absolute nightmares!)", s:"Blingus' Battle Burns", a:"Mockery"}
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
      {t:"The Tarrasque could step on you and not notice. (I'm just saying. Hypothetically.)", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Nobles': [
      {t:"That title is doing all the heavy lifting.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pedigree reads like a cautionary tale.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"I’ve seen coin purses with more backbone.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You command like a suggestion no one heard.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your banner should read: ‘We Tried.’", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your servants deserve better management.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Liches': [
      {t:"Congratulations on immortality; shame about the personality.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your phylactery hides because it’s embarrassed to be seen with you.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re proof necromancy can’t revive taste.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"All that time and you still failed your fashion save.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You’re a skeleton with tenure and no lectures worth hearing.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your lair has better vibes six feet under.", s:"Blingus' Battle Burns", a:"Mockery"}
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
      {t:"Mielikki's groves reject you—and she's pretty welcoming.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"You'd get lost in the High Forest—and it's not that big.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even Chult's dinosaurs have better survival instincts.", s:"Blingus' Battle Burns", a:"Mockery"}
    ],
    'Warlock & Weird': [
      {t:"Your patron’s refund is pending.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Pact of the Blade? More like Pact of the Butter Knife.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your eldritch blast has separation anxiety.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your book of shadows is a coloring book.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your hex needs a pep talk.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your pact boon is ‘unsubscribe.’", s:"Blingus' Battle Burns", a:"Mockery"}
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
      {t:"Your performance check rolled a 'please stop.'", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Even your cutting words cut themselves.", s:"Blingus' Battle Burns", a:"Mockery"},
      {t:"Your College of Whispers is more like College of 'Why Bother.'", s:"Blingus' Battle Burns", a:"Mockery"}
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
      'Trying to charm your way into a private conversation'
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
      'Using your Investigation to look for hidden compartments'
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
    ]
  };

  const $ = sel => document.querySelector(sel);
  const content = $('#content');
  
  
  // Debug helper function - can be called from console
  window.debugGenerators = function() {
    console.log('=== Generator Debug Info ===');
    const userGens = loadUserGenerators();
    const deleted = loadDeletedGeneratorDefaults();
    const edited = loadEditedDefaults();
    console.log('User generators:', userGens);
    console.log('Deleted defaults:', deleted);
    console.log('Edited defaults:', edited);
    console.log('Merged battle cries:', getMergedGenerators('battleCries'));
    console.log('Merged insults:', getMergedGenerators('insults'));
    console.log('Merged compliments:', getMergedGenerators('compliments'));
    console.log('Raw localStorage:', {
      generators: localStorage.getItem(generatorsKey),
      deletedDefaults: localStorage.getItem(deletedGeneratorDefaultsKey),
      editedDefaults: localStorage.getItem(editedDefaultsKey)
    });
    return { userGens, deleted, edited };
  };
  
  // Clear all Blingus data - can be called from console
  window.clearBlingusData = function() {
    if (confirm('Clear ALL Blingus data? This will delete favorites, custom items, presets, history, generators, and all customizations. This cannot be undone!')) {
      const keys = [
        favoritesKey,
        userItemsKey,
        deletedDefaultsKey,
        historyKey,
        voicePresetsKey,
        generatorsKey,
        editedDefaultsKey,
        deletedGeneratorDefaultsKey,
        darkModeKey
      ];
      keys.forEach(key => localStorage.removeItem(key));
      console.log('✓ Cleared all Blingus data');
      showToast('All data cleared. Reloading...');
      setTimeout(() => location.reload(), 1000);
    }
  };
  
  const sectionSelect = $('#sectionSelect');
  const categorySelect = $('#categorySelect');
  const adultToggle = $('#adultToggle');
  const favoritesOnly = document.querySelector('#favoritesOnly');
  const searchInput = $('#searchInput');
  const clearBtn = $('#clearBtn');
  const toast = $('#toast');
  const addEditBtn = $('#addEditBtn');
  const editModal = $('#editModal');
  const editText = $('#editText');
  const editSong = $('#editSong');
  const editArtist = $('#editArtist');
  const editAdult = $('#editAdult');
  const saveEditBtn = $('#saveEditBtn');
  const cancelEditBtn = $('#cancelEditBtn');
  const deleteEditBtn = $('#deleteEditBtn');
  const modalTitle = $('#modalTitle');
  const songLabel = $('#songLabel');
  const artistLabel = $('#artistLabel');
  const adultLabel = $('#adultLabel');
  const modalClose = editModal.querySelector('.modal__close');
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
  const presetSelect = $('#presetSelect');
  const managePresetsBtn = $('#managePresetsBtn');
  const manageGeneratorsBtn = $('#manageGeneratorsBtn');
  const presetModal = $('#presetModal');
  const presetModalTitle = $('#presetModalTitle');
  const presetModalClose = $('#presetModalClose');
  const presetCloseBtn = $('#presetCloseBtn');
  const saveCurrentPresetBtn = $('#saveCurrentPresetBtn');
  const presetsList = $('#presetsList');
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

  const favoritesKey = 'blingusFavoritesV1';
  const userItemsKey = 'blingusUserItemsV1';
  const deletedDefaultsKey = 'blingusDeletedDefaultsV1';
  const historyKey = 'blingusHistoryV1';
  const voicePresetsKey = 'blingusVoicePresetsV1';
  const darkModeKey = 'blingusDarkModeV1';
  const generatorsKey = 'blingusGeneratorsV1';
  const editedDefaultsKey = 'blingusEditedDefaultsV1';
  const deletedGeneratorDefaultsKey = 'blingusDeletedGeneratorDefaultsV1';
  
  // File-based storage - auto-detect server vs local
  let dataDirectoryHandle = null;
  const DATA_FILENAME = 'blingus-data.json';
  const DATA_DIR_NAME = 'data';
  const API_ENDPOINT = '/api/blingus-data.php';
  
  // Detect if running on a web server (not localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.protocol === 'file:';
  const isOnServer = !isLocalhost && (window.location.protocol === 'http:' || window.location.protocol === 'https:');
  
  // Check if File System Access API is supported (for local use)
  const fileSystemSupported = 'showDirectoryPicker' in window;
  
  console.log('Storage mode detection:', {
    isLocalhost,
    isOnServer,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    fileSystemSupported
  });
  
  // Initialize file storage - try to load saved directory handle
  async function initFileStorage() {
    if (!fileSystemSupported) {
      return false;
    }
    
    try {
      // Try to get saved directory handle from IndexedDB
      const savedHandle = await getSavedDirectoryHandle();
      if (savedHandle) {
        dataDirectoryHandle = savedHandle;
        return true;
      }
      
      return false;
    } catch (error) {
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
      favorites: JSON.parse(localStorage.getItem(favoritesKey) || '[]'),
      userItems: JSON.parse(localStorage.getItem(userItemsKey) || '{}'),
      deletedDefaults: JSON.parse(localStorage.getItem(deletedDefaultsKey) || '{}'),
      history: JSON.parse(localStorage.getItem(historyKey) || '[]'),
      voicePresets: JSON.parse(localStorage.getItem(voicePresetsKey) || '[]'),
      generators: JSON.parse(localStorage.getItem(generatorsKey) || '{"battleCries":[],"insults":[],"compliments":[]}'),
      editedGeneratorDefaults: JSON.parse(localStorage.getItem(editedDefaultsKey) || '{"battleCries":{},"insults":{},"compliments":{}}'),
      deletedGeneratorDefaults: JSON.parse(localStorage.getItem(deletedGeneratorDefaultsKey) || '{"battleCries":[],"insults":[],"compliments":[]}'),
      darkMode: localStorage.getItem(darkModeKey) === 'true',
      version: '1.3',
      timestamp: new Date().toISOString()
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
  
  // Debounced auto-save to file
  let fileSaveTimeout = null;
  function scheduleFileSave() {
    if (!dataDirectoryHandle) return;
    
    if (fileSaveTimeout) clearTimeout(fileSaveTimeout);
    fileSaveTimeout = setTimeout(() => {
      saveDataToFile();
    }, 1000); // Wait 1 second after last change
  }
  
  // Load user items from localStorage
  function loadUserItems() {
    try {
      const raw = localStorage.getItem(userItemsKey);
      return raw ? JSON.parse(raw) : { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
    } catch(e) {
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
    }
  }
  
  // Load deleted defaults from localStorage
  function loadDeletedDefaults() {
    try {
      const raw = localStorage.getItem(deletedDefaultsKey);
      if (!raw) {
        return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
      }
      const parsed = JSON.parse(raw);
      // Ensure structure is correct
      return {
        spells: parsed.spells || {},
        adultSpells: parsed.adultSpells || {},
        bardic: parsed.bardic || {},
        mockery: parsed.mockery || {},
        actions: parsed.actions || {}
      };
    } catch(e) {
      console.error('Error loading deleted defaults:', e);
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
    }
  }
  
  // Save user items to localStorage
  function saveUserItems(userItems) {
    try {
      localStorage.setItem(userItemsKey, JSON.stringify(userItems));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save user items:', e);
    }
  }
  
  // Save deleted defaults to localStorage
  function saveDeletedDefaults(deletedDefaults) {
    try {
      localStorage.setItem(deletedDefaultsKey, JSON.stringify(deletedDefaults));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save deleted defaults:', e);
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
      console.log('loadDeletedGeneratorDefaults:', result);
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
    
    console.log('getMergedGenerators for', type);
    console.log('Deleted defaults:', deletedDefaults[type]);
    console.log('User added:', userAdded[type]);
    
    // Get default items, applying edits and filtering deletions
    const defaultItems = (defaults[type] || []).map((item, index) => {
      const itemId = `${type}_${index}`;
      // Check if deleted
      if ((deletedDefaults[type] || []).includes(itemId)) {
        console.log('Filtering out deleted item:', itemId, item);
        return null;
      }
      // Check if edited
      if (editedDefaults[type] && editedDefaults[type][itemId]) {
        return editedDefaults[type][itemId];
      }
      return item;
    }).filter(item => item !== null);
    
    // Ensure userAdded[type] is an array
    const userItems = Array.isArray(userAdded[type]) ? userAdded[type] : [];
    
    const merged = [...defaultItems, ...userItems];
    console.log('Merged list length:', merged.length, 'Default items:', defaultItems.length, 'User added:', userItems.length);
    console.log('User added items:', userItems);
    return merged;
  }
  
  // Generate unique ID for an item
  function getItemId(section, item) {
    if (section === 'actions') {
      return typeof item === 'string' ? item : '';
    }
    return `${item.t}|${item.s}|${item.a}|${item.adult ? '1' : '0'}`;
  }
  
  let userItems = loadUserItems();
  let deletedDefaults = loadDeletedDefaults();
  
  // Debug: Log user items on load
  console.log('Loaded user items:', userItems);
  console.log('Loaded deleted defaults:', deletedDefaults);
  
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
  
  if (totalDeleted > 1000) {
    console.warn(`Found excessive deleted defaults (${totalDeleted} entries). Resetting.`);
    needsReset = true;
  }
  
  if (needsReset) {
    console.warn('Resetting corrupted deletedDefaults');
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
    saveDeletedDefaults(deletedDefaults);
  }
  
  // Expose reset function to console for manual fixes
  window.resetDeletedDefaults = function() {
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {} };
    saveDeletedDefaults(deletedDefaults);
    console.log('Deleted defaults reset. Reloading page...');
    location.reload();
  };
  
  console.log('To reset deleted defaults manually, run: resetDeletedDefaults()');
  
  // Merge user items with default items, filtering out deleted defaults
  function getMergedData(section, category) {
    const defaults = section === 'spells' ? spells
      : section === 'bardic' ? bardic
      : section === 'actions' ? characterActions
      : mockery;
    
    const defaultList = (defaults[category] || []);
    const deletedIds = deletedDefaults[section]?.[category] || [];
    
    // Debug logging
    if (defaultList.length > 0) {
      console.log(`getMergedData: ${section}/${category} - Defaults: ${defaultList.length}, Deleted IDs: ${deletedIds.length}`);
      if (deletedIds.length > 0) {
        console.log(`Deleted IDs for ${section}/${category}:`, deletedIds);
      }
    }
    
    const filteredList = defaultList.filter(item => {
      const itemId = getItemId(section, item);
      const isDeleted = deletedIds.includes(itemId);
      if (isDeleted) {
        console.log(`Filtering out deleted item: ${itemId}`);
      }
      return !isDeleted;
    });
    
    // Safety check: if all items are filtered out but we have defaults, something is wrong
    if (filteredList.length === 0 && defaultList.length > 0) {
      if (deletedIds.length > 0) {
        console.warn(`Warning: All ${defaultList.length} items filtered out for ${section}/${category} with ${deletedIds.length} deleted IDs. Clearing deleted IDs for this category.`);
        // Clear the deleted IDs for this category to prevent data corruption
        if (deletedDefaults[section] && deletedDefaults[section][category]) {
          delete deletedDefaults[section][category];
          saveDeletedDefaults(deletedDefaults);
        }
      }
      // Return the full default list since we cleared the deletions or there were none
      const userList = userItems[section]?.[category] || [];
      console.log(`Returning full list after clearing deletions: ${defaultList.length} defaults + ${userList.length} user items`);
      return section === 'actions' ? [...defaultList, ...userList] : [...defaultList, ...userList];
    }
    
    const userList = userItems[section]?.[category] || [];
    const result = section === 'actions' ? [...filteredList, ...userList] : [...filteredList, ...userList];
    console.log(`getMergedData result: ${section}/${category} - Returning ${result.length} items (${filteredList.length} filtered defaults + ${userList.length} user)`);
    return result;
  }
  
  // Get adult spells merged, filtering out deleted defaults
  function getMergedAdultSpells(category) {
    const defaultList = (adultSpells[category] || []).filter(item => {
      const itemId = getItemId('spells', item);
      const deletedIds = deletedDefaults.adultSpells?.[category] || [];
      return !deletedIds.includes(itemId);
    });
    
    const userList = userItems.adultSpells?.[category] || [];
    return [...defaultList, ...userList];
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
      if (section === 'spells') {
        cats = typeof spells !== 'undefined' && spells ? Object.keys(spells) : [];
      } else if (section === 'bardic') {
        cats = typeof bardic !== 'undefined' && bardic ? Object.keys(bardic) : [];
      } else if (section === 'actions') {
        cats = typeof characterActions !== 'undefined' && characterActions ? Object.keys(characterActions) : [];
      } else {
        cats = typeof mockery !== 'undefined' && mockery ? Object.keys(mockery) : [];
      }
    } catch (error) {
      console.error('Error building categories:', error);
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
    
    console.log(`getActiveList: section=${section}, category=${cat}`);
    
    if (!cat) {
      console.warn('getActiveList: No category selected!');
      return [];
    }
    
    if (section === 'spells') {
      const base = getMergedData('spells', cat);
      const add = adultToggle.checked ? getMergedAdultSpells(cat) : [];
      const result = [...base, ...add];
      console.log(`getActiveList spells: base=${base.length}, add=${add.length}, result=${result.length}`);
      return result;
    } else if (section === 'bardic') {
      const result = getMergedData('bardic', cat);
      console.log(`getActiveList bardic: result=${result.length}`);
      return result;
    } else if (section === 'actions') {
      const result = getMergedData('actions', cat);
      console.log(`getActiveList actions: result=${result.length}`);
      return result;
    } else {
      const result = getMergedData('mockery', cat);
      console.log(`getActiveList mockery: result=${result.length}`);
      return result;
    }
  }

  function render() {
    const section = sectionSelect.value;
    
    console.log(`render() called for section: ${section}`);
    
    // Special rendering for character actions
    if (section === 'actions') {
      renderActions();
      return;
    }

    const q = (searchInput.value || '').trim().toLowerCase();
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
          setTimeout(() => render(), 100);
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
      const adultList = adultToggle.checked ? (adultSpells[cat] || []).filter(item => {
        const itemId = getItemId('spells', item);
        const deletedIds = deletedDefaults.adultSpells?.[cat] || [];
        return !deletedIds.includes(itemId);
      }) : [];
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
    if (section === 'spells' && adultToggle.checked) {
      const userAdultList = userItems.adultSpells?.[cat] || [];
      baseList = [...baseList, ...userList, ...userAdultList];
    } else {
      baseList = [...baseList, ...userList];
    }
    
    console.log(`render: baseList length=${baseList.length} for ${section}/${cat}`);
    
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
    
    console.log(`render: after search filter, list length=${list.length}`);
    
    if (favoritesOnly && favoritesOnly.checked) {
      list = list.filter(isFav);
      console.log(`render: after favorites filter, list length=${list.length}`);
    }
    
    console.log(`render: final list length=${list.length} for ${section}`);
    
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
          }, 5000);
          
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
        const adultCount = adultToggle.checked ? (adultSpells[cat] || []).filter(item => {
          const itemId = getItemId('spells', item);
          return !(deletedDefaults.adultSpells?.[cat] || []).includes(itemId);
        }).length : 0;
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
        if (section === 'spells' && adultToggle.checked && item.adult) {
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
    let actions = characterActions[cat] || [];
    let filteredActions = actions;
    
    if (q) {
      filteredActions = actions.filter(a => a.toLowerCase().includes(q));
    }
    
    content.innerHTML = '';
    
    // Add random button at the top (uses full list, not filtered)
    if (actions.length > 0) {
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
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
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
          }, 5000);
          
          showToast(`Random: ${randomAction}`);
        } else if (!isInFiltered) {
          // Selected action is filtered out - show a longer toast message
          showToast(`Random: ${randomAction} (not in current filter)`);
        } else {
          showToast(`Random: ${randomAction}`);
        }
        copyToClipboard(randomAction);
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
    const fullActions = getMergedData('actions', cat);
    const defaults = characterActions[cat] || [];
    const filteredDefaultCount = fullActions.length - (userItems.actions[cat] || []).length;
    
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
        copyToClipboard(action);
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
        copyToClipboard(action);
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
    }

    if (!filteredActions.length) {
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
      const trimmed = history.slice(0, 10); // Keep only last 10
      localStorage.setItem(historyKey, JSON.stringify(trimmed));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save history:', e);
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

  // Voice Preset functions
  function loadPresets() {
    try {
      const raw = localStorage.getItem(voicePresetsKey);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      console.error('Error loading presets:', e);
      return [];
    }
  }

  function savePresets(presets) {
    try {
      localStorage.setItem(voicePresetsKey, JSON.stringify(presets));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save presets:', e);
      showToast('Failed to save preset');
    }
  }

  function getCurrentState() {
    return {
      section: sectionSelect.value,
      category: categorySelect.value,
      adultToggle: adultToggle.checked,
      favoritesOnly: favoritesOnly ? favoritesOnly.checked : false,
      search: searchInput.value.trim(),
      name: '', // Will be set by user
      timestamp: Date.now()
    };
  }

  function applyPreset(preset) {
    if (preset.section) {
      sectionSelect.value = preset.section;
      buildCategories();
    }
    if (preset.category && categorySelect.options.length > 0) {
      // Wait a moment for categories to build
      setTimeout(() => {
        categorySelect.value = preset.category;
        if (preset.adultToggle !== undefined) adultToggle.checked = preset.adultToggle;
        if (preset.favoritesOnly !== undefined && favoritesOnly) {
          favoritesOnly.checked = preset.favoritesOnly;
        }
        if (preset.search !== undefined) searchInput.value = preset.search;
        render();
      }, 50);
    } else {
      if (preset.adultToggle !== undefined) adultToggle.checked = preset.adultToggle;
      if (preset.favoritesOnly !== undefined && favoritesOnly) {
        favoritesOnly.checked = preset.favoritesOnly;
      }
      if (preset.search !== undefined) searchInput.value = preset.search;
      render();
    }
    showToast(`Applied preset: ${preset.name}`);
  }

  function saveCurrentStateAsPreset() {
    const name = prompt('Enter a name for this preset:');
    if (!name || !name.trim()) return;

    const currentState = getCurrentState();
    currentState.name = name.trim();

    const presets = loadPresets();
    // Check if name already exists
    const existingIndex = presets.findIndex(p => p.name === currentState.name);
    if (existingIndex >= 0) {
      if (!confirm(`A preset named "${currentState.name}" already exists. Overwrite it?`)) {
        return;
      }
      presets[existingIndex] = currentState;
    } else {
      presets.push(currentState);
    }

    savePresets(presets);
    updatePresetSelect();
    showToast(`Preset "${currentState.name}" saved!`);
    refreshPresetsList();
  }

  function updatePresetSelect() {
    const presets = loadPresets();
    presetSelect.innerHTML = '<option value="">-- Select Preset --</option>';
    
    presets.forEach((preset, index) => {
      const opt = document.createElement('option');
      opt.value = index.toString();
      opt.textContent = preset.name;
      presetSelect.appendChild(opt);
    });
  }

  function refreshPresetsList() {
    const presets = loadPresets();
    presetsList.innerHTML = '';

    if (presets.length === 0) {
      presetsList.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">No presets saved yet. Save your current state to create one!</div>';
      return;
    }

    const isDark = document.body.classList.contains('dark-mode');
    presets.forEach((preset, index) => {
      const presetCard = document.createElement('div');
      presetCard.style.display = 'flex';
      presetCard.style.justifyContent = 'space-between';
      presetCard.style.alignItems = 'center';
      presetCard.style.padding = '12px';
      presetCard.style.border = '1px solid var(--burnt)';
      presetCard.style.borderRadius = '6px';
      presetCard.style.background = isDark ? '#2d2d44' : 'white';
      presetCard.style.gap = '8px';

      const presetInfo = document.createElement('div');
      presetInfo.style.flex = '1';
      const nameDiv = document.createElement('div');
      nameDiv.style.fontWeight = 'bold';
      nameDiv.style.marginBottom = '4px';
      nameDiv.textContent = preset.name;
      const detailsDiv = document.createElement('div');
      detailsDiv.style.fontSize = '12px';
      detailsDiv.style.opacity = '0.8';
      const sectionName = preset.section === 'spells' ? 'Spell Parodies' :
                         preset.section === 'bardic' ? 'Bardic Inspiration' :
                         preset.section === 'mockery' ? 'Vicious Mockery' :
                         preset.section === 'actions' ? 'Character Actions' : preset.section;
      detailsDiv.textContent = `${sectionName} • ${preset.category || 'Any'}${preset.search ? ` • Search: "${preset.search}"` : ''}`;
      presetInfo.appendChild(nameDiv);
      presetInfo.appendChild(detailsDiv);

      const buttonsDiv = document.createElement('div');
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.gap = '4px';

      const applyBtn = document.createElement('button');
      applyBtn.className = 'btn';
      applyBtn.textContent = 'Apply';
      applyBtn.style.fontSize = '12px';
      applyBtn.addEventListener('click', () => {
        applyPreset(preset);
        closePresetModal();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.fontSize = '12px';
      deleteBtn.style.background = '#c44';
      deleteBtn.style.color = 'white';
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete preset "${preset.name}"?`)) {
          const presets = loadPresets();
          presets.splice(index, 1);
          savePresets(presets);
          updatePresetSelect();
          refreshPresetsList();
          showToast('Preset deleted');
        }
      });

      buttonsDiv.appendChild(applyBtn);
      buttonsDiv.appendChild(deleteBtn);
      presetCard.appendChild(presetInfo);
      presetCard.appendChild(buttonsDiv);
      presetsList.appendChild(presetCard);
    });
  }

  function showPresetModal() {
    refreshPresetsList();
    presetModal.classList.add('show');
    presetModal.setAttribute('aria-hidden', 'false');
  }

  function closePresetModal() {
    presetModal.classList.remove('show');
    presetModal.setAttribute('aria-hidden', 'true');
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
            console.log('Deleted default item (from manage modal):', itemMeta.itemId);
            console.log('Deleted list for', type, ':', deleted[type]);
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
        console.log('Deleted default item:', currentEditingGeneratorItemId);
        console.log('Deleted list for', currentGeneratorType, ':', deleted[currentGeneratorType]);
        showToast('Default item deleted');
      } else {
        // Delete user-added item
        const userGenerators = loadUserGenerators();
        userGenerators[currentGeneratorType].splice(currentEditingGeneratorIndex, 1);
        saveUserGenerators(userGenerators);
        console.log('Deleted user-added item at index:', currentEditingGeneratorIndex);
        showToast('Item deleted');
      }
      refreshGeneratorsList();
      closeGeneratorEditModal();
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
      const text = section === 'actions' ? item : `${item.t} (Song: ${item.s} — ${item.a})`;
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
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1200);
  }

  // Modal functions
  function openEditModal(section, category, item, userIndex) {
    currentEditingSection = section;
    currentEditingCategory = category;
    currentEditingIndex = userIndex;
    
    // Store item metadata separately for actions (since they're strings)
    if (section === 'actions' && typeof item === 'string') {
      // Check if it's a default item
      const defaults = characterActions[category] || [];
      const itemId = getItemId(section, item);
      const deletedIds = deletedDefaults.actions?.[category] || [];
      const isDefaultItem = defaults.includes(item);
      const isDeletedDefault = deletedIds.includes(itemId);
      const fullActions = getMergedData('actions', category);
      const filteredDefaultCount = fullActions.length - (userItems.actions[category] || []).length;
      const fullIndex = fullActions.indexOf(item);
      const isUserAdded = fullIndex >= filteredDefaultCount;
      
      currentEditingItem = {
        _isDefaultItem: isDefaultItem && !isDeletedDefault,
        _isUserAdded: isUserAdded,
        _actionText: item
      };
    } else {
      currentEditingItem = item;
    }
    
    const isActions = section === 'actions';
    const isEditing = (userIndex !== null && userIndex !== undefined && userIndex >= 0) || (userIndex === -1);
    
    modalTitle.textContent = isEditing ? 'Edit Item' : 'Add New Item';
    deleteEditBtn.style.display = isEditing ? 'block' : 'none';
    
    // Show/hide fields based on section type
    if (isActions) {
      const text = typeof item === 'string' ? item : (item?._actionText || item?.t || '');
      editText.value = text;
      songLabel.style.display = 'none';
      artistLabel.style.display = 'none';
      adultLabel.style.display = 'none';
    } else {
      editText.value = item?.t || '';
      editSong.value = item?.s || '';
      editArtist.value = item?.a || '';
      editAdult.checked = item?.adult || false;
      songLabel.style.display = 'block';
      artistLabel.style.display = 'block';
      adultLabel.style.display = section === 'spells' ? 'block' : 'none';
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
  }
  
  function saveEditItem() {
    const section = currentEditingSection;
    const category = currentEditingCategory;
    
    if (!section || !category) {
      showToast('Error: Missing section or category');
      return;
    }
    
    const isActions = section === 'actions';
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    const isUserAdded = currentEditingItem?._isUserAdded;
    
    if (isActions) {
      const text = editText.value.trim();
      if (!text) {
        showToast('Please enter action text');
        return;
      }
      
      if (!userItems.actions[category]) {
        userItems.actions[category] = [];
      }
      
      if (currentEditingIndex !== null && currentEditingIndex !== undefined && currentEditingIndex >= 0) {
        // Editing existing user item
        userItems.actions[category][currentEditingIndex] = text;
        showToast('Action updated');
      } else if (currentEditingIndex === -1 && isDefaultItem) {
        // Editing a default item - hide original and add edited version
        const originalItem = section === 'actions' 
          ? (currentEditingItem._actionText || currentEditingItem)
          : currentEditingItem;
        const originalId = getItemId(section, originalItem);
        if (!deletedDefaults.actions[category]) {
          deletedDefaults.actions[category] = [];
        }
        if (!deletedDefaults.actions[category].includes(originalId)) {
          deletedDefaults.actions[category].push(originalId);
        }
        userItems.actions[category].push(text);
        saveDeletedDefaults(deletedDefaults);
        showToast('Default action edited (original hidden)');
      } else {
        // Adding new
        userItems.actions[category].push(text);
        showToast('Action added');
      }
    } else {
      const text = editText.value.trim();
      const song = editSong.value.trim();
      const artist = editArtist.value.trim();
      
      if (!text || !song || !artist) {
        showToast('Please fill in all fields');
        return;
      }
      
      const newItem = {
        t: text,
        s: song,
        a: artist
      };
      
      const wasAdultSpell = section === 'spells' && currentEditingItem?.adult;
      const isAdultSpell = section === 'spells' && editAdult.checked;
      
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
            if (!userItems.adultSpells[category]) {
              userItems.adultSpells[category] = [];
            }
            newItem.adult = true;
            userItems.adultSpells[category].push(newItem);
            showToast('Spell updated (moved to adult)');
          }
          // If it stays in the same category
          else if (isAdultSpell) {
            if (!userItems.adultSpells[category]) {
              userItems.adultSpells[category] = [];
            }
            newItem.adult = true;
            userItems.adultSpells[category][currentEditingIndex] = newItem;
            showToast('Adult spell updated');
          } else {
            if (!userItems.spells[category]) {
              userItems.spells[category] = [];
            }
            userItems.spells[category][currentEditingIndex] = newItem;
            showToast('Spell updated');
          }
        } else {
          // Non-spell sections
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
        
        if (!deletedDefaults[deleteSection][category]) {
          deletedDefaults[deleteSection][category] = [];
        }
        if (!deletedDefaults[deleteSection][category].includes(originalId)) {
          deletedDefaults[deleteSection][category].push(originalId);
        }
        
        // Add edited version to user items
        if (section === 'spells' && isAdultSpell) {
          if (!userItems.adultSpells[category]) {
            userItems.adultSpells[category] = [];
          }
          newItem.adult = true;
          userItems.adultSpells[category].push(newItem);
          showToast('Default spell edited (original hidden)');
        } else {
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
          if (!userItems.adultSpells[category]) {
            userItems.adultSpells[category] = [];
          }
          newItem.adult = true;
          userItems.adultSpells[category].push(newItem);
          showToast('Adult spell added');
        } else {
          // Regular item
          if (!userItems[section][category]) {
            userItems[section][category] = [];
          }
          userItems[section][category].push(newItem);
          showToast('Item added');
        }
      }
    }
    
    saveUserItems(userItems);
    console.log('Saved user items:', userItems);
    closeEditModal();
    render();
  }
  
  function deleteEditItem() {
    const section = currentEditingSection;
    const category = currentEditingCategory;
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    
    if (currentEditingIndex === -1 && isDefaultItem) {
      // Deleting a default item - add to deletedDefaults
      const itemId = section === 'actions' 
        ? getItemId(section, currentEditingItem._actionText || currentEditingItem)
        : getItemId(section, currentEditingItem);
      const deleteSection = (section === 'spells' && currentEditingItem?.adult) ? 'adultSpells' : section;
      
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
    
    const isActions = section === 'actions';
    
    if (isActions) {
      if (userItems.actions[category]) {
        userItems.actions[category].splice(currentEditingIndex, 1);
        if (userItems.actions[category].length === 0) {
          delete userItems.actions[category];
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
    console.log('Saved user items after delete:', userItems);
    closeEditModal();
    showToast('Item deleted');
    render();
  }

  sectionSelect.addEventListener('change', () => { 
    buildCategories(); 
    const section = sectionSelect.value;
    // Hide/show toggles based on section
    if (section === 'actions') {
      adultToggle.parentElement.style.display = 'none';
      favoritesOnly.parentElement.style.display = 'none';
    } else {
      adultToggle.parentElement.style.display = '';
      favoritesOnly.parentElement.style.display = '';
    }
    render(); 
  });
  categorySelect.addEventListener('change', render);
  adultToggle.addEventListener('change', render);
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
    } else {
      render();
    }
  });
  searchInput.addEventListener('input', render);
  clearBtn.addEventListener('click', () => { searchInput.value = ''; render(); });

  // Modal event listeners
  addEditBtn.addEventListener('click', () => {
    const section = sectionSelect.value;
    const category = categorySelect.value;
    if (section === 'actions') {
      openEditModal(section, category, null, null);
    } else {
      openEditModal(section, category, { t: '', s: '', a: '' }, null);
    }
  });
  
  saveEditBtn.addEventListener('click', saveEditItem);
  cancelEditBtn.addEventListener('click', closeEditModal);
  deleteEditBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteEditItem();
    }
  });
  modalClose.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
  
  // Generator buttons
  const generatorRow = document.createElement('div');
  generatorRow.className = 'toolbar__row';
  generatorRow.style.marginTop = '8px';
  generatorRow.style.gap = '8px';
  generatorRow.style.flexWrap = 'wrap';

  // Generator modal functions
  function showGeneratorModal(title, text) {
    generatorTitle.textContent = title;
    generatorText.textContent = text;
    generatorModal.classList.add('show');
    generatorModal.setAttribute('aria-hidden', 'false');
    
    // Store text for copy button
    generatorCopyBtn.dataset.textToCopy = text;
  }

  function closeGeneratorModal() {
    generatorModal.classList.remove('show');
    generatorModal.setAttribute('aria-hidden', 'true');
  }

  const battleCryBtn = document.createElement('button');
  battleCryBtn.id = 'battleCryBtn';
  battleCryBtn.className = 'btn';
  battleCryBtn.textContent = '⚔️ Battle Cry';
  battleCryBtn.style.fontSize = '14px';
  battleCryBtn.addEventListener('click', () => {
    const mergedCries = getMergedGenerators('battleCries');
    if (mergedCries.length === 0) {
      showToast('No battle cries available');
      return;
    }
    const cry = mergedCries[Math.floor(Math.random() * mergedCries.length)];
    showGeneratorModal('⚔️ Battle Cry', cry);
  });

  const insultBtn = document.createElement('button');
  insultBtn.id = 'insultBtn';
  insultBtn.className = 'btn';
  insultBtn.textContent = '🗡️ Insult';
  insultBtn.style.fontSize = '14px';
  insultBtn.addEventListener('click', () => {
    const mergedInsults = getMergedGenerators('insults');
    if (mergedInsults.length === 0) {
      showToast('No insults available');
      return;
    }
    const insult = mergedInsults[Math.floor(Math.random() * mergedInsults.length)];
    showGeneratorModal('🗡️ Insult', insult);
  });

  const complimentBtn = document.createElement('button');
  complimentBtn.id = 'complimentBtn';
  complimentBtn.className = 'btn';
  complimentBtn.textContent = '💬 Compliment';
  complimentBtn.style.fontSize = '14px';
  complimentBtn.addEventListener('click', () => {
    const mergedCompliments = getMergedGenerators('compliments');
    if (mergedCompliments.length === 0) {
      showToast('No compliments available');
      return;
    }
    const compliment = mergedCompliments[Math.floor(Math.random() * mergedCompliments.length)];
    showGeneratorModal('💬 Compliment', compliment);
  });

  // Generator modal event listeners
  generatorCopyBtn.addEventListener('click', () => {
    const text = generatorCopyBtn.dataset.textToCopy;
    if (text) {
      copyToClipboard(text);
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
  exportBtn.style.fontSize = '14px';
  exportBtn.addEventListener('click', () => {
      // Export COMPLETE dataset including all defaults and user customizations
      const data = {
        // Default content (complete datasets)
        defaultSpells: spells,
        defaultAdultSpells: adultSpells,
        defaultBardic: bardic,
        defaultMockery: mockery,
        defaultActions: characterActions,
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
        
        // Voice presets
        presets: JSON.parse(localStorage.getItem(voicePresetsKey) || '[]'),
        
        // Metadata
        version: '1.2',
        timestamp: new Date().toISOString(),
        exportNote: 'Complete export including all default items (spells, bardic, mockery, actions, generators) plus all user customizations (favorites, custom items, edits, deletions, presets, history).'
      };
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
  importBtn.style.fontSize = '14px';
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
            if (data.presets !== undefined) {
              localStorage.setItem(voicePresetsKey, JSON.stringify(data.presets));
              importedCount++;
              importedCategories.push('presets');
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
              console.log('Imported generators:', generators);
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
              setTimeout(() => location.reload(), 500);
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
  historyBtn.style.fontSize = '14px';
  historyBtn.addEventListener('click', showHistoryModal);

  // File storage button
  const fileStorageBtn = document.createElement('button');
  fileStorageBtn.id = 'fileStorageBtn';
  fileStorageBtn.className = 'btn';
  fileStorageBtn.textContent = fileSystemSupported ? '📁 Select Data Folder' : '📁 File Storage (N/A)';
  fileStorageBtn.style.fontSize = '14px';
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
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let message = 'File System Access API not available. ';
      if (browserInfo === 'Firefox') {
        message += 'Firefox does not support this feature. Please use Chrome, Edge, or Brave.';
      } else if (protocol === 'http:' && !isLocalhost) {
        message += 'Requires HTTPS (or localhost). Your site is using HTTP.';
      } else {
        message += `Requires Chrome/Edge/Brave browser and HTTPS (or localhost). Detected: ${browserInfo}, Protocol: ${protocol}`;
      }
      showToast(message);
      console.log('File storage button clicked but API not available:', { browserInfo, protocol, isLocalhost });
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

  generatorRow.appendChild(battleCryBtn);
  generatorRow.appendChild(insultBtn);
  generatorRow.appendChild(complimentBtn);
  generatorRow.appendChild(historyBtn);
  generatorRow.appendChild(fileStorageBtn);
  generatorRow.appendChild(exportBtn);
  generatorRow.appendChild(importBtn);
  document.querySelector('.toolbar').appendChild(generatorRow);

  // History modal event listeners
  historyCloseBtn.addEventListener('click', closeHistoryModal);
  historyModalClose.addEventListener('click', closeHistoryModal);
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      closeHistoryModal();
    }
  });

  // Voice Preset event listeners
  presetSelect.addEventListener('change', (e) => {
    if (e.target.value !== '') {
      const presets = loadPresets();
      const presetIndex = parseInt(e.target.value);
      if (presets[presetIndex]) {
        applyPreset(presets[presetIndex]);
      }
      // Reset select after applying
      setTimeout(() => {
        presetSelect.value = '';
      }, 100);
    }
  });

  managePresetsBtn.addEventListener('click', showPresetModal);
  saveCurrentPresetBtn.addEventListener('click', saveCurrentStateAsPreset);
  presetCloseBtn.addEventListener('click', closePresetModal);
  presetModalClose.addEventListener('click', closePresetModal);
  presetModal.addEventListener('click', (e) => {
    if (e.target === presetModal) {
      closePresetModal();
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
      if (presetModal.classList.contains('show')) {
        closePresetModal();
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
        (presetModal && presetModal.classList.contains('show')) ||
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
  console.log('Initializing...');
  
  // Initialize file storage and load data
  (async function initializeFileStorage() {
    const initialized = await initFileStorage();
    if (initialized) {
      // Try to load data from file
      const loaded = await loadDataFromFile();
      if (loaded) {
        // Reload favorites and other data from localStorage (which was updated by loadDataFromFile)
        favorites = loadFavorites();
        // Trigger a re-render to show loaded data
        setTimeout(() => {
          const section = sectionSelect.value;
          if (section === 'actions') {
            renderActions();
          } else {
            render();
          }
        }, 100);
      }
    }
  })();
  
  // Ensure section select has a value
  if (!sectionSelect.value && sectionSelect.options.length > 0) {
    sectionSelect.selectedIndex = 0;
    console.log(`Initial section selected: ${sectionSelect.value}`);
  }
  
  try {
    buildCategories();
  } catch (error) {
    console.error('Error in buildCategories during init:', error);
  }
  
  // Ensure a category is selected
  if (categorySelect.options.length > 0 && !categorySelect.value) {
    categorySelect.selectedIndex = 0;
    console.log(`Initial category selected: ${categorySelect.value}`);
  }
  
  // Initialize preset select
  updatePresetSelect();
  
  console.log('Initial render...');
  try {
    render();
  } catch (error) {
    console.error('Error in render during init:', error);
    content.innerHTML = '<div class="card">Error loading content. Please refresh the page.</div>';
  }
  
  console.log('Initialization complete');
})();
