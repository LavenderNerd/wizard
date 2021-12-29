var gameData;
var options;
var autosave;
var pInterval;

var buyMax = false;

/* One-time costs */
var retainManaLayerCost = 10;
var automageCost = 25;

/* Progression Hints */
var nextHint = [
	"Next Upgrade Unlocked at 5 Mana",
	"Next Upgrade Unlocked at 10 Mana",
	"Next Layer Unlocked at 10 Mages",
	"Next Upgrade Unlocked at 2 Blood",
	"Next Upgrade Unlocked at 4 Blood",
	"Next Upgrade Unlocked at 10 Blood",
	"Next Upgrade Unlocked at 25 Blood",
	"Congrats, You've Reached the Current End of the Game!"
]

function initialize(){
	gameData = {
		version: "0.2.2",
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
		if(typeof savegame.version === "undefined" || savegame.version != gameData.version){
			if (typeof savegame.mana !== "undefined"){ gameData.mana = savegame.mana; }
			if (typeof savegame.manaPower !== "undefined"){ gameData.manaPower = savegame.manaPower; }
			if (typeof savegame.manaPowerBase !== "undefined"){ gameData.manaPowerBase = savegame.manaPowerBase; }
			if (typeof savegame.manaPowerMulti !== "undefined"){ gameData.manaPowerMulti = savegame.manaPowerMulti; }
			if (typeof savegame.mages !== "undefined"){ gameData.mages = savegame.mages; }
			if (typeof savegame.automage !== "undefined"){ gameData.automage = savegame.automage; }
			if (typeof savegame.retainManaLayer !== "undefined"){ gameData.retainManaLayer = savegame.retainManaLayer; }
			if (typeof savegame.blood !== "undefined"){ gameData.blood = savegame.blood; }
			if (typeof savegame.bloodMulti !== "undefined"){ gameData.bloodMulti = savegame.bloodMulti; }
			if (typeof savegame.bloodUnlocked !== "undefined"){ gameData.bloodUnlocked = savegame.bloodUnlocked; }
		} else{
			gameData = savegame;
		}
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
	var cost = 10+Math.floor(Math.pow(1.7,gameData.mages))-1;
	return cost;
}
function bloodGain(){
	var gain = 0
	if(gameData.mages >= 10){
		//gain = Math.log(gameData.mages)/Math.log(10)*gameData.bloodMulti;
		gain = (gameData.mages/10)*gameData.bloodMulti;
	}
	return roundToDecimal(gain,2);
}
function powerCheapCost(){
	var cost = Math.pow(2,10-gameData.manaPowerBase);
	return cost;
}
function powerMultiCost(){
	var cost = Math.pow(2,gameData.manaPowerMulti);
	return cost;
}
function bloodMultiCost(){
	var cost = Math.pow(2,gameData.bloodMulti+1);
	return cost;
}

/* Holding mouse on Produce Mana */
function startProduce() {
    pInterval = setInterval(function() {
		produceMana();
    }, 250);
}
function endProduce(){
	clearInterval(pInterval);
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
		if(buyMax == true){ increasePower(); }
	}
	updateElements();
}

