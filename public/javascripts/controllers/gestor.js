var app = angular.module('myApp', []);

app.controller('gestor', [
  '$scope',
  '$http',
  '$interval',
  function($scope, $http, $interval) {
    'use strict';

    // Informacion sobre los servidores
    $scope.servidores = [];
    // Informacion sobre los procesos
    $scope.infoProcesos = {};

    /*
    Añadir informacion sobre los servidores conocidos
   */
    $scope.guardarServidor = function(servidor) {
      if (servidor.split(':')[0] === '127.0.0.1') {
        return;
      }
      $http({
        method: 'GET',
        url: 'http://' + servidor + '/servicio/informacion/self'
      }).then(function successCallback(response) {
        console.log(response.data);
        // Actualizamos el servidor con la informacion sobre el resto
        angular.forEach($scope.servidores, function(server) {
          angular.forEach(server.procesos, function(proceso) {
            postInfo(proceso, servidor, server.servidor);
          });
        });
        // Añadimos la informacion del servidor
        $scope.servidores.push({
          servidor: servidor,
          procesos: response.data.procesos
        });
        // Actualizamos la informacion sobre los procesos
        angular.forEach(response.data.procesos, function(value) {
          getInfo(value, servidor);
        });
      }, function errorCallback(response) {});
    };

    /*
    Crear un proceso (no en el servidor)
   */
    $scope.crearProceso = function(idProceso, servidor) {
      servidor.procesos.push(idProceso);
      $scope.arrancarProceso(idProceso, servidor.servidor);
    };

    /*
    Arrancar un proceso
   */
    $scope.arrancarProceso = function(idProceso, servidor) {
      $http({
        method: 'GET',
        url: 'http://' + servidor + '/servicio/arrancar',
        params: {
          id: idProceso
        }
      }).then(function successCallback(response) {
        console.log(response.data);
        getInfo(idProceso, servidor);
        // Avisamos a todos los servidores de que hemos iniciado un proceso
        angular.forEach($scope.servidores, function(value) {
          if (value.servidor !== servidor) {
            postInfo(idProceso, value.servidor, servidor);
          }
        });
      }, function errorCallback(response) {});
    };

    /*
    Parar un proceso
   */
    $scope.pararProceso = function(idProceso, servidor) {
      $http({
        method: 'GET',
        url: 'http://' + servidor + '/servicio/parar',
        params: {
          id: idProceso
        }
      }).then(function successCallback(response) {
        console.log(response.data);
        getInfo(idProceso, servidor);
      }, function errorCallback(response) {});
    };

    /*
    Obtener la informacion de un proceso
   */
    var getInfo = function(idProceso, servidor) {
      $http({
        method: 'GET',
        url: 'http://' + servidor + '/servicio/informacion/proceso',
        params: {
          id: idProceso
        }
      }).then(function successCallback(response) {
        console.log(response.data);
        $scope.infoProcesos[idProceso] = response.data;
      }, function errorCallback(response) {});
    };

    /*
    Enviar la informacion de un proceso
   */
    var postInfo = function(idProceso, servidor, host) {
      $http({
        method: 'POST',
        url: 'http://' + servidor + '/servicio/informacion',
        data: {
          servidor: host,
          id: idProceso,
        }
      }).then(function successCallback(response) {
        console.log(response.data);
      }, function errorCallback(response) {});
    };

    /*
    Actualizar la informacion de los procesos
   */
    $interval(function() {
      angular.forEach($scope.servidores, function(servidor) {
        angular.forEach(servidor.procesos, function(idProceso) {
          getInfo(idProceso, this.servidor);
        }, servidor);
      });
    }, 1000);
  }
]);
