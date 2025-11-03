// Enhanced Story-Based Video Prompts
// These prompts are designed to reveal personality, not just provide answers

export const VIDEO_PROMPTS = {
  // Category: First Impression
  intro: [
    {
      text: "Introduce yourself like you're meeting a friend of a friend at a party",
      category: "intro",
      tip: "Be natural and conversational!"
    },
    {
      text: "Give me a 30-second tour of your happy place",
      category: "intro",
      tip: "Show us what makes you smile!"
    },
    {
      text: "Describe yourself using only song titles or movie quotes",
      category: "intro",
      tip: "Get creative!"
    }
  ],

  // Category: Personality
  personality: [
    {
      text: "Show me your happy dance or victory celebration",
      category: "personality",
      tip: "Don't be shy - let loose!"
    },
    {
      text: "Tell me about the last time you laughed until you cried",
      category: "personality",
      tip: "We want to see that smile!"
    },
    {
      text: "What's your most unpopular opinion? Defend it passionately!",
      category: "personality",
      tip: "Bonus points for conviction!"
    },
    {
      text: "If you could have dinner with anyone (dead or alive), who and why?",
      category: "personality",
      tip: "Show us what you value!"
    },
    {
      text: "What's something you're unreasonably competitive about?",
      category: "personality",
      tip: "Everyone has that ONE thing..."
    }
  ],

  // Category: Lifestyle & Values
  lifestyle: [
    {
      text: "Walk me through your perfect lazy Sunday",
      category: "lifestyle",
      tip: "Paint us a picture!"
    },
    {
      text: "What's the best meal you've ever had? Take us there!",
      category: "lifestyle",
      tip: "Make us hungry!"
    },
    {
      text: "Show me something in your space that tells a story about you",
      category: "lifestyle",
      tip: "Objects can speak volumes!"
    },
    {
      text: "What cause or issue are you most passionate about?",
      category: "lifestyle",
      tip: "What matters to you?"
    },
    {
      text: "Describe your dream vacation - where and with whom?",
      category: "lifestyle",
      tip: "Adventure or relaxation?"
    }
  ],

  // Category: Fun & Creative
  fun: [
    {
      text: "Teach me something you're good at in 60 seconds",
      category: "fun",
      tip: "Cooking? Gaming? Juggling?"
    },
    {
      text: "Do your best impression of someone (celebrity, friend, anyone!)",
      category: "fun",
      tip: "Comedy gold!"
    },
    {
      text: "If you were a character in a sitcom, what would be your catchphrase?",
      category: "fun",
      tip: "Extra points for delivery!"
    },
    {
      text: "Show me your go-to karaoke song (you don't have to sing... but bonus if you do!)",
      category: "fun",
      tip: "Let's see that confidence!"
    },
    {
      text: "What's a hidden talent or party trick you have?",
      category: "fun",
      tip: "Everyone's got one!"
    }
  ],

  // Category: Connection & Dating
  connection: [
    {
      text: "Describe your ideal first date - be specific!",
      category: "connection",
      tip: "Coffee? Adventure? Museum?"
    },
    {
      text: "What's a green flag you look for in someone?",
      category: "connection",
      tip: "What attracts you?"
    },
    {
      text: "What's something that's a dealbreaker for you?",
      category: "connection",
      tip: "Honesty is attractive!"
    },
    {
      text: "How do you know when you're comfortable with someone?",
      category: "connection",
      tip: "Tell us what makes you open up!"
    },
    {
      text: "What's your love language? Show, don't just tell!",
      category: "connection",
      tip: "Acts of service? Quality time?"
    }
  ]
};

// Get random prompts for profile creation (5 prompts, one from each category)
export function getProfilePrompts() {
  const categories = ['intro', 'personality', 'lifestyle', 'fun', 'connection'];
  const selectedPrompts = [];

  categories.forEach(category => {
    const categoryPrompts = VIDEO_PROMPTS[category];
    const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
    selectedPrompts.push(randomPrompt);
  });

  return selectedPrompts;
}

// Get a single random prompt (for video messages)
export function getRandomPrompt(category = null) {
  if (category && VIDEO_PROMPTS[category]) {
    const prompts = VIDEO_PROMPTS[category];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  // Random from all categories
  const allCategories = Object.keys(VIDEO_PROMPTS);
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
  return getRandomPrompt(randomCategory);
}

// Get verification prompt (for live verification)
export const VERIFICATION_PROMPTS = [
  "Show me a peace sign and say 'I'm real!'",
  "Give a thumbs up and say today's date",
  "Wave at the camera and smile",
  "Show me three fingers and say your name",
  "Point at the camera and say 'VideoConnect is awesome!'",
  "Make a heart shape with your hands",
  "Touch your nose and wink at the camera"
];

export function getVerificationPrompt() {
  return VERIFICATION_PROMPTS[Math.floor(Math.random() * VERIFICATION_PROMPTS.length)];
}
