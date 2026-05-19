export type DemoVouch = {
  name: string;
  area: string;
  image: string;
  context: string;
  take: string;
};

export type DemoProfile = {
  handle: string;
  name: string;
  city: string;
  tasteLine: string;
  vouches: DemoVouch[];
};

export const DEMO_PROFILES: DemoProfile[] = [
  {
    handle: "aditi",
    name: "Aditi Rao",
    city: "Bangalore",
    tasteLine: "Ask me for date spots, natural wine, and veg-safe group dinners.",
    vouches: [
      {
        name: "The Conservatory",
        area: "Shanti Nagar",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
        context: "Date night",
        take: "When the plan needs to feel considered — book the terrace."
      },
      {
        name: "Burma Burma",
        area: "Indiranagar",
        image: "https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=600&q=80",
        context: "Parents visiting",
        take: "Safe pick when veg and non-fussy both matter."
      },
      {
        name: "Muro",
        area: "Museum Road",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
        context: "Cocktails",
        take: "Second-date drinks without shouting over the bar."
      },
      {
        name: "Naru Noodle Bar",
        area: "Indiranagar",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        context: "Quiet dinner",
        take: "Ramen when you want the night to stay intentional."
      }
    ]
  },
  {
    handle: "rohan",
    name: "Rohan Mehta",
    city: "Mumbai",
    tasteLine: "Street food, late reservations, and where to take clients who eat.",
    vouches: [
      {
        name: "Trishna",
        area: "Fort",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80",
        context: "Client dinner",
        take: "Butter garlic crab — expense it without regret."
      },
      {
        name: "Britannia & Co.",
        area: "Ballard Estate",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",
        context: "Berry pulao",
        take: "Sunday only. Go hungry, leave early."
      },
      {
        name: "The Bombay Canteen",
        area: "Lower Parel",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
        context: "Group dinner",
        take: "Sharing plates when nobody wants to decide."
      },
      {
        name: "Seefah",
        area: "Kala Ghoda",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        context: "Spicy",
        take: "Pad kra pao if you trust your heat tolerance."
      }
    ]
  },
  {
    handle: "priya",
    name: "Priya Nair",
    city: "Delhi",
    tasteLine: "South Delhi cafes, book-ahead dinners, and actually-quiet lunches.",
    vouches: [
      {
        name: "Indian Accent",
        area: "Lodhi Estate",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
        context: "Occasion",
        take: "The meen moilee when someone says surprise me."
      },
      {
        name: "Olive Bar & Kitchen",
        area: "Mehrauli",
        image: "https://images.unsplash.com/photo-1550966841-3ee6ea85ffe8?auto=format&fit=crop&w=600&q=80",
        context: "Date night",
        take: "Courtyard in winter — request a corner table."
      },
      {
        name: "Fig & Maple",
        area: "Khan Market",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
        context: "Work lunch",
        take: "Salad that doesn't feel like punishment."
      },
      {
        name: "Karim's",
        area: "Jama Masjid",
        image: "https://images.unsplash.com/photo-1601050690597-df0565f70950?auto=format&fit=crop&w=600&q=80",
        context: "Late night",
        take: "Mutton korma after 11 — accept the chaos."
      }
    ]
  }
];

export const CONTEXT_MARQUEE = [
  "Date night",
  "Veg-safe",
  "Parents visiting",
  "Book ahead",
  "Group dinner",
  "Under ₹800",
  "Quiet",
  "Work lunch",
  "Cocktails",
  "Client dinner",
  "Late night",
  "No tourist traps"
];
