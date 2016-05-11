var app = angular.module('myApp', []);

app.controller('servidor', function($scope, $http) {
  $scope.ip = "ip";
  $scope.pro = "proceso";
  $scope.mostrar = false;
  $scope.mostrar2 = false;
  $scope.servidores = [];
  

  $scope.guardarServidor = function(ip){
    $scope.servidores.push({servidor: ip,
          procesos: []});
    $scope.mostrar = true;

    
  };

  $scope.crear = function(pro, index){
    $scope.servidores[index].procesos.push({id:pro});
    $http({
      method:'GET',
      url: "http://"+ $scope.servidores[index].servidor +"/servicio/informacion",
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });
    $scope.mostrar2 = true;
  };

  $scope.arrancar = function(pro, index){
    
    $http({
      method:'GET',
      url: "http://"+ $scope.ipArray[index].servidor +"/servicio/arrancar",
      params: {id: pro},
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });

  };

  $scope.parar = function(pro, index){
    $http({
      method:'GET',
      url: "http://"+ $scope.ipArray[index].servidor +"/servicio/parar",
      params: {id: pro},
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response){
    });

  };
});