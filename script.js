const btn = document.querySelector('#generateAutomataButton');
const inputAutomata=document.querySelector('#regex');
const graphic=document.querySelector('#graphic');
const mainCanva=document.querySelector('#mainCanva');

btn.addEventListener('click', generateAutomata);

//Represente les fleches entres les ronds
function Transition(startState,endState,characters){
    this.startState=startState;
    this.endState=endState;
    this.characters=characters;

    this.drawTransition=function(){
        let canvaBoundingBox=mainCanva.getBoundingClientRect();
        //On choppe les coordonnés d'ou on doit démarrer la fleche
        let startingPointX=this.startState.circleNode.getBoundingClientRect().x+
        0.5*this.startState.circleNode.getBoundingClientRect().width;
        let startingPointY=this.startState.circleNode.getBoundingClientRect().y+
        0.5*this.startState.circleNode.getBoundingClientRect().height;
        //On convertit de coordonnés aboslus vers coordonnés relatifs 
        startingPointX-=canvaBoundingBox.x;
        startingPointY-=canvaBoundingBox.y;

        console.log(endState);
        //On choppe les coordonnés d'ou on doit finir la fleche
        let endingPointX=this.endState.circleNode.getBoundingClientRect().x+
        0.5*this.endState.circleNode.getBoundingClientRect().width;
        let endingPointY=this.endState.circleNode.getBoundingClientRect().y+
        0.5*this.endState.circleNode.getBoundingClientRect().height;
        //On convertit de coordonnés aboslus vers coordonnés relatifs 
        endingPointX-=canvaBoundingBox.x;
        endingPointY-=canvaBoundingBox.y;
        
        //On fait un point intermediaire pour "courber" la ligne
        let angleBetweenTheTwo=Math.atan2(endingPointY-startingPointY,endingPointX-startingPointX);
        let distanceBetweenTheTwo=Math.sqrt((startingPointX-endingPointX)**2+(startingPointY-endingPointY)**2);
        let ControlPointY=startingPointY+0.5*distanceBetweenTheTwo*Math.sin(angleBetweenTheTwo);
        let ControlPointX=startingPointX+0.5*distanceBetweenTheTwo*Math.cos(angleBetweenTheTwo);
        //On ajoute un offset a ces points intermediaires
        ControlPointX+=80*Math.cos(angleBetweenTheTwo-0.5*Math.PI);
        ControlPointY+=80*Math.sin(angleBetweenTheTwo-0.5*Math.PI);

        //On calcul aussi les coordonnés pour l'étiquette
        let labelX=ControlPointX-40*Math.cos(angleBetweenTheTwo-0.5*Math.PI);
        let labelY=ControlPointY-40*Math.sin(angleBetweenTheTwo-0.5*Math.PI);

        //On calcul les coordonnées des fleches
        let angleFromOffset=Math.atan2(endingPointY-ControlPointY,endingPointX-ControlPointX);
        let radius=0.5*this.endState.circleNode.getBoundingClientRect().width;
        let trianglePoint0X=endingPointX-radius*Math.cos(angleFromOffset)
        let trianglePoint0Y=endingPointY-radius*Math.sin(angleFromOffset)
        let trianglePoint1X=trianglePoint0X-0.5*radius*Math.cos(angleFromOffset);
        let trianglePoint2X=trianglePoint1X;
        let trianglePoint1Y=trianglePoint0Y-0.5*radius*Math.sin(angleFromOffset);
        let trianglePoint2Y=trianglePoint1Y;

        trianglePoint1X+=4*Math.cos(angleFromOffset-0.5*Math.PI);
        trianglePoint1Y+=4*Math.sin(angleFromOffset-0.5*Math.PI);

        trianglePoint2X+=4*Math.cos(angleFromOffset+0.5*Math.PI);
        trianglePoint2Y+=4*Math.sin(angleFromOffset+0.5*Math.PI);

        let ctx = mainCanva.getContext('2d');
        ctx.lineWidth=1;
        ctx.strokeStyle="black"
        ctx.beginPath();
        ctx.moveTo(startingPointX,startingPointY);
        //Courbe
        ctx.bezierCurveTo(ControlPointX,ControlPointY,ControlPointX,ControlPointY,endingPointX,endingPointY);
        //ctx.quadraticCurveTo(ControlPointX,ControlPointY,endingPointX,endingPointY);
        //ctx.lineTo(ControlPointX,ControlPointY);
        //ctx.lineTo(endingPointX,endingPointY);
        ctx.stroke();
        //Fleche pour la direction
        ctx.fillStyle="black"
        ctx.beginPath();
        ctx.moveTo(trianglePoint0X,trianglePoint0Y)
        ctx.lineTo(trianglePoint1X,trianglePoint1Y);
        ctx.lineTo(trianglePoint2X,trianglePoint2Y);
        ctx.lineTo(trianglePoint0X,trianglePoint0Y)
        ctx.stroke();
        ctx.fill();
        //label
        ctx.fillStyle="black"
        ctx.strokeStyle="white"
        ctx.lineWidth=3;
        let label=characters[0];
        for (const char of characters.slice(1)) {
            label+=","+char;
        }
        ctx.beginPath();
        ctx.font = '20px sans';
        ctx.strokeText(label, labelX, labelY);
        ctx.fillText(label, labelX, labelY);
    }
}

