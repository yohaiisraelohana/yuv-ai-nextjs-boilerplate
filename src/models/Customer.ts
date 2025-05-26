import mongoose, { Schema, models } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "שם הלקוח הוא שדה חובה"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "אימייל הוא שדה חובה"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "אנא הכנס כתובת אימייל תקינה"],
    },
    phone: {
      type: String,
      required: [true, "מספר טלפון הוא שדה חובה"],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "שם החברה הוא שדה חובה"],
      trim: true,
      index: true,
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

// Create compound index for company and name
customerSchema.index({ company: 1, name: 1 });

const Customer = models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
