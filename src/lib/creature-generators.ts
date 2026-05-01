import { TYPE_PRIMARY_STAT, STAT_MIN, STAT_MAX, STAT_TOTAL } from './constants';

// ── Pokémon blacklist (Generation 1-9 sample + common ones) ──
const POKEMON_BLACKLIST = new Set([
  'pikachu','charizard','bulbasaur','squirtle','charmander','mewtwo','mew','eevee',
  'jigglypuff','snorlax','gengar','dragonite','gyarados','lapras','articuno','zapdos',
  'moltres','ditto','magikarp','onix','geodude','machamp','alakazam','golem',
  'arcanine','ninetales','vulpix','growlithe','ponyta','rapidash','slowpoke',
  'gastly','haunter','abra','kadabra','pidgey','rattata','caterpie','weedle',
  'lucario','greninja','gardevoir','blaziken','sceptile','swampert','rayquaza',
  'groudon','kyogre','dialga','palkia','giratina','arceus','reshiram','zekrom',
  'xerneas','yveltal','zygarde','solgaleo','lunala','necrozma','zacian','zamazenta',
  'calyrex','koraidon','miraidon','meowth','psyduck','mankey','poliwag','tentacool',
  'magnemite','doduo','seel','grimer','shellder','cloyster','drowzee','krabby',
  'voltorb','exeggcute','cubone','hitmonlee','hitmonchan','lickitung','koffing',
  'rhyhorn','chansey','tangela','kangaskhan','horsea','goldeen','staryu','scyther',
  'jynx','electabuzz','magmar','pinsir','tauros','porygon','omanyte','kabuto',
  'aerodactyl','zapdos','dragonair','dratini','chikorita','cyndaquil','totodile',
  'pichu','togepi','mareep','sudowoodo','wooper','umbreon','espeon','murkrow',
  'misdreavus','unown','wobbuffet','gligar','snubbull','heracross','sneasel',
  'teddiursa','slugma','swinub','corsola','remoraid','delibird','skarmory',
  'houndour','kingdra','donphan','stantler','smeargle','tyrogue','elekid','magby',
  'miltank','blissey','raikou','entei','suicune','larvitar','tyranitar','lugia','ho-oh',
  'celebi','treecko','torchic','mudkip','poochyena','zigzagoon','ralts','slakoth',
  'nincada','whismur','makuhita','nosepass','skitty','sableye','mawile','aron',
  'meditite','electrike','plusle','minun','volbeat','illumise','roselia','gulpin',
  'carvanha','wailmer','numel','torkoal','spoink','spinda','trapinch','vibrava',
  'flygon','cacnea','swablu','altaria','zangoose','seviper','lunatone','solrock',
  'barboach','corphish','baltoy','lileep','anorith','feebas','milotic','castform',
  'kecleon','shuppet','banette','duskull','tropius','chimecho','absol','wynaut',
  'snorunt','spheal','clamperl','relicanth','luvdisc','bagon','salamence','beldum',
  'metang','metagross','regirock','regice','registeel','latias','latios','jirachi',
  'deoxys','turtwig','chimchar','piplup','starly','bidoof','shinx','budew',
  'cranidos','shieldon','burmy','combee','pachirisu','buizel','cherubi','shellos',
  'drifloon','buneary','glameow','chingling','stunky','bronzor','bonsly','mime jr',
  'happiny','chatot','spiritomb','gible','garchomp','munchlax','riolu','hippopotas',
  'skorupi','croagunk','carnivine','finneon','mantyke','snover','rotom','uxie',
  'mesprit','azelf','heatran','regigigas','cresselia','phione','manaphy','darkrai',
  'shaymin','victini','snivy','tepig','oshawott','lillipup','purrloin','munna',
  'pidove','roggenrola','woobat','drilbur','audino','timburr','tympole','throh',
  'sawk','sewaddle','venipede','cottonee','petilil','basculin','sandile','darumaka',
  'maractus','dwebble','scraggy','sigilyph','yamask','tirtouga','archen','trubbish',
  'zorua','zoroark','minccino','gothita','solosis','ducklett','vanillite','deerling',
  'emolga','karrablast','foongus','frillish','joltik','ferroseed','klink','tynamo',
  'elgyem','litwick','axew','cubchoo','cryogonal','shelmet','stunfisk','mienfoo',
  'druddigon','golett','pawniard','bouffalant','rufflet','vullaby','heatmor',
  'durant','deino','hydreigon','larvesta','volcarona','cobalion','terrakion',
  'virizion','tornadus','thundurus','landorus','reshiram','kyurem','keldeo',
  'meloetta','genesect','chespin','fennekin','froakie','bunnelby','fletchling',
  'scatterbug','litleo','flabebe','skiddo','pancham','furfrou','espurr','honedge',
  'spritzee','swirlix','inkay','binacle','skrelp','clauncher','helioptile',
  'tyrunt','amaura','hawlucha','dedenne','carbink','goomy','klefki','phantump',
  'pumpkaboo','bergmite','noibat','diancie','hoopa','volcanion',
]);

