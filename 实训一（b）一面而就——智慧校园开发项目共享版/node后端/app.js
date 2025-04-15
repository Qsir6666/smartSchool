var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var QWGRouter = require('./routes/QWG');
// var HBCRouter = require('./routes/HBC');
var JXHRouter = require('./routes/JXH');
// var LYNRouter = require('./routes/LYN');
var YZYRouter = require('./routes/YZY');
// var PDLRouter = require('./routes/PDL');
// var PQKRouter = require('./routes/PQK');
// var WSXRouter = require('./routes/WSX');

var app = express();

const cors = require('cors')
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/imgs",express.static(path.join(__dirname, 'imgs')));
app.use("/video",express.static(path.join(__dirname, 'video')));
app.use("/routes/uploads",express.static(path.join(__dirname, '/routes/uploads')));

app.use('/QWG', QWGRouter);//齐文纲
// app.use('/HBC', HBCRouter);//何百川
app.use('/JXH', JXHRouter);//贾晓虎
// app.use('/LYN', LYNRouter);//李一宁
app.use('/YZY', YZYRouter);//杨振宇
// app.use('/PDL', PDLRouter);//潘栋梁
// app.use('/PQK', PQKRouter);//庞庆可
// app.use('/WSX', WSXRouter);//王世信

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
