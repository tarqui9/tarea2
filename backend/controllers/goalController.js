const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');

const pick = (body) => {
  const data = {};
  if (body.titulo !== undefined) data.titulo = body.titulo;
  if (body.montoObjetivo !== undefined) data.montoObjetivo = Number(body.montoObjetivo);
  if (body.fechaLimite !== undefined) data.fechaLimite = body.fechaLimite;
  if (body.icono !== undefined) data.icono = String(body.icono);
  if (body.color !== undefined) data.color = String(body.color);
  return data;
};

const findOwned = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, usuario: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Meta no encontrada');
  }
  return goal;
};

exports.list = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ usuario: req.user._id }).sort({ createdAt: -1 });
  res.json(goals);
});

exports.create = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (req.body.montoActual !== undefined) data.montoActual = Number(req.body.montoActual);
  const goal = await Goal.create({ ...data, usuario: req.user._id });
  res.status(201).json(goal);
});

exports.update = asyncHandler(async (req, res) => {
  const goal = await findOwned(req, res);
  goal.set(pick(req.body));
  await goal.save();
  res.json(goal);
});

exports.remove = asyncHandler(async (req, res) => {
  const goal = await findOwned(req, res);
  await goal.deleteOne();
  res.json({ message: 'Meta eliminada' });
});

// Abonar a la meta: incrementa montoActual y, opcionalmente, registra un egreso de ahorro
exports.contribute = asyncHandler(async (req, res) => {
  const monto = Number(req.body.monto);
  if (!Number.isFinite(monto) || monto <= 0) {
    res.status(400);
    throw new Error('El monto del abono debe ser mayor a 0');
  }
  const goal = await findOwned(req, res);
  goal.montoActual = Math.round((goal.montoActual + monto) * 100) / 100;
  await goal.save();

  let transaccion = null;
  if (req.body.registrarMovimiento) {
    transaccion = await Transaction.create({
      usuario: req.user._id,
      tipo: 'egreso',
      monto,
      categoria: 'Otros',
      descripcion: `Abono a meta: ${goal.titulo}`,
      fecha: new Date(),
      meta: goal._id,
    });
  }
  res.json({ meta: goal, transaccion });
});
