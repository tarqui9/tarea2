const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const asyncHandler = require('../middleware/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const anio = parseInt(req.query.anio, 10) || now.getUTCFullYear();
  const mes = parseInt(req.query.mes, 10) || now.getUTCMonth() + 1;
  const inicio = new Date(Date.UTC(anio, mes - 1, 1));
  const fin = new Date(Date.UTC(anio, mes, 1));
  const usuario = req.user._id;

  const [totales, mensual, categorias, metas, recientes] = await Promise.all([
    Transaction.aggregate([{ $match: { usuario } }, { $group: { _id: '$tipo', total: { $sum: '$monto' } } }]),
    // Los abonos a metas (meta != null) no cuentan como gasto del mes
    Transaction.aggregate([
      { $match: { usuario, fecha: { $gte: inicio, $lt: fin }, meta: null } },
      { $group: { _id: '$tipo', total: { $sum: '$monto' } } },
    ]),
    Transaction.aggregate([
      { $match: { usuario, tipo: 'egreso', fecha: { $gte: inicio, $lt: fin }, meta: null } },
      { $group: { _id: '$categoria', total: { $sum: '$monto' } } },
      { $sort: { total: -1 } },
    ]),
    Goal.find({ usuario }).sort({ fechaLimite: 1 }),
    Transaction.find({ usuario }).sort({ fecha: -1, createdAt: -1 }).limit(5),
  ]);

  const sum = (arr, tipo) => arr.find((t) => t._id === tipo)?.total || 0;
  const ingresosMes = sum(mensual, 'ingreso');
  const gastosMes = sum(mensual, 'egreso');
  const totalAhorrado = metas.reduce((acc, g) => acc + g.montoActual, 0);

  res.json({
    periodo: { mes, anio },
    kpis: {
      balanceTotal: sum(totales, 'ingreso') - sum(totales, 'egreso'),
      ingresosMes,
      gastosMes,
      totalAhorrado,
    },
    gastosPorCategoria: categorias.map((c) => ({
      categoria: c._id,
      total: c.total,
      porcentaje: gastosMes > 0 ? Math.round((c.total / gastosMes) * 1000) / 10 : 0,
    })),
    metasActivas: metas.filter((g) => g.montoActual < g.montoObjetivo).slice(0, 4).map((g) => g.toJSON()),
    totalMetas: metas.length,
    recientes,
  });
});
