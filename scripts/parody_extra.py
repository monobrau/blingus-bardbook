#!/usr/bin/env python3
"""Additional hand-written parody candidates merged in by curate-parody.py.

Keep entries song-faithful: start each line with the song title (the scorer's
strongest signal) and stay on-topic for the spell/bardic effect, in Blingus's
witty bard voice. The curator scores, dedupes, and trims — weak entries drop
out automatically, so it is safe to over-supply candidates here.
"""

SPELLS_EXTRA = {
    'Druidcraft': [
        {"t": "Here comes the sun—little sprouts, here we grow; lift your leaves up to the sun.", "s": "Here Comes the Sun", "a": "The Beatles"},
        {"t": "Blowin' in the wind—the answer, my friend; watch the petals ride the wind.", "s": "Blowin' in the Wind", "a": "Bob Dylan"},
        {"t": "Purple rain, purple rain—I drizzle it down; every flower drinks the rain.", "s": "Purple Rain", "a": "Prince"},
        {"t": "Mr. Blue Sky—I summon you high; sunshine spills from a friendly sky.", "s": "Mr. Blue Sky", "a": "Electric Light Orchestra"},
    ],
    'Prestidigitation': [
        {"t": "Sharp dressed man—lint be gone; cuffs pressed crisp, and I move on, sharp dressed man.", "s": "Sharp Dressed Man", "a": "ZZ Top"},
        {"t": "Whip it—when a mess comes along, you must whip it; spotless now, that's it.", "s": "Whip It", "a": "Devo"},
        {"t": "Magic—oh, oh, oh, it's magic; one snap, the grime is gone, pure magic.", "s": "Magic", "a": "Pilot"},
        {"t": "Smooth operator—I buff the smudge away; sparkle's here to stay.", "s": "Smooth Operator", "a": "Sade"},
    ],
    'Vicious Mockery': [
        {"t": "We will rock you—well, mock you; your aim's a joke, so we clock you.", "s": "We Will Rock You", "a": "Queen"},
        {"t": "Beat it—no, really, just beat it; your swing's so sad the dice repeat it.", "s": "Beat It", "a": "Michael Jackson"},
        {"t": "You're so vain—I bet you think this jab's not true; it is, and so are you, so vain.", "s": "You're So Vain", "a": "Carly Simon"},
    ],
    'Bane': [
        {"t": "Knockin' on heaven's door—nah, knockin' on minus-four; bad luck's at the door.", "s": "Knockin' on Heaven's Door", "a": "Bob Dylan"},
        {"t": "Bad day—you're gonna have a bad day; every roll just turns away.", "s": "Bad Day", "a": "Daniel Powter"},
        {"t": "Highway to hell—your luck took the on-ramp; every save's a cramp, highway to hell.", "s": "Highway to Hell", "a": "AC/DC"},
    ],
    'Command': [
        {"t": "Jump—go ahead and jump; one word from me, you jump.", "s": "Jump", "a": "Van Halen"},
        {"t": "Should I stay or should I go—you'll go; I said it once, now go.", "s": "Should I Stay or Should I Go", "a": "The Clash"},
        {"t": "Stand—now stand, command's command; rise on cue, understand, and stand.", "s": "Stand", "a": "R.E.M."},
    ],
    'Faerie Fire': [
        {"t": "Blinding lights—I stained you bright; no more hiding from the blinding lights.", "s": "Blinding Lights", "a": "The Weeknd"},
        {"t": "Firework—boom, you're outlined like a firework; stealth gone, sparkle berserk, firework.", "s": "Firework", "a": "Katy Perry"},
        {"t": "Disco inferno—burn, baby, burn; outlined every way you turn, disco inferno.", "s": "Disco Inferno", "a": "The Trammps"},
    ],
    'Healing Word': [
        {"t": "Bring me to life—wake up inside; I call your spirit back to life.", "s": "Bring Me to Life", "a": "Evanescence"},
        {"t": "Lean on me—when you're not strong; I'll patch you up and carry you along.", "s": "Lean on Me", "a": "Bill Withers"},
        {"t": "The power of love—heals the wound; back on your feet, the power of love.", "s": "The Power of Love", "a": "Huey Lewis & The News"},
    ],
    'Crown of Madness': [
        {"t": "Mind games—we're playing those; your former friends are now your foes, mind games.", "s": "Mind Games", "a": "John Lennon"},
        {"t": "Hypnotize—you will obey; turn on your crew, attack today.", "s": "Hypnotize", "a": "The Notorious B.I.G."},
        {"t": "Psycho killer—qu'est-ce que c'est; swing at your friends, psycho killer.", "s": "Psycho Killer", "a": "Talking Heads"},
    ],
    'Silence': [
        {"t": "The sound of silence—hello darkness, my old friend; no spell, no sound, the sound of silence.", "s": "The Sound of Silence", "a": "Simon & Garfunkel"},
        {"t": "Silent night—holy and still; not one word leaves your lips tonight, silent night.", "s": "Silent Night", "a": "Traditional"},
        {"t": "Hello—is it me you're—nope; lips move, nothing, just hello.", "s": "Hello", "a": "Adele"},
    ],
}

