// Deals and Offers data for Prisha Enterprises
// Structure designed for easy backend integration

export const deals = [
  {
    id: 1,
    title: "Festive Season Special",
    description: "Get flat 15% off on all 55-inch and above LED TVs. Celebrate this festive season with a brand new premium TV!",
    discount: "15% OFF",
    badge: "Limited Time",
    validity: "Valid till 31st October 2026",
    applicableProducts: ["55 inch", "65 inch", "75 inch"],
    minPurchase: null,
    terms: "Cannot be combined with other offers. Applicable on selected models only.",
    active: true,
    featured: true
  },
  {
    id: 2,
    title: "Bulk Order Discount",
    description: "Planning to buy 3 or more TVs for your business or society? Get exclusive bulk pricing with up to 20% discount!",
    discount: "Up to 20% OFF",
    badge: "Business Offer",
    validity: "Ongoing",
    applicableProducts: ["All Models"],
    minPurchase: "3 TVs",
    terms: "Valid for bulk orders only. Contact us for custom quotes.",
    active: true,
    featured: true
  },
  {
    id: 3,
    title: "Weekend Flash Sale",
    description: "This weekend only! Get a free wall mount worth ₹1,500 with every TV purchase. Limited stock available!",
    discount: "Free Wall Mount",
    badge: "Weekend Special",
    validity: "Every Saturday & Sunday",
    applicableProducts: ["All Models"],
    minPurchase: null,
    terms: "Subject to availability. Wall mount installation included.",
    active: true,
    featured: false
  },
  {
    id: 4,
    title: "Exchange Offer",
    description: "Exchange your old TV and get up to ₹5,000 off on your new LED TV. We accept all brands!",
    discount: "Up to ₹5,000 OFF",
    badge: "Exchange Bonus",
    validity: "Valid till 30th September 2026",
    applicableProducts: ["All Models"],
    minPurchase: null,
    terms: "Old TV must be in working condition. Exchange value depends on TV condition and age.",
    active: true,
    featured: true
  },
  {
    id: 5,
    title: "Combo Offer - Soundbar + TV",
    description: "Buy any 50-inch or larger TV and add a premium soundbar at 40% off. Experience cinematic sound at home!",
    discount: "40% OFF on Soundbar",
    badge: "Combo Deal",
    validity: "Valid till stocks last",
    applicableProducts: ["50 inch", "55 inch", "65 inch", "75 inch"],
    minPurchase: null,
    terms: "Limited stock. Soundbar model may vary based on TV model.",
    active: true,
    featured: false
  }
];

export default deals;
