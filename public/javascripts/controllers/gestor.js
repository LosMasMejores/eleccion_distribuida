var app = angular.module('myApp', []);

app.controller('gestor', function($scope, $http) {

  $scope.servidores = [];
  

  $scope.guardarServidor = function(servidor){
    var tmp = {
      servidor: servidor,
      procesos: []
    };
    $http({
      method:'GET',
      url: "http://"+ tmp.servidor +"/servicio/informacion?self=true",
    }).then(function successCallback(response) {
      console.log(response.data);
      response.data.procesos.forEach(function(value){
        tmp.procesos.push({
          id: value
        });
      });
      $scope.servidores.push(tmp);
    }, function errorCallback(response){
    });

  };

  $scope.crear = function(pro, servidor){
    servidor.procesos.push({id:pro});
    $http({
      method:'GET',
      url: "http://"+ servidor.servidor +"/servicio/informacion",
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });
  }

  $scope.arrancar = function(pro, servidor){
    
    $http({
      method:'GET',
      url: "http://"+ servidor +"/servicio/arrancar",
      params: {id: pro},
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });

  };

  $scope.parar = function(pro, servidor){
    $http({
      method:'GET',
      url: "http://"+ servidor +"/servicio/parar",
      params: {id: pro},
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });

  };
});