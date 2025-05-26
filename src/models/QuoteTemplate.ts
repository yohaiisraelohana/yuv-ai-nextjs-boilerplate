import mongoose, { Schema, models } from "mongoose";

const quoteTemplateSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "סוג התבנית הוא שדה חובה"],
      enum: ["שירותים", "סדנאות", "מוצרים"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "כותרת התבנית היא שדה חובה"],
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "תוכן התבנית הוא שדה חובה"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    variables: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for type and isActive
quoteTemplateSchema.index({ type: 1, isActive: 1 });

const QuoteTemplate =
  models.QuoteTemplate || mongoose.model("QuoteTemplate", quoteTemplateSchema);
export default QuoteTemplate;
