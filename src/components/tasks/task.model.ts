import { Schema, model } from 'mongoose';

export interface DatosTarea {
  title: string;
  priority: 'baja' | 'media' | 'alta';
  dueDate: Date;
  completed: boolean;
}

const esquemaTarea = new Schema<DatosTarea>({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  priority: { type: String, required: true, enum: ['baja', 'media', 'alta'] },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, required: true, default: false },
}, { versionKey: false });

export const Tarea = model<DatosTarea>('Task', esquemaTarea);
