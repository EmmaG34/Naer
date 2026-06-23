export type PersonStatus = 'needs' | 'fading' | 'good'
export type PersonTier = 'close' | 'friend' | 'acq'

export interface Person {
  id: string
  name: string
  first: string
  initial: string
  relation: string
  status: PersonStatus
  pct: number
  last: string
  birthday: string
  met: string
  work: string
  orders: string
  tier: PersonTier
  badge: string
  pulled: string
  drafts: {
    warm: string
    playful: string
    short: string
    heartfelt: string
  }
}

export const PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    first: 'Priya',
    initial: 'P',
    relation: 'Best friend',
    status: 'needs',
    pct: 25,
    last: '3 weeks ago',
    birthday: 'Mar 15',
    met: 'University 2015',
    work: 'UX Designer at Google',
    orders: 'Oat flat white',
    tier: 'close',
    badge: 'FOLLOW-UP · DESIGN REVIEW',
    pulled: 'mentioned her new project last month',
    drafts: {
      warm: "Hey Priya! Been thinking about you — how's the new project going? Would love to catch up soon.",
      playful: "Priiiiya!! Still thinking about that design review chat. Miss your face! 😄",
      short: "Hey! Hope the new project's going well. Let's catch up?",
      heartfelt: "Priya, I've been thinking about you and wanted you to know I'm rooting for you on the new project. Let's talk soon.",
    },
  },
  {
    id: '2',
    name: 'Mum',
    first: 'Mum',
    initial: 'M',
    relation: 'Family',
    status: 'fading',
    pct: 55,
    last: '2 weeks ago',
    birthday: 'Jun 3',
    met: 'Birth!',
    work: 'Retired teacher',
    orders: 'Earl Grey tea',
    tier: 'close',
    badge: 'BIRTHDAY · SOON',
    pulled: 'called about the garden last time',
    drafts: {
      warm: "Hi Mum! Just thinking about you and wanted to say hi. How's the garden coming along?",
      playful: 'Muuuum! Missing you loads. Tell me all the garden gossip!',
      short: 'Hi Mum! Miss you. Call soon?',
      heartfelt: "Mum, I've been thinking about you a lot lately. You mean the world to me. How are you?",
    },
  },
  {
    id: '3',
    name: 'Sofia Rodriguez',
    first: 'Sofia',
    initial: 'S',
    relation: 'School mum',
    status: 'good',
    pct: 82,
    last: '4 days ago',
    birthday: 'Sep 22',
    met: 'School gates 2022',
    work: 'Part-time nurse',
    orders: 'Cappuccino',
    tier: 'friend',
    badge: 'CATCH UP',
    pulled: 'kids play date last week',
    drafts: {
      warm: "Hey Sofia! The kids had such a great time last week. We should do it again soon!",
      playful: 'Sofia!! Our kids are basically best friends now. A second playdate is mandatory 😂',
      short: 'Hey! Was so nice last week. Coffee sometime?',
      heartfelt: "Sofia, it's been so lovely getting to know you this year. The kids are lucky to have each other.",
    },
  },
  {
    id: '4',
    name: 'Josh Chen',
    first: 'Josh',
    initial: 'J',
    relation: 'Work friend',
    status: 'fading',
    pct: 40,
    last: '1 month ago',
    birthday: 'Jan 8',
    met: 'Work 2020',
    work: 'Product Manager',
    orders: 'Black coffee',
    tier: 'friend',
    badge: 'CHECK IN',
    pulled: 'mentioned house move',
    drafts: {
      warm: "Hey Josh! How's the house move going? Hope the chaos has settled down a bit!",
      playful: "Josh!! Did you survive the move?? I need a full debrief.",
      short: "Hey! How's the new place?",
      heartfelt: "Josh, moving is such a big deal — thinking of you and hoping you're getting settled in.",
    },
  },
  {
    id: '5',
    name: 'Rachel Kim',
    first: 'Rachel',
    initial: 'R',
    relation: 'Old friend',
    status: 'needs',
    pct: 15,
    last: '6 weeks ago',
    birthday: 'Nov 30',
    met: 'School 2008',
    work: 'Teacher',
    orders: 'Green tea',
    tier: 'acq',
    badge: 'RECONNECT',
    pulled: 'prefers SMS',
    drafts: {
      warm: "Rachel! It's been way too long. Thinking of you — how are things?",
      playful: "RACHEL!! Remember me?? 😂 Genuinely miss you, let's fix this.",
      short: 'Rachel, hey! Miss you. How are you?',
      heartfelt: "Rachel, you've been on my mind. Some friendships just stay with you — and you're one of them.",
    },
  },
]
