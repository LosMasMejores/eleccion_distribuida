/**
 * Created by Javier&Emilio on 30/04/2016.
 */

/*jslint node: true */

var express = require('express');
var router = express.Router();

var child_process = require('child_process');
var EventEmitter = require('events');

var myEmitter = new EventEmitter();
var procesos = {};
var informacion = {};

/*
Descripcion del servicio
 */
router.get('/', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 0) {
    return res.sendStatus(400);
  }
  res.send('Servicio API REST');
});

/*
Arrancar un proceso
 */
router.get('/arrancar', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 1 || !req.query.id || isNaN(req.query
      .id)) {
    return res.sendStatus(400);
  }
  if (procesos[req.query.id]) {
    informacion[req.query.id].state = 'running';
    procesos[req.query.id].send({
      cmd: 'arrancar'
    });
    return res.send(JSON.stringify({
      state: 'running'
    }));
  }
  var options = {
    env: {
      id: req.query.id,
      coordinador: 0,
      estado: 'PARADO',
      eleccion: 'ACUERDO',
      servidor: 'localhost:' + req.app.settings.port
    }
  };
  var child = child_process.fork('process/proceso.js', [], options);
  child.on('message', (m) => {
    switch (m.cmd) {
      case 'info':
        myEmitter.emit('info:' + m.id, m.info);
        break;
      case 'computar':
        myEmitter.emit('computar:' + m.id, m.computar);
        break;
    }
  });
  informacion[req.query.id] = {
    server: req.hostname + ':' + req.app.settings.port,
    state: 'running'
  };
  procesos[req.query.id] = child;
  child.send({
    cmd: 'arrancar'
  });
  res.send(JSON.stringify({
    state: 'running'
  }));
});

/*
Parar un proceso
 */
router.get('/parar', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 1 || !req.query.id || isNaN(req.query
      .id)) {
    return res.sendStatus(400);
  }
  if (!procesos[req.query.id]) {
    return res.sendStatus(400);
  }
  informacion[req.query.id].state = 'stopped';
  procesos[req.query.id].send({
    cmd: 'parar'
  });
  res.send(JSON.stringify({
    state: 'stopped'
  }));
});

/*
Obtener el reultado de la computacion de un proceso
 */
router.get('/computar', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 1 || !req.query.id || isNaN(req.query
      .id)) {
    return res.sendStatus(400);
  }
  if (!procesos[req.query.id]) {
    return res.sendStatus(400);
  }
  myEmitter.once('computar:' + req.query.id, (m) => {
    res.send(m);
  });
  procesos[req.query.id].send({
    cmd: 'computar'
  });
});

/*
Iniciar el proceso de eleccion de un proceso
 */
router.get('/eleccion', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 2 || !req.query.id || isNaN(req.query
      .id) || !req.query.candidato || isNaN(req.query.candidato)) {
    return res.sendStatus(400);
  }
  if (!procesos[req.query.id]) {
    return res.sendStatus(400);
  }
  procesos[req.query.id].send({
    cmd: 'eleccion',
    candidato: req.query.candidato
  });
  res.send(JSON.stringify({
    status: 'eleccion'
  }));
});

/*
Enviar mensaje OK
 */
router.get('/ok', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 1 || !req.query.id || isNaN(req.query
      .id)) {
    return res.sendStatus(400);
  }
  if (!procesos[req.query.id]) {
    return res.sendStatus(400);
  }
  procesos[req.query.id].send({
    cmd: 'ok'
  });
  res.send(JSON.stringify({
    status: 'ok'
  }));
});

/*
Pedir informacion sobre todos los procesos
 */
router.get('/informacion', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 0) {
    return res.sendStatus(400);
  }
  res.send(JSON.stringify(informacion));
});

/*
Pedir informacion sobre el servidor mismo o sobre un proceso
 */
router.get('/informacion/:option', (req, res) => {
  'use strict';
  switch (req.params.option) {
    case 'self':
      if (Object.keys(req.query).length !== 0) {
        return res.sendStatus(400);
      }
      var info = {
        procesos: []
      };
      for (var key in procesos) {
        if (procesos.hasOwnProperty(key)) {
          info.procesos.push(key);
        }
      }
      res.send(JSON.stringify(info));
      break;
    case 'proceso':
      if (Object.keys(req.query).length !== 1 || !req.query.id || isNaN(req
          .query.id)) {
        return res.sendStatus(400);
      }
      if (!procesos[req.query.id]) {
        return res.sendStatus(400);
      }
      myEmitter.once('info:' + req.query.id, (m) => {
        res.send(m);
      });
      procesos[req.query.id].send({
        cmd: 'informacion'
      });
      break;
    default:
      res.sendStatus(400);
      break;
  }
});

/*
Enviar informacion al servidor
 */
router.post('/informacion', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 0) {
    return res.sendStatus(400);
  }
  if (req.body.id && req.body.servidor && req.body.estado) {
    informacion[req.body.id] = {
      server: req.hostname + ':' + req.body.servidor,
      state: req.body.estado
    };
  } else {
    res.sendStatus(400);
  }
});

/*
Enviar el coordinador a un proceso
 */
router.get('/coordinador', (req, res) => {
  'use strict';
  if (Object.keys(req.query).length !== 2 || !req.query.id || isNaN(req.query
      .id) || !req.query.candidato || isNaN(req.query.candidato)) {
    return res.sendStatus(400);
  }
  if (!procesos[req.query.id]) {
    return res.sendStatus(400);
  }
  procesos[req.query.id].send({
    cmd: 'coordinador',
    candidato: req.query.candidato
  });
  res.send(JSON.stringify({
    candidato: req.query.candidato
  }));
});

module.exports = router;
