import mongoose from "mongoose";

const quoteTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["שירותים", "סדנאות", "מוצרים"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  mongoose.models.QuoteTemplate ||
  mongoose.model("QuoteTemplate", quoteTemplateSchema);

export default QuoteTemplate;
