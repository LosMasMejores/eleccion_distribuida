var app = angular.module('myApp', []);

app.controller('gestor', function($scope, $http) {

  $scope.servidores = [];
  

  $scope.guardarServidor = function(servidor){
    $scope.servidores.push({servidor: servidor,
          procesos: []}); 
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