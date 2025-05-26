import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "שם המוצר הוא שדה חובה"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "תיאור המוצר הוא שדה חובה"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "מחיר המוצר הוא שדה חובה"],
      min: [0, "המחיר לא יכול להיות שלילי"],
    },
    category: {
      type: String,
      required: [true, "קטגוריה היא שדה חובה"],
      trim: true,
      index: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "ההנחה לא יכולה להיות שלילית"],
      max: [100, "ההנחה לא יכולה להיות גדולה מ-100%"],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for name and category
productSchema.index({ name: 1, category: 1 });

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;
