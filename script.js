document.addEventListener('DOMContentLoaded', () => {
    const optionInput = document.getElementById('option-input');
    const addButton = document.querySelector('.add-button');
    const startButton = document.querySelector('.start-button');
    const optionsList = document.querySelector('.options-list');
    const amidakujiBoard = document.querySelector('.amidakuji-board');
    
    let options = [];
    let lines = [];
    let winningIndex = -1;
    
    // オプションを追加する関数
    function addOption() {
        const value = optionInput.value.trim();
        if (value && options.length < 8) {
            options.push(value);
            updateOptionsList();
            optionInput.value = '';
            updateStartButtonState();
        } else if (options.length >= 8) {
            alert('最大8つまでの項目を追加できます');
        }
    }
    
    // スタートボタンの状態を更新する関数
    function updateStartButtonState() {
        startButton.disabled = options.length < 2;
    }
    
    // オプションリストを更新する関数
    function updateOptionsList() {
        optionsList.innerHTML = '';
        options.forEach((option, index) => {
            const li = document.createElement('li');
            const optionText = document.createElement('span');
            optionText.textContent = option;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                options.splice(index, 1);
                updateOptionsList();
                updateStartButtonState();
            };
            
            li.appendChild(optionText);
            li.appendChild(deleteButton);
            optionsList.appendChild(li);
        });
    }
    
    // あみだくじを描画する関数
    function drawAmidakuji() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = amidakujiBoard.clientWidth;
        const isMobile = window.innerWidth < 600;
        const height = isMobile ? 280 : 320;
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = height + 'px';
        
        const verticalLines = options.length;
        const horizontalSpacing = width / (verticalLines + 1);
        const topMargin = isMobile ? 30 : 40;
        const bottomMargin = isMobile ? 25 : 35;
        const drawingHeight = height - (topMargin + bottomMargin);
        
        // 背景を白に
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 縦線を描画
        ctx.beginPath();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = isMobile ? 1 : 2;
        
        for (let i = 0; i < verticalLines; i++) {
            const x = horizontalSpacing * (i + 1);
            ctx.moveTo(x, topMargin);
            ctx.lineTo(x, height - bottomMargin);
        }
        ctx.stroke();
        
        // 横線をランダムに生成して描画
        const sections = 6; // 横線を配置できる区間の数を減らす
        const sectionHeight = drawingHeight / sections;
        const numberOfLines = Math.min((verticalLines - 1) * 2, sections);
        
        // 横線を配置できる位置をシャッフル
        const availablePositions = Array.from({ length: sections }, (_, i) => i);
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }
        
        // 横線を描画
        for (let i = 0; i < numberOfLines; i++) {
            const y = availablePositions[i];
            const x = Math.floor(Math.random() * (verticalLines - 1));
            
            const x1 = horizontalSpacing * (x + 1);
            const x2 = horizontalSpacing * (x + 2);
            const yPos = topMargin + (y + 0.5) * sectionHeight;
            
            ctx.beginPath();
            ctx.moveTo(x1, yPos);
            ctx.lineTo(x2, yPos);
            ctx.stroke();
            
            lines.push({x1, x2, y: yPos});
        }
        
        // ラベルを描画
        const fontSize = isMobile ? 11 : 13;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        
        options.forEach((option, i) => {
            const x = horizontalSpacing * (i + 1);
            ctx.fillText(option, x, topMargin - 8);
        });
        
        amidakujiBoard.innerHTML = '';
        amidakujiBoard.appendChild(canvas);
        
        // 結果を計算して表示
        calculateResults(topMargin, bottomMargin, isMobile);
    }
    
    // 結果を計算する関数
    function calculateResults(topMargin, bottomMargin, isMobile) {
        const canvas = amidakujiBoard.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const verticalLines = options.length;
        const horizontalSpacing = width / (verticalLines + 1);
        const results = new Array(verticalLines).fill().map((_, i) => i);
        
        // 各線をたどって結果を計算
        for (let i = 0; i < verticalLines; i++) {
            let currentX = horizontalSpacing * (i + 1);
            let currentY = topMargin;
            
            while (currentY < height - bottomMargin) {
                const horizontalLine = lines.find(line => 
                    (Math.abs(line.x1 - currentX) < 1 || Math.abs(line.x2 - currentX) < 1) && 
                    line.y > currentY && 
                    line.y < height - bottomMargin
                );
                
                if (horizontalLine) {
                    currentY = horizontalLine.y;
                    if (Math.abs(horizontalLine.x1 - currentX) < 1) {
                        currentX = horizontalLine.x2;
                    } else {
                        currentX = horizontalLine.x1;
                    }
                } else {
                    break;
                }
            }
            
            const finalPosition = Math.round((currentX - horizontalSpacing) / horizontalSpacing);
            results[finalPosition] = i;
        }
        
        // ランダムに1つの位置を選んでその位置をあたりに設定
        const winningPosition = Math.floor(Math.random() * verticalLines);
        winningIndex = results[winningPosition];
        
        // 結果を表示
        const fontSize = isMobile ? 10 : 12;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        
        results.forEach((resultIndex, i) => {
            const x = horizontalSpacing * (i + 1);
            const y = height - bottomMargin + (isMobile ? 10 : 12);
            const isWinner = resultIndex === winningIndex;
            const rectWidth = isMobile ? 40 : 46;
            const rectHeight = isMobile ? 16 : 18;
            
            // 背景を描画
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - rectWidth/2, y - rectHeight/2, rectWidth, rectHeight);
            
            // テキストを描画
            ctx.fillStyle = isWinner ? '#e74c3c' : '#2c3e50';
            ctx.fillText(isWinner ? 'あたり' : 'はずれ', x, y + 4);
        });
    }
    
    // イベントリスナーの設定
    addButton.addEventListener('click', addOption);
    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addOption();
    });
    
    startButton.addEventListener('click', () => {
        if (options.length >= 2) {
            lines = [];
            drawAmidakuji();
        }
    });
    
    // 初期状態でボタンを無効化
    updateStartButtonState();
}); 