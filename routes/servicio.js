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


router.get('/', (req, res) => {
  "use strict";
  res.send('API servicio');
});


router.get('/arrancar', (req, res) => {
  "use strict";
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
    child.on('message', (m) => {
      switch (m.cmd) {
        case 'info':
          myEmitter.emit(m.id, m.info);
          break;
        case 'computar':
          myEmitter.emit('computar', m.computar);
          break;
      }
    });
    informacion[req.query.id] = req.hostname + ':3000';
    procesos[req.query.id] = child;
    child.send({
      cmd: 'arrancar'
    });
    res.send(JSON.stringify({
      state: 'running'
    }));
  }
});


router.get('/parar', (req, res) => {
  "use strict";
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


router.get('/computar', (req, res) => {
  "use strict";
  if (isNaN(req.query.id)) {
    res.sendStatus(400);
  } else if (procesos[req.query.id]) {
    var child = procesos[req.query.id];
    myEmitter.once('computar', (m) => {
      res.send(m);
    });
    child.send({
      cmd: 'computar'
    });
  } else {
    res.sendStatus(400);
  }
});


router.get('/eleccion', (req, res) => {
  "use strict";
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


router.get('/ok', (req, res) => {
  "use strict";
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


router.get('/informacion', (req, res) => {
  "use strict";
  if (Object.keys(req.query).length === 0) {
    res.send(JSON.stringify(informacion));
  } else if (req.query.self) {
    var info = {
      procesos: []
    };
    for (var key in procesos) {
      if (procesos.hasOwnProperty(key)) {
        info.procesos.push(key);
      }
    }
    res.send(JSON.stringify(info));
  } else if (procesos[req.query.id]) {
    var child = procesos[req.query.id];
    myEmitter.once(req.query.id, (m) => {
      res.send(m);
    });
    child.send({
      cmd: 'informacion'
    });
  } else {
    res.sendStatus(400);
  }
});


router.post('/informacion', (req, res) => {
  "use strict";
  if (req.body.id && req.body.servidor) {
    informacion[req.body.id] = req.body.servidor;
    console.log(informacion);
    res.send(JSON.stringify({
      status: "saved"
    }));
  } else {
    res.sendStatus(400);
  }
});


router.get('/coordinador', (req, res) => {
  "use strict";
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
