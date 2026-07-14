export type Locale = "ko" | "en" | "zh" | "ja";

export const LOCALE_ORDER: Locale[] = ["ko", "en", "zh", "ja"];
export const LOCALE_LABEL: Record<Locale, string> = { ko: "한", en: "EN", zh: "中", ja: "日" };

const terms: Record<string, [string, string, string]> = {
  "포커 랜덤 디펜스": ["Poker Random Defense", "扑克随机防守", "ポーカーランダムディフェンス"],
  "하이 카드": ["High Card", "高牌", "ハイカード"], "원 페어": ["One Pair", "一对", "ワンペア"],
  "투 페어": ["Two Pair", "两对", "ツーペア"], "트리플": ["Three of a Kind", "三条", "スリーカード"],
  "스트레이트": ["Straight", "顺子", "ストレート"], "플러시": ["Flush", "同花", "フラッシュ"],
  "풀하우스": ["Full House", "葫芦", "フルハウス"], "포카드": ["Four of a Kind", "四条", "フォーカード"],
  "스트레이트 플러시": ["Straight Flush", "同花顺", "ストレートフラッシュ"], "로열 플러시": ["Royal Flush", "皇家同花顺", "ロイヤルフラッシュ"],
  "파이브 카드": ["Five of a Kind", "五条", "ファイブカード"], "식스 카드": ["Six Card", "六张同点", "シックスカード"],
  "초급": ["Rookie", "新手", "初級"], "중급": ["Advanced", "进阶", "中級"], "정예": ["Elite", "精英", "精鋭"], "전설": ["Legendary", "传说", "伝説"],
  "징집병": ["Conscript", "征召兵", "徴集兵"], "도적": ["Rogue", "盗贼", "盗賊"], "전사": ["Warrior", "战士", "戦士"],
  "마도사": ["Mage", "法师", "魔道士"], "궁수": ["Archer", "弓箭手", "弓使い"], "사제": ["Priest", "祭司", "司祭"],
  "연금술사": ["Alchemist", "炼金术师", "錬金術師"], "왕실 기사": ["Royal Knight", "皇家骑士", "王室騎士"],
  "용기사": ["Dragoon", "龙骑士", "竜騎士"], "운명술사": ["Fate Weaver", "命运术师", "運命術師"],
  "성녀": ["Saintess", "圣女", "聖女"], "황금 잭팟": ["Golden Jackpot", "黄金大奖", "ゴールドジャックポット"],
  "운명의 손패": ["Hand of Fate", "命运手牌", "運命の手札"], "교체할 카드를 선택하세요": ["Select cards to reroll", "请选择要重抽的牌", "引き直すカードを選択してください"],
  "족보 확정 & 소환": ["Confirm Hand & Summon", "确认牌型并召唤", "役を確定して召喚"], "선택 카드 교체": ["Reroll Selected", "重抽所选牌", "選択カードを引き直す"],
  "웨이브 시작": ["Start Wave", "开始波次", "ウェーブ開始"], "일시 정지": ["Pause", "暂停", "一時停止"],
  "골드가 부족합니다": ["Not enough gold", "金币不足", "ゴールドが足りません"], "전장이 가득 찼습니다": ["The battlefield is full", "战场已满", "戦場が満員です"],
  "공격": ["Attack", "攻击", "攻撃"], "범위": ["Range", "范围", "範囲"], "속도": ["Speed", "速度", "速度"],
  "족보별 소환 직업": ["Poker Hands & Units", "牌型与召唤职业", "役別の召喚職業"], "펼쳐 보기": ["Open", "展开", "開く"],
  "성채 함락": ["Fortress Fallen", "要塞陷落", "城塞陥落"], "다시 방어하기": ["Defend Again", "再次防守", "もう一度防衛"],
};

export function term(locale: Locale, text: string) {
  if (locale === "ko") return text;
  const entry = Object.entries(terms).find(([source, values]) => source === text || values.includes(text));
  const translated = entry?.[1];
  return translated ? translated[locale === "en" ? 0 : locale === "zh" ? 1 : 2] : text;
}

