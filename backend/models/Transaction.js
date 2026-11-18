const mongoose = require('mongoose');

const CATEGORIAS = ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Educación', 'Ocio', 'Salario', 'Inversiones', 'Otros'];

const transactionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tipo: { type: String, enum: { values: ['ingreso', 'egreso'], message: 'El tipo debe ser ingreso o egreso' }, required: [true, 'El tipo es obligatorio'] },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      validate: { validator: (v) => Number.isFinite(v) && v > 0, message: 'El monto debe ser mayor a 0' },
    },
    categoria: { type: String, enum: { values: CATEGORIAS, message: 'Categoría no válida' }, required: [true, 'La categoría es obligatoria'] },
    descripcion: { type: String, trim: true, maxlength: [200, 'La descripción no puede superar 200 caracteres'], default: '' },
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'], default: Date.now },
    // Si el movimiento es un abono a una meta, referencia a la meta
    meta: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ usuario: 1, fecha: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.CATEGORIAS = CATEGORIAS;
