// Matrix funcitons borrowed from soldier.html at https://github.com/harviu/WebGL-Example/blob/master/html/soldier.html
// As mentioned in the following article, this is one of the fastest ways to do this for small matricies: https://dev.to/ndesmic/fast-matrix-math-in-js-11cj
// So there's no good reason to change this code.
// Start Borrowed code
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
// End Borrowed Code

// Ripped from my Lab1 code, AI Assisted Code
function genCirclePoints(x, y, radius, numPoints, thetaOffset) {
    if (numPoints < 3 || radius <= 0) {
        return [];
    }

    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = ((Math.PI * 2 * i) / (numPoints) + thetaOffset);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        points.push(px, py);
    }
    return points;
}
// End AI Assisted Code

function setCircle (radius=50, segments=32) {
    return new Float32Array(
        genCirclePoints(0, 0, radius, segments, 0)
    )
}

function genSpikeyCirclePoints(x, y, radius, numPoints, thetaOffset) {
    // Antipattern, I know. This isn
    if (numPoints < 3 || radius <= 0) {
        return [];
    }

    const points = [];
    for (let i = 0; i < numPoints; i++) {
        if (i % 2 == 0) {
            radius = radius * 0.5;
        }
        else {
            radius = radius * 0.8;
        }
        const angle = ((Math.PI * 2 * i) / (numPoints) + thetaOffset);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        points.push(px, py);
    }
    return points;
}

function setSpikeyCircle (radius=50, segments=32) {
    return new Float32Array(
        genSpikeyCirclePoints(0, 0, radius, segments, 0)
    )
}

// Start borrowed code
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

function drawBass(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100) {
    const vBass = setRectangle(height, width);
    const bassColor = [0.8, 0, 0, Math.sin(bass * Math.PI)];
    
    // Set translation, scaling, and rotation matrices.
    var rotateM = setRotationMatrix(rotation);
    var translateM = setTranslationMatrix(x, y);
    var scaleM = setScalingMatrix(dx, dy);

    // Combine the translation, scaling, and rotation matrices.

    var fullTransformationMatrix = multiplyMatrix3x3(translateM, rotateM);
    fullTransformationMatrix = multiplyMatrix3x3(fullTransformationMatrix, scaleM);
    fullTransformationMatrix = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    

    var bassmMatrix = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    drawObject(vBass, bassmMatrix, bassColor);
    return bassmMatrix;
}

function drawMid(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100) {

}

function drawTreble(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100) {

}

function drawAll(parentMatrix=setIdentityMatrix(), bass=0.1, mid=0.1, treble=0.1) {
    // parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100
    drawBass(parentMatrix, bass, 0, 0, 0, bass, bass, 200, 200);
    drawBass(parentMatrix, bass, 0, 0, 90, 1-bass, 1-bass, 200, 200);
    drawBass(parentMatrix, bass, 0, 0, 180, bass, bass, 200, 200);
    drawBass(parentMatrix, bass, 0, 0, 270, 1-bass, 1-bass, 200, 200);
    
    
}

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

document.getElementById('playButton').addEventListener('click', () => {
    requestAnimationFrame(drawLoop);
});

function drawLoop() {
    const centerMatrix = multiplyMatrix3x3(setIdentityMatrix(), setTranslationMatrix(canvas.width / 4, canvas.height / 4));

    // Update the bass, mid, and treble values from the DOM
    bass = parseFloat(document.getElementById('bass').textContent) * 2.5;
    mid = parseFloat(document.getElementById('mid').textContent) * 2.5;
    treble = parseFloat(document.getElementById('treble').textContent) * 2.5;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the bass rectangle with the updated scaling
    // Optional, input parent matrix.
    drawAll(centerMatrix, bass, mid, treble);

    requestAnimationFrame(drawLoop);
}

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
