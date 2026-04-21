"use client";

import { useActionState, useMemo, useState } from "react";
import { Camera, Home, MapPin } from "lucide-react";
import { createListing, type ListingActionState } from "@/app/actions/listings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  MAX_LISTING_IMAGES,
  propertyConditionLabels,
  propertyConditions,
  propertyTypeLabels,
  propertyTypes,
} from "@/lib/constants";

export function ListingForm() {
  const [state, formAction, pending] = useActionState<
    ListingActionState,
    FormData
  >(createListing, {});
  const [files, setFiles] = useState<FileList | null>(null);
  const imageNote = useMemo(() => {
    const count = files?.length || 0;
    if (!count) return "Upload up to 8 JPG, PNG, or WEBP photos.";
    return `${Math.min(count, MAX_LISTING_IMAGES)} photo${count === 1 ? "" : "s"} selected.`;
  }, [files]);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">1. Property address</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="street">Address</Label>
            <Input
              id="street"
              name="street"
              placeholder="123 Main Street"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" name="zip" required />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Home size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">2. Listing details</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Listing title</Label>
            <Input id="title" name="title" placeholder="Well-kept home near downtown" required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the property, condition, upgrades, and what buyers should know."
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price expectation</Label>
            <Input id="price" name="price" type="number" min="1" placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="property_type">Property type</Label>
            <Select id="property_type" name="property_type" required>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {propertyTypeLabels[type]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select id="condition" name="condition" required>
              {propertyConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {propertyConditionLabels[condition]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min="0" step="0.5" />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" />
          </div>
          <div>
            <Label htmlFor="square_feet">Square feet</Label>
            <Input id="square_feet" name="square_feet" type="number" min="1" />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">3. Photos</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{imageNote}</p>
        <Input
          className="mt-4 h-auto py-3"
          name="images"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={(event) => setFiles(event.target.files)}
        />
      </Card>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button name="status" value="published" disabled={pending} size="lg">
          {pending ? "Publishing..." : "Publish Listing"}
        </Button>
        <Button
          name="status"
          value="draft"
          variant="secondary"
          disabled={pending}
          size="lg"
        >
          Save draft
        </Button>
      </div>
    </form>
  );
}
