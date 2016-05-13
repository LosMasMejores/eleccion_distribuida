var app = angular.module('myApp', []);

app.controller('gestor', function($scope, $http) {
  $scope.servidores = [];
  $scope.info = {};

  $scope.guardarServidor = function(servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/informacion",
      params: {
        self: true
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.servidores.push({
        servidor: servidor,
        procesos: response.data.procesos
      });
      response.data.procesos.forEach(function(value) {
        infoProcesos(value, servidor);
      });
    }, function errorCallback(response) {});
  };

  $scope.crear = function(pro, servidor) {
    servidor.procesos.push(pro);
    $http({
      method: 'GET',
      url: "http://" + servidor.servidor + "/servicio/informacion",
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  }

  $scope.arrancar = function(pro, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/arrancar",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      infoProcesos(pro, servidor);
    }, function errorCallback(response) {});
  };

  $scope.parar = function(pro, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/parar",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      infoProcesos(pro, servidor);
    }, function errorCallback(response) {});
  };

  var infoProcesos = function(pro, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/informacion",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.info[pro] = response.data;
    }, function errorCallback(response) {});
  }

  setInterval(function(){
    $scope.servidores.forEach(function(serv){
      serv.procesos.forEach(function(pro){
        infoProcesos(pro, serv.servidor);
      });
    });
  }, 1000);
});
