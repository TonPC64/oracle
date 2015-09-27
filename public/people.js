angular.module('bananaitAPP', [])
  .controller('peopleController', function ($http, $scope) {
    var people = this
    $scope.items = []
    people.lastpk = 1
    var socket = io.connect()
    $http.get('/user').then(function (response) {
      $scope.items = response.data
      people.lastpk = $scope.items[$scope.items.length - 1].ID
      people.lastpk++
    }, function (response) {
      console.log(response)
    })

    socket.on('push', function (data) {
      $scope.items.push(data)
      people.lastpk++
      console.log(data)
      $scope.$apply()
    })

    people.addUser = function () {
      var data = {ID: people.lastpk,  NAME: people.name, SURNAME: people.surname}
      socket.emit('addUser', data)
      $http.post('/user', data).then(function (response) {
        people.name = ''
        people.surname = ''

      }, function (response) {
        console.log(response)
      })

    }

    people.editUser = function (index) {
      var data = $scope.items[index]
      $http.put('/user', data).then(function (response) {
        console.log(response)
      }, function (response) {
        console.log(response)
      })

    }

    people.deleteUser = function (index) {
      var data = $scope.items[index].ID

      $http.delete('/user/' + data, {}).then(function (response) {
        $scope.items.splice(index, 1)
      }, function (response) {
        console.log(response)
      })
      people.lastpk--
    }

  })
