const maps = {
    "base_url":"https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/",
    "maps":{
        "Bahrain International Circuit": "Bahrain_Circuit.png",
        "Albert Park Grand Prix Circuit": "Australia_Circuit.png",
        "Circuit Gilles Villeneuve": "Canada_Circuit.png",
        "Circuit of the Americas": "USA_Circuit.png",
        "Baku City Circuit": "Baku_Circuit.png",
        "Circuit de Barcelona-Catalunya": "Spain_Circuit.png",
        "Hungaroring": "Hungary_Circuit.png",
        "Autodromo Enzo e Dino Ferrari": "Emilia_Romagna_Circuit.png",
        "Autódromo José Carlos Pace": "Brazil_Circuit.png",
        "Jeddah Corniche Circuit": "Saudi_Arabia_Circuit.png",
        "Marina Bay Street Circuit": "Singapore_Circuit.png",
        "Miami International Autodrome": "Miami_Circuit.png",
        "Circuit de Monaco": "Monoco_Circuit.png",
        "Autodromo Nazionale di Monza": "Italy_Circuit.png",
        "Red Bull Ring": "Austria_Circuit.png",
        "Circuit Paul Ricard": "France_Circuit.png",
        "Autódromo Hermanos Rodríguez": "Mexico_Circuit.png",
        "Silverstone Circuit": "Great_Britain_Circuit.png",
        "Circuit de Spa-Francorchamps": "Belgium_Circuit.png",
        "Suzuka Circuit": "Japan_Circuit.png",
        "Yas Marina Circuit": "Abu_Dhabi_Circuit.png",
        "Circuit Park Zandvoort": "Netherlands_Circuit.png"
    }
};

const teamAssets = {
    "Red Bull": {
        "color": "#3671C6",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/red-bull-racing-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/red-bull-racing.png"
    },
    "Ferrari": {
        "color": "#F91536",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/ferrari-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/ferrari.png"
    },
    "Mercedes": {
        "color": "#6CD3BF",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/mercedes-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/mercedes.png"
    },
    "McLaren": {
        "color": "#F58020",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/mclaren-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/mclaren.png"
    },
    "Alpine F1 Team": {
        "color": "#2293D1",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/alpine-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/alpine.png"
    },
    "Alfa Romeo": {
        "color": "#C92D4B",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/alfa-romeo-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/alfa-romeo.png"
    },
    "AlphaTauri": {
        "color": "#5E8FAA",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/alphatauri-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/alphatauri.png"
    },
    "Aston Martin": {
        "color": "#358C75",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/aston-martin-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/aston-martin.png"
    },
    "Haas F1 Team": {
        "color": "#B6BABD",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/haas-f1-team-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/haas-f1-team.png"
    },
    "Williams": {
        "color": "#37BEDD",
        "logo": "https://www.formula1.com/content/dam/fom-website/teams/2022/williams-logo.png",
        "car": "https://www.formula1.com/content/dam/fom-website/teams/2022/williams.png"
    }
};

function nextRace(){
    $.ajax({
        url: "https://ergast.com/api/f1/current/next.json",
        type: "GET",
        success: function(result){
            let race = result["MRData"]["RaceTable"]["Races"][0]
            $("#nextRace").text(race["raceName"]);

            var url = maps["base_url"];
            var mapimg = maps["maps"][race["Circuit"]["circuitName"]];

            // update nextTable
            $("#nextRound").text(race["season"] + " #" + race["round"])
            $("#nextRace").text(race["raceName"])
            $("#nextLoc").html(`<a href="https://www.google.com/maps/@${race["Circuit"]["Location"]["lat"]},${race["Circuit"]["Location"]["long"]},16z" target="_blank">${race["Circuit"]["circuitName"]} (${race["Circuit"]["Location"]["locality"]}, ${race["Circuit"]["Location"]["country"]})</a>`)
            
            let dtoptions = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };

            var events = [];
            events.push(["Race",new Date(race["date"]+"T"+race["time"])]);
            events.push(["Quali",new Date(race["Qualifying"]["date"]+"T"+race["Qualifying"]["time"])]);
            events.push(["FP1",new Date(race["FirstPractice"]["date"]+"T"+race["FirstPractice"]["time"])]);
            events.push(["FP2",new Date(race["SecondPractice"]["date"]+"T"+race["SecondPractice"]["time"])]);
            try {
                events.push(["FP3",new Date(race["ThirdPractice"]["date"]+"T"+race["ThirdPractice"]["time"])]);
            } catch (error) {
                events.push(["Sprint",new Date(race["Sprint"]["date"]+"T"+race["Sprint"]["time"])]);
            }

            events.sort((first, second) => second[1]- first[1]);

            $("#nextTable").append(`
                <tr id="${events[0][0]}">
                    <td>${events[0][0]}</td>
                    <td>${events[0][1].toLocaleString('en-SG', dtoptions)}</td>
                    <td rowspan="5" colspan="2" id="mapBox"><img src="${url}${mapimg}" style="max-width: 90%"></td>
                </tr>
            `);

            for(var i=1; i<events.length; i++){
                $("#nextTable").append(`
                <tr id="${events[i][0]}">
                    <td>${events[i][0]}</td>
                    <td>${events[i][1].toLocaleString('en-SG', dtoptions)}</td>
                </tr>
                `);
            }

        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    })
}


