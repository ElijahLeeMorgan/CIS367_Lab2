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

function genInvertedSpikeyCircle(x, y, radius, numPoints, thetaOffset) {
    if (numPoints < 3 || radius <= 0) {
        return [];
    }

    const points = [];
    for (let i = 0; i <= numPoints; i++) {
        const angle = ((Math.PI * 2 * i) / (numPoints) + thetaOffset);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        points.push(x, y);
        points.push(px, py);
    }
    return points;
}

function setInvertedSpikeyCircle (radius=100, segments=32) {
    return new Float32Array(
        genInvertedSpikeyCircle(0, 0, radius, segments, 0)
    )
}

function genSpikeyCirclePoints(x, y, radius, numPoints, thetaOffset) {
    // Antipattern, I know. This isn
    if (numPoints < 3 || radius <= 0) {
        return [];
    }

    const points = [];
    for (let i = 0; i <= numPoints; i++) {
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
// Text to SVG
// https://txt.svg.beauty/
// Jackpot! SVG to points converter. Also text to points.
// https://shinao.github.io/PathToPoints/
// Free for Personal Use Font
// https://www.dafont.com/dancefloor-exit.font

// setManSpinPoints();

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

// Gross, antipattern/repeated code. Not too worried about perfecting this, as it's just an art project.
// TODO refactor this as a fucntion.
// Looking back, I couldvvve made my modififcations outside of a generic fuunction. Oh well.
function drawBass(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100) {
    const points = setRectangle(height, width);
    
    const color = [1, 0, 0, 1 - Math.cos(level * Math.PI)];
    
    // Set translation, scaling, and rotation matrices.
    const rotateM = setRotationMatrix(rotation);
    const translateM = setTranslationMatrix(x, y);
    const scaleM = setScalingMatrix(dx, dy);

    // Combine the translation, scaling, and rotation matrices.
    var fullTransformationMatrix = multiplyMatrix3x3(translateM, rotateM);
    fullTransformationMatrix = multiplyMatrix3x3(fullTransformationMatrix, scaleM);
    fullTransformationMatrix = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    
    const finishedm = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    drawObject(points, finishedm, color);
    return finishedm;
}

function drawMid(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, radius=100, segments=32) {
    const points = setInvertedSpikeyCircle(radius, segments);
    const color = [0, 0, 0, 1];

    // Set translation, scaling, and rotation matrices.
    rotation = rotation * level + (360/segments);
    const rotateM = setRotationMatrix(rotation);
    const translateM = setTranslationMatrix(x, y);
    const scaleM = setScalingMatrix(dx, dy);

    // Combine the translation, scaling, and rotation matrices.
    var fullTransformationMatrix = multiplyMatrix3x3(translateM, rotateM);
    fullTransformationMatrix = multiplyMatrix3x3(fullTransformationMatrix, scaleM);
    fullTransformationMatrix = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    
    const finishedm = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    drawObject(points, finishedm, color);
    return finishedm;
}

function drawTreble(parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level) {
    const points = setManSpinPoints();
    const smoothedLevel = (1 / (2 - level)) + 0.5; // [0, 0.5]
    const color = [0, 0, smoothedLevel, 1];
    
    // Set translation, scaling, and rotation matrices.
    const rotateM = setRotationMatrix(rotation);
    const translateM = setTranslationMatrix(x, y);
    const scaleM = setScalingMatrix(dx, dy);

    // Combine the translation, scaling, and rotation matrices.
    var fullTransformationMatrix = multiplyMatrix3x3(translateM, rotateM);
    fullTransformationMatrix = multiplyMatrix3x3(fullTransformationMatrix, scaleM);
    fullTransformationMatrix = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);

    const finishedm = multiplyMatrix3x3(parentMatrix, fullTransformationMatrix);
    drawObject(points, finishedm, color);
    return finishedm;
}

function drawAll(parentMatrix=setIdentityMatrix(), bass=0.1, mid=0.1, treble=0.1) {
    // Red rectangles, primarily transformed with scaling.
    // parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, width=100, height=100
    const squareSize = 200;
    let b1 = drawBass(parentMatrix, bass, 0, 0, 0, bass, bass, squareSize, squareSize);
    let b2 = drawBass(parentMatrix, bass, 0, 0, 90, 1-bass, 1-bass, squareSize, squareSize);
    let b3 = drawBass(parentMatrix, bass, 0, 0, 180, bass, bass, squareSize, squareSize);
    let b4 = drawBass(parentMatrix, bass, 0, 0, 270, 1-bass, 1-bass, squareSize, squareSize);
    
    // Black inverted spikey circles (lines), primarily transformed with rotation.
    //parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level, radius=100, segments=32
    const invertRadius = 10000;
    const invertSegments = Math.floor(480 * mid); // ~48
    const invertMidSize = squareSize / 2;

    // Makes rotation more apparent/snappy.
    if (mid < 0.1) {
        mid = 0.0;
    }
    m1 = drawMid(b1, mid, 0, invertMidSize / -4, -16.875, 1, 1, invertRadius, invertSegments);
    // Rotated backwards to compensate for vertex order.
    m2 = drawMid(b3, mid, 0, invertMidSize / 4, 16.875, 1, 1, invertRadius, invertSegments);
    //m3 = drawMid(b2, mid, 0, invertMidSize / -4, -16.875, 1, 1, invertRadius, invertSegments);
    //m4 = drawMid(b4, mid, 0, invertMidSize / 4, 16.875, 1, 1, invertRadius, invertSegments);

    // Blue running man, more of an afterthought to fulfill project requirements.
    // Primarly transfrormed with scaling.
    // Because of the model rendering, I needed to flip these.
    m1 = multiplyMatrix3x3(m1, setRotationMatrix(135));
    m2 = multiplyMatrix3x3(m2, setRotationMatrix(225));
    //parentMatrix, level, x=0, y=0, rotation=45, dx=level, dy=level0
    const bassComp = 10 * bass;
    
    drawTreble(m1, treble, -bass, -bass, 0, bassComp * treble, bassComp);
    drawTreble(m2, treble, bass, bass, 0, bassComp, bassComp * treble);
}

// initialize buffer and Location
const colorLocation = gl.getUniformLocation(program, 'uColor');
const positionLocation = gl.getAttribLocation(program, 'aPosition');
const pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
const mMatrixLocation = gl.getUniformLocation(program, "mMatrix");
gl.enableVertexAttribArray(positionLocation);
const positionBuffer = gl.createBuffer();

// Center of the canvas, useful.
const centerMatrix = multiplyMatrix3x3(setIdentityMatrix(), setTranslationMatrix(canvas.width / 4, canvas.height / 4));

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

drawAll(centerMatrix, 0, 0, 0);

// SOOOOOOOOO SLOPPPY, but Chrome is losing it's s*** when I try to import from a local file as a module.
function setManSpinPoints() {
    const points = [
        4.982010227203371, 27.976545140266417,
        8.14247466880083, 24.117032701030375,
        11.319740002773703, 20.237003260476516,
        14.4814914855957, 16.375919105529785,
        18.590521728515625, 14.501999999999999,
        23.59603784179688, 14.501999999999999,
        28.593101600170137, 14.502,
        33.591900819480415, 14.501999999999999,
        38.32584102344512, 15.386512652397156,
        42.470879272267226, 18.177062429979443,
        46.62130623710155, 20.971240034222603,
        50.763541738882665, 23.759902928099038,
        54.492, 26.793074011206624,
        54.492, 31.784434682056308,
        54.492, 36.7750982957501,
        55.30498982584476, 40.967,
        60.30718237881548, 40.967,
        65.3083989886511, 40.967,
        70.02, 41.26238498079776,
        70.02, 46.25650442560017,
        69.24438561916351, 50.488,
        64.25310454003512, 50.488,
        59.25451137379743, 50.488,
        54.25804827034473, 50.488,
        49.26090921878814, 50.488,
        45.02, 49.724397479176524,
        45.019999999999996, 44.724089650264006,
        45.02, 39.7292392758131,
        43.16254043102265, 41.31686621284484,
        40.54724609375, 45.591351562499995,
        39.08030253498256, 49.793068394437434,
        42.05190812722104, 53.82251709518606,
        45.02123383026966, 57.84887430339004,
        47.99284658050537, 61.87833271026611,
        50, 66.20752004699781,
        50, 71.20464327082037,
        50, 76.21757431669161,
        50, 81.21664954094216,
        50, 86.21627657478675,
        48.78233050179482, 89.99,
        43.784689887974416, 89.98999999999998,
        39.014, 89.75852074861525,
        39.014, 84.75583789285737,
        39.014, 79.76570631512254,
        39.014, 74.74915485786647,
        39.014, 69.75620974493027,
        37.97108243781701, 65.08086149771512,
        35.14387264409661, 60.95725880157948,
        32.31633408870874, 56.833176592921845,
        29.48680310630799, 52.7061883468628,
        29.004, 56.14000410926342,
        29.003999999999998, 61.14002980223112,
        29.004, 66.14287360842526,
        29.003999999999998, 71.1402969789058,
        24.83300029021036, 71.973,
        19.826953125000003, 71.973,
        14.831243895566441, 71.973,
        9.839662481677719, 71.973,
        4.821979066170752, 71.973,
        0, 71.80042046654223,
        0, 66.80122104656695,
        0, 61.81181071650981,
        4.191827728692442, 60.98599999999999,
        9.190991425495595, 60.986,
        14.176457615409046, 60.986000000000004,
        18.994, 60.79956298828125,
        18.993999999999996, 55.80162615566887,
        18.994, 50.80338004349172,
        18.994, 45.800391922950745,
        20.72870216115238, 41.247030215858246,
        23.1473355448246, 36.87187080991268,
        25.5669688692973, 32.494902572406225,
        27.990518278568985, 28.11085037775338,
        29.09611644268036, 24.512000000000004,
        24.099851135611534, 24.512,
        19.431152639985083, 25.20849877548218,
        16.203626403808595, 29.026072265625004,
        12.969997752949595, 32.85086379671097,
        9.333442177891731, 31.696636558339,
        5.53178924560547, 28.450202278137205,
        44.134017333984374, 5.87700927734375,
        47.26626736450196, 2.0314219970703125,
        51.80679290258709, 0.09980469566245485,
        56.717032287597654, 0.6654353027343749,
        60.74966796874999, 3.5452207031250005,
        62.9707954711914, 7.962933959960937,
        62.783713501584714, 12.911788341249716,
        60.23303076171875, 17.151830078125,
        55.921953552246094, 19.6041974029541,
        50.97786267089843, 19.727471252441404,
        46.549203125, 17.50339501953125,
        43.77344396534072, 13.417012040809936
    ];
    // Start AI sphaghetti code

    const triangles = triangulate(points);
    const vertices = [];
    for (let i = 0; i < triangles.length; i++) {
        vertices.push(points[triangles[i] * 2], points[triangles[i] * 2 + 1]);
    }
    return new Float32Array(vertices);
}

function triangulate(points) {
    const n = points.length / 2;
    if (n < 3) return [];

    const indices = [];
    const V = new Array(n);
    for (let v = 0; v < n; v++) V[v] = v;

    let nv = n;
    let count = 2 * nv;
    for (let m = 0, v = nv - 1; nv > 2;) {
        if ((count--) <= 0) return indices;

        let u = v;
        if (nv <= u) u = 0;
        v = u + 1;
        if (nv <= v) v = 0;
        let w = v + 1;
        if (nv <= w) w = 0;

        if (snip(points, u, v, w, nv, V)) {
            const a = V[u], b = V[v], c = V[w];
            indices.push(a, b, c);
            for (let s = v, t = v + 1; t < nv; s++, t++) V[s] = V[t];
            nv--;
            count = 2 * nv;
        }
    }
    return indices;
}

function snip(points, u, v, w, n, V) {
    const Ax = points[2 * V[u]], Ay = points[2 * V[u] + 1];
    const Bx = points[2 * V[v]], By = points[2 * V[v] + 1];
    const Cx = points[2 * V[w]], Cy = points[2 * V[w] + 1];

    const matrix = [
        Bx - Ax, By - Ay, 0,
        Cx - Bx, Cy - By, 0,
        Ax - Cx, Ay - Cy, 0
    ];

    const det = matrix[0] * matrix[4] - matrix[1] * matrix[3];
    if (Number.EPSILON > det) return false;

    for (let p = 0; p < n; p++) {
        if ((p === u) || (p === v) || (p === w)) continue;
        const Px = points[2 * V[p]], Py = points[2 * V[p] + 1];
        if (insideTriangle(Ax, Ay, Bx, By, Cx, Cy, Px, Py)) return false;
    }
    return true;
}

function insideTriangle(Ax, Ay, Bx, By, Cx, Cy, Px, Py) {
    const matrix = new Float32Array([
        [Cx - Bx, Cy - By, 0,
        Ax - Cx, Ay - Cy, 0,
        Bx - Ax, By - Ay, 0]
    ]);

    const points = new Float32Array([
        [Px - Ax, Py - Ay, 0,
        Px - Bx, Py - By, 0,
        Px - Cx, Py - Cy, 0]
    ]);

    const crossProducts = multiplyMatrix3x3(matrix, points)

    return crossProducts.every(value => value >= 0.0);
}
// End AI sphaghetti code