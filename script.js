const btn = document.querySelector('#generateAutomataButton');
const inputAutomata = document.querySelector('#regex');
const inputWord = document.querySelector('#word');
const graphic = document.querySelector('#graphic');
const mainCanva = document.querySelector('#mainCanva');
const errorMessage=document.querySelector("#errorMessage");

btn.addEventListener('click', generateAutomata);

//https://love2dev.com/blog/javascript-remove-from-array/#remove-from-array-splice
function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

//Represente les fleches entres les ronds
function Transition(startState, endState, characters) {
    this.startState = startState;
    this.endState = endState;
    this.characters = characters;

    this.drawTransition = function () {
        let canvaBoundingBox = mainCanva.getBoundingClientRect();
        //On choppe les coordonnés d'ou on doit démarrer la fleche
        let startingPointX = this.startState.circleNode.getBoundingClientRect().x +
            0.5 * this.startState.circleNode.getBoundingClientRect().width;
        let startingPointY = this.startState.circleNode.getBoundingClientRect().y +
            0.5 * this.startState.circleNode.getBoundingClientRect().height;
        //On convertit de coordonnés aboslus vers coordonnés relatifs 
        startingPointX -= canvaBoundingBox.x;
        startingPointY -= canvaBoundingBox.y;

        //On choppe les coordonnés d'ou on doit finir la fleche
        let endingPointX = this.endState.circleNode.getBoundingClientRect().x +
            0.5 * this.endState.circleNode.getBoundingClientRect().width;
        let endingPointY = this.endState.circleNode.getBoundingClientRect().y +
            0.5 * this.endState.circleNode.getBoundingClientRect().height;
        //On convertit de coordonnés aboslus vers coordonnés relatifs 
        endingPointX -= canvaBoundingBox.x;
        endingPointY -= canvaBoundingBox.y;

        //On fait un point intermediaire pour "courber" la ligne
        let angleBetweenTheTwo = Math.atan2(endingPointY - startingPointY, endingPointX - startingPointX);   
        let distanceBetweenTheTwo = Math.sqrt((startingPointX - endingPointX) ** 2 + (startingPointY - endingPointY) ** 2);
        
        //On fait un cas particulier pour les boucle sur sois même, pour qu'elle pointe vers "l'exterieur" du cercle
        if(distanceBetweenTheTwo==0)
            angleBetweenTheTwo=startState.angle+0.5*Math.PI;
        
        let ControlPointY = startingPointY + 0.5 * distanceBetweenTheTwo * Math.sin(angleBetweenTheTwo);
        let ControlPointX = startingPointX + 0.5 * distanceBetweenTheTwo * Math.cos(angleBetweenTheTwo);
        //On ajoute un offset a ces points intermediaires
        let offset=80;

        if(distanceBetweenTheTwo>0)
            offset=1.0/(0.0002*distanceBetweenTheTwo)

        offset*=(window.innerHeight/1080);
        console.log(window.innerHeight);

        ControlPointX += offset * Math.cos(angleBetweenTheTwo - 0.5 * Math.PI);
        ControlPointY += offset * Math.sin(angleBetweenTheTwo - 0.5 * Math.PI);
        //Puis on le clone en 2 pour avoir un effet "boucle"
        let ControlPoint1X=ControlPointX+20*Math.cos(angleBetweenTheTwo);
        let ControlPoint2X=ControlPointX-20*Math.cos(angleBetweenTheTwo);

        let ControlPoint1Y=ControlPointY+20*Math.sin(angleBetweenTheTwo);
        let ControlPoint2Y=ControlPointY-20*Math.sin(angleBetweenTheTwo);

        //On calcul aussi les coordonnés pour l'étiquette
        let radius = 0.5 * this.endState.circleNode.getBoundingClientRect().width;
        let angleFromStart=Math.atan2(ControlPoint1Y-startingPointY,ControlPoint1X-startingPointX)
        let labelX = startingPointX + radius*2 * Math.cos(angleFromStart)//ControlPoint2X//ControlPointX - 10 * Math.cos(angleBetweenTheTwo + 0.5 * Math.PI);
        let labelY = startingPointY + radius*2 * Math.sin(angleFromStart)//ControlPoint2Y//ControlPointY - 10 * Math.sin(angleBetweenTheTwo + 0.5 * Math.PI);

        //On calcul les coordonnées des fleches
        let angleFromOffset = Math.atan2(endingPointY - ControlPoint2Y, endingPointX - ControlPoint2X);
        let trianglePoint0X = endingPointX - radius * Math.cos(angleFromOffset)
        let trianglePoint0Y = endingPointY - radius * Math.sin(angleFromOffset)
        let trianglePoint1X = trianglePoint0X - 0.5 * radius * Math.cos(angleFromOffset);
        let trianglePoint2X = trianglePoint1X;
        let trianglePoint1Y = trianglePoint0Y - 0.5 * radius * Math.sin(angleFromOffset);
        let trianglePoint2Y = trianglePoint1Y;

        trianglePoint1X += 4 * Math.cos(angleFromOffset - 0.5 * Math.PI);
        trianglePoint1Y += 4 * Math.sin(angleFromOffset - 0.5 * Math.PI);

        trianglePoint2X += 4 * Math.cos(angleFromOffset + 0.5 * Math.PI);
        trianglePoint2Y += 4 * Math.sin(angleFromOffset + 0.5 * Math.PI);

        let ctx = mainCanva.getContext('2d');
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black"
        ctx.beginPath();
        ctx.moveTo(startingPointX, startingPointY);
        //Courbe
        ctx.bezierCurveTo(ControlPoint1X, ControlPoint1Y, ControlPoint2X, ControlPoint2Y, endingPointX, endingPointY);
        //ctx.quadraticCurveTo(ControlPointX,ControlPointY,endingPointX,endingPointY);
        //ctx.lineTo(ControlPointX,ControlPointY);
        //ctx.lineTo(endingPointX,endingPointY);
        ctx.stroke();
        //Fleche pour la direction
        ctx.fillStyle = "black"
        ctx.beginPath();
        ctx.moveTo(trianglePoint0X, trianglePoint0Y)
        ctx.lineTo(trianglePoint1X, trianglePoint1Y);
        ctx.lineTo(trianglePoint2X, trianglePoint2Y);
        ctx.lineTo(trianglePoint0X, trianglePoint0Y)
        ctx.stroke();
        ctx.fill();
        //label
        ctx.fillStyle = "black"
        ctx.strokeStyle = "white"
        ctx.lineWidth = 3;
        let label = characters[0];
        for (const char of characters.slice(1)) {
            label += "," + char;
        }
        ctx.beginPath();
        ctx.font = '20px sans';
        ctx.strokeText(label, labelX, labelY);
        ctx.fillText(label, labelX, labelY);
    }
}

