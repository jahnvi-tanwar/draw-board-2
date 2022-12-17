let mousedown = false;
let canvas = document.getElementById('canvas');
let tool = canvas.getContext('2d');
let drawArea = document.querySelector(".draw-area-cont")
let brush = document.querySelector(".brush")
let eraser = document.querySelector(".eraser")
let sample_colors = document.querySelectorAll(".color-circle")
let choose_color = document.querySelector("#brush-color")
let line_tool = document.querySelector(".line")
let box_tool = document.querySelector(".rectangle")
let tri = document.querySelector(".triangle")
let circle_tool = document.querySelector(".circle-shape")
let color_bucket = document.querySelector(".paint-bucket")
let selectionTool = document.querySelector(".select")
let copy = document.querySelector(".copy")
let cut = document.querySelector(".cut")
let paste = document.querySelector(".paste")
let sizeSlider = document.querySelector("#zoom-myRange")
let sliderLabel = document.querySelector(".size-slider .labels")
let drawBoard = document.querySelector(".draw-area")
let drawBoardLabel = document.querySelector(".draw-area-coord .labels")
let grid = document.querySelector("#grid")
let pixelColorTool = document.querySelector(".pixel-tool")
let eraser_slider = document.querySelector("#eraser-size")
let brush_slider = document.querySelector("#brush-size")
let undo = document.querySelector(".undo")
let redo = document.querySelector(".redo")
let save = document.querySelector(".save")
let save_as = document.querySelector(".save_as")
// let save_def_box = document.querySelector(".save_box")
let save_btn = document.querySelector("#save-picture")

let selectedTool = null;
var scale = 2;
let eraserSize = 1;
let pencilSize = 1;

let newAction = false;
let undoStack = []
let redoStack = []
let currentFrame = null;

function changeCanvas(url){
    // console.log(url)
    let img = new Image()
    img.src = url;
    img.onload = (e) =>{
        // console.log(img)
        tool.clearRect(0, 0, canvas.width, canvas.height);
        tool.drawImage(img,0,0,canvas.width,canvas.height)
    }
}

function initialiseRedoStack(){

    redoStack = []
    newAction = true;

    redoStack.top = function(){
        return redoStack[redoStack.length-1]
    }
}

undoStack.top = function(){
    return undoStack[undoStack.length-1]
}

undo.addEventListener("click",(e=>{
    if(undoStack.length>0){
        if(newAction == true){
            currentFrame = canvas.toDataURL();
            newAction = false;
        }

        redoStack.push(currentFrame);
        currentFrame = undoStack.pop();
        changeCanvas(currentFrame)
    }
}))

redo.addEventListener("click",(e)=>{
    if(redoStack.length > 0){
        undoStack.push(currentFrame)
        currentFrame = redoStack.pop()
        changeCanvas(currentFrame)
    }
})

function saveCurrentState(){
    initialiseRedoStack()
    let url = canvas.toDataURL();
    undoStack.push(url);
}

setCanvaDimensions(canvas.offsetHeight,canvas.offsetWidth)

function setCanvaDimensions(height, width){
    canvas.height =  height * scale;
    canvas.width = width * scale;
}

let x = drawArea.getBoundingClientRect().top*scale
let y = drawArea.getBoundingClientRect().left*scale

tool.lineWidth = 2;

function getX(mes){
    return mes*scale - y;
}

function getY(mes){
    return mes*scale - x;
}

function drawGrid(){
    let width = 1200
    let height = 400

    let numberBoxes = (width/10)*(height/10)
    for(let i = 0; i<numberBoxes; i++){
        let newDiv = document.createElement("div")
        newDiv.classList.add("pixel-box")
        grid.appendChild(newDiv)
    }
}

drawGrid()
let pixelBoxes = document.querySelectorAll(".pixel-box")

