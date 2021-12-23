var gameData = {
	mana: 0,
	manaIncrease: 1,
	mages: 0
}

function save(){
	localStorage.setItem("wizIncSave", JSON.stringify(gameData))
}

function load(){
	var savegame = JSON.parse(localStorage.getItem("wizIncSave"))
	if (savegame !== null) {
		gameData = savegame;
	}
	updateText();
}

function hardReset(){
	gameData = {
		mana: 0,
		manaIncrease: 1,
		mages: 0
	}
	save();
	updateText();
}

function produceMana(){
	gameData.mana += gameData.manaIncrease;
	updateText();
}
function increasePower(){
	var cost = (gameData.manaIncrease*5);
	if(gameData.mana >= cost){
		gameData.mana -= cost;
		gameData.manaIncrease += 1;
	}
	updateText();
}

function hireMage(){
	var cost = (gameData.mages+1)*100;
	if(gameData.mana >= cost){
		gameData.mana -= cost;
		gameData.mages += 1;
	}
	updateText();
}

function updateText(){
	document.getElementById("manaButton").innerHTML = "Produce " + gameData.manaIncrease + " Mana";
	document.getElementById("powerButton").innerHTML = "Increase Mana Power ("+(gameData.manaIncrease*5)+" Mana)";
	document.getElementById("mageAmount").innerHTML = gameData.mages + " Hired";
	document.getElementById("mageButton").innerHTML = "Hire Mage ("+((gameData.mages+1)*100)+" Mana)";
	if(gameData.mages > 0){
		document.getElementById("manaAmount").innerHTML = gameData.mana + " Current Mana ("+(gameData.mages*gameData.manaIncrease)+"/s)";
	} else{
		document.getElementById("manaAmount").innerHTML = gameData.mana + " Current Mana";
	}
}

window.onload = function(){  
	load();
	updateText();
}

var mainGameLoop = window.setInterval(function() {
	if(gameData.mages > 0){
		for(var i = 0; i < gameData.mages; i += 1){
			produceMana();
		}
	}
	updateText();
}, 1000)