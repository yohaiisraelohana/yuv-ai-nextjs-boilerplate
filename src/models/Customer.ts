import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "שם הלקוח הוא שדה חובה"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "אימייל הוא שדה חובה"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "אנא הכנס כתובת אימייל תקינה"],
    },
    phone: {
      type: String,
      required: [true, "מספר טלפון הוא שדה חובה"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "שם החברה הוא שדה חובה"],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "רחוב הוא שדה חובה"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "עיר היא שדה חובה"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "מיקוד הוא שדה חובה"],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
customerSchema.index({ email: 1 });
customerSchema.index({ company: 1 });
customerSchema.index({ company: 1, name: 1 });

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
