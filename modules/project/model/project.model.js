import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: [] }],

  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  numberOfUnits: { type: Number, required: true },
  sizeRangeOfUnits: { type: String, required: true },
  roomRangeOfUnits: { type: String, required: true },
  isParkingAvailable: { type: Boolean, required: true },
  numberOfParkingSpaces: { type: Number },
  projectPageLink: { type: String },
  projectImageLink: { type: String },

  projectInformation: [{ type: String }], 
  projectInfrastructure: [{ type: String }],   
  projectEnergyCertificate: [{ type: String }],
  projectStatus: [{ type: String }],           
  projectMaker: { type: String },
  projectFeatures: { type: String },
  projectLocation: { type: String }

}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
