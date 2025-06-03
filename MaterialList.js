// MODIFICADO: Tradução dos comentários e logs.
// Nomes de funções e variáveis internas mantidos em inglês por enquanto.

import { floor, nanToUndefined } from "./essential.js";

export default class MaterialList {
	/** @type {Map<String, Number>} */
	materials; // Materiais e suas contagens
	totalMaterialCount; // Contagem total de todos os materiais
	
	#blockMetadata; // Metadados de blocos (do vanilla)
	#itemMetadata;  // Metadados de itens (do vanilla)
	#translations;  // Traduções carregadas de um arquivo .lang
	
	#ignoredBlocks; // Blocos a serem ignorados na lista de materiais
	#individualBlockToItemMappings; // Mapeamentos diretos de nome de bloco para nome de item
	#blockToItemPatternMappings;    // Mapeamentos de padrão de nome de bloco para nome de item
	#itemCountMultipliers;         // Multiplicadores para a contagem de certos itens
	#specialBlockEntityProperties;  // Propriedades de entidades de bloco que afetam o item (ex: cor da cama)
	#individualSerializationIdPatches; // Patches para IDs de serialização específicos
	#serializationIdPatternPatches;   // Patches para padrões de IDs de serialização
	#blocksMissingSerializationIds;  // Blocos que não têm ID de serialização no mojang-blocks.json
	#translationPatches;             // Patches para traduções que estão faltando ou incorretas
	
