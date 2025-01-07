const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
let animationFrame;
let animationStep = 0;
let currentSliceCount = 0;
let totalSlices = 0;

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

function resetVisualization() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    animationStep = 0;
    currentSliceCount = 0;
    totalSlices = 0;
    
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

function drawSlice(x, y, radius, numSlices, sliceIndex, color) {
    const startAngle = (2 * Math.PI * sliceIndex) / numSlices;
    const endAngle = (2 * Math.PI * (sliceIndex + 1)) / numSlices;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function showFractionExpression(numCakes, denominator) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div style="font-size: 24px; margin: 20px 0;">
        ${numCakes} ÷ <sup>1</sup>/<sub>${denominator}</sub>
    </div>`;
    
    // 문장을 더 빨리 표시 (0.8초 후)
    setTimeout(() => {
        resultDiv.innerHTML += `<div style="margin: 20px 0; opacity: 0; transition: opacity 0.5s;" id="question">
            자연수 ${numCakes}를 단위분수 1/${denominator}로 나누면<br>
            몇이 될까요?
        </div>`;
        
        // 문장 페이드인 효과
        setTimeout(() => {
            document.getElementById('question').style.opacity = '1';
            
            // 원 그리기는 더 천천히 시작 (2.5초 후)
            setTimeout(() => {
                totalSlices = numCakes * denominator;
                animationStep = 1;
                animate(numCakes, denominator);
            }, 2500);
        }, 50);
    }, 800);
}

function animate(numCakes, denominator) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const radius = Math.min(canvas.height / 4, (canvas.width / numCakes) / 3);
    const spacing = radius * 2.5;
    const startX = (canvas.width - (spacing * (numCakes - 1))) / 2;
    const y = canvas.height / 2;

    // 모든 원 그리기
    for (let i = 0; i < numCakes; i++) {
        const x = startX + (spacing * i);
        drawCircle(x, y, radius);

        // 현재 단계에 따라 분할 표시
        if (currentSliceCount > 0) {
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

            // 하이라이트 효과
            const completedSlices = Math.min(currentSliceCount - (i * denominator), denominator);
            for (let j = 0; j < completedSlices; j++) {
                drawSlice(x, y, radius, denominator, j, `rgba(76, 175, 80, ${0.3 + (j / denominator) * 0.4})`);
            }
        }
    }

    updateCounter(currentSliceCount, totalSlices);

    if (currentSliceCount < totalSlices) {
        setTimeout(() => {
            currentSliceCount++;
            animationFrame = requestAnimationFrame(() => animate(numCakes, denominator));
        }, 200);
    } else {
        // 마지막 카운터 업데이트 유지
        updateCounter(totalSlices, totalSlices);
        
        setTimeout(() => {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML += `<div style="font-size: 20px; margin-top: 20px; color: #4CAF50;">
                답: ${numCakes}×${denominator} = ${numCakes * denominator}
            </div>`;
            finishVisualization();
        }, 1000);
    }
}

function startVisualization() {
    const numCakes = parseInt(document.getElementById('numCakes').value);
    const denominator = parseInt(document.getElementById('denominator').value);

    if (numCakes <= 0 || denominator <= 0) {
        alert('양의 정수를 입력해주세요!');
        return;
    }

    resetVisualization();
    
    document.getElementById('numCakes').disabled = true;
    document.getElementById('denominator').disabled = true;
    document.querySelector('button').disabled = true;

    setTimeout(() => {
        showFractionExpression(numCakes, denominator);
    }, 500);
}

function finishVisualization() {
    document.getElementById('numCakes').disabled = false;
    document.getElementById('denominator').disabled = false;
    document.querySelector('button').disabled = false;
}
