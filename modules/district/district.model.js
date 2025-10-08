import mongoose from "mongoose";

const DistrictSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  name: { type: String, required: true },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: [] }]
}, { timestamps: true });

export default mongoose.models.District || mongoose.model("District", DistrictSchema);