export interface DigitalCard {
  id: string;
  slug: string;
  name: string;
  designation: string;
  companyName: string;
  phoneNumber: string;
  officeLocation: string;
  photoUrl: string;
  bgUrl?: string;
  bgFit?: "contain" | "cover";
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardFormData {
  name: string;
  designation: string;
  companyName: string;
  phoneNumber: string;
  officeLocation: string;
  photoUrl: string;
  bgUrl?: string;
  bgFit?: "contain" | "cover";
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  email?: string;
}

export interface FormErrors {
  name?: string;
  designation?: string;
  companyName?: string;
  phoneNumber?: string;
  officeLocation?: string;
  photo?: string;
  general?: string;
}

