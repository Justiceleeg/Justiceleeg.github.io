'use strict';

angular.module('snowApp', ['ui.router']).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state('home', {
    url: '/',
    templateUrl: './app/routes/home/home.html',
    controller: 'homeCTRL'
  }).state('dashboard', {
    url: '/dashboard/:latitude/:longitude',
    templateUrl: './app/routes/dashboard/dashboard.html',
    controller: 'dashboardCTRL'
  }).state('forecast', {
    url: '/forecast',
    templateUrl: './app/routes/forecast/forecast.html',
    controller: 'forecastCTRL'
  });

  $urlRouterProvider.otherwise('/');
}]);
'use strict';

angular.module('snowApp').directive('graphDirective', function () {

  return {
    restrict: 'E',
    controller: 'dashboardCTRL',
    scope: {
      dataOfSlopes: '='
    },
    link: function link(scope, elem, attrs) {
      var windowW = window.innerWidth;
      var windowH = window.innerHeight;

      var margin = { right: 25, bottom: 25, left: 25 };

      var w = Math.floor(windowW * 0.8) - margin.right - margin.left;
      var h = Math.floor(windowH * 0.45) - margin.bottom;

      var svgContainer = d3.select('body').append('svg').attr({ width: w, height: h }).attr("transform", "translate(" + margin.left + ")");

      // scope.$watch('dataOfSlopes', function(){
      var data = [{ 'date': 1, 'snowDepth': 1 }, { 'date': 2, 'snowDepth': 4 }, { 'date': 3, 'snowDepth': 25 }, { 'date': 4, 'snowDepth': 15 }, { 'date': 5, 'snowDepth': 10 }, { 'date': 6, 'snowDepth': 1 }];
      var lineFun = d3.svg.line().x(function (d, i) {
        return d.date * 100;
      }).y(function (d) {
        return h - d.snowDepth * 10;
      }).interpolate('linear');

      var svg = d3.select('#graph').append('svg').attr({
        width: w, height: h
      });

      var viz = svg.append('path').attr({
        d: lineFun(data),
        'stroke': 'blue',
        'stroke-width': 2,
        'fill': 'none'
      });
      // });
      // scope.$watch('w',function(){
      // var svg = d3.select('#graph').append('svg').attr({width: w, height: h});
      // var vis = svg.append('path')
      // .attr({
      //   d: lineFun(data),
      //   'stroke': 'purple',
      //   'stroke-width': 2,
      //   'fill': 'none'
      // });
      //
      // },true)
    }

  };
});
'use strict';

angular.module('snowApp').directive('searchGoogle', function () {

  return {
    templateUrl: './app/directives/searchGoogle.html',
    restrict: 'E',
    scope: {
      funRun: '&'
    }
  };
});
'use strict';

angular.module('snowApp').service('apiService', ["$http", function ($http) {

    this.getLocation = function () {
        return $http({
            method: 'GET',
            url: 'https://ipapi.co/json/'
        });
    };

    this.getGoogleLocation = function (city, state) {
        var key = 'AIzaSyBeHtPq9RzPLk0GgUh2yb2ih7axOIVrI7g';
        return $http({
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + ',+' + state + '&key=' + key
        });
    };

    // Access-Control-Allow-Origin Error unfixable without a server
    this.getNearestSlopes = function (lat, long) {
        return $http({
            method: 'GET',
            url: 'https://cors-anywhere.herokuapp.com/http://api.powderlin.es/closest_stations?lat=' + lat + '&lng=' + long + '&data=true&days=0&count=5'
        });
    };

    this.getSingleSnowLocation = function (snowStation, dateStart, dateEnd) {
        if (!dateEnd) {
            var newDateEnd = new Date();
            dateEnd = newDateEnd.yyyymmdd();
        }

        if (dateStart.length != 10 || dateEnd.length != 10) {
            alert('Invalid date input');
            return;
        }

        function getRawData(snowStation, dateStart, dateEnd) {
            return $http({
                method: 'GET',
                url: 'https://cors-anywhere.herokuapp.com/http://api.powderlin.es/station/' + snowStation + '?start_date=' + dateStart + '&end_date=' + dateEnd //date format: YYYY-MM-DD
            }).then(function (response) {

                var slopeData = {
                    slopeName: response.data.station_information.name,
                    dailyData: response.data.data
                };

                for (var i = 0; i < slopeData.dailyData.length; i++) {
                    slopeData.dailyData[i] = {
                        date: slopeData.dailyData[i].Date,
                        snowDepth: parseInt(slopeData.dailyData[i]['Snow Depth (in)'])
                    };
                }

                return slopeData;
            });
        }

        return getRawData(snowStation, dateStart, dateEnd);

        // console.log(slopeData)

    };
}]);

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
};