for(let i = 0; i<pixelBoxes.length; i++){
    pixelBoxes[i].addEventListener("mousemove",(e)=>{

        if(pixelColorToolSelected == true){
            let y1 = pixelBoxes[i].offsetTop*scale
            let x1 = pixelBoxes[i].offsetLeft*scale

            let h = 11*scale
            let w = 11*scale

            tool.beginPath()
            tool.fillStyle = tool.strokeStyle
            tool.rect(x1,y1,h,w)
            tool.fill()
        }
    })
    pixelBoxes[i].addEventListener("click",(e)=>{

        if(pixelColorToolSelected == true){
            let y1 = pixelBoxes[i].offsetTop*scale
            let x1 = pixelBoxes[i].offsetLeft*scale

            let h = 10*scale
            let w = 10*scale

            tool.beginPath()
            tool.fillStyle = tool.strokeStyle
            tool.rect(x1,y1,h,w)
            tool.fill()
        }
    })
}


function floodFill(startX,startY, newR, newG,newB)
{
    let height = canvas.offsetHeight*2
    let width = canvas.offsetWidth*2
    
    let colorLayer = tool.getImageData(0, 0,width,height);  
    console.log(colorLayer)
    // reAssign()
    let arr = []
    for(let i=0; i<height; i++){
        arr[i] = []
        for(let j = 0; j<width; j++){
            arr[i][j] = 0
        }
    }
    // console.log(arr)
    let stack = [[]]

    let p = tool.getImageData(startX, startY, 1, 1).data;
    let startR = p[0]
    let startG = p[1]
    let startB = p[2]

    stack.push([startX,startY])

    while(stack.length){

        let position_vector = stack.pop()
        let x_vert = position_vector[0]
        let y_vert = position_vector[1]
        let position = (x_vert*width + y_vert) * 4;

        // console.log(position)

        if( x_vert >=0 && y_vert >=0 && x_vert<height && y_vert<width &&  matchColor(position,startR,startG,startB, colorLayer) && arr[x_vert][y_vert] == 0 ){

            // console.log(matchColor(position,startR,startG,startB))

            pixel_color(position, newR, newG,newB,colorLayer)

            stack.push([x_vert-1,y_vert])
            // arr[x_vert-1][y_vert] = 1

            stack.push([x_vert,y_vert-1])
            // arr[x_vert][y_vert-1] = 1

            stack.push([x_vert,y_vert+1])
            // arr[x_vert][y_vert+1] = 1

            stack.push([x_vert+1,y_vert])
            // arr[x_vert+1][y_vert] = 1

            // console.log(position_vector)
            arr[x_vert][y_vert] = 1
        }


    }

    tool.putImageData(colorLayer, 0, 0);

    function matchColor(position, startR,startG,startB, colorLayer){

        let r = colorLayer.data[position]
        let g = colorLayer.data[position+1]
        let b = colorLayer.data[position+2]
        // console.log(colorLayer.data[position+3])
    
        return (r==startR) && (g==startG) && (b==startB)
    
    }

    function pixel_color(position, colorR,colorG,colorB, colorLayer){
        colorLayer.data[position] = colorR
        colorLayer.data[position+1] = colorG
        colorLayer.data[position+2] = colorB
        colorLayer.data[position+3] = 255
    }
    
}



function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

// for()

for(let i = 0; i<sample_colors.length; i++){
    sample_colors[i].addEventListener("click",(e)=>{
        // console.log("yes")
        let colorVal = window.getComputedStyle(sample_colors[i]).getPropertyValue('background-color');
        // console.log(colorVal)
        setRecentColor(colorVal);
    })
}


function extractRGB(colorVal){
    let vals = colorVal.split("(")[1].split(")")[0].split(",")

    vals[0] = parseInt(vals[0])
    vals[1] = parseInt(vals[1])
    vals[2] = parseInt(vals[2])

    return vals

}

function setColor(){
    let recentColor = window.getComputedStyle( document.querySelector(".recent-color") ,null).getPropertyValue('background-color');
    tool.strokeStyle = recentColor
}

function setRecentColor(colorVal){
    document.querySelector(".recent-color").style.background = colorVal
    setColor()
}

