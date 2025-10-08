import connectDB from "../../config/database/mongodb.js";
import District from "../../modules/district/district.model.js"

export default async function handler(req, res) {
  try {
    await connectDB();

    const districts = await District.find({}).sort({ number: 1 });
    
    res.status(200).json(districts);
  } catch (err) {
    console.error("Failed to fetch districts:", err);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
}
