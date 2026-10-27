/**
 * House of Hackney Curated Flagship Collections & Alias Resolution
 * 
 * Provides rich, complete product definitions for iconic British heritage
 * creations and maps friendly pattern slugs to backend catalogue records.
 */

export const CURATED_PRODUCTS = [
  {
    _id: "hoh_fav_plantasia_sage",
    id: "hoh_fav_plantasia_sage",
    name: "Plantasia Wallpaper",
    title: "Plantasia Wallpaper",
    slug: "plantasia-wallpaper-sage",
    aliases: [
      "plantasia",
      "plantasia_wallpaper",
      "plantasia-wallpaper",
      "plantasia-wallpaper-sage",
      "plantasia-sage",
    ],
    productType: "WALLPAPER",
    category: {
      _id: "cat_wallpaper",
      name: "Wallpaper",
      slug: "wallpaper",
    },
    price: 200,
    pricing: {
      basePrice: 200,
      sellingPrice: 200,
      currency: "GBP",
      priceUnit: "roll",
      sample: {
        available: true,
        price: 6,
        currency: "GBP",
      },
    },
    inventory: {
      inStock: true,
      availableQuantity: 48,
      status: "IN_STOCK",
    },
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
    thumbnail: {
      url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
      secureUrl:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
    },
    images: [
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-1",
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-2",
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-3",
    ],
    media: {
      images: [
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-1",
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-2",
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-3",
      ],
      gallery: [
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
          altText: "Plantasia Wallpaper - Sage Botanical Landscape",
        },
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-1",
          altText: "Plantasia Wallpaper Pattern Repeat",
        },
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-2",
          altText: "Plantasia Wallpaper Room Scene",
        },
      ],
    },
    colours: [
      {
        _id: "col_plant_sage",
        name: "Sage",
        slug: "sage",
        colorHex: "#a4b29a",
        hex: "#a4b29a",
      },
      {
        _id: "col_plant_indigo",
        name: "Indigo",
        slug: "indigo",
        colorHex: "#2b3b4f",
        hex: "#2b3b4f",
      },
      {
        _id: "col_plant_sienna",
        name: "Sienna",
        slug: "sienna",
        colorHex: "#8c563e",
        hex: "#8c563e",
      },
      {
        _id: "col_plant_prism",
        name: "Prism",
        slug: "prism",
        colorHex: "#e7ded2",
        hex: "#e7ded2",
      },
    ],
    variants: [
      {
        _id: "var_plant_sage",
        id: "var_plant_sage",
        title: "Plantasia Wallpaper - Sage",
        sku: "WALL-PLANT-SAGE",
        price: 200,
        currency: "GBP",
        isDefault: true,
        attributes: [{ name: "Colour", value: "Sage" }],
        inventory: { inStock: true, availableQuantity: 30 },
      },
      {
        _id: "var_plant_indigo",
        id: "var_plant_indigo",
        title: "Plantasia Wallpaper - Indigo",
        sku: "WALL-PLANT-INDIGO",
        price: 200,
        currency: "GBP",
        isDefault: false,
        attributes: [{ name: "Colour", value: "Indigo" }],
        inventory: { inStock: true, availableQuantity: 24 },
      },
      {
        _id: "var_plant_sienna",
        id: "var_plant_sienna",
        title: "Plantasia Wallpaper - Sienna",
        sku: "WALL-PLANT-SIENNA",
        price: 200,
        currency: "GBP",
        isDefault: false,
        attributes: [{ name: "Colour", value: "Sienna" }],
        inventory: { inStock: true, availableQuantity: 18 },
      },
    ],
    description:
      "An iconic House of Hackney original, PLANTASIA is a lyrical homage to the majesty of ancient English trees. Painted with painterly strokes inspired by vintage botanical landscape murals and Japanese woodblock craft, this bestselling design invites the restorative presence of nature into your interior.",
    shortDescription:
      "A lyrical homage to ancient English trees, hand-painted and printed in Britain on sustainable FSC-certified paper.",
    specifications: {
      composition: "FSC-certified non-woven paper",
      width: { value: 180, unit: "cm" },
      verticalRepeat: { value: 300, unit: "cm" },
      horizontalRepeat: { value: 180, unit: "cm" },
      countryOfOrigin: "United Kingdom",
      suitability: ["Residential Living Rooms", "Bedrooms", "Dining Halls", "Hospitality"],
      careInstructions: [
        "Wipeable with soft damp cloth",
        "Paste the wall application",
        "Strippable wallcovering",
      ],
      certifications: ["FSC Certified", "Eco-friendly non-toxic mineral inks", "PVC-Free"],
    },
  },
  {
    _id: "hoh_fav_hollyhocks_spring",
    id: "hoh_fav_hollyhocks_spring",
    name: "Hollyhocks Wallpaper",
    title: "Hollyhocks Wallpaper",
    slug: "hollyhocks-wallpaper-spring",
    aliases: [
      "hollyhocks",
      "hollyhocks_wallpaper",
      "hollyhocks-wallpaper",
      "hollyhocks-wallpaper-spring",
      "hollyhocks-spring",
    ],
    productType: "WALLPAPER",
    category: {
      _id: "cat_wallpaper",
      name: "Wallpaper",
      slug: "wallpaper",
    },
    price: 200,
    pricing: {
      basePrice: 200,
      sellingPrice: 200,
      currency: "GBP",
      priceUnit: "roll",
      sample: {
        available: true,
        price: 6,
        currency: "GBP",
      },
    },
    inventory: {
      inStock: true,
      availableQuantity: 42,
      status: "IN_STOCK",
    },
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
    thumbnail: {
      url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
      secureUrl:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
    },
    images: [
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-1",
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-2",
    ],
    media: {
      images: [
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-1",
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-2",
      ],
      gallery: [
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
          altText: "Hollyhocks Wallpaper - Spring Bloom Meadow",
        },
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-1",
          altText: "Hollyhocks Wallpaper Pattern Detail",
        },
      ],
    },
    colours: [
      {
        _id: "col_holly_spring",
        name: "Spring",
        slug: "spring",
        colorHex: "#c8d6ba",
        hex: "#c8d6ba",
      },
      {
        _id: "col_holly_summer",
        name: "Summer",
        slug: "summer",
        colorHex: "#f0d5a8",
        hex: "#f0d5a8",
      },
      {
        _id: "col_holly_autumn",
        name: "Autumn",
        slug: "autumn",
        colorHex: "#b46e4b",
        hex: "#b46e4b",
      },
      {
        _id: "col_holly_winter",
        name: "Winter",
        slug: "winter",
        colorHex: "#3a4a3f",
        hex: "#3a4a3f",
      },
    ],
    variants: [
      {
        _id: "var_holly_spring",
        id: "var_holly_spring",
        title: "Hollyhocks Wallpaper - Spring",
        sku: "WALL-HOLLY-SPRING",
        price: 200,
        currency: "GBP",
        isDefault: true,
        attributes: [{ name: "Colour", value: "Spring" }],
        inventory: { inStock: true, availableQuantity: 34 },
      },
      {
        _id: "var_holly_summer",
        id: "var_holly_summer",
        title: "Hollyhocks Wallpaper - Summer",
        sku: "WALL-HOLLY-SUMMER",
        price: 200,
        currency: "GBP",
        isDefault: false,
        attributes: [{ name: "Colour", value: "Summer" }],
        inventory: { inStock: true, availableQuantity: 20 },
      },
    ],
    description:
      "A quintessential British cottage garden captured on paper. Painted in watercolor with punk-inflected maximalism, HOLLYHOCKS showcases majestic blooms bursting in full blossom, handcrafted by master English printmakers in Loughborough.",
    shortDescription:
      "British cottage garden florals rendered in watercolor with punk-infused maximalism.",
    specifications: {
      composition: "FSC-certified non-woven paper",
      width: { value: 180, unit: "cm" },
      verticalRepeat: { value: 300, unit: "cm" },
      countryOfOrigin: "United Kingdom",
      suitability: ["Bedrooms", "Salons", "Cloakrooms"],
      careInstructions: [
        "Wipeable with soft damp cloth",
        "Paste the wall application",
      ],
      certifications: ["FSC Certified", "Eco-friendly non-toxic mineral inks"],
    },
  },
  {
    _id: "hoh_fav_wild_card_butterscotch",
    id: "hoh_fav_wild_card_butterscotch",
    name: "Wild Card Wallpaper",
    title: "Wild Card Wallpaper",
    slug: "wild-card-wallpaper-butterscotch",
    aliases: [
      "wild-card",
      "wild_card",
      "wild-card-wallpaper",
      "wild_card_wallpaper",
      "wild-card-wallpaper-butterscotch",
    ],
    productType: "WALLPAPER",
    category: {
      _id: "cat_wallpaper",
      name: "Wallpaper",
      slug: "wallpaper",
    },
    price: 200,
    pricing: {
      basePrice: 200,
      sellingPrice: 200,
      currency: "GBP",
      priceUnit: "roll",
      sample: {
        available: true,
        price: 6,
        currency: "GBP",
      },
    },
    inventory: {
      inStock: true,
      availableQuantity: 36,
      status: "IN_STOCK",
    },
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
    thumbnail: {
      url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
      secureUrl:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
    },
    images: [
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
    ],
    media: {
      images: [
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
      ],
      gallery: [
        {
          url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
          altText: "Wild Card Wallpaper - Butterscotch Leopard Pattern",
        },
      ],
    },
    colours: [
      {
        _id: "col_wild_butterscotch",
        name: "Butterscotch",
        slug: "butterscotch",
        colorHex: "#d89c4d",
        hex: "#d89c4d",
      },
    ],
    variants: [
      {
        _id: "var_wild_butterscotch",
        id: "var_wild_butterscotch",
        title: "Wild Card Wallpaper - Butterscotch",
        sku: "WALL-WILD-BUTTER",
        price: 200,
        currency: "GBP",
        isDefault: true,
        attributes: [{ name: "Colour", value: "Butterscotch" }],
        inventory: { inStock: true, availableQuantity: 36 },
      },
    ],
    description:
      "A subversive take on classic leopard print, WILD CARD in Butterscotch redefines animal motifs with British heritage sophistication. Handcrafted in England on smooth matte eco paper.",
    shortDescription:
      "A subversive take on classic leopard print with British heritage sophistication.",
    specifications: {
      composition: "FSC-certified non-woven paper",
      width: { value: 180, unit: "cm" },
      verticalRepeat: { value: 300, unit: "cm" },
      countryOfOrigin: "United Kingdom",
    },
  },
];

