import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import QuoteTemplate from "@/models/QuoteTemplate";

async function updateQuotes() {
  try {
    await connectToDatabase();

    // Get the first active template for each type
    const templates = await QuoteTemplate.find({ isActive: true }).lean();

    // Update each quote with a matching template
    const quotes = await Quote.find({ template: { $exists: false } });

    for (const quote of quotes) {
      const matchingTemplate = templates.find((t) => t.type === quote.type);
      if (matchingTemplate) {
        await Quote.findByIdAndUpdate(quote._id, {
          template: matchingTemplate._id,
        });
        console.log(
          `Updated quote ${quote.quoteNumber} with template ${matchingTemplate.title}`
        );
      } else {
        console.log(
          `No matching template found for quote ${quote.quoteNumber}`
        );
      }
    }

    console.log("Update completed!");
  } catch (error) {
    console.error("Error updating quotes:", error);
  } finally {
    process.exit();
  }
}

updateQuotes();
