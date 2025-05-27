import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "שם החברה הוא שדה חובה"],
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      required: [true, "לוגו החברה הוא שדה חובה"],
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
    contactInfo: {
      phone: {
        type: String,
        required: [true, "מספר טלפון הוא שדה חובה"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "אימייל הוא שדה חובה"],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "אנא הכנס כתובת אימייל תקינה"],
      },
      website: {
        type: String,
        trim: true,
      },
    },
    signature: {
      type: String,
      required: [true, "חתימה היא שדה חובה"],
    },
    taxId: {
      type: String,
      required: [true, "מספר עוסק/ח.פ. הוא שדה חובה"],
      trim: true,
      index: true,
    },
    bankDetails: {
      bankName: {
        type: String,
        required: [true, "שם הבנק הוא שדה חובה"],
        trim: true,
      },
      branchNumber: {
        type: String,
        required: [true, "מספר סניף הוא שדה חובה"],
        trim: true,
      },
      accountNumber: {
        type: String,
        required: [true, "מספר חשבון הוא שדה חובה"],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for name and taxId
companySchema.index({ name: 1, taxId: 1 });

// Check if the model exists before creating a new one
const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