ADULT_EXTRA = {
    'Vicious Mockery': [
        {"t": "SexyBack—you brought ugly back; aim's whack, your whole attack is wack.", "s": "SexyBack", "a": "Justin Timberlake", "adult": True},
    ],
    'Bane': [
        {"t": "Highway to hell—your mojo checked out; nothing left but minus and doubt.", "s": "Highway to Hell", "a": "AC/DC", "adult": True},
    ],
    'Faerie Fire': [
        {"t": "Blinding lights—now everyone can see; lit up loud, no modesty.", "s": "Blinding Lights", "a": "The Weeknd", "adult": True},
    ],
    'Silence': [
        {"t": "The sound of silence—not a peep, not a moan; you're muted to the bone.", "s": "The Sound of Silence", "a": "Simon & Garfunkel", "adult": True},
    ],
}

BARDIC_EXTRA = {
    'Attack Rolls': [
        {"t": "Eye of the tiger—lock the sight; bonus bite, the swing lands right.", "s": "Eye of the Tiger", "a": "Survivor"},
        {"t": "Shoot to thrill—load the die; bonus on the bull's-eye.", "s": "Shoot to Thrill", "a": "AC/DC"},
        {"t": "Hit me with your best shot—now I will; add the thrill, line up the kill.", "s": "Hit Me With Your Best Shot", "a": "Pat Benatar"},
    ],
    'Saving Throws': [
        {"t": "Survivor—I'm a survivor; pass that save, come out a thriver, a survivor.", "s": "Survivor", "a": "Destiny's Child"},
        {"t": "It's my life—my save, my way; I hold the danger at bay.", "s": "It's My Life", "a": "Bon Jovi"},
        {"t": "Hold on—just one more save; for one more round I'm brave.", "s": "Hold On", "a": "Wilson Phillips"},
    ],
    'Skill — Persuasion/Performance/Deception': [
        {"t": "Respect—find out what it means; I sell the deal in between.", "s": "Respect", "a": "Aretha Franklin"},
        {"t": "Don't stop me now—I'm having a good time; trust the pitch, trust the rhyme.", "s": "Don't Stop Me Now", "a": "Queen"},
        {"t": "Take on me—take me on; sign right here, and now you're won.", "s": "Take On Me", "a": "a-ha"},
    ],
    'Skill — Stealth/Sleight/Blend In': [
        {"t": "The sound of silence—my footsteps gone; only shadows carry on.", "s": "The Sound of Silence", "a": "Simon & Garfunkel"},
        {"t": "Bad guy—duh, but quiet; tip-toe past your private riot.", "s": "Bad Guy", "a": "Billie Eilish"},
        {"t": "Ghost—I'm a ghost down the hall; no creak, no sound, no trace at all.", "s": "Ghost", "a": "Justin Bieber"},
    ],
    'Skill — Investigation/Perception/Insight': [
        {"t": "Private eyes—they're watching you; I read the room, I spot the clue.", "s": "Private Eyes", "a": "Hall & Oates"},
        {"t": "Somebody's watching me—and it's me; I clock the thing you didn't see.", "s": "Somebody's Watching Me", "a": "Rockwell"},
        {"t": "Behind blue eyes—I read the lie; the tell is in your nervous sigh.", "s": "Behind Blue Eyes", "a": "The Who"},
    ],
    'Skill — Athletics/Acrobatics/Climb/Run': [
        {"t": "Jump around—up and down; I vault clean across the town, jump around.", "s": "Jump Around", "a": "House of Pain"},
        {"t": "Born to run—tramps like us; clear the hurdle, zero fuss.", "s": "Born to Run", "a": "Bruce Springsteen"},
        {"t": "Footloose—kick off your Sunday shoes; I leap the gap, can't lose.", "s": "Footloose", "a": "Kenny Loggins"},
    ],
    'Initiative': [
        {"t": "Ready or not—here I come; first in line, I outrun.", "s": "Ready or Not", "a": "The Fugees"},
        {"t": "Right now—I move first; I'm out the gate to quench the thirst.", "s": "Right Now", "a": "Van Halen"},
        {"t": "Don't stop me now—I'm a shooting star; first to act, I'm out far.", "s": "Don't Stop Me Now", "a": "Queen"},
    ],
    'Combat Inspiration — Damage': [
        {"t": "T.N.T.—I'm dynamite; add the boom, the hit ignites.", "s": "T.N.T.", "a": "AC/DC"},
        {"t": "Hells bells—ring the hit; extra damage, never quit.", "s": "Hells Bells", "a": "AC/DC"},
        {"t": "Crazy train—off the rails; bonus damage that derails.", "s": "Crazy Train", "a": "Ozzy Osbourne"},
    ],
    'Combat Inspiration — AC/Defense': [
        {"t": "Iron man—armor's on; blow deflected, threat withdrawn.", "s": "Iron Man", "a": "Black Sabbath"},
        {"t": "Titanium—shoot, I won't fall; the strike just ricochets off the wall.", "s": "Titanium", "a": "David Guetta ft. Sia"},
        {"t": "Bulletproof—nothing to lose; the hit slides off, nothing bruised, bulletproof.", "s": "Bulletproof", "a": "La Roux"},
    ],
}
