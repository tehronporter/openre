import { z } from "zod";
import {
  financingTypes,
  propertyConditions,
  propertyTypes,
} from "@/lib/constants";

const optionalNumber = z
  .union([z.coerce.number().positive(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value === "" || value == null ? null : Number(value)));

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const listingSchema = z.object({
  title: z.string().trim().min(8, "Use a clear listing title."),
  description: z.string().trim().min(30, "Add a useful property description."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  street: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required.").max(24),
  zip: z.string().trim().min(5, "ZIP is required.").max(12),
  property_type: z.enum(propertyTypes),
  condition: z.enum(propertyConditions),
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  square_feet: optionalNumber,
  status: z.enum(["draft", "published"]),
});

export const offerSchema = z
  .object({
    listing_id: z.string().uuid(),
    offer_price: z.coerce.number().positive("Offer must be greater than zero."),
    offer_type: z.enum(["cash", "financed"]),
    financing_type: z.enum(financingTypes),
    closing_days: z.coerce
      .number()
      .int()
      .min(1, "Closing timeline is required.")
      .max(365, "Use a timeline under one year."),
    note: z.string().trim().max(1200).optional(),
  })
  .refine(
    (value) =>
      value.offer_type === "cash"
        ? value.financing_type === "cash"
        : value.financing_type !== "cash",
    {
      message: "Financing type must match the offer type.",
      path: ["financing_type"],
    },
  );

export const messageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  listing_id: z.string().uuid(),
  offer_id: z.string().uuid().optional(),
  seller_id: z.string().uuid(),
  buyer_id: z.string().uuid(),
  body: z.string().trim().min(1, "Enter a message.").max(2000),
});