var fiveClosest = [{
    "station_information": {
        "elevation": 7774,
        "location": {
            "lat": 40.283,
            "lng": -111.60992
        },
        "name": "CASCADE MOUNTAIN",
        "timezone": -7,
        "triplet": "1039:UT:SNTL",
        "wind": false
    },
    "distance": 4.3967305780460775,
    "data": [{
        "Date": "2017-05-05",
        "Snow Water Equivalent (in)": "3.5",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "56"
    }]
}, {
    "station_information": {
        "elevation": 8140,
        "location": {
            "lat": 40.42817,
            "lng": -111.61633
        },
        "name": "TIMPANOGOS DIVIDE",
        "timezone": -7,
        "triplet": "820:UT:SNTL",
        "wind": false
    },
    "distance": 6.58482436813277,
    "data": [{
        "Date": "2017-05-05",
        "Snow Water Equivalent (in)": "14.9",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "47"
    }]
}, {
    "station_information": {
        "elevation": 7399,
        "location": {
            "lat": 40.18505,
            "lng": -111.3594
        },
        "name": "HOBBLE CREEK",
        "timezone": -7,
        "triplet": "1223:UT:SNTL",
        "wind": false
    },
    "distance": 15.414449073459743,
    "data": [{
        "Date": "2017-05-05",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "50"
    }]
}, {
    "station_information": {
        "elevation": 9640,
        "location": {
            "lat": 40.564,
            "lng": -111.655
        },
        "name": "SNOWBIRD",
        "timezone": -7,
        "triplet": "766:UT:SNTL",
        "wind": false
    },
    "distance": 16.131421771590865,
    "data": [{
        "Date": "2017-05-05",
        "Snow Water Equivalent (in)": "59.7",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "111",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "44"
    }]
}, {
    "station_information": {
        "elevation": 8037,
        "location": {
            "lat": 40.29517,
            "lng": -111.25678
        },
        "name": "DANIELS-STRAWBERRY",
        "timezone": -7,
        "triplet": "435:UT:SNTL",
        "wind": true
    },
    "distance": 16.815254015466824,
    "data": [{
        "Date": "2017-05-05",
        "Snow Water Equivalent (in)": "9.6",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "43"
    }]
}];
//2016-12-01 to 2017-05-01
var closestOne = {
    "station_information": {
        "elevation": 7774,
        "location": {
            "lat": 40.283,
            "lng": -111.60992
        },
        "name": "CASCADE MOUNTAIN",
        "timezone": -7,
        "triplet": "1039:UT:SNTL",
        "wind": false
    },
    "data": [{
        "Date": "2016-12-01",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2016-12-02",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-03",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2016-12-04",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "13",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2016-12-05",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-06",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-07",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2016-12-08",
        "Snow Water Equivalent (in)": "3.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2016-12-09",
        "Snow Water Equivalent (in)": "3.8",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-10",
        "Snow Water Equivalent (in)": "3.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2016-12-11",
        "Snow Water Equivalent (in)": "4.6",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "20",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-12",
        "Snow Water Equivalent (in)": "4.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "19",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-13",
        "Snow Water Equivalent (in)": "4.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2016-12-14",
        "Snow Water Equivalent (in)": "4.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2016-12-15",
        "Snow Water Equivalent (in)": "4.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2016-12-16",
        "Snow Water Equivalent (in)": "4.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2016-12-17",
        "Snow Water Equivalent (in)": "7.0",
        "Change In Snow Water Equivalent (in)": "2.1",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2016-12-18",
        "Snow Water Equivalent (in)": "7.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "5"
    }, {
        "Date": "2016-12-19",
        "Snow Water Equivalent (in)": "7.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2016-12-20",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-21",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2016-12-22",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-23",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-24",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-25",
        "Snow Water Equivalent (in)": "7.6",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-26",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2016-12-27",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-28",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2016-12-29",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-30",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2016-12-31",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-01",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-02",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-03",
        "Snow Water Equivalent (in)": "9.5",
        "Change In Snow Water Equivalent (in)": "0.9",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-01-04",
        "Snow Water Equivalent (in)": "9.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-05",
        "Snow Water Equivalent (in)": "10.8",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "11",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-06",
        "Snow Water Equivalent (in)": "10.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "1"
    }, {
        "Date": "2017-01-07",
        "Snow Water Equivalent (in)": "10.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-08",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-09",
        "Snow Water Equivalent (in)": "12.3",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-01-10",
        "Snow Water Equivalent (in)": "12.9",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-11",
        "Snow Water Equivalent (in)": "13.3",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-12",
        "Snow Water Equivalent (in)": "14.2",
        "Change In Snow Water Equivalent (in)": "0.9",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-13",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-14",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-15",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-16",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-01-17",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-18",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-01-19",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-01-20",
        "Snow Water Equivalent (in)": "15.2",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-21",
        "Snow Water Equivalent (in)": "15.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-22",
        "Snow Water Equivalent (in)": "15.8",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-23",
        "Snow Water Equivalent (in)": "16.2",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-24",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "1.9",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-01-25",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-01-26",
        "Snow Water Equivalent (in)": "18.4",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2017-01-27",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-28",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": "9"
    }, {
        "Date": "2017-01-29",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-30",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-01-31",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-02-01",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-02",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-03",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-04",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-05",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-06",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-07",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-08",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-09",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-02-10",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-02-11",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-12",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-02-13",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-14",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-15",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-16",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-17",
        "Snow Water Equivalent (in)": "18.9",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-18",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-19",
        "Snow Water Equivalent (in)": "18.9",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-20",
        "Snow Water Equivalent (in)": "19.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-21",
        "Snow Water Equivalent (in)": "19.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-02-22",
        "Snow Water Equivalent (in)": "19.8",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-02-23",
        "Snow Water Equivalent (in)": "20.8",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-02-24",
        "Snow Water Equivalent (in)": "21.0",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-02-25",
        "Snow Water Equivalent (in)": "21.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2017-02-26",
        "Snow Water Equivalent (in)": "21.3",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-02-27",
        "Snow Water Equivalent (in)": "21.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-02-28",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-03-01",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-03-02",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-03-03",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-04",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-03-05",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-06",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-03-07",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-03-08",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-09",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-10",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-03-11",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-03-12",
        "Snow Water Equivalent (in)": "22.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-13",
        "Snow Water Equivalent (in)": "22.3",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-03-14",
        "Snow Water Equivalent (in)": "22.2",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "45"
    }, {
        "Date": "2017-03-15",
        "Snow Water Equivalent (in)": "22.0",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "52"
    }, {
        "Date": "2017-03-16",
        "Snow Water Equivalent (in)": "21.5",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "49"
    }, {
        "Date": "2017-03-17",
        "Snow Water Equivalent (in)": "21.0",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-03-18",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "50"
    }, {
        "Date": "2017-03-19",
        "Snow Water Equivalent (in)": "19.8",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-8",
        "Observed Air Temperature (degrees farenheit)": "51"
    }, {
        "Date": "2017-03-20",
        "Snow Water Equivalent (in)": "18.8",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "51"
    }, {
        "Date": "2017-03-21",
        "Snow Water Equivalent (in)": "17.9",
        "Change In Snow Water Equivalent (in)": "-0.9",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "51"
    }, {
        "Date": "2017-03-22",
        "Snow Water Equivalent (in)": "16.7",
        "Change In Snow Water Equivalent (in)": "-1.2",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-03-23",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "40",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-24",
        "Snow Water Equivalent (in)": "16.6",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-25",
        "Snow Water Equivalent (in)": "16.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-03-26",
        "Snow Water Equivalent (in)": "17.0",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-27",
        "Snow Water Equivalent (in)": "17.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-03-28",
        "Snow Water Equivalent (in)": "18.0",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-03-29",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-03-30",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-31",
        "Snow Water Equivalent (in)": "18.3",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-01",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-04-02",
        "Snow Water Equivalent (in)": "17.8",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-04-03",
        "Snow Water Equivalent (in)": "17.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-04",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-04-05",
        "Snow Water Equivalent (in)": "18.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-04-06",
        "Snow Water Equivalent (in)": "17.8",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-04-07",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "50"
    }, {
        "Date": "2017-04-08",
        "Snow Water Equivalent (in)": "16.3",
        "Change In Snow Water Equivalent (in)": "-0.9",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-04-09",
        "Snow Water Equivalent (in)": "16.6",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-10",
        "Snow Water Equivalent (in)": "16.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-11",
        "Snow Water Equivalent (in)": "16.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-04-12",
        "Snow Water Equivalent (in)": "16.6",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-04-13",
        "Snow Water Equivalent (in)": "16.2",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "51"
    }, {
        "Date": "2017-04-14",
        "Snow Water Equivalent (in)": "15.2",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "36",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-15",
        "Snow Water Equivalent (in)": "14.5",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-16",
        "Snow Water Equivalent (in)": "13.5",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-04-17",
        "Snow Water Equivalent (in)": "12.3",
        "Change In Snow Water Equivalent (in)": "-1.2",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "51"
    }, {
        "Date": "2017-04-18",
        "Snow Water Equivalent (in)": "11.0",
        "Change In Snow Water Equivalent (in)": "-1.3",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-04-19",
        "Snow Water Equivalent (in)": "10.2",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-20",
        "Snow Water Equivalent (in)": "9.9",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-04-21",
        "Snow Water Equivalent (in)": "9.6",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-22",
        "Snow Water Equivalent (in)": "9.9",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-23",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "-1.2",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "49"
    }, {
        "Date": "2017-04-24",
        "Snow Water Equivalent (in)": "8.2",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-04-25",
        "Snow Water Equivalent (in)": "8.1",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "19",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-26",
        "Snow Water Equivalent (in)": "8.4",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "20",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-27",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-28",
        "Snow Water Equivalent (in)": "8.9",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-04-29",
        "Snow Water Equivalent (in)": "8.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-30",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-05-01",
        "Snow Water Equivalent (in)": "7.8",
        "Change In Snow Water Equivalent (in)": "-0.9",
        "Snow Depth (in)": "20",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }]
};
var closestTwo = {
    "station_information": {
        "elevation": 8140,
        "location": {
            "lat": 40.42817,
            "lng": -111.61633
        },
        "name": "TIMPANOGOS DIVIDE",
        "timezone": -7,
        "triplet": "820:UT:SNTL",
        "wind": false
    },
    "data": [{
        "Date": "2016-12-01",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-02",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2016-12-03",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-04",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-05",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2016-12-06",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-07",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-08",
        "Snow Water Equivalent (in)": "2.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "5"
    }, {
        "Date": "2016-12-09",
        "Snow Water Equivalent (in)": "2.7",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-10",
        "Snow Water Equivalent (in)": "3.1",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2016-12-11",
        "Snow Water Equivalent (in)": "4.4",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-12",
        "Snow Water Equivalent (in)": "4.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-13",
        "Snow Water Equivalent (in)": "4.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-14",
        "Snow Water Equivalent (in)": "4.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-15",
        "Snow Water Equivalent (in)": "4.8",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2016-12-16",
        "Snow Water Equivalent (in)": "6.5",
        "Change In Snow Water Equivalent (in)": "1.7",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-17",
        "Snow Water Equivalent (in)": "9.0",
        "Change In Snow Water Equivalent (in)": "2.5",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2016-12-18",
        "Snow Water Equivalent (in)": "9.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "0"
    }, {
        "Date": "2016-12-19",
        "Snow Water Equivalent (in)": "9.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "37",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "3"
    }, {
        "Date": "2016-12-20",
        "Snow Water Equivalent (in)": "9.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2016-12-21",
        "Snow Water Equivalent (in)": "9.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-22",
        "Snow Water Equivalent (in)": "9.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2016-12-23",
        "Snow Water Equivalent (in)": "9.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2016-12-24",
        "Snow Water Equivalent (in)": "9.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2016-12-25",
        "Snow Water Equivalent (in)": "10.2",
        "Change In Snow Water Equivalent (in)": "0.9",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2016-12-26",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "8"
    }, {
        "Date": "2016-12-27",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2016-12-28",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-29",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2016-12-30",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-31",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-01",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-02",
        "Snow Water Equivalent (in)": "10.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-01-03",
        "Snow Water Equivalent (in)": "11.6",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-01-04",
        "Snow Water Equivalent (in)": "11.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-01-05",
        "Snow Water Equivalent (in)": "13.3",
        "Change In Snow Water Equivalent (in)": "1.5",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-06",
        "Snow Water Equivalent (in)": "13.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "-4"
    }, {
        "Date": "2017-01-07",
        "Snow Water Equivalent (in)": "13.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-08",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-09",
        "Snow Water Equivalent (in)": "14.7",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-01-10",
        "Snow Water Equivalent (in)": "17.3",
        "Change In Snow Water Equivalent (in)": "2.6",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-11",
        "Snow Water Equivalent (in)": "18.5",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-12",
        "Snow Water Equivalent (in)": "20.2",
        "Change In Snow Water Equivalent (in)": "1.7",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "11",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-13",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "83",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-14",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "80",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-15",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "77",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-01-16",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "74",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2017-01-17",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "73",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-01-18",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "72",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-19",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-01-20",
        "Snow Water Equivalent (in)": "20.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-21",
        "Snow Water Equivalent (in)": "21.3",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "78",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-22",
        "Snow Water Equivalent (in)": "21.9",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "85",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-23",
        "Snow Water Equivalent (in)": "22.8",
        "Change In Snow Water Equivalent (in)": "0.9",
        "Snow Depth (in)": "86",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-24",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "2.2",
        "Snow Depth (in)": "98",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-25",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "93",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-01-26",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "91",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2017-01-27",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "88",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2017-01-28",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "87",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2017-01-29",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "85",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-30",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "83",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-31",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-02-01",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "81",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-02-02",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "80",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-02-03",
        "Snow Water Equivalent (in)": "25.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "80",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-02-04",
        "Snow Water Equivalent (in)": "25.6",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-05",
        "Snow Water Equivalent (in)": "25.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-06",
        "Snow Water Equivalent (in)": "25.7",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "80",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-07",
        "Snow Water Equivalent (in)": "26.6",
        "Change In Snow Water Equivalent (in)": "0.9",
        "Snow Depth (in)": "84",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-08",
        "Snow Water Equivalent (in)": "29.1",
        "Change In Snow Water Equivalent (in)": "2.5",
        "Snow Depth (in)": "92",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-09",
        "Snow Water Equivalent (in)": "29.2",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "88",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-02-10",
        "Snow Water Equivalent (in)": "29.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "-6",
        "Observed Air Temperature (degrees farenheit)": "45"
    }, {
        "Date": "2017-02-11",
        "Snow Water Equivalent (in)": "31.0",
        "Change In Snow Water Equivalent (in)": "1.8",
        "Snow Depth (in)": "85",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-12",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "89",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-02-13",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "88",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-02-14",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "86",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-02-15",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "85",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-02-16",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "84",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-17",
        "Snow Water Equivalent (in)": "31.4",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "82",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-18",
        "Snow Water Equivalent (in)": "31.2",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "84",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-19",
        "Snow Water Equivalent (in)": "31.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "83",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-20",
        "Snow Water Equivalent (in)": "31.9",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "87",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-21",
        "Snow Water Equivalent (in)": "32.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "87",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-22",
        "Snow Water Equivalent (in)": "32.4",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "88",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-02-23",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "96",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-02-24",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "96",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-02-25",
        "Snow Water Equivalent (in)": "32.5",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "94",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "5"
    }, {
        "Date": "2017-02-26",
        "Snow Water Equivalent (in)": "32.3",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "93",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2017-02-27",
        "Snow Water Equivalent (in)": "32.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "92",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-02-28",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "97",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-03-01",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "95",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-03-02",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "95",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-03-03",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "93",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-03-04",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "92",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-03-05",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "90",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-06",
        "Snow Water Equivalent (in)": "33.0",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "92",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-03-07",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "91",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-03-08",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "90",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-09",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "88",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-10",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "86",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-11",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "85",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-12",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "84",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-13",
        "Snow Water Equivalent (in)": "33.0",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "83",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-14",
        "Snow Water Equivalent (in)": "32.9",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "81",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-15",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "79",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-03-16",
        "Snow Water Equivalent (in)": "32.4",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "77",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "48"
    }, {
        "Date": "2017-03-17",
        "Snow Water Equivalent (in)": "31.6",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "76",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "45"
    }, {
        "Date": "2017-03-18",
        "Snow Water Equivalent (in)": "30.8",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "73",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-19",
        "Snow Water Equivalent (in)": "30.3",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-20",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-03-21",
        "Snow Water Equivalent (in)": "28.8",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-22",
        "Snow Water Equivalent (in)": "28.1",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "45"
    }, {
        "Date": "2017-03-23",
        "Snow Water Equivalent (in)": "27.9",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-03-24",
        "Snow Water Equivalent (in)": "27.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-03-25",
        "Snow Water Equivalent (in)": "27.7",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-03-26",
        "Snow Water Equivalent (in)": "27.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-03-27",
        "Snow Water Equivalent (in)": "27.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-03-28",
        "Snow Water Equivalent (in)": "28.3",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "73",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-29",
        "Snow Water Equivalent (in)": "27.6",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-03-30",
        "Snow Water Equivalent (in)": "27.9",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-03-31",
        "Snow Water Equivalent (in)": "29.3",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "77",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-01",
        "Snow Water Equivalent (in)": "29.2",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "72",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-02",
        "Snow Water Equivalent (in)": "28.9",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-03",
        "Snow Water Equivalent (in)": "28.4",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-04",
        "Snow Water Equivalent (in)": "28.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-05",
        "Snow Water Equivalent (in)": "28.3",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-04-06",
        "Snow Water Equivalent (in)": "28.0",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-04-07",
        "Snow Water Equivalent (in)": "27.6",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-04-08",
        "Snow Water Equivalent (in)": "27.3",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-04-09",
        "Snow Water Equivalent (in)": "27.7",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-04-10",
        "Snow Water Equivalent (in)": "27.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-04-11",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-12",
        "Snow Water Equivalent (in)": "26.8",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-04-13",
        "Snow Water Equivalent (in)": "26.7",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-04-14",
        "Snow Water Equivalent (in)": "25.5",
        "Change In Snow Water Equivalent (in)": "-1.2",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-15",
        "Snow Water Equivalent (in)": "23.6",
        "Change In Snow Water Equivalent (in)": "-1.9",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-16",
        "Snow Water Equivalent (in)": "23.1",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-17",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "45"
    }, {
        "Date": "2017-04-18",
        "Snow Water Equivalent (in)": "22.2",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-04-19",
        "Snow Water Equivalent (in)": "21.9",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-20",
        "Snow Water Equivalent (in)": "20.1",
        "Change In Snow Water Equivalent (in)": "-1.8",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-21",
        "Snow Water Equivalent (in)": "19.8",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-04-22",
        "Snow Water Equivalent (in)": "19.4",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-04-23",
        "Snow Water Equivalent (in)": "19.1",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-04-24",
        "Snow Water Equivalent (in)": "18.4",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-04-25",
        "Snow Water Equivalent (in)": "18.6",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-26",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-27",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-28",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-04-29",
        "Snow Water Equivalent (in)": "19.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-04-30",
        "Snow Water Equivalent (in)": "19.1",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-05-01",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }]
};
var closestThree = {
    "station_information": {
        "elevation": 7399,
        "location": {
            "lat": 40.18505,
            "lng": -111.3594
        },
        "name": "HOBBLE CREEK",
        "timezone": -7,
        "triplet": "1223:UT:SNTL",
        "wind": false
    },
    "data": [{
        "Date": "2016-12-01",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2016-12-02",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "13",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-03",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2016-12-04",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2016-12-05",
        "Snow Water Equivalent (in)": "2.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "13",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-06",
        "Snow Water Equivalent (in)": "2.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "11",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-07",
        "Snow Water Equivalent (in)": "2.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "11",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "9"
    }, {
        "Date": "2016-12-08",
        "Snow Water Equivalent (in)": "2.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2016-12-09",
        "Snow Water Equivalent (in)": "2.6",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-10",
        "Snow Water Equivalent (in)": "2.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-11",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "20",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-12",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-13",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-14",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-15",
        "Snow Water Equivalent (in)": "3.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2016-12-16",
        "Snow Water Equivalent (in)": "3.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2016-12-17",
        "Snow Water Equivalent (in)": "5.0",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2016-12-18",
        "Snow Water Equivalent (in)": "5.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "5"
    }, {
        "Date": "2016-12-19",
        "Snow Water Equivalent (in)": "5.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2016-12-20",
        "Snow Water Equivalent (in)": "5.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2016-12-21",
        "Snow Water Equivalent (in)": "5.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-22",
        "Snow Water Equivalent (in)": "5.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-23",
        "Snow Water Equivalent (in)": "5.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-24",
        "Snow Water Equivalent (in)": "5.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-25",
        "Snow Water Equivalent (in)": "5.8",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-26",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-27",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "8"
    }, {
        "Date": "2016-12-28",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-29",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2016-12-30",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-31",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-01",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-02",
        "Snow Water Equivalent (in)": "6.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-03",
        "Snow Water Equivalent (in)": "6.8",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-01-04",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "36",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-05",
        "Snow Water Equivalent (in)": "9.1",
        "Change In Snow Water Equivalent (in)": "1.9",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-01-06",
        "Snow Water Equivalent (in)": "9.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "-2"
    }, {
        "Date": "2017-01-07",
        "Snow Water Equivalent (in)": "9.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-08",
        "Snow Water Equivalent (in)": "9.5",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-01-09",
        "Snow Water Equivalent (in)": "10.1",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-01-10",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-11",
        "Snow Water Equivalent (in)": "12.0",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-12",
        "Snow Water Equivalent (in)": "13.2",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-13",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-01-14",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-15",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-16",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-01-17",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2017-01-18",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-19",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-01-20",
        "Snow Water Equivalent (in)": "13.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-21",
        "Snow Water Equivalent (in)": "13.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-22",
        "Snow Water Equivalent (in)": "13.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-01-23",
        "Snow Water Equivalent (in)": "14.3",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-24",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "1.6",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-25",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-01-26",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-01-27",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-28",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2017-01-29",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-01-30",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-31",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-02-01",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-02",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-02-03",
        "Snow Water Equivalent (in)": "16.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-02-04",
        "Snow Water Equivalent (in)": "16.2",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-05",
        "Snow Water Equivalent (in)": "16.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-06",
        "Snow Water Equivalent (in)": "16.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-07",
        "Snow Water Equivalent (in)": "16.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-08",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-09",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-02-10",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-02-11",
        "Snow Water Equivalent (in)": "17.4",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-12",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-02-13",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-02-14",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-02-15",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-02-16",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-02-17",
        "Snow Water Equivalent (in)": "17.6",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-18",
        "Snow Water Equivalent (in)": "17.5",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-19",
        "Snow Water Equivalent (in)": "17.4",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-02-20",
        "Snow Water Equivalent (in)": "17.6",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-21",
        "Snow Water Equivalent (in)": "17.5",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-02-22",
        "Snow Water Equivalent (in)": "17.4",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-02-23",
        "Snow Water Equivalent (in)": "18.2",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-02-24",
        "Snow Water Equivalent (in)": "18.6",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2017-02-25",
        "Snow Water Equivalent (in)": "18.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2017-02-26",
        "Snow Water Equivalent (in)": "18.9",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2017-02-27",
        "Snow Water Equivalent (in)": "18.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-02-28",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2017-03-01",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-03-02",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-03-03",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-03-04",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-05",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-03-06",
        "Snow Water Equivalent (in)": "19.7",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-03-07",
        "Snow Water Equivalent (in)": "20.0",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-03-08",
        "Snow Water Equivalent (in)": "20.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-09",
        "Snow Water Equivalent (in)": "20.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-10",
        "Snow Water Equivalent (in)": "19.6",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-03-11",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-12",
        "Snow Water Equivalent (in)": "18.4",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-13",
        "Snow Water Equivalent (in)": "18.3",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-14",
        "Snow Water Equivalent (in)": "17.6",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-03-15",
        "Snow Water Equivalent (in)": "16.8",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-03-16",
        "Snow Water Equivalent (in)": "15.8",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-03-17",
        "Snow Water Equivalent (in)": "15.2",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-03-18",
        "Snow Water Equivalent (in)": "14.5",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-03-19",
        "Snow Water Equivalent (in)": "13.7",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "37",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-20",
        "Snow Water Equivalent (in)": "12.9",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-03-21",
        "Snow Water Equivalent (in)": "12.3",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-22",
        "Snow Water Equivalent (in)": "11.6",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-03-23",
        "Snow Water Equivalent (in)": "11.0",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-24",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-03-25",
        "Snow Water Equivalent (in)": "11.1",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-26",
        "Snow Water Equivalent (in)": "11.2",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-27",
        "Snow Water Equivalent (in)": "11.0",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-28",
        "Snow Water Equivalent (in)": "11.7",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "37",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-03-29",
        "Snow Water Equivalent (in)": "11.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-03-30",
        "Snow Water Equivalent (in)": "11.6",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-31",
        "Snow Water Equivalent (in)": "11.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-04-01",
        "Snow Water Equivalent (in)": "11.5",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-04-02",
        "Snow Water Equivalent (in)": "11.2",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-03",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-04",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-05",
        "Snow Water Equivalent (in)": "11.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-04-06",
        "Snow Water Equivalent (in)": "10.7",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-07",
        "Snow Water Equivalent (in)": "9.3",
        "Change In Snow Water Equivalent (in)": "-1.4",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-04-08",
        "Snow Water Equivalent (in)": "8.6",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-04-09",
        "Snow Water Equivalent (in)": "8.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-04-10",
        "Snow Water Equivalent (in)": "8.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-04-11",
        "Snow Water Equivalent (in)": "8.1",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-12",
        "Snow Water Equivalent (in)": "7.3",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2017-04-13",
        "Snow Water Equivalent (in)": "6.4",
        "Change In Snow Water Equivalent (in)": "-0.9",
        "Snow Depth (in)": "18",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "48"
    }, {
        "Date": "2017-04-14",
        "Snow Water Equivalent (in)": "5.5",
        "Change In Snow Water Equivalent (in)": "-0.9",
        "Snow Depth (in)": "16",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-15",
        "Snow Water Equivalent (in)": "5.2",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "13",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-16",
        "Snow Water Equivalent (in)": "4.2",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "10",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-04-17",
        "Snow Water Equivalent (in)": "2.9",
        "Change In Snow Water Equivalent (in)": "-1.3",
        "Snow Depth (in)": "8",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-04-18",
        "Snow Water Equivalent (in)": "1.8",
        "Change In Snow Water Equivalent (in)": "-1.1",
        "Snow Depth (in)": "4",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-04-19",
        "Snow Water Equivalent (in)": "0.8",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "2",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-04-20",
        "Snow Water Equivalent (in)": "0.2",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "1",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-04-21",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-22",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-04-23",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-04-24",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-25",
        "Snow Water Equivalent (in)": "0.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "1",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-26",
        "Snow Water Equivalent (in)": "0.3",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "2",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-04-27",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-04-28",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-04-29",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-30",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-05-01",
        "Snow Water Equivalent (in)": "0.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "0",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "40"
    }]
};
var closestFour = {
    "station_information": {
        "elevation": 9640,
        "location": {
            "lat": 40.564,
            "lng": -111.655
        },
        "name": "SNOWBIRD",
        "timezone": -7,
        "triplet": "766:UT:SNTL",
        "wind": false
    },
    "data": [{
        "Date": "2016-12-01",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-02",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-03",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2016-12-04",
        "Snow Water Equivalent (in)": "6.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "-25"
    }, {
        "Date": "2016-12-05",
        "Snow Water Equivalent (in)": "6.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-06",
        "Snow Water Equivalent (in)": "6.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2016-12-07",
        "Snow Water Equivalent (in)": "6.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2016-12-08",
        "Snow Water Equivalent (in)": "6.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "6"
    }, {
        "Date": "2016-12-09",
        "Snow Water Equivalent (in)": "6.7",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2016-12-10",
        "Snow Water Equivalent (in)": "7.2",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2016-12-11",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "1.5",
        "Snow Depth (in)": "36",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-12",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2016-12-13",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2016-12-14",
        "Snow Water Equivalent (in)": "8.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-15",
        "Snow Water Equivalent (in)": "9.3",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "39"
    }, {
        "Date": "2016-12-16",
        "Snow Water Equivalent (in)": "9.8",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2016-12-17",
        "Snow Water Equivalent (in)": "13.4",
        "Change In Snow Water Equivalent (in)": "3.6",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "18",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2016-12-18",
        "Snow Water Equivalent (in)": "13.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "-3"
    }, {
        "Date": "2016-12-19",
        "Snow Water Equivalent (in)": "13.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2016-12-20",
        "Snow Water Equivalent (in)": "13.5",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2016-12-21",
        "Snow Water Equivalent (in)": "13.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2016-12-22",
        "Snow Water Equivalent (in)": "13.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-23",
        "Snow Water Equivalent (in)": "13.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "43",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2016-12-24",
        "Snow Water Equivalent (in)": "13.6",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2016-12-25",
        "Snow Water Equivalent (in)": "15.6",
        "Change In Snow Water Equivalent (in)": "2.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "13",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2016-12-26",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2016-12-27",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-28",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2016-12-29",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2016-12-30",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2016-12-31",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-01",
        "Snow Water Equivalent (in)": "16.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-02",
        "Snow Water Equivalent (in)": "16.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-03",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "13",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-01-04",
        "Snow Water Equivalent (in)": "17.6",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-01-05",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "72",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-01-06",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-6",
        "Observed Air Temperature (degrees farenheit)": "5"
    }, {
        "Date": "2017-01-07",
        "Snow Water Equivalent (in)": "19.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-08",
        "Snow Water Equivalent (in)": "19.3",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-09",
        "Snow Water Equivalent (in)": "19.7",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-01-10",
        "Snow Water Equivalent (in)": "22.2",
        "Change In Snow Water Equivalent (in)": "2.5",
        "Snow Depth (in)": "72",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-11",
        "Snow Water Equivalent (in)": "23.4",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "78",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-01-12",
        "Snow Water Equivalent (in)": "24.8",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "86",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-01-13",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "83",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-01-14",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "79",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-15",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "79",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-16",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "78",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-01-17",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "76",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-18",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "75",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-19",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "73",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-01-20",
        "Snow Water Equivalent (in)": "25.6",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "77",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-01-21",
        "Snow Water Equivalent (in)": "26.0",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "81",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "21"
    }, {
        "Date": "2017-01-22",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "1.2",
        "Snow Depth (in)": "94",
        "Change In Snow Depth (in)": "13",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-23",
        "Snow Water Equivalent (in)": "29.3",
        "Change In Snow Water Equivalent (in)": "2.1",
        "Snow Depth (in)": "98",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-24",
        "Snow Water Equivalent (in)": "32.7",
        "Change In Snow Water Equivalent (in)": "3.4",
        "Snow Depth (in)": "112",
        "Change In Snow Depth (in)": "14",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2017-01-25",
        "Snow Water Equivalent (in)": "33.0",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "120",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-26",
        "Snow Water Equivalent (in)": "33.1",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "109",
        "Change In Snow Depth (in)": "-11",
        "Observed Air Temperature (degrees farenheit)": "8"
    }, {
        "Date": "2017-01-27",
        "Snow Water Equivalent (in)": "33.2",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "4"
    }, {
        "Date": "2017-01-28",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "104",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-29",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "102",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-01-30",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "99",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-01-31",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "98",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "-37"
    }, {
        "Date": "2017-02-01",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "95",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-02",
        "Snow Water Equivalent (in)": "33.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "94",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-03",
        "Snow Water Equivalent (in)": "33.5",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "94",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-02-04",
        "Snow Water Equivalent (in)": "34.5",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "100",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-05",
        "Snow Water Equivalent (in)": "34.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "98",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-06",
        "Snow Water Equivalent (in)": "34.7",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "97",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-07",
        "Snow Water Equivalent (in)": "35.5",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "99",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-08",
        "Snow Water Equivalent (in)": "36.2",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "102",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-09",
        "Snow Water Equivalent (in)": "36.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "100",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-02-10",
        "Snow Water Equivalent (in)": "36.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "91",
        "Change In Snow Depth (in)": "-9",
        "Observed Air Temperature (degrees farenheit)": "42"
    }, {
        "Date": "2017-02-11",
        "Snow Water Equivalent (in)": "38.3",
        "Change In Snow Water Equivalent (in)": "1.9",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-02-12",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-02-13",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-14",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "101",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-15",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "100",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-16",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "98",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-02-17",
        "Snow Water Equivalent (in)": "38.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "97",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-18",
        "Snow Water Equivalent (in)": "39.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "99",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-19",
        "Snow Water Equivalent (in)": "39.4",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-20",
        "Snow Water Equivalent (in)": "40.7",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-02-21",
        "Snow Water Equivalent (in)": "42.5",
        "Change In Snow Water Equivalent (in)": "1.8",
        "Snow Depth (in)": "112",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-22",
        "Snow Water Equivalent (in)": "44.2",
        "Change In Snow Water Equivalent (in)": "1.7",
        "Snow Depth (in)": "121",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-02-23",
        "Snow Water Equivalent (in)": "45.0",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "126",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-02-24",
        "Snow Water Equivalent (in)": "46.0",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "133",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-25",
        "Snow Water Equivalent (in)": "46.5",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "130",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "4"
    }, {
        "Date": "2017-02-26",
        "Snow Water Equivalent (in)": "46.7",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "127",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-27",
        "Snow Water Equivalent (in)": "46.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "126",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-02-28",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "1.7",
        "Snow Depth (in)": "137",
        "Change In Snow Depth (in)": "11",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-01",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "135",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-02",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "130",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-03",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "128",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-03-04",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "126",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-05",
        "Snow Water Equivalent (in)": "48.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "123",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-03-06",
        "Snow Water Equivalent (in)": "49.2",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "135",
        "Change In Snow Depth (in)": "12",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-07",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "131",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-08",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "129",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-09",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "126",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-10",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "124",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-11",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "121",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-12",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "120",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-13",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "118",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-14",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "116",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-15",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "114",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-16",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "112",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-17",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "110",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-18",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "107",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-19",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-20",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "105",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-21",
        "Snow Water Equivalent (in)": "48.8",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "104",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-22",
        "Snow Water Equivalent (in)": "49.0",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-23",
        "Snow Water Equivalent (in)": "49.5",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "107",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-24",
        "Snow Water Equivalent (in)": "50.1",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "110",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-25",
        "Snow Water Equivalent (in)": "50.3",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-26",
        "Snow Water Equivalent (in)": "50.9",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "110",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-27",
        "Snow Water Equivalent (in)": "51.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-28",
        "Snow Water Equivalent (in)": "52.2",
        "Change In Snow Water Equivalent (in)": "1.1",
        "Snow Depth (in)": "117",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-29",
        "Snow Water Equivalent (in)": "52.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "115",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-30",
        "Snow Water Equivalent (in)": "52.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "114",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-03-31",
        "Snow Water Equivalent (in)": "52.9",
        "Change In Snow Water Equivalent (in)": "0.6",
        "Snow Depth (in)": "116",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-01",
        "Snow Water Equivalent (in)": "53.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "114",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-02",
        "Snow Water Equivalent (in)": "52.9",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "111",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-03",
        "Snow Water Equivalent (in)": "53.1",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "112",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-04",
        "Snow Water Equivalent (in)": "52.7",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "111",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-05",
        "Snow Water Equivalent (in)": "52.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "111",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-06",
        "Snow Water Equivalent (in)": "52.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "110",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-07",
        "Snow Water Equivalent (in)": "52.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-08",
        "Snow Water Equivalent (in)": "52.7",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "107",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-09",
        "Snow Water Equivalent (in)": "54.0",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "116",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-10",
        "Snow Water Equivalent (in)": "54.5",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "120",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-11",
        "Snow Water Equivalent (in)": "54.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "115",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-12",
        "Snow Water Equivalent (in)": "54.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "113",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-13",
        "Snow Water Equivalent (in)": "54.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-14",
        "Snow Water Equivalent (in)": "54.4",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "107",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-15",
        "Snow Water Equivalent (in)": "54.2",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "107",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-04-16",
        "Snow Water Equivalent (in)": "54.0",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-17",
        "Snow Water Equivalent (in)": "53.7",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-18",
        "Snow Water Equivalent (in)": "53.5",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "102",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-19",
        "Snow Water Equivalent (in)": "54.5",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-20",
        "Snow Water Equivalent (in)": "54.0",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-21",
        "Snow Water Equivalent (in)": "54.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "108",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-22",
        "Snow Water Equivalent (in)": "54.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "106",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-23",
        "Snow Water Equivalent (in)": "54.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "105",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-24",
        "Snow Water Equivalent (in)": "54.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "103",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-25",
        "Snow Water Equivalent (in)": "55.2",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "112",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-26",
        "Snow Water Equivalent (in)": "56.3",
        "Change In Snow Water Equivalent (in)": "1.1",
        "Snow Depth (in)": "120",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-27",
        "Snow Water Equivalent (in)": "56.7",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "123",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-28",
        "Snow Water Equivalent (in)": "58.1",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "132",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-29",
        "Snow Water Equivalent (in)": "58.8",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "131",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-04-30",
        "Snow Water Equivalent (in)": "58.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "127",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": null
    }, {
        "Date": "2017-05-01",
        "Snow Water Equivalent (in)": "58.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "123",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": null
    }]
};
var closestFour = {
    "station_information": {
        "elevation": 8037,
        "location": {
            "lat": 40.29517,
            "lng": -111.25678
        },
        "name": "DANIELS-STRAWBERRY",
        "timezone": -7,
        "triplet": "435:UT:SNTL",
        "wind": true
    },
    "data": [{
        "Date": "2016-12-01",
        "Snow Water Equivalent (in)": "1.9",
        "Change In Snow Water Equivalent (in)": null,
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": null,
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-02",
        "Snow Water Equivalent (in)": "1.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2016-12-03",
        "Snow Water Equivalent (in)": "1.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "10",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2016-12-04",
        "Snow Water Equivalent (in)": "1.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "12",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2016-12-05",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "10",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-06",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "13",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2016-12-07",
        "Snow Water Equivalent (in)": "2.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "4"
    }, {
        "Date": "2016-12-08",
        "Snow Water Equivalent (in)": "2.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "14",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "-2"
    }, {
        "Date": "2016-12-09",
        "Snow Water Equivalent (in)": "2.5",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "17",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-10",
        "Snow Water Equivalent (in)": "2.6",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "15",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2016-12-11",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "8",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2016-12-12",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "22",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-13",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2016-12-14",
        "Snow Water Equivalent (in)": "3.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "20",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-15",
        "Snow Water Equivalent (in)": "3.9",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2016-12-16",
        "Snow Water Equivalent (in)": "4.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "21",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2016-12-17",
        "Snow Water Equivalent (in)": "6.5",
        "Change In Snow Water Equivalent (in)": "2.5",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "14",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-18",
        "Snow Water Equivalent (in)": "6.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "-2"
    }, {
        "Date": "2016-12-19",
        "Snow Water Equivalent (in)": "6.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "4"
    }, {
        "Date": "2016-12-20",
        "Snow Water Equivalent (in)": "6.8",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2016-12-21",
        "Snow Water Equivalent (in)": "6.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-22",
        "Snow Water Equivalent (in)": "6.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2016-12-23",
        "Snow Water Equivalent (in)": "6.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2016-12-24",
        "Snow Water Equivalent (in)": "6.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "27",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2016-12-25",
        "Snow Water Equivalent (in)": "7.9",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "34",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2016-12-26",
        "Snow Water Equivalent (in)": "8.2",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "36",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "9"
    }, {
        "Date": "2016-12-27",
        "Snow Water Equivalent (in)": "8.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "2"
    }, {
        "Date": "2016-12-28",
        "Snow Water Equivalent (in)": "8.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2016-12-29",
        "Snow Water Equivalent (in)": "8.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2016-12-30",
        "Snow Water Equivalent (in)": "8.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "32",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2016-12-31",
        "Snow Water Equivalent (in)": "8.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-01",
        "Snow Water Equivalent (in)": "8.3",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "14"
    }, {
        "Date": "2017-01-02",
        "Snow Water Equivalent (in)": "8.4",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-03",
        "Snow Water Equivalent (in)": "9.2",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-01-04",
        "Snow Water Equivalent (in)": "9.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "39",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-05",
        "Snow Water Equivalent (in)": "11.5",
        "Change In Snow Water Equivalent (in)": "2.1",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "11",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-06",
        "Snow Water Equivalent (in)": "11.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "-7"
    }, {
        "Date": "2017-01-07",
        "Snow Water Equivalent (in)": "11.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-4",
        "Observed Air Temperature (degrees farenheit)": "-5"
    }, {
        "Date": "2017-01-08",
        "Snow Water Equivalent (in)": "11.8",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-01-09",
        "Snow Water Equivalent (in)": "12.6",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "40"
    }, {
        "Date": "2017-01-10",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "2.2",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "6",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-11",
        "Snow Water Equivalent (in)": "15.6",
        "Change In Snow Water Equivalent (in)": "0.8",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "5",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-01-12",
        "Snow Water Equivalent (in)": "16.9",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-13",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-14",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-01-15",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-16",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-01-17",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "9"
    }, {
        "Date": "2017-01-18",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-01-19",
        "Snow Water Equivalent (in)": "17.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "56",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "16"
    }, {
        "Date": "2017-01-20",
        "Snow Water Equivalent (in)": "17.5",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "57",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-01-21",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-22",
        "Snow Water Equivalent (in)": "18.0",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-23",
        "Snow Water Equivalent (in)": "18.7",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-24",
        "Snow Water Equivalent (in)": "20.1",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "71",
        "Change In Snow Depth (in)": "10",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-01-25",
        "Snow Water Equivalent (in)": "20.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "13"
    }, {
        "Date": "2017-01-26",
        "Snow Water Equivalent (in)": "20.1",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "11"
    }, {
        "Date": "2017-01-27",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-01-28",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "7"
    }, {
        "Date": "2017-01-29",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "22"
    }, {
        "Date": "2017-01-30",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-01-31",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-02-01",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-02-02",
        "Snow Water Equivalent (in)": "20.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-03",
        "Snow Water Equivalent (in)": "20.6",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-02-04",
        "Snow Water Equivalent (in)": "21.0",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-05",
        "Snow Water Equivalent (in)": "21.4",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-02-06",
        "Snow Water Equivalent (in)": "21.4",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-02-07",
        "Snow Water Equivalent (in)": "22.1",
        "Change In Snow Water Equivalent (in)": "0.7",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-08",
        "Snow Water Equivalent (in)": "24.8",
        "Change In Snow Water Equivalent (in)": "2.7",
        "Snow Depth (in)": "75",
        "Change In Snow Depth (in)": "11",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-09",
        "Snow Water Equivalent (in)": "24.8",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "-5",
        "Observed Air Temperature (degrees farenheit)": "43"
    }, {
        "Date": "2017-02-10",
        "Snow Water Equivalent (in)": "24.7",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-6",
        "Observed Air Temperature (degrees farenheit)": "46"
    }, {
        "Date": "2017-02-11",
        "Snow Water Equivalent (in)": "25.2",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-12",
        "Snow Water Equivalent (in)": "25.4",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-02-13",
        "Snow Water Equivalent (in)": "25.3",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "63",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-02-14",
        "Snow Water Equivalent (in)": "25.2",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-02-15",
        "Snow Water Equivalent (in)": "25.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "19"
    }, {
        "Date": "2017-02-16",
        "Snow Water Equivalent (in)": "25.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "61",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-02-17",
        "Snow Water Equivalent (in)": "25.3",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-02-18",
        "Snow Water Equivalent (in)": "25.6",
        "Change In Snow Water Equivalent (in)": "0.3",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-02-19",
        "Snow Water Equivalent (in)": "25.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-02-20",
        "Snow Water Equivalent (in)": "26.3",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-02-21",
        "Snow Water Equivalent (in)": "26.4",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-02-22",
        "Snow Water Equivalent (in)": "26.9",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "27"
    }, {
        "Date": "2017-02-23",
        "Snow Water Equivalent (in)": "27.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-02-24",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-02-25",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "67",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "1"
    }, {
        "Date": "2017-02-26",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "3"
    }, {
        "Date": "2017-02-27",
        "Snow Water Equivalent (in)": "27.2",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-02-28",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "1.4",
        "Snow Depth (in)": "74",
        "Change In Snow Depth (in)": "9",
        "Observed Air Temperature (degrees farenheit)": "10"
    }, {
        "Date": "2017-03-01",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "72",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "15"
    }, {
        "Date": "2017-03-02",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "12"
    }, {
        "Date": "2017-03-03",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "20"
    }, {
        "Date": "2017-03-04",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "69",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "23"
    }, {
        "Date": "2017-03-05",
        "Snow Water Equivalent (in)": "28.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "66",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-06",
        "Snow Water Equivalent (in)": "29.1",
        "Change In Snow Water Equivalent (in)": "0.5",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "4",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-03-07",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.4",
        "Snow Depth (in)": "70",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-03-08",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "68",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-03-09",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "65",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-10",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "64",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-11",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-12",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "62",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-13",
        "Snow Water Equivalent (in)": "29.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "60",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-14",
        "Snow Water Equivalent (in)": "29.1",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "59",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-15",
        "Snow Water Equivalent (in)": "28.4",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "58",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-16",
        "Snow Water Equivalent (in)": "27.6",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "55",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-03-17",
        "Snow Water Equivalent (in)": "26.6",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "54",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "37"
    }, {
        "Date": "2017-03-18",
        "Snow Water Equivalent (in)": "25.8",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-03-19",
        "Snow Water Equivalent (in)": "25.3",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "48"
    }, {
        "Date": "2017-03-20",
        "Snow Water Equivalent (in)": "24.5",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-03-21",
        "Snow Water Equivalent (in)": "24.0",
        "Change In Snow Water Equivalent (in)": "-0.5",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-03-22",
        "Snow Water Equivalent (in)": "23.3",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "44"
    }, {
        "Date": "2017-03-23",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-03-24",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-03-25",
        "Snow Water Equivalent (in)": "22.9",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "45",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-26",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-27",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "46",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-03-28",
        "Snow Water Equivalent (in)": "24.3",
        "Change In Snow Water Equivalent (in)": "1.3",
        "Snow Depth (in)": "53",
        "Change In Snow Depth (in)": "7",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-03-29",
        "Snow Water Equivalent (in)": "24.5",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "51",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-03-30",
        "Snow Water Equivalent (in)": "24.5",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "49",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }, {
        "Date": "2017-03-31",
        "Snow Water Equivalent (in)": "25.5",
        "Change In Snow Water Equivalent (in)": "1.0",
        "Snow Depth (in)": "52",
        "Change In Snow Depth (in)": "3",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-01",
        "Snow Water Equivalent (in)": "25.4",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "50",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-02",
        "Snow Water Equivalent (in)": "25.1",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "48",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "32"
    }, {
        "Date": "2017-04-03",
        "Snow Water Equivalent (in)": "24.8",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-04",
        "Snow Water Equivalent (in)": "24.4",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-04-05",
        "Snow Water Equivalent (in)": "24.1",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "18"
    }, {
        "Date": "2017-04-06",
        "Snow Water Equivalent (in)": "24.0",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "47",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-07",
        "Snow Water Equivalent (in)": "23.8",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-04-08",
        "Snow Water Equivalent (in)": "23.5",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "47"
    }, {
        "Date": "2017-04-09",
        "Snow Water Equivalent (in)": "23.7",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-04-10",
        "Snow Water Equivalent (in)": "23.8",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "44",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "17"
    }, {
        "Date": "2017-04-11",
        "Snow Water Equivalent (in)": "23.4",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "42",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-04-12",
        "Snow Water Equivalent (in)": "23.0",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "41",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "41"
    }, {
        "Date": "2017-04-13",
        "Snow Water Equivalent (in)": "22.2",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "38",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-04-14",
        "Snow Water Equivalent (in)": "21.0",
        "Change In Snow Water Equivalent (in)": "-1.2",
        "Snow Depth (in)": "36",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "31"
    }, {
        "Date": "2017-04-15",
        "Snow Water Equivalent (in)": "20.2",
        "Change In Snow Water Equivalent (in)": "-0.8",
        "Snow Depth (in)": "35",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-04-16",
        "Snow Water Equivalent (in)": "19.8",
        "Change In Snow Water Equivalent (in)": "-0.4",
        "Snow Depth (in)": "33",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-17",
        "Snow Water Equivalent (in)": "19.1",
        "Change In Snow Water Equivalent (in)": "-0.7",
        "Snow Depth (in)": "31",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "38"
    }, {
        "Date": "2017-04-18",
        "Snow Water Equivalent (in)": "17.7",
        "Change In Snow Water Equivalent (in)": "-1.4",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "36"
    }, {
        "Date": "2017-04-19",
        "Snow Water Equivalent (in)": "16.7",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "30",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-20",
        "Snow Water Equivalent (in)": "16.5",
        "Change In Snow Water Equivalent (in)": "-0.2",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-21",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "-0.6",
        "Snow Depth (in)": "29",
        "Change In Snow Depth (in)": "1",
        "Observed Air Temperature (degrees farenheit)": "30"
    }, {
        "Date": "2017-04-22",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "-1",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-04-23",
        "Snow Water Equivalent (in)": "15.9",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "33"
    }, {
        "Date": "2017-04-24",
        "Snow Water Equivalent (in)": "14.9",
        "Change In Snow Water Equivalent (in)": "-1.0",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-04-25",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "24",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "29"
    }, {
        "Date": "2017-04-26",
        "Snow Water Equivalent (in)": "14.9",
        "Change In Snow Water Equivalent (in)": "0.1",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "28"
    }, {
        "Date": "2017-04-27",
        "Snow Water Equivalent (in)": "14.6",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "34"
    }, {
        "Date": "2017-04-28",
        "Snow Water Equivalent (in)": "14.6",
        "Change In Snow Water Equivalent (in)": "0.0",
        "Snow Depth (in)": "26",
        "Change In Snow Depth (in)": "0",
        "Observed Air Temperature (degrees farenheit)": "25"
    }, {
        "Date": "2017-04-29",
        "Snow Water Equivalent (in)": "14.8",
        "Change In Snow Water Equivalent (in)": "0.2",
        "Snow Depth (in)": "28",
        "Change In Snow Depth (in)": "2",
        "Observed Air Temperature (degrees farenheit)": "24"
    }, {
        "Date": "2017-04-30",
        "Snow Water Equivalent (in)": "14.7",
        "Change In Snow Water Equivalent (in)": "-0.1",
        "Snow Depth (in)": "25",
        "Change In Snow Depth (in)": "-3",
        "Observed Air Temperature (degrees farenheit)": "26"
    }, {
        "Date": "2017-05-01",
        "Snow Water Equivalent (in)": "14.4",
        "Change In Snow Water Equivalent (in)": "-0.3",
        "Snow Depth (in)": "23",
        "Change In Snow Depth (in)": "-2",
        "Observed Air Temperature (degrees farenheit)": "35"
    }]
};
'use strict';

angular.module('snowApp').controller('dashboardCTRL', ["$scope", "$stateParams", "apiService", function ($scope, $stateParams, apiService) {

    // console.log(d3)

    $scope.latitude = $stateParams.latitude;
    $scope.longitude = $stateParams.longitude;
    var firstrun = true;

    $scope.getNearestSlopes = function (lat, long) {
        apiService.getNearestSlopes(lat, long).then(function (response) {
            // console.log(response.data)
            $scope.snotels = response.data;
        });
    };
    if (firstrun) {
        $scope.getNearestSlopes($scope.latitude, $scope.longitude);
        firstrun = false;
    }

    $scope.getGoogleForNewSnotels = function (city, state) {
        apiService.getGoogleLocation(city, state).then(function (response) {
            $scope.customLocation = {
                // city: response.data.results[0].address_components[0].long_name,
                // state: response.data.results[0].address_components[2].long_name,
                latitude: response.data.results[0].geometry.location.lat,
                longitude: response.data.results[0].geometry.location.lng
            };
            if (response.status == 200) {
                $scope.getNearestSlopes($scope.customLocation.latitude, $scope.customLocation.longitude);
            }
        }).catch(function (error) {
            alert('Not a valid location');
        });
    };

    $scope.dataOfSlopes = [];

    $scope.populateData = function (stationId, startDate, endDate) {
        if (!startDate) {
            alert('Please enter a date from which to start data collection');
            return;
        }
        apiService.getSingleSnowLocation(stationId, $scope.startDate, $scope.endDate).then(function (response) {

            if ($scope.dataOfSlopes.length >= 0 && $scope.dataOfSlopes.length < 5) {
                for (var i = 0; i < $scope.dataOfSlopes.length; i++) {
                    if ($scope.dataOfSlopes[i].slopeName === response.slopeName) {
                        return;
                    }
                }
                $scope.dataOfSlopes.push(response);
            } else if ($scope.dataOfSlopes.length >= 6) {
                $scope.dataOfSlopes.unshift();
                $scope.dataOfSlopes.push(response);
            }

            console.log($scope.dataOfSlopes);
        });
    };
}]);
'use strict';

angular.module('snowApp').controller('forecastCTRL', function () {});
'use strict';

angular.module('snowApp').controller('homeCTRL', ["$scope", "apiService", "$state", function ($scope, apiService, $state) {

    $scope.getipLocation = function () {
        apiService.getLocation().then(function (response) {
            $scope.location = {
                city: response.data.city,
                state: response.data.region,
                latitude: response.data.latitude,
                longitude: response.data.longitude

            };
        });
    };

    $scope.getipLocation();

    $scope.customLocation;

    $scope.getGoogleLocation = function (city, state) {
        apiService.getGoogleLocation(city, state).then(function (response) {
            $scope.customLocation = {
                latitude: response.data.results[0].geometry.location.lat,
                longitude: response.data.results[0].geometry.location.lng
            };
            if (response.status == 200) {
                $state.go('dashboard', {
                    latitude: $scope.customLocation.latitude,
                    longitude: $scope.customLocation.longitude
                });
            }
        }).catch(function (error) {
            alert('Not a valid location');
        });
    };
}]);

// $scope.location object:
// city:"Provo"
// country:"US"
// country_name:"United States"
// ip:"216.21.163.235"
// latitude:40.3393
// longitude:-111.5709
// postal:"84604"
// region:"Utah"
// timezone:"America/Denver"