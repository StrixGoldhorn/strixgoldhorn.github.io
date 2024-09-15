var $_DATA;

$(document).ready(function () {
    if(!localStorage.getItem("METARTAF")){
        $_DATA = {
            "checkwxapiAPIKEY" : "",
            "theme" : "light",
            "ICAO_arr" : []
        }
        localStorage.setItem("METARTAF", JSON.stringify($_DATA));
    }
    else{
        $_DATA = JSON.parse(localStorage.getItem("METARTAF"))
    }

    // Check for API key
    if (!$_DATA["checkwxapiAPIKEY"]) {
        $('#div1').css("visibility", "visible");
    }
    else {
        $('#div1').css({
            "visibility": "hidden",
            "width": "0",
            "height": "0"
        });
    }   
    


    // Check for theme
    if ($_DATA["theme"]){
        if(!document.documentElement.classList[0] && $_DATA["theme"] == "dark"){
            document.documentElement.classList.toggle("dark");
        }
        else if (document.documentElement.classList[0] == "dark" && $_DATA["theme"] == "light"){
            document.documentElement.classList.toggle("dark");
        }
    }
    
    // Check for pre-saved ICAO codes
    if ($_DATA["ICAO_arr"]) {
        updateICAODisp();
    }

    TAF_API();
    METAR_API();
});

function updateICAODisp(){
    document.getElementById("ICAO_curr").innerText = "Saved ICAO codes: " + $_DATA["ICAO_arr"].toString();
}

$('#apikeySubmit').click(function () {
    $_DATA["checkwxapiAPIKEY"] = $('#apikeyIN').val();
    localStorage.setItem("METARTAF", JSON.stringify($_DATA));
    location.reload();
});

$('#ICAO_add').click(function () {
    let newICAO = $('#ICAO_codes_in').val()
    newICAO = newICAO.toUpperCase();
    // Check if ICAO already inside
    if($_DATA["ICAO_arr"].includes(newICAO)){
        // If already inside, remove it from array
        $_DATA["ICAO_arr"].splice($_DATA["ICAO_arr"].indexOf(newICAO), 1);
        localStorage.setItem("METARTAF", JSON.stringify($_DATA));
        updateICAODisp();
    }
    else{
        // Else add to ICAO list
        if(newICAO.length == 4){
            $_DATA["ICAO_arr"].push(newICAO);
            $_DATA["ICAO_arr"] = $_DATA["ICAO_arr"];
            localStorage.setItem("METARTAF", JSON.stringify($_DATA));
            updateICAODisp();
        }
    }
});

