var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var path = require('path');



var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'nodelogin'
});

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/phone');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to views this page!');
    }
    response.end();
});

app.listen(3000);



connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    console.log('Connected to the MySQL server.');
});


// connection.end(function(err) {
//     if (err) {
//         return console.log('error:' + err.message);
//     }
//     console.log('Close the database connection.');
// });

//Load and initialize MessageBird SDK
var messagebird = require('messagebird')('0XOme5TvTkZeTa00xuWWiFIlC'); //Input message bird key here

//Set up and configure the Express framework
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//Display page to ask the user their phone number
app.get('/phone', function(req, res) {
    res.render('step1');
});

//Handle phone number submission
app.post('/step2', function(req, res) {
   var number = req.body.number;

   //Make request to verify API
    messagebird.verify.create(number, {
        template: "Your verification code is %token."
    },function (err, response) {
        if(err) {
            //Request has failed
            console.log(err);
            res.render('step1',{
                error: err.errors[0].description
            });
        }
        else{
            //Request succeeds
            console.log(response);
            res.render('step2',{
                id: response.id
            });
        }
    })
});

//Verify whether the token is correct

app.post('/step3', function(req, res) {
    var id = req.body.id;
    var token = req.body.token;

    //Make request to verify API
    messagebird.verify.verify(id, token, function(err, response ) {
        if(err){
            //Verification has failed
            res.render('step2', {
                error: err.errors[0].description,
                id: id
            })
        } else {
            //Verification was successful
            res.render('step3');
        }
    })
});

//