export const UI = {
  ko: { hand:"운명의 손패", handHint:"7장 중 가장 강한 조합이 자동 선택됩니다", inventory:"내 유닛", emptyInventory:"소환 유닛 보관함", summonNext:"소환 예정", currentHand:"현재 족보", attack:"공격", range:"사거리", speed:"공속", recruit:"족보 확정 & 소환", selectedReroll:"선택 카드 교체", fullReroll:"전체 손패 교체", start:"웨이브 시작", pause:"일시 정지", keep:"유지", best:"최선", change:"교체", use:"사용", sell:"판매", recall:"인벤토리 회수", placeHint:"빈 칸을 눌러 배치", attackUp:"공격 강화", speedUp:"속도 강화", totalAttack:"전체 공격력", totalSpeed:"전체 공격속도", guide:"족보별 소환 직업", open:"펼쳐 보기", tutorialAgain:"처음 설명 다시 보기", skip:"건너뛰기", next:"다음", begin:"게임 시작", gameOver:"성채 함락", retry:"다시 방어하기", defeated:"명의 약탈자를 처치했습니다.", victory:"성채 방어 성공", clear:"100 웨이브 클리어", pausedRecruit:"일시정지 중에도 리롤·소환·배치 가능", language:"언어 변경", playback:"재생 속도 변경" },
  en: { hand:"Hand of Fate", handHint:"The strongest 5-card hand out of 7 is selected automatically", inventory:"My Units", emptyInventory:"Summoned units are stored here", summonNext:"Next Summon", currentHand:"Current Hand", attack:"ATK", range:"Range", speed:"ASPD", recruit:"Confirm Hand & Summon", selectedReroll:"Reroll Selected", fullReroll:"Reroll All", start:"Start Wave", pause:"Pause", keep:"KEEP", best:"BEST", change:"CHANGE", use:"USE", sell:"Sell", recall:"Return to Inventory", placeHint:"Tap an empty tile to deploy", attackUp:"Upgrade ATK", speedUp:"Upgrade ASPD", totalAttack:"Global Attack", totalSpeed:"Global Attack Speed", guide:"Poker Hands & Units", open:"Open", tutorialAgain:"Replay Tutorial", skip:"Skip", next:"Next", begin:"Start Game", gameOver:"Fortress Fallen", retry:"Defend Again", defeated:" raiders defeated.", victory:"Fortress Defended", clear:"100 WAVES CLEARED", pausedRecruit:"Reroll, summon, and deploy while paused", language:"Change language", playback:"Change game speed" },
  zh: { hand:"命运手牌", handHint:"自动选择7张牌中最强的5张组合", inventory:"我的单位", emptyInventory:"召唤单位将保存在这里", summonNext:"即将召唤", currentHand:"当前牌型", attack:"攻击", range:"射程", speed:"攻速", recruit:"确认牌型并召唤", selectedReroll:"重抽所选牌", fullReroll:"重抽全部", start:"开始波次", pause:"暂停", keep:"保留", best:"最佳", change:"替换", use:"使用", sell:"出售", recall:"收回仓库", placeHint:"点击空位进行部署", attackUp:"强化攻击", speedUp:"强化攻速", totalAttack:"全军攻击力", totalSpeed:"全军攻击速度", guide:"牌型与召唤职业", open:"展开", tutorialAgain:"重看教程", skip:"跳过", next:"下一步", begin:"开始游戏", gameOver:"要塞陷落", retry:"再次防守", defeated:"名掠夺者已被消灭。", victory:"要塞防守成功", clear:"100波通关", pausedRecruit:"暂停时仍可重抽、召唤和部署", language:"切换语言", playback:"切换游戏速度" },
  ja: { hand:"運命の手札", handHint:"7枚から最も強い5枚の役を自動選択します", inventory:"所持ユニット", emptyInventory:"召喚ユニットはここに保管されます", summonNext:"召喚予定", currentHand:"現在の役", attack:"攻撃", range:"射程", speed:"攻速", recruit:"役を確定して召喚", selectedReroll:"選択カードを引き直す", fullReroll:"すべて引き直す", start:"ウェーブ開始", pause:"一時停止", keep:"維持", best:"最善", change:"交換", use:"使用", sell:"売却", recall:"インベントリへ戻す", placeHint:"空きマスをタップして配置", attackUp:"攻撃強化", speedUp:"攻速強化", totalAttack:"全体攻撃力", totalSpeed:"全体攻撃速度", guide:"役別の召喚職業", open:"開く", tutorialAgain:"チュートリアルを再表示", skip:"スキップ", next:"次へ", begin:"ゲーム開始", gameOver:"城塞陥落", retry:"もう一度防衛", defeated:"体の略奪者を倒しました。", victory:"城塞防衛成功", clear:"100ウェーブクリア", pausedRecruit:"一時停止中も引き直し・召喚・配置可能", language:"言語変更", playback:"ゲーム速度変更" },
} as const;