// ── Syllable pools by type affinity ──
const SYLLABLES_NEUTRAL = [
  'an','ar','ax','bel','cor','dal','dra','el','fen','gal','gor','hel','ix',
  'jor','kal','lar','mor','nal','or','pax','qor','ral','sel','tar','ul',
  'val','vor','wen','xal','yar','zel','zor','ith','oth','urn','eth','iss',
  'ven','mir','nok','thal','skar','grim','dun','vel','keth','ron','brak',
];

const SYLLABLES_BY_TYPE: Record<string, string[]> = {
  feuer: ['bra','kra','vol','ash','mag','pyr','zar','drak','glo','sear'],
  wasser: ['riv','nau','mar','del','flu','aqu','tid','wav','blu','mer'],
  stein: ['gra','rok','ter','bol','kru','pet','mas','dor','krag','rum'],
  luft: ['sky','zeph','aer','whi','cir','ven','gal','swi','dri','hov'],
  blitz: ['zel','spar','volt','rai','pul','sta','sho','arc','cra','bli'],
  eis: ['fro','gla','kry','sno','chi','bor','ice','nim','col','bri'],
  gift: ['tox','ven','aci','sli','mur','poi','nox','cor','dre','spu'],
  licht: ['lum','sol','ray','glo','bri','aur','pho','rad','shi','hel'],
  schatten: ['nyx','umb','sha','dre','noc','obs','mur','voi','gri','phan'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateCreatureName(type: string): string {
  const syllableCount = Math.random() < 0.5 ? 2 : 3;
  const useTypeAffinity = Math.random() < 0.4;
  const typePool = SYLLABLES_BY_TYPE[type] || [];
  
  let name = '';
  for (let i = 0; i < syllableCount; i++) {
    if (useTypeAffinity && i === 0 && typePool.length > 0) {
      name += pick(typePool);
    } else {
      name += pick(SYLLABLES_NEUTRAL);
    }
  }
  
  name = capitalize(name);
  
  if (name.length < 3 || POKEMON_BLACKLIST.has(name.toLowerCase())) {
    return generateCreatureName(type); // retry
  }
  
  return name;
}

// ── Description templates ──
const DESC_TEMPLATES: Record<string, string[]> = {
  feuer: [
    'Dieses Wesen wurde in den Tiefen eines Vulkankraters geboren. Seine Haut glüht wie flüssiges Gestein, und es hinterlässt verkohlte Spuren, wo immer es geht.',
    'Es ernährt sich von der Hitze unterirdischer Magmaströme. Im Kampf steigt seine Körpertemperatur auf über tausend Grad.',
    'Alte Legenden berichten von einem Geschöpf, das in Flammen gehüllt durch die Wüste streift. Es soll die Sonne selbst als seinen Rivalen betrachten.',
    'Seine Augen leuchten wie glühende Kohlen in der Dunkelheit. Es ruht nur in der Nähe von offenen Feuerstellen und aktiven Vulkanen.',
  ],
  wasser: [
    'Es lebt in den tiefsten Meeresgraben und kommuniziert über Ultraschallwellen. Sein Körper schimmert in allen Blautönen.',
    'Dieses Wesen kontrolliert die Gezeiten mit seinen Gedanken. Fischer berichten von mysteriösen Strömungen in seiner Nähe.',
    'Es bewegt sich lautlos durch Unterwasserhöhlen und kann tagelang ohne Sauerstoff auskommen. Seine Schuppen sind härter als Stahl.',
    'Geboren aus einem uralten Korallenriff, trägt es die Weisheit der Ozeane in sich. Sein Gesang beruhigt selbst die wildesten Stürme.',
  ],
  stein: [
    'Sein Körper besteht aus kristallinem Gestein, das über Jahrtausende unter extremem Druck entstanden ist. Es bewegt sich langsam, aber unaufhaltsam.',
    'Dieses Wesen schläft in Bergmassiven und erwacht nur bei tektonischer Aktivität. Der Boden bebt unter seinen Schritten.',
    'Es formt seinen Körper aus den Mineralien der Erde und kann sich in Felsen tarnen. Nur das leise Knirschen verrät seine Anwesenheit.',
    'Alte Bergvölker verehren es als Hüter der Gebirge. Sein Blick kann Felsen spalten und Erdbeben auslösen.',
  ],
  luft: [
    'Es gleitet auf unsichtbaren Luftströmen und wurde noch nie auf dem Boden gesehen. Seine durchscheinenden Flügel erzeugen melodische Klänge.',
    'Dieses Geschöpf besteht fast vollständig aus verdichteter Luft. Es kann Tornados beschwören und sich in Windböen auflösen.',
    'In den höchsten Wolkenschichten geboren, erreicht es Geschwindigkeiten, die kein anderes Wesen übertreffen kann.',
    'Es kommuniziert durch Vibrationen in der Luft. Sein Erscheinen kündigt sich stets durch einen frischen Windhauch an.',
  ],
  blitz: [
    'Elektrische Entladungen umgeben seinen Körper permanent. Es bewegt sich so schnell, dass es wie ein Blitzschlag wirkt.',
    'Dieses Wesen speichert die Energie von Gewittern in seinem Kern. Ein einziger Angriff kann ganze Stromnetze überlasten.',
    'Es jagt mit der Geschwindigkeit des Lichts und hinterlässt ionisierte Luft in seiner Spur. Sein Fell knistert bei jeder Bewegung.',
    'Geboren während eines kosmischen Gewitters, trägt es die rohe Kraft der Elektrizität in jedem seiner Nerven.',
  ],
  eis: [
    'Sein Atem gefriert die Luft zu kristallinen Mustern. Es lebt in ewigem Eis und bewacht uralte, gefrorene Geheimnisse.',
    'Dieses Wesen kann die Temperatur seiner Umgebung auf unter minus hundert Grad senken. Sein Körper ist ein Kunstwerk aus lebendigem Eis.',
    'Es formt Waffen und Rüstungen aus reinem Eis, die härter sind als Diamant. In seiner Nähe blühen Eiskristalle wie Blumen.',
    'Alte Sagen erzählen von einem Wesen, das ganze Seen in Sekunden gefrieren lassen kann. Es schläft in Gletscherspalten.',
  ],
  gift: [
    'Jede seiner Poren sondert ein hochpotentes Toxin ab. Pflanzen welken in seiner Nähe, doch bestimmte Pilzarten gedeihen prächtig.',
    'Dieses Geschöpf braut in seinem Inneren tödliche Gifte. Paradoxerweise können kleinste Mengen seines Giftes als Heilmittel dienen.',
    'Es lebt in dichten Sümpfen und giftigen Mooren. Sein Körper hat sich über Äonen an die giftigsten Substanzen der Welt angepasst.',
    'Sein leuchtend gefärbter Körper warnt alle Feinde. Die Giftdrüsen an seinen Klauen enthalten genug Toxin für hundert Gegner.',
  ],
  licht: [
    'Es strahlt ein warmes, goldenes Licht aus, das Dunkelheit und Schatten vertreibt. In seiner Gegenwart fühlen sich alle Wesen sicher.',
    'Dieses Geschöpf wurde aus reinem Sternenlicht geboren. Seine Angriffe sind Strahlen konzentrierter Lichtenergie.',
    'Es erscheint nur in der Morgendämmerung und verschwindet bei Sonnenuntergang. Sein Körper besteht aus verdichtetem Licht.',
    'Alte Tempel wurden in seinem Abbild erbaut. Es soll die Kraft haben, die tiefste Finsternis zu durchbrechen.',
  ],
  schatten: [
    'Es existiert zwischen den Dimensionen und manifestiert sich nur als Schatten. Sein wahrer Körper wurde noch nie erblickt.',
    'Dieses Wesen nährt sich von der Dunkelheit selbst. In mondlosen Nächten ist es am mächtigsten und nahezu unsichtbar.',
    'Es bewegt sich durch Schatten wie andere durch Wasser. Sein Flüstern lässt selbst mutige Krieger erstarren.',
    'Geboren in der ewigen Finsternis, kennt es weder Furcht noch Gnade. Sein Blick absorbiert alles Licht.',
  ],
};

export function generateDescription(type: string): string {
  const pool = DESC_TEMPLATES[type] || DESC_TEMPLATES.feuer;
  return pick(pool);
}

// ── Stats generator (30 points total, bias by type) ──
export function generateStats(type: string): { strength: number; speed: number; intelligence: number } {
  const primary = TYPE_PRIMARY_STAT[type] || 'strength';
  const statKeys = ['strength', 'speed', 'intelligence'] as const;
  
  // Primary gets 40-55% of total
  const primaryRatio = 0.40 + Math.random() * 0.15;
  const primaryRaw = Math.round(STAT_TOTAL * primaryRatio);
  const remaining = STAT_TOTAL - primaryRaw;
  
  // Split remaining randomly between other two
  const splitRatio = 0.25 + Math.random() * 0.50; // 25%-75%
  const secondRaw = Math.round(remaining * splitRatio);
  const thirdRaw = remaining - secondRaw;
  
  const otherKeys = statKeys.filter(k => k !== primary);
  const raw: Record<string, number> = {
    [primary]: primaryRaw,
    [otherKeys[0]]: secondRaw,
    [otherKeys[1]]: thirdRaw,
  };
  
  // Clamp to min/max and redistribute
  const clamp = (v: number) => Math.max(STAT_MIN, Math.min(STAT_MAX, v));
  for (const k of statKeys) raw[k] = clamp(raw[k]);
  
  // Fix total after clamping
  let total = raw.strength + raw.speed + raw.intelligence;
  let attempts = 0;
  while (total !== STAT_TOTAL && attempts < 50) {
    const diff = STAT_TOTAL - total;
    const candidates = statKeys.filter(k => 
      diff > 0 ? raw[k] < STAT_MAX : raw[k] > STAT_MIN
    );
    if (candidates.length === 0) break;
    const target = pick([...candidates]);
    raw[target] = clamp(raw[target] + (diff > 0 ? 1 : -1));
    total = raw.strength + raw.speed + raw.intelligence;
    attempts++;
  }
  
  return { strength: raw.strength, speed: raw.speed, intelligence: raw.intelligence };
}
