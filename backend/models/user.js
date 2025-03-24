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
    default: 'https://firebasestorage.googleapis.com/v0/b/dalihub-7ba09.firebasestorage.app/o/profile-images%2F1742835163636_matthew-blank-profile-photo-1.jpg?alt=media' 
  },
  googleId: { 
    type: String, 
    default: null,
  }, 
  refreshToken: { 
    type: String,
    default: null, 
  }, 
}, 
{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
