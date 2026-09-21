export type DialogueLine = {
  speaker: string;
  portrait: string;
  tint: string;
  text: string;
};

export type StoryChapter = {
  levelId: number;
  title: string;
  before: DialogueLine[];
  after: DialogueLine[];
};

const CAST = {
  lyra: { speaker: 'Lyra Quinn', portrait: '🌟', tint: '#7C5CFF' },
  orin: { speaker: 'Master Orin', portrait: '🧙', tint: '#4C9AFF' },
  bram: { speaker: 'Bram', portrait: '🎒', tint: '#FFB84C' },
  isolde: { speaker: 'Captain Isolde', portrait: '🛡️', tint: '#4CD97B' },
  kaelen: { speaker: 'Kaelen the Unmaker', portrait: '🌑', tint: '#FF5E5B' },
} as const;

function say(who: (typeof CAST)[keyof typeof CAST], text: string): DialogueLine {
  return { speaker: who.speaker, portrait: who.portrait, tint: who.tint, text };
}

export const STORY_TITLE = 'Cascade Quest: The Fading Prism';

export const STORY_CHAPTERS: Record<number, StoryChapter> = {
  1: {
    levelId: 1,
    title: 'Chapter 1: The Shard Awakens',
    before: [
      say(CAST.orin, "Careful with those crates, Lyra! Prism shards aren't for market juggling."),
      say(CAST.lyra, "I didn't mean to— wait. Why are they glowing?"),
      say(CAST.orin, "...That's not supposed to happen. Show me. Match them together, like this."),
    ],
    after: [
      say(CAST.orin, 'By the Prism... you chained that cascade like a trained Shardweaver.'),
      say(CAST.lyra, 'I just felt where they wanted to go.'),
      say(CAST.orin, "Then it's time you learned to listen closer. Come with me."),
    ],
  },
  2: {
    levelId: 2,
    title: 'Chapter 2: Trial by Prism',
    before: [
      say(CAST.orin, 'Every apprentice starts here. Prove you can chain a cascade on purpose, not by accident.'),
      say(CAST.lyra, 'No pressure, then.'),
    ],
    after: [
      say(CAST.orin, "Good. Raw talent's one thing. Control is another. You've got both."),
      say(CAST.bram, "Wait — SHE'S the new prodigy? I've been training for two years!"),
    ],
  },
  3: {
    levelId: 3,
    title: 'Chapter 3: Whispers of the Hollow King',
    before: [
      say(CAST.orin, "Word from the border villages — their shard wells are running dry."),
      say(CAST.lyra, "Dry? Shards don't just fade on their own."),
      say(CAST.orin, "They do when someone drains them on purpose. Kaelen the Unmaker has returned."),
    ],
    after: [
      say(CAST.orin, "You handled that well. You'll need to — Kaelen doesn't wait for anyone to be ready."),
    ],
  },
  4: {
    levelId: 4,
    title: "Chapter 4: Bram's Wager",
    before: [
      say(CAST.bram, 'Alright, prodigy. Beat my best score and I’ll admit you’re the real deal.'),
      say(CAST.lyra, "And if I don't?"),
      say(CAST.bram, "Then I get bragging rights until we're both old and gray."),
    ],
    after: [
      say(CAST.bram, '...Okay, that was actually impressive. Truce?'),
      say(CAST.lyra, "Truce. Now help me figure out what Kaelen's really after."),
    ],
  },
  5: {
    levelId: 5,
    title: 'Chapter 5: The Fading Village',
    before: [
      say(CAST.lyra, "This well's almost empty. If we don't stabilize it now, it's gone for good."),
      say(CAST.bram, 'No pressure — again.'),
    ],
    after: [
      say(CAST.bram, "The well's holding! You just saved this whole village's magic."),
      say(CAST.orin, "News travels fast. The capital's asking for you by name now, Lyra."),
    ],
  },
  6: {
    levelId: 6,
    title: "Chapter 6: Captain Isolde's Call",
    before: [
      say(CAST.isolde, "Lyra Quinn. I've heard what you did at the border. I need that skill on the Shard Road."),
      say(CAST.lyra, "The Shard Road? Isn't that where—"),
      say(CAST.isolde, "Where Kaelen's constructs have been spotted. Yes."),
    ],
    after: [
      say(CAST.isolde, "You fight like someone with something to protect. I respect that."),
      say(CAST.lyra, "I'm just getting started, Captain."),
    ],
  },
  7: {
    levelId: 7,
    title: "Chapter 7: Kaelen's Ambush",
    before: [
      say(CAST.kaelen, 'So. The little Shardweaver everyone keeps whispering about.'),
      say(CAST.lyra, "Kaelen. You're smaller in person than the stories say."),
      say(CAST.kaelen, "Let's see if your cascades hold up against a real storm."),
    ],
    after: [
      say(CAST.kaelen, '...Impressive. Enjoy it. It won’t happen twice.'),
      say(CAST.orin, 'He retreated? That’s not like the stories tell it.'),
      say(CAST.lyra, 'No. It’s not.'),
    ],
  },
  8: {
    levelId: 8,
    title: 'Chapter 8: The Cracked Prism',
    before: [
      say(CAST.orin, 'Kaelen struck the Great Prism itself. If it shatters, every shard in the kingdom fails.'),
      say(CAST.lyra, 'Then I hold it together. Whatever that takes.'),
    ],
    after: [
      say(CAST.orin, "You bought us real time. Not every Shardweaver could channel a cascade that size."),
      say(CAST.isolde, "The Spire's exposed now. This is our chance."),
    ],
  },
  9: {
    levelId: 9,
    title: 'Chapter 9: March on the Hollow Spire',
    before: [
      say(CAST.isolde, "This is it. Once we cross this ridge, there's no quiet way in."),
      say(CAST.bram, "Good thing 'quiet' was never really our style."),
      say(CAST.lyra, "Let's finish this."),
    ],
    after: [
      say(CAST.isolde, "The gate's ours. Kaelen's waiting at the top. Go, Lyra — we've got your back."),
    ],
  },
  10: {
    levelId: 10,
    title: "Chapter 10: The Unmaker's End",
    before: [
      say(CAST.kaelen, 'You think matching colored stones makes you worthy of the Prism’s power?'),
      say(CAST.lyra, "No. Caring what happens to the people who depend on it does."),
      say(CAST.kaelen, "Then let's see whose conviction actually holds."),
    ],
    after: [
      say(CAST.kaelen, '...I’d forgotten what that felt like. Conviction, not just power.'),
      say(CAST.lyra, "It's not too late to remember, Kaelen."),
      say(CAST.orin, "You didn't just save the Prism today, Lyra. You may have saved him too."),
      say(CAST.lyra, 'The Cascade Kingdom is safe... for now.'),
    ],
  },
};

export function getChapter(levelId: number): StoryChapter | undefined {
  return STORY_CHAPTERS[levelId];
}
