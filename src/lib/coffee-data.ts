export type FlavorNote = "chocolate" | "dried fruits" | "nuts" | "roasted" | "spices" | "fruity" | "sweet" | "floral";
export type DrinkStyle = "Straight up" | "With milk";
export type BrewMethod = "Espresso" | "Filter";

export interface Coffee {
  id: string;
  name: string;
  description: string;
  roast_level: string;
  flavor_notes: FlavorNote[];
  product_link: string;
  image_link: string;
  priority: number;
  milk_compatible: boolean;
  espresso_compatible: boolean;
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
    id: "1",
    name: "Amokka Crema",
    description: "A perfectly balanced espresso blend with rich chocolate and nutty notes.",
    roast_level: "medium-dark",
    flavor_notes: ["chocolate", "nuts", "sweet"],
    product_link: "https://amokka.com/products/amokka-crema",
    image_link: "https://amokka.com/cdn/shop/products/MicrosoftTeams-image_4_1000x.png?v=1663055777",
    priority: 1,
    milk_compatible: true,
    espresso_compatible: true
  },
  {
    id: "2",
    name: "Sombra Dark Roast",
    description: "Dark roast with unique fruity notes and bold spices.",
    roast_level: "dark",
    flavor_notes: ["roasted", "spices", "fruity"],
    product_link: "https://amokka.com/products/sombra-dark-roast",
    image_link: "https://amokka.com/cdn/shop/files/MicrosoftTeams-image_13_1000x.png?v=1707984201",
    priority: 2,
    milk_compatible: false,
    espresso_compatible: true
  },
  {
    id: "3",
    name: "Treehugger Organic Blend",
    description: "Organic blend with spicy and nutty characteristics.",
    roast_level: "medium",
    flavor_notes: ["chocolate", "nuts", "spices"],
    product_link: "https://amokka.com/products/treehugger-organic-blend",
    image_link: "https://amokka.com/cdn/shop/products/5551_amokkapouchbag_dot_1000x.png?v=1663150797",
    priority: 3,
    milk_compatible: true,
    espresso_compatible: false
  },
  {
    id: "4",
    name: "Ethiopia Haji Suleiman",
    description: "Light and floral with bright fruit notes.",
    roast_level: "light",
    flavor_notes: ["fruity", "sweet", "floral"],
    product_link: "https://amokka.com/products/ethiopia-haji-suleiman",
    image_link: "https://amokka.com/cdn/shop/files/MicrosoftTeams-image_5_1000x.png?v=1686912974",
    priority: 4,
    milk_compatible: true,
    espresso_compatible: false
  },
  {
    id: "5",
    name: "Peru",
    description: "Light roast with bright fruity notes and chocolate finish.",
    roast_level: "light",
    flavor_notes: ["nuts", "chocolate", "fruity"],
    product_link: "https://amokka.com/products/peru",
    image_link: "https://amokka.com/cdn/shop/products/5541_amokkapouchbag_dot_1000x.png?v=1663150715",
    priority: 7,
    milk_compatible: true,
    espresso_compatible: false
  },
  {
    id: "6",
    name: "Gorgona Dark Roast Italian Blend",
    description: "Bold and intense Italian-style blend with deep chocolate notes.",
    roast_level: "dark",
    flavor_notes: ["chocolate", "nuts", "roasted"],
    product_link: "https://amokka.com/products/gorgona-dark-roast-italian-blend",
    image_link: "https://amokka.com/cdn/shop/products/0101_amokkapouchbag_dot_1000x.png?v=1663150652",
    priority: 6,
    milk_compatible: false,
    espresso_compatible: true
  },
  {
    id: "7",
    name: "Portofino Dark Roast",
    description: "Rich dark roast with complex spices and chocolate undertones.",
    roast_level: "dark",
    flavor_notes: ["roasted", "spices", "chocolate"],
    product_link: "https://amokka.com/products/portofino-dark-roast",
    image_link: "https://amokka.com/cdn/shop/products/0111_amokkapouchbag_dot_1000x.png?v=1663150779",
    priority: 9,
    milk_compatible: false,
    espresso_compatible: true
  },
  {
    id: "8",
    name: "City Roast",
    description: "Medium roast with balanced sweetness and nutty profile.",
    roast_level: "medium",
    flavor_notes: ["nuts", "chocolate", "sweet"],
    product_link: "https://amokka.com/products/city-roast",
    image_link: "https://amokka.com/cdn/shop/products/5930_amokkapouchbag_dot_1000x.png?v=1663150557",
    priority: 8,
    milk_compatible: true,
    espresso_compatible: false
  },
  {
    id: "9",
    name: "Indonesia Mandheling",
    description: "Complex profile with dried fruits and warm spices.",
    roast_level: "medium-dark",
    flavor_notes: ["dried fruits", "spices", "sweet"],
    product_link: "https://amokka.com/products/indonesia-mandheling",
    image_link: "https://amokka.com/cdn/shop/products/5556_amokkapouchbag_dot_1000x.png?v=1680084499",
    priority: 5,
    milk_compatible: true,
    espresso_compatible: true
  }
];
