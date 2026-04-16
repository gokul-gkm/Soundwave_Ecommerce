const bcrypt = require('bcrypt');

const matchPassword = async (password1, password2) => {
    try {
      const passwordMatch = await bcrypt.compare(password1, password2);
      return passwordMatch;
    } catch (err) {
      console.log(err.message);
    }
};
  
module.exports = matchPassword;