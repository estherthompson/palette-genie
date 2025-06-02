const pool = require('../postgres/pool');


const getAllPalettes = async () => {
    const result = await pool.query('SELECT * FROM palettes ORDER BY created_at DESC')
    return result.rows;
}

const getPaletteById = async () => {
    const result = await pool.query('SELECT * FROM palettes WHERE id = $1', [id]);
    return result.rows[0];
}

const createPalette = async (paletteData) => {
    const {name, hex_codes, paints, notes, user_id} = paletteData
    const query = `
        INSERT INTO palettes (name, hex_codes, paints, notes, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [name, hex_codes, paints, notes, user_id]
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getAllPalettes,
    getPaletteById,
    createPalette,

};