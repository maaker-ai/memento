import { TFunction } from "i18next";
import { Quote } from "../types";

export const QUOTE_COUNT = 99;
export const QUOTE_IDS = Array.from({ length: QUOTE_COUNT }, (_, i) => i);

/**
 * Original English texts for migration purposes (matching old favoriteQuotes strings to new ids).
 * This map is only used during the one-time migration from text-based to id-based favorites.
 */
export const QUOTE_TEXTS_FOR_MIGRATION: Record<number, string> = {
  0: "You could leave life right now. Let that determine what you do and say and think.",
  1: "The happiness of your life depends upon the quality of your thoughts.",
  2: "Waste no more time arguing about what a good man should be. Be one.",
  3: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
  4: "When you arise in the morning, think of what a precious privilege it is to be alive.",
  5: "The soul becomes dyed with the color of its thoughts.",
  6: "It is not death that a man should fear, but he should fear never beginning to live.",
  7: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.",
  8: "The best revenge is not to be like your enemy.",
  9: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
  10: "How much more grievous are the consequences of anger than the causes of it.",
  11: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
  12: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
  13: "The impediment to action advances action. What stands in the way becomes the way.",
  14: "You have power over your mind — not outside events. Realize this, and you will find strength.",
  15: "Our life is what our thoughts make it.",
  16: "If it is not right do not do it; if it is not true do not say it.",
  17: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
  18: "Begin each day by telling yourself: today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.",
  19: "Loss is nothing else but change, and change is nature's delight.",
  20: "It is not that we have a short time to live, but that we waste a great deal of it.",
  21: "We suffer more often in imagination than in reality.",
  22: "Luck is what happens when preparation meets opportunity.",
  23: "Difficulties strengthen the mind, as labor does the body.",
  24: "Begin at once to live, and count each separate day as a separate life.",
  25: "As is a tale, so is life: not how long it is, but how good it is, is what matters.",
  26: "No person has the power to have everything they want, but it is in their power not to want what they don't have.",
  27: "True happiness is to enjoy the present, without anxious dependence upon the future.",
  28: "He who is brave is free.",
  29: "If a man knows not to which port he sails, no wind is favorable.",
  30: "The whole future lies in uncertainty: live immediately.",
  31: "While we wait for life, life passes.",
  32: "It is the power of the mind to be unconquerable.",
  33: "Sometimes even to live is an act of courage.",
  34: "We are more often frightened than hurt; and we suffer more from imagination than from reality.",
  35: "The greatest obstacle to living is expectancy, which hangs upon tomorrow and loses today.",
  36: "Life is long if you know how to use it.",
  37: "Hang on to your youthful enthusiasms — you'll be able to use them better when you're older.",
  38: "Every new beginning comes from some other beginning's end.",
  39: "Associate with people who are likely to improve you.",
  40: "It's not what happens to you, but how you react to it that matters.",
  41: "First say to yourself what you would be; and then do what you have to do.",
  42: "Man is not worried by real problems so much as by his imagined anxieties about real problems.",
  43: "No great thing is created suddenly.",
  44: "Make the best use of what is in your power, and take the rest as it happens.",
  45: "Wealth consists not in having great possessions, but in having few wants.",
  46: "He who laughs at himself never runs out of things to laugh at.",
  47: "Don't explain your philosophy. Embody it.",
  48: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.",
  49: "Only the educated are free.",
  50: "Circumstances don't make the man, they only reveal him to himself.",
  51: "If you want to improve, be content to be thought foolish and stupid.",
  52: "Other people's views and troubles can be contagious. Don't sabotage yourself by unwittingly adopting negative, unproductive attitudes.",
  53: "Know, first, who you are, and then adorn yourself accordingly.",
  54: "Seek not the good in external things; seek it in yourselves.",
  55: "The key is to keep company only with people who uplift you, whose presence calls forth your best.",
  56: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.",
  57: "Any person capable of angering you becomes your master.",
  58: "Caretake this moment. Immerse yourself in its particulars.",
  59: "We have two ears and one mouth so that we can listen twice as much as we speak.",
  60: "I begin to speak only when I'm certain what I'll say isn't better left unsaid.",
  61: "An angry man opens his mouth and shuts his eyes.",
  62: "We have two ears and one mouth, so we should listen more than we say.",
  63: "Man conquers the world by conquering himself.",
  64: "He has the most who is content with the least.",
  65: "If you accomplish something good with hard work, the labor passes quickly, but the good endures.",
  66: "We begin to lose our hesitation to do immoral things when we lose our hesitation to speak of them.",
  67: "The universe itself is god and the universal outpouring of its soul.",
  68: "Treat your inferiors as you would be treated by your betters.",
  69: "Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.",
  70: "Do not act as if you had ten thousand years to live.",
  71: "The art of living is more like wrestling than dancing.",
  72: "Reject your sense of injury and the injury itself disappears.",
  73: "Receive without conceit, release without struggle.",
  74: "Nothing is more honorable than a grateful heart.",
  75: "A gem cannot be polished without friction, nor a man perfected without trials.",
  76: "Religion is regarded by the common people as true, by the wise as false, and by rulers as useful.",
  77: "Throw me to the wolves and I will return leading the pack.",
  78: "It does not matter how slowly you go as long as you do not stop.",
  79: "You are a little soul carrying about a corpse.",
  80: "People are not disturbed by things, but by the views they take of them.",
  81: "Attach yourself to what is spiritually superior, regardless of what other people think or do.",
  82: "No man is free who is not master of himself.",
  83: "If you wish to be a writer, write.",
  84: "No man ever steps in the same river twice, for it's not the same river and he's not the same man.",
  85: "The only constant in life is change.",
  86: "Day by day, what you choose, what you think, and what you do is who you become.",
  87: "Character is destiny.",
  88: "Big results require big ambitions.",
  89: "The life given us by nature is short, but the memory of a life well spent is eternal.",
  90: "A room without books is like a body without a soul.",
  91: "Gratitude is not only the greatest of virtues, but the parent of all the others.",
  92: "What we achieve inwardly will change outer reality.",
  93: "The mind is not a vessel to be filled but a fire to be kindled.",
  94: "Memento mori — remember that you will die.",
  95: "Amor fati — love your fate.",
  96: "The best time to plant a tree was twenty years ago. The second best time is now.",
  97: "Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested.",
  98: "Until we have begun to go without them, we fail to realize how unnecessary many things are.",
};

export function getQuoteById(id: number, t: TFunction): Quote {
  return {
    id,
    text: t(`quotes.${id}.text`),
    author: t(`quotes.${id}.author`),
  };
}

export function getDailyQuote(t: TFunction): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const id = dayOfYear % QUOTE_COUNT;
  return getQuoteById(id, t);
}

export function getRandomQuote(t: TFunction): Quote {
  const id = Math.floor(Math.random() * QUOTE_COUNT);
  return getQuoteById(id, t);
}