function currStandings(){
    $.ajax({
        url: "https://ergast.com/api/f1/current/driverStandings.json",
        type: "GET",
        success: function(result){
            let standings = result["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]
            for(const driverObj of standings){
                $("#driverStandings").append(`
                    <tr>
                        <td>${driverObj["positionText"]}</td>
                        <td>${driverObj["Driver"]["givenName"]+" "+driverObj["Driver"]["familyName"]}</td>
                        <td>${driverObj["Constructors"][0]["name"]}</td>
                        <td>${driverObj["points"]}</td>
                        <td>${driverObj["wins"]}</td>
                    </tr>
                `)
            }
        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    })
}

function comparePS(a, b) {
    if (a.driverId < b.driverId){
      return -1;
    }
    if (a.driverId > b.driverId){
      return 1;
    }
    return 0;
}

function prevPSData(){
    $.ajax({
        url: "https://ergast.com/api/f1/current/last/pitstops.json?limit=100",
        type: "GET",
        success: function(result){
            var stopTimes = [];
            var sortedRes = result["MRData"]["RaceTable"]["Races"][0]["PitStops"].sort(comparePS);

            for(const stop of sortedRes){
                stopTimes.push({indexLabel: stop["driverId"], indexLabelOrientation: "vertical" , name: stop["driverId"], y: parseFloat(stop["duration"])});
            }
            var options = {
                animationEnabled: true,
                title:{
                    text: "Pitstop Timings"   
                },
                axisY:{
                    title:"Time (s)",
                    minimum: 0
                },
                axisX:{
                    title:" ",
                    labelFormatter: function(){return " ";}
                },
                toolTip: {
                    shared: true,
                    reversed: true
                },
                data: [{
                    type: "stackedColumn",
                    label: "Time",
                    dataPoints: stopTimes
                }]
            };
            $("#pitstopTimings").CanvasJSChart(options);
        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    })
}

function stringToFloat(s){
    let arr = s.split(":");
    let f = parseFloat(arr[1]) + parseInt(arr[0])*60;
    return f
}

function generateDatapoints(a){
    var r = [];
    for(var i=0; i<a.length; i++){
        r.push({x: i, y:a[i]})
    }
    return r
}

function fillList(){
    $.ajax({
        url: "https://ergast.com/api/f1/current/drivers.json",
        type: "GET",
        success: function(result){
            var drivers = result["MRData"]["DriverTable"]["Drivers"]
            for(const dr of drivers){
                $("#dr1").append(`
                    <option value="${dr["driverId"]}">${dr["givenName"] + " "+ dr["familyName"]}</option>
                `)
                $("#dr2").append(`
                    <option value="${dr["driverId"]}">${dr["givenName"] + " "+ dr["familyName"]}</option>
                `)
            }
        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    });

    $.ajax({
        url: "https://ergast.com/api/f1/current.json",
        type: "GET",
        success: function(result){
            var races = result["MRData"]["RaceTable"]["Races"]
            for(const rc of races){
                if(new Date() > new Date(rc["date"]+"T"+rc["time"])){  
                    $("#race").append(`
                        <option value="${rc["round"]}">${rc["raceName"]}</option>
                    `)
                }
            }
        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    })
}

function compare(driver1, driver2, race, timedelta, stacked){
    var dr1time = [];
    var dr2time = [];

    $.ajax({
        url: `https://ergast.com/api/f1/current/${race}/drivers/${driver1}/laps.json?limit=1000`,
        type: "GET",
        success: function(result){
            var timings1 = result["MRData"]["RaceTable"]["Races"][0]["Laps"];
            for(timing of timings1){
                dr1time.push(stringToFloat(timing["Timings"][0]["time"]));
            }

            $.ajax({
                url: `https://ergast.com/api/f1/current/${race}/drivers/${driver2}/laps.json?limit=1000`,
                type: "GET",
                success: function(result){
                    var timings2 = result["MRData"]["RaceTable"]["Races"][0]["Laps"];

                    for(timing of timings2){
                        dr2time.push(stringToFloat(timing["Timings"][0]["time"]));
                    }

                    if(timedelta){
                        var temp1 = [];
                        var temp2 = [];
                        if(dr1time.length > dr2time.length){
                            [dr1time, dr2time] = [dr2time, dr1time];
                            [driver1, driver2] = [driver2, driver1];
                        }
                        for(var i=0; i<dr1time.length; i++){
                            temp1.push(0);
                            temp2.push(dr1time[i]-dr2time[i]);
                        }
                        dr1time = temp1;
                        dr2time = temp2;
                    }

                    if(stacked){
                        if(dr1time.length > dr2time.length){
                            [dr1time, dr2time] = [dr2time, dr1time];
                            [driver1, driver2] = [driver2, driver1];
                        }
                        // var finalData = generateStacked(dr1time, dr2time, driver1, driver2);
                        var options = {
                            zoomEnabled: true,
                            animationEnabled: true,
                            theme: "light2",
                            title:{
                                text: driver1 + " vs " + driver2,
                                fontWeight: "lighter"
                            },
                            axisX:{
                                labelFormatter: function(){return " ";},

                            },
                            axisY: {
                                title: "Timing (s)",
                                minimum: 0
                            },
                            toolTip:{
                                shared: true
                            },  
                            legend:{
                                cursor:"pointer",
                                verticalAlign: "bottom",
                                horizontalAlign: "left",
                                dockInsidePlotArea: true
                            },
                            data: [{
                                type: "bar",
                                showInLegend: true,
                                name: driver1,
                                dataPoints: generateDatapoints(dr1time)
                            },
                            {
                                type: "bar",
                                showInLegend: true,
                                name: driver2,
                                dataPoints: generateDatapoints(dr2time)
                            }]
                        };
                    } else {
                        var options = {
                            zoomEnabled: true,
                            animationEnabled: true,
                            theme: "light2",
                            title:{
                                text: driver1 + " vs " + driver2,
                                fontWeight: "lighter"
                            },
                            axisX:{
                                labelFormatter: function(){return " ";}
                            },
                            axisY: {
                                title: "Timing (s)"
                            },
                            toolTip:{
                                shared:true
                            },  
                            legend:{
                                cursor:"pointer",
                                verticalAlign: "bottom",
                                horizontalAlign: "left",
                                dockInsidePlotArea: true
                            },
                            data: [{
                                type: "line",
                                showInLegend: true,
                                name: driver1,
                                dataPoints: generateDatapoints(dr1time)
                            },
                            {
                                type: "line",
                                showInLegend: true,
                                name: driver2,
                                dataPoints: generateDatapoints(dr2time)
                            }]
                        };
                    }
                    
                    console.log(options);
                    $("#LTgraph").CanvasJSChart(options);
                },
                error: function(error){
                    console.log(error);
                    $("#errorText").append(error);
                }
            })
        },
        error: function(error){
            console.log(error);
            $("#errorText").append(error);
        }
    })
}

$("#cmp").click(function(){
    compare($("#dr1").val(), $("#dr2").val(), $("#race").val(), $("#timedelta").is(":checked"), $("#stacked").is(":checked"))
});

$("#stacked").change(function(){
    if($(this).is(":checked")){
        $("#timedelta").prop("disabled", true);
    } else {
        $("#timedelta").prop("disabled", false);
    }
});

$("#timedelta").change(function(){
    if($(this).is(":checked")){
        $("#stacked").prop("disabled", true);
    } else {
        $("#stacked").prop("disabled", false);
    }
});

$(document).ready(function(){
    // prevPSData();
    // gatherLapTimes();
    var href = document.location.href;
    var fname = href.substr(href.lastIndexOf('/') + 1);


    if(fname === "index.html" || fname === ""){
        nextRace();
        currStandings();
    }

    if(fname === "laptime.html"){
        fillList();
    }
});