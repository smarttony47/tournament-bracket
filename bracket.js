function generate() {

  const text = document.getElementById("players").value;
  const names = text.split("\n").map(n => n.trim()).filter(n => n);

  if (names.length < 2) {
    alert("至少輸入 2 人");
    return;
  }

  const size = names.length <= 16 ? 16 : 32;
  while (names.length < size) names.push("BYE");

  const bracket = document.getElementById("bracket");
  bracket.innerHTML = "";

  let round = names;

  const roundDiv = document.createElement("div");

  for (let i = 0; i < round.length; i += 2) {
    const match = document.createElement("div");
    match.textContent = round[i] + " vs " + round[i + 1];
    match.style.border = "1px solid #333";
    match.style.margin = "6px";
    match.style.padding = "6px";
    roundDiv.appendChild(match);
  }

  bracket.appendChild(roundDiv);
}
