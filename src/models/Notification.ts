import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface INotification extends Document {
  message: string;
  type: 'Alert' | 'Info' | 'Emergency';
  timestamp: Date;
  active: boolean;
}

const NotificationSchema = new Schema<INotification>({
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Alert', 'Info', 'Emergency'], 
    default: 'Info' 
  },
  timestamp: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

export default models.Notification || model<INotification>('Notification', NotificationSchema);