function hireMage(){
	if(gameData.mana >= mageCost()){
		gameData.mana -= mageCost();
		gameData.mages += 1;
		if(buyMax == true){ hireMage(); }
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
	if(gameData.blood >= powerCheapCost() && gameData.manaPowerBase>2){
		gameData.blood -= powerCheapCost();
		gameData.manaPowerBase -= 1;
		if(buyMax == true){ powerCostDecrease(); }
	}
	updateElements();
}

function powerMultiplier(){
	if(gameData.blood >= powerMultiCost()){
		gameData.blood -= powerMultiCost();
		gameData.manaPowerMulti += 1;
		if(buyMax == true){ powerMultiplier(); }
	}
	updateElements();
}

function bloodMultiplier(){
	if(gameData.blood >= bloodMultiCost()){
		gameData.blood -= bloodMultiCost();
		gameData.bloodMulti += 1;
		if(buyMax == true){ bloodMultiplier(); }
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

/* Get the game stage to show progression hints */
function getGameStage(){
	var stage = 0;
	if(gameData.mana >= 5 || gameData.manaPower > 1){
		stage = 1;
	}
	if(gameData.mana >= 10 || gameData.mages > 0){
		stage = 2;
	}
	if(gameData.mages >= 10 || gameData.bloodUnlocked == true){
		stage = 3;
	}
	if(gameData.blood >= 2 || gameData.manaPowerMulti > 1){
		stage = 4;
	}
	if(gameData.blood >= 4 || gameData.bloodMulti > 1){
		stage = 5;
	}
	if(gameData.blood >= retainManaLayerCost || gameData.retainManaLayer == true){
		stage = 6;
	}
	if(gameData.blood >= automageCost || gameData.automage == true){
		stage = 7;
	}
	
	return stage;
}

function updateElements(){
	document.getElementById("gameHint").innerHTML = nextHint[getGameStage()];
	
	document.getElementById("mProduceTitle").innerHTML = "Produce " + toSciNotation(gameData.manaPower*gameData.manaPowerMulti) + " Mana";
	document.getElementById("powerTitle").innerHTML = "Increase Mana Power | "+toSciNotation(powerCost())+" Mana";
	document.getElementById("powerDesc").innerHTML = "Infuse yourself with Mana to produce more at once. Currently at "+toSciNotation(gameData.manaPower)+" Mana Power.";
	document.getElementById("mageDesc").innerHTML = "Hire a Mage to produce Mana for you. "+toSciNotation(gameData.mages) + " Hired.";
	document.getElementById("mageTitle").innerHTML = "Hire Mage | "+toSciNotation(mageCost())+" Mana";
	if(gameData.mages > 0){
		document.getElementById("manaAmount").innerHTML = toSciNotation(gameData.mana) + " Mana ("+toSciNotation(gameData.mages*gameData.manaPower*gameData.manaPowerMulti)+"/s)";
	} else{
		document.getElementById("manaAmount").innerHTML = toSciNotation(gameData.mana) + " Mana";
	}
	document.getElementById("bloodAmount").innerHTML = toSciNotation(gameData.blood) + " Blood";
	document.getElementById("sacrificeDesc").innerHTML = "Sacrifice all Mana, Power, and Mages for "+toSciNotation(bloodGain())+" Blood.<br />Blood gain is equal to one tenth of owned Mages.";
	if(gameData.manaPowerBase == 2){
		document.getElementById("powerCheapTitle").innerHTML = "Cheaper Mana Power Upgrade | MAXED";
	} else{
		document.getElementById("powerCheapTitle").innerHTML = "Cheaper Mana Power Upgrade | "+toSciNotation(powerCheapCost())+" Blood";
	}
	document.getElementById("powerCheapDesc").innerHTML = "Decrease the base cost of the Mana Power upgrade. Current: ("+gameData.manaPowerBase+"^(x-1))*5";
	document.getElementById("powerMultiTitle").innerHTML = "Multiply Mana Power Upgrade | "+toSciNotation(powerMultiCost())+" Blood";
	document.getElementById("powerMultiDesc").innerHTML = "Add a multiplier to the Mana Power upgrade. Current Multi: x"+toSciNotation(gameData.manaPowerMulti);
	document.getElementById("bloodMultiTitle").innerHTML = "Multiply Blood Gain | "+toSciNotation(bloodMultiCost())+" Blood";
	document.getElementById("bloodMultiDesc").innerHTML = "Add a multiplier to Blood gain on sacrifice. Current Multi: x"+toSciNotation(gameData.bloodMulti);
	if(gameData.retainManaLayer == true){
		document.getElementById("retainManaTitle").innerHTML = "Retain Mana Layer | BOUGHT";
	} else{
		document.getElementById("retainManaTitle").innerHTML = "Retain Mana Layer on Sacrifice | "+toSciNotation(retainManaLayerCost)+" Blood";
	}
	document.getElementById("retainManaDesc").innerHTML = "Retain Mana, Power, and Mages when sacrificing for Blood.";
	if(gameData.automage == true){
		document.getElementById("automageTitle").innerHTML = "Auto-Mage | BOUGHT";
	} else{
		document.getElementById("automageTitle").innerHTML = "Auto-Mage | "+toSciNotation(automageCost)+" Blood";
	}
	document.getElementById("automageDesc").innerHTML = "Automatically hires Mages for you if you can afford them.";
	
	//Buy Max Highlighting
	if(buyMax == true){
		document.getElementById("buyOneButton").style.opacity = 0.5;
		document.getElementById("buyMaxButton").style.opacity = 1;
	} else{
		document.getElementById("buyOneButton").style.opacity = 1;
		document.getElementById("buyMaxButton").style.opacity = 0.5;
	}
	
	//Hide elements for progression
	showElement(gameData.mana >= 5 || gameData.manaPower > 1,"powerButton");
	showElement(gameData.mana >= 10 || gameData.mages > 0,"mageButton");
	showElement(gameData.mages >= 10 || gameData.bloodUnlocked == true,"bloodBlock");
	showElement(gameData.blood >= 2 || gameData.manaPowerMulti > 1,"powerMultiButton");
	showElement(gameData.blood >= 4 || gameData.bloodMulti > 1,"bloodMultiButton");
	showElement(gameData.blood >= retainManaLayerCost || gameData.retainManaLayer == true,"retainManaButton");
	showElement(gameData.blood >= automageCost || gameData.automage == true,"automageButton");
	
	//Fade Upgrades Out if you can't buy them
	fadeButton(gameData.mana,powerCost(),"powerButton");
	fadeButton(gameData.mana,mageCost(),"mageButton");
	fadeButton(bloodGain(),1,"sacrificeButton");
	fadeButton(gameData.blood,powerCheapCost(),"powerCheapButton");
	fadeButton(gameData.blood,powerMultiCost(),"powerMultiButton");
	fadeButton(gameData.blood,bloodMultiCost(),"bloodMultiButton");
	fadeButton(gameData.blood,retainManaLayerCost,"retainManaButton");
	fadeButton(gameData.blood,automageCost,"automageButton");
}

function showElement(condition,element){
	if(condition){
		document.getElementById(element).style.display = "block";
	} else{
		document.getElementById(element).style.display = "none";
	}
}

function fadeButton(resource,price,button){
	if(resource < price){ 
		document.getElementById(button).style.opacity = 0.5; 
		document.getElementById(button).style.cursor = "not-allowed";
	} else{ 
		document.getElementById(button).style.opacity = 1; 
		document.getElementById(button).style.cursor = "pointer"; 
	}
}

/* Number Display Helper Functions */
function toSciNotation(num){
	if(num >= Math.pow(10,6)){
		return num.toExponential(2).replace('+','');
	}
	return Intl.NumberFormat('en-US').format(roundToDecimal(num,2));
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