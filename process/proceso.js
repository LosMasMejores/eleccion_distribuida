/**
 * Created by Javier on 01/05/2016.
 */

/*jslint node: true */
"use strict";

var async = require('async');
var request = require('request');
var _ = require('underscore');
const EventEmitter = require('events');

var activa_timeout;
var pasiva_timeout;
const myEmitter = new EventEmitter();


function run(next) {
  console.log(process.env.id + ' run()');
  if (process.env.estado === "PARADO") {
    return next(process.env.id + ' run() PARADO');
  }
  setTimeout(function () {
    request('http://localhost:3000/servicio/informacion',
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var server = JSON.parse(body)[process.env.id];
          request('http://' + server
            + '/servicio/computar?id=' + process.env.coordinador,
            function(error, response, body) {
              if (!error && response.statusCode == 200) {
                if (JSON.parse(body)["resultado"] === 1) {
                  console.log(JSON.parse(body));
                } else {
                  myEmitter.emit('eleccion', {
                    cmd: 'eleccion'
                  });
                }
              } else {
                myEmitter.emit('eleccion', {
                  cmd: 'eleccion'
                });
              }
              next();
            });
        }
      }
    );
  }, parseInt(Math.random() * 500) + 500);
}


function computar() {
  console.log(process.env.id + ' computar()');
  if (process.env.estado === "PARADO") {
    process.send({
      resultado: -1
    });
  } else {
    setTimeout(function () {
      process.send({
        resultado: 1
      });
    }, parseInt(Math.random() * 200) + 100);
  }
}


function eleccionActiva(candidato) {
  console.log(process.env.id + ' eleccionActiva()');
  request('http://localhost:3000/servicio/informacion',
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var at_least_one = false;
        for (var key in info) {
          if (info.hasOwnProperty(key) && key > process.env.id) {
            request.get('http://' + info[key]
              + '/servicio/eleccion?id=' + key
              + '&candidato=' + process.env.id);
            at_least_one = true;
          }
        }
        if (at_least_one) {
          activa_timeout = setTimeout(function () {
            myEmitter.emit('eleccion', {
              cmd: 'avisar'
            });
          }, 1000);
        } else {
          myEmitter.emit('eleccion', {
            cmd: 'avisar'
          });
        }
      }
    });
}


function eleccionPasiva() {
  console.log(process.env.id + ' eleccionPasiva()');
  pasiva_timeout = setTimeout(function () {
    myEmitter.emit('eleccion', {
      cmd: 'noCoordinador'
    });
  }, 1000);
}


function avisar() {
  console.log(process.env.id + ' avisar()');
  request('http://localhost:3000/servicio/informacion',
    function(error, response, body) {
      var info = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        for (var key in info) {
          if (key === process.env.id) {
            continue;
          }
          if (info.hasOwnProperty(key)) {
            request.get('http://' + info[key]
              + '/servicio/coordinador?id=' + key
              + '&candidato=' + process.env.id);
          }
        }
      }
    }
  );
}


process.on('message', function(message) {
  switch (message.cmd) {
    case 'arrancar':
      if (process.env.estado === "CORRIENDO") {
        break;
      }
      process.env.estado = "CORRIENDO";
      async.forever(run, function error(err) {
        console.log(err);
      });
      break;
    case 'parar':
      process.env.estado = "PARADO";
      break;
    case 'computar':
      _.defer(computar);
      break;
    case 'informacion':
      process.emit('informacion', {
        informacion: process.env
      });
      process.send(process.env);
      break;
    case 'eleccion':
      if (process.env.estado === 'PARADO') {
        break;
      }
      request('http://localhost:3000/servicio/informacion',
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            if (info[message.candidato]) {
              request.get('http://' + info[message.candidato]
                + '/servicio/ok?id=' + message.candidato);
            }
          }
        }
      );
      myEmitter.emit('eleccion', message);
      break;
    case 'ok':
      myEmitter.emit('eleccion', message);
      break;
    case 'coordinador':
      myEmitter.emit('eleccion', message);
      break;
  }
});


myEmitter.on('eleccion', function (message) {
  switch (message.cmd) {
    case 'eleccion':
      if (process.env.eleccion === 'ACUERDO') {
        process.env.eleccion = 'ELECCION ACTIVA';
        _.defer(eleccionActiva, message.candidato);
      }
      break;
    case 'avisar':
      if (process.env.eleccion === 'ELECCION ACTIVA') {
        process.env.eleccion = 'ACUERDO';
        process.env.coordinador = process.env.id;
        _.defer(avisar);
      }
      break;
    case 'ok':
      if (process.env.eleccion === 'ELECCION ACTIVA') {
        clearTimeout(activa_timeout);
        process.env.eleccion = 'ELECCION PASIVA';
        _.defer(eleccionPasiva);
      }
      break;
    case 'coordinador':
      if (process.env.eleccion === 'ELECCION PASIVA') {
        clearTimeout(pasiva_timeout);
        process.env.eleccion = 'ACUERDO';
      }
      process.env.coordinador = message.candidato;
      break;
    case 'noCoordinador':
      if (process.env.eleccion === 'ELECCION PASIVA') {
        process.env.eleccion = 'ELECCION ACTIVA';
        _.defer(eleccionActiva);
      }
      break;
  }
});
