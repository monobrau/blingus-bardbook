/**
 * Character action data for Blingus' Bardbook (curated revamp)
 * Organized by action category — top picks per situation
 */
window.BlingusData = window.BlingusData || {};

const characterActions = {
  'Tavern': [
    "Casually bringing up the Tarrasque in conversation (you know, like normal people do)",
    "Ordering a drink and asking the bartender about local rumors",
    "Playing cards with some locals (and probably losing)",
    "Singing a bawdy drinking song at the top of your lungs",
    "Challenging someone to an arm-wrestling contest",
  ],
  'Inn': [
    "Asking the innkeeper if they've ever heard of a Tarrasque (they haven't, but you'll explain)",
    "Inspecting the room for hidden doors or traps",
    "Asking the innkeeper about strange noises last night",
    "Checking under the bed (you never know)",
    "Barricading the door with furniture",
  ],
  'Walking in a Dungeon': [
    "Casually mentioning that you've been studying Tarrasque movements (for fun, obviously)",
    "Checking for traps every three steps",
    "Listening for sounds of movement ahead",
    "Tapping the walls looking for secret doors",
    "Following the tracks on the floor",
  ],
  'Listening for Rumors': [
    "Casually steering the conversation toward Tarrasque-related topics",
    "Eavesdropping on nearby conversations",
    "Buying drinks for information",
    "Asking direct questions and getting evasive answers",
    "Pretending to be someone else to get information",
  ],
  'Town Square': [
    "Casually mentioning that you've been mapping potential Tarrasque attack routes",
    "Watching the people go by",
    "Looking for a notice board or job postings",
    "Trying to blend in with the crowd",
    "Looking for potential allies or contacts",
  ],
  'Camp': [
    "Trying to convince your party that Tarrasque-proofing the camp would be wise",
    "Setting up your tent and bedroll",
    "Taking first watch (and probably falling asleep)",
    "Trying to start a fire (and failing multiple times)",
    "Cooking something that might be edible",
  ],
  'Shop': [
    "Haggling over prices (and probably losing)",
    "Looking for specific items you need",
    "Trying to sell your loot for a good price",
    "Asking about special or rare items",
    "Checking the quality of the merchandise",
  ],
  'Temple': [
    "Looking for any signs of Tarrasque-related prophecies or omens",
    "Praying for guidance or protection",
    "Asking the clergy about recent events",
    "Looking for healing or restoration",
    "Trying to make a donation (or pretending to)",
  ],
  'Blacksmith': [
    "Trying to convince the blacksmith that rust monster-proofing would be a good business venture",
    "Asking to repair your damaged equipment",
    "Looking for a weapon upgrade",
    "Trying to get armor fitted",
    "Asking about the quality of the work",
  ],
  'Market': [
    "Casually bringing up the Tarrasque in casual market conversation",
    "Browsing various stalls and vendors",
    "Trying to find the best deals",
    "Looking for specific items you need",
    "Haggling over prices",
  ],
  'Travelling / On the Trail': [
    "Trying to convince your party to take a detour to avoid potential Tarrasque territory",
    "Checking the path ahead for danger",
    "Following tracks left by previous travelers",
    "Looking for signs of ambush or bandits",
    "Scouting the best route forward",
  ],
  'Mountains': [
    "Checking if the mountain shows any signs of Tarrasque activity (you know it doesn't, but mountains are big)",
    "Looking for safe paths up the mountain",
    "Checking for loose rocks or unstable ground",
    "Looking for shelter from the wind",
    "Trying to find a route that avoids cliffs",
  ],
  'Jungle': [
    "Checking your metal equipment constantly for jungle rust and rust monster damage",
    "Cutting through dense undergrowth with your daggers",
    "Watching for dangerous plants and creatures",
    "Looking for paths made by animals or previous travelers",
    "Checking for quicksand or unstable ground",
  ],
  'Plains': [
    "Wondering if the Tarrasque could just walk across these plains unseen (probably, it's huge)",
    "Scanning the horizon for movement",
    "Looking for high points to get a better view",
    "Checking for signs of travelers or settlements ahead",
    "Watching for storms approaching from the distance",
  ],
  'Forest': [
    "Checking every piece of metal equipment for forest rust and rust monster activity",
    "Looking for a clear path through the trees",
    "Checking for signs of wildlife or danger",
    "Trying to maintain your sense of direction",
    "Looking for sources of fresh water",
  ],
  'Bad Weather': [
    "Wondering if the Tarrasque causes extreme weather when it awakens (probably, it's that powerful)",
    "Looking for shelter from the rain or storm",
    "Trying to keep your equipment dry",
    "Checking if the weather is getting worse",
    "Looking for high ground to avoid flooding",
  ],
  'Desert': [
    "Wondering if the Tarrasque could burrow through sand (probably, sand is just loose rock)",
    "Conserving water and rationing supplies",
    "Looking for sources of water or oases",
    "Checking for signs of approaching sandstorms",
    "Trying to find shelter from the blazing sun",
  ],
  'Swamp / Marsh': [
    "Wondering if the Tarrasque could hide in swamps (swamps are deep and murky)",
    "Looking for solid ground to walk on",
    "Checking for quicksand or deep mud",
    "Watching for dangerous creatures in the water",
    "Trying to avoid getting your gear wet",
  ],
  'Carnival / Feywild (Wild Beyond The Witchlight)': [
    "Trying to win a carnival game but suspecting it's rigged (it probably is)",
    "Checking if time feels weird here (Prismeer's time distortion is confusing)",
    "Looking for the Witchlight Carnival entrance (it moves, you know)",
    "Looking for signs of Zybilna's influence (she's the archfey, after all)",
    "Asking about carnival tickets and if they're actually worth anything",
  ],
};
window.BlingusData.characterActions = characterActions;
