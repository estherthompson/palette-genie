const paletteModel = require('../models/paletteModel');

const getAllPalettes = async (reques, h) => {

    try{
        const palettes = await paletteModel.getAllPalettes();
        return h.response(palettes).code(200);
    } catch (err){
        console.error('Error Fetchign palettes', err)
        return h.response({ error: 'Failed to fetch palettes' }).code(500);
    }
};


const getPaletteById = async (request, h) => {
    try {
      const { id } = request.params;
      const palette = await paletteModel.getPaletteById(id);
      if (!palette) {
        return h.response({ error: 'Palette not found' }).code(404);
      }
      return h.response(palette).code(200);
    } catch (err) {
      console.error('Error fetching palette:', err);
      return h.response({ error: 'Failed to fetch palette' }).code(500);
    }
};

const createPalette = async (request, h) => {
    try {
      const payload = request.payload;
      const createdPalette = await paletteModel.createPalette(payload);
      return h.response(createdPalette).code(201);
    } catch (err) {
      console.error('Error creating palette:', err);
      return h.response({ error: 'Failed to create palette' }).code(500);
    }
  };
  
  module.exports = {
    getAllPalettes,
    getPaletteById,
    createPalette,
};
  
