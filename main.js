var gameData;
var options;
var autosave;

/* One-time costs */
var retainManaLayerCost = 10;
var automageCost = 25;

function initialize(){
	gameData = {
		mana: 0,
		manaPower: 1,
		manaPowerBase: 10,
		manaPowerMulti: 1,
		mages: 0,
		automage: false,
		retainManaLayer: false,
		blood: 0,
		bloodMulti: 1,
		bloodUnlocked: false
	}
	
}

function save(){
	localStorage.setItem("wizIncSave", JSON.stringify(gameData))
}

function load(){
	var savegame = JSON.parse(localStorage.getItem("wizIncSave"))
	if (savegame !== null) {
		gameData = savegame;
	}
	updateElements();
}

function hardReset(){
	initialize();
	save();
	updateElements();
}

/* Generic Exponential Cost */
function exponentialCost(power){
	var cost = Math.pow(2,power);
	return cost;
}

/* Cost + Gain Functions */
function powerCost(){
	var cost = Math.pow(gameData.manaPowerBase,gameData.manaPower-1)*5;
	return cost;
}
function mageCost(){
	var cost = (gameData.mages+1)*10;
	return cost;
}
function bloodGain(){
	var gain = 0
	if(gameData.mages >= 10){
		gain = Math.log(gameData.mages)/Math.log(10)*gameData.bloodMulti;
	}
	return roundToDecimal(gain,2);
}

/* Upgrades! */
function produceMana(){
	gameData.mana += (gameData.manaPower*gameData.manaPowerMulti);
	updateElements();
}
function increasePower(){
	if(gameData.mana >= powerCost()){
		gameData.mana -= powerCost();
		gameData.manaPower += 1;
	}
	updateElements();
}

function hireMage(){
	if(gameData.mana >= mageCost()){
		gameData.mana -= mageCost();
		gameData.mages += 1;
	}
	updateElements();
}

function sacrifice(){
	if(bloodGain() >= 1){
		gameData.blood += bloodGain();
		if(gameData.retainManaLayer == false){
			gameData.mages = 0;
			gameData.mana = 0;
			gameData.manaPower = 1;
		}
		gameData.bloodUnlocked = true;
	}
	updateElements();
}

function powerCostDecrease(){
	if(gameData.blood >= exponentialCost(10-gameData.manaPowerBase) && gameData.manaPowerBase>2){
		gameData.blood -= exponentialCost(10-gameData.manaPowerBase);
		gameData.manaPowerBase -= 1;
	}
	updateElements();
}

function powerMultiplier(){
	if(gameData.blood >= exponentialCost(gameData.manaPowerMulti)){
		gameData.blood -= exponentialCost(gameData.manaPowerMulti);
		gameData.manaPowerMulti += 1;
	}
	updateElements();
}

function bloodMultiplier(){
	if(gameData.blood >= exponentialCost(gameData.bloodMulti+1)){
		gameData.blood -= exponentialCost(gameData.bloodMulti+1);
		gameData.bloodMulti += 1;
	}
	updateElements();
}

function retainMana(){
	if(gameData.blood >= retainManaLayerCost && gameData.retainManaLayer == false){
		gameData.blood -= retainManaLayerCost;
		gameData.retainManaLayer = true;
	}
	updateElements();
}

function activateAutomage(){
	if(gameData.blood >= automageCost && gameData.automage == false){
		gameData.blood -= automageCost;
		gameData.automage = true;
	}
	updateElements();
}

