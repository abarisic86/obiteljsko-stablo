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
  spouseParents?: FamilyNode; // Parent tree of the spouse (for merged family display)
}

export interface PersonPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

