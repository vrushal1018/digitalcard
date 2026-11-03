import { isValidPhoneNumber } from "./phone";
import { CardFormData, FormErrors } from "../types/card";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateCardForm(data: Partial<CardFormData>): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Full name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.designation || !data.designation.trim()) {
    errors.designation = "Designation/job title is required";
  } else if (data.designation.trim().length < 2) {
    errors.designation = "Designation must be at least 2 characters";
  }

  if (!data.companyName || !data.companyName.trim()) {
    errors.companyName = "Company name is required";
  } else if (data.companyName.trim().length < 2) {
    errors.companyName = "Company name must be at least 2 characters";
  }

  if (!data.phoneNumber || !data.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number with 7-15 digits";
  }

  if (!data.officeLocation || !data.officeLocation.trim()) {
    errors.officeLocation = "Office location is required";
  } else if (data.officeLocation.trim().length < 3) {
    errors.officeLocation = "Office location must be at least 3 characters";
  }

  if (!data.photoUrl || !data.photoUrl.trim()) {
    errors.photo = "Profile photo is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPG, PNG, and WebP images are supported",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: "Image must be smaller than 5MB",
    };
  }

  return { isValid: true };
}
