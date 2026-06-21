/**
 * Skill check results (curated revamp)
 */
window.BlingusData = window.BlingusData || {};

const skillChecks = {
  'Acrobatics - Success': [
    "I gracefully flip over the obstacle, landing perfectly on my feet",
    "My body moves like liquid, flowing through the narrow space with ease",
    "I execute a perfect cartwheel, my feet barely touching the ground",
    "With a fluid motion, I balance on the narrow beam as if I were born to it",
  ],
  'Acrobatics - Failure': [
    "I attempt a flip but land flat on my back with a loud thud",
    "My foot slips and I tumble awkwardly to the ground",
    "I misjudge the distance and crash into the obstacle instead of over it",
    "My balance fails me completely, and I fall in an undignified heap",
  ],
  'Animal Handling - Success': [
    "The creature calms under my gentle touch, recognizing a friend",
    "I speak softly to the animal, and it responds with trust",
    "My understanding of animals shines through as the beast relaxes",
    "The creature recognizes my calm demeanor and approaches willingly",
  ],
  'Animal Handling - Failure': [
    "The creature sees me as a threat and backs away, baring its teeth",
    "My approach startles the animal, causing it to flee",
    "I misread the creature's signals and make it more agitated",
    "The beast doesn't trust me and shows clear signs of aggression",
  ],
  'Arcana - Success': [
    "I recognize the magical pattern immediately, understanding its purpose",
    "My knowledge of arcane theory helps me decipher the enchantment",
    "The magical energy reveals its secrets to my trained eye",
    "I identify the spell components and their interactions perfectly",
  ],
  'Arcana - Failure': [
    "The magical symbols look like gibberish to my untrained eye",
    "I can't make sense of the arcane patterns, despite my best efforts",
    "The magical energy confuses me, its purpose unclear",
    "My knowledge fails me, and the enchantment remains a mystery",
  ],
  'Athletics - Success': [
    "I summon all my strength and easily overcome the obstacle",
    "My muscles strain but hold firm, allowing me to succeed",
    "With a powerful effort, I lift/push/climb with impressive force",
    "My physical prowess shines as I complete the feat of strength",
  ],
  'Athletics - Failure': [
    "My muscles strain but fail me at the critical moment",
    "I attempt the feat but lack the strength to complete it",
    "My grip slips, and I fall short of the goal",
    "I overestimate my abilities and fail spectacularly",
  ],
  'Deception - Success': [
    "My lie flows smoothly, convincing even myself for a moment",
    "I weave a believable tale that seems completely authentic",
    "My deception is so convincing, they don't question a word",
    "I tell the perfect lie, hitting all the right emotional notes",
  ],
  'Deception - Failure': [
    "My lie is so transparent, a child could see through it",
    "I stumble over my words, making my deception obvious",
    "My story falls apart under the slightest questioning",
    "I can't maintain eye contact, giving away my deception",
  ],
  'History - Success': [
    "I recall the exact details of this historical event",
    "My knowledge of history provides the perfect context",
    "I remember reading about this in ancient texts",
    "The historical significance becomes clear through my studies",
  ],
  'History - Failure': [
    "I draw a complete blank on this historical period",
    "My memory fails me, and I can't recall the details",
    "I think I remember something, but I'm probably wrong",
    "The historical context escapes me completely",
  ],
  'Insight - Success': [
    "I read their body language perfectly, understanding their true intentions",
    "My insight reveals what they're really thinking",
    "I see through their facade to their actual motives",
    "Their tells are obvious to my trained eye",
  ],
  'Insight - Failure': [
    "I completely misread their intentions and body language",
    "Their true motives remain hidden from my insight",
    "I can't tell if they're lying or telling the truth",
    "Their behavior confuses me, and I draw the wrong conclusions",
  ],
  'Intimidation - Success': [
    "My threat lands perfectly, and they visibly shrink back",
    "I project such menace that they immediately comply",
    "My intimidating presence makes them reconsider their position",
    "They recognize the danger in my words and back down",
  ],
  'Intimidation - Failure': [
    "My threat falls flat, and they laugh at my attempt",
    "I try to be intimidating but come across as comical instead",
    "My attempt at menace fails spectacularly",
    "They see through my bluster and aren't impressed",
  ],
  'Investigation - Success': [
    "I notice the crucial detail that everyone else missed",
    "My careful examination reveals the hidden clue",
    "I piece together the evidence to form a clear picture",
    "My investigation uncovers the truth others overlooked",
  ],
  'Investigation - Failure': [
    "I search thoroughly but find nothing of value",
    "My investigation misses the crucial detail right in front of me",
    "I can't make sense of the evidence, no matter how hard I try",
    "The clues don't add up, and I draw the wrong conclusions",
  ],
  'Medicine - Success': [
    "I diagnose the problem accurately and know exactly how to treat it",
    "My medical knowledge helps me stabilize the condition",
    "I recognize the symptoms and apply the correct treatment",
    "My healing skills prove effective in treating the ailment",
  ],
  'Medicine - Failure': [
    "I misdiagnose the problem completely",
    "My medical knowledge fails me, and I can't help",
    "I have no idea what's wrong or how to treat it",
    "My attempts at healing only make things worse",
  ],
  'Nature - Success': [
    "I recognize the plant/animal/terrain immediately from my studies",
    "My knowledge of nature helps me understand the environment",
    "I identify the natural phenomenon and its significance",
    "My understanding of the natural world reveals important information",
  ],
  'Nature - Failure': [
    "I have no idea what this plant/animal/terrain is",
    "My nature knowledge fails me completely",
    "I can't identify the natural phenomenon at all",
    "The environment confuses me, and I draw wrong conclusions",
  ],
  'Perception - Success': [
    "I notice the detail that everyone else missed",
    "My sharp eyes catch what others overlooked",
    "I spot the hidden thing immediately",
    "My perception reveals what was concealed",
  ],
  'Perception - Failure': [
    "I miss the obvious thing right in front of me",
    "My perception fails me, and I notice nothing",
    "I'm so distracted that I miss everything important",
    "The crucial detail escapes my notice completely",
  ],
  'Performance - Success': [
    "My performance captivates the audience completely",
    "I deliver a flawless performance that moves the crowd",
    "My artistic skill shines through in every note/word/gesture",
    "I perform so well that the audience is spellbound",
  ],
  'Performance - Failure': [
    "My performance falls completely flat",
    "I forget the words/notes and stumble awkwardly",
    "My artistic attempt is met with awkward silence",
    "I perform so badly that people look away in embarrassment",
  ],
  'Persuasion - Success': [
    "My words strike the perfect chord, and they agree",
    "I present my argument so convincingly that they're won over",
    "My persuasion is so effective, they change their mind",
    "I find exactly the right words to convince them",
  ],
  'Persuasion - Failure': [
    "My argument falls flat, and they remain unconvinced",
    "I try to persuade but only make them more resistant",
    "My words fail to have any impact on their opinion",
    "I present my case poorly, and they reject it completely",
  ],
  'Religion - Success': [
    "I recall the exact religious doctrine that applies here",
    "My knowledge of religion provides the perfect insight",
    "I remember the sacred texts that explain this situation",
    "My religious studies help me understand the divine significance",
  ],
  'Religion - Failure': [
    "I draw a complete blank on this religious matter",
    "My religious knowledge fails me completely",
    "I can't remember the relevant doctrine or text",
    "The religious significance escapes my understanding",
  ],
  'Sleight of Hand - Success': [
    "My fingers move so quickly, no one notices what I did",
    "I execute the sleight perfectly, completely undetected",
    "My dexterous hands work their magic flawlessly",
    "I perform the trick so smoothly, it's invisible",
  ],
  'Sleight of Hand - Failure': [
    "I fumble the sleight, making it completely obvious",
    "My fingers betray me, and everyone sees what I did",
    "I drop what I'm trying to manipulate, revealing my attempt",
    "My sleight of hand fails spectacularly",
  ],
  'Stealth - Success': [
    "I move like a shadow, completely undetected",
    "My stealth is so perfect, I'm practically invisible",
    "I blend into the environment seamlessly",
    "My movements are silent and undetectable",
  ],
  'Stealth - Failure': [
    "I step on something loud, alerting everyone to my presence",
    "My stealth attempt fails completely, and I'm spotted immediately",
    "I make so much noise that stealth becomes impossible",
    "I try to hide but stick out like a sore thumb",
  ],
  'Survival - Success': [
    "I read the signs perfectly and know exactly what to do",
    "My survival skills guide me to the right decision",
    "I recognize the danger and know how to avoid it",
    "My knowledge of survival helps me navigate safely",
  ],
  'Survival - Failure': [
    "I misread the signs and make the wrong decision",
    "My survival knowledge fails me completely",
    "I can't find what I need, despite my best efforts",
    "I make a survival mistake that could be dangerous",
  ],
};
window.BlingusData.skillChecks = skillChecks;