export const TUTORIALS: Record<Locale, Array<{title:string;body:string}>> = {
  ko:[
    {title:"1. 세븐포커 소환",body:"7장 중 가장 강한 5장이 자동으로 강조되며 그 족보가 직업을 결정합니다. 흑백·컬러 조커는 와일드 카드입니다."},
    {title:"2. 배치·회수·판매",body:"유닛을 눌러 빈 칸에 배치하세요. 필요 없는 유닛은 회수하거나 판매해 리롤 골드를 마련할 수 있습니다. 희귀 유닛은 판매 버튼을 두 번 눌러야 합니다."},
    {title:"3. 강화와 전투 효과",body:"공격력은 레벨당 10%씩 제한 없이, 공격속도는 레벨당 5%씩 최대 30레벨까지 상승합니다. 빨간 점멸은 직접 타격이며, 짙은 보라색 원은 연금술 장판입니다."},
    {title:"4. 200 인구를 막아라",body:"적은 탈출하지 않고 계속 순환합니다. 일반 몬스터는 인구 1, 보스는 인구 20입니다. 보스는 게임 시간 5분 안에 처치해야 합니다."},
  ],
  en:[
    {title:"1. Seven-Card Summoning",body:"The strongest five cards among seven are highlighted automatically, and that poker hand determines the summoned class. Both jokers are wild cards."},
    {title:"2. Deploy, Recall, Sell",body:"Select a unit and tap an empty tile to deploy it. Recall or sell unwanted units to fund rerolls. Rare units require two taps to confirm a sale."},
    {title:"3. Upgrades and Effects",body:"Attack rises 10% per level and attack speed rises 5% per level with no cap. Red flashes are direct hits, and dark violet circles are Alchemist pools."},
    {title:"4. Hold Below 200",body:"Enemies never escape and keep circling the battlefield. Normal enemies use 1 population and bosses use 20. Defeat each boss within five game-time minutes."},
  ],
  zh:[
    {title:"1. 七张牌召唤",body:"系统会自动突出7张牌中最强的5张，牌型决定召唤职业。黑白与彩色小丑牌均为万能牌。"},
    {title:"2. 部署、收回与出售",body:"选择单位后点击空位进行部署。可收回或出售多余单位来获得重抽资金。稀有单位需要点击两次确认出售。"},
    {title:"3. 强化与战斗效果",body:"攻击力每级提高10%，攻击速度每级提高5%，没有等级上限。红色闪烁是直接伤害，绿色区域是炼金术，紫色是命运术师的持续伤害。"},
    {title:"4. 人口保持在200以下",body:"敌人不会逃离，而会持续绕场移动。普通怪物占1人口，Boss占20人口。必须在5分钟游戏时间内击败Boss。"},
  ],
  ja:[
    {title:"1. セブンカード召喚",body:"7枚から最も強い5枚が自動で強調され、その役で召喚職業が決まります。白黒・カラーのジョーカーはワイルドカードです。"},
    {title:"2. 配置・回収・売却",body:"ユニットを選び、空きマスをタップして配置します。不要なユニットは回収または売却して引き直し資金にできます。希少ユニットの売却は2回タップで確定します。"},
    {title:"3. 強化と戦闘効果",body:"攻撃力はレベルごとに10%、攻撃速度は5%ずつ上限なく上昇します。赤い点滅は直接攻撃、緑は錬金術の沼、紫は運命術師の持続ダメージです。"},
    {title:"4. 人口200を防げ",body:"敵は脱出せず戦場を周回し続けます。通常敵は人口1、ボスは人口20です。ボスはゲーム時間5分以内に倒してください。"},
  ],
};

