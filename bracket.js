let svgGlobal;

function generate() {
  const text = document.getElementById("players").value;
  let names = text.split("\n").map(n => n.trim()).filter(n => n);
  
  // 自動補滿 32 人
  while (names.length < 32) names.push("BYE");

  const container = document.getElementById("bracket-container");
  container.innerHTML = "";

  const rounds = [];
  // 第一輪左右分開 16+16
  const left = names.slice(0,16).map(n => ({name:n, winner:false}));
  const right = names.slice(16,32).map(n => ({name:n, winner:false}));
  rounds.push({left,right});

  // 計算後續輪次，每輪人數減半
  let num = 16;
  while (num > 1) {
    num /= 2;
    rounds.push({left:new Array(num).fill({name:"Winner", winner:false}),
                 right:new Array(num).fill({name:"Winner", winner:false})});
  }
  // 冠軍
  rounds.push({left:[{name:"Champion", winner:false}], right:[]});

  drawBracket(rounds, container);
}

function drawBracket(rounds, container) {
  // 移除舊 SVG
  if (svgGlobal) svgGlobal.remove();
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  container.appendChild(svg);
  svgGlobal = svg;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const marginX = 50;
  const marginY = 20;

  // 左右 16 人的間距
  const leftStartX = marginX;
  const rightStartX = width - marginX;

  // 左右節點位置
  const positions = [];

  // 先畫每一輪
  rounds.forEach((round, rIdx) => {
    const leftNodes = [];
    const rightNodes = [];
    
    // 左邊
    round.left.forEach((p, i) => {
      const x = leftStartX + rIdx*60;
      const y = marginY + (height - 2*marginY)/(round.left.length-1)*i;
      const div = createPlayerDiv(container, p, x, y, rIdx, 'left', i);
      leftNodes.push({div,x,y});
    });
    
    // 右邊
    round.right.forEach((p, i) => {
      const x = rightStartX - rIdx*60;
      const y = marginY + (height - 2*marginY)/(round.right.length-1)*i;
      const div = createPlayerDiv(container, p, x, y, rIdx, 'right', i);
      rightNodes.push({div,x,y});
    });

    positions.push({left:leftNodes,right:rightNodes});
  });

  // 畫連線
  positions.forEach((pos,rIdx)=>{
    if(rIdx>=positions.length-1) return; // 最後冠軍不用畫

    const nextPos = positions[rIdx+1];

    // 左邊
    pos.left.forEach((node,i)=>{
      if(nextPos.left[i/2|0]){
        drawLine(svg, node.x, node.y, nextPos.left[i/2|0].x, nextPos.left[i/2|0].y, node.div.classList.contains("winner"));
      }
    });
    // 右邊
    pos.right.forEach((node,i)=>{
      if(nextPos.right[i/2|0]){
        drawLine(svg, node.x, node.y, nextPos.right[i/2|0].x, nextPos.right[i/2|0].y, node.div.classList.contains("winner"));
      }
    });

    // 左右匯聚到冠軍
    if(rIdx===positions.length-2){
      const finalLeft = nextPos.left[0];
      pos.left.forEach(n=>{
        drawLine(svg,n.x,n.y,finalLeft.x,finalLeft.y,n.div.classList.contains("winner"));
      });
      pos.right.forEach(n=>{
        drawLine(svg,n.x,n.y,finalLeft.x,finalLeft.y,n.div.classList.contains("winner"));
      });
    }
  });
}

function createPlayerDiv(container, player, x, y, roundIdx, side, index){
  const div = document.createElement("div");
  div.className = "player";
  div.textContent = player.name;
  div.style.left = x+"px";
  div.style.top = y+"px";
  div.onclick = ()=>{
    // 清除同場比賽 winner
    if(side==='left'){
      const sibling = container.querySelectorAll(`.player`);
      // 清同場比賽
      // 簡單處理：這裡不做自動傳到下一輪，先標紅
      sibling.forEach(d=>{if(d!==div && d.textContent===div.textContent) d.classList.remove("winner");});
    }
    div.classList.add("winner");
    drawBracketAfterClick();
  };
  container.appendChild(div);
  return div;
}

function drawLine(svg,x1,y1,x2,y2,isWinner){
  const line = document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1",x1);
  line.setAttribute("y1",y1);
  line.setAttribute("x2",x2);
  line.setAttribute("y2",y2);
  line.setAttribute("stroke",isWinner?"red":"black");
  line.setAttribute("stroke-width",isWinner?2:1);
  svg.appendChild(line);
}

// 點擊勝者後重新畫線（保留紅線）
function drawBracketAfterClick(){
  const container = document.getElementById("bracket-container");
  const leftNames = [];
  const rightNames = [];
  const players = container.querySelectorAll(".player");
  players.forEach(p=>{
    if(p.offsetLeft<container.clientWidth/2) leftNames.push({name:p.textContent,winner:p.classList.contains("winner")});
    else rightNames.push({name:p.textContent,winner:p.classList.contains("winner")});
  });
  // 暫時重新生成樹狀圖
  generate(); // 可以改成保留 winner 資料再生成，簡單起見先刷新
}
