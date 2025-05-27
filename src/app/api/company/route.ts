import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Company from "@/models/Company";

export async function GET() {
  try {
    await connectToDatabase();
    const company = await Company.findOne();
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectToDatabase();

    const company = await Company.findOne();
    if (company) {
      await Company.findByIdAndUpdate(company._id, data);
    } else {
      await Company.create(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving company:", error);
    return NextResponse.json(
      { error: "Failed to save company" },
      { status: 500 }
    );
  }
}
