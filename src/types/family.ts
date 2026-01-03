export interface Person {
  id: string;
  name: string;
  birthdate: string;
  photoUrl: string;
  parentId: string | null;
  spouseId: string | null;
  streetAddress: string;
  phoneNumber: string;
  deceasedDate: string;
  generation: number;
}

export interface FamilyNode extends Person {
  children: FamilyNode[];
  spouse?: Person;
}

export interface PersonPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FamilyLocation {
  id: string; // Unique ID based on label (allows updating same person)
  label: string; // User-entered name (e.g., "Ante", "Marija")
  lat: number; // Latitude
  lng: number; // Longitude
  timestamp: number; // When location was last shared
}
