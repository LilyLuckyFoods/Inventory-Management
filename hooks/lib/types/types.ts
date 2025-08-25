// Product definition
export interface Product {
  id: string;
  name: string;
  itemNumber: string;
  productType: 'Ambient' | 'Refrigerated' | 'Frozen';
  casesPerPallet: string;
  shelfLifeInDays: string;
  targetLabel: 'Regular Customer' | 'Target';
  countryLabel: 'US' | 'Canada';
}

// Lot for inventory items
export interface Lot {
  quantity: number;
  expirationDate: string; // ISO string: YYYY-MM-DD
}

// Inventory item
export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  lots: Lot[];
  locations: string[];
  customerType: 'Regular' | 'Walmart';
  onHold: boolean;
  quantity: number;     // Sum of all lots
  totalSales: number;   // Total sales count
}

// Combined inventory with product info
export type CombinedInventoryItem = InventoryItem & {
  productName: string;
  itemNumber: string;
  productType: Product['productType'];
  pallets: number | 'N/A';
  targetLabel: Product['targetLabel'];
  countryLabel: Product['countryLabel'];
};

// Form data for creating products
export type ProductFormData = Omit<Product, 'id'>;

// Form data for creating inventory items
export type InventoryFormData = Omit<InventoryItem, 'id' | 'quantity' | 'totalSales'>;

