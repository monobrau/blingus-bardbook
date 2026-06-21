/**
 * Bardic inspiration data (curated revamp — best song-faithful parodies per type)
 */
window.BlingusData = window.BlingusData || {};

const bardic = {
  'Attack Rolls': [
    {t:"Another one bites the dust—now swing; let victory chorus sing.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Pour some sugar on me—sweeten the smack; bonus attack, no slack.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
    {t:"Enter Sandman—tuck 'em in; lullaby crits with a wicked grin.", s:"Enter Sandman", a:"Metallica"},
    {t:"Sweet child o' mine—sweet crit o' time; line up the sight and shine.", s:"Sweet Child O' Mine", a:"Guns N' Roses"},
    {t:"Boom boom pow—extra oomph now; numbers bow, damage show.", s:"Boom Boom Pow", a:"The Black Eyed Peas"},
    {t:"Thunderstruck? Nah—thunder-smacked; roll that boom, get impact.", s:"Thunderstruck", a:"AC/DC"},
  ],
  'Saving Throws': [
    {t:"Stayin' alive—ah, ah, ah, ah; keep that beat, pass by harm.", s:"Stayin' Alive", a:"Bee Gees"},
    {t:"Under pressure—hold steady; breathe and pass, be ready.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"Stronger—what doesn't kill you makes you stronger; save that danger, no longer.", s:"Stronger", a:"Kanye West"},
    {t:"I will survive—as long as I know how to save, I'll thrive.", s:"I Will Survive", a:"Gloria Gaynor"},
    {t:"Tubthumping—I get knocked down, then get up again; save that pain, win.", s:"Tubthumping", a:"Chumbawamba"},
    {t:"Don't fear the reaper—not today; more cowbell when we play.", s:"Don't Fear the Reaper", a:"Blue Öyster Cult"},
  ],
  'Skill — Persuasion/Performance/Deception': [
    {t:"Never gonna give you up—on this plan; trust the band, be our fan.", s:"Never Gonna Give You Up", a:"Rick Astley"},
    {t:"Sweet Caroline—good times never seemed so good… now nod; you should.", s:"Sweet Caroline", a:"Neil Diamond"},
    {t:"Personal Jesus—reach out, touch faith in this pitch; we'll make you rich.", s:"Personal Jesus", a:"Depeche Mode"},
    {t:"The way you make me feel—approve the appeal; seal the deal.", s:"The Way You Make Me Feel", a:"Michael Jackson"},
    {t:"Smooth operator—silver tongue, criminal charm; no alarm.", s:"Smooth Operator", a:"Sade"},
    {t:"Uptown funk you up—charm 'em up; smooth talk, seal it up.", s:"Uptown Funk", a:"Bruno Mars"},
  ],
  'Skill — Stealth/Sleight/Blend In': [
    {t:"Every breath you take—no sound I make; watch me vanish in my wake.", s:"Every Breath You Take", a:"The Police"},
    {t:"Where the streets have no name—neither do my tracks; I leave no facts.", s:"Where the Streets Have No Name", a:"U2"},
    {t:"Enjoy the silence—words are needless; footprints, feckless.", s:"Enjoy the Silence", a:"Depeche Mode"},
    {t:"Smooth criminal—Annie, are you okay? They won't be; unseen spree.", s:"Smooth Criminal", a:"Michael Jackson"},
    {t:"Yesterday—all my noise seemed far away; now silence leads the way.", s:"Yesterday", a:"The Beatles"},
    {t:"I walk the line—quiet feet, quiet mind; shadows signed.", s:"I Walk the Line", a:"Johnny Cash"},
  ],
  'Skill — Investigation/Perception/Insight': [
    {t:"Sweet dreams are made of this—motives, means, and evidence; case in bliss.", s:"Sweet Dreams (Are Made of This)", a:"Eurythmics"},
    {t:"I still haven't found what I'm looking for—oh wait, right here; clue crystal clear.", s:"I Still Haven't Found What I'm Looking For", a:"U2"},
    {t:"Every little thing she does is magic—and mildly suspicious; noted, officious.", s:"Every Little Thing She Does Is Magic", a:"The Police"},
    {t:"Under pressure—cracks reveal the seam; I thread the scheme.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"Changes—turn and face the strange; pattern shift within range.", s:"Changes", a:"David Bowie"},
    {t:"I can see clearly now—the clue is found; truth unbound.", s:"I Can See Clearly Now", a:"Johnny Nash"},
  ],
  'Skill — Athletics/Acrobatics/Climb/Run': [
    {t:"I like to move it—move it; now you move it too; parkour debut.", s:"I Like to Move It", a:"Reel 2 Real"},
    {t:"Can't stop the feeling—feet start dealing; hop, skip, ceiling.", s:"Can't Stop the Feeling!", a:"Justin Timberlake"},
    {t:"Walk this way—run that way; hurdle clean, no delay.", s:"Walk This Way", a:"Aerosmith"},
    {t:"Back in black—track attack; sprint the line, don't look back.", s:"Back in Black", a:"AC/DC"},
    {t:"Highway to Hell—on ramp to speed; overtake with heed.", s:"Highway to Hell", a:"AC/DC"},
    {t:"Beat it—fatigue, beat it; second wind—repeat it.", s:"Beat It", a:"Michael Jackson"},
  ],
  'Initiative': [
    {t:"You really got me—spooled and primed; I'm on time.", s:"You Really Got Me", a:"Van Halen"},
    {t:"Billie Jean—light on my feet; step to the front, bring heat.", s:"Billie Jean", a:"Michael Jackson"},
    {t:"Brass monkey—funky and spry; jump the line, get mine, here's why.", s:"Brass Monkey", a:"Beastie Boys"},
    {t:"Start me up—and never stop; first to pop, top of the crop.", s:"Start Me Up", a:"The Rolling Stones"},
    {t:"Gimme shelter—nah, give me turn one; battle's begun.", s:"Gimme Shelter", a:"The Rolling Stones"},
    {t:"Wake me up before you go-go—I'm already gone; blink and I'm on.", s:"Wake Me Up Before You Go-Go", a:"Wham!"},
  ],
  'Combat Inspiration — Damage': [
    {t:"Another one bites the dust—plus a little thrust; add that gust.", s:"Another One Bites the Dust", a:"Queen"},
    {t:"Pour some sugar on me—sweeten the smack; damage stack.", s:"Pour Some Sugar on Me", a:"Def Leppard"},
    {t:"Thunderstruck—amp it up; roll the boom, overflow the cup.", s:"Thunderstruck", a:"AC/DC"},
    {t:"Shot through the heart—and you're to blame; bonus pain, write my name.", s:"You Give Love a Bad Name", a:"Bon Jovi"},
    {t:"Boom boom pow—extra oomph now; numbers bow.", s:"Boom Boom Pow", a:"The Black Eyed Peas"},
    {t:"Killing in the name—of bonus flame; damage game.", s:"Killing in the Name", a:"Rage Against the Machine"},
  ],
  'Combat Inspiration — AC/Defense': [
    {t:"Under pressure—armor spine; hold the line, you're fine.", s:"Under Pressure", a:"Queen & David Bowie"},
    {t:"You shook me all night long—but not this strike; armor's right.", s:"You Shook Me All Night Long", a:"AC/DC"},
    {t:"Hit me with your best shot—blocked; fire away—still shocked.", s:"Hit Me With Your Best Shot", a:"Pat Benatar"},
    {t:"I'm still standing—yeah, yeah, yeah; hit denied, au contraire.", s:"I'm Still Standing", a:"Elton John"},
    {t:"U can't touch this—hammer time; denied that crime.", s:"U Can't Touch This", a:"MC Hammer"},
    {t:"Stop! In the name of love—nope, not this blow; guard the glow.", s:"Stop! In the Name of Love", a:"The Supremes"},
  ],
};

window.BlingusData.bardic = bardic;
