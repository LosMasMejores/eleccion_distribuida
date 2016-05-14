var app = angular.module('myApp', []);


app.controller('gestor', function($scope, $http, $interval) {
  "use strict";
  $scope.servidores = [];
  $scope.infoProcesos = {};

  $scope.guardarServidor = function(servidor) {
    if (servidor.split(':')[0] === '127.0.0.1') {
      return;
    }
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/informacion",
      params: {
        self: true
      },
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

  $scope.crear = function(idProceso, servidor) {
    servidor.procesos.push(idProceso);
    $http({
      method: 'GET',
      url: "http://" + servidor.servidor + "/servicio/informacion",
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.servidores.forEach(function(value) {
        if (value.servidor != servidor.servidor) {
          postInfo(idProceso, value.servidor, servidor.servidor);
        }
      })
    }, function errorCallback(response) {});
  }

  $scope.arrancar = function(idProceso, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/arrancar",
      params: {
        id: idProceso
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      getInfo(idProceso, servidor);
    }, function errorCallback(response) {});
  };

  $scope.parar = function(idProceso, servidor) {
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

  var getInfo = function(idProceso, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/informacion",
      params: {
        id: idProceso
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.infoProcesos[idProceso] = response.data;
    }, function errorCallback(response) {});
  }

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
  }

  /*$interval(function(){
    $scope.servidores.forEach(function(servidor){
      servidor.procesos.forEach(function(idProceso){
        getInfo(idProceso, servidor.servidor);
      });
    });
  }, 5000);*/
});
