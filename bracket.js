let svgGlobal;

function generate() {
  const text = document.getElementById("players").value;
  let names = text.split("\n").map(n => n.trim()).filter(n => n);

  while (names.length < 32) names.push("BYE");

  const container = document.getElementById("bracket-container");
  container.innerHTML = "";

  const rounds = [];
  // 第一輪左右各 16
  const left = names.slice(0,16).map(n => ({name:n, winner:false}));
  const right = names.slice(16,32).map(n => ({name:n, winner:false}));
  rounds.push({left,right});

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

function drawBracket(rounds, container){
  if(svgGlobal) svgGlobal.remove();
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  container.appendChild(svg);
  svgGlobal = svg;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const marginX = 60;
  const marginY = 20;

  const positions = [];

  rounds.forEach((round,rIdx)=>{
    const leftNodes = [];
    const rightNodes = [];

    // 左邊
    round.left.forEach((p,i)=>{
      const x = marginX + rIdx*70;
      const y = marginY + (height-2*marginY)/(round.left.length-1)*i;
      const div = createPlayer(container,p,x,y);
      leftNodes.push({div,x,y});
    });

    // 右邊
    round.right.forEach((p,i)=>{
      const x = width - marginX - rIdx*70;
      const y = marginY + (height-2*marginY)/(round.right.length-1)*i;
      const div = createPlayer(container,p,x,y);
      rightNodes.push({div,x,y});
    });

    positions.push({left:leftNodes,right:rightNodes});
  });

  // 畫線
  positions.forEach((pos,rIdx)=>{
    if(rIdx>=positions.length-1) return;
    const nextPos = positions[rIdx+1];

    pos.left.forEach((n,i)=>{
      const np = nextPos.left[Math.floor(i/2)];
      drawLine(svg,n.x,n.y,np.x,np.y,n.div.classList.contains("winner"));
    });
    pos.right.forEach((n,i)=>{
      const np = nextPos.right[Math.floor(i/2)];
      drawLine(svg,n.x,n.y,np.x,np.y,n.div.classList.contains("winner"));
    });

    if(rIdx===positions.length-2){ // 最後匯聚冠軍
      const final = nextPos.left[0];
      pos.left.concat(pos.right).forEach(n=>{
        drawLine(svg,n.x,n.y,final.x,final.y,n.div.classList.contains("winner"));
      });
    }
  });
}

function createPlayer(container,player,x,y){
  const div = document.createElement("div");
  div.className="player";
  div.textContent=player.name;
  div.style.left=x+"px";
  div.style.top=y+"px";
  div.onclick=()=>{
    div.classList.toggle("winner");
    generate(); // 重新生成樹狀圖，會更新線條顏色
  };
  container.appendChild(div);
  return div;
}

function drawLine(svg,x1,y1,x2,y2,isWinner){
  const line=document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1",x1);
  line.setAttribute("y1",y1);
  line.setAttribute("x2",x2);
  line.setAttribute("y2",y2);
  line.setAttribute("stroke",isWinner?"red":"black");
  line.setAttribute("stroke-width",isWinner?2:1);
  svg.appendChild(line);
}
