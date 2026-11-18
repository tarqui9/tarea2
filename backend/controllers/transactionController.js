const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');

const buildFilter = (req) => {
  const filter = { usuario: req.user._id };
  const { tipo, categoria, mes, anio } = req.query;
  if (tipo) filter.tipo = String(tipo);
  if (categoria) filter.categoria = String(categoria);
  const y = parseInt(anio, 10);
  if (!Number.isNaN(y)) {
    const m = parseInt(mes, 10);
    if (!Number.isNaN(m) && m >= 1 && m <= 12) {
      filter.fecha = { $gte: new Date(Date.UTC(y, m - 1, 1)), $lt: new Date(Date.UTC(y, m, 1)) };
    } else {
      filter.fecha = { $gte: new Date(Date.UTC(y, 0, 1)), $lt: new Date(Date.UTC(y + 1, 0, 1)) };
    }
  }
  return filter;
};

const pick = (body) => {
  const data = {};
  ['tipo', 'categoria', 'descripcion', 'fecha'].forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  if (body.monto !== undefined) data.monto = Number(body.monto);
  return data;
};

exports.list = asyncHandler(async (req, res) => {
  const filter = buildFilter(req);
  const [transacciones, totales] = await Promise.all([
    Transaction.find(filter).sort({ fecha: -1, createdAt: -1 }).limit(500),
    Transaction.aggregate([{ $match: filter }, { $group: { _id: '$tipo', total: { $sum: '$monto' } } }]),
  ]);
  const ingresos = totales.find((t) => t._id === 'ingreso')?.total || 0;
  const egresos = totales.find((t) => t._id === 'egreso')?.total || 0;
  res.json({ transacciones, resumen: { ingresos, egresos, balance: ingresos - egresos } });
});

exports.create = asyncHandler(async (req, res) => {
  const tx = await Transaction.create({ ...pick(req.body), usuario: req.user._id });
  res.status(201).json(tx);
});

exports.update = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, usuario: req.user._id });
  if (!tx) {
    res.status(404);
    throw new Error('Movimiento no encontrado');
  }
  tx.set(pick(req.body));
  await tx.save();
  res.json(tx);
});

exports.remove = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
  if (!tx) {
    res.status(404);
    throw new Error('Movimiento no encontrado');
  }
  res.json({ message: 'Movimiento eliminado' });
});
