/**
 * Created by Javier&Emilio on 30/04/2016.
 */

/*jslint node: true */
'use strict';

var express = require('express');
var router = express.Router();

var child_process = require('child_process');

var procesos = {};
var informacion = {};


router.get('/', function(req, res) {
  res.send('API servicio');
});


router.get('/arrancar', function(req, res) {
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    procesos[req.query.id].send({
      cmd: 'arrancar'
    });
    res.send(JSON.stringify({
      state: 'running'
    }));
  } else {
    var options = {
      env: {
        id: req.query.id,
        coordinador: 0,
        estado: 'PARADO',
        eleccion: 'ACUERDO'
      }
    };
    var child = child_process.fork('process/proceso.js', [], options);
    informacion[req.query.id] = 'localhost:3000';
    procesos[req.query.id] = child;
    child.send({
      cmd: 'arrancar'
    });
    res.send(JSON.stringify({
      state: 'running'
    }));
  }
});


router.get('/parar', function(req, res) {
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    procesos[req.query.id].send({
      cmd: 'parar'
    });
    res.send(JSON.stringify({
      state: 'stopping'
    }));
  } else {
    res.sendStatus(400);
  }
});


router.get('/computar', function(req, res) {
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    var child = procesos[req.query.id];
    child.once('message', function(m) {
      res.send(m);
    });
    child.send({
      cmd: 'computar'
    });
  } else {
    res.sendStatus(400);
  }
});


router.get('/eleccion', function(req, res) {
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    var child = procesos[req.query.id];
    child.send({
      cmd: 'eleccion',
      candidato: req.query.candidato
    });
    res.send('eleccion');
  } else {
    res.sendStatus(400);
  }
});


router.get('/ok', function(req, res) {
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    var child = procesos[req.query.id];
    child.send({
      cmd: 'ok'
    });
    res.send('ok');
  } else {
    res.sendStatus(400);
  }
});


router.get('/informacion', function(req, res) {
  if (Object.keys(req.query).length === 0) {
    res.send(JSON.stringify(informacion));
  } else if (procesos[req.query.id]) {
    procesos[req.query.id].on('message', function(m) {
      res.send(m);
    });
    procesos[req.query.id].send({
      cmd: 'informacion'
    });
  } else {
    res.sendStatus(400);
  }
});


router.get('/coordinador', function(req, res) {
  if (Object.keys(req.query).length === 0) {
    res.send(JSON.stringify(informacion));
  } else if (procesos[req.query.id]) {
    procesos[req.query.id].send({
      cmd: 'coordinador',
      candidato: req.query.candidato
    });
    res.send(JSON.stringify({
      candidato: req.query.candidato
    }));
  } else {
    res.sendStatus(400);
  }
});


module.exports = router;
