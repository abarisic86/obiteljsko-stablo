export interface Person {
  id: string;
  name: string;
  birthdate: string;
  photoUrl: string;
  parentId: string | null;
  spouseId: string | null;
  location: string;
  contact: string;
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

