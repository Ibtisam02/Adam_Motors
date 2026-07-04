"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { carSchema, type CarInput } from "@/schemas/car.schema";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";
import type { ICategory, ICar } from "@/types";

interface CarFormProps {
  categories: ICategory[];
  car?: ICar;
}

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"] as const;
const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-Automatic"] as const;

export default function CarForm({ categories, car }: CarFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(car);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CarInput>({
    resolver: zodResolver(carSchema),
    defaultValues: car
      ? {
          title: car.title,
          brand: car.brand,
          CarModel: car.CarModel,
          year: car.year,
          mileage: car.mileage,
          fuelType: car.fuelType,
          transmission: car.transmission,
          engine: car.engine,
          color: car.color,
          price: car.price,
          categoryId: typeof car.categoryId === "object" ? car.categoryId._id : car.categoryId,
          description: car.description,
          installmentAvailable: car.installmentAvailable,
          installmentDetails: car.installmentDetails || "",
          featured: car.featured,
          sold: car.sold,
          images: car.images || [],
        }
      : {
          title: "",
          brand: "",
          CarModel: "",
          year: new Date().getFullYear(),
          mileage: 0,
          fuelType: "Petrol",
          transmission: "Automatic",
          engine: "",
          color: "",
          price: 0,
          categoryId: categories[0]?._id || "",
          description: "",
          installmentAvailable: false,
          installmentDetails: "",
          featured: false,
          sold: false,
          images: [],
        },
  });

  async function onSubmit(values: CarInput) {
    setServerError(null);

    try {
      const url = isEdit ? `/api/cars/${car!._id}` : "/api/cars";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || "Failed to save car. Please try again.");
        return;
      }

      router.push("/admin/cars");
      router.refresh();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Basic Info */}
      <fieldset className="card-surface space-y-4 p-5">
        <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Basic Information
        </legend>

        <div>
          <label htmlFor="title" className="label-field">Title</label>
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="2023 Toyota Camry XSE"
            {...register("title")}
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="label-field">Brand</label>
            <input id="brand" type="text" className="input-field" placeholder="Toyota" {...register("brand")} />
            {errors.brand && <p className="mt-1 text-xs text-red-400">{errors.brand.message}</p>}
          </div>
          <div>
            <label htmlFor="CarModel" className="label-field">Model</label>
            <input id="CarModel" type="text" className="input-field" placeholder="Camry" {...register("CarModel")} />
            {errors.CarModel && <p className="mt-1 text-xs text-red-400">{errors.CarModel.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="label-field">Category</label>
          <select id="categoryId" className="input-field" {...register("categoryId")}>
            {categories.length === 0 && <option value="">No categories — create one first</option>}
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>}
        </div>
      </fieldset>

      {/* Specifications */}
      <fieldset className="card-surface space-y-4 p-5">
        <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Specifications
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="year" className="label-field">Year</label>
            <input id="year" type="number" className="input-field" {...register("year")} />
            {errors.year && <p className="mt-1 text-xs text-red-400">{errors.year.message}</p>}
          </div>
          <div>
            <label htmlFor="mileage" className="label-field">Mileage (mi)</label>
            <input id="mileage" type="number" className="input-field" {...register("mileage")} />
            {errors.mileage && <p className="mt-1 text-xs text-red-400">{errors.mileage.message}</p>}
          </div>
          <div>
            <label htmlFor="price" className="label-field">Price (USD)</label>
            <input id="price" type="number" className="input-field" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
          </div>
          <div>
            <label htmlFor="fuelType" className="label-field">Fuel Type</label>
            <select id="fuelType" className="input-field" {...register("fuelType")}>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="transmission" className="label-field">Transmission</label>
            <select id="transmission" className="input-field" {...register("transmission")}>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="engine" className="label-field">Engine</label>
            <input id="engine" type="text" className="input-field" placeholder="2.5L 4-Cylinder" {...register("engine")} />
            {errors.engine && <p className="mt-1 text-xs text-red-400">{errors.engine.message}</p>}
          </div>
          <div>
            <label htmlFor="color" className="label-field">Color</label>
            <input id="color" type="text" className="input-field" placeholder="Midnight Black" {...register("color")} />
            {errors.color && <p className="mt-1 text-xs text-red-400">{errors.color.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Description */}
      <fieldset className="card-surface space-y-2 p-5">
        <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Description
        </legend>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe the vehicle's condition, history, and standout features…"
            />
          )}
        />
        {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
      </fieldset>

      {/* Images */}
      <fieldset className="card-surface space-y-2 p-5">
        <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Images
        </legend>
        <Controller
          control={control}
          name="images"
          render={({ field }) => <ImageUploader images={field.value} onChange={field.onChange} />}
        />
        {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images.message as string}</p>}
      </fieldset>

      {/* Installments & Status */}
      <fieldset className="card-surface space-y-4 p-5">
        <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Installments &amp; Status
        </legend>

        <div className="flex flex-wrap gap-6">
          <CheckboxField id="installmentAvailable" label="Installment Plans Available" register={register} />
          <CheckboxField id="featured" label="Featured Vehicle" register={register} />
          <CheckboxField id="sold" label="Mark as Sold" register={register} />
        </div>

        {watch("installmentAvailable") && (
          <div>
            <label className="label-field">Installment Details</label>
            <Controller
              control={control}
              name="installmentDetails"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Outline down payment, monthly terms, duration, and eligibility…"
                />
              )}
            />
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? "Update Car" : "Create Car"}
            </>
          )}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

function CheckboxField({
  id,
  label,
  register,
}: {
  id: "installmentAvailable" | "featured" | "sold";
  label: string;
  register: ReturnType<typeof useForm<CarInput>>["register"];
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded-sm border-white/20 bg-charcoal-900 text-brass-400 focus:ring-brass-400"
        {...register(id)}
      />
      {label}
    </label>
  );
}
