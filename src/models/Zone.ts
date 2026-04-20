import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IZone extends Document {
  name: string;
  capacity: number;
  currentCrowd: number;
  status: 'Normal' | 'Crowded' | 'Overcrowded';
  lastUpdated: Date;
}

const ZoneSchema = new Schema<IZone>({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentCrowd: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Normal', 'Crowded', 'Overcrowded'], 
    default: 'Normal' 
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default models.Zone || model<IZone>('Zone', ZoneSchema);
