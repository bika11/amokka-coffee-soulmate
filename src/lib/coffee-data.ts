
export type FlavorNote = "chocolate" | "dried fruits" | "nuts" | "roasted" | "spices" | "fruity" | "sweet" | "floral";
export type DrinkStyle = "Straight up" | "With milk";
export type BrewMethod = "Espresso" | "Filter";

export interface Coffee {
  name: string;
  description: string;
  roastLevel: number;
  flavorNotes: FlavorNote[];
  url: string;
  imageUrl: string;
  priority: number;
  milk_compatible?: boolean;
  colorScheme?: {
    from: string;
    to: string;
  };
}

export const FLAVOR_NOTES: FlavorNote[] = [
  "chocolate",
  "dried fruits",
  "nuts",
  "roasted",
  "spices",
  "fruity",
  "sweet",
  "floral"
];

export const COFFEES: Coffee[] = [
  {
    name: "Amokka Crema",
    description: "A perfectly balanced espresso blend with rich chocolate and nutty notes.",
    roastLevel: 4,
    flavorNotes: ["chocolate", "nuts", "sweet"],
    url: "https://amokka.com/products/amokka-crema",
    imageUrl: "/coffee-images/amokka-crema.png",
    priority: 1,
    colorScheme: {
      from: "amber-500",
      to: "yellow-500"
    }
  },
  {
    name: "Sombra Dark Roast",
    description: "Dark roast with unique fruity notes and bold spices.",
    roastLevel: 6,
    flavorNotes: ["roasted", "spices", "fruity"],
    url: "https://amokka.com/products/sombra-dark-roast",
    imageUrl: "/coffee-images/sombra-dark-roast.png",
    priority: 2,
    colorScheme: {
      from: "purple-600",
      to: "indigo-600"
    }
  },
  {
    name: "Treehugger Organic Blend",
    description: "Organic blend with spicy and nutty characteristics.",
    roastLevel: 3,
    flavorNotes: ["chocolate", "nuts", "spices"],
    url: "https://amokka.com/products/treehugger-organic-blend",
    imageUrl: "/coffee-images/treehugger-organic-blend.png",
    priority: 3,
    colorScheme: {
      from: "emerald-500",
      to: "green-600"
    }
  },
  {
    name: "Ethiopia Haji Suleiman",
    description: "Light and floral with bright fruit notes.",
    roastLevel: 2,
    flavorNotes: ["fruity", "sweet", "floral"],
    url: "https://amokka.com/products/ethiopia-haji-suleiman",
    imageUrl: "/coffee-images/ethiopia-haji-suleiman.png",
    priority: 4,
    colorScheme: {
      from: "rose-500",
      to: "pink-600"
    }
  },
  {
    name: "Peru",
    description: "Light roast with bright fruity notes and chocolate finish.",
    roastLevel: 1,
    flavorNotes: ["nuts", "chocolate", "fruity"],
    url: "https://amokka.com/products/peru",
    imageUrl: "/coffee-images/peru.png",
    priority: 7,
    colorScheme: {
      from: "orange-500",
      to: "amber-600"
    }
  },
  {
    name: "Gorgona Dark Roast Italian Blend",
    description: "Bold and intense Italian-style blend with deep chocolate notes.",
    roastLevel: 6,
    flavorNotes: ["chocolate", "nuts", "roasted"],
    url: "https://amokka.com/products/gorgona-dark-roast-italian-blend",
    imageUrl: "/coffee-images/gorgona-dark-roast-italian-blend.png",
    priority: 6,
    colorScheme: {
      from: "stone-700",
      to: "stone-900"
    }
  },
  {
    name: "Portofino Dark Roast",
    description: "Rich dark roast with complex spices and chocolate undertones.",
    roastLevel: 5,
    flavorNotes: ["roasted", "spices", "chocolate"],
    url: "https://amokka.com/products/portofino-dark-roast",
    imageUrl: "/coffee-images/portofino-dark-roast.png",
    priority: 9,
    colorScheme: {
      from: "red-600",
      to: "red-800"
    }
  },
  {
    name: "City Roast",
    description: "Medium roast with balanced sweetness and nutty profile.",
    roastLevel: 4,
    flavorNotes: ["nuts", "chocolate", "sweet"],
    url: "https://amokka.com/products/city-roast",
    imageUrl: "/coffee-images/city-roast.png",
    priority: 8,
    colorScheme: {
      from: "amber-600",
      to: "brown-700"
    }
  },
  {
    name: "Indonesia Mandheling",
    description: "Complex profile with dried fruits and warm spices.",
    roastLevel: 4,
    flavorNotes: ["dried fruits", "spices", "sweet"],
    url: "https://amokka.com/products/indonesia-mandheling",
    imageUrl: "/coffee-images/indonesia-mandheling.png",
    priority: 5,
    colorScheme: {
      from: "violet-500",
      to: "purple-700"
    }
  }
];
