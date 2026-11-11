import { Schema, model } from 'mongoose';

const esquemaUsuario = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
}, { versionKey: false });

export const Usuario = model('User', esquemaUsuario);