//Represente le rond de l'état
function State(name,position,isFinal){
    this.transitions=new Array();
    this.isFinal=isFinal;
    this.name=name;
    this.position=position;
    this.circleNode=null;

    this.createNode=function(){
        this.circleNode=document.createElement("div");
        this.circleNode.classList.add("state");

        if(this.isFinal){
            this.circleNode.classList.add("final");
        }

        this.circleNode.innerText=name;
        graphic.appendChild(this.circleNode);
        this.updateNode();
    }

    this.updateNode=function(){
        let angle=this.position*(2*Math.PI/states.length)-0.5*Math.PI;
        let coords=getPositionOnCircle(graphic,this.circleNode,angle);
        let x=coords[0];
        let y=coords[1];
        console.log(x);
        console.log(y);
        this.circleNode.style.top=y+"px";
        this.circleNode.style.left=x+"px";
    }

    this.updateTransitions=function(){
        for(let transition of this.transitions){
            transition.drawTransition();
        }
    }

    this.deleteNode=function(){
        if(this.circleNode==null){
            return;
        }

        this.circleNode.remove();
        console.log("deleting node");
    }

    this.addTransition=function(nextState,chars){
        this.transitions.push(new Transition(this,nextState,chars))
    }
}

startState=new State(0,0,true);
states=[startState];
currentState=0;

function clearAutomata(){
    console.log("clearing automata");
    console.log(states.length)
    for(let state of states){
        state.deleteNode();
    }
    states=[startState];
    currentState=0;
    startState.createNode();

    let ctx = mainCanva.getContext('2d');
    ctx.clearRect(0,0,10000,10000);
}

function getPositionOnCircle(circleDiv,objectToPlace,angle){
    let circleBoundbox=circleDiv.getBoundingClientRect();
    let objectBoundbox=objectToPlace.getBoundingClientRect();
    let centerX=circleBoundbox.x+0.5*circleBoundbox.width;
    let centerY=circleBoundbox.y+0.5*circleBoundbox.height;

    let distance=0.5*circleBoundbox.width-1.7*objectBoundbox.width;
    
    let posX=centerX+Math.cos(angle)*distance-0.5*objectBoundbox.width;
    let posY=centerY+Math.sin(angle)*distance-0.5*objectBoundbox.width;

    return [posX,posY];
}

function generateAutomata(){
    clearAutomata();
    if(inputAutomata.value.length>0){
        for(let char of inputAutomata.value){
            let newState=new State(states.length,states.length,false)
            
            states[currentState].addTransition(newState,[char])

            states.push(newState);
            currentState=states.length-1;
        }
    }

    states[currentState].isFinal=true;

    for(let state of states){
        state.createNode();
    }

    for(let state of states){
        state.updateTransitions();
    }
}

function setCanvaSize(){
    mainCanva.width=graphic.getBoundingClientRect().width;
    mainCanva.height=graphic.getBoundingClientRect().height;
}

setCanvaSize();

window.addEventListener("resize",function(){
    for(let state of states){
        state.updateNode();
    }

    for(let state of states){
        state.updateTransitions();
    }

    setCanvaSize();
}); 