function METAR_API() {
    const fullurl = 'https://api.checkwx.com/metar/' + $_DATA["ICAO_arr"].toString() + "/decoded";
    var header = {
        "X-API-Key": $_DATA["checkwxapiAPIKEY"]
    }
    $.ajax({
        url: fullurl,
        type: "GET",
        headers: header,
        success: function (result) {
            updateMETARTable(result["data"]);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

function TAF_API() {
    const fullurl = 'https://api.checkwx.com/taf/' + $_DATA["ICAO_arr"].toString() + "/decoded";
    var header = {
        "X-API-Key": $_DATA["checkwxapiAPIKEY"]
    }
    $.ajax({
        url: fullurl,
        type: "GET",
        headers: header,
        success: function (result) {
            updateTAFTable(result["data"]);
        },
        error: function (error) {
            console.log(error);
        }
    })
}



function updateTAFTable(TAF_data){
    TAF_data.forEach((airport) => {
        var tbl = document.createElement("table");
        tbl.setAttribute("class", "resTable")
        var tblBody = document.createElement("tbody")

        var tr1 = document.createElement("tr");
        var th = document.createElement("th");
        th.setAttribute("colspan", "4");
        th.innerText = "TAF";
        tr1.appendChild(th);
        tblBody.appendChild(tr1);

        var tr2 = document.createElement("tr");
        var td21 = document.createElement("td");
        var td22 = document.createElement("td");
        var td23 = document.createElement("td");
        var td24 = document.createElement("td");
        td21.innerText = airport["icao"];
        td22.innerText = airport["station"]["location"];
        td23.innerText = airport["station"]["name"];
        td24.innerText = airport["station"]["type"];
        tr2.appendChild(td21);
        tr2.appendChild(td22);
        tr2.appendChild(td23);
        tr2.appendChild(td24);
        tblBody.appendChild(tr2);

        var tr3 = document.createElement("tr");
        var td31 = document.createElement("td");
        var td32 = document.createElement("td");
        td31.setAttribute("colspan", "2");
        td32.setAttribute("colspan", "2");
        td31.innerText = "Valid from " + airport["forecast"][0]["timestamp"]["from"];
        td32.innerText = "Valid to " + airport["forecast"][0]["timestamp"]["to"];
        tr3.appendChild(td31);
        tr3.appendChild(td32);
        tblBody.appendChild(tr3);

        var tr4 = document.createElement("tr");
        var td41 = document.createElement("td");
        var td42 = document.createElement("td");
        var td43 = document.createElement("td");
        var td44 = document.createElement("td");
        td41.innerText = "Visibility";
        td42.innerText = airport["forecast"][0]["visibility"]["meters_float"] + "m";
        td43.innerText = "Wind";
        td44.innerText = airport["forecast"][0]["wind"]["degrees"] + "° / " + airport["forecast"][0]["wind"]["speed_kts"] + "kts";
        tr4.appendChild(td41);
        tr4.appendChild(td42);
        tr4.appendChild(td43);
        tr4.appendChild(td44);
        tblBody.appendChild(tr4);

        var tr5 = document.createElement("tr");
        var td5 = document.createElement("td");
        td5.setAttribute("colspan", "4");
        td5.innerText = "Clouds";
        tr5.appendChild(td5);
        tblBody.appendChild(tr5);

        airport["forecast"][0]["clouds"].forEach((cloudLayer) => {
            var trCloud = document.createElement("tr");
            var tdc1 = document.createElement("td");
            var tdc2 = document.createElement("td");
            tdc1.setAttribute("colspan", "2");
            tdc2.setAttribute("colspan", "2");
            tdc1.innerText = cloudLayer["base_feet_agl"] + "ft";
            tdc2.innerText = cloudLayer["text"];
            trCloud.appendChild(tdc1);
            trCloud.appendChild(tdc2);
            tblBody.appendChild(trCloud);
        })



        tbl.appendChild(tblBody);
        document.getElementById("TAF_TABLE_HERE").appendChild(tbl);
    })

}



function updateMETARTable(METAR_data){
    METAR_data.forEach((airport) => {
        var tbl = document.createElement("table");
        tbl.setAttribute("class", "resTable")
        var tblBody = document.createElement("tbody")

        var tr1 = document.createElement("tr");
        var th = document.createElement("th");
        th.setAttribute("colspan", "4");
        th.innerText = "METAR";
        tr1.appendChild(th);
        tblBody.appendChild(tr1);

        var tr2 = document.createElement("tr");
        var td21 = document.createElement("td");
        var td22 = document.createElement("td");
        var td23 = document.createElement("td");
        var td24 = document.createElement("td");
        td21.innerText = airport["icao"];
        td22.innerText = airport["station"]["location"];
        td23.innerText = airport["station"]["name"];
        td24.innerText = airport["station"]["type"];
        tr2.appendChild(td21);
        tr2.appendChild(td22);
        tr2.appendChild(td23);
        tr2.appendChild(td24);
        tblBody.appendChild(tr2);

        var tr3 = document.createElement("tr");
        var td31 = document.createElement("td");
        td31.setAttribute("colspan", "4");
        td31.innerText = "Observed timing: " + airport["observed"];
        tr3.appendChild(td31);
        tblBody.appendChild(tr3);

        var tr4 = document.createElement("tr");
        var td41 = document.createElement("td");
        var td42 = document.createElement("td");
        var td43 = document.createElement("td");
        var td44 = document.createElement("td");
        td41.innerText = "Flight Category: " + airport["flight_category"];
        td42.innerText = "Visibility: " + airport["visibility"]["meters_float"];
        td43.innerText = "Elevation: " + airport["elevation"]["feet"] + "ft / " + airport["elevation"]["meters"] + "m";
        td44.innerText = "Barometer: " + airport["barometer"]["hg"] + "hg";
        tr4.appendChild(td41);
        tr4.appendChild(td42);
        tr4.appendChild(td43);
        tr4.appendChild(td44);
        tblBody.appendChild(tr4);

        var tr5 = document.createElement("tr");
        var td51 = document.createElement("td");
        var td52 = document.createElement("td");
        var td53 = document.createElement("td");
        var td54 = document.createElement("td");
        td51.innerText = "Wind deg/kts: " + airport["wind"]["degrees"] + "° / " + airport["wind"]["speed_kts"] + "kts";
        td52.innerText = "Humidity: " + airport["humidity"]["percent"] + "%";
        td53.innerText = "Temp: " + airport["temperature"]["celsius"] + "°C";
        td54.innerText = "Dew point: " + airport["dewpoint"]["celsius"] + "°C";
        tr5.appendChild(td51);
        tr5.appendChild(td52);
        tr5.appendChild(td53);
        tr5.appendChild(td54);
        tblBody.appendChild(tr5);

        var tr6 = document.createElement("tr");
        var td61 = document.createElement("td");
        td61.setAttribute("colspan", "4");
        td61.innerText = "Clouds";
        tr6.appendChild(td61);
        tblBody.appendChild(tr6);

        airport["clouds"].forEach((cloudLayer) => {
            var trCloud = document.createElement("tr");
            var tdc1 = document.createElement("td");
            var tdc2 = document.createElement("td");
            tdc1.setAttribute("colspan", "2");
            tdc2.setAttribute("colspan", "2");
            tdc1.innerText = cloudLayer["base_feet_agl"] + "ft";
            tdc2.innerText = cloudLayer["text"];
            trCloud.appendChild(tdc1);
            trCloud.appendChild(tdc2);
            tblBody.appendChild(trCloud);
        })



        tbl.appendChild(tblBody);
        document.getElementById("METAR_TABLE_HERE").appendChild(tbl);
    })

}











document.getElementById("#toggleThemeButton").parentElement.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    
    if($_DATA["theme"] == "light"){
        $_DATA["theme"] = "dark";
        localStorage.setItem("METARTAF", JSON.stringify($_DATA));
    }
    else{
        $_DATA["theme"] = "light";
        localStorage.setItem("METARTAF", JSON.stringify($_DATA));
    }
});


document.getElementById("#toggleMETARTAFButton").parentElement.addEventListener("click", () => {
    if(document.querySelector("#METAR_TABLE_HERE").style.display == "none"){
        document.querySelector("#METAR_TABLE_HERE").style.display = "block";
        document.querySelector("#TAF_TABLE_HERE").style.display = "none";
    }
    else{
        document.querySelector("#METAR_TABLE_HERE").style.display = "none";
        document.querySelector("#TAF_TABLE_HERE").style.display = "block";
    }
});