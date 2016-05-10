var app = angular.module('myApp', []);

app.controller('servidor', function($scope, $http) {
  $scope.ip = "ip";
  $scope.pro = "proceso";
  $scope.mostrar = false;
  $scope.mostrar2 = false;
  $scope.ipArray = [];
  $scope.servArray = [];


  $scope.llamar = function(ip) {
    $scope.ipArray.push(ip);
    $scope.mostrar = true;
  };


  $scope.crear = function(pro) {
    $scope.servArray.push(pro);
    $http({
      method: 'GET',
      url: "http://" + $scope.ipArray[0] + "/servicio/informacion",
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
    $scope.mostrar2 = true;
  };


  $scope.arrancar = function(pro) {
    $http({
      method: 'GET',
      url: "http://" + $scope.ipArray[0] + "/servicio/arrancar",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  };


  $scope.parar = function(pro) {
    $http({
      method: 'GET',
      url: "http://" + $scope.ipArray[0] + "/servicio/parar",
      params: {
        id: pro
      },
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  };


  $scope.informar = function() {
    $scope.numServer = $scope.servArray.length;
    $scope.coor = 0;
    for (var i = $scope.numServer - 1; i >= 0; i--) {
      var j = 0;
      do {
        if ($scope.coor <= $scope.servArray[j]) {
          $scope.coor = $scope.servArray[j];
        }
        j++;
      } while ($scope.servArray[j] != null);
    };
    $http({
      method: 'GET',
      url: "http://" + $scope.ipArray[0] + "/servicio/informar",
      params: {
        id: coor
      },
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {});
  };
});
