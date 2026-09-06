/**
 * Mock Data & JSON Fixtures Injector (DummyJSON / JSONPlaceholder)
 * Injects realistic seed data objects into Prompt A database contracts.
 */

export const DEFAULT_FIXTURES = {
  ecommerce: [
    { id: "prod_01h7x8", name: "Merino Wool Thermal Layer", price_cents: 8900, currency: "USD", stock: 45, sku: "MRL-TH-BLK-M" },
    { id: "prod_02k9y1", name: "Waterproof Alpine Shell", price_cents: 24900, currency: "USD", stock: 18, sku: "ALP-SH-NVY-L" }
  ],
  users: [
    { id: "usr_99a1b2", email: "elena.rostova@enterprise.internal", role: "ADMIN", permissions: ["audit:read", "users:manage"] },
    { id: "usr_88c3d4", email: "marcus.vance@partner.org", role: "CONTRIBUTOR", permissions: ["items:create", "items:read"] }
  ],
  donations: [
    { id: "don_44f8e1", donor_id: "usr_88c3d4", item_category: "Outerwear", quantity: 5, status: "DISPATCHED", dropoff_station: "Hub-East-12" },
    { id: "don_55g9h2", donor_id: "usr_99a1b2", item_category: "Winter Gear", quantity: 12, status: "PENDING_VERIFICATION", dropoff_station: "Hub-North-04" }
  ]
};

/**
 * Fetches or returns realistic JSON fixtures matching a domain archetype.
 * @param {string} domainCategory
 * @returns {Promise<object>} Domain seed data
 */
export async function getRealisticFixtures(domainCategory = 'website') {
  const lower = domainCategory.toLowerCase();

  // Try fetching live mock data from DummyJSON
  try {
    if (lower.includes('commerce') || lower.includes('shop') || lower.includes('store') || lower.includes('clothing')) {
      const res = await fetch('https://dummyjson.com/products?limit=2&select=id,title,price,category,stock');
      if (res.ok) {
        const data = await res.json();
        return {
          entity: 'ProductCatalog',
          fixtures: data.products.map(p => ({
            id: `prod_${p.id}`,
            name: p.title,
            price_cents: Math.round(p.price * 100),
            currency: 'USD',
            category: p.category,
            stock: p.stock
          }))
        };
      }
    }
  } catch {
    // Fall back to built-in enterprise fixtures
  }

  if (lower.includes('donation') || lower.includes('clothing')) {
    return { entity: 'DonationRecord', fixtures: DEFAULT_FIXTURES.donations };
  }

  return { entity: 'UserProfile', fixtures: DEFAULT_FIXTURES.users };
}

export default {
  getRealisticFixtures,
  DEFAULT_FIXTURES
};
