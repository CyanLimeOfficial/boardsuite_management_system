// types/index.ts

// This is the single, authoritative definition for a Tenant.
// It includes all fields from your database table.
export interface Tenant {
  id: number;
  full_name: string;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  room_number: string | null; // This comes from the JOIN in your API
  registration_date: string;
}

// You can add other shared types here in the future, for example:
export interface Room {
  id: number;
  room_number: string;
  description: string | null;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  capacity: number;
  rate_per_month: number;
  occupant_name?: string | null; // Use optional for joined data
}
