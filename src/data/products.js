import serumImage from '../assets/serum-product.jpg';

/**
 * 1TAP Online Store Fallback Catalog
 * Multi-brand product catalog representation.
 */
export const PRODUCTS = [
  {
    id: 'hydrating-face-serum',
    name: 'Hydrating Face Serum',
    brand: 'Featured Brand',
    category: 'Skin Care',
    price: 499,
    formattedPrice: '₹499',
    image: serumImage,
    shortDescription: 'A lightweight hydrating face serum designed for everyday skincare.',
    fullDescription:
      'A lightweight hydrating face serum designed for everyday skincare. Formulated with pure hyaluronic acid and nutrient-rich botanical extracts, this quick-absorbing elixir deeply replenishes moisture, improves skin elasticity, and restores a natural, healthy glow without any greasy residue.',
    highlights: [
      'Deep 24-hour hydration barrier',
      'Ultra-lightweight, fast absorbing',
      'Infused with Hyaluronic Acid & Botanicals',
      'Suitable for all skin types & everyday use',
      '100% Cruelty-Free & Dermatologically Tested'
    ],
    details: {
      volume: '30ml / 1.0 fl oz',
      skinType: 'All Skin Types',
      application: 'Apply 3-4 drops to cleansed face morning and night.'
    }
  }
];

export const getFeaturedProduct = () => PRODUCTS[0];

export const getProductById = (id) => {
  return PRODUCTS.find((product) => product.id === id) || PRODUCTS[0];
};

export const getAllProducts = () => PRODUCTS;
