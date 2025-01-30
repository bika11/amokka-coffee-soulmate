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
    imageUrl: "https://amokka.com/cdn/shop/products/MicrosoftTeams-image_4_1000x.png?v=1663055777",
    priority: 1
  },
  {
    name: "Sombra Dark Roast",
    description: "Dark roast with unique fruity notes and bold spices.",
    roastLevel: 6,
    flavorNotes: ["roasted", "spices", "fruity"],
    url: "https://amokka.com/products/sombra-dark-roast",
    imageUrl: "https://amokka.com/cdn/shop/files/MicrosoftTeams-image_13_1000x.png?v=1707984201",
    priority: 2
  },
  {
    name: "Treehugger Organic Blend",
    description: "Organic blend with spicy and nutty characteristics.",
    roastLevel: 3,
    flavorNotes: ["chocolate", "nuts", "spices"],
    url: "https://amokka.com/products/treehugger-organic-blend",
    imageUrl: "https://amokka.com/cdn/shop/products/5551_amokkapouchbag_dot_1000x.png?v=1663150797",
    priority: 3
  },
  {
    name: "Ethiopia Haji Suleiman",
    description: "Light and floral with bright fruit notes.",
    roastLevel: 2,
    flavorNotes: ["fruity", "sweet", "floral"],
    url: "https://amokka.com/products/ethiopia-haji-suleiman",
    imageUrl: "https://amokka.com/cdn/shop/files/MicrosoftTeams-image_5_1000x.png?v=1686912974",
    priority: 4
  },
  {
    name: "Peru",
    description: "Light roast with bright fruity notes and chocolate finish.",
    roastLevel: 1,
    flavorNotes: ["nuts", "chocolate", "fruity"],
    url: "https://amokka.com/products/peru",
    imageUrl: "https://amokka.com/cdn/shop/products/5541_amokkapouchbag_dot_1000x.png?v=1663150715",
    priority: 7
  },
  {
    name: "Gorgona Dark Roast Italian Blend",
    description: "Bold and intense Italian-style blend with deep chocolate notes.",
    roastLevel: 6,
    flavorNotes: ["chocolate", "nuts", "roasted"],
    url: "https://amokka.com/products/gorgona-dark-roast-italian-blend",
    imageUrl: "https://amokka.com/cdn/shop/products/0101_amokkapouchbag_dot_1000x.png?v=1663150652",
    priority: 6
  },
  {
    name: "Portofino Dark Roast",
    description: "Rich dark roast with complex spices and chocolate undertones.",
    roastLevel: 5,
    flavorNotes: ["roasted", "spices", "chocolate"],
    url: "https://amokka.com/products/portofino-dark-roast",
    imageUrl: "https://amokka.com/cdn/shop/products/0111_amokkapouchbag_dot_1000x.png?v=1663150779",
    priority: 9
  },
  {
    name: "City Roast",
    description: "Medium roast with balanced sweetness and nutty profile.",
    roastLevel: 4,
    flavorNotes: ["nuts", "chocolate", "sweet"],
    url: "https://amokka.com/products/city-roast",
    imageUrl: "https://amokka.com/cdn/shop/products/5930_amokkapouchbag_dot_1000x.png?v=1663150557",
    priority: 8
  },
  {
    name: "Indonesia Mandheling",
    description: "Complex profile with dried fruits and warm spices.",
    roastLevel: 4,
    flavorNotes: ["dried fruits", "spices", "sweet"],
    url: "https://amokka.com/products/indonesia-mandheling",
    imageUrl: "https://amokka.com/cdn/shop/products/5556_amokkapouchbag_dot_1000x.png?v=1680084499",
    priority: 5
  }
];