	/**
	 * Cria um gerenciador de lista de materiais para contar uma lista de itens.
	 * @param {Object} blockMetadata Conteúdo de `metadata/vanilladata_modules/mojang-blocks.json`
	 * @param {Object} itemMetadata Conteúdo de `metadata/vanilladata_modules/mojang-items.json`
	 * @param {String} [translations] O conteúdo textual de um arquivo `.lang`
	 */
	constructor(blockMetadata, itemMetadata, translations) {
		this.materials = new Map();
		this.totalMaterialCount = 0;
		
		this.#blockMetadata = new Map(blockMetadata["data_items"].map(block => [block["name"], block]));
		this.#itemMetadata = new Map(itemMetadata["data_items"].map(item => [item["name"], item]));
		if(translations) {
			this.setLanguage(translations);
		}
		
		return (async () => {
			let materialListMappings = await fetch("data/materialListMappings.json").then(res => res.jsonc());
			this.#ignoredBlocks = materialListMappings["ignored_blocks"];
			let blockToItemMappings = Object.entries(materialListMappings["block_to_item_mappings"]);
			this.#individualBlockToItemMappings = new Map(blockToItemMappings.filter(([blockName]) => !blockName.startsWith("/") && !blockName.endsWith("/")));
			this.#blockToItemPatternMappings = blockToItemMappings.filter(([pattern]) => pattern.startsWith("/") && pattern.endsWith("/")).map(([pattern, item]) => [new RegExp(pattern.slice(1, -1), "g"), item]);
			this.#itemCountMultipliers = Object.entries(materialListMappings["item_count_multipliers"]).map(([key, value]) => {
				let itemNames = [];
				let patterns = [];
				key.split(",").forEach(itemNameOrPattern => {
					if(itemNameOrPattern.startsWith("/") && itemNameOrPattern.endsWith("/")) {
						patterns.push(new RegExp(itemNameOrPattern.slice(1, -1)));
					} else {
						itemNames.push(itemNameOrPattern);
					}
				});
				if(typeof value == "number") {
					return [itemNames, patterns, value, ""];
				} else {
					return [itemNames, patterns, value["multiplier"], value["remove"]];
				}
			});
			this.#specialBlockEntityProperties = materialListMappings["special_block_entity_properties"];
			let serializationIdPatches = Object.entries(materialListMappings["serialization_id_patches"]);
			this.#individualSerializationIdPatches = new Map(serializationIdPatches.filter(([serializationId]) => !serializationId.startsWith("/") && !serializationId.endsWith("/")));
			this.#serializationIdPatternPatches = serializationIdPatches.filter(([pattern]) => pattern.startsWith("/") && pattern.endsWith("/")).map(([pattern, serializationId]) => [new RegExp(pattern.slice(1, -1), "g"), serializationId]);
			this.#blocksMissingSerializationIds = materialListMappings["blocks_missing_serialization_ids"];
			this.#translationPatches = materialListMappings["translation_patches"];
			
			return this;
		})();
	}
	/**
	 * Adiciona um bloco à lista de materiais.
	 * @param {String|Block} block O bloco ou nome do bloco.
	 * @param {Number} [count] A quantidade a ser adicionada.
	 */
	add(block, count = 1) {
		let blockName = typeof block == "string"? block : block["name"];
		if(this.#ignoredBlocks.includes(blockName)) {
			return;
		}
		let itemName = this.#individualBlockToItemMappings.get(blockName);
		if(!itemName) {
			let matchingPatternAndReplacement = this.#blockToItemPatternMappings.find(([pattern]) => pattern.test(blockName));
			if(matchingPatternAndReplacement) {
				itemName = blockName.replaceAll(...matchingPatternAndReplacement);
			} else {
				itemName = blockName; // Assume que o nome do item é o mesmo do bloco se não houver mapeamento
			}
		}
		this.#itemCountMultipliers.forEach(([itemNames, patterns, multiplier, substringToRemove]) => {
			if(itemNames.includes(itemName) || patterns.some(pattern => pattern.test(itemName))) {
				count *= multiplier;
				if(substringToRemove != "") {
					itemName = itemName.replaceAll(substringToRemove, "");
				}
			}
		});
		if(itemName in this.#specialBlockEntityProperties && typeof block != "string") {
			let blockEntityProperty = this.#specialBlockEntityProperties[itemName]["prop"];
			if(blockEntityProperty in (block["block_entity_data"] ?? {})) {
				itemName += `+${block["block_entity_data"][blockEntityProperty]}`;
			} else {
				// MODIFICADO: Tradução
				console.error(`Não foi possível encontrar a propriedade da entidade de bloco ${blockEntityProperty} no bloco ${block["name"]}!`);
			}
		}
		this.materials.set(itemName, (this.materials.get(itemName) ?? 0) + count);
		this.totalMaterialCount += count;
	}
	/**
	 * Adiciona um item à lista de materiais.
	 * @param {String} itemName Nome do item.
	 * @param {Number} [count] Quantidade.
	 */
	addItem(itemName, count = 1) {
		this.materials.set(itemName, (this.materials.get(itemName) ?? 0) + count);
		this.totalMaterialCount += count;
	}
	/**
	 * Exporta a lista de materiais para uso adequado.
	 * @returns {Array<MaterialListEntry>}
	 */
	export() {
		if(this.#translations == undefined) {
			// MODIFICADO: Tradução
			throw new Error("Não é possível exportar uma lista de materiais sem fornecer traduções! Use setLanguage().");
		}
		return [...this.materials].map(([itemName, count]) => {
			let serializationId;
			let blockEntityPropertyValue;
			if(itemName.includes("+")) { // Para itens especiais como camas coloridas
				let match = itemName.match(/^([^+]+)\+(\d+)$/);
				itemName = match[1];
				blockEntityPropertyValue = +match[2];
				serializationId = this.#specialBlockEntityProperties[itemName]?.["serialization_ids"]?.[blockEntityPropertyValue];
			}
			
			serializationId ??= this.#blocksMissingSerializationIds[itemName] ?? this.#findItemSerializationId(itemName);
			let translatedName = serializationId && this.#translate(serializationId);

			if(!translatedName) { // Se não encontrou tradução pelo ID de serialização do item, tenta pelo ID do bloco
				let blockSerializationId = this.#findBlockSerializationId(itemName);
				translatedName = blockSerializationId && this.#translate(blockSerializationId);
				if(translatedName) {
					serializationId = blockSerializationId;
				} else {
					// MODIFICADO: Tradução dos logs de aviso
					if(!serializationId && !blockSerializationId) {
						console.warn(`Não foi possível encontrar nenhuma chave de tradução para ${itemName}!`);
					} else {
						console.warn(`Não foi possível traduzir ${[serializationId, blockSerializationId].removeFalsies().join(" ou ")} para o item "${itemName}"!`);
					}
					serializationId ??= blockSerializationId ?? itemName; // Fallback para o próprio nome do item/ID se não houver tradução
					translatedName = serializationId;
				}
			}
			let auxId = this.#findItemAuxId(itemName) ?? this.#findBlockAuxId(itemName); 
			if(typeof auxId == "number" && typeof blockEntityPropertyValue == "number") {
				auxId += blockEntityPropertyValue; // Para variantes de itens (ex: cor da cama)
			}
			return {
				itemName,
				translationKey: this.#serializationIdToTranslationKey(serializationId),
				translatedName,
				count,
				partitionedCount: this.#partitionCount(count),
				auxId
			};
		}).sort((a, b) => b.count - a.count || a.translatedName.localeCompare(b.translatedName, this.#translations.get("language.code") || "en")); // Ordena por contagem, depois por nome traduzido
	}
	/**
	 * Define o idioma da lista de materiais para exportação.
	 * @param {String} translations O conteúdo textual de um arquivo `.lang`.
	 */
	setLanguage(translations) {
		this.#translations = new Map();
		// Adiciona o código do idioma para ordenação alfabética localizada
        // Isso é uma suposição, o arquivo .lang geralmente não tem essa meta informação.
        // Se o arquivo .lang começar com, por exemplo, "language.code=pt_PT", isso seria lido.
        // Por enquanto, vou remover essa linha, pois não temos essa meta no .lang.
        // this.#translations.set("language.code", "en_US"); // Fallback

		translations.split("\n").forEach(line => {
			let hashI = line.indexOf("#"); // Remove comentários
			if(hashI > -1) {
				line = line.slice(0, hashI);
			}
			line = line.trim();
			if(line == "") {
				return;
			}
			let eqI = line.indexOf("=");
			if (eqI > -1) { // Garante que a linha tem um '='
			    this.#translations.set(line.slice(0, eqI), line.slice(eqI + 1));
			}
		});
	}
	/**
	 * Limpa a lista de materiais.
	 */
	clear() {
		this.materials.clear();
		this.totalMaterialCount = 0;
	}
	
	#findItemSerializationId(itemName) {
		return this.#itemMetadata.get(`minecraft:${itemName}`)?.["serialization_id"];
	}
	
	#findBlockSerializationId(blockName) {
		return this.#blockMetadata.get(`minecraft:${blockName}`)?.["serialization_id"];
	}
	
	#serializationIdToTranslationKey(serializationId) {
		if (!serializationId) return "desconhecido.nome"; // Fallback para ID de serialização nulo

		if(this.#individualSerializationIdPatches.has(serializationId)) {
			serializationId = this.#individualSerializationIdPatches.get(serializationId);
		} else {
			let matchingPatternAndReplacement = this.#serializationIdPatternPatches.find(([pattern]) => pattern.test(serializationId));
			if(matchingPatternAndReplacement) {
				serializationId = serializationId.replaceAll(...matchingPatternAndReplacement);
			}
		}
		return serializationId.endsWith(".name")? serializationId : `${serializationId}.name`;
	}
	
	#translate(serializationId) {
		if (!serializationId) return undefined;
		let translationKey = this.#serializationIdToTranslationKey(serializationId);
		return this.#translationPatches[translationKey] ?? this.#translations.get(translationKey);
	}
	
	#partitionCount(count) {
		if(count < 64) {
			return String(count);
		} else {
			// O caractere \uE200 é um emoji de Shulker Box (definido em font/glyph_E2.png)
			// O "s" é para "stack" (pacote)
			// MODIFICADO: Comentário traduzido
			let parts = [[floor(count / 1728), "\uE200"], [floor(count / 64) % 27, "s"], [count % 64, ""]].filter(([n]) => n).map(x => x.join(""));
			return `${count} = ${parts.join(" + ")}`; 
		}
	}
	
	#findItemAuxId(itemName) {
		return nanToUndefined(this.#itemMetadata.get(`minecraft:${itemName}`)?.["raw_id"] * 65536);
	}
	
	#findBlockAuxId(blockName) {
		return nanToUndefined(this.#blockMetadata.get(`minecraft:${blockName}`)?.["raw_id"] * 65536);
	}
}

/**
 * @typedef {import("./HoloPrint.js").MaterialListEntry} MaterialListEntry
 * @typedef {import("./BlockGeoMaker.js").Block} Block
 */