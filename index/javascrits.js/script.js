(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const ICONS = {
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    check: '<polyline points="20 6 9 17 4 12"></polyline>',
    target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
    brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.02-3.44 2.5 2.5 0 0 1-1.02-4.51 2.5 2.5 0 0 1 1.98-4.09 2.5 2.5 0 0 1 1.02-3.44A2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.02-3.44 2.5 2.5 0 0 0 1.02-4.51 2.5 2.5 0 0 0-1.98-4.09 2.5 2.5 0 0 0-1.02-3.44A2.5 2.5 0 0 0 14.5 2z"></path>'
  };

  function makeIconSVG(name, size, color) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", color);
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = ICONS[name] || ICONS.brain;
    return svg;
  }

  const DEFAULT_MILESTONES = [
    { id: 1, label: "Fundamentos de IA", tag: "IA" },
    { id: 2, label: "Visão Computacional", tag: "IA" },
    { id: 3, label: "Processamento de Linguagem", tag: "NLP" },
    { id: 4, label: "Aprendizado por Reforço", tag: "IA" },
    { id: 5, label: "Agentes Multiagente", tag: "IA" },
    { id: 6, label: "Estratégia com IA", tag: "IA" },
  ];

  const POINTS = [
    { x: 200, y: 700 },
    { x: 120, y: 612 },
    { x: 288, y: 526 },
    { x: 116, y: 438 },
    { x: 292, y: 350 },
    { x: 112, y: 258 },
    { x: 296, y: 168 },
    { x: 200, y: 74 },
  ];

  const STREETS = [
    "M -20,120 L 420,90", "M -20,220 L 420,250", "M -20,340 L 420,310",
    "M -20,460 L 420,490", "M -20,560 L 420,540", "M -20,650 L 420,680",
    "M 40,-20 L 10,780", "M 140,-20 L 170,780", "M 260,-20 L 230,780",
    "M 360,-20 L 390,780",
  ];

  function buildPath(points) {
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const midY = (prev.y + cur.y) / 2;
      d += ` C ${prev.x},${midY} ${cur.x},${midY} ${cur.x},${cur.y}`;
    }
    return d;
  }

  const stops = [...DEFAULT_MILESTONES, { id: "final", label: "MOBA", final: true }];
  const points = POINTS.slice(0, stops.length + 1);
  let current = 0;

  const basePath = document.getElementById("base-path");
  const walkedPath = document.getElementById("walked-path");
  const streetsLayer = document.getElementById("streets-layer");
  const stopsLayer = document.getElementById("stops-layer");
  const counterEl = document.getElementById("counter");
  const footerEl = document.getElementById("footer-text");

  function onComplete() {}

  function renderStreets() {
    streetsLayer.innerHTML = "";
    STREETS.forEach((s, i) => {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", s);
      path.setAttribute("stroke", "#1c2a45");
      path.setAttribute("stroke-width", i % 3 === 0 ? 3 : 1.6);
      path.setAttribute("fill", "none");
      streetsLayer.appendChild(path);
    });
  }

  function render() {
    const d = buildPath(points);
    basePath.setAttribute("d", d);
    walkedPath.setAttribute("d", d);

    const pathLength = walkedPath.getTotalLength();
    walkedPath.style.strokeDasharray = pathLength;

    const progressRatio = stops.length > 0 ? current / stops.length : 0;
    const dashOffset = pathLength * (1 - progressRatio);
    walkedPath.style.strokeDashoffset = dashOffset;

    counterEl.textContent = `${current}/${stops.length}`;

    stopsLayer.innerHTML = "";

    stops.forEach((stop, i) => {
      const pt = points[i + 1];
      const isDone = i < current;
      const isCurrent = i === current;
      const isLocked = i > current;
      const isFinal = !!stop.final;

      const pinFill = isFinal ? "#ff7a1a" : (isDone || isCurrent ? "#7c5cff" : "#3a4a6b");
      const r = isFinal ? 20 : 16;

      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "stop-group");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", stop.label);
      g.addEventListener("click", () => handleStopClick(i));

      if (isFinal && (isDone || isCurrent)) {
        const glow = document.createElementNS(SVG_NS, "circle");
        glow.setAttribute("cx", pt.x);
        glow.setAttribute("cy", pt.y);
        glow.setAttribute("r", r + 24);
        glow.setAttribute("fill", "url(#destGlow)");
        const anim = document.createElementNS(SVG_NS, "animate");
        anim.setAttribute("attributeName", "r");
        anim.setAttribute("values", `${r + 16};${r + 32};${r + 16}`);
        anim.setAttribute("dur", "2.4s");
        anim.setAttribute("repeatCount", "indefinite");
        glow.appendChild(anim);
        g.appendChild(glow);
      }

      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", pt.x);
      circle.setAttribute("cy", pt.y);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", pinFill);
      circle.setAttribute("stroke", "#0b1424");
      circle.setAttribute("stroke-width", "3");
      g.appendChild(circle);

      const fo = document.createElementNS(SVG_NS, "foreignObject");
      fo.setAttribute("x", pt.x - 11);
      fo.setAttribute("y", pt.y - 11);
      fo.setAttribute("width", "22");
      fo.setAttribute("height", "22");
      fo.setAttribute("style", "pointer-events:none;");

      const div = document.createElement("div");
      div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      div.className = "icon-box";

      let iconName, iconSize, iconColor;
      if (isLocked) {
        iconName = "lock"; iconSize = 13; iconColor = "#c7d0e2";
      } else if (isDone && !isFinal) {
        iconName = "check"; iconSize = 14; iconColor = "#fff";
      } else if (isFinal) {
        iconName = "target"; iconSize = 17; iconColor = "#fff";
      } else {
        iconName = "brain"; iconSize = 14; iconColor = "#fff";
      }
      div.appendChild(makeIconSVG(iconName, iconSize, iconColor));
      fo.appendChild(div);
      g.appendChild(fo);

      if (!isFinal) {
        const tagText = stop.tag || "IA";
        const badgeW = tagText.length * 7 + 14;
        const badgeG = document.createElementNS(SVG_NS, "g");
        badgeG.setAttribute("transform", `translate(${pt.x + r + 4}, ${pt.y - r - 6})`);
        badgeG.setAttribute("opacity", isLocked ? 0.45 : 1);

        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "-11");
        rect.setAttribute("width", badgeW);
        rect.setAttribute("height", "18");
        rect.setAttribute("rx", "9");
        rect.setAttribute("fill", "rgba(124,92,255,0.16)");
        rect.setAttribute("stroke", "#7c5cff");
        rect.setAttribute("stroke-width", "1");
        badgeG.appendChild(rect);

        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", badgeW / 2);
        text.setAttribute("y", "2");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "10.5");
        text.setAttribute("font-weight", "700");
        text.setAttribute("fill", "#b9a9ff");
        text.textContent = tagText;
        badgeG.appendChild(text);

        g.appendChild(badgeG);
      }

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", pt.x);
      label.setAttribute("y", pt.y + r + 18);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", isFinal ? 18 : 12);
      label.setAttribute("font-weight", isFinal ? 800 : 600);
      label.setAttribute("fill", isFinal ? "#ff7a1a" : "#c7d0e2");
      label.setAttribute("letter-spacing", isFinal ? "2" : "0");
      label.textContent = isFinal ? "MOBA" : stop.label;
      g.appendChild(label);

      stopsLayer.appendChild(g);
    });

    if (current === 0) {
      footerEl.innerHTML = "Toque no primeiro ponto para iniciar a rota.";
    } else if (current > 0 && current < stops.length) {
      footerEl.innerHTML = "Toque no próximo ponto para continuar a rota.";
    } else if (current === stops.length) {
      footerEl.innerHTML = '<span class="done">Destino alcançado — MOBA desbloqueado!</span>';
    }
  }

  function handleStopClick(index) {
    if (index === current) {
      current = index + 1;
      if (current === stops.length) onComplete();
    } else if (index < current) {
      current = index + 1;
    }
    render();
  }

  renderStreets();
  render();
})();