//Represente le rond de l'état
function State(name, position, isFinal) {
    this.transitions = new Array();
    this.isFinal = isFinal;
    this.name = name;
    this.position = position;
    this.circleNode = null;
    //L'angle de la circle node par rapport au centre du cercle (sert quand on fait une boucle sur sois a pointer vers l'exterieur)
    this.angle;

    this.createNode = function () {
        this.circleNode = document.createElement("div");
        this.circleNode.classList.add("state");

        if (this.isFinal) {
            this.circleNode.classList.add("final");
        }

        this.circleNode.innerText = name;
        graphic.appendChild(this.circleNode);
        this.updateNode();
    }

    this.updateNode = function () {
        let angle = this.position * (2 * Math.PI / states.length) - 0.5 * Math.PI;
        let coords = getPositionOnCircle(graphic, this.circleNode, angle);
        let x = coords[0];
        let y = coords[1];
        this.angle=angle;
        this.circleNode.style.top = y + "px";
        this.circleNode.style.left = x + "px";
    }

    this.updateTransitions = function () {
        for (let transition of this.transitions) {
            transition.drawTransition();
        }
    }

    this.deleteNode = function () {
        if (this.circleNode == null) {
            return;
        }

        this.circleNode.remove();
        console.log("deleting node");
    }

    this.addTransition = function (nextState, chars) {
        this.transitions.push(new Transition(this, nextState, chars))
    }
}

startState = new State(0, 0, true);
states = [startState];
currentState = 0;

function clearAutomata() {
    for (let state of states) {
        state.deleteNode();
    }
    states = [startState];
    startState.transitions=[];
    currentState = 0;

    errorMessage.classList.remove('showing');

    let ctx = mainCanva.getContext('2d');
    ctx.clearRect(0,0,mainCanva.width,mainCanva.height);
}

