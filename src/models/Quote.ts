import mongoose, { Schema, models } from "mongoose";

const quoteSchema = new Schema(
  {
    quoteNumber: {
      type: String,
      required: [true, "מספר הצעה הוא שדה חובה"],
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, "סוג ההצעה הוא שדה חובה"],
      enum: ["שירותים", "סדנאות", "מוצרים"],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "לקוח הוא שדה חובה"],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "כמות חייבת להיות לפחות 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "מחיר לא יכול להיות שלילי"],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, "הנחה לא יכולה להיות שלילית"],
        },
      },
    ],
    status: {
      type: String,
      required: [true, "סטטוס הוא שדה חובה"],
      enum: ["טיוטה", "נשלחה", "מאושרת", "נדחתה", "פג תוקף"],
      default: "טיוטה",
      index: true,
    },
    validUntil: {
      type: Date,
      required: [true, "תוקף ההצעה הוא שדה חובה"],
    },
    totalAmount: {
      type: Number,
      required: [true, "סכום כולל הוא שדה חובה"],
      min: [0, "סכום כולל לא יכול להיות שלילי"],
    },
    notes: {
      type: String,
      trim: true,
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: "QuoteTemplate",
      required: [true, "תבנית היא שדה חובה"],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for common queries
quoteSchema.index({ customer: 1, status: 1 });
quoteSchema.index({ type: 1, status: 1 });
quoteSchema.index({ validUntil: 1, status: 1 });

const Quote = models.Quote || mongoose.model("Quote", quoteSchema);
export default Quote;
