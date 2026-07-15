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
  "파이브 카드": ["Five of a Kind", "五条", "ファイブカード"], "식스 카드": ["Six Card", "六张同点", "シックスカード"], "세븐 카드": ["Seven Card", "七张同点", "セブンカード"],
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
  ko: { hand:"운명의 손패", handHint:"7장 중 가장 강한 조합이 자동 선택됩니다", inventory:"예비대", emptyInventory:"배치 대기 유닛", summonNext:"소환 예정", currentHand:"현재 족보", attack:"공격", range:"사거리", speed:"공속", recruit:"족보 확정 & 소환", selectedReroll:"선택 카드 교체", fullReroll:"전체 손패 교체", start:"웨이브 시작", pause:"일시 정지", keep:"유지", best:"최선", change:"교체", use:"사용", sell:"판매", recall:"예비대로 회수", placeHint:"빈 칸을 눌러 배치", attackUp:"공격 강화", speedUp:"속도 강화", totalAttack:"전체 공격력", totalSpeed:"전체 공격속도", guide:"족보별 소환 직업", open:"펼쳐 보기", tutorialAgain:"처음 설명 다시 보기", skip:"건너뛰기", next:"다음", begin:"게임 시작", gameOver:"성채 함락", retry:"다시 방어하기", endingReplay:"다시 플레이하기", bossEquivalent:"강적 1체 · 웨이브별 고유 체력", defeated:"명의 약탈자를 처치했습니다.", victory:"성채 방어 성공", clear:"200 웨이브 클리어", pausedRecruit:"일시정지 중에도 리롤·소환·배치 가능", language:"언어 변경", playback:"재생 속도 변경" },
  en: { hand:"Hand of Fate", handHint:"The strongest 5-card hand out of 7 is selected automatically", inventory:"Reserves", emptyInventory:"Units awaiting deployment", summonNext:"Next Summon", currentHand:"Current Hand", attack:"ATK", range:"Range", speed:"ASPD", recruit:"Confirm Hand & Summon", selectedReroll:"Reroll Selected", fullReroll:"Reroll All", start:"Start Wave", pause:"Pause", keep:"KEEP", best:"BEST", change:"CHANGE", use:"USE", sell:"Sell", recall:"Return to Reserves", placeHint:"Tap an empty tile to deploy", attackUp:"Upgrade ATK", speedUp:"Upgrade ASPD", totalAttack:"Global Attack", totalSpeed:"Global Attack Speed", guide:"Poker Hands & Units", open:"Open", tutorialAgain:"Replay Tutorial", skip:"Skip", next:"Next", begin:"Start Game", gameOver:"Fortress Fallen", retry:"Defend Again", endingReplay:"Play Again", bossEquivalent:"1 BOSS · UNIQUE HP BY WAVE", defeated:" raiders defeated.", victory:"Fortress Defended", clear:"200 WAVES CLEARED", pausedRecruit:"Reroll, summon, and deploy while paused", language:"Change language", playback:"Change game speed" },
  zh: { hand:"命运手牌", handHint:"自动选择7张牌中最强的5张组合", inventory:"预备队", emptyInventory:"待部署单位", summonNext:"即将召唤", currentHand:"当前牌型", attack:"攻击", range:"射程", speed:"攻速", recruit:"确认牌型并召唤", selectedReroll:"重抽所选牌", fullReroll:"重抽全部", start:"开始波次", pause:"暂停", keep:"保留", best:"最佳", change:"替换", use:"使用", sell:"出售", recall:"收回预备队", placeHint:"点击空位进行部署", attackUp:"强化攻击", speedUp:"强化攻速", totalAttack:"全军攻击力", totalSpeed:"全军攻击速度", guide:"牌型与召唤职业", open:"展开", tutorialAgain:"重看教程", skip:"跳过", next:"下一步", begin:"开始游戏", gameOver:"要塞陷落", retry:"再次防守", endingReplay:"再玩一次", bossEquivalent:"1名首领 · 每个波次独立生命值", defeated:"名掠夺者已被消灭。", victory:"要塞防守成功", clear:"通关200波", pausedRecruit:"暂停时仍可重抽、召唤和部署", language:"切换语言", playback:"切换游戏速度" },
  ja: { hand:"運命の手札", handHint:"7枚から最も強い5枚の役を自動選択します", inventory:"予備隊", emptyInventory:"配置待機ユニット", summonNext:"召喚予定", currentHand:"現在の役", attack:"攻撃", range:"射程", speed:"攻速", recruit:"役を確定して召喚", selectedReroll:"選択カードを引き直す", fullReroll:"すべて引き直す", start:"ウェーブ開始", pause:"一時停止", keep:"維持", best:"最善", change:"交換", use:"使用", sell:"売却", recall:"予備隊へ戻す", placeHint:"空きマスをタップして配置", attackUp:"攻撃強化", speedUp:"攻速強化", totalAttack:"全体攻撃力", totalSpeed:"全体攻撃速度", guide:"役別の召喚職業", open:"開く", tutorialAgain:"チュートリアルを再表示", skip:"スキップ", next:"次へ", begin:"ゲーム開始", gameOver:"城塞陥落", retry:"もう一度防衛", endingReplay:"もう一度プレイ", bossEquivalent:"ボス1体・ウェーブ別固有HP", defeated:"体の略奪者を倒しました。", victory:"城塞防衛成功", clear:"200ウェーブクリア", pausedRecruit:"一時停止中も引き直し・召喚・配置可能", language:"言語変更", playback:"ゲーム速度変更" },
} as const;