function getPositionOnCircle(circleDiv, objectToPlace, angle) {
    let circleBoundbox = circleDiv.getBoundingClientRect();
    let objectBoundbox = objectToPlace.getBoundingClientRect();
    let centerX = circleBoundbox.x+window.scrollX + 0.5 * circleBoundbox.width;
    let centerY = circleBoundbox.y+window.scrollY + 0.5 * circleBoundbox.height;

    let distance = 0.5 * circleBoundbox.width - 1.7 * objectBoundbox.width;

    let posX = centerX + Math.cos(angle) * distance - 0.5 * objectBoundbox.width;
    let posY = centerY + Math.sin(angle) * distance - 0.5 * objectBoundbox.width;

    //Comme la circle div est un parent, enlevons le de l'equation!
    posX-=circleBoundbox.left;
    posY-=circleBoundbox.top;

    return [posX, posY];
}

function generateAutomata() {
    clearAutomata();

    //C'est ici qu'on stock les états qui débute des segments en [] (dernier = plus en "profondeur") 
    let lastStates=[];
    //C'ici ici qu'on stock les états AVANT des segments en [] (dernier=plus en "profondeur")
    let lastPreviousStates=[];
    //C'est ici qu'on stock les caracteres en début de segments en [] (dernier=plus en profondeur)
    let lastFirstChar=[];
    //C'est ici qu'on stock un groupe de [] qui vient de s'achever, pour les + et moins qui seraient intéréssés
    let currentGroupOfState=null;
    let previousChar=null;
    let willHaveToCreateShortcut=false;
    //Va-t-on devoir creer un groupe ? Et combien ? Sert pour les [[ici]] truc imbriqué dé le début
    let groupsToBegin=0;
    //Pareil que celle du dessus mais pour le push de l'état juste avant le début
    let groupsToPrepare=0;

    for (let char of inputAutomata.value) {
        //Si il est mis sur true a un moment (car un caractère est spécial, le caractère ne crééera pas d'état)
        let skipState=false;
        //On creer un nouvel état par caractéres
        let newState = new State(states.length, states.length, false)

        //On va gérer les cas spéciaux

        if(previousChar=='['){
            //Si on est sur un [, on range l'état actuel
            //Et le char actuel
            groupsToBegin+=1;
            //On ne le fait pas maintenant car il faut commencer avec un état "valide", donc au cas ou il y'ait
            //Un [ apres un [
        }
        
        if(previousChar=='*'){
            //Si le dernier modificateur était un *, on doit rajouter un raccourci
            //Au cas ou l'état d'avant le truc bouclé veuille le skipper
            willHaveToCreateShortcut=true;
            //On ne le fait pas maintenant car le shortcut doit être créé sur un état "valide", donc au cas ou 
            //Il y'ait un [ juste après un *...]
        }

        //On gère les et les ou, ne fonctionne en coordination avec rien
        if(previousChar==',' || previousChar=="|"){
            states[currentState-1].transitions[0].characters.push(char)
            skipState=true;
        }
        
        //On gère les et et les ou, ne fonctionne en coordination avec rien
        if(char==',' || char=='|'){
            skipState=true;
        }

        if(char=='['){
            //Si on est sur un [, on range l'état d'avant
            groupsToPrepare+=1;
            //On ne le fait pas directement car il faut attendre qu'on ait arrêté avec les [[ ]] imbriqués
            //Puis on s'arrête, forcement
            skipState=true;
        }

        if(char==']'){   
            //On verifie que des états ont bien été stockés, sinon erreur
            if(lastPreviousStates.length<=0){
                errorMessage.classList.add("showing")
                break;
            }
            
            //Une fois la [ fini, on stock les états précédents et premiers stockés en dernier avat de les virer
            currentGroupOfState={
                'previousState':lastPreviousStates.pop(),
                'firstChar':lastFirstChar.pop(),
                'firstState':lastStates.pop()
            }
            
            skipState=true;
        }

        if(char=="+" || char=="*"){
            //+ = le groupe/la lettre qui précéde doit être répétée plusieurs fois
            //On le traitera a l'execution prochaine (regarde quelques ligne plus haut ce qu'on fait si)
            //lastChar=="+"

            //Si c'est un groupe on reviens au début du groupe pour boucler
            if(currentGroupOfState!=null){
                states[currentState].addTransition(currentGroupOfState.firstState,currentGroupOfState.firstChar)
            }else{
                //Sinon on boucle sur soi meme
                states[currentState].addTransition(states[currentState],previousChar)
            }

            skipState=true;
        }

        previousChar=char

        if(skipState){
            continue;
        }

        if(willHaveToCreateShortcut){
            if(currentGroupOfState!=null){
                currentGroupOfState.previousState.addTransition(newState,[char]);
            }else{
                states[currentState-1].addTransition(newState,[char]);
                //En plus de skipper, si là on parle d'un état final alors on peut terminer sans boucler
                //Malheuresement ça ne marche pas, car on ne set le final qu'après avoir scanné toute l'exp
                if(newState.isFinal){
                    states[currentState-1].isFinal=true;
                    console.log("test");
                }
            }
            willHaveToCreateShortcut=false;
        }

        //On prepare le groupe autant de fois que necessaire (plus d'une fois si [[comme ça]])
        for (let i = 0; i < groupsToPrepare; i++) {
            lastPreviousStates.push(states[currentState]);
        }
        groupsToPrepare=0;

        //On créé le groupe autant de fois que necessaire (plus d'une fois si [[comme ça]])
        for (let i = 0; i < groupsToBegin; i++) {
            console.log(char);
            lastStates.push(newState);
            lastFirstChar.push(char);
            //console.log("began group !");
        }
        groupsToBegin=0;

        //Si on s'est pas servi du groupe d'état stocké maintenant c'est trop tard
        currentGroupOfState=null;
        //On lie l'ancien au nouveau de façon linéaire
        states[currentState].addTransition(newState, [char])
        //Ensuite, on ajoute notre état à la liste :)
        states.push(newState);
        currentState = states.length - 1;
    }

    console.log(lastStates)

    states[currentState].isFinal = true;

    for (let state of states) {
        state.createNode();
    }

    for (let state of states) {
        state.updateTransitions();
    }

    checkText();
}

