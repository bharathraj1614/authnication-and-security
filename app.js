require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;//we can also add this to .env file
const session = require('express-session');
const passport = require('passport');
const passportLocalMoongose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use (session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMoongose);
userSchema.plugin(findOrCreate);

// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']}); this has been commented out bcoz we have use harse function to encrypt the password instead of moongose-encryption level1 security using moongose-encryption

const user = mongoose.model('user', userSchema);

passport.use(user.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"

  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/',function (req,res) {
    
    res.render('home.ejs');
});

app.get('/login',function (req,res) {
    
    res.render('login.ejs');
});

app.get('/register',function (req,res) {
    
    res.render('register.ejs');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
// Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get('/secrets',function (req, res) {

    if (req.isAuthenticated()) {
        user.find({secret:{$ne:null}}, function (err,foundSecret) {
            if (err) {
                console.log(err);
            } else {
                res.render('secrets',{foundUsersWithSecrets: foundSecret});     
            }
        });
    }else{
        res.redirect('/login');
    }
    
});

app.get('/logout', function (req, res) {
    
    req.logout(function (err) {
        console.log(err);
    });
    res.redirect('/');

});

app.get('/submit', function (req, res) {
    
    if(req.isAuthenticated()){
        res.render('submit');
    }else{
        res.redirect('/');
    }
})

app.post('/register',function (req,res) {

    user.register({username: req.body.username},req.body.password,function name(err) {
            if (!err) {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/secrets');
                });
            }else{
                console.log(err);
                res.redirect('/register');
            }
    });

});

app.post('/login', function (req,res) {
    
    const newUser=new user({
        username: req.body.username,
        password: req.body.password
    });


    req.login(newUser, function name(err) {

        if (err) {
            console.log(err);
            res.redirect('/login')
        } else { 

            passport.authenticate('local')(req,res, function () {
                res.redirect('/secrets');
            });
            
        }
        
    });
});

app.post('/submit', function (req, res) {
    console.log(req.user.id);
    user.findById(req.user.id, function (err,record) {
        if(err){
            console.log(err);
        }else{
        record.secret=req.body.secret;
        record.save();
        }
    });
    res.redirect('/secrets')
});














app.listen(3000,function () {
    
    console.log("Port started at 3000");

});