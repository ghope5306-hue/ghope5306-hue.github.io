// 你之後把這些資料換成「宇宙塔羅真實牌庫」就行
window.UT = window.UT || {};

UT.spreads = [
  { id:"one",   name:"抽單張",     count:1, positions:["宇宙訊息"] },
  { id:"two",   name:"抽兩張",     count:2, positions:["現況","建議"] },
  { id:"three", name:"抽三張",     count:3, positions:["現況","阻力","解法"] },
  { id:"flow",  name:"時間之流",   count:3, positions:["過去","現在","未來"] },
  { id:"yesno", name:"二擇一",     count:2, positions:["選項A","選項B"] },
  { id:"rel",   name:"兩人關聯",   count:4, positions:["你","對方","你們之間","建議"] },
];

UT.deck = {
  name: "宇宙塔羅（示範）",
  allowReversed: false,
  backImg: "https://picsum.photos/seed/ut_back/600/800"
};

UT.cards = Array.from({length:25}).map((_,i)=>({
  id: i+1,
  name: `宇宙牌 ${i+1}`,
  keywords: (i%2===0) ? ["情緒","行動"] : ["關係","突破"],
  oneLine: "一句話牌旨（請換成你的）",
  stateText: "你現在在哪裡（狀態描述，請換成你的）",
  actionText: "你該做什麼（務實神諭，請換成你的）",
  microStep: "24 小時內最小一步（請換成你的）",
  imageUrl: `https://picsum.photos/seed/ut_${i+1}/600/900`,
  relatedIds: [((i+1)%25)+1, ((i+2)%25)+1]
}));