export const MONSTER_NAMES: Record<Locale, string[]> = {
  ko:["이끼 슬라임","동굴 박쥐","고블린 정찰병","해골 병사","검은 늑대","독버섯","불꽃 임프","복면 도적","철갑 오크","창백한 유령","거대 거미","늪지 리자드맨","보물 미믹","석상 가고일","가면 교단원","룬 골렘","미노타우로스","흑기사","어린 와이번","뿔 달린 악마"],
  en:["Moss Slime","Cave Bat","Goblin Scout","Skeleton Soldier","Black Wolf","Poison Mushroom","Flame Imp","Masked Bandit","Armored Orc","Pale Ghost","Giant Spider","Swamp Lizardman","Treasure Mimic","Stone Gargoyle","Masked Cultist","Rune Golem","Minotaur","Black Knight","Young Wyvern","Horned Demon"],
  zh:["苔藓史莱姆","洞穴蝙蝠","哥布林斥候","骷髅士兵","黑狼","毒蘑菇","火焰小鬼","蒙面盗贼","铁甲兽人","苍白幽灵","巨型蜘蛛","沼泽蜥蜴人","宝箱怪","石像鬼","蒙面教徒","符文魔像","米诺陶","黑骑士","幼年飞龙","角魔"],
  ja:["苔スライム","洞窟コウモリ","ゴブリン斥候","スケルトン兵","黒狼","毒キノコ","炎インプ","覆面盗賊","鉄甲オーク","青白い幽霊","巨大グモ","沼地リザードマン","宝箱ミミック","石像ガーゴイル","仮面教団員","ルーンゴーレム","ミノタウロス","黒騎士","幼いワイバーン","角の悪魔"],
};

export const TRAITS: Record<Locale, Record<string,string>> = {
  ko:{heavy:"중장갑",fast:"고속",tough:"고체력",slow:"둔중",balanced:"균형"},
  en:{heavy:"ARMORED",fast:"FAST",tough:"TOUGH",slow:"SLOW",balanced:"BALANCED"},
  zh:{heavy:"重甲",fast:"高速",tough:"高生命",slow:"迟缓",balanced:"均衡"},
  ja:{heavy:"重装甲",fast:"高速",tough:"高体力",slow:"鈍重",balanced:"均衡"},
};

export function roleCopy(locale: Locale, category: string, tier: number) {
  const n = Math.max(0, Math.min(2, tier - 1));
  const values: Record<string, [number[], string, string, string]> = {
    high:[[],"Ranged single-target attack","远程单体攻击","遠距離単体攻撃"], pair:[[],"Rapid fire + 20% damage mark for 2 sec","速射 + 2秒内受到伤害提高20%标记","速射 + 2秒間被ダメージ20%標的"],
    twoPair:[[2,3,4],"Throwing axe chains to {v} targets","飞斧连锁{v}个目标","投げ斧が{v}体に連鎖"], triple:[[8,11,14],"Radius {v} area explosion","半径{v}范围爆炸","半径{v}の範囲爆発"],
    straight:[[],"Long range + 50% critical chance + 100% bonus boss damage","长射程 + 50%暴击率 + 对Boss额外伤害100%","長射程 + 会心率50% + ボス追加ダメージ100%"],
    flush:[[],"Poison pool + 50% movement slow","毒池 + 移速降低50%","毒沼 + 移動速度50%低下"], fullHouse:[[],"4-tile attack range; allies within 2 tiles gain +20% ATK and ASPD","攻击射程4格；2格内友军攻击与攻速+20%","攻撃射程4マス・2マス内の味方の攻撃と攻速+20%"],
    fourKind:[[],"Powerful single slash + 120% bonus boss damage","强力单体剑气 + 对Boss额外伤害120%","強力な単体斬撃 + ボス追加ダメージ120%"],
    straightFlush:[[],"Extremely powerful single-target attack","极强的单体攻击","非常に強力な単体攻撃"], royalFlush:[[],"Huge, powerful area damage over time","超大范围持续伤害","超広範囲の強力な持続ダメージ"],
    fiveKind:[[],"Instantly removes every enemy","立即消灭所有敌人","すべての敵を即時消滅"], sixKind:[[],"Instantly grants 2,000G","立即获得2,000G","即座に2,000G獲得"],
  };
  if (locale === "ko") return "";
  const item = values[category]; if (!item) return "";
  const copy = item[locale === "en" ? 1 : locale === "zh" ? 2 : 3];
  return copy.replace("{v}", String(item[0][n] ?? ""));
}
