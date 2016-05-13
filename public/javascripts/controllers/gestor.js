var app = angular.module('myApp', []);


app.controller('gestor', function($scope, $http) {
  $scope.servidores = [];
  $scope.infoProcesos = {};

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
        getInfo(value, servidor);
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
      $scope.servidores.forEach(function(value) {
        if (value.servidor != servidor.servidor) {
          postInfo(pro, value.servidor, servidor.servidor);
        }
      })
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
      getInfo(pro, servidor);
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
      getInfo(pro, servidor);
    }, function errorCallback(response) {});
  };

  var getInfo = function(pro, servidor) {
    $http({
      method: 'GET',
      url: "http://" + servidor + "/servicio/informacion",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
      $scope.infoProcesos[pro] = response.data;
    }, function errorCallback(response) {});
  }

  var postInfo = function(pro, servidor, host) {
    $http({
      method: 'POST',
      url: "http://" + servidor + "/servicio/informacion",
      data: {
        servidor: host,
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  }

  /*setInterval(function(){
    $scope.servidores.forEach(function(servidor){
      servidor.procesos.forEach(function(pro){
        getInfo(pro, servidor.servidor);
      });
    });
  }, 5000);*/
});
