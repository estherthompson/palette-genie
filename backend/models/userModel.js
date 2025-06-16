const pool = require('../postgres/pool');

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const createUser = async (username, email, hashedPassword) => {
    const result = await pool.query(
        'INSERT INTO users (user_id, username, email, password) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
    );
    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
}