/**
 * Mapping from friendly or composite pattern slugs to actual backend product identifiers
 */
export const SLUG_TO_BACKEND_MAP = {
  // Artemis
  "artemis-wallpaper-blush": "artemis",
  "artemis-wallpaper": "artemis",
  "artemis_wallpaper": "artemis",
  "artemis": "artemis",

  // Zeus Wallpaper
  "zeus-wallpaper-eau-de-nil": "zeus_wallpaper",
  "zeus-wallpaper": "zeus_wallpaper",
  "zeus_wallpaper": "zeus_wallpaper",
  "zeus": "zeus_wallpaper",

  // Babylon Wallpaper
  "babylon-wallpaper-dove-willow": "babylon_wallpaper_dove",
  "babylon-wallpaper-dove": "babylon_wallpaper_dove",
  "babylon_wallpaper_dove": "babylon_wallpaper_dove",
  "babylon-wallpaper": "babylon_wallpaper_dove",
  "babylon_wallpaper": "babylon_wallpaper_dove",
  "babylon-wallpaper-papyrus": "babylon_wallpaper_papyrus",
  "babylon_wallpaper_papyrus": "babylon_wallpaper_papyrus",
  "babylon-wallpaper-celestial-blue": "babylon_wallpaper_celestial_blue",
  "babylon_wallpaper_celestial_blue": "babylon_wallpaper_celestial_blue",
  "babylon-wallpaper-blush": "babylon_wallpaper_blush",
  "babylon_wallpaper_blush": "babylon_wallpaper_blush",

  // Floribunda Magna Wallpaper
  "floribunda-magna-wallpaper-zenith": "floribunda_magna_wallpaper",
  "floribunda-magna-wallpaper": "floribunda_magna_wallpaper",
  "floribunda_magna_wallpaper": "floribunda_magna_wallpaper",
  "floribunda-magna": "floribunda_magna_wallpaper",

  // Other heritage wallpapers
  "zanjan-wallpaper": "zanjan_wallpaper",
  "utopia-wallpaper": "utopia_wallpaper",
  "gaia-wallpaper": "gaia_wallpaper",
  "caspian-wallpaper": "caspian_wallpaper",
  "herbarium-wallpaper": "herbarium_wallpaper",
  "arborea-wallpaper": "arborea_wallpaper",
  "stratus-wallpaper": "stratus_wallpaper",
  "savanna-wallpaper": "savanna_wallpaper",
  "quercus-wallpaper": "quercus_wallpaper",
  "equus-wallpaper": "equus_wallpaper",
  "bambusa-wallpaper": "bambusa",
};

/**
 * Finds a curated flagship product by ID or slug
 */
export function findCuratedProduct(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();

  return (
    CURATED_PRODUCTS.find((p) => {
      if (String(p._id).toLowerCase() === clean || String(p.id).toLowerCase() === clean) return true;
      if (p.slug.toLowerCase() === clean) return true;
      if (Array.isArray(p.aliases) && p.aliases.some((a) => a.toLowerCase() === clean)) return true;
      return false;
    }) || null
  );
}
