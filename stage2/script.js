const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
let animationFrame;
let animationStep = 0;
let currentSliceCount = 0;
let totalSlices = 0;
let counterElement;
let currentGroupCount = 0;
let groupedSlices = [];

function resizeCanvas() {
    const container = document.querySelector('.container');
    canvas.width = container.clientWidth - 60;
    canvas.height = 400;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function updateCounter(count, total) {
    // 캔버스에 직접 카운터 그리기
    const padding = 10;
    const fontSize = 20;
    ctx.save();
    
    // 배경 박스
    ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
    const text = `${count} / ${total}`;
    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;
    
    ctx.beginPath();
    ctx.roundRect(canvas.width - boxWidth - padding, padding, boxWidth, boxHeight, 5);
    ctx.fill();
    
    // 텍스트
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width - (boxWidth / 2) - padding, padding + (boxHeight / 2));
    
    ctx.restore();
}

function createCounter() {
    // 더 이상 DOM 요소로 카운터를 만들 필요 없음
    return null;
}

function resetVisualization() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    animationStep = 0;
    currentSliceCount = 0;
    currentGroupCount = 0;
    totalSlices = 0;
    groupedSlices = [];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
}

function drawCircle(x, y, radius, startAngle = 0, endAngle = 2 * Math.PI, color = '#333') {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawSlice(x, y, radius, numSlices, sliceIndex, color, isGroupStart = false, isGroupEnd = false) {
    const startAngle = (2 * Math.PI * sliceIndex) / numSlices;
    const endAngle = (2 * Math.PI * (sliceIndex + 1)) / numSlices;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // 그룹의 시작과 끝을 표시
    if (isGroupStart || isGroupEnd) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius + 5, startAngle, startAngle);
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function showFractionExpression(numCakes, denominator, numerator) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div style="font-size: 24px; margin: 20px 0;">
        ${numCakes} ÷ <sup>${numerator}</sup>/<sub>${denominator}</sub>
    </div>`;
    
    setTimeout(() => {
        resultDiv.innerHTML += `<div style="margin: 20px 0; opacity: 0; transition: opacity 0.5s;" id="question">
            자연수 ${numCakes}를 분수 ${numerator}/${denominator}로 나누면<br>
            몇이 될까요?
        </div>`;
        
        setTimeout(() => {
            document.getElementById('question').style.opacity = '1';
            
            setTimeout(() => {
                totalSlices = numCakes * denominator;
                animationStep = 1;
                animate(numCakes, denominator, numerator);
            }, 2500);
        }, 50);
    }, 800);
}

function animate(numCakes, denominator, numerator) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const radius = Math.min(canvas.height / 4, (canvas.width / numCakes) / 3);
    const spacing = radius * 2.5;
    const startX = (canvas.width - (spacing * (numCakes - 1))) / 2;
    const y = canvas.height / 2;
    const groupY = y + radius * 2;

    // 모든 원 그리기 및 분할
    for (let i = 0; i < numCakes; i++) {
        const x = startX + (spacing * i);
        drawCircle(x, y, radius);

        // 현재 원이 분할되어야 하는지 확인
        if (currentSliceCount > i * denominator) {
            // 분할선 그리기
            for (let j = 0; j < denominator; j++) {
                const sliceStartAngle = (2 * Math.PI * j) / denominator;
                const sliceEndAngle = (2 * Math.PI * (j + 1)) / denominator;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.arc(x, y, radius, sliceStartAngle, sliceEndAngle);
                ctx.strokeStyle = '#333';
                ctx.stroke();
            }

            // 조각 칠하기
            const completedSlices = Math.min(currentSliceCount - (i * denominator), denominator);
            for (let j = 0; j < completedSlices; j++) {
                const alpha = 0.3 + (j / denominator) * 0.4;
                // 이미 그룹화된 조각은 아래쪽에 표시
                if (Math.floor(currentSliceCount / numerator) > i) {
                    drawSlice(x, groupY, radius, denominator, j, `rgba(76, 175, 80, ${alpha})`);
                } else {
                    drawSlice(x, y, radius, denominator, j, `rgba(76, 175, 80, ${alpha})`);
                }
            }
        }
    }

    // 카운터 업데이트
    if (currentSliceCount <= totalSlices) {
        updateCounter(Math.floor(currentSliceCount / numerator), Math.floor(totalSlices / numerator));
    }

    if (currentSliceCount < totalSlices) {
        setTimeout(() => {
            currentSliceCount++;
            animationFrame = requestAnimationFrame(() => animate(numCakes, denominator, numerator));
        }, 200);
    } else {
        // 마지막 카운터 업데이트
        updateCounter(Math.floor(totalSlices / numerator), Math.floor(totalSlices / numerator));
        
        setTimeout(() => {
            finishVisualization();
        }, 1000);
    }
}

function getGCD(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function simplifyFraction(numerator, denominator) {
    const gcd = getGCD(numerator, denominator);
    return [numerator / gcd, denominator / gcd];
}

function finishVisualization() {
    const resultDiv = document.getElementById('result');
    const numCakes = parseInt(document.getElementById('numCakes').value);
    const denominator = parseInt(document.getElementById('denominator').value);
    const numerator = parseInt(document.getElementById('numerator').value);
    
    // 계산 과정
    const totalPieces = numCakes * denominator;  // 전체 조각 수
    const resultNumerator = totalPieces;
    const resultDenominator = numerator;
    
    // 분수 약분
    const [simplifiedNum, simplifiedDen] = simplifyFraction(resultNumerator, resultDenominator);
    
    // 결과가 자연수인 경우
    const resultText = simplifiedDen === 1 ? 
        `${simplifiedNum}` : 
        `<sup>${simplifiedNum}</sup>/<sub>${simplifiedDen}</sub>`;
    
    resultDiv.innerHTML += `<div style="font-size: 20px; margin-top: 20px; color: #4CAF50;">
        답: ${numCakes} ÷ ${numerator}/${denominator} = ${resultText}<br>
        <span style="font-size: 16px; color: #666; margin-top: 5px; display: inline-block;">
            ${numCakes}를 ${denominator}등분하면 총 ${totalPieces}조각이 되고,<br>
            이를 ${numerator}개씩 묶으면 ${resultText}이 됩니다.
        </span>
    </div>`;
    
    document.getElementById('numCakes').disabled = false;
    document.getElementById('denominator').disabled = false;
    document.getElementById('numerator').disabled = false;
    document.querySelector('button').disabled = false;
}

function startVisualization() {
    const numCakes = parseInt(document.getElementById('numCakes').value);
    const denominator = parseInt(document.getElementById('denominator').value);
    const numerator = parseInt(document.getElementById('numerator').value);

    if (numCakes <= 0 || denominator <= 0 || numerator <= 0) {
        alert('양의 정수를 입력해주세요!');
        return;
    }

    if (numerator > denominator) {
        alert('분자는 분모보다 클 수 없습니다!');
        return;
    }

    resetVisualization();
    
    document.getElementById('numCakes').disabled = true;
    document.getElementById('denominator').disabled = true;
    document.getElementById('numerator').disabled = true;
    document.querySelector('button').disabled = true;

    setTimeout(() => {
        showFractionExpression(numCakes, denominator, numerator);
    }, 500);
}
