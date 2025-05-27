import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["הצעה", "הזמנה"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["טיוטה", "נשלחה", "ממתין לאישור", "מאושרת", "נדחתה", "חתומה"],
      default: "טיוטה",
    },
    validUntil: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
    publicToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerificationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    signature: {
      type: String,
    },
    signatureDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
quoteSchema.index({ customer: 1, createdAt: -1 });
quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ validUntil: 1, status: 1 });

const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);

export default Quote;
