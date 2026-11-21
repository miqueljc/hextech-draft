// ===== Bloc W: builds reals (op.gg, Emerald+, parc 16.23 = 26.23) + pla de partida detallat =====
// Cada entrada: [keystone, minors primàries, "Arbre: r1 · r2", shards (ofensiva·flex·defensa), summoners, inici, botes, [core x3], [alternativa], [4t objecte], pegat]
const REAL_BUILDS_SRC = 'op.gg (Emerald+, totes les regions), consultat el 20/11/2026';
const REAL_BUILDS_DEFAULT = {
  "Bel'Veth|Jg": ['Lethal Tempo', 'Triumph · Legend: Alacrity · Coup de Grace', 'Inspiration: Cash Back · Triple Tonic', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', 'Plated Steelcaps', ['Kraken Slayer', 'Blade of the Ruined King', "Death's Dance"], ["Guinsoo's Rageblade", 'Terminus'], ["Death's Dance", 'Terminus', "Wit's End", 'Guardian Angel'], '16.23'],
  'Amumu|Jg': ['Conqueror', 'Triumph · Legend: Haste · Last Stand', 'Domination: Cheap Shot · Ultimate Hunter', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Smite', 'Mosstomper Seedling + Health Potion', 'Plated Steelcaps', ["Liandry's Torment", 'Sunfire Aegis', 'Abyssal Mask'], ['Thornmail'], ["Jak'Sho, The Protean", 'Thornmail', 'Abyssal Mask'], '16.23'],
  'Zac|Jg': ['Conqueror', 'Triumph · Legend: Haste · Last Stand', 'Inspiration: Magical Footwear · Cosmic Insight', 'Ability Haste·Adaptive Force·Health Scaling', 'Flash + Smite', 'Scorchclaw Pup + Health Potion', 'Ionian Boots of Lucidity', ['Hextech Rocketbelt', 'Sunfire Aegis', 'Spirit Visage'], ['Thornmail'], ['Thornmail', "Randuin's Omen", 'Spirit Visage'], '16.23'],
  'Rammus|Jg': ['Aftershock', 'Font of Life · Conditioning · Unflinching', 'Precision: Triumph · Legend: Alacrity', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', 'Plated Steelcaps', ['Thornmail', 'Sunfire Aegis', "Jak'Sho, The Protean"], ['Hollow Radiance'], ["Jak'Sho, The Protean", 'Protoplasm Harness', "Randuin's Omen"], '16.21'],
  'Fiddlesticks|Jg': ['Electrocute', 'Cheap Shot · Grisly Mementos · Ultimate Hunter', 'Sorcery: Axiom Arcanist · Transcendence', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', "Sorcerer's Shoes", ['Hextech Rocketbelt', 'Shadowflame', "Zhonya's Hourglass"], ['Malignance', "Liandry's Torment"], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.23'],
  'Evelynn|Jg': ['Electrocute', 'Sudden Impact · Grisly Mementos · Relentless Hunter', 'Sorcery: Absolute Focus · Gathering Storm', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', "Sorcerer's Shoes", ['Lich Bane', 'Shadowflame', "Rabadon's Deathcap"], ['Dark Seal', "Mejai's Soulstealer"], ["Mejai's Soulstealer", 'Shadowflame', "Rabadon's Deathcap"], '16.20'],
  'Zaahen|Jg': ['Conqueror', 'Triumph · Legend: Haste · Coup de Grace', 'Inspiration: Magical Footwear · Cosmic Insight', 'Attack Speed·Adaptive Force·Health', 'Flash + Smite', 'Scorchclaw Pup + Health Potion', 'Plated Steelcaps', ['Trinity Force', 'Sundered Sky', "Death's Dance"], ['Stridebreaker'], ['Endless Hunger', "Death's Dance", 'Maw of Malmortius'], '16.21'],
  'Zaahen|Top': ['Conqueror', 'Triumph · Legend: Haste · Coup de Grace', 'Resolve: Bone Plating · Revitalize', 'Attack Speed·Adaptive Force·Health', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Trinity Force', 'Stridebreaker', "Death's Dance"], [], ['Endless Hunger', "Death's Dance", 'Maw of Malmortius'], '16.20'],
  'Mordekaiser|Jg': ['Conqueror', 'Triumph · Legend: Haste · Last Stand', 'Resolve: Bone Plating · Revitalize', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', 'Plated Steelcaps', ["Rylai's Crystal Scepter", 'Riftmaker', "Liandry's Torment"], ['Dusk and Dawn'], ['Spirit Visage', 'Thornmail', "Randuin's Omen"], '16.21'],
  'Mordekaiser|Top': ['Conqueror', 'Triumph · Legend: Haste · Last Stand', 'Resolve: Bone Plating · Revitalize', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", 'Plated Steelcaps', ["Rylai's Crystal Scepter", 'Riftmaker', "Liandry's Torment"], ['Spirit Visage'], ['Spirit Visage', 'Thornmail', "Zhonya's Hourglass"], '16.21'],
  'Sion|Jg': ['Grasp of the Undying', 'Shield Bash · Conditioning · Overgrowth', 'Inspiration: Cash Back · Approach Velocity', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', 'Boots of Swiftness', ['Sunfire Aegis', 'Unending Despair', 'Abyssal Mask'], ['Heartsteel', "Overlord's Bloodmail", 'Titanic Hydra'], ["Overlord's Bloodmail", 'Thornmail', 'Unending Despair'], '16.23'],
  'Qiyana|Jg': ['First Strike', 'Magical Footwear · Triple Tonic · Cosmic Insight', 'Domination: Sudden Impact · Ultimate Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Smite', 'Gustwalker Hatchling + Health Potion', 'Ionian Boots of Lucidity', ['Voltaic Cyclosword', 'Bastionbreaker', 'Edge of Night'], ["Serylda's Grudge"], ["Serylda's Grudge", 'Edge of Night', "Lord Dominik's Regards"], '16.21'],
  'Malphite|Top': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Resolve: Second Wind · Overgrowth', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", 'Plated Steelcaps', ['Sunfire Aegis', 'Thornmail', 'Frozen Heart'], ['Malignance', 'Stormsurge', 'Shadowflame'], ["Jak'Sho, The Protean", "Randuin's Omen", 'Kaenic Rookern'], '16.20'],
  'Ornn|Top': ['Grasp of the Undying', 'Demolish · Bone Plating · Overgrowth', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Teleport', "Doran's Shield + Health Potion", 'Plated Steelcaps', ['Sunfire Aegis', 'Thornmail', "Jak'Sho, The Protean"], ['Hollow Radiance', 'Unending Despair'], ["Jak'Sho, The Protean", 'Thornmail', "Randuin's Omen"], '16.21'],
  'Shen|Top': ['Grasp of the Undying', 'Shield Bash · Second Wind · Overgrowth', 'Inspiration: Biscuit Delivery · Approach Velocity', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Ignite', "Doran's Shield + Health Potion", 'Plated Steelcaps', ['Titanic Hydra', 'Dusk and Dawn', 'Thornmail'], ["Randuin's Omen"], ['Thornmail', 'Kaenic Rookern', "Randuin's Omen"], '16.19'],
  'Sett|Top': ['Conqueror', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Shield Bash · Second Wind', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Stridebreaker', 'Black Cleaver', "Overlord's Bloodmail"], ["Sterak's Gage"], ["Sterak's Gage", 'Spear of Shojin', "Overlord's Bloodmail"], '16.23'],
  'Darius|Top': ['Conqueror', 'Triumph · Legend: Alacrity · Last Stand', 'Sorcery: Axiom Arcanist · Celerity', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ghost', "Doran's Blade + Health Potion", 'Plated Steelcaps', ["Youmuu's Ghostblade", "Dead Man's Plate", "Death's Dance"], ['Force of Nature'], ['Force of Nature', "Death's Dance", "Sterak's Gage"], '16.23'],
  'Garen|Top': ['Conqueror', 'Triumph · Legend: Haste · Last Stand', 'Sorcery: Axiom Arcanist · Celerity', 'Adaptive Force·Adaptive Force·Health', 'Flash + Ignite', "Doran's Shield + Health Potion", "Berserker's Greaves", ['Stridebreaker', 'Phantom Dancer', 'Mortal Reminder'], ["Dead Man's Plate"], ["Dead Man's Plate", 'Mortal Reminder', 'Infinity Edge'], '16.23'],
  'Galio|Mid': ["Stormraider's Surge", 'Manaflow Band · Transcendence · Scorch', 'Resolve: Second Wind · Unflinching', 'Adaptive Force·Adaptive Force·Health', 'Flash + Teleport', "Doran's Ring + Health Potion", "Mercury's Treads", ['Hextech Rocketbelt', 'Imperial Mandate', "Zhonya's Hourglass"], ['Hollow Radiance'], ["Zhonya's Hourglass", 'Thornmail', "Rabadon's Deathcap"], '16.23'],
  'Orianna|Mid': ['Summon Aery', 'Manaflow Band · Transcendence · Scorch', 'Precision: Presence of Mind · Legend: Haste', 'Adaptive Force·Adaptive Force·Health', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Zhonya's Hourglass"], ["Rabadon's Deathcap"], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.23'],
  'Vex|Mid': ['Electrocute', 'Taste of Blood · Grisly Mementos · Ultimate Hunter', 'Sorcery: Manaflow Band · Transcendence', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Zhonya's Hourglass"], ['Stormsurge'], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.23'],
  'Ahri|Mid': ['Electrocute', 'Taste of Blood · Grisly Mementos · Ultimate Hunter', 'Sorcery: Manaflow Band · Transcendence', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Malignance', 'Shadowflame', "Zhonya's Hourglass"], ["Rabadon's Deathcap"], ["Rabadon's Deathcap", "Zhonya's Hourglass", "Mejai's Soulstealer"], '16.23'],
  'Diana|Mid': ['Electrocute', 'Sudden Impact · Grisly Mementos · Treasure Hunter', 'Resolve: Shield Bash · Bone Plating', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Stormsurge', 'Shadowflame', "Zhonya's Hourglass"], ['Lich Bane'], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.21'],
  'Ekko|Mid': ['Hail of Blades', 'Sudden Impact · Grisly Mementos · Relentless Hunter', 'Precision: Legend: Haste · Cut Down', 'Adaptive Force·Adaptive Force·Health', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Stormsurge', 'Dusk and Dawn', "Rabadon's Deathcap"], ['Shadowflame'], ["Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff'], '16.23'],
  'Veigar|Mid': ['First Strike', 'Magical Footwear · Biscuit Delivery · Cosmic Insight', 'Sorcery: Manaflow Band · Transcendence', 'Ability Haste·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Stormsurge', "Rabadon's Deathcap"], ['Rod of Ages', "Seraph's Embrace"], ["Zhonya's Hourglass", "Rabadon's Deathcap", 'Shadowflame'], '16.23'],
  'Yone|Mid': ['Lethal Tempo', 'Absorb Life · Legend: Alacrity · Last Stand', 'Resolve: Second Wind · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Immortal Shieldbow', 'Infinity Edge', "Death's Dance"], ['Blade of the Ruined King'], ["Death's Dance", 'Guardian Angel', 'Mortal Reminder'], '16.21'],
  'Yasuo|Mid': ['Lethal Tempo', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Second Wind · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Immortal Shieldbow', 'Infinity Edge', "Death's Dance"], ['Blade of the Ruined King'], ["Death's Dance", 'Guardian Angel', "Lord Dominik's Regards"], '16.23'],
  'Lissandra|Mid': ['Electrocute', 'Cheap Shot · Grisly Mementos · Ultimate Hunter', 'Sorcery: Manaflow Band · Transcendence', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Malignance', 'Shadowflame', "Zhonya's Hourglass"], [], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.21'],
  'LeBlanc|Mid': ['Electrocute', 'Sudden Impact · Grisly Mementos · Relentless Hunter', 'Sorcery: Transcendence · Gathering Storm', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Zhonya's Hourglass"], ["Rabadon's Deathcap"], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], '16.23'],
  'Sylas|Mid': ['Conqueror', 'Presence of Mind · Legend: Haste · Last Stand', 'Resolve: Second Wind · Unflinching', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Hextech Rocketbelt', 'Riftmaker', "Zhonya's Hourglass"], ['Shadowflame'], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Shadowflame'], '16.23'],
  "Kai'Sa|Bot": ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Coup de Grace', 'Inspiration: Magical Footwear · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Kraken Slayer', "Guinsoo's Rageblade", 'Terminus'], ["Nashor's Tooth"], ["Zhonya's Hourglass", 'Terminus', "Nashor's Tooth"], '16.23'],
  'Caitlyn|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Coup de Grace', 'Sorcery: Absolute Focus · Gathering Storm', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Hexoptics C44', 'Infinity Edge', "Lord Dominik's Regards"], ['Rapid Firecannon'], ['Rapid Firecannon', "Lord Dominik's Regards", 'Mortal Reminder'], '16.21'],
  'Miss Fortune|Bot': ['Press the Attack', 'Presence of Mind · Legend: Bloodline · Coup de Grace', 'Inspiration: Magical Footwear · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Boots of Swiftness', ['Bloodthirster', 'The Collector', 'Infinity Edge'], ["Lord Dominik's Regards"], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Jinx|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Cut Down', 'Inspiration: Cash Back · Triple Tonic', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Hexoptics C44', "Runaan's Hurricane", 'Infinity Edge'], ["Lord Dominik's Regards"], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Xayah|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Cut Down', 'Inspiration: Magical Footwear · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Yun Tal Wildarrows', 'Navori Flickerblade', 'Infinity Edge'], ['Essence Reaver'], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Jhin|Bot': ['Fleet Footwork', 'Presence of Mind · Legend: Bloodline · Cut Down', 'Inspiration: Cash Back · Jack of All Trades', 'Adaptive Force·Adaptive Force·Health', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Boots of Swiftness', ['Hubris', 'Phantom Dancer', 'Infinity Edge'], ['The Collector'], ["Lord Dominik's Regards", 'Rapid Firecannon', 'Infinity Edge'], '16.23'],
  'Ezreal|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Cut Down', 'Inspiration: Magical Footwear · Cosmic Insight', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Bow + Health Potion", 'Ionian Boots of Lucidity', ['Trinity Force', 'Muramana', 'Spear of Shojin'], ['Endless Hunger'], ["Serylda's Grudge", 'Spear of Shojin', 'Endless Hunger'], '16.23'],
  'Smolder|Bot': ['Deathfire Touch', 'Nimbus Cloak · Celerity · Gathering Storm', 'Inspiration: Magical Footwear · Jack of All Trades', 'Adaptive Force·Move Speed·Health Scaling', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Gluttonous Greaves', ['Essence Reaver', 'Black Cleaver', 'Spear of Shojin'], ['Rapid Firecannon'], ['Rapid Firecannon', 'Infinity Edge', "Lord Dominik's Regards"], '16.23'],
  'Ashe|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Alacrity · Cut Down', 'Inspiration: Approach Velocity · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Hexoptics C44', 'Phantom Dancer', 'Infinity Edge'], ['Kraken Slayer'], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Varus|Bot': ['Lethal Tempo', 'Triumph · Legend: Alacrity · Cut Down', 'Inspiration: Cash Back · Cosmic Insight', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", 'Gluttonous Greaves', ['Statikk Shiv', "Guinsoo's Rageblade", 'Terminus'], ["Youmuu's Ghostblade", 'Edge of Night'], ["Jak'Sho, The Protean", "Zhonya's Hourglass", "Serylda's Grudge"], '16.23'],
  'Nautilus|Sup': ['Aftershock', 'Shield Bash · Bone Plating · Unflinching', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Ability Haste·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Locket of the Iron Solari', "Knight's Vow", 'Bandlepipes'], ['Thornmail'], ['Thornmail', 'Kaenic Rookern', 'Bandlepipes'], '16.23'],
  'Leona|Sup': ['Aftershock', 'Font of Life · Second Wind · Overgrowth', 'Precision: Triumph · Legend: Haste', 'Ability Haste·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Locket of the Iron Solari', "Knight's Vow", 'Bandlepipes'], ['Thornmail', 'Kaenic Rookern'], ['Thornmail', 'Protoplasm Harness', 'Kaenic Rookern'], '16.23'],
  'Braum|Sup': ['Guardian', 'Font of Life · Bone Plating · Unflinching', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Locket of the Iron Solari', "Knight's Vow", 'Bandlepipes'], ['Frozen Heart'], ['Thornmail', 'Frozen Heart', 'Kaenic Rookern'], '16.23'],
  'Milio|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Scorch', 'Resolve: Bone Plating · Revitalize', 'Ability Haste·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Echoes of Helia', 'Moonstone Renewer', 'Ardent Censer'], [], ['Redemption', "Shurelya's Battlesong", 'Dawncore'], '16.23'],
  'Rell|Sup': ['Aftershock', 'Shield Bash · Bone Plating · Unflinching', 'Inspiration: Hextech Flashtraption · Cosmic Insight', 'Ability Haste·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ["Zeke's Convergence", 'Locket of the Iron Solari', "Knight's Vow"], [], ['Thornmail', 'Protoplasm Harness', 'Bandlepipes'], '16.20'],
  'Thresh|Sup': ['Aftershock', 'Font of Life · Bone Plating · Unflinching', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Locket of the Iron Solari', "Knight's Vow", "Zeke's Convergence"], [], ['Thornmail', 'Bandlepipes', 'Frozen Heart'], '16.23'],
  'Pyke|Sup': ['Hail of Blades', 'Cheap Shot · Sixth Sense · Ultimate Hunter', 'Resolve: Bone Plating · Unflinching', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Umbral Glaive', "Youmuu's Ghostblade", 'Edge of Night'], [], ['Edge of Night', 'Guardian Angel', 'Axiom Arc'], '16.23'],
  'Nami|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Scorch', 'Resolve: Bone Plating · Revitalize', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Echoes of Helia', 'Moonstone Renewer', 'Ardent Censer'], [], ['Redemption', "Mikael's Blessing", "Shurelya's Battlesong"], '16.23'],
  'Morgana|Sup': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Domination: Cheap Shot · Ultimate Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ["Liandry's Torment", "Zhonya's Hourglass", "Rylai's Crystal Scepter"], ['Morellonomicon'], ['Morellonomicon', "Rylai's Crystal Scepter", 'Imperial Mandate'], '16.23'],
  'Karma|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Scorch', 'Resolve: Font of Life · Revitalize', 'Ability Haste·Adaptive Force·Health', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Echoes of Helia', 'Moonstone Renewer', 'Redemption'], ["Mikael's Blessing"], ["Shurelya's Battlesong", 'Redemption', 'Dawncore'], '16.23'],
  'Seraphine|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Gathering Storm', 'Resolve: Font of Life · Revitalize', 'Ability Haste·Adaptive Force·Health', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Echoes of Helia', 'Diadem of Songs', 'Moonstone Renewer'], ["Rylai's Crystal Scepter"], ['Moonstone Renewer', 'Morellonomicon', 'Redemption'], '16.23'],
  'Zyra|Sup': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Domination: Taste of Blood · Relentless Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', "Sorcerer's Shoes", ["Liandry's Torment", "Rylai's Crystal Scepter", "Zhonya's Hourglass"], ['Morellonomicon'], ['Morellonomicon', "Zhonya's Hourglass", 'Malignance'], '16.23'],
  'Alistar|Sup': ['Aftershock', 'Font of Life · Bone Plating · Unflinching', 'Inspiration: Hextech Flashtraption · Cosmic Insight', 'Ability Haste·Move Speed·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Locket of the Iron Solari', "Zeke's Convergence", "Knight's Vow"], [], ['Thornmail', 'Bandlepipes', 'Protoplasm Harness'], '16.23'],
  'Blitzcrank|Sup': ['Glacial Augment', 'Hextech Flashtraption · Biscuit Delivery · Cosmic Insight', 'Sorcery: Nimbus Cloak · Celerity', 'Ability Haste·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Locket of the Iron Solari', "Zeke's Convergence", 'Bandlepipes'], ['Frozen Heart'], ["Knight's Vow", 'Thornmail', 'Frozen Heart'], '16.23'],
  'Lulu|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Scorch', 'Resolve: Bone Plating · Revitalize', 'Ability Haste·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Ardent Censer', "Mikael's Blessing", 'Moonstone Renewer'], ["Shurelya's Battlesong"], ['Redemption', 'Locket of the Iron Solari', "Shurelya's Battlesong"], '16.23'],
  'Tristana|Bot': ['Lethal Tempo', 'Triumph · Legend: Alacrity · Cut Down', 'Inspiration: Cash Back · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Yun Tal Wildarrows', 'Infinity Edge', 'Navori Flickerblade'], [], ["Lord Dominik's Regards", 'Navori Flickerblade', 'Mortal Reminder'], '16.23'],
  'Sivir|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Cut Down', 'Inspiration: Cash Back · Triple Tonic', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Yun Tal Wildarrows', 'Navori Flickerblade', 'Infinity Edge'], [], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Yunara|Bot': ['Lethal Tempo', 'Triumph · Legend: Alacrity · Cut Down', 'Inspiration: Cash Back · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", 'Gluttonous Greaves', ['Kraken Slayer', "Runaan's Hurricane", 'Infinity Edge'], [], ["Lord Dominik's Regards", 'Infinity Edge', 'Mortal Reminder'], '16.23'],
  'Bard|Sup': ['Electrocute', 'Cheap Shot · Deep Ward · Treasure Hunter', 'Inspiration: Magical Footwear · Jack of All Trades', 'Attack Speed·Move Speed·Health', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ["Dead Man's Plate", 'Locket of the Iron Solari', 'Bandlepipes'], [], ['Redemption', 'Bandlepipes', "Mikael's Blessing"], '16.23'],
  'Janna|Sup': ['Summon Aery', 'Manaflow Band · Celerity · Gathering Storm', 'Resolve: Font of Life · Revitalize', 'Adaptive Force·Move Speed·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Moonstone Renewer', 'Redemption', "Shurelya's Battlesong"], [], ["Mejai's Soulstealer", 'Dawncore', "Mikael's Blessing"], '16.20'],
  'Rakan|Sup': ['Guardian', 'Font of Life · Bone Plating · Unflinching', 'Domination: Sixth Sense · Ultimate Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ["Zeke's Convergence", 'Locket of the Iron Solari', "Knight's Vow"], [], ['Redemption', "Knight's Vow", 'Bandlepipes'], '16.23'],
  'Senna|Sup': ['Deathfire Touch', 'Manaflow Band · Celerity · Gathering Storm', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Attack Speed·Adaptive Force·Health', 'Flash + Heal', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Black Cleaver', 'Statikk Shiv', 'Rapid Firecannon'], [], ['Infinity Edge', 'Hexoptics C44'], '16.23'],
  'Tahm Kench|Sup': ['Grasp of the Undying', 'Shield Bash · Second Wind · Unflinching', 'Precision: Triumph · Legend: Alacrity', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Heartsteel', 'Thornmail', 'Spirit Visage'], [], ['Thornmail', 'Unending Despair', 'Spirit Visage'], '16.20'],
  'Poppy|Sup': ['Aftershock', 'Font of Life · Bone Plating · Unflinching', 'Inspiration: Hextech Flashtraption · Cosmic Insight', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ["Dead Man's Plate", 'Locket of the Iron Solari', 'Thornmail'], [], ['Force of Nature', 'Protoplasm Harness', 'Bandlepipes'], '16.23'],
  'Teemo|Top': ['Press the Attack', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Bone Plating · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", 'Boots of Swiftness', ['Statikk Shiv', "Liandry's Torment", 'Malignance'], [], ['Shadowflame', "Rabadon's Deathcap", 'Malignance'], '16.23'],
  'Kled|Top': ['Conqueror', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Demolish · Bone Plating', 'Attack Speed·Adaptive Force·Health', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Titanic Hydra', 'Black Cleaver', "Overlord's Bloodmail"], [], ["Sterak's Gage", "Overlord's Bloodmail", "Death's Dance"], '16.23'],
  'Nasus|Top': ['Fleet Footwork', 'Triumph · Legend: Haste · Last Stand', 'Resolve: Second Wind · Unflinching', 'Ability Haste·Health Scaling·Health Scaling', 'Ghost + Teleport', "Doran's Shield + Health Potion", 'Ionian Boots of Lucidity', ['Trinity Force', 'Frozen Heart', 'Spirit Visage'], [], ["Jak'Sho, The Protean", 'Thornmail', "Randuin's Omen"], '16.20'],
  'Illaoi|Top': ['Grasp of the Undying', 'Demolish · Bone Plating · Overgrowth', 'Precision: Presence of Mind · Last Stand', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Black Cleaver', 'Iceborn Gauntlet', "Sterak's Gage"], [], ['Spirit Visage', "Death's Dance", "Sterak's Gage"], '16.21'],
  'Volibear|Top': ['Lethal Tempo', 'Triumph · Legend: Haste · Last Stand', 'Resolve: Demolish · Revitalize', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", 'Plated Steelcaps', ['Dusk and Dawn', 'Navori Flickerblade', 'Spirit Visage'], [], ['Spirit Visage', 'Thornmail', "Randuin's Omen"], '16.21'],
  'Jax|Top': ['Lethal Tempo', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Bone Plating · Unflinching', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Trinity Force', 'Sundered Sky', "Zhonya's Hourglass"], [], ["Death's Dance", "Zhonya's Hourglass", "Sterak's Gage"], '16.21'],
  'Galio|Top': ["Stormraider's Surge", 'Manaflow Band · Transcendence · Scorch', 'Resolve: Second Wind · Unflinching', 'Adaptive Force·Adaptive Force·Health', 'Flash + Teleport', "Doran's Ring + Health Potion", "Mercury's Treads", ['Hollow Radiance', 'Imperial Mandate', "Zhonya's Hourglass"], [], ['Thornmail', "Zhonya's Hourglass", "Rabadon's Deathcap"], '16.20'],
  'Samira|Bot': ['Conqueror', 'Triumph · Legend: Bloodline · Last Stand', 'Domination: Taste of Blood · Treasure Hunter', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Gluttonous Greaves', ['The Collector', 'Infinity Edge', "Lord Dominik's Regards"], [], ['Immortal Shieldbow', "Lord Dominik's Regards", 'Bloodthirster'], '16.23'],
  'Draven|Bot': ['Lethal Tempo', 'Presence of Mind · Legend: Alacrity · Cut Down', 'Inspiration: Cash Back · Cosmic Insight', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Bloodthirster', 'Hexoptics C44', 'Infinity Edge'], [], ["Lord Dominik's Regards", 'Infinity Edge', 'Immortal Shieldbow'], '16.21'],
  'Naafiri|Mid': ['Deathfire Touch', 'Manaflow Band · Transcendence · Scorch', 'Precision: Legend: Haste · Cut Down', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Gluttonous Greaves', ['Voltaic Cyclosword', 'Axiom Arc', "Serylda's Grudge"], ['Bastionbreaker'], ['Edge of Night', "Serylda's Grudge", "Death's Dance"], '16.20'],
  'Malzahar|Mid': ['Deathfire Touch', 'Manaflow Band · Transcendence · Scorch', 'Inspiration: Magical Footwear · Cosmic Insight', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Blackfire Torch', "Liandry's Torment", "Rylai's Crystal Scepter"], [], ["Zhonya's Hourglass", 'Shadowflame', "Rabadon's Deathcap"], '16.21'],
  'Kayle|Top': ['Press the Attack', 'Absorb Life · Legend: Alacrity · Last Stand', 'Sorcery: Celerity · Gathering Storm', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Blade + Health Potion", 'Boots of Swiftness', ["Nashor's Tooth", 'Dusk and Dawn', "Rabadon's Deathcap"], [], ['Shadowflame', "Rabadon's Deathcap", 'Void Staff'], '16.23'],
  'Gnar|Top': ['Fleet Footwork', 'Triumph · Legend: Alacrity · Last Stand', 'Resolve: Bone Plating · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Trinity Force', 'Black Cleaver', "Sterak's Gage"], [], ["Randuin's Omen", 'Thornmail', "Sterak's Gage"], '16.21'],
  'Doctor Mundo|Top': ['Grasp of the Undying', 'Demolish · Second Wind · Overgrowth', 'Inspiration: Biscuit Delivery · Approach Velocity', 'Attack Speed·Health Scaling·Health Scaling', 'Ghost + Teleport', "Doran's Shield + Health Potion", 'Boots of Swiftness', ["Warmog's Armor", 'Heartsteel', 'Titanic Hydra'], [], ['Spirit Visage', 'Thornmail', "Overlord's Bloodmail"], '16.19'],
  'Camille|Top': ['Grasp of the Undying', 'Shield Bash · Bone Plating · Unflinching', 'Inspiration: Magical Footwear · Biscuit Delivery', 'Adaptive Force·Attack Speed·Health Scaling', 'Flash + Ignite', "Doran's Blade + Health Potion", 'Plated Steelcaps', ['Trinity Force', 'Ravenous Hydra', "Death's Dance"], [], ["Death's Dance", "Sterak's Gage", 'Guardian Angel'], '16.20'],
  'Poppy|Top': ['Grasp of the Undying', 'Shield Bash · Second Wind · Overgrowth', 'Precision: Presence of Mind · Last Stand', 'Adaptive Force·Adaptive Force·Health', 'Flash + Teleport', "Doran's Shield + Health Potion", 'Plated Steelcaps', ['Sundered Sky', 'Fimbulwinter', 'Thornmail'], ['Tear of the Goddess'], ['Thornmail', 'Spirit Visage', "Randuin's Omen"], '16.21'],
  'Maokai|Top': ['Grasp of the Undying', 'Demolish · Second Wind · Overgrowth', 'Sorcery: Manaflow Band · Transcendence', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Teleport', "Doran's Shield + Health Potion", 'Plated Steelcaps', ['Unending Despair', 'Fimbulwinter', 'Spirit Visage'], ['Tear of the Goddess'], ['Thornmail', 'Spirit Visage', 'Unending Despair'], '16.21'],
  'Swain|Top': ['Conqueror', 'Presence of Mind · Legend: Haste · Last Stand', 'Resolve: Bone Plating · Overgrowth', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ghost', "Doran's Ring + Health Potion", 'Plated Steelcaps', ['Blackfire Torch', "Rylai's Crystal Scepter", "Zhonya's Hourglass"], [], ["Zhonya's Hourglass", 'Spirit Visage', "Liandry's Torment"], '16.20'],
  'Tahm Kench|Top': ['Grasp of the Undying', 'Shield Bash · Second Wind · Unflinching', 'Precision: Triumph · Legend: Alacrity', 'Attack Speed·Health Scaling·Health Scaling', 'Flash + Ignite', "Doran's Shield + Health Potion", 'Plated Steelcaps', ['Heartsteel', 'Dusk and Dawn', 'Thornmail'], [], ['Spirit Visage', 'Thornmail', 'Unending Despair'], '16.20'],
  'Sejuani|Top': ['Grasp of the Undying', 'Demolish · Second Wind · Overgrowth', 'Sorcery: Manaflow Band · Scorch', 'Attack Speed·Health Scaling·Health Scaling', 'Teleport + Ignite', "Doran's Ring + Health Potion", 'Plated Steelcaps', ['Heartsteel', 'Dusk and Dawn', 'Thornmail'], [], ['Thornmail', 'Kaenic Rookern', 'Unending Despair'], '16.20'],
  'Lillia|Top': ['Conqueror', 'Triumph · Legend: Haste · Coup de Grace', 'Sorcery: Celerity · Waterwalking', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", 'Boots of Swiftness', ['Blackfire Torch', "Liandry's Torment", "Rylai's Crystal Scepter"], [], ['Riftmaker', "Zhonya's Hourglass", "Rylai's Crystal Scepter"], '16.23'],
  'Aurelion Sol|Top': ['Deathfire Touch', 'Manaflow Band · Absolute Focus · Scorch', 'Resolve: Bone Plating · Overgrowth', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Blackfire Torch', "Rylai's Crystal Scepter", "Liandry's Torment"], [], ["Zhonya's Hourglass", "Bloodletter's Curse", "Rabadon's Deathcap"], '16.20'],
  'Yasuo|Top': ['Lethal Tempo', 'Absorb Life · Legend: Alacrity · Last Stand', 'Resolve: Bone Plating · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Exhaust', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Blade of the Ruined King', 'Immortal Shieldbow', 'Infinity Edge'], [], ["Death's Dance", 'Guardian Angel', 'Infinity Edge'], '16.20'],
  'Yone|Top': ['Lethal Tempo', 'Absorb Life · Legend: Alacrity · Last Stand', 'Resolve: Second Wind · Overgrowth', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Exhaust', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Blade of the Ruined King', 'Immortal Shieldbow', 'Infinity Edge'], ['Mortal Reminder'], ["Death's Dance", 'Guardian Angel', 'Infinity Edge'], '16.21'],
  'Smolder|Top': ['Deathfire Touch', 'Nimbus Cloak · Celerity · Gathering Storm', 'Inspiration: Magical Footwear · Jack of All Trades', 'Adaptive Force·Move Speed·Health Scaling', 'Flash + Teleport', "Doran's Blade + Health Potion", 'Boots of Swiftness', ['Essence Reaver', 'Black Cleaver', 'Spear of Shojin'], [], ['Infinity Edge', 'Rapid Firecannon', 'Endless Hunger'], '16.20'],
  'Miss Fortune|Top': ['First Strike', 'Cash Back · Biscuit Delivery · Jack of All Trades', 'Sorcery: Manaflow Band · Gathering Storm', 'Adaptive Force·Adaptive Force·Health', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Boots of Swiftness', ['Hubris', 'The Collector', 'Infinity Edge'], [], ["Lord Dominik's Regards", 'Infinity Edge', 'Bloodthirster'], '16.20'],
  'Caitlyn|Top': ['Lethal Tempo', 'Presence of Mind · Legend: Bloodline · Coup de Grace', 'Sorcery: Absolute Focus · Gathering Storm', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Barrier', "Doran's Bow + Health Potion", "Berserker's Greaves", ['The Collector', 'Infinity Edge', "Lord Dominik's Regards"], [], ["Lord Dominik's Regards", 'Infinity Edge', 'Rapid Firecannon'], '16.20'],
  'Ashe|Top': ['Lethal Tempo', 'Presence of Mind · Legend: Alacrity · Cut Down', 'Inspiration: Approach Velocity · Biscuit Delivery', 'Attack Speed·Adaptive Force·Health', 'Flash + Ghost', "Doran's Bow + Health Potion", "Berserker's Greaves", ['Kraken Slayer', 'Phantom Dancer', 'Infinity Edge'], [], ["Runaan's Hurricane", "Lord Dominik's Regards", 'Infinity Edge'], '16.20'],
  'Neeko|Mid': ['Electrocute', 'Taste of Blood · Grisly Mementos · Ultimate Hunter', 'Sorcery: Manaflow Band · Scorch', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ['Hextech Rocketbelt', 'Stormsurge', "Zhonya's Hourglass"], ['Shadowflame'], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Shadowflame'], '16.20'],
  'Lux|Mid': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Domination: Cheap Shot · Ultimate Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Stormsurge', 'Shadowflame'], [], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Shadowflame'], '16.23'],
  'Ziggs|Bot': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Precision: Presence of Mind · Coup de Grace', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Rabadon's Deathcap"], [], ["Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff'], '16.21'],
  'Mel|Bot': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Precision: Presence of Mind · Legend: Haste', 'Adaptive Force·Ability Haste·Health Scaling', 'Flash + Teleport', "Doran's Ring + Health Potion", "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Rabadon's Deathcap"], [], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Cryptbloom'], '16.23'],
  'Senna|Bot': ['Deathfire Touch', 'Manaflow Band · Celerity · Gathering Storm', 'Inspiration: Magical Footwear · Jack of All Trades', 'Attack Speed·Adaptive Force·Health', 'Flash + Barrier', "Doran's Blade + Health Potion", 'Boots of Swiftness', ['Statikk Shiv', 'Black Cleaver', 'Hexoptics C44'], ['Muramana'], ['Infinity Edge', 'Hexoptics C44', 'Rapid Firecannon'], '16.23'],
  'Darius|Bot': ["Stormraider's Surge", 'Nimbus Cloak · Celerity · Gathering Storm', 'Precision: Triumph · Legend: Alacrity', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ghost', "Doran's Blade + Health Potion", 'Plated Steelcaps', ["Youmuu's Ghostblade", "Dead Man's Plate", "Death's Dance"], [], ['Force of Nature', "Sterak's Gage", "Death's Dance"], '16.20'],
  'Seraphine|Bot': ['Arcane Comet', 'Manaflow Band · Transcendence · Gathering Storm', 'Precision: Legend: Haste · Cut Down', 'Adaptive Force·Ability Haste·Health', 'Flash + Teleport', "Doran's Ring + Health Potion", 'Ionian Boots of Lucidity', ['Blackfire Torch', "Seraph's Embrace", 'Diadem of Songs'], ['Tear of the Goddess'], ['Diadem of Songs', 'Imperial Mandate', "Rylai's Crystal Scepter"], '16.23'],
  'Galio|Sup': ['Aftershock', 'Shield Bash · Bone Plating · Unflinching', 'Sorcery: Nimbus Cloak · Transcendence', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Locket of the Iron Solari', 'Imperial Mandate', 'Thornmail'], [], ["Knight's Vow", 'Thornmail', 'Frozen Heart'], '16.23'],
  'Neeko|Sup': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Hextech Rocketbelt', "Zhonya's Hourglass", 'Stormsurge'], [], ['Morellonomicon', 'Imperial Mandate', 'Shadowflame'], '16.23'],
  'Renata Glasc|Sup': ['Guardian', 'Shield Bash · Bone Plating · Unflinching', 'Domination: Sixth Sense · Relentless Hunter', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ['Locket of the Iron Solari', "Shurelya's Battlesong", "Knight's Vow"], [], ['Bandlepipes', 'Redemption', "Mikael's Blessing"], '16.23'],
  'Maokai|Sup': ['Aftershock', 'Font of Life · Bone Plating · Unflinching', 'Inspiration: Biscuit Delivery · Cosmic Insight', 'Adaptive Force·Health Scaling·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Boots of Swiftness', ['Locket of the Iron Solari', 'Bandlepipes', "Knight's Vow"], [], ["Knight's Vow", 'Thornmail', 'Spirit Visage'], '16.23'],
  'Swain|Sup': ['Conqueror', 'Presence of Mind · Legend: Haste · Last Stand', 'Resolve: Conditioning · Overgrowth', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ["Rylai's Crystal Scepter", "Liandry's Torment", "Zhonya's Hourglass"], [], ['Spirit Visage', 'Morellonomicon', "Zhonya's Hourglass"], '16.23'],
  'Lux|Sup': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Domination: Cheap Shot · Ultimate Hunter', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', "Sorcerer's Shoes", ["Luden's Echo", 'Stormsurge', 'Shadowflame'], [], ["Zhonya's Hourglass", 'Shadowflame', "Rabadon's Deathcap"], '16.20'],
  'Zilean|Sup': ['Summon Aery', 'Manaflow Band · Transcendence · Waterwalking', 'Domination: Cheap Shot · Relentless Hunter', 'Ability Haste·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', 'Ionian Boots of Lucidity', ["Shurelya's Battlesong", 'Imperial Mandate', 'Bandlepipes'], [], ['Cosmic Drive', 'Locket of the Iron Solari', 'Redemption'], '16.20'],
  'Mel|Sup': ['Arcane Comet', 'Manaflow Band · Transcendence · Scorch', 'Precision: Presence of Mind · Coup de Grace', 'Adaptive Force·Adaptive Force·Health Scaling', 'Flash + Heal', 'World Atlas + Health Potion', "Sorcerer's Shoes", ["Luden's Echo", 'Shadowflame', "Zhonya's Hourglass"], [], ["Rabadon's Deathcap", "Zhonya's Hourglass", 'Morellonomicon'], '16.20'],
  'Shen|Sup': ['Aftershock', 'Shield Bash · Second Wind · Revitalize', 'Domination: Cheap Shot · Ultimate Hunter', 'Attack Speed·Adaptive Force·Health Scaling', 'Flash + Ignite', 'World Atlas + Health Potion', 'Plated Steelcaps', ['Heartsteel', 'Thornmail', "Zeke's Convergence"], [], ['Thornmail', 'Protoplasm Harness', "Zeke's Convergence"], '16.23']
};
// Les builds viuen a data.json (hextech_builds_v1) per poder-les actualitzar cada parc sense tocar el codi;
// les d'aquí són la còpia de seguretat per quan no hi ha connexió.
let REAL_BUILDS = REAL_BUILDS_DEFAULT, REAL_BUILDS_PATCH = '16.23';
function loadRealBuilds() {
  const o = lsGet('hextech_builds_v1');
  if (o && o.builds && typeof o.builds === 'object') { REAL_BUILDS = { ...REAL_BUILDS_DEFAULT, ...o.builds }; REAL_BUILDS_PATCH = o.patch || REAL_BUILDS_PATCH; }
  else REAL_BUILDS = REAL_BUILDS_DEFAULT;
}
loadRealBuilds();
const _afterDataChangeBaseW = afterDataChange;
afterDataChange = function () { loadRealBuilds(); _afterDataChangeBaseW(); };
// Icones que el catàleg desat encara no tenia (Data Dragon les afegeix sol si hi ha connexió)
(function addItemIds() {
  try {
    const add = { hextechrocketbelt: '3152', rylaiscrystalscepter: '3116', terminus: '3302', overlordsbloodmail: '2501', yuntalwildarrows: '3032', muramana: '3042', tearofthegoddess: '3070', essencereaver: '3508', darkseal: '1082', mejaissoulstealer: '3041', bootsofswiftness: '3009', gustwalkerhatchling: '1102', mosstomperseedling: '1103', scorchclawpup: '1101', seraphsembrace: '3040', doransbow: '1086', fimbulwinter: '3121', bloodletterscurse: '8010' };
    [DD_CAT_DEFAULT, typeof DD_CAT !== 'undefined' ? DD_CAT : null].forEach(c => { if (c && c.items) Object.keys(add).forEach(k => { if (!c.items[k]) c.items[k] = add[k]; }); });
  } catch (e) {}
})();
const RUNE_ROWS = {
  Precision: [['Press the Attack', 'Lethal Tempo', 'Fleet Footwork', 'Conqueror'], ['Absorb Life', 'Triumph', 'Presence of Mind'], ['Legend: Alacrity', 'Legend: Haste', 'Legend: Bloodline'], ['Coup de Grace', 'Cut Down', 'Last Stand']],
  Domination: [['Electrocute', 'Dark Harvest', 'Hail of Blades'], ['Cheap Shot', 'Taste of Blood', 'Sudden Impact'], ['Sixth Sense', 'Grisly Mementos', 'Deep Ward'], ['Treasure Hunter', 'Relentless Hunter', 'Ultimate Hunter']],
  Sorcery: [['Summon Aery', 'Arcane Comet', "Stormraider's Surge", 'Deathfire Touch'], ['Axiom Arcanist', 'Manaflow Band', 'Nimbus Cloak'], ['Transcendence', 'Celerity', 'Absolute Focus'], ['Scorch', 'Waterwalking', 'Gathering Storm']],
  Resolve: [['Grasp of the Undying', 'Aftershock', 'Guardian'], ['Demolish', 'Font of Life', 'Shield Bash'], ['Conditioning', 'Second Wind', 'Bone Plating'], ['Overgrowth', 'Revitalize', 'Unflinching']],
  Inspiration: [['Glacial Augment', 'Unsealed Spellbook', 'First Strike'], ['Hextech Flashtraption', 'Magical Footwear', 'Cash Back'], ['Triple Tonic', 'Time Warp Tonic', 'Biscuit Delivery'], ['Cosmic Insight', 'Approach Velocity', 'Jack of All Trades']]
};
function runeRowOf(name) {
  for (const t of Object.keys(RUNE_ROWS)) { const i = RUNE_ROWS[t].findIndex(r => r.includes(name)); if (i >= 0) return { tree: t, row: i }; }
  return null;
}
function realBuildOf(c, role) { const r = REAL_BUILDS[c + '|' + role]; return r ? { ks: r[0], pri: r[1], sec: r[2], sh: r[3], sums: r[4], start: r[5], boots: r[6], core: r[7], alt: r[8], fourth: r[9], patch: r[10] } : null; }
const JG_PET = { TK: 'Mosstomper Seedling', TS: 'Mosstomper Seedling', DA: 'Scorchclaw Pup', AA: 'Scorchclaw Pup', SK: 'Scorchclaw Pup' };
const CARRY_ARCH = new Set(['MK', 'MG', 'AA', 'DA', 'MS', 'OH']);
// Aplica la build real com a base abans de la personalització per aquesta partida
const _personalizeBuildBaseW = personalizeBuild;
personalizeBuild = function (adv, c, role, x) {
  const rb = realBuildOf(c, role);
  let a = adv;
  if (rb) {
    const sh = rb.sh.split('·');
    a = { ...adv, keystone: rb.ks, keyWhy: `la més jugada a ${c} ${role} (op.gg Emerald+, ${rb.patch === REAL_BUILDS_PATCH ? 'parc ' + REAL_BUILDS_PATCH.replace('16.', '26.') : 'dades ' + rb.patch.replace('16.', '26.')})`,
      primary: `${TREE_OF[rb.ks] || (runeRowOf(rb.ks) || {}).tree}: ${rb.pri}`, secondary: rb.sec,
      shards: `Ofensiva: ${sh[0]} · Flex: ${sh[1]} · Defensa: ${sh[2]}`,
      start: rb.start, boots: rb.boots + (role === 'Mid' ? ' (o les botes de tier 3 de la quest de mid)' : ''), core: rb.core.slice(), real: rb };
  } else if (role === 'Jg') {
    a = { ...adv, start: `${JG_PET[adv.arch] || 'Gustwalker Hatchling'} + Health Potion` };
  }
  const r = _personalizeBuildBaseW(a, c, role, x);
  return finishBuild(r, a, c, role, x);
};
function finishBuild(r, a, c, role, x) {
  const rb = a.real, out = { ...r };
  // Inici: l'ajust per rival de rang a top es manté; la jungla sempre comença amb mascota
  if (role === 'Jg') out.start = a.start;
  else if (rb && !/rival de línia/.test(r.start || '')) out.start = rb.start;
  if (rb) {
    // Summoners: els més jugats, amb l'alternativa contextual de la plantilla si és diferent
    const ctxS = r.summoners || '', ctxPair = ctxS.replace(/\s*\(.*\)$/, '');
    out.summoners = rb.sums;
    if (role !== 'Jg' && ctxPair && ctxPair !== rb.sums && /\(/.test(ctxS)) out.notes = [...(out.notes || []), `Summoners: ${rb.sums} és el més jugat; valora ${ctxPair} ${ctxS.match(/\(.*\)/)[0]}.`];
  }
  // Jungla: fora els consells de "línia" pensats per a laners
  if (role === 'Jg') {
    out.firstBack = '';
    out.notes = (out.notes || []).filter(n => !/^Primera tornada|aguantes el poke de la línia|tombar torres aviat/.test(n)).map(n => n.replace(/^Rival de línia:/, 'Jungla rival:'));
  }
  // Resistències del core segons el dany rival (només si és clarament d'un tipus)
  try {
    const dealers = (x.enemy || []).filter(e => !['TK', 'TS'].includes((ARCH[e] || {}).code));
    const adN = dealers.filter(e => hasTag(e, 'ad') && !hasTag(e, 'ap')).length, apN = dealers.filter(e => hasTag(e, 'ap') && !hasTag(e, 'ad')).length;
    const ARM = ['Thornmail', 'Frozen Heart', "Randuin's Omen"], MR = ['Force of Nature', 'Kaenic Rookern', 'Spirit Visage', 'Abyssal Mask'];
    const swapTo = apN >= 3 && apN - adN >= 2 ? MR : adN >= 3 && adN - apN >= 2 ? ARM : null, from = swapTo === MR ? ARM : swapTo === ARM ? MR : null;
    if (swapTo && ['TK', 'TS', 'JG', 'AB'].includes(a.arch)) {
      const used = new Set([...(a.core || []), ...(r.order || []).map(o => o.item)]);
      (r.order || []).forEach(o => {
        if (!from.includes(o.item) || !isCoreW(a, o.item)) return;
        const rep = swapTo.find(i => !used.has(i)); if (!rep) return;
        used.add(rep); const old = o.item; o.item = rep; o.why = `${old} canviat per ${rep}: el rival fa sobretot dany ${swapTo === MR ? 'AP' : 'AD'}`;
        a.core = a.core.map(k => k === old ? rep : k);
      });
    }
  } catch (e) {}
  // Ordre de compra: els carries tanquen 2 objectes core abans de desviar-se; màxim 2 situacionals
  const isCore = it => isCoreW(a, it);
  const ord = (r.order || []).filter(o => o.item !== 'Sense desviaments');
  const cores = ord.filter(o => isCore(o.item)), sit = ord.filter(o => !isCore(o.item));
  const clean = o => ({ item: o.item, why: o.why.replace(/^⚠️\s*/, '').replace(/ — compra'l abans del 2n core/, '') });
  const urgent = sit.length && /^⚠️/.test(sit[0].why);
  const carry = CARRY_ARCH.has(a.arch);
  const newOrd = [];
  if (cores[0]) newOrd.push(cores[0]);
  if (carry) {
    if (cores[1]) newOrd.push(cores[1]);
    if (sit[0]) newOrd.push({ ...clean(sit[0]), why: (urgent ? '⚠️ ' : '') + clean(sit[0]).why + (urgent ? ' — just després dels 2 core (si et maten en combo, compra abans el component defensiu)' : '') });
    if (cores[2]) newOrd.push(cores[2]);
  } else {
    if (sit[0] && urgent) newOrd.push({ ...clean(sit[0]), why: '⚠️ ' + clean(sit[0]).why + ' — abans del 2n core' });
    if (cores[1]) newOrd.push(cores[1]);
    if (sit[0] && !urgent) newOrd.push(clean(sit[0]));
    if (cores[2]) newOrd.push(cores[2]);
  }
  if (sit[1]) newOrd.push(clean(sit[1]));
  for (let k = newOrd.length - 1; k >= 0; k--) {
    const parts = String(newOrd[k].item).split(' / ');
    const others = newOrd.filter((_, j) => j !== k).map(o => o.item);
    const left = parts.filter(p => !others.includes(p));
    if (!left.length) newOrd.splice(k, 1); else if (left.length < parts.length) newOrd[k] = { ...newOrd[k], item: left.join(' / ') };
  }
  const extra = sit.slice(2).map(o => o.item);
  if (!sit.length) newOrd.push({ item: rb ? rb.fourth[0] : 'Sense desviaments', why: rb ? `4t objecte més jugat (${rb.fourth.slice(1).join(', ')} també)` : 'cap amenaça clara que justifiqui sortir del core: segueix la plantilla' });
  out.order = newOrd;
  const notes = [...(out.notes || [])];
  if (extra.length) notes.push(`Si la partida s'allarga, també: ${extra.join(', ')}.`);
  if (rb) {
    if (rb.alt && rb.alt.length) notes.push(`Variant habitual: ${rb.alt.join(', ')}.`);
    notes.push(`Base de dades reals: ${REAL_BUILDS_SRC}${rb.patch !== REAL_BUILDS_PATCH ? ' (aquest campió encara mostra dades del ' + rb.patch.replace('16.', '26.') + ')' : ''}.`);
  } else notes.push('Sense dades reals per a aquest campió i rol: plantilla per arquetip (comprova-la a u.gg).');
  if (role === 'Jg') notes.unshift(jgPlanNote(c, x));
  out.notes = notes;
  out.realData = !!rb;
  return out;
}
function isCoreW(a, it) { const n = v => String(v).split(' (')[0].trim(); return (a.core || []).some(k => n(k) === n(it)); }
function jgPlanNote(c, x) {
  try {
    const info = enemyRoleInfo();
    const our = getAssignment(), lanes = ['Top', 'Mid', 'Bot'];
    const opp = r => { const i = ROLE_ORDER.indexOf(r), e = info.champs.map(z => ({ z, p: info.dist[z][i] })).sort((a, b) => b.p - a.p)[0]; return e && e.p >= 0.4 ? e.z : null; };
    const gankable = lanes.map(r => {
      const ally = our.roleChamp[ROLE_ORDER.indexOf(r)], e = opp(r);
      if (!ally || !e) return null;
      let s = 0; if (!hasTag(e, 'mob')) s += 2; if (hasTag(ally, 'eng') || hasTag(ally, 'combo')) s += 1.5; if (hasTag(ally, 'early')) s += 1; if (r === 'Bot' && our.roleChamp[4] && hasTag(our.roleChamp[4], 'eng')) s += 1.5;
      const m = muScore(ally, e); if (m.adv > 0) s += 1;
      return { r, e, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s);
    if (!gankable.length) return 'Ruta: comença pel costat de la línia amb més prioritat i juga al voltant del primer objectiu.';
    const g = gankable[0], other = g.r === 'Top' ? 'Bot' : 'Top';
    return `Ruta: full clear acabant a ${g.r} (gank nivell 3-4 contra ${g.e}${hasTag(g.e, 'mob') ? '' : ', que no té escapament'}); després controla el costat ${g.r === 'Top' ? 'de Grubs' : 'del Drac'} i no regalis l'altre (${other}) sense visió.`;
  } catch (e) { return ''; }
}

// ===== Pla de partida detallat =====
function wNames(list) { return list.length ? list.join(', ') : '—'; }
function compIdentity(P) {
  if (!P.n) return { id: 'pendent', txt: 'pendent' };
  const s = [['engage', P.eng * 1.2 + P.combo], ['pick', (P.assn + P.dive) * 0.8 + (P.eng && P.mob ? 0.5 : 0)], ['protegir el carry', P.peel * 1.1 + (P.scale && P.rng ? 0.5 : 0)], ['poke i setge', P.poke * 1.3], ['split', P.split * 1.2]].sort((a, b) => b[1] - a[1]);
  return { id: s[0][0], second: s[1][1] >= 2 ? s[1][0] : null };
}
function engagersOf(lanes) {
  const pr = { Sup: 0, Jg: 1, Top: 2, Mid: 3, Bot: 4 };
  return lanes.filter(l => l.champ && hasTag(l.champ, 'eng')).sort((a, b) => (hasTag(b.champ, 'front') - hasTag(a.champ, 'front')) || pr[a.role] - pr[b.role]).map(l => l.champ);
}
function mainCarry(lanes) {
  const score = l => !l.champ ? -9 : (hasTag(l.champ, 'scale') ? 2 : 0) + (hasTag(l.champ, 'rng') ? 1.5 : 0) + (l.role === 'Bot' ? 1.5 : l.role === 'Mid' ? 1 : 0) - (hasTag(l.champ, 'front') ? 3 : 0) - (l.role === 'Sup' ? 4 : 0);
  return lanes.slice().sort((a, b) => score(b) - score(a))[0];
}
function enemyCarry(list) {
  let info = null; try { info = enemyRoleInfo(); } catch (e) {}
  const roleW = c => info && info.dist && info.dist[c] ? info.dist[c][3] * 2 + info.dist[c][2] * 1 : 0;
  const sc = c => roleW(c) + (hasTag(c, 'scale') ? 2 : 0) + (hasTag(c, 'rng') ? 1.5 : 0) - (hasTag(c, 'front') ? 3 : 0) + (hasTag(c, 'assn') ? 0.5 : 0) - (['TS', 'EN'].includes((ARCH[c] || {}).code) ? 3 : 0);
  return list.slice().sort((a, b) => sc(b) - sc(a))[0];
}
function threatAdvice(e, s, carry) {
  const A = s.A, ours = s.lanes.filter(l => l.champ);
  const peelers = ours.filter(l => hasTag(l.champ, 'peel')).map(l => l.champ);
  const engagers = ours.filter(l => hasTag(l.champ, 'eng')).map(l => l.champ);
  const c = carry && carry.champ;
  const out = [];
  if (hasTag(e, 'assn')) out.push(`assassí: ${c ? c + ' ha de jugar darrere la frontline i amb Flash disponible' : 'el carry no pot anar sol'}; ${peelers.length ? peelers.join('/') + ' guarda el CC per quan entri' : 'sense peel: ward als flancs i agrupeu-vos'}. Si apareix a una línia sense visió, retireu-vos.`);
  else if (hasTag(e, 'dive')) out.push(`dive: no us separeu del grup; ${peelers.length ? peelers.join('/') + ' el castiga quan salti' : 'feu-li focus quan entri, no abans'}.`);
  if (hasTag(e, 'eng')) out.push(`engage: respecteu-ne el rang i no us agrupeu en passadissos estrets; ${engagers.length ? 'si falla la iniciació, ' + engagers.join('/') + ' contraataca' : 'castigueu-lo quan hagi gastat la iniciació'}.`);
  if (hasTag(e, 'poke')) out.push(`poke: no seieu a l'objectiu esperant; ${engagers.length ? 'forceu la lluita amb ' + engagers.join('/') + ' abans que us desgasti' : 'netegeu l\'onada i rotau abans que us desgasti'}.`);
  if (hasTag(e, 'split')) out.push(`split: ${ours.find(l => l.role === 'Top') ? ours.find(l => l.role === 'Top').champ + ' el contesta a la línia lateral' : 'responeu-hi amb un sol jugador'} mentre els altres 4 forcen un objectiu al costat contrari.`);
  if (hasTag(e, 'scale') && !hasTag(e, 'front')) out.push(`escala: cada minut el fa més perillós; treu-li or amb ganks i invasions abans dels seus 3 objectes.`);
  if (hasTag(e, 'front') && !out.length) out.push(`frontline: no gasteu els cooldowns en ell; esquiveu-lo i aneu al dany del darrere.`);
  if (!out.length) out.push('vigileu-ne els timings forts i jugueu al voltant del seu cooldown principal.');
  return out.join(' ').replace(/\.+$/, '');
}
function objectivePlan(s) {
  const L = Object.fromEntries(s.lanes.map(l => [l.role, l]));
  const v = r => L[r] ? L[r].verdict : 'unknown', pts = r => v(r) === 'good' ? 1 : v(r) === 'bad' ? -1 : 0;
  const bot = pts('Bot') + pts('Sup') * 0.5 + pts('Mid') * 0.5, top = pts('Top') + pts('Mid') * 0.5;
  const scaleDiff = s.A.scale - s.B.scale, earlyDiff = s.A.early - s.B.early;
  const items = [];
  if (bot > top + 0.4) items.push('Prioritat al costat del Drac: la vostra línia inferior guanya; el jungla comença dalt i acaba a baix per arribar al primer Drac (5:00) amb prioritat. Cediu els Grubs si cal.');
  else if (top > bot + 0.4) items.push('Prioritat al costat de Grubs/Herald: el top guanya; jugueu els Grubs (8:00) i el Herald (15:00) i cediu el primer Drac si el bot no té prioritat.');
  else items.push('Cap costat clarament guanyador: decideix el jungla segons on hi hagi prioritat a cada moment; no forceu objectius en desavantatge numèric.');
  if (scaleDiff >= 1) items.push('Dracs: jugueu per l\'ànima a llarg termini; no cal guanyar cada Drac early si us costa morts.');
  else if (scaleDiff <= -1) items.push('Dracs i torres: necessiteu convertir cada avantatge en estructures abans del 25:00; el Baró (20:00) és el vostre objectiu per tancar.');
  if (earlyDiff >= 1) items.push('Invasió o contra-jungla possible al nivell 1-3 si les línies us acompanyen (més early que ells).');
  if (earlyDiff <= -1) items.push('No inicieu baralles de nivell 1-3: ward a la jungla pròpia i jugueu a contrarestar el jungla rival.');
  return items;
}
function teamfightPlan(s) {
  const lanes = s.lanes.filter(l => l.champ), B = s.B;
  const carry = mainCarry(s.lanes), eCarry = enemyCarry(B.list);
  const eng = engagersOf(lanes);
  const follow = lanes.filter(l => hasTag(l.champ, 'combo') && !eng.includes(l.champ)).map(l => l.champ);
  const peel = lanes.filter(l => hasTag(l.champ, 'peel')).map(l => l.champ);
  const diveUs = lanes.filter(l => hasTag(l.champ, 'dive') || hasTag(l.champ, 'assn')).map(l => l.champ);
  const front = lanes.filter(l => hasTag(l.champ, 'front')).map(l => l.champ);
  const eFront = B.list.filter(c => hasTag(c, 'front')), eThreat = B.list.filter(c => hasTag(c, 'assn') || hasTag(c, 'dive'));
  const id = compIdentity(s.A), eid = compIdentity(B);
  const pts = [];
  const de = x => (/^[aeiouh]/i.test(x) ? "d'" : 'de ') + x;
  pts.push(`Identitat: la vostra comp és ${de(id.id)}${id.second ? ' (amb opció ' + de(id.second) + ')' : ''}; la rival és ${de(eid.id)}${eid.second ? ' (i ' + eid.second + ')' : ''}.`);
  if (eng.length) pts.push(`Qui inicia: ${eng.slice(0, 2).join(' o ')}${eng.length > 2 ? ' (' + eng.slice(2).join('/') + ' encadenen el CC després)' : ''}${follow.length ? ', i ' + follow.join('/') + ' segueix amb el dany en àrea' : ''}. Inicieu quan ${eCarry ? eCarry : 'el seu carry'} estigui a l'abast o quan hagin gastat Flash.`);
  else pts.push(`No teniu iniciació clara: lluiteu a la defensiva, deixeu que entrin ells i contraataqueu${peel.length ? ' amb el peel de ' + peel.join('/') : ''}.`);
  if (carry && carry.champ) pts.push(`El vostre carry és ${carry.champ}: ${front.length ? 'juga darrere ' + front.join('/') : 'sense frontline, juga al límit del rang'}${peel.length ? ' i ' + peel.join('/') + ' es queda al seu costat' : ''}. Si mor ell, la lluita està perduda: no el feu entrar primer.`);
  if (eCarry) {
    const reach = diveUs.length || eFront.length === 0;
    pts.push(`Focus: ${reach ? `${eCarry} és l'objectiu (${diveUs.length ? diveUs.join('/') + ' hi pot arribar' : 'no té frontline que el tapi'})` : `pegueu al que tingueu més a prop (${eFront.join('/')} fan de mur); ${eCarry} només si queda exposat`}.`);
  }
  if (eThreat.length) pts.push(`Amenaça al vostre backline: ${eThreat.join(', ')}. Guardeu ${peel.length ? 'el CC de ' + peel.join('/') : 'Flash i el CC'} per quan entrin, no per iniciar.`);
  if (s.A.front - B.front >= 2) pts.push('Teniu més frontline: lluites llargues front-to-back us afavoreixen.');
  else if (B.front - s.A.front >= 2) pts.push('Ells tenen més frontline: eviteu lluites llargues de cara; busqueu flancs, picks o lluitar quan el seu tanc no hi sigui.');
  return pts;
}
function laneDetail(l, s) {
  if (!l.champ) return null;
  const info = enemyRoleInfo(), i = ROLE_ORDER.indexOf(l.role);
  const opps = info.champs.map(e => ({ e, p: info.dist[e][i] })).filter(x => x.p >= 0.3).sort((a, b) => b.p - a.p);
  const bits = [];
  if (l.role === 'Jg') {
    const ej = opps[0] && opps[0].e;
    bits.push(ej ? `${ej} és el jungla rival${hasTag(ej, 'early') ? ' (fort early: no l\'enfrontis als nivells 2-4 sense línies amb prioritat)' : ''}${!hasTag(ej, 'early') && hasTag(l.champ, 'early') ? '; tu ets més fort early: invadeix si les línies t\'acompanyen' : ''}.` : 'Jungla rival per confirmar.');
    if (l.build && l.build.notes && /^Ruta:/.test(l.build.notes[0])) bits.push(l.build.notes[0]);
  } else opps.slice(0, 2).forEach(o => {
    const m = muScore(l.champ, o.e);
    const pre = opps.length > 1 ? `Si et toca ${o.e}: ` : `Contra ${o.e}: `;
    let t = m.real ? `${m.wr}% de victòries en ${m.g} partides reals` : m.adv !== 0 ? 'sense prou partides reals; segons les llistes de counters' : 'sense dades del matchup';
    t += m.adv >= 2 ? ' — favorable: juga agressiu als nivells 2-3 i força el teu pic.' : m.adv <= -2 ? ' — difícil: farmeja segur, demana visió i espera el jungla o el teu pic d\'objectes.' : ' — igualat: el control d\'onades i el jungla decideixen.';
    if (m.adv < 2 && hasTag(o.e, 'early') && !hasTag(l.champ, 'early')) t += ` ${o.e} és fort early: no acceptis intercanvis llargs fins al teu primer objecte.`;
    if (m.adv > -2 && hasTag(l.champ, 'early') && !hasTag(o.e, 'early')) t += ` Tu ets més fort early: castiga'l abans que escali.`;
    bits.push(pre + t);
  });
  const b = l.build;
  if (b && b.order && b.order[0]) bits.push(`Pic de poder: ${b.order[0].item}${b.order[1] ? ' + ' + b.order[1].item : ''}.`);
  return bits.join(' ');
}
function roleJob(l, s, carry, eng) {
  const c = l.champ; if (!c) return '';
  if (carry && l === carry) return 'Teamfight: ets el dany principal; posa\'t on puguis pegar sense ser el primer objectiu.';
  if (hasTag(c, 'eng') && eng && eng.indexOf(c) >= 2) return `Teamfight: no inicies tu; encadena el teu CC just després de ${eng.slice(0, 2).join(' o ')}.`;
  if (hasTag(c, 'eng')) return 'Teamfight: tu decideixes quan es lluita; comunica abans d\'iniciar (cooldowns i Flash rivals).';
  if (hasTag(c, 'peel')) return `Teamfight: queda't amb ${carry && carry.champ ? carry.champ : 'el carry'} i fes servir el CC contra qui l'ataqui.`;
  if (hasTag(c, 'assn') || hasTag(c, 'dive')) return `Teamfight: entra després de l'iniciació, pel flanc, i busca ${enemyCarry(s.B.list) || 'el seu carry'}.`;
  if (hasTag(c, 'split')) return 'Mid game: pressiona la línia lateral i només uneix-te a la lluita amb TP o quan l\'objectiu estigui decidit.';
  if (hasTag(c, 'front')) return 'Teamfight: fes de mur davant el teu carry i absorbeix els cooldowns rivals.';
  return 'Teamfight: segueix l\'iniciació i aporta el dany des de la segona línia.';
}
// Frase de la comp de referència només si no anomena campions que no teniu
function onlyOurChamps(t, ours) {
  if (!t) return '';
  const esc = c => c.replace(/[.*+?^${}()|[\]\\']/g, '.');
  return String(t).split(/(?<=\.)\s+/).filter(sen => !ALL_CHAMPS.some(c => c.length > 2 && !ours.has(c) && new RegExp('\\b' + esc(c) + '\\b').test(sen))).join(' ');
}
function compLineFor(s, l) {
  return onlyOurChamps((s.comp.plan.individual || {})[l.role] || '', new Set(s.lanes.map(z => z.champ).filter(Boolean)));
}
function groupedThreats(s, carry) {
  const by = new Map();
  s.B.list.forEach(e => { const t = threatAdvice(e, s, carry); if (!by.has(t)) by.set(t, []); by.get(t).push(e); });
  const score = list => list.reduce((a, e) => a + (hasTag(e, 'assn') ? 3 : 0) + (hasTag(e, 'eng') ? 2 : 0) + (hasTag(e, 'dive') ? 2 : 0) + (hasTag(e, 'poke') ? 1 : 0) + (hasTag(e, 'scale') ? 1 : 0), 0);
  return [...by.entries()].sort((a, b) => score(b[1]) - score(a[1])).map(([t, list]) => ({ champ: list.join(', '), txt: escapeHtml(t) }));
}
const _buildStrategyBaseW = buildStrategy;
buildStrategy = function () {
  const s = _buildStrategyBaseW();
  try {
    const carry = mainCarry(s.lanes);
    s.deep = { tf: teamfightPlan(s), obj: objectivePlan(s), lanes: s.lanes.map(l => ({ l, txt: laneDetail(l, s), job: roleJob(l, s, carry, engagersOf(s.lanes)) })).filter(x => x.txt), carry };
    s.threats = groupedThreats(s, carry);
    const ours = new Set(s.lanes.map(z => z.champ).filter(Boolean));
    const pl = s.comp.plan || {};
    s.comp = { ...s.comp, plan: { ...pl, early: onlyOurChamps(pl.early, ours) || '—', mid: onlyOurChamps(pl.mid, ours) || '—', late: onlyOurChamps(pl.late, ours) || '—' } };
    s.individual = s.lanes.map(l => {
      const d = s.deep.lanes.find(x => x.l === l);
      return { role: l.role, lane: l, text: [d ? d.txt : '', d ? d.job : '', compLineFor(s, l)].filter(Boolean).join(' ') };
    });
  } catch (e) { console.warn('deepPlan', e); }
  return s;
};
function deepPlanHtml(s) {
  if (!s.deep) return '';
  return `<div class="strat-card" style="grid-column: 1 / -1;">
    <h4>📋 Com jugar aquesta partida</h4>
    <div class="dp-grid">
      <div><strong>Teamfights</strong><ul>${s.deep.tf.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
      <div><strong>Objectius</strong><ul>${s.deep.obj.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
    </div>
    <p class="dp-src">Els winrates de línia són de partides reals (Metabot, Emerald+). La resta són regles a partir de les etiquetes dels campions; feu-les servir com a punt de partida, no com a veritat absoluta.</p>
  </div>`;
}
const _generateStrategyBaseW = generateStrategy;
generateStrategy = function () {
  _generateStrategyBaseW();
  try {
    const s = buildStrategy(), el = document.getElementById('strategyContent');
    if (!el || !s.deep) return;
    const cards = el.querySelectorAll('.strat-card');
    const anchor = Array.from(cards).find(c => /Pla per fases/.test(c.textContent));
    const tmp = document.createElement('div'); tmp.innerHTML = deepPlanHtml(s);
    if (anchor && tmp.firstElementChild) anchor.insertAdjacentElement('afterend', tmp.firstElementChild);
  } catch (e) { console.warn('deepPlanHtml', e); }
};
const _copyDiscordPlanBaseW = typeof copyDiscordPlan === 'function' ? copyDiscordPlan : null;
(function wStyles() {
  const css = `.dp-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; font-size:0.8rem; }
  .dp-grid ul { margin:4px 0 0 18px; padding:0; line-height:1.45; }
  .dp-grid li { margin-bottom:4px; }
  .dp-src { color:var(--text-muted); font-size:0.72rem; margin-top:6px; }
  @media (max-width: 700px) { .dp-grid { grid-template-columns:1fr; } }`;
  try { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();
