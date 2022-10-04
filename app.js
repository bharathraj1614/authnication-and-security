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
    password: String
});

userSchema.plugin(passportLocalMoongose);

// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']}); this has been commented out bcoz we have use harse function to encrypt the password instead of moongose-encryption level1 security using moongose-encryption

const user = mongoose.model('user', userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser()); 


app.get('/',function (req,res) {
    
    res.render('home.ejs');
});

app.get('/login',function (req,res) {
    
    res.render('login.ejs');
});

app.get('/register',function (req,res) {
    
    res.render('register.ejs');
});

app.get('/secrets',function (req, res) {

    if (req.isAuthenticated) {
        res.render('secrets.ejs');
    }else{
        res.redirect('/login');
    }
    
});

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
















app.listen(3000,function () {
    
    console.log("Port started at 3000");

});