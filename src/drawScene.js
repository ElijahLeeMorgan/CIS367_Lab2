// Matrix funcitons borrowed from soldier.html at https://github.com/harviu/WebGL-Example/blob/master/html/soldier.html
// As mentioned in the following article, this is one of the fastest ways to do this for small matricies: https://dev.to/ndesmic/fast-matrix-math-in-js-11cj
// So there's no good reason to change this code.
// Borrowed code
function setIdentityMatrix () {
    return new Float32Array([
        1,0,0,
        0,1,0,
        0,0,1,
    ])
}

function multiplyMatrix3x3(a, b) {
    let result = new Array(9).fill(0);

    for (let col = 0; col < 3; col++) {  
        for (let row = 0; row < 3; row++) {  
            let sum = 0;
            for (let k = 0; k < 3; k++) {  
                sum += a[k * 3 + row] * b[col * 3 + k];
            }
            result[col * 3 + row] = sum;
        }
    }

    return result;
}

function setRotationMatrix(angle){
    const rad = angle * Math.PI / 180;
    const cosAngle = Math.cos(rad);
    const sinAngle = Math.sin(rad);
    return [
            cosAngle,   sinAngle, 0.0,
            -sinAngle,  cosAngle, 0.0,
            0.0,        0.0,      1.0,
        ];
}

function setTranslationMatrix(tx, ty) {
    return [
            1, 0, 0,
            0, 1, 0,
            tx,ty,1,
        ];
}

function setScalingMatrix(sx, sy) {
    return [
            sx, 0,  0,
            0,  sy, 0,
            0,  0,  1,
        ];
}

function setRectangle (width, height) {
    return new Float32Array([
        0, 0, width, 0, 0, height,
        width, 0, 0, height, width, height,
    ])
}

function drawObject(positions, mMatrix, color) {
    const buffer = gl.createBuffer();

    // pass vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // pass vMatrix and color
    gl.uniformMatrix3fv(mMatrixLocation, false, new Float32Array(mMatrix));
    gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}
// End Borrowed Code


/*
function drawSoldier(parentMatrix) {
    const vHead = setRectangle (20, 25);
    const headColor = [1, 0.8, 0.6, 1];
    const headmMatrix = setTranslationMatrix(15,150);
    drawObject(vHead, multiplyMatrix3x3(parentMatrix, headmMatrix), headColor);

    const vBody = setRectangle (50, 100);
    const bodyColor = [0.6, 0.6, 0.8, 1];
    const bodymMatrix = setTranslationMatrix(0,50);
    drawObject(vBody, multiplyMatrix3x3(parentMatrix, bodymMatrix), bodyColor);

    const vLeg = setRectangle (15, 50);
    const legColor = [0.5, 0.3, 0.2, 1];
    const leftLegmMatrix = setTranslationMatrix(0,0);
    drawObject(vLeg, multiplyMatrix3x3(parentMatrix, leftLegmMatrix), legColor);
    const rightLegmMatrix = setTranslationMatrix(35,0)
    drawObject(vLeg, multiplyMatrix3x3(parentMatrix, rightLegmMatrix), legColor);

    const armTransMatrix = multiplyMatrix3x3(parentMatrix, setTranslationMatrix(42.5, 140));
    drawArm(armTransMatrix)
}

function drawArm(parentMatrix){
    const startAnlge = -120;
    const vArm = setRectangle (15, 50);
    const armColor = [0.5, 0.3, 0.2, 1];
    const armRotationmatrix = setRotationMatrix(startAnlge + armAngle);
    let mMatrix = multiplyMatrix3x3(parentMatrix, armRotationmatrix);
    const swordTransMatrix = setTranslationMatrix(9,43);
    drawObject(vArm, mMatrix, armColor);
    mMatrix = multiplyMatrix3x3(mMatrix, swordTransMatrix);
    drawSword(mMatrix)
}
*/

// initialize buffer and Location
const colorLocation = gl.getUniformLocation(program, 'uColor');
const positionLocation = gl.getAttribLocation(program, 'aPosition');
const pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
const mMatrixLocation = gl.getUniformLocation(program, "mMatrix");
gl.enableVertexAttribArray(positionLocation);
const positionBuffer = gl.createBuffer();

// pass the projection Matrix
const pMatrix = [
    2/canvas.width,     0,                  0,
    0,                  2/canvas.height,    0,
    -1,                 -1,                 1,
]
gl.uniformMatrix3fv(pMatrixLocation, false, pMatrix);

let bass = parseFloat(document.getElementById('bass').textContent);
let mid = parseFloat(document.getElementById('mid').textContent);
let treble = parseFloat(document.getElementById('treble').textContent);

/*
let globalX = 0, globalY = 0;
let armAngle = 0, swordAngle = 0;

// listening to the key events
document.addEventListener('keydown', (e)=>{
    if (e.key == 'w'){
        globalY += 10;
    }
    else if (e.key == 's'){
        globalY -= 10;
    }
    else if (e.key == 'a'){
        globalX -= 10;
    }
    else if (e.key == 'd'){
        globalX += 10;
    }
    else if (e.key == 'ArrowLeft'){
        armAngle += 10;
    }
    else if (e.key == 'ArrowRight'){
        armAngle -= 10;
    }
    else if (e.key == 'ArrowUp'){
        swordAngle += 10;
    }
    else if (e.key == 'ArrowDown'){
        swordAngle -= 10;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawSoldier(setTranslationMatrix(globalX, globalY));
}, false);
*/

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

//drawSoldier(setIdentityMatrix())