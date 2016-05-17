/**
 * Created by Javier&Emilio on 01/05/2016.
 */

/*jslint node: true */

var async = require('async');
var request = require('request');
var _ = require('underscore');
var EventEmitter = require('events');

var activa_timeout;
var pasiva_timeout;
var myEmitter = new EventEmitter();

/**
 * Tarea principal del proceso
 * @param  {Function} next Callback que se llama en cada iteracion
 * @return {undefined} No devuelve ningun valor, solo sirve para asegurarse se
 * que no se continua
 */
var run = (next) => {
  'use strict';
  // console.log(process.env.id + ' run()');
  if (process.env.estado === 'PARADO') {
    return next(process.env.id + ' run() PARADO');
  }
  _.delay(() => {
    request.get('http://' + process.env.servidor + '/servicio/informacion', (error, response, body) => {
      if (!error && response.statusCode === 200) {
        var info = JSON.parse(body)[process.env.coordinador];
        if (!info) {
          myEmitter.emit('eleccion', {
            cmd: 'eleccion'
          });
          return next();
        }
        request.get('http://' + info.server + '/servicio/computar?id=' + process.env.coordinador, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            if (JSON.parse(body).resultado === -1) {
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
        }).on('error', (err) => {
          console.log(err);
        });
      }
    });
  }, parseInt(Math.random() * 500) + 500);
};

/**
 * Funcion que simula la operacion de computar del coordinador
 * @return {number} Resultado de la operacion
 */
var computar = () => {
  'use strict';
  // console.log(process.env.id + ' computar()');
  if (process.env.estado === 'PARADO') {
    process.send({
      cmd: 'computar',
      computar: {
        resultado: -1
      },
      id: process.env.id
    });
    return -1;
  } else {
    setTimeout(() => {
      process.send({
        cmd: 'computar',
        computar: {
          resultado: 1
        },
        id: process.env.id
      });
      return 1;
    }, parseInt(Math.random() * 200) + 100);
  }
};

/**
 * Parte del proceso de eleccion que se corresponde con la eleccion activa
 * @return {undefined} No devuelve nada
 */
var eleccionActiva = () => {
  'use strict';
  // console.log(process.env.id + ' eleccionActiva()');
  request.get('http://' + process.env.servidor + '/servicio/informacion', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var info = JSON.parse(body);
      var at_least_one = false;
      _.each(info, (val, key) => {
        if (key > process.env.id) {
          request.get('http://' + val.server + '/servicio/eleccion?id=' + key + '&candidato=' + process.env.id).on('error', (err) => {
            console.log(err);
          });
          at_least_one = true;
        }
      });
      if (at_least_one) {
        activa_timeout = setTimeout(() => {
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
};

/**
 * Parte del proceso de eleccion que se corresponde con la eleccion pasiva
 * @return {undefined} No devuelve nada
 */
var eleccionPasiva = () => {
  'use strict';
  // console.log(process.env.id + ' eleccionPasiva()');
  pasiva_timeout = setTimeout(() => {
    myEmitter.emit('eleccion', {
      cmd: 'noCoordinador'
    });
  }, 1000);
};

/**
 * Funcion que se encarga de avisar al resto de procesos de que somos el
 * coordinador
 * @return {undefined} No devuelve nada
 */
var avisar = () => {
  'use strict';
  // console.log(process.env.id + ' avisar()');
  request.get('http://' + process.env.servidor + '/servicio/informacion', (error, response, body) => {
    var info = JSON.parse(body);
    if (!error && response.statusCode === 200) {
      _.each(info, (val, key) => {
        if (key !== process.env.id) {
          request.get('http://' + val.server + '/servicio/coordinador?id=' + key + '&candidato=' + process.env.id).on('error', (err) => {
            console.log(err);
          });
        }
      });
    }
  });
};

/**
 * Listener que se encarga de gestionar los mensages enviados por servicio
 * @param  {object} message Mensaje enviado por servicio
 * @return {undefined} No devuelve nada
 */
process.on('message', (message) => {
  'use strict';
  switch (message.cmd) {
    case 'arrancar':
      if (process.env.estado === 'CORRIENDO') {
        break;
      }
      process.env.estado = 'CORRIENDO';
      myEmitter.emit('eleccion', {
        cmd: 'eleccion'
      });
      async.forever(run, (err) => {
        console.log(err);
      });
      break;
    case 'parar':
      process.env.estado = 'PARADO';
      break;
    case 'computar':
      _.defer(computar);
      break;
    case 'informacion':
      process.send({
        cmd: 'info',
        id: process.env.id,
        info: process.env
      });
      break;
    case 'eleccion':
      if (process.env.estado === 'PARADO') {
        break;
      }
      request.get('http://' + process.env.servidor + '/servicio/informacion', (error, response, body) => {
        if (!error && response.statusCode === 200) {
          var info = JSON.parse(body);
          if (info[message.candidato]) {
            request.get('http://' + info[message.candidato].server + '/servicio/ok?id=' + message.candidato).on('error', (err) => {
              console.log(err);
            });
          }
        }
      });
      myEmitter.emit('eleccion', message);
      break;
    case 'ok':
      if (process.env.estado === 'PARADO') {
        break;
      }
      myEmitter.emit('eleccion', message);
      break;
    case 'coordinador':
      if (process.env.estado === 'PARADO') {
        break;
      }
      myEmitter.emit('eleccion', message);
      break;
  }
});

/**
 * Listener que se encarga de gestionar los eventos del proceso
 * @param  {object} message Mensaje enviado por el emisor
 * @return {undefined} No devuelve nada
 */
myEmitter.on('eleccion', (message) => {
  'use strict';
  switch (message.cmd) {
    case 'eleccion':
      if (process.env.eleccion === 'ACUERDO') {
        process.env.eleccion = 'ELECCION ACTIVA';
        _.defer(eleccionActiva);
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
      }
      if (message.candidato < process.env.id) {
        myEmitter.emit('eleccion', {
          cmd: 'eleccion'
        });
        break;
      }
      process.env.coordinador = message.candidato;
      process.env.eleccion = 'ACUERDO';
      break;
    case 'noCoordinador':
      if (process.env.eleccion === 'ELECCION PASIVA') {
        process.env.eleccion = 'ELECCION ACTIVA';
        _.defer(eleccionActiva);
      }
      break;
  }
});
