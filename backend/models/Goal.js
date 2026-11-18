const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 80 },
    montoObjetivo: {
      type: Number,
      required: [true, 'El monto objetivo es obligatorio'],
      validate: { validator: (v) => Number.isFinite(v) && v > 0, message: 'El monto objetivo debe ser mayor a 0' },
    },
    montoActual: { type: Number, default: 0, min: [0, 'El monto actual no puede ser negativo'] },
    fechaLimite: { type: Date, required: [true, 'La fecha límite es obligatoria'] },
    icono: { type: String, default: 'Target' },
    color: { type: String, default: 'emerald' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

goalSchema.virtual('progreso').get(function () {
  if (!this.montoObjetivo) return 0;
  return Math.min(100, Math.round((this.montoActual / this.montoObjetivo) * 1000) / 10);
});

goalSchema.virtual('estado').get(function () {
  return this.montoActual >= this.montoObjetivo ? 'Completada' : 'En progreso';
});

module.exports = mongoose.model('Goal', goalSchema);
