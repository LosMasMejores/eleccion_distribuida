var app = angular.module('myApp', []);


app.controller('gestor', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
  "use strict";
  $scope.servidores = [];
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
      url: "http://" + servidor + "/servicio/informacion/self",
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.servidores.forEach(function(value) {
        value.procesos.forEach(function(subValue) {
          postInfo(subValue, servidor, value.servidor);
        });
      });
      $scope.servidores.push({
        servidor: servidor,
        procesos: response.data.procesos
      });
      response.data.procesos.forEach(function(value) {
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
      url: "http://" + servidor + "/servicio/arrancar",
      params: {
        id: idProceso
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      getInfo(idProceso, servidor);
      $scope.servidores.forEach(function(value) {
        if (value.servidor !== servidor.servidor) {
          postInfo(idProceso, value.servidor, servidor.servidor);
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
      url: "http://" + servidor + "/servicio/parar",
      params: {
        id: idProceso
      },
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
      url: "http://" + servidor + "/servicio/informacion/proceso",
      params: {
        id: idProceso
      },
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
      url: "http://" + servidor + "/servicio/informacion",
      data: {
        servidor: host,
        id: idProceso
      },
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  };

  /*
  Actualizar la informacion de los procesos
   */
  $interval(function(){
    $scope.servidores.forEach(function(servidor){
      servidor.procesos.forEach(function(idProceso){
        getInfo(idProceso, servidor.servidor);
      });
    });
  }, 1000);
}]);