function updateElements(){
	document.getElementById("mProduceTitle").innerHTML = "Produce " + toSciNotation(gameData.manaPower*gameData.manaPowerMulti) + " Mana";
	document.getElementById("powerTitle").innerHTML = "Increase Mana Power | "+toSciNotation(powerCost())+" Mana";
	document.getElementById("powerDesc").innerHTML = "Infuse yourself with mana to produce more at once. Currently at "+toSciNotation(gameData.manaPower)+" Mana Power.";
	document.getElementById("mageDesc").innerHTML = "Hire a mage to produce mana for you. "+toSciNotation(gameData.mages) + " Hired.";
	document.getElementById("mageTitle").innerHTML = "Hire Mage | "+toSciNotation(mageCost())+" Mana";
	if(gameData.mages > 0){
		document.getElementById("manaAmount").innerHTML = toSciNotation(gameData.mana) + " Mana ("+toSciNotation(gameData.mages*gameData.manaPower*gameData.manaPowerMulti)+"/s)";
	} else{
		document.getElementById("manaAmount").innerHTML = toSciNotation(gameData.mana) + " Mana";
	}
	document.getElementById("bloodAmount").innerHTML = toSciNotation(gameData.blood) + " Blood";
	document.getElementById("sacrificeDesc").innerHTML = "Sacrifice all Mana, Power, and Mages for "+toSciNotation(bloodGain())+" Blood.";
	if(gameData.manaPowerBase == 2){
		document.getElementById("powerCheapTitle").innerHTML = "Cheaper Mana Power Upgrade | MAXED";
	} else{
		document.getElementById("powerCheapTitle").innerHTML = "Cheaper Mana Power Upgrade | "+toSciNotation(exponentialCost(10-gameData.manaPowerBase))+" Blood";
	}
	document.getElementById("powerCheapDesc").innerHTML = "Decrease the base cost of the mana power upgrade. Current base: "+gameData.manaPowerBase;
	document.getElementById("powerMultiTitle").innerHTML = "Multiply Mana Power Upgrade | "+toSciNotation(exponentialCost(gameData.manaPowerMulti))+" Blood";
	document.getElementById("powerMultiDesc").innerHTML = "Add a multiplier to the mana power upgrade. Current Multi: x"+toSciNotation(gameData.manaPowerMulti);
	document.getElementById("bloodMultiTitle").innerHTML = "Multiply Blood Gain | "+toSciNotation(exponentialCost(gameData.bloodMulti+1))+" Blood";
	document.getElementById("bloodMultiDesc").innerHTML = "Add a multiplier to blood gain on sacrifice. Current Multi: x"+toSciNotation(gameData.bloodMulti);
	if(gameData.retainManaLayer == true){
		document.getElementById("retainManaTitle").innerHTML = "Retain Mana Layer | BOUGHT";
	} else{
		document.getElementById("retainManaTitle").innerHTML = "Retain Mana Layer | "+toSciNotation(retainManaLayerCost)+" Blood";
	}
	document.getElementById("retainManaDesc").innerHTML = "Retain everything in the mana layer on sacrifice.";
	if(gameData.automage == true){
		document.getElementById("automageTitle").innerHTML = "Auto-Mage | BOUGHT";
	} else{
		document.getElementById("automageTitle").innerHTML = "Auto-Mage | "+toSciNotation(automageCost)+" Blood";
	}
	document.getElementById("automageDesc").innerHTML = "Automatically hires mages for you if you can afford them.";
	
	//Hide elements for progression
	if(gameData.mana >= 5 || gameData.manaPower > 1){
		document.getElementById("powerButton").style.display = "block";
	} else{
		document.getElementById("powerButton").style.display = "none";
	}
	
	if(gameData.mana >= 100 || gameData.mages > 0){
		document.getElementById("mageButton").style.display = "block";
	} else{
		document.getElementById("mageButton").style.display = "none";
	}
	
	if(gameData.mages >= 10 || gameData.bloodUnlocked == true){
		document.getElementById("bloodBlock").style.display = "block";
	} else{
		document.getElementById("bloodBlock").style.display = "none";
	}
	
	if(gameData.blood >= 2 || gameData.manaPowerMulti > 1){
		document.getElementById("powerMultiButton").style.display = "block";
	} else{
		document.getElementById("powerMultiButton").style.display = "none";
	}
	
	if(gameData.blood >= 4 || gameData.bloodMulti > 1){
		document.getElementById("bloodMultiButton").style.display = "block";
	} else{
		document.getElementById("bloodMultiButton").style.display = "none";
	}
	
	if(gameData.blood >= retainManaLayerCost || gameData.retainManaLayer == true){
		document.getElementById("retainManaButton").style.display = "block";
	} else{
		document.getElementById("retainManaButton").style.display = "none";
	}
	
	if(gameData.blood >= automageCost || gameData.automage == true){
		document.getElementById("automageButton").style.display = "block";
	} else{
		document.getElementById("automageButton").style.display = "none";
	}
}

/* Number Display Heler Functions */
function toSciNotation(num){
	if(num >= 10000){
		return num.toExponential(2);
	}
	return roundToDecimal(num,2);
}
function roundToDecimal(num,decimals){
	var result = Math.round((num + Number.EPSILON) * Math.pow(10,decimals)) / Math.pow(10,decimals);
	return result;
}

window.onload = function(){
	options = document.getElementById("optionsMenu");
	autosave = document.getElementById("autosave");
	initialize();
	load();
	updateElements();
}
window.onclick = function(event) {
  if (event.target == options) {
    options.style.display = "none";
  }
}

function openOptions(){
	options.style.display = "block";
}
function closeOptions(){
	options.style.display = "none";
}

var mainGameLoop = window.setInterval(function() {
	if(gameData.mages > 0){
		for(var i = 0; i < gameData.mages; i += 1){
			produceMana();
		}
	}
	if(gameData.automage == true){
		hireMage();
	}
	if(autosave.checked == true){
		save();
	}
	updateElements();
}, 1000)