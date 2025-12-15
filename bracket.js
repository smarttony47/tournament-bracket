let svgGlobal;

function generate() {
  const text = document.getElementById("players").value;
  let names = text.split("\n").map(n => n.trim()).filter(n => n);

  if (names.length < 2) {
    alert("至少 2 人");
    return;
  }

  // 自動補滿 32 人
  const totalSlots = 32;
  while (names.length < totalSlots) names.push("BYE");

  const container = document.getElementById("bracket-container");
  container.innerHTML = "";
  container.style.position = "relative";

  const rounds = [];
  let round = names.map(n => ({ name: n, winner: false }));
  rounds.push(round);

  // 計算後續輪次
  let slots = totalSlots;
  while (slots > 1) {
    const next = new Array(slots / 2).fill(null).map(_ => ({ name: "Winner", winner: false }));
    rounds.push(next);
    slots /= 2;
  }

  // 畫每輪
  const roundDivs = [];
  rounds.forEach((r, roundIndex) => {
    const col = document.createElement("div");
    col.className = "round";
    r.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "player";
      div.textContent = p.name;
      div.dataset.round = roundIndex;
      div.dataset.index = i;
      div.onclick = () => clickPlayer(rounds, roundIndex, i);
      col.appendChild(div);
    });
    container.appendChild(col);
    roundDivs.push(col);
  });

  drawLines(roundDivs);
  window.addEventListener("resize", () => drawLines(roundDivs));
}

function clickPlayer(rounds, roundIndex, index) {
  const round = rounds[roundIndex];
  const player = round[index];

  // 先清空同場比賽的 winner
  const parentDiv = document.querySelectorAll(`.round:nth-child(${roundIndex+1}) .player`);
  const matchIndex = Math.floor(index / 2) * 2;
  parentDiv[matchIndex].classList.remove("winner");
  parentDiv[matchIndex+1].classList.remove("winner");

  // 標記紅色
  const div = parentDiv[index];
  div.classList.add("winner");
  player.winner = true;

  // 更新下一輪
  if (roundIndex + 1 < rounds.length) {
    const nextIndex = Math.floor(index / 2);
    const nextRound = rounds[roundIndex+1];
    nextRound[nextIndex].name = player.name;

    const nextDiv = document.querySelector(`.round:nth-child(${roundIndex+2}) .player:nth-child(${nextIndex+1})`);
    nextDiv.textContent = player.name;
  }

  // 重新畫線
  const roundDivs = Array.from(document.getElementsByClassName("round"));
  drawLines(roundDivs, rounds);
}

// 畫線，紅色勝者線
function drawLines(roundDivs, rounds) {
  // 移除舊 SVG
  if (svgGlobal) svgGlobal.remove();
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("width","100%");
  svg.setAttribute("height","100%");
  svg.style.position = "absolute";
  svg.style.top = 0;
  svg.style.left = 0;
  svgGlobal = svg;
  document.getElementById("bracket-container").appendChild(svg);

  const container = document.getElementById("bracket-container").getBoundingClientRect();

  for (let r = 0; r < roundDivs.length - 1; r++) {
    const curr = roundDivs[r].children;
    const next = roundDivs[r+1].children;

    for (let i = 0; i < curr.length; i+=2) {
      const div1 = curr[i].getBoundingClientRect();
      const div2 = curr[i+1].getBoundingClientRect();
      const nextDiv = next[i/2].getBoundingClientRect();

      const x1 = div1.right - container.left;
      const y1 = div1.top + div1.height/2 - container.top;
      const x2 = nextDiv.left - container.left;
      const y2 = nextDiv.top + nextDiv.height/2 - container.top;

      const x3 = div2.right - container.left;
      const y3 = div2.top + div2.height/2 - container.top;

      // 左邊線
      const line1 = document.createElementNS("http://www.w3.org/2000/svg","line");
      line1.setAttribute("x1",x1);
      line1.setAttribute("y1",y1);
      line1.setAttribute("x2",x2);
      line1.setAttribute("y2",y2);
      line1.setAttribute("stroke", rounds[r][i].winner ? "red" : "black");
      line1.setAttribute("stroke-width", rounds[r][i].winner ? 2 : 1);
      line1.classList.add(rounds[r][i].winner ? "winner-line" : "");
      svg.appendChild(line1);

      // 右邊線
      const line2 = document.createElementNS("http://www.w3.org/2000/svg","line");
      line2.setAttribute("x1",x3);
      line2.setAttribute("y1",y3);
      line2.setAttribute("x2",x2);
      line2.setAttribute("y2",y2);
      line2.setAttribute("stroke", rounds[r][i+1].winner ? "red" : "black");
      line2.setAttribute("stroke-width", rounds[r][i+1].winner ? 2 : 1);
      line2.classList.add(rounds[r][i+1].winner ? "winner-line" : "");
      svg.appendChild(line2);
    }
  }
}
