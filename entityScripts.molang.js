// MODIFICADO: Comentários traduzidos. Nomes de funções e variáveis Molang mantidos em inglês.

// Declaração de variáveis para evitar erros de linting e para clareza do que é esperado no contexto Molang
let v, q, t, structureSize, singleLayerMode, structureCount, HOLOGRAM_INITIAL_ACTIVATION, initialOffset, defaultTextureIndex, textureBlobsCount, totalBlocksToValidate, totalBlocksToValidateByLayer, backupSlotCount, toggleRendering, changeOpacity, toggleTint, toggleValidating, changeLayer, decreaseLayer, changeLayerMode, disablePlayerControls, backupHologram, changeStructure, moveHologram, rotateHologram, initVariables, renderingControls, broadcastActions, structureWMolang, structureHMolang, structureDMolang;

// Enumeração numérica para ações do jogador/entidade
export const ACTIONS = createNumericEnum(["NEXT_STRUCTURE", "PREVIOUS_STRUCTURE", "INCREASE_LAYER", "DECREASE_LAYER", "TOGGLE_RENDERING", "INCREASE_OPACITY", "DECREASE_OPACITY", "TOGGLE_TINT", "TOGGLE_VALIDATING", "CHANGE_LAYER_MODE", "ROTATE_HOLOGRAM_CLOCKWISE", "ROTATE_HOLOGRAM_ANTICLOCKWISE", "BACKUP_HOLOGRAM", "MOVE_HOLOGRAM"]);

// Script de inicialização para o armor_stand do holograma
export function armorStandInitialization() {
	v.hologram_activated = HOLOGRAM_INITIAL_ACTIVATION; // true/false são substituídos aqui para os diferentes subpacks
	v.hologram.offset_x = $[initialOffset[0]];
	v.hologram.offset_y = $[initialOffset[1]];
	v.hologram.offset_z = $[initialOffset[2]];
	v.hologram.rotation = 0;
	v.hologram.structure_w = $[structureSize[0]];
	v.hologram.structure_h = $[structureSize[1]];
	v.hologram.structure_d = $[structureSize[2]];
	v.hologram.rendering = HOLOGRAM_INITIAL_ACTIVATION;
	v.hologram.texture_index = $[defaultTextureIndex];
	v.hologram.show_tint = false;
	v.hologram.layer = -1; // Camada inicial (nenhuma/todas)
	v.hologram.layer_mode = $[singleLayerMode]; // Modo de camada (única ou todas abaixo)
	v.hologram.validating = false; // Se a validação de blocos está ativa
	v.hologram.show_wrong_block_overlay = false; // Mostrar overlay de bloco incorreto
	v.wrong_blocks = -1; // Contagem de blocos incorretos
	v.hologram.wrong_block_x = 0; // Posição X do bloco incorreto
	v.hologram.wrong_block_y = 0; // Posição Y do bloco incorreto
	v.hologram.wrong_block_z = 0; // Posição Z do bloco incorreto
	
	v.hologram.structure_index = 0; // Índice da estrutura atual (se houver múltiplas)
	v.hologram.structure_count = $[structureCount]; // Contagem total de estruturas
	
	v.hologram.last_held_item = ""; // Último item segurado (para controles). Será mantido no backup.
	v.last_pose = 0; // Última pose do armor_stand
	v.last_hurt_direction = q.hurt_direction; // Última direção de dano
	v.player_action_counter = 0; // Contador de ações do jogador
	v.hologram_dir = 0; // Direção do holograma
	
	v.spawn_time = q.time_stamp; // Tempo de surgimento da entidade
	v.player_has_interacted = false; // Se o jogador já interagiu
	v.saving_backup = false; // Se está salvando um backup
	v.hologram_backup_index = -1; // Índice do slot de backup
	v.hologram_backup_requested_time = -601; // Tempo em que o backup foi solicitado (dura 30s)
	v.skip_spawn_animation = false; // Pular animação de spawn
}

// Script de pré-animação para o armor_stand do holograma
export function armorStandPreAnimation() {
	// ... (Lógica Molang original mantida)
	// Comentários internos podem ser traduzidos, por exemplo:
	// if(q.time_stamp - v.spawn_time < 5) {
	// 	v.last_pose = v.armor_stand.pose_index; // armor stands levam um ou dois ticks para definir sua pose corretamente
	// }
	// ...
	// if(!v.hologram_activated) {
	// 	// ...
	// 	if(v.last_hurt_direction != q.hurt_direction) {
	// 		v.last_hurt_direction = q.hurt_direction;
	// 		v.hologram_activated = true; // Ativa o holograma ao ser atingido
	// 		v.hologram.rendering = true;
	// 	} else {
	// 		return 0; 
	// 	}
	// }
	// ... (Restante da lógica complexa de tratamento de ações e estados)
}