//Test le texte dans l'input pour voir si il est conforme à l'automate
function checkText(){
    clearText();
    //On commence par le début
    let currentCheckedStates=[startState];
    //Et par dire que tout va bien
    let valid=true;

    for (let char of inputWord.value) {
        //Dé qu'on doit prendre une branche, on part du principe que tout va mal
        valid=false
        //On nettoie egalement la liste des prochains états
        let nextStates=[];

        for (let currentCheckedState of currentCheckedStates) {
            //console.log(currentCheckedState);
            for (let transition of currentCheckedState.transitions) {
                //console.log(transition);
                console.log(transition.characters);
                if (transition.characters.includes(char)) {
                    valid = true;
                    nextStates.push(transition.endState);
                }
            }

            //On supprime l'état dut tableau après l'avoir checké
            currentCheckedState.circleNode.classList.remove('active');
            //currentCheckedStates = arrayRemove(currentCheckedStates, currentCheckedState)
        }

        //On copie les valeurs de next states dans les états a checké a la prochaine itération
        currentCheckedStates=nextStates.slice(0);

        if(!valid){
            break;
        } 
    }

    
    for(let currentCheckedState of currentCheckedStates){
        if(currentCheckedState.circleNode!=null){
            currentCheckedState.circleNode.classList.add('active');
        }
    }
    
    if(!valid){
        clearText();
    }
    
    //On regarde si on est a la fin valide, meme en prenant en compte la finalité de la condition
    if(valid==true){
        valid=false;
        for(let currentCheckedState of currentCheckedStates){
            if(currentCheckedState.isFinal)
                valid=true;
        }
    }
    

    //On change le look de l'input en fonction
    inputWord.classList.toggle("invalidInput",!valid);
}

//Rend inactif tous les états
function clearText(){
    for(let state of states){
        state.circleNode.classList.remove('active');
    }
}

//inputWord.addEventListener('change',checkText);
window.addEventListener('keyup',checkText);

function setCanvaSize() {
    mainCanva.width = graphic.getBoundingClientRect().width;
    mainCanva.height = graphic.getBoundingClientRect().height;
}

setCanvaSize();

window.addEventListener("resize", function () {
    setCanvaSize();
    for (let state of states) {
        state.updateNode();
    }

    for (let state of states) {
        state.updateTransitions();
    }

    //generateAutomata();
}); 