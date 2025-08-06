'use strict';

const opentelemetry = require('@opentelemetry/api');
const tracer = opentelemetry.trace.getTracer('pacman-tracer');

const express = require('express');
const path = require('path');
const Database = require('./lib/database');

// Routes
const highscores = require('./routes/highscores');
const user = require('./routes/user');
const loc = require('./routes/location');

// App
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle root web server's public directory
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/highscores', highscores);
app.use('/user', user);
app.use('/location', loc);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Start OpenTelemetry span before connecting to database
const span = tracer.startSpan('initConnect', { kind: opentelemetry.SpanKind.CLIENT });

Database.connect(app, function(err) {
    span.setAttribute('db.system', 'mongodb');
    span.setAttribute('db.name', 'pacmandb');
    if (err) {
        console.log('Failed to connect to database server');
        span.setAttribute('pacman_custom_message', 'Failed to connect to database server');
        span.setAttribute('otel.status_code', 'ERROR');
        span.setAttribute('error', true);
        span.setAttribute('sf_error', true);
    } else {
        console.log('Connected to database server successfully');
        span.setAttribute('status', 'success');
        span.setAttribute('pacman_custom_message', 'Connected to database server successfully');
    }
    span.end();
});

module.exports = app;
