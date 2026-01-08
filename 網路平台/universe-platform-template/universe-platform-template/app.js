(function(){
  const $ = (sel)=>document.querySelector(sel);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

  // Close mega menus on outside click
  document.addEventListener("click", (e)=>{
    $$(".nav__item[open]").forEach(d=>{
      if(!d.contains(e.target)) d.removeAttribute("open");
    });
  });

  // Utilities
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function getParam(name){
    const u = new URL(location.href);
    return u.searchParams.get(name);
  }

  // ===== deck.html =====
  function initDeck(){
    const list = $("#deckList");
    if(!list) return;

    const q = $("#q");
    const tag = $("#tag");

    function render(){
      const query = (q.value||"").trim().toLowerCase();
      const t = tag.value;

      const filtered = UT.cards.filter(c=>{
        const hitQ = !query || (c.name.toLowerCase().includes(query) ||
          c.oneLine.toLowerCase().includes(query) ||
          (c.keywords||[]).join(" ").toLowerCase().includes(query));
        const hitT = !t || (c.keywords||[]).includes(t);
        return hitQ && hitT;
      });

      list.innerHTML = filtered.map(c=>`
        <a class="card" href="./card.html?id=${c.id}">
          <span class="tag">牌</span>
          <h3>${c.name}</h3>
          <p>${c.oneLine}</p>
          <div class="small">關鍵字：${(c.keywords||[]).join("、")}</div>
        </a>
      `).join("");

      $("#count").textContent = `${filtered.length} 張`;
    }

    // build tag options
    const tags = Array.from(new Set(UT.cards.flatMap(c=>c.keywords||[])));
    tag.innerHTML = `<option value="">全部分類</option>` + tags.map(t=>`<option value="${t}">${t}</option>`).join("");

    q.addEventListener("input", render);
    tag.addEventListener("change", render);
    render();
  }

  // ===== card.html =====
  function initCard(){
    const root = $("#cardRoot");
    if(!root) return;

    const id = Number(getParam("id")||"1");
    const c = UT.cards.find(x=>x.id===id) || UT.cards[0];

    root.innerHTML = `
      <div class="panel">
        <div class="tag">單張牌</div>
        <h1 style="margin-top:10px">${c.name}</h1>
        <p class="lead">${c.oneLine}</p>
        <div class="pills">
          ${(c.keywords||[]).map(k=>`<div class="pill">${k}</div>`).join("")}
        </div>
      </div>

      <div class="section">
        <div class="grid" style="grid-template-columns:1.1fr .9fr; gap:14px">
          <div class="card" style="min-height:auto">
            <h3>你現在在哪裡</h3>
            <p>${c.stateText}</p>
            <hr>
            <h3>你該做什麼</h3>
            <p>${c.actionText}</p>
            <hr>
            <h3>24 小時內最小一步</h3>
            <p>${c.microStep}</p>
          </div>

          <div class="card" style="min-height:auto">
            <h3>牌面（示意）</h3>
            <img src="${c.imageUrl}" alt="${c.name}" style="border-radius:16px;border:1px solid var(--line)">
            <div class="small" style="margin-top:10px">你之後把 imageUrl 換成自己的牌圖即可。</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head">
          <h2>延伸牌</h2>
          <a class="link" href="./deck.html">回牌庫</a>
        </div>
        <div class="grid" id="related"></div>
      </div>
    `;

    const rel = $("#related");
    const relCards = (c.relatedIds||[]).map(id=>UT.cards.find(x=>x.id===id)).filter(Boolean).slice(0,3);
    rel.innerHTML = relCards.map(r=>`
      <a class="card" href="./card.html?id=${r.id}">
        <span class="tag">延伸</span>
        <h3>${r.name}</h3>
        <p>${r.oneLine}</p>
      </a>
    `).join("");
  }

  // ===== draw.html =====
  function initDraw(){
    const spreadsEl = $("#spreads");
    if(!spreadsEl) return;

    const shuffleBtn = $("#shuffleBtn");
    const deckStrip = $("#deckStrip");
    const hint = $("#hint");
    const result = $("#result");
    const cardsEl = $("#cards");

    let selected = UT.spreads[0];
    let deck = [];
    let shuffled = false;

    spreadsEl.innerHTML = UT.spreads.map((s,i)=>`
      <label style="display:flex;gap:8px;align-items:center;cursor:pointer;user-select:none">
        <input type="radio" name="spread" value="${s.id}" ${i===0?"checked":""}>
        <span>${s.name}</span>
      </label>
    `).join("");

    spreadsEl.addEventListener("change",(e)=>{
      const id = e.target.value;
      selected = UT.spreads.find(x=>x.id===id) || UT.spreads[0];
      shuffled = false;
      result.style.display = "none";
      hint.textContent = `已選擇牌陣：「${selected.name}」。請按「洗牌」。`;
    });

    function renderStrip(){
      deckStrip.innerHTML = "";
      const N = 64;
      for(let i=0;i<N;i++){
        const d = document.createElement("div");
        d.className = "back" + (i===N-1 ? " last" : "");
        d.style.backgroundImage = `url("${UT.deck.backImg}")`;
        deckStrip.appendChild(d);
      }
    }

    function doShuffle(){
      deck = UT.cards.map(c=>({...c}));
      shuffle(deck);
      shuffled = true;
      result.style.display = "none";
      hint.textContent = "已洗牌。請點牌堆任一位置進行切牌並抽牌。";
    }

    function cutAndDraw(ratio){
      if(!shuffled){
        hint.textContent = "請先按「洗牌」。";
        return;
      }
      const cutIndex = Math.max(1, Math.min(deck.length-1, Math.floor(deck.length * ratio)));
      const cutDeck = deck.slice(cutIndex).concat(deck.slice(0, cutIndex));
      const drawn = cutDeck.slice(0, selected.count);

      cardsEl.innerHTML = drawn.map((c,idx)=>{
        const pos = selected.positions[idx] || `位置${idx+1}`;
        return `
          <div class="face">
            <img src="${c.imageUrl}" alt="${c.name}">
            <div class="meta">
              <div class="badge">${pos}</div>
              <div><b>${c.name}</b></div>
              <div>牌旨：${c.oneLine}</div>
              <div>神諭：${c.actionText}</div>
              <div class="small">最小一步：${c.microStep}</div>
            </div>
          </div>
        `;
      }).join("");

      result.style.display = "block";
      shuffled = false;
      hint.textContent = "已抽牌。要問新問題，請重新洗牌。";
    }

    shuffleBtn.addEventListener("click", doShuffle);
    deckStrip.addEventListener("click", (e)=>{
      const rect = deckStrip.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      cutAndDraw(ratio);
    });

    renderStrip();
    hint.textContent = "請先選擇牌陣，然後按「洗牌」。";
  }

  // Init by page
  document.addEventListener("DOMContentLoaded", ()=>{
    initDeck();
    initCard();
    initDraw();
    const y = document.getElementById("y");
    if(y) y.textContent = new Date().getFullYear();
  });
})();
