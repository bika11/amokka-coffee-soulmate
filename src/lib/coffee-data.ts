export type FlavorNote = 'chocolate' | 'dried fruits' | 'nuts' | 'roasted' | 'spices' | 'fruity' | 'sweet' | 'floral';
export type BrewMethod = 'Espresso' | 'Filter';
export type DrinkStyle = 'Straight up' | 'With milk';

export interface Coffee {
  id: string;
  name: string;
  url: string;
  roastLevel: number;
  flavorNotes: FlavorNote[];
  description: string;
}

export const COFFEES: Coffee[] = [
  {
    id: 'amokka-crema',
    name: 'Amokka Crema',
    url: 'https://amokka.com/products/amokka-crema',
    roastLevel: 4,
    flavorNotes: ['chocolate', 'nuts', 'sweet'],
    description: 'A balanced blend with rich chocolate notes and nutty sweetness'
  },
  {
    id: 'gorgona-dark',
    name: 'Gorgona Dark Roast Italian Blend',
    url: 'https://amokka.com/products/gorgona-dark-roast-italian-blend',
    roastLevel: 6,
    flavorNotes: ['chocolate', 'nuts', 'roasted'],
    description: 'Bold Italian roast with intense chocolate and roasted notes'
  },
  {
    id: 'portofino-dark',
    name: 'Portofino Dark Roast',
    url: 'https://amokka.com/products/portofino-dark-roast',
    roastLevel: 5,
    flavorNotes: ['roasted', 'spices', 'chocolate'],
    description: 'Rich dark roast with spicy undertones and chocolate finish'
  },
  {
    id: 'city-roast',
    name: 'City Roast',
    url: 'https://amokka.com/products/city-roast',
    roastLevel: 4,
    flavorNotes: ['nuts', 'chocolate', 'sweet'],
    description: 'Medium roast with balanced sweetness and nutty profile'
  },
  {
    id: 'treehugger',
    name: 'Treehugger Organic Blend',
    url: 'https://amokka.com/products/treehugger-organic-blend',
    roastLevel: 3,
    flavorNotes: ['chocolate', 'nuts', 'spices'],
    description: 'Organic blend with subtle spices and chocolate notes'
  },
  {
    id: 'sombra-dark',
    name: 'Sombra Dark Roast',
    url: 'https://amokka.com/products/sombra-dark-roast',
    roastLevel: 6,
    flavorNotes: ['roasted', 'spices', 'fruity'],
    description: 'Bold dark roast with unique fruity undertones'
  },
  {
    id: 'indonesia-mandheling',
    name: 'Indonesia Mandheling',
    url: 'https://amokka.com/products/indonesia-mandheling',
    roastLevel: 4,
    flavorNotes: ['dried fruits', 'spices', 'sweet'],
    description: 'Complex medium roast with dried fruit sweetness'
  },
  {
    id: 'peru',
    name: 'Peru',
    url: 'https://amokka.com/products/peru',
    roastLevel: 1,
    flavorNotes: ['nuts', 'chocolate', 'fruity'],
    description: 'Light roast with bright fruity notes and nutty finish'
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia Haji Suleiman',
    url: 'https://amokka.com/products/ethiopia-haji-suleiman',
    roastLevel: 2,
    flavorNotes: ['fruity', 'sweet', 'floral'],
    description: 'Light roast with floral aroma and sweet fruit notes'
  },
  {
    id: 'amokka-decaf',
    name: 'Amokka Decaf',
    url: 'https://amokka.com/products/amokka-decaf',
    roastLevel: 3,
    flavorNotes: ['nuts', 'chocolate', 'sweet'],
    description: 'Decaf with classic chocolate and nut profile'
  }
];

export const FLAVOR_NOTES: FlavorNote[] = ['chocolate', 'dried fruits', 'nuts', 'roasted', 'spices', 'fruity', 'sweet', 'floral'];