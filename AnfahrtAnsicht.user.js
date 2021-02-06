// ==UserScript==
// @name         AnfahrtAnsicht
// @version      0.2
// @description  
// @author       feba66
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// @namespace    https://github.com/feba66/LSS-Scripts/raw/master/AnfahrtAnsicht.user.js
// ==/UserScript==


(function () {
    'use strict';
    var anfahrt = {};
    var anfahrtLen = 0;
    var vorOrt = {};
    var needed = {};
    var playerArray = {};
    var playerArrayLen = 0;
    const debug = false;
    const debug2 = false;
    const debug3 = false;

    function addAnfahrt(input) {
        if (anfahrt[input] == null || anfahrt[input] == undefined) {
            anfahrt[input] = 0;
            anfahrtLen++;
        }
        anfahrt[input]++;
    }
    function resolveNeeded(input) {
        //console.log(input);
        var num = parseInt(input.substring(0, input.indexOf(" ")));
        var end = input.length;
        if (input.indexOf(".") > -1) {
            end = input.indexOf(".");
        }
        if (input.indexOf(",") > -1 && input.indexOf("Schlauch") <= -1) {
            end = input.indexOf(",");
        }
        var type = input.substring(input.indexOf(" ") + 1, end);
        switch (type) {
            case "Drehleiter (DLK 23)":
                type = "DL";
                break;
            case "Gerätekraftwagen (GKW)":
                type = "GKW";
                break;
            case "LKW Kipper (LKW K 9)":
                type = "LKW K 9";
                break;
            case "Löschfahrzeuge (LF)":
                type = "LF";
                break;
            case "Radlader (BRmG R)":
                type = "BRmG R";
                break;
            case "THW-Einsatzleitung (MTW TZ)":
                type = "MTW TZ";
                break;
            case "THW-Mehrzweckkraftwagen (MzKW)":
                type = "MzKW";
                break;
            case "Drehleitern (DLK 23)":
                type = "DL";
                break;
            case "Löschfahrzeug (LF)":
                type = "LF";
                break;
            case "Rüstwagen oder HLF":
                type = "RW";
                break; 
            case "GW-A oder AB-Atemschutz":
                type = "GW-A";
                break;
            case "GW-Gefahrgut":
                type = "GW-Gefahr";
                break;
            case "GW-Messtechnik":
                type = "GW-Mess";
                break;
            case "Schlauchwagen (GW-L2 Wasser, SW 1000, SW 2000 oder Ähnliches)":
                type = "SW";
                break; 
            case "Anhänger Drucklufterzeugung":
                type = "Anh DLE";
                break;
            case "":
                type = "";
                break;
            default:
                //console.log(type);
                break;
        }
        needed[type] = num;
        return type;
    } 
    function resolveColor(input) {
        switch (input) {
            case "FuStW":
                return "green";
            case "LF":
            case "DL":
            case "GW-Mess":
            case "GW-Gefahr":
            case "GW-A":
            case "SW":
            case "RW":
            case "ELW 1":
            case "ELW 2":
            case "Dekon-P":
                return "red";
            case "Anh DLE":
            case "MzKW":
            case "MTW TZ":
            case "GKW":
            case "BRmG R":
            case "LKW K 9":
                return "blue";
            default:
        }
        return "gray";
    }
    function resolveAnfahrt(input) {
        switch (input) {
            case "HLF 20":
            case "HLF 10":
                addAnfahrt("LF");
                addAnfahrt("RW");
                break;
            case "GW-Gefahrgut":
            case "AB-Gefahrgut":
                addAnfahrt("GW-Gefahr");
                break;
            case "GW-Messtechnik":
                addAnfahrt("GW-Mess");
                break;
            case "ELW 2":
            case "AB-Einsatzleitung":
                addAnfahrt("ELW 2");
                addAnfahrt("ELW 1");
                break;
            case "ELW 1":
                addAnfahrt("ELW 1");
                break;
            case "LF 20":
            case "LF 20/16":
            case "LF 10":
            case "LF 10/6":
            case "LF 8/6":
            case "LF 16-TS":
            case "TLF 16":
            case "TLF 16/24-Tr":
            case "TLF 16/25":
            case "TLF 16/45":
            case "TLF 20/40":
            case "TLF 20/40-SL":
            case "TLF 2000":
            case "TLF 3000":
            case "TLF 4000":
            case "TLF 8/18":
            case "TLF 8/8":
                addAnfahrt("LF");
                break;
            case "Dekon-P":
            case "AB-Dekon-P":
                addAnfahrt("Dekon-P");
                break; 
            case "FuStW":
                addAnfahrt("FuStW");
                break;
            case "AB-Atemschutz":
            case "GW-A":
                addAnfahrt("GW-A");
                break;
            case "DLK 23":
                addAnfahrt("DL");
                break;
            case "RTW":
                addAnfahrt("RTW");
                break;
            case "NEF":
                addAnfahrt("NEF");
                break;
            case "SW 2000":
            case "SW 1000":
            case "SW 2000-Tr":
            case "SW Kats":
                addAnfahrt("SW");
                break;
            case "RW":
                addAnfahrt("RW");
                break; 
            case "FwK":
                addAnfahrt("FwK");
                break;
            case "GW-Höhenrettung":
                addAnfahrt("GW-Höhen");
                break; 
            case "GKW":
                addAnfahrt("GKW");
                break;
            case "Anh DLE":
                addAnfahrt("Anh DLE");
                break;
            case "LKW K 9":
                addAnfahrt("LKW K 9");
                break;
            case "BRmG R":
                addAnfahrt("BRmG R");
                break;
            case "MTW-TZ":
                addAnfahrt("MTW-TZ");
                break;
            case "MzKW":
                addAnfahrt("MzKW");
                break;
            case "MLW 5":
                addAnfahrt("MLW 5");
                break;
            case "":
                addAnfahrt("");
                break;
            case "WLF"://doesnt count
                break;
            default:
                console.log("Anfahrt: " + input);
        }
    }
    var asd = $("#mission_vehicle_driving");
    if (asd.length > 0) {
        if (debug)
            console.log(asd);
        var vehicles = asd[0].children[1].children;
        if (debug)
            console.log(vehicles);
        for (var i = 0; i < vehicles.length; i++) {
            if (vehicles[i].childNodes[3] != undefined && vehicles[i].childNodes[3].childNodes[3] != undefined) {
                var vehType = vehicles[i].childNodes[3].childNodes[3].innerText;
                var type = vehType.substring(1, vehType.length - 1);
                if (debug)
                    console.log(type);
                resolveAnfahrt(type);
            }
            if (vehicles[i].childNodes[13] != undefined ) {
                var name = vehicles[i].childNodes[13].innerText;
                if (debug)
                    console.log(name);
                if (playerArray[name] == null || playerArray[name] == undefined) {
                    playerArray[name] = 0;
                    playerArrayLen++;
                }
                playerArray[name]++;
                if (debug)
                    console.log(playerArray[name]);
            }
        }
    }
    var sec = $("#mission_vehicle_at_mission");
    if (sec.length>0) {
        if (debug2) 
            console.log(sec);
        var vehicles2 = sec[0].children[1].children
        if (debug2)
            console.log(vehicles2);
        for (var i = 0; i < vehicles2.length; i++) {
            if (vehicles2[i].childNodes[3] != undefined && vehicles2[i].childNodes[3].childNodes[3] != undefined) {
                var vehType = vehicles2[i].childNodes[3].childNodes[3].innerText;
                var type = vehType.substring(1, vehType.length - 1);
                if (debug2)
                    console.log(type);
                if (vorOrt[type] == null || vorOrt[type] == undefined) {
                    vorOrt[type] = 0;
                }
                vorOrt[type]++;
                resolveAnfahrt(type);
                if (debug2)
                    console.log(vorOrt[type]);
            }
            if (vehicles2[i].childNodes[9] != undefined) {
                var name = vehicles2[i].childNodes[9].innerText;
                if (debug2)
                    console.log(name);
                if (playerArray[name] == null || playerArray[name] == undefined) {
                    playerArray[name] = 0;
                    playerArrayLen++;
                }
                playerArray[name]++;
                if (debug2)
                    console.log(playerArray[name]);
            }
        }
    }
    //Zusätzlich benötigte Fahrzeuge: 2 Löschfahrzeuge (LF), 1 Drehleiter (DLK 23), 1 Gerätekraftwagen (GKW), 1 THW-Einsatzleitung (MTW TZ), 1 THW-Mehrzweckkraftwagen (MzKW), 1 Radlader (BRmG R), 1 LKW Kipper (LKW K 9).
    var missing_text = $("#missing_text");
    if (missing_text != undefined) {
        var missing = missing_text[0].innerText;
        //console.log(missing);
        var edited = missing;

        if (missing.startsWith("Zusätzlich benötigte Fahrzeuge: ")) {
            edited = missing.substring("Zusätzlich benötigte Fahrzeuge: ".length);
            //console.log(edited);
            var indx = -1;
            var lastresort = 200;
            while ((indx = edited.indexOf(",")) > -1 && lastresort > 0) {
                var sub = edited.substring(0, indx);
                if (sub.indexOf("Schlauchwagen")>-1) {
                    indx = indx = edited.indexOf(",",edited.indexOf(")"));
                    sub = edited.substring(0, indx);
                }
                //console.log(sub);
                edited = edited.substring(indx + 2);
                resolveNeeded(sub);
                //console.log(edited);
                lastresort--;
            }
            if (edited.indexOf(".") > -1) {
                resolveNeeded(edited);
            }
        }
    }
    //anfahrende von gefordert abziehen
    //anfahrt
    //needed
    for (var vehic in anfahrt) {
        if (needed[vehic]!=undefined) {
            needed[vehic] -= anfahrt[vehic];
            if (needed[vehic]<=0) {
                delete needed[vehic];
            }
        }
    }



    //Ausgabe ab hier
    //col_right
    var parent = $("#col_right");
    if (parent!=undefined) {
        var div = document.createElement("div");
        div.id = "whosThere";
        var i = 0;
        var ap = "";
        for (var vari in playerArray) {
            ap += vari + ": " + playerArray[vari];
            i++;
            if (i < playerArrayLen) {
                ap += ", ";
            }
        }
        div.append(ap);
        parent.prepend(div);
    }

    


    var allParent = $("#iframe-inside-container");
    //console.log(allParent);
    var after = $("clearfix");
    //console.log(after);
    var span = document.createElement("div");
    //span.append("Test span");
    span.id = "test_span";
    span.style.marginBottom = "1em";
    //allParent[0].style.backgroundColor = "#424242";
    for (var need in needed) {
        var node = document.createElement("span");
        node.id = "need" + need;
        node.append(need + ": " + needed[need]);
        node.style.backgroundColor = resolveColor(need);
        node.style.color = "white";
        node.style.borderRadius = "0.25em";
        node.style.padding = "0.6em";
        node.style.paddingTop = "0.2em";
        node.style.paddingBottom = "0.3em";
        node.style.display = "inline";
        node.style.marginRight = "0.25em";
        node.style.marginBottom = "1em";
        span.appendChild(node);
    }
    allParent.prepend(span);
    allParent.prepend(after);
    var lightbox = $("#lightbox_close_inside");
    //console.log(lightbox);
    var mission_header_info = $("#mission_general_info");
    //console.log(mission_header_info);
    allParent.prepend(mission_header_info[0].parentNode);
    allParent.prepend(lightbox);

    if (debug3) {
        console.log(anfahrt);
        console.log(vorOrt);
        console.log(needed);
        console.log(playerArray);
    }
    
    anfahrt = null;
    vorOrt = null;
    needed = null;
    playerArray = null;
    playerArrayLen = 0;
})();
