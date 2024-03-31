const bcrypt = require('bcrypt');

const hashPassword = async (pass) => {
    try {
      const passwordHash = await bcrypt.hash(pass, 10);
      return passwordHash;
    } catch (err) {
      console.log(err.message);
    }
};
  
module.exports = hashPassword;