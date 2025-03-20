const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String,  
    required: function () {
      return !this.googleId; // If there's no Google ID, require a password
    },
  }, 
  profileImage: { 
    type: String, 
    default: '' 
  },
  googleId: { 
    type: String, 
    default: null
  }, 
  refreshToken: { 
    type: String,
    default: null, 
  }, 
}, 
{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
