const paletteController = require('../controllers/paletteController');

const paletteRoutes = [
  {
    method: 'GET',
    path: '/palettes',
    handler: paletteController.getAllPalettes,
  },
  {
    method: 'GET',
    path: '/palettes/{id}',
    handler: paletteController.getPaletteById,
  },
  {
    method: 'POST',
    path: '/palettes',
    handler: paletteController.createPalette,
  },
];

module.exports = paletteRoutes;