export const TUTORIALS: Record<Locale, Array<{title:string;body:string}>> = {
  ko:[
    {title:"1. 세븐포커 소환",body:"7장 중 가장 강한 조합이 자동으로 강조되며 그 족보가 직업을 결정합니다. 흑백·컬러·반전 조커 3장은 모두 와일드 카드입니다."},
    {title:"2. 배치·회수·판매",body:"유닛을 눌러 빈 칸에 배치하세요. 필요 없는 유닛은 회수하거나 판매해 리롤 골드를 마련할 수 있습니다. 희귀 유닛은 판매 버튼을 두 번 눌러야 합니다."},
    {title:"3. 강화와 전투 효과",body:"공격력은 레벨당 2.5%씩 제한 없이, 공격속도는 레벨당 2.5%씩 최대 30레벨까지 상승합니다. 빨간 점멸은 직접 타격이며, 짙은 보라색 원은 연금술 장판입니다."},
    {title:"4. 200 인구를 막아라",body:"200웨이브까지 성채를 방어하세요. 적은 탈출하지 않고 계속 순환합니다. 일반 몬스터는 인구 1, 보스는 인구 20이며 보스는 게임 시간 3분 안에 처치해야 합니다."},
    {title:"5. 성녀의 선택",body:"성녀 5기를 예비대에 모으는 선택에도 의미가 있습니다. 즉시 사용과 보관을 전략적으로 판단하세요."},
  ],
  en:[
    {title:"1. Seven-Card Summoning",body:"The strongest combination among seven cards is highlighted automatically, and that poker hand determines the summoned class. The black, color, and inverted Jokers are all wild cards."},
    {title:"2. Deploy, Recall, Sell",body:"Select a unit and tap an empty tile to deploy it. Recall or sell unwanted units to fund rerolls. Rare units require two taps to confirm a sale."},
    {title:"3. Upgrades and Effects",body:"Attack rises 2.5% per level without a cap. Attack speed rises 2.5% per level up to level 30. Red flashes are direct hits, and dark violet circles are Alchemist pools."},
    {title:"4. Hold Below 200",body:"Defend the fortress through wave 200. Enemies never escape and keep circling the battlefield. Normal enemies use 1 population and bosses use 20. Defeat each boss within three game-time minutes."},
    {title:"5. The Saintess Choice",body:"There is meaning in collecting five Saintesses in your Reserves. Choose strategically between using one immediately and keeping them."},
  ],
  zh:[
    {title:"1. 七张牌召唤",body:"系统会自动突出7张牌中的最强组合，牌型决定召唤职业。黑白、彩色与反转小丑牌均为万能牌。"},
    {title:"2. 部署、收回与出售",body:"选择单位后点击空位进行部署。可收回或出售多余单位来获得重抽资金。稀有单位需要点击两次确认出售。"},
    {title:"3. 强化与战斗效果",body:"攻击力每级提高2.5%且无上限，攻击速度每级提高2.5%，最高30级。红色闪烁是直接伤害，深紫色区域是炼金术师的持续区域。"},
    {title:"4. 人口保持在200以下",body:"守卫要塞直到第200波。敌人不会逃离，而会持续绕场移动。普通怪物占1人口，Boss占20人口，必须在3分钟游戏时间内击败Boss。"},
    {title:"5. 圣女的选择",body:"在预备队中集齐5名圣女同样具有意义。请在立即使用与保留之间作出策略判断。"},
  ],
  ja:[
    {title:"1. セブンカード召喚",body:"7枚から最も強い組み合わせが自動で強調され、その役で召喚職業が決まります。白黒・カラー・反転ジョーカーの3枚はすべてワイルドカードです。"},
    {title:"2. 配置・回収・売却",body:"ユニットを選び、空きマスをタップして配置します。不要なユニットは回収または売却して引き直し資金にできます。希少ユニットの売却は2回タップで確定します。"},
    {title:"3. 強化と戦闘効果",body:"攻撃力はレベルごとに2.5%ずつ上限なく上昇し、攻撃速度は2.5%ずつ最大30レベルまで上昇します。赤い点滅は直接攻撃、濃い紫色の範囲は錬金術師の持続領域です。"},
    {title:"4. 人口200を防げ",body:"ウェーブ200まで城塞を守ってください。敵は脱出せず戦場を周回し続けます。通常敵は人口1、ボスは人口20で、ボスはゲーム時間3分以内に倒す必要があります。"},
    {title:"5. 聖女の選択",body:"聖女5体をインベントリに集める選択にも意味があります。すぐ使うか保管するか、戦略的に判断してください。"},
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
    high:[[],"","",""], pair:[[],"Leaves a mark that increases damage taken by 20% for 2 seconds","留下持续2秒、使受到伤害提高20%的标记","2秒間、受けるダメージが20%増加する標的を付与"],
    twoPair:[[],"Chain-attacks 4 monsters","连锁攻击4只怪物","モンスター4体を連鎖攻撃"], triple:[[],"Explosive attack","爆炸型攻击","爆発攻撃"],
    straight:[[],"50% critical damage, +100% boss damage","暴击伤害50%，对Boss额外伤害100%","クリティカルダメージ50%、ボス追加ダメージ100%"],
    flush:[[],"Slow and poison pool","减速与中毒区域","スロウ・毒沼"], fullHouse:[[],"Allies gain +50% ATK per Priest","每名祭司使友军攻击力提高50%","司祭1体ごとに味方の攻撃力50%増加"],
    fourKind:[[],"+120% boss damage","对Boss额外伤害120%","ボス追加ダメージ120%"],
    straightFlush:[[],"Extremely powerful single-target damage","极强的单体伤害","非常に強力な単体ダメージ"], royalFlush:[[],"Area damage over time","范围持续伤害","範囲持続ダメージ"],
    fiveKind:[[],"Removes every enemy when deployed","部署时消灭所有敌人","配置時にすべての敵を消滅"], sixKind:[[],"Instantly grants 2,000G","立即获得2,000G","即座に2,000G獲得"], sevenKind:[[],"???","???","???"],
  };
  if (locale === "ko") return "";
  const item = values[category]; if (!item) return "";
  const copy = item[locale === "en" ? 1 : locale === "zh" ? 2 : 3];
  return copy.replace("{v}", String(item[0][n] ?? ""));
}
