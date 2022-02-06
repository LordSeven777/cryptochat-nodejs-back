const bcrypt = require('bcryptjs');

// Hashes a password
module.exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
}

// Verifies a password
module.exports.verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);