function getRecentColor(){
    let recentColor = window.getComputedStyle( document.querySelector(".recent-color") ,null).getPropertyValue('background-color');
    return extractRGB(recentColor)
}

tri.addEventListener("click", (e)=>{
    selectedTool = "triangleTool"
})



setColor()

cut.addEventListener("click",(e)=>{
    // selectedTool = "cut"
    if(tempClipboard!=null){
        clipboard = tempClipboard

        saveCurrentState()

        tool.beginPath()
        // tool.strokeStyle = "pink"
        console.log(tool.strokeStyle)
        tool.rect(selected_x,selected_y,clipboard.width,clipboard.height)
        tool.fillStyle="white"
        tool.fill()
        // console.log(clipboard.width)
        // setColor()
    }
})

eraser_slider.addEventListener("click",(e)=>{
    size = eraser_slider.value
    eraserSize = size
})

brush_slider.addEventListener("click",(e)=>{
    size = brush_slider.value
    pencilSize = size
})

copy.addEventListener("click",(e)=>{

    clipboard = tempClipboard
    // console.log(clipboard)
})

paste.addEventListener("click",(e)=>{
    selectedTool = "paste"
})

circle_tool.addEventListener("click",(e)=>{
    selectedTool="circleTool"
})

line_tool.addEventListener("click",(e)=>{
    selectedTool = "lineTool"
})

choose_color.addEventListener("input", (e)=>{
    let colorVal = choose_color.value;
    // console.log(colorVal)
    setRecentColor(colorVal)
})

brush.addEventListener("click",(e)=>{
    selectedTool = "brush"
    tool.lineWidth = pencilSize
})
eraser.addEventListener("click",(e)=>{
    selectedTool = "eraser"
    tool.strokeStyle = "white"
    tool.lineWidth = eraserSize
})


pixelColorTool.addEventListener("click",(e)=>{
    selectedTool = "pixelColorTool"
    console.log("pixelColorTool")
})


color_bucket.addEventListener("click",(e)=>{
    selectedTool = "colorBucket"
})

let save_disp = false

save_as.addEventListener("click",(e)=>{

    if(save_disp == false) document.querySelector(".save_box").style.display = "block";
    else document.querySelector(".save_box").style.display = "none";

    console.log("presssed save as")

    save_disp = !save_disp
})

save_btn.addEventListener("click",(e)=>{
    document.querySelector(".save_box").style.display = "none";
    save_disp = false;
})

//brush function

box_tool.addEventListener("click",(e)=>{
    selectedTool = "boxTool"
})

selectionTool.addEventListener("click",(e)=>{
    selectedTool = "selectionTool"
})

grid.addEventListener("click",(e)=>{
     if(selectedTool=="colorBucket"){

        let x_coord = getX(e.clientX);
        let y_coord = getY(e.clientY);

        let newCol = getRecentColor()

        // console.log(currCol,newCol)


        floodFill(x_coord,y_coord,newCol[0],newCol[1],newCol[2])
    }
})

let selectionToolSelected = false;

let eraserSelected = false;

let pixelColorToolSelected = false;

let prev_x_val;
let prev_y_val;

let first_point = false;
let second_point = false;

let circle_x;
let circle_y;

let gotCentre = false;

let first_x_vert;
let first_y_vert;

let lineToolSelected = false;
let clipboard = null;
let tempClipboard = null;
let selected_x
let selected_y


