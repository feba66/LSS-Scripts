// ==UserScript==
// @name         StatisticsFeba
// @version      1.0
// @description  
// @author       feba66
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	//======= consts =============================================================================================================================================================

	const MISSIONSTRING = "FEBA66_MISSIONLOG";
	const BUILDINGSTRING = "FEBA66_BUILDINGS";

	//======= vars ===============================================================================================================================================================

	var vehicles = {};
	var missions = {};
	var buildings = {};
	var lastRequest = Date.now();
	var saveTime = 0;

	//======= overrides ==========================================================================================================================================================

	var missionMarkerAddOrig = missionMarkerAdd;
	missionMarkerAdd = function (e) {
		missionMarkerAddOrig(e);
		addToMissions(e);
	}

	//======= funcs ==============================================================================================================================================================

	function addToMissions(e) {
		if (e.user_id == user_id) {

			if (missions[e.id] != undefined) {
				//console.log(missions[e.id]);
			}
			else {
				var tmp = {
					caption: e.caption,
					filter_id: e.filter_id,
					id: e.id,
					generatedBy: null,
					latitude: e.latitude,
					longitude: e.longitude,
					mtid: e.mtid,
					distance: null
				};
				missions[e.id] = tmp;
				getGeneratedBy(e.id, e.mtid);
			}
		}
	}

	function getGeneratedBy(id, mtid) {
		var url = "/einsaetze/" + mtid + "?mission_id=" + id;
		var timeout = 100, time = Date.now();
		//console.log("GenBy: " + id + ", " + timeout + ", " + lastRequest + ", " + time);

		if (lastRequest > time || time - lastRequest > 0 && time - lastRequest < 100) {
			timeout = (lastRequest + 100) - time;
			lastRequest += 100;
			//console.log(id+": "+timeout);
        } else {
			lastRequest = time;
        }
		//console.log("GenBy: " + id + ", " + timeout + ", " + lastRequest + ", " + time);
		setTimeout(function () {
			fetch(url)
				.then((resp) => resp.text())
				.then(function (data) {
					var datas = data.lastIndexOf("<td>Generiert von</td>");
					var start = data.indexOf("<a href=\"/buildings/", datas);
					var index = data.indexOf("\"", datas);
					var index2 = data.indexOf("\"", index + 1);
					index += 12;
					var Gid = parseInt(data.substr(index, index2 - index));

					
					missions[id]["generatedBy"] = Gid;
					missions[id].distance = getMissionDistance(missions[id].latitude, missions[id].longitude, Gid, id, mtid);
				})
				.catch(function (error) {
					console.log(error);
				});
		}, timeout);
		

	}
	function getMissionDistance(misLat, misLon, buildingID, mid, mtid) {
		if (missions[mid].distance == undefined) {
			var bLat = 0;
			var bLon = 0;

			try {
				bLat = buildings[buildingID].latitude;
				bLon = buildings[buildingID].longitude;
            } catch (e) {
				console.log(e);
            }

			const R = 6371e3; // metres
			const a1 = misLat * Math.PI / 180; // ?, ? in radians
			const a2 = bLat * Math.PI / 180;
			const b1 = (bLat - misLat) * Math.PI / 180;
			const b2 = (bLon - misLon) * Math.PI / 180;

			const a = Math.sin(b1 / 2) * Math.sin(b1 / 2) +
				Math.cos(a1) * Math.cos(a2) *
				Math.sin(b2 / 2) * Math.sin(b2 / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			const d = R * c; // in metres
			console.log(mid+": "+d);

			return d;
		}
		return 421337;
	}

	function saveMissionsToStorage() {
		saveTime = Date.now();
		localStorage.setItem(MISSIONSTRING, JSON.stringify({"time":saveTime, "data": missions }));
		console.log("Saved missions to Storage");
	}
	function loadMissionsFromStorage() {
		var strg = localStorage.getItem(MISSIONSTRING);
		var json = JSON.parse(strg);
		if (json) {
			if (json.data) {
				missions = json.data;
				console.log("Loaded MissionLog");
				console.log(json.data);
            }
        }
    }


	//============================================================================================================================================================================




	//============================================================================================================================================================================
	function handleBuild(data) {
		try {
			for (var i = 0; i < data.length; i++) {
				buildings[data[i].id] = data[i];
			}
        } catch (e) {
			console.log(e);
        }
    }
	var buildingsAPI;
	var overtime = false;
	if ((buildingsAPI = localStorage.getItem(BUILDINGSTRING)) != null) {
		var temp = JSON.parse(buildingsAPI);
		if (Date.now() - temp.time > 60000) {
			overtime = true;
		} else {
			handleBuild(temp.data);
		}
	} 
	if (overtime) {
		fetch("https://www.leitstellenspiel.de/api/buildings").then(function (response) {
			return response.json();
		}).then(function (data) {
			console.log(data);
			var tmp = {};
			tmp.time = Date.now();
			tmp.data = data;
			handleBuild(data);
			localStorage.setItem(BUILDINGSTRING, JSON.stringify(tmp));
		}).catch(function (error) {
			console.log("error: " + error);
		});
	}
	//============================================================================================================================================================================

	var btn = $('<li><a href="#" id="feba66_statistics"><span style="border:1px solid lightgray;padding:2px;border-radius:8px">MissionLog</span></a></li>');
	$('#navbar-main-collapse > ul').append(btn);
	var btn2 = $('<li><a href="#" id="feba66_buildings"><span style="border:1px solid lightgray;padding:2px;border-radius:8px">Buildings</span></a></li>');
	$('#navbar-main-collapse > ul').append(btn2);

	$("#feba66_statistics").click(function () {
		console.log(missions);
		var string = "";
		var first = true;
		for (var m in missions) {
			if (first) {
				for (var a in missions[m]) {
					string += a + ";";
				}
				string += "\n";
				first = false;
			}
			for (var a in missions[m]) {
				string += missions[m][a] + ";";
			}
			string += "\n";
		}
		while (string.indexOf(".") > -1) {
			string = string.replace(".", ",");

		}
		console.log(string);
	});
	$("#feba66_buildings").click(function () {
		console.log(buildings);
		var string = "";
		var first = true;
		for (var m in buildings) {
			if (first) {
				string += "building_type" + ";";
				string += "caption" + ";";
				string += "id" + ";";
				string += "latitude" + ";";
				string += "longitude" + ";";
				string += "\n";
				first = false;
			}

			string += buildings[m]["building_type"] + ";";
			string += buildings[m]["caption"] + ";";
			string += buildings[m]["id"] + ";";
			string += buildings[m]["latitude"] + ";";
			string += buildings[m]["longitude"] + ";";
			string += "\n";
		}
		while (string.indexOf(".") > -1) {
			string = string.replace(".", ",");

		}
		console.log(string);
	});
	loadMissionsFromStorage();

	setInterval(function () {
		saveMissionsToStorage();
	}, 60000);
})();
