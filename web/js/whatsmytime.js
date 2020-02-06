let app = angular.module('whatsmytime', []);

app.controller('maincontroller', function ($scope, $http) {

    $http.get("http://localhost:8080/runs/latest").then(successCallback, errorCallback);

    function successCallback(response) {
        $scope.latestRuns = response.data;
        console.log(response.data);
    }

    function errorCallback(data) {

    }

    $scope.curremtRace = "";
});

app.controller('timecontroller', function ($scope, $interval) {
    $interval(function () {
        let today = new Date();
        let h = addZero(today.getHours(), 2);
        let m = addZero(today.getMinutes(), 2);
        let s = addZero(today.getSeconds(), 2);
        let ms = addZero(today.getMilliseconds(), 3)
        $scope.ct = `${h}:${m}:${s}:${ms}`;
    }, 10);
});

app.controller('racercontroller', function ($scope, $http) {
    $scope.addRacer = function () {
        // Records run
        let data = {
            firstName: $scope.firstName,
            lastName: $scope.lastName
        };
        console.log("Sending new racer " + data);

        $http.put("http://localhost:8080/racers/add", data)
            .then(
                function (response) {
                    console.info("Server Response:");
                    console.info(response.data)
                    console.info(response.status)
                    console.info(response.headers)
                    console.info(response.statusText)
                },
                function (response) {
                    console.info(response.status)
                }
            );

    };
});

app.controller('runcontroller', function ($scope, $interval, $http) {

    /*
     * Start Run
     */
    $scope.startRun = function () {
        let countDown = $interval(function () {
            //$scope.playSound();
            $scope.startCounter--;
            if ($scope.startCounter == 0) {
                $scope.runStartTime = new Date();

                // Records run
                let data = {
                    firstName: $scope.currentRacer.firstName,
                    lastName: $scope.currentRacer.lastName,
                    gpsStartTime: undefined,
                    deviceStartTime: $scope.runStartTime.getTime(),
                };
                $scope.saveRun(data);

                // Stops countdown
                $interval.cancel(countDown);
            }
        }, 1000)
    };

    /*
     * Records run on backend
     */
    $scope.saveRun = function (data) {

        $http.put("http://localhost:8080/run/start", data)
            .then(
                function (response) {
                    // Saves current run
                    $scope.currentRun = response.data;
                    console.log($scope.currentRun);
                },
                function (response) {
                    console.info(response.status)
                }
            );
    }

    /*
     * Track Run
     */
    // todo: add formatting for hour/minutes/seconds.decimal
    let trackRun = $interval(function () {
        if ($scope.runStartTime) {
            let mils = Math.abs(new Date().getTime() - $scope.runStartTime.getTime());
            let s = addZero(mils / 1000, 2);
            $scope.chronometer = `${s}`;
        }
    }, 10)

    /*
     * Stop Run
     */
    $scope.stopRun = function () {
        $scope.currentRun.deviceFinishTime = new Date().getTime();
        let data = $scope.currentRun;
        $http.put("http://localhost:8080/run/stop", data)
            .then(
                function (response) {
                    // Saves current run
                    $scope.currentRun = response.data;
                    console.log($scope.currentRun);
                },
                function (response) {
                    console.info(response.status)
                }
            );
        $scope.runStartTime = undefined;
    }


    $scope.playSound = function () {
        $scope.sound.play();
    }

    $http.get("http://localhost:8080/racers")
        .then(
            function (response) {
                console.info("Server Response:");
                console.info(response.data)
                console.info(response.status)
                console.info(response.headers)
                console.info(response.statusText)
                $scope.racers = response.data;
            },
            function (response) {
                console.info(response.status)
            }
        );

    $scope.sound = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    $scope.startCounter = 5;
    $scope.runStartTime = undefined;
    $scope.chronometer = 0.00;

});

app.controller("runscontroller", function ($scope, $http, $interval) {

    $http.get("http://localhost:8080/runs/running")
        .then(
            function (response) {
                console.info("Server Response:");
                console.info(response.data)
                console.info(response.status)
                console.info(response.headers)
                console.info(response.statusText)
                console.debug("Returned races");
                console.debug(response.data);
                $scope.running = response.data;
            },
            function (response) {
                console.info(response.status)
            }
        );

    $interval(function () {
        $scope.running.forEach(function (run) {
            if (run["status"] == "Running") {
                run["chronometer"] = new Date().getTime() - run.deviceStartTime;
            }
        });
    }, 10);

    $scope.stopRun = function (index) {

        // Trying to add precision. Rather than create a date object and get the time, calculating based on what is on the screen
        // The trade off is precision vs consistency.
        let run = $scope.running[index];
        run.status = "Completed";
        run.deviceFinishTime = run.deviceStartTime + run.chronometer;
        run.status = "Completed";

        $http.put("http://localhost:8080/run/stop", run)
            .then(
                function (response) {
                    console.info("Server Response:");
                    console.info(response.data)
                    console.info(response.status)
                    console.info(response.headers)
                    console.info(response.statusText)
                    console.debug("Updated race");
                    console.debug(response.data.toString());
                },
                function (response) {
                    console.info(response.status)
                }
            );
        // Update run
    };

    /*$interval(function () {
        $scope.running.forEach(function (run) {
            run["runtTime"] = new Date().getTime() - run.deviceStartTime;
            console.log(run);
        });
    }, 1000);*/
});

app.controller("racescontroller", function ($scope, $http, $interval) {

    console.log("Loading controller");
    $http.get("http://localhost:8080/races")
        .then(
            function (response) {
                console.info("Server Response:");
                console.info(response.data)
                console.info(response.status)
                console.info(response.headers)
                console.info(response.statusText)
                console.debug("Returned races");
                console.debug(response.data);
                $scope.races = response.data;
            },
            function (response) {
                console.info(response.status)
            }
        );

    $scope.addRace = function () {
        // Records run
        let data = {
            date: $scope.date,
            location: $scope.location,
            type: $scope.discipline
        };
        console.log("Sending new race " + data);

        $http.put("http://localhost:8080/race/add", data)
            .then(
                function (response) {
                    console.info("Server Response:");
                    console.info(response.data)
                    console.info(response.status)
                    console.info(response.headers)
                    console.info(response.statusText)
                },
                function (response) {
                    console.info(response.status)
                }
            );

    };

    let showRace = function (index) {
        alert(index);
    }

});