grid.addEventListener("mousedown",(e)=>{

    if(selectedTool != "eraser"){
        setColor()
    }

    if(selectedTool == "brush"){

        saveCurrentState()

        mousedown = true;
        tool.beginPath();
        tool.moveTo(getX(e.clientX),getY(e.clientY));
    }else if(selectedTool=="lineTool" && lineToolSelected == false){
        lineToolSelected = true;

        saveCurrentState()

        tool.beginPath()
        tool.moveTo(getX(e.clientX),getY(e.clientY))
    }else if(selectedTool == "eraser" && eraserSelected == false){
        eraserSelected=true;

        saveCurrentState()

        tool.beginPath();
        tool.moveTo(getX(e.clientX),getY(e.clientY));
    }else if(selectedTool=="circleTool" && gotCentre == false){

        saveCurrentState()

        tool.beginPath();
        circle_x = getX(e.clientX);
        circle_y = getY(e.clientY);
        gotCentre = true;
        // console.log("centre: ",circle_x,circle_y)
    }else if(selectedTool=="circleTool" && gotCentre==true){
        let radius = Math.round(Math.hypot(getX(e.clientX)-circle_x,getY(e.clientY)-circle_y))
        gotCentre = false
        tool.arc(circle_x, circle_y, radius, 0, Math.PI * 2, true);
        tool.stroke();
        // console.log("radius: ",radius)
    }else if(selectedTool=="triangleTool" && first_point==false){

        saveCurrentState()

        tool.beginPath();
        tool.moveTo(getX(e.clientX),getY(e.clientY));
        first_x_vert = getX(e.clientX);
        first_y_vert = getY(e.clientY);
        first_point = true;
        // console.log("first point")
    }else if(selectedTool=="triangleTool" && first_point==true && second_point==false){
        tool.lineTo(getX(e.clientX),getY(e.clientY))
        second_point = true;
        // console.log("second point")
    }else if(selectedTool=="triangleTool" && second_point==true){
        tool.lineTo(getX(e.clientX),getY(e.clientY))
        tool.lineTo(first_x_vert,first_y_vert)
        tool.stroke()
        // console.log("third point")
        second_point = false;
        first_point = false;
    }else if(selectedTool == "lineTool" && lineToolSelected == true){

        lineToolSelected = false
        tool.lineTo(getX(e.clientX),getY(e.clientY))
        tool.stroke()
    }else if(selectedTool == "boxTool" && mousedown == false){
        mousedown = true
        prev_x_val =getX(e.clientX);
        prev_y_val = getY(e.clientY);
        // console.log(prev_x_val,prev_y_val)

        saveCurrentState()

        tool.beginPath()
    }else if(selectedTool == "boxTool" && mousedown == true){
        mousedown = false
        let h = getY(e.clientY)-prev_y_val
        let w = getX(e.clientX)-prev_x_val
        // console.log(h,w)
        tool.rect(prev_x_val,prev_y_val,w,h)
        tool.stroke()
    }else if(selectedTool == "selectionTool" && selectionToolSelected == false){
        selectionToolSelected = true;
        selected_x = getX(e.clientX)
        selected_y =getY(e.clientY) 
    }else if(selectedTool == "selectionTool" && selectionToolSelected == true){
        selectionToolSelected = false

        let w = getX(e.clientX)-selected_x
        let h = getY(e.clientY)-selected_y

        tempClipboard = tool.getImageData(selected_x,selected_y,h,w)
    }else if(selectedTool == "paste"){
        saveCurrentState()
        tool.putImageData(clipboard, getX(e.clientX),getY(e.clientY))
    }else if(selectedTool == "pixelColorTool"){
        saveCurrentState()
        pixelColorToolSelected = true;
    }
})

grid.addEventListener("mousemove",(e)=>{

    if(selectedTool == "brush"){
        if(mousedown == true){
            tool.lineTo(getX(e.clientX),getY(e.clientY))
            tool.stroke()
            // console.log(e.clientX-y,e.clientY-x)
        }
    }else if(selectedTool == "eraser" ){
        if(eraserSelected == true){
            tool.lineTo(getX(e.clientX),getY(e.clientY))
            tool.stroke()
        }
    }
    
})

grid.addEventListener("mouseup",(e)=>{
    if(selectedTool == "brush"){
        mousedown = false
    }else if(selectedTool == "eraser"){
        eraserSelected = false
    }else if(pixelColorToolSelected == true){
        pixelColorToolSelected = false;
    }
})

let hidden = false;

