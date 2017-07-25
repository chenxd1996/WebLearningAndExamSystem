var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'session',
    checkExpirationInterval: 6 * 60 * 60 * 1000
};

app.use(session({
    saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
    resave: false,
    store: new MySQLStore(options),
    secret: '123456',
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 1000 * 6
    }
}));

app.use('/', index);
app.use('/users', users);

var DBInit = require('./DataBase/DBInit');
DBInit();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
