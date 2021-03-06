var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
  role : {
    type : String,
    enum : ["MEMBER", "ADMIN", "VENDOR", "OPERATOR"]
  },
  address : {
    type : String,
  },
  phoneNo : {
    type : String,
  },
  password: {
    type: String
  },
  email: {
    type: String,
  },
  status  : {
   type : String,
   enum : ["active", "deactive"],
   default : "active"
  },

  facebookProvider: {
    type: {
        id: String,
        token: String
    },
    select: false
},
twitterProvider: {
    type: {
        id: String,
        token: String
    },
    select: false
},
googleProvider: {
    type: {
        id: String,
        token: String
    },
    select: false
},
  vcode: { type: String, required: false },
  deleted : Boolean,
  token: String,
  create_at: {
    type : Date,
    default : Date.now
  },
  updated_at: {
     type : Date,
     default : Date.now
   }

});

UserSchema.set('toJSON', {getters: true, virtuals: true});

UserSchema.statics.upsertTwitterUser = function(token, tokenSecret, profile, cb) {
    var that = this;
    return this.findOne({
        'twitterProvider.id': profile.id
    }, function(err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                email: profile.emails[0].value,
                twitterProvider: {
                    id: profile.id,
                    token: token,
                    tokenSecret: tokenSecret
                }
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(err, user);
        }
    });
};

UserSchema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'facebookProvider.id': profile.id
    }, function(err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                facebookProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(err, user);
        }
    });
};

UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'googleProvider.id': profile.id
    }, function(err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(err, user);
        }
    });
};

var User = module.exports = mongoose.model('User', UserSchema);
module.exports = User
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
  }

  module.exports.getUserByEmail = function(username, callback){
    var query = {email: username, status : 'active', deleted : {$exists: false}};
    User.findOne(query, callback);
  }
  
  module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
  }
  
  module.exports.comparePassword = function(candidatePassword, userPassoword, callback){
  
      bcrypt.compare(candidatePassword, userPassoword, function(err, result) {
          if (err) { throw (err); }
          callback(null, result);
      });
  }