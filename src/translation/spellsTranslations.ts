export const spellTranslations = {
  en: {
    // CANTRIPS
    spell_iguinis: "Iguinis",
    spell_iguinis_description: "Launch a burst of magical fire at an enemy.",

    spell_acid_throw: "Acid Throw",
    spell_acid_throw_description:
      "Hurl an acid bubble that explodes upon contact with the enemy, applying {condition:acid}.",

    spell_frosting_legs: "Frosting Legs",
    spell_frosting_legs_description:
      "Cast a magical snow cloud around the enemy's legs, causing them to suffer from {condition:freezed} and take damage.",

    spell_multi_missiles: "Multi Missiles",
    spell_multi_missiles_description:
      "Invoke a barrage of missiles that will hit the focused enemy. The remaining missiles will hit other enemies within a 3m radius of the main target.",

    spell_poison_gas: "Poison Gas",
    spell_poison_gas_description:
      "Create a cloud of poisonous gas at the enemy's position, causing them to take damage and suffer from {condition:poisoned}.",

    spell_blessing_from_the_dead: "Blessing From The Dead",
    spell_blessing_from_the_dead_description:
      "Receive the blessing of the dead and hurl this spell at an enemy, dealing damage and leaving them {condition:cursed}.",

    spell_get_over_here: "Get Over Here",
    spell_get_over_here_description:
      "Pull the enemy toward you by up to 10m, damaging them in the process.{condition:pulled}",

    spell_shadow_bolt: "Shadow Bolt",
    spell_shadow_bolt_description:
      "Concentrate on a colorless bolt and launch it at the enemy. If they have any {tooltip:condition}, deal 25% additional damage.",

    // SUPPORT Cantrips

    spell_on_the_dot: "On The Dot",
    spell_on_the_dot_description:
      "Concentrate on your target's movements, making your {tooltip:precision} 25% better against them.",

    spell_tank_that: "Tank That",
    spell_tank_that_description:
      "Encourage your companion or yourself to withstand incoming damage. For 3 turns, gain +5 {tooltip:armor} and +5 {tooltip:magic_resistance}.",

    spell_helping_hand: "Helping Hand",
    spell_helping_hand_description:
      "Give yourself or an ally an additional 1 {tooltip:dice}4 on their next roll.",

    //SPELLS LVL 1

    spell_burning_ray: "Burning Ray",
    spell_burning_ray_description:
      "Shine a powerful ray at a 3m circular area, dealing damage and making affected enemies {condition:burning}.",

    spell_ice_shard: "Ice Shard",
    spell_ice_shard_description:
      "Throw a giant spike of ice at the target, causing them to be {condition:pushed} 4m and making them {condition:slowed} for 3 rounds.",

    spell_hand_pistol_gun: "Hand Pistol Gun",
    spell_hand_pistol_gun_description:
      "Fire magical projectiles at up to three enemies.",

    spell_lightning_arc: "Lightning Arc",
    spell_lightning_arc_description:
      "Strike an enemy with a powerful arc of lightning, then have the lightning jump to another nearby enemy. Each jump can continue to another enemy, allowing the lightning to chain between multiple targets.",

    spell_blood_thirster: "Blood Thirster",
    spell_blood_thirster_description:
      "Invoke a mist that hungers for blood, dealing heavy damage. If the target's HP is below the required threshold, the spike deals additional damage.",

    spell_earth_spike: "Earth Spike",
    spell_earth_spike_description:
      "Summon a massive spike of earth beneath an enemy, dealing damage and applying {condition:armor-penetration}, allowing the attack to ignore part of the target's {tooltip:armor}.",

    spell_radiant_bolt: "Radiant Bolt",
    spell_radiant_bolt_description:
      "Fire a powerful bolt of radiant energy at an enemy, dealing magic damage. The bolt deals additional damage against {race:undead}.",

    spell_detect_magic: "Detect Magic",
    spell_detect_magic_description:
      "Sense magical effects, objects, and creatures within the spell's range that can use magic. Roll 1{tooltip:dice}20 to determine how many magical things are revealed. The Master determines which ones are revealed.",

    spell_telepathy: "Telepathy",
    spell_telepathy_description:
      "Establish mental communication with a creature within range. The spell has no automated gameplay effect. The Master determines how the communication works. Roll 1{tooltip:dice}20 to determine how the communication goes.",

    spell_pink: "pink",
    spell_pink_description:
      "Create a magical trinket around an area. Reveal enemies that move inside its range even in fog of war or that were hidden. Enemies can destroy it making everything in its range clear of fog of war and reveling everyone hidden or enemies can try to defuse by rolling the die",

    spell_contact_spirits: "Contact Spirits",
    spell_contact_spirits_description:
      "Summon a spirit to answer one question. This spell has no automated gameplay effect. Ask the Master how the spirit responds based on a 1{tooltip:dice}20 roll.",

    spell_charm_person: "Charm Person",
    spell_charm_person_description:
      "Charm a person you touch, making them consider you a friend. The spell does not work on animals or monsters. The effect ends if the target takes damage, if the Master determines that you have proven yourself to be an enemy or caster enters combat(Cannot be used in combat).",

    spell_entangle: "Entangle",
    spell_entangle_description:
      "Spawn a field of vines that feeds on magic, ensnaring creatures caught within it. Creatures affected by the vines are {condition:silenced} and {condition:slowed}.",

    spell_moonbeam: "Moonbeam",
    spell_moonbeam_description:
      "Create a field of moonlight that damages all creatures within it and lulls them into a deep sleep.Everyone in the area falls into {condition:sleeping}",

    spell_goodberry: "Goodberry",
    spell_goodberry_description:
      "Create magical berries infused with restorative energy. A creature can consume a berry to restore a small amount of HP.",

    spell_speak_with_animals: "Speak With Animals",
    spell_speak_with_animals_description:
      "Gain the ability to communicate with beasts. The Master determines what the beast understands, what it can communicate, and how it responds.",

    spell_fog_cloud: "Fog Cloud",
    spell_fog_cloud_description:
      "Create a dense cloud of fog that obscures vision within the area, making it impossible to see through the fog.",

    spell_longstrider: "Longstrider",
    spell_longstrider_description:
      "Increase a creature's movement speed by 7m.",

    spell_wild_shape: "Wild Shape",
    spell_wild_shape_description:
      "Transform yourself into a beast, gaining its physical traits, abilities, and attacks.",

    spell_smoke_bomb: "Smoke Bomb",
    spell_smoke_bomb_description:
      "Throw a smoke bomb that creates a dense cloud of smoke, obscuring vision within the area.",

    spell_dissonant_whispers: "Dissonant Whispers",
    spell_dissonant_whispers_description:
      "Whisper unsettling words into a creature's mind, dealing magic damage and leaving it frightened.",

    spell_vicious_mockery: "Vicious Mockery",
    spell_vicious_mockery_description:
      "Unleash a string of insults that deals magic damage and disrupts the target's next attack.",

    spell_healing_word: "Healing Word",
    spell_healing_word_description:
      "Speak a healing word to restore the target's vitality.",

    spell_hunters_mark: "Hunter's Mark",
    spell_hunters_mark_description:
      "Mark a creature as your quarry. Your attacks against the marked target deal additional damage.",

    spell_piercing_shot: "Piercing Shot",
    spell_piercing_shot_description:
      "Your next attack pierces through armor, ignoring 5 points of the target's armor.",

    spell_second_wind: "Second Wind",
    spell_second_wind_description:
      "Regain 1d10 + your Fighter level hit points.",

    spell_action_surge: "Action Surge",
    spell_action_surge_description: "Gain one additional action this turn.",

    spell_rage: "Rage",
    spell_rage_description:
      "Enter a furious rage, dealing additional damage with your attacks.",

    spell_reckless_attack: "Reckless Attack",
    spell_reckless_attack_description:
      "Your next attack is made with advantage.",
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  pt: {
    // CANTRIPS
    spell_iguinis: "Iguinis",
    spell_iguinis_description:
      "Lance uma explosão de fogo mágico contra um inimigo.",

    spell_acid_throw: "Arremesso Ácido",
    spell_acid_throw_description:
      "Arremesse uma bolha de ácido que explode ao entrar em contato com o inimigo, aplicando {condition:acid}.",

    spell_frosting_legs: "Pernas Congelantes",
    spell_frosting_legs_description:
      "Conjure uma nuvem de neve mágica ao redor das pernas do inimigo, fazendo com que ele sofra {condition:freezed} e receba dano.",

    spell_multi_missiles: "Múltiplos Mísseis",
    spell_multi_missiles_description:
      "Invoque uma saraivada de mísseis que atingirá o inimigo principal. Os mísseis restantes atingirão outros inimigos em um raio de 3 m ao redor do alvo principal.",

    spell_poison_gas: "Gás Venenoso",
    spell_poison_gas_description:
      "Crie uma nuvem de gás venenoso na posição do inimigo, fazendo com que ele receba dano e sofra {condition:poisoned}.",

    spell_blessing_from_the_dead: "Bênção dos Mortos",
    spell_blessing_from_the_dead_description:
      "Receba a bênção dos mortos e lance este feitiço contra um inimigo, causando dano e deixando-o {condition:cursed}.",

    spell_get_over_here: "Venha Aqui",
    spell_get_over_here_description:
      "Puxe o inimigo em sua direção por até 10 m, causando dano durante o processo e deixando-o {condition:pulled}.",

    spell_shadow_bolt: "Raio Sombrio",
    spell_shadow_bolt_description:
      "Concentre-se em um raio incolor e lance-o contra o inimigo. Se ele possuir qualquer {tooltip:condition}, cause 25% de dano adicional.",

    // CANTRIPS DE SUPORTE

    spell_on_the_dot: "Na Mosca",
    spell_on_the_dot_description:
      "Concentre-se nos movimentos do seu alvo, aumentando sua {tooltip:precision} em 25% contra ele.",

    spell_tank_that: "Aguente Essa",
    spell_tank_that_description:
      "Incentive seu companheiro ou você mesmo a resistir ao dano recebido. Por 3 turnos, ganhe +5 de {tooltip:armor} e +5 de {tooltip:magic_resistance}.",

    spell_helping_hand: "Mão Amiga",
    spell_helping_hand_description:
      "Conceda a você ou a um aliado 1{tooltip:dice}4 adicional na próxima rolagem.",

    // SPELLS LVL 1

    spell_burning_ray: "Raio Flamejante",
    spell_burning_ray_description:
      "Lance um poderoso raio em uma área circular de 3 m, causando dano e deixando os inimigos afetados {condition:burning}.",

    spell_ice_shard: "Fragmento de Gelo",
    spell_ice_shard_description:
      "Arremesse um enorme fragmento de gelo contra o alvo, fazendo com que ele seja {condition:pushed} por 4 m e fique {condition:slowed} por 3 rodadas.",

    spell_hand_pistol_gun: "Pistola de Mão",
    spell_hand_pistol_gun_description:
      "Dispare projéteis mágicos contra até três inimigos.",

    spell_lightning_arc: "Arco de Relâmpago",
    spell_lightning_arc_description:
      "Acerte um inimigo com um poderoso arco de relâmpago, fazendo com que o raio salte para outro inimigo próximo. Cada salto pode continuar para outro inimigo, permitindo que o relâmpago atinja vários alvos em sequência.",

    spell_blood_thirster: "Sede de Sangue",
    spell_blood_thirster_description:
      "Invoque uma névoa sedenta por sangue, causando dano elevado. Se o HP do alvo estiver abaixo do limite necessário, a névoa causará dano adicional.",

    spell_earth_spike: "Espinho de Terra",
    spell_earth_spike_description:
      "Conjure um enorme espinho de terra sob um inimigo, causando dano e aplicando {condition:armor-penetration}, permitindo que o ataque ignore parte da {tooltip:armor} do alvo.",

    spell_radiant_bolt: "Raio Radiante",
    spell_radiant_bolt_description:
      "Dispare um poderoso raio de energia radiante contra um inimigo, causando dano mágico. O raio causa dano adicional contra certos tipos de criaturas.",

    spell_detect_magic: "Detectar Magia",
    spell_detect_magic_description:
      "Sinta efeitos mágicos, objetos e criaturas dentro do alcance da magia que sejam capazes de usar magia. Role 1{tooltip:dice}20 para determinar quantas coisas mágicas são reveladas. O Mestre determina quais delas são reveladas.",

    spell_telepathy: "Telepatia",
    spell_telepathy_description:
      "Estabeleça uma comunicação mental com uma criatura dentro do alcance. A magia não possui efeito automatizado no jogo. O Mestre determina como a comunicação funciona. Role 1{tooltip:dice}20 para determinar como a comunicação acontece.",

    spell_pink: "Sentinela Mágica",
    spell_pink_description:
      "Crie uma sentinela mágica ao redor de uma área. Revele todos os inimigos que se movem dentro de seu alcance mesmo dentro da névoa de guerra ou que estejam escondidos.Inimigos podem destruir-la o que resulta nela limpando a névoa de guerra dentro de sua área e revelando os que estavam escondidos ou podem tentar desativar-la rodando o dado ",
    spell_contact_spirits: "Contatar Espíritos",
    spell_contact_spirits_description:
      "Invoque um espírito para responder a uma pergunta. A magia não possui efeito automatizado no jogo. Pergunte ao Mestre como o espírito responde com base em uma rolagem de 1{tooltip:dice}20.",

    spell_charm_person: "Encantar Pessoa",
    spell_charm_person_description:
      "Encante uma pessoa que você tocar, fazendo com que ela considere você um amigo. A magia não funciona em animais ou monstros. O efeito termina se o alvo sofrer dano ou se o Mestre determinar que você provou ser um inimigo.",

    spell_entangle: "Enredar",
    spell_entangle_description:
      "Crie um campo de vinhas que se alimentam de magia, enredando as criaturas que forem pegas nele. As criaturas afetadas pelas vinhas ficam {condition:silenced} e {condition:slowed}.",

    spell_moonbeam: "Raio Lunar",
    spell_moonbeam_description:
      "Crie um campo de luar que causa dano a todas as criaturas dentro dele e as faz cair em um sono profundo.Pessoas dentro da habilidade sofrem {condition:sleeping}",

    spell_goodberry: "Boa Fruta",
    spell_goodberry_description:
      "Crie frutas mágicas imbuídas de energia restauradora. Uma criatura pode consumir uma fruta para recuperar uma pequena quantidade de HP.",

    spell_speak_with_animals: "Falar com Animais",
    spell_speak_with_animals_description:
      "Obtenha a capacidade de se comunicar com feras. O Mestre determina o que a fera compreende, o que ela pode comunicar e como ela responde.",

    spell_fog_cloud: "Nuvem de Névoa",
    spell_fog_cloud_description:
      "Crie uma densa nuvem de névoa que obscurece a visão dentro da área, tornando impossível enxergar através da névoa.",

    spell_longstrider: "Passos Longos",
    spell_longstrider_description:
      "Aumente o deslocamento de uma criatura em 7m.",

    spell_wild_shape: "Forma Selvagem",
    spell_wild_shape_description:
      "Transforme-se em uma fera, assumindo seus atributos físicos, habilidades e ataques.",

    spell_smoke_bomb: "Bomba de Fumaça",
    spell_smoke_bomb_description:
      "Jogue uma bomba de fumaça que cria uma densa nuvem de fumaça, obscurecendo a visão dentro da área.",

    spell_dissonant_whispers: "Sussurros Dissonantes",
    spell_dissonant_whispers_description:
      "Sussurre palavras perturbadoras na mente de uma criatura, causando dano mágico e deixando-a amedrontada.",

    spell_vicious_mockery: "Escárnio Vicioso",
    spell_vicious_mockery_description:
      "Lance uma sequência de insultos que causa dano mágico e atrapalha o próximo ataque do alvo.",

    spell_healing_word: "Palavra Curativa",
    spell_healing_word_description:
      "Pronuncie uma palavra de cura para restaurar a vitalidade do alvo.",

    spell_hunters_mark: "Marca do Caçador",
    spell_hunters_mark_description:
      "Marque uma criatura como sua presa. Seus ataques contra o alvo marcado causam dano adicional.",

    spell_piercing_shot: "Disparo Perfurante",
    spell_piercing_shot_description:
      "Seu próximo ataque perfura a armadura, ignorando 5 pontos da armadura do alvo.",

    spell_second_wind: "Segundo Fôlego",
    spell_second_wind_description:
      "Recupere 1d10 + seu nível de Guerreiro em pontos de vida.",

    spell_action_surge: "Surto de Ação",
    spell_action_surge_description: "Ganhe uma ação adicional neste turno.",

    spell_rage: "Fúria",
    spell_rage_description:
      "Entre em uma fúria, causando dano adicional com seus ataques.",

    spell_reckless_attack: "Ataque Imprudente",
    spell_reckless_attack_description:
      "Seu próximo ataque é feito com vantagem.",
  },
};
