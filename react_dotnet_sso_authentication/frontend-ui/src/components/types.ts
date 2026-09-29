// src/components/types.ts

export interface BillItem {
  id: string; // Explicit GUID / unique identifier
  name: string; // E.g., "Netflix Subscription", "Electricity Bill"
  amount: number; // Financial cash cost value
  dueDate: string; // Explicit string date parameter (YYYY-MM-DD)
  isPaid: boolean; // State completion tracking flag
  category: string; // Utility, Entertainment, Housing, etc.
}
