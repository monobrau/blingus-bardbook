/**
 * Bardic inspiration data for Blingus' Bardbook
 * Organized by inspiration type (Attack Rolls, Saving Throws, etc.)
 */
window.BlingusData = window.BlingusData || {};

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

window.BlingusData.bardic = bardic;