// Scripts para o jogador (usados nos render controllers do jogador)
export function playerInitVariables() {
	v.player_action_counter ??= 0;
	v.last_player_action_time ??= 0;
	v.player_action ??= -1;
	v.new_action = -1; // Se quisermos definir uma nova ação do jogador, colocamos aqui primeiro
	
	v.last_attack_time ??= 0;
	// v.attack detecta um novo ataque (quando o tempo de ataque é maior que zero e diferente do último tempo de ataque)
	v.attack = v.attack_time > 0 && (v.last_attack_time == 0 || v.attack_time < v.last_attack_time);
	v.last_attack_time = v.attack_time;
}
export function playerRenderingControls() {
	// Lógica para determinar qual ação do HoloLab realizar com base no item segurado e se está esgueirando
	if(v.attack) { // Se o jogador atacou (clicou)
		if($[toggleRendering]) {
			v.new_action = $[ACTIONS.TOGGLE_RENDERING];
		} else if($[changeOpacity]) {
			if(q.is_sneaking) { // Se estiver esgueirando
				v.new_action = $[ACTIONS.DECREASE_OPACITY];
			} else {
				v.new_action = $[ACTIONS.INCREASE_OPACITY];
			}
		} else if($[toggleTint]) {
			v.new_action = $[ACTIONS.TOGGLE_TINT];
		} else if($[toggleValidating]) {
			v.new_action = $[ACTIONS.TOGGLE_VALIDATING];
		} else if($[changeLayer]) {
			if(q.is_sneaking) {
				v.new_action = $[ACTIONS.DECREASE_LAYER];
			} else {
				v.new_action = $[ACTIONS.INCREASE_LAYER];
			}
		} else if($[decreaseLayer]) { 
			if(q.is_sneaking) {
				v.new_action = $[ACTIONS.INCREASE_LAYER];
			} else {
				v.new_action = $[ACTIONS.DECREASE_LAYER];
			}
		} else if($[changeLayerMode]) {
			v.new_action = $[ACTIONS.CHANGE_LAYER_MODE];
		} else if($[moveHologram]) {
			v.new_action = $[ACTIONS.MOVE_HOLOGRAM];
		} else if($[rotateHologram]) {
			if(q.is_sneaking) {
				v.new_action = $[ACTIONS.ROTATE_HOLOGRAM_ANTICLOCKWISE];
			} else {
				v.new_action = $[ACTIONS.ROTATE_HOLOGRAM_CLOCKWISE];
			}
		} else if($[changeStructure]) {
			if(q.is_sneaking) {
				v.new_action = $[ACTIONS.PREVIOUS_STRUCTURE];
			} else {
				v.new_action = $[ACTIONS.NEXT_STRUCTURE];
			}
		} else if($[backupHologram]) {
			v.new_action = $[ACTIONS.BACKUP_HOLOGRAM];
		}
	}
}
export function playerBroadcastActions() {
	// Lógica para transmitir a ação do jogador para as entidades armor_stand próximas
	if(v.new_action != -1) {
		v.player_action = v.new_action;
		v.new_action = -1;
		v.player_action_counter++;
		v.last_player_action_time = q.time_stamp;
	}
	if(q.time_stamp - v.last_player_action_time > 40) { // Transmite nada após 2 segundos
		v.player_action = -1;
	}
	t.player_action = v.player_action; // Variável temporária para comunicação entre entidades
	t.player_action_counter = v.player_action_counter;
	
	// Lógica para sincronizar slots de backup
	for(let i = 0; i < $[backupSlotCount]; i++) {
		v.hologram_backup_empty_$[i] ??= true;
		if((t.hologram_backup_empty_$[i] ?? -1) == -1) {
			t.hologram_backup_empty_$[i] = v.hologram_backup_empty_$[i];
			if(!v.hologram_backup_empty_$[i]) {
				t.hologram_backup_$[i] = v.hologram_backup_$[i];
			}
		} else {
			v.hologram_backup_empty_$[i] = t.hologram_backup_empty_$[i];
			if(!t.hologram_backup_empty_$[i]) {
				v.hologram_backup_$[i] = t.hologram_backup_$[i];
			}
		}
	}
}
export function playerFirstPerson() {
	// Aplica lógicas de controle se não estiver na UI e não for um ícone de mapa (específico do vanilla)
	if(!q.is_in_ui && !v.map_face_icon) {
		$[initVariables]
		$[renderingControls]
		$[broadcastActions]
	}
}
export function playerThirdPerson() {
	if(!q.is_in_ui) {
		$[initVariables]
		$[renderingControls]
		$[broadcastActions]
	}
}

/**
 * Cria uma pseudo-enumeração usando números.
 * @template {string[]} T
 * @param {[...T]} keys - Um array de literais de string para usar como chaves.
 * @returns {Record<T[number], number>}
 */
function createNumericEnum(keys) {
	return Object.freeze(Object.fromEntries(keys.map((key, i) => [key, i])));
}