// ==UserScript==
// @name         StatisticsFeba
// @version      1.0.1
// @description  
// @author       feba66
// @match        https://www.leitstellenspiel.de/
// @grant        none
// @updateURL    https://github.com/feba66/LSS-Scripts/raw/main/StatisticsFeba.user.js
// ==/UserScript==

(function () {
	'use strict';
	//======= consts =============================================================================================================================================================

	const MISSIONSTRING = "FEBA66_MISSIONLOG";
	const BUILDINGSTRING = "FEBA66_BUILDINGS";

	//======= vars ===============================================================================================================================================================

	var vehicles = {};
	var feba_missions = {};
	var feba_buildings = {};
	var feba_lastRequest = Date.now();
	var feba_saveTime = 0;

	//======= overrides ==========================================================================================================================================================

	var feba_missionMarkerAddOrig = missionMarkerAdd;
	missionMarkerAdd = function (e) {
		try {
			feba_addToMissions(e);
        } catch (ex) {
			console.log(ex);
        }
		feba_missionMarkerAddOrig(e);
	}

	//======= funcs ==============================================================================================================================================================

	function feba_addToMissions(e) {
		if (e.user_id == user_id) {

			if (feba_missions[e.id] != undefined) {
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
				feba_missions[e.id] = tmp;
				tmp = null;
				feba_getGeneratedBy(e.id, e.mtid);
			}
		}
	}

	function feba_getGeneratedBy(id, mtid) {
		var url = "/einsaetze/" + mtid + "?mission_id=" + id;
		var timeout = 100, time = Date.now();
		//console.log("GenBy: " + id + ", " + timeout + ", " + lastRequest + ", " + time);

		if (feba_lastRequest > time || time - feba_lastRequest > 0 && time - feba_lastRequest < 100) {
			timeout = (feba_lastRequest + 100) - time;
			feba_lastRequest += 100;
			//console.log(id+": "+timeout);
        } else {
			feba_lastRequest = time;
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

					
					feba_missions[id]["generatedBy"] = Gid;
					if (Gid != undefined) {
						if (feba_buildings[Gid] != undefined) {
							feba_missions[id].distance = feba_getMissionDistance(feba_missions[id].latitude, feba_missions[id].longitude, Gid, id, mtid);
                        } else {
							console.log("Building "+Gid+" is not in buildings-array");
                        }
                    } else {
						console.log("Building for mission " + id + " is undefined");
                    }
					
				})
				.catch(function (error) {
					console.log(error);
				});
		}, timeout);
		

	}
	function feba_getMissionDistance(misLat, misLon, buildingID, mid, mtid) {
		if (feba_missions[mid].distance == undefined) {
			var bLat = 0;
			var bLon = 0;

			try {
				bLat = feba_buildings[buildingID].latitude;
				bLon = feba_buildings[buildingID].longitude;
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

	function feba_saveMissionsToStorage() {
		feba_saveTime = Date.now();
		localStorage.setItem(MISSIONSTRING, JSON.stringify({"time":feba_saveTime, "data": feba_missions }));
		console.log("Saved missions to Storage");
	}
	function feba_loadMissionsFromStorage() {
		var strg = localStorage.getItem(MISSIONSTRING);
		var json = JSON.parse(strg);
		if (json) {
			if (json.data) {
				feba_missions = json.data;
				console.log("Loaded MissionLog");
				console.log(json.data);
            }
        }
    }


	//============================================================================================================================================================================




	//============================================================================================================================================================================
	function feba_handleBuild(data) {
		try {
			for (var i = 0; i < data.length; i++) {
				feba_buildings[data[i].id] = data[i];
			}
        } catch (e) {
			console.log(e);
        }
    }
	var feba_buildingsAPI;
	var feba_overtime = false;
	if ((feba_buildingsAPI = localStorage.getItem(BUILDINGSTRING)) != null) {
		var temp = JSON.parse(feba_buildingsAPI);
		if (Date.now() - temp.time > 60000) {
			feba_overtime = true;
		} else {
			feba_handleBuild(temp.data);
		}
	} 
	if (feba_overtime) {
		fetch("https://www.leitstellenspiel.de/api/buildings").then(function (response) {
			return response.json();
		}).then(function (data) {
			console.log(data);
			var tmp = {};
			tmp.time = Date.now();
			tmp.data = data;
			feba_handleBuild(data);
			localStorage.setItem(BUILDINGSTRING, JSON.stringify(tmp));
		}).catch(function (error) {
			console.log("error: " + error);
		});
	}
	//============================================================================================================================================================================

	var feba_btn = $('<li><a href="#" id="feba66_statistics"><span style="border:1px solid lightgray;padding:2px;border-radius:8px">MissionLog</span></a></li>');
	$('#navbar-main-collapse > ul').append(feba_btn);
	var feba_btn2 = $('<li><a href="#" id="feba66_buildings"><span style="border:1px solid lightgray;padding:2px;border-radius:8px">Buildings</span></a></li>');
	$('#navbar-main-collapse > ul').append(feba_btn2);

	$("#feba66_statistics").click(function () {
		console.log(feba_missions);
		var string = "";
		var first = true;
		for (var m in feba_missions) {
			if (first) {
				for (var a in feba_missions[m]) {
					string += a + ";";
				}
				string += "\n";
				first = false;
			}
			for (var a in feba_missions[m]) {
				string += feba_missions[m][a] + ";";
			}
			string += "\n";
		}
		while (string.indexOf(".") > -1) {
			string = string.replace(".", ",");

		}
		console.log(string);
	});
	$("#feba66_buildings").click(function () {
		console.log(feba_buildings);
		var string = "";
		var first = true;
		for (var m in feba_buildings) {
			if (first) {
				string += "building_type" + ";";
				string += "caption" + ";";
				string += "id" + ";";
				string += "latitude" + ";";
				string += "longitude" + ";";
				string += "\n";
				first = false;
			}

			string += feba_buildings[m]["building_type"] + ";";
			string += feba_buildings[m]["caption"] + ";";
			string += feba_buildings[m]["id"] + ";";
			string += feba_buildings[m]["latitude"] + ";";
			string += feba_buildings[m]["longitude"] + ";";
			string += "\n";
		}
		while (string.indexOf(".") > -1) {
			string = string.replace(".", ",");

		}
		console.log(string);
	});
	feba_loadMissionsFromStorage();

	setInterval(function () {
		feba_saveMissionsToStorage();
	}, 60000);
})();
