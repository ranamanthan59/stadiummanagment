import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  type: 'Food' | 'Washroom' | 'Gate';
  queueLength: number;
  avgServiceTime: number; // in minutes
  location: {
    x: number;
    y: number;
  };
  lastUpdated: Date;
}

const FacilitySchema = new Schema<IFacility>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Food', 'Washroom', 'Gate'], 
    required: true 
  },
  queueLength: { type: Number, default: 0 },
  avgServiceTime: { type: Number, default: 2 },
  location: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default models.Facility || model<IFacility>('Facility', FacilitySchema);
