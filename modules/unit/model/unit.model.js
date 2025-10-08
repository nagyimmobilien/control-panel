import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  projectAcronym: { type: String, required: true },
  houseNumber: { type: String, required: true },
  unitNumber: { type: String, required: true },
  floorNumber: { type: String, required: true },
  roomNumber: { type: Number, required: true },
  livingArea: { type: Number, required: true },
  loggiaArea: { type: Number, required: true },
  balconyArea: { type: Number, required: true },
  terraceArea: { type: Number, required: true },
  roofTerraceArea: { type: Number, required: true },
  gardenTerraceArea: { type: Number, required: true },
  gardenArea: { type: Number, required: true },
  listingPriceForInvestors: { type: Number },
  listingPriceForPersonalUse: { type: Number },
  commonCharges: {
    basic: { type: Number, default: 0 },
    elevator: { type: Number, default: 0 },
    reserveFund: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['Eladva', 'Elérhető', 'Foglalt'], required: true },
  floorPlanUrl: { type: String }
}, { timestamps: true });

UnitSchema.virtual('sumOfOutsideAreas').get(function () {
  return this.loggiaArea + this.balconyArea + this.terraceArea + this.roofTerraceArea + this.gardenTerraceArea + this.gardenArea;
});

UnitSchema.virtual('sumOfAllAreas').get(function () {
  return this.livingArea + this.sumOfOutsideAreas;
});

UnitSchema.virtual('sumOfCommonCharges').get(function () {
  const charges = this.commonCharges || {};
  return (charges.basic || 0) + (charges.elevator || 0) + (charges.reserveFund || 0);
});

UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });

export default mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
