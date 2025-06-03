// Atualiza um Traduzir os comentários internos para português.
2.  **Tradução de Mensagens de Log/Erro:** Trad bloco de versões mais antigas do MCBE, usando esquemas de pmmp/BedrockBlockUpgradeSchema.
// Este códigouzir as mensagens enviadas para `console.error` e `console.debug`.
3.  **N foi feito com referência a https://github.com/pmmp/PocketMine-MP/blob/5.21.0omes de Constantes/Variáveis:** Manter os nomes em inglês por enquanto para evitar quebrar referências, a menos que seja/src/data/bedrock/block/upgrade/BlockStateUpgrader.php
// e https://github.com/ uma string de configuração óbvia.
4.  **Referências a "HoloPrint" ou "HoloLab":**RaphiMC/ViaBedrock/blob/main/src/main/java/net/raphimc/vi Este módulo lida com dados vanilla e esquemas de atualização, então provavelmente não haverá muitas referências diretas à marca daabedrock/api/chunk/blockstate/JsonBlockStateUpgradeSchema.java.

import { CachingFetcher ferramenta em si, mas verificaremos.

Aqui está o código proposto para `BlockUpdater.js`:

```javascript
// } from "./essential.js";

export default class BlockUpdater {
	// MODIFICADO: Comentário trad Atualiza um bloco de versões mais antigas do MCBE, usando esquemas de pmmp/BedrockBlockUpgradeSchema.uzido e versão mantida, mas pode ser ajustada se necessário
	static LATEST_VERSION = 18
// Este código foi feito com referência a https://github.com/pmmp/PocketMine-MP/blob/5168865; // 1.21.60.33 (1.21.21.0/src/data/bedrock/block/upgrade/BlockStateUpgrader.php
.61) - Versão mais recente do esquema de blocos
	// ATENÇÃO: A URL abaixo ap// e https://github.com/RaphiMC/ViaBedrock/blob/main/src/main/javaonta para um repositório específico do HoloPrint original.
	// Se esta funcionalidade for mantida, você/net/raphimc/viabedrock/api/chunk/blockstate/JsonBlockStateUpgradeSchema.java.

 pode precisar hospedar seu próprio schema ou garantir a compatibilidade.
	static #UPGRADE_SCHEMA_URL = "import { CachingFetcher } from "./essential.js"; // Mantém import de essential.js

export default class BlockUpdaterhttps://cdn.jsdelivr.net/gh/SuperLlama88888/BedrockBlockUpgradeSchema {
	static LATEST_VERSION = 18168865; // 1.2";
	static #UPGRADE_SCHEMA_VERSION = "5.1.0+bedrock-1.211.60.33 (1.21.61) - Versão mais recente suportada
	//.60"; // Nome da tag específica
	
	#fetcher;
	/** @type {Record<String, Array<BlockUpdateSchemaSkeleton>>} */
	#schemaIndex;
	/** @type {Map MODIFICADO: Se você for hospedar o schema de atualização, altere esta URL.
	// Por enquanto, manter<String, BlockUpdateSchema>} */
	#schemas;
	
	/**
	 * Cria um BlockUpdater para atualizar blocos mais antigos para a versão mais recente do MCBE.
	 */
	constructor() {
emos a original, pois é uma dependência externa.
	static #UPGRADE_SCHEMA_URL = "https://cdn		// MODIFICADO: Nome do cache pode ser personalizado para HoloLab
		this.#fetcher = new C.jsdelivr.net/gh/SuperLlama88888/BedrockBlockUpgradeSchema";
	static #achingFetcher(`AtualizadorBlocoHoloLab@${BlockUpdater.#UPGRADE_SCHEMA_VERSION}`, `${BlockUpdater.#UPUPGRADE_SCHEMA_VERSION = "5.1.0+bedrock-1.21.60GRADE_SCHEMA_URL}@${BlockUpdater.#UPGRADE_SCHEMA_VERSION}/`);
		this.#schemaIndex"; // Tag específica do schema
	
	#fetcher;
	/** @type {Record<String, Array<BlockUpdateSchemaSkeleton>>} */
	#schemaIndex;
	/** @type {Map<String, BlockUpdateSchema>} = {};
		this.#schemas = new Map();
	}
	/**
	 * Verifica se um bloco precisa ser atualizado para a versão mais recente do Minecraft.
	 * @param {NBTBlock} block
	 * */
	#schemas;
	
	/**
	 * Cria um BlockUpdater para atualizar blocos mais antigos para a versão mais recente do MCBE.
	 */
	constructor() {
		// MODIFICADO: Poderíamos @returns {Boolean}
	 */
	blockNeedsUpdating(block) {
		return block["version"] < Block personalizar o nome do cache aqui, se desejado, ex: `AtualizadorDeBlocoHoloLab@...`
		Updater.LATEST_VERSION;
	}
	/**
	 * Atualiza um bloco de versões mais antigas do Minecraft para a versão mais recente.
	 * @mutating
	 * @param {NBTBlock} block
this.#fetcher = new CachingFetcher(`BlockUpgrader@${BlockUpdater.#UPGRADE_SCHEMA_VERSION	 * @returns {Promise<Boolean>} Se o bloco foi atualizado ou não. (O número da versão sempre}`, `${BlockUpdater.#UPGRADE_SCHEMA_URL}@${BlockUpdater.#UPGRADE_SCHEMA_VERSION}/`);
		 será atualizado.)
	 */
	async update(block) {
		let oldBlockStringified = Blockthis.#schemaIndex = {};
		this.#schemas = new Map();
	}
	/**
	 *Updater.stringifyBlock(block);
		if(this.#fetcher instanceof Promise) {
			this.#fetch Verifica se um bloco precisa ser atualizado para a versão mais recente do Minecraft.
	 * @param {NBTBlock}er = await this.#fetcher;
		}
		if(Object.keys(this.#schemaIndex). block
	 * @returns {Boolean}
	 */
	blockNeedsUpdating(block) {
		returnlength == 0) {
			let schemaList = await this.#fetcher.fetch("schema_list. block["version"] < BlockUpdater.LATEST_VERSION;
	}
	/**
	 * Atualiza um bloco de versões mais antigas do Minecraft para a versão mais recente.
	 * @mutating
	 *json").then(res => res.json());
			schemaList.forEach(schemaSkeleton => {
				let schemaVersion = this.#getSchemaVersion(schemaSkeleton);
				this.#schemaIndex[schemaVersion] ??= [];
 @param {NBTBlock} block
	 * @returns {Promise<Boolean>} Se o bloco foi ou não atualizado. (O número da versão sempre será atualizado.)
	 */
	async update(block) {
		let old				this.#schemaIndex[schemaVersion].push(schemaSkeleton);
			});
		}
		let schemasToApply = [];
		Object.entries(this.#schemaIndex).forEach(([version, schemaSkeletons]) =>BlockStringified = BlockUpdater.stringifyBlock(block);
		if(this.#fetcher instanceof Promise) {
			this {
			if(block["version"] > version || schemaSkeletons.length == 1 && block["version.#fetcher = await this.#fetcher;
		}
		if(Object.keys(this.#schema"] == version) {
				return;
			}
			schemasToApply.push(...schemaSkeletons.map(Index).length == 0) {
			let schemaList = await this.#fetcher.fetch("schema_schemaSkeleton => schemaSkeleton.filename));
		});
		await Promise.all(schemasToApply.map(list.json").then(res => res.json());
			schemaList.forEach(schemaSkeleton => {
async schemaFilename => {
			if(!this.#schemas.has(schemaFilename)) {
				this.#schemas.set				let schemaVersion = this.#getSchemaVersion(schemaSkeleton);
				this.#schemaIndex[schemaVersion](schemaFilename, await this.#fetcher.fetch(`nbt_upgrade_schema/${schemaFilename}`).then(res => ??= [];
				this.#schemaIndex[schemaVersion].push(schemaSkeleton);
			});
		}
		let schemasToApply = [];
		Object.entries(this.#schemaIndex).forEach(([version, schemaS res.json()));
			}
		}));
		let updated = false;
		schemasToApply.forEach(schemaFileName => {
			let schema = this.#schemas.get(schemaFileName);
			if(this.#applyUpdateSchema(schema, block)) {
				updated = true;
			}
		});
		block["versionkeletons]) => {
			if(block["version"] > version || schemaSkeletons.length == 1"] = BlockUpdater.LATEST_VERSION;
		if(updated) {
			// MODIFICADO: Tradução
 && block["version"] == version) {
				return;
			}
			schemasToApply.push(...schemaSkeletons.map(schemaSkeleton => schemaSkeleton.filename));
		});
		await Promise.all(schemasToApply.			console.debug(`Bloco ${oldBlockStringified} atualizado para ${BlockUpdater.stringifyBlock(block)}map(async schemaFilename => {
			if(!this.#schemas.has(schemaFilename)) {
				this.#schemas.set(schemaFilename, await this.#fetcher.fetch(`nbt_upgrade_schema/${schemaFilename}`).`);
		}
		return updated;
	}
	/**
	 * Aplica um schema a um bloco.
	 * @mutating
	 * @param {BlockUpdateSchema} schema
	 * @param {NBTthen(res => res.json()));
			}
		}));
		let updated = false;
		schemasBlock} block
	 * @returns {Boolean} Se o bloco mudou entre as versões. (O número da versãoToApply.forEach(schemaFileName => {
			let schema = this.#schemas.get(schemaFileName);
			if(this.#applyUpdateSchema(schema, block)) {
				updated = true;
			}
 sempre será atualizado, a menos que ocorra um erro.)
	 */
	#applyUpdateSchema(schema, block) {
		let schemaVersion = this.#getSchemaVersion(schema);
		if(block["version"] >		});
		block["version"] = BlockUpdater.LATEST_VERSION;
		if(updated) {
			// MODIFICADO: Tradução do log
			console.debug(`Atualizado ${oldBlockStringified} schemaVersion) {
			// MODIFICADO: Tradução
			console.error(`Tentando atualizar bloco da versão ${block["version"]} para ${schemaVersion}!`);
			return;
		}
		if(block["name"] para ${BlockUpdater.stringifyBlock(block)}`);
		}
		return updated;
	}
	/**
	 * Aplica um schema a um bloco.
	 * @mutating
	 * @param {Block in (schema["flattenedProperties"] ?? {}) && block["name"] in (schema["renamedIds"] ?? {})) {
			// MODIFICADO: Tradução
			console.error(`Não é possível achatar e renUpdateSchema} schema
	 * @param {NBTBlock} block
	 * @returns {Boolean} Se o bloco mudou ou não entre as versões. (O número da versão sempre será atualizado, a menos que ocoromear o bloco ${block["name"]} ao mesmo tempo: ${JSON.stringify(schema)}`);
			return;
ra um erro.)
	 */
	#applyUpdateSchema(schema, block) {
		let schemaVersion		}
		
		// Remapeia estados de bloco: quando os valores mudam e, em alguns casos = this.#getSchemaVersion(schema);
		if(block["version"] > schemaVersion) {
			// MOD, o nome do bloco
		if(schema["remappedStates"]?.[block["name"]]?.some(IFICADO: Tradução do erro
			console.error(`Tentando atualizar bloco da versão ${block["version"]}remappedState => {
			let statesToMatch = remappedState["oldState"];
			if(states para ${schemaVersion}!`);
			return;
		}
		if(block["name"] in (schema["ToMatch != null) { 
				if(Object.keys(statesToMatch).length > Object.keys(block["states"]).length) {
					return;
				}
				for(let [blockStateName, blockStateValueProperty] of Object.entries(statesToMatch)) {
					if(!(blockStateName in block["states"])) {
						return;
					}
					let blockStateValue = this.#readBlockStateProperty(blockStateValueProperty);
					if(blockStateValue != block["states"][blockStateName]) {
						return;
					}
				}
			}
			if("newName" in remappedState) {
				block["name"] = remappedState["newName"];
			} else {
				this.#applyFlattenedProperty(remappedState["newFlattenedName"], block);
			}
			let newStates = Object.fromEntries(Object.entries(flattenedProperties"] ?? {}) && block["name"] in (schema["renamedIds"] ?? {})) {
			// MODIFICADO: Tradução do erro
			console.error(`Não é possível achatar e renomear o bloco ${block["name"]} ao mesmo tempo: ${JSON.stringify(schema)}`);
			return;
		}
		
		if(schema["remappedStates"]?.[block["name"]]?.some(remappedState => {
			let statesToMatch = remappedState["oldState"];
			if(statesToMatch != null) { 
				if(Object.keys(statesToMatch).length > Object.keys(block["states"]).length) {
					return;
				}
				for(let [blockStateName, blockStateValueProperty] ofremappedState["newState"] ?? {}).map(([blockStateName, blockStateValueProperty]) => [blockStateName, this.#readBlockStateProperty(blockStateValueProperty)]));
			remappedState["copiedState"]?.forEach(blockStateName => {
				if(blockStateName in block["states"]) {
					newStates[blockState Object.entries(statesToMatch)) {
					if(!(blockStateName in block["states"])) {
						return;
					}
					let blockStateValue = this.#readBlockStateProperty(blockStateValueProperty);
					if(blockStateValue != block["states"][blockStateName]) {
						return;
					}
				}
			}
			if("newName" in remappedState) {
				block["name"] = remappedState["newNameName] = block["states"][blockStateName];
				}
			});
			block["states"] ="];
			} else {
				this.#applyFlattenedProperty(remappedState["newFlattenedName"], block);
			}
			let newStates = Object.fromEntries(Object.entries(remappedState[" newStates;
			return true; 
		})) {
			block["version"] = schemaVersion;
			return true;
		}
		
		let hasBeenUpdated = false;
		// Propriedades adicionadasnewState"] ?? {}).map(([blockStateName, blockStateValueProperty]) => [blockStateName, this.#readBlockStateProperty(blockStateValueProperty)]));
			remappedState["copiedState"]?.forEach(blockStateName => {: adiciona estados e valores de bloco
		Object.entries(schema["addedProperties"]?.[block["name"]] ?? {}).forEach(([blockStateName, blockStateProperty]) => {
			let blockStateValue = this.#readBlockStateProperty(blockStateProperty);
			if(blockStateName in block["states"]) {
				// MODIFIC
				if(blockStateName in block["states"]) {
					newStates[blockStateName] = blockADO: Tradução
				console.debug(`Não é possível adicionar o estado de bloco ${blockStateName} = ${blockStateValue} porque já existe no bloco ${BlockUpdater.stringifyBlock(block)}`);
				return;
			}["states"][blockStateName];
				}
			});
			block["states"] = newStates;
			return true; 
		})) {
			block["version"] = schemaVersion;
			return true;
		}
		
		let hasBeenUpdated = false;
		Object.entries(schema["addedProperties
			block["states"][blockStateName] = blockStateValue;
			hasBeenUpdated = true;
		});
		// Propriedades removidas: remove estados de bloco
		schema["removedProperties"]?.[block["name"]?.[block["name"]] ?? {}).forEach(([blockStateName, blockStateProperty]) => {
			let blockStateValue = this.#readBlockStateProperty(blockStateProperty);
			if(blockStateName in block[""]]?.forEach(blockStateName => {
			if(!(blockStateName in block["states"])) {
				// MODIFICADO: Tradução
				console.debug(`Não é possível deletar o estado de bloco ${blockStatestates"]) {
				// MODIFICADO: Tradução do log
				console.debug(`Não é possível adicionar o estado de bloco ${blockStateName} = ${blockStateValue} porque já existe no bloco ${BlockUpdater.stringifyBlock(block)}Name} porque não existe no bloco ${BlockUpdater.stringifyBlock(block)}`);
				return;
			}
			delete block["states"][blockStateName];
			hasBeenUpdated = true;
		});
		// Valores`);
				return;
			}
			block["states"][blockStateName] = blockStateValue;
			hasBeenUpdated = true;
		});
		schema["removedProperties"]?.[block["name"]]?.forEach( de propriedade remapeados: altera valores de estado de bloco
		Object.entries(schema["remappedPropertyValues"]?blockStateName => {
			if(!(blockStateName in block["states"])) {
				// MODIFICADO: Tradução do log
				console.debug(`Não é possível deletar o estado de bloco ${blockStateName} porque não.[block["name"]] ?? {}).forEach(([blockStateName, remappingName]) => {
			if(!(blockStateName in block["states"])) {
				// MODIFICADO: Tradução
				console.debug(`Não é possível re existe no bloco ${BlockUpdater.stringifyBlock(block)}`);
				return;
			}
			delete block["states"][blockStateName];
			hasBeenUpdated = true;
		});
		Object.entries(schema["remamapear valor para o estado de bloco ${blockStateName} porque o estado não existe: ${BlockUpdater.stringifyBlock(block)}`);
				return;
			}
			let currentBlockStateValue = block["states"][blockStateName];
			if(!(remappingName in schema["remappedPropertyValuesIndex"])) {
				// MODIFICADOppedPropertyValues"]?.[block["name"]] ?? {}).forEach(([blockStateName, remappingName]) => {
			if(!(blockStateName in block["states"])) {
				// MODIFICADO: Tradução do log
				console.debug(`Não é possível remapear o valor para o estado de bloco ${blockStateName} porque: Tradução
				console.debug(`Remapeamento de valor de estado de bloco ${remappingName} não o estado não existe: ${BlockUpdater.stringifyBlock(block)}`);
				return;
			}
			let currentBlockStateValue = block["states"][blockStateName];
			if(!(remappingName in schema["remappedPropertyValuesIndex encontrado no schema!`);
				return;
			}
			let remappings = schema["remappedPropertyValuesIndex"][remappingName];
			let remapping = remappings.find(remapping => currentBlockStateValue == this.#readBlock"])) {
				// MODIFICADO: Tradução do log
				console.debug(`Remapeamento de valor de estado de bloco ${remappingName} não encontrado no schema!`);
				return;
			}
			letStateProperty(remapping["old"]));
			if(remapping == undefined) {
				// MODIFICADO: Tradução
				console.debug(`Não é possível encontrar o valor de estado de bloco ${currentBlockStateValue} nos remapeamentos para o estado de bloco ${blockStateName}: ${JSON.stringify(remappings)}`);
 remappings = schema["remappedPropertyValuesIndex"][remappingName];
			let remapping = remappings.find(remapping => currentBlockStateValue == this.#readBlockStateProperty(remapping["old"]));
			if(				return;
			}
			block["states"][blockStateName] = this.#readBlockStateProperty(remapping == undefined) {
				// MODIFICADO: Tradução do log
				console.debug(`Nãoremapping["new"]);
			hasBeenUpdated = true;
		});
		// Propriedades renomeadas: renomeia estados de bloco
		Object.entries(schema["renamedProperties"]?.[block["name"]] ?? foi possível encontrar o valor de estado de bloco ${currentBlockStateValue} nos remapeamentos para o estado de bloco ${blockStateName}: ${JSON.stringify(remappings)}`);
				return;
			}
			block["states {}).forEach(([oldStateName, newStateName]) => {
			if(!(oldStateName in block["states"])) {
				// MODIFICADO: Tradução
				console.debug(`Não é possível renomear o estado"][blockStateName] = this.#readBlockStateProperty(remapping["new"]);
			hasBeenUpdated = true;
 de bloco ${oldStateName} -> ${newStateName} porque não existe no bloco ${BlockUpdater.stringifyBlock(block)}		});
		Object.entries(schema["renamedProperties"]?.[block["name"]] ?? {}).forEach(([oldStateName, newStateName]) => {
			if(!(oldStateName in block["states"])) {
				//`);
				return;
			}
			block["states"][newStateName] = block["states"][oldStateName];
			delete block["states"][oldStateName];
			hasBeenUpdated = true;
		});
		// MODIFICADO: Tradução do log
				console.debug(`Não é possível renomear o estado de bloco ${oldStateName} -> ${newStateName} porque não existe no bloco ${BlockUpdater.stringifyBlock(block)}`);
				return Propriedades achatadas: valor da propriedade determina novo nome do bloco
		if(block["name"] in (schema["flattenedProperties"] ?? {})) {
			if(this.#applyFlattenedProperty(schema["flattenedProperties"][;
			}
			block["states"][newStateName] = block["states"][oldStateName];
			delete block["states"][oldStateName];
			hasBeenUpdated = true;
		});
		if(block["nameblock["name"]], block)) { 
				hasBeenUpdated = true;
			}
		}
		"] in (schema["flattenedProperties"] ?? {})) {
			if(this.#applyFlattenedProperty(// IDs renomeados: nome do bloco muda
		if(block["name"] in (schema["renamedIds"] ?? {})) {
			block["name"] = schema["renamedIds"][block["name"]];
			hasBeenschema["flattenedProperties"][block["name"]], block)) { 
				hasBeenUpdated = true;
			}
		}
		if(block["name"] in (schema["renamedIds"] ?? {})) {
			block["Updated = true;
		}
		block["version"] = schemaVersion;
		return hasBeenUpdated;
	}
	/**
	 * Achata um estado de bloco para encontrar o novo nome do bloco para um bloco.
name"] = schema["renamedIds"][block["name"]];
			hasBeenUpdated = true;
		}
		block["version"] = schemaVersion;
		return hasBeenUpdated;
	}
	/**	 * @mutating
	 * @param {BlockUpdateSchemaFlattenRule} flattenRule
	 * @param
	 * Achata um estado de bloco para encontrar o novo nome de bloco para um bloco.
	 * @mutating
 {NBTBlock} block
	 * @returns {Boolean} Se o estado do bloco foi achatado com sucesso
	 */
	#applyFlattenedProperty(flattenRule, block) {
		let blockStateName = flatten	 * @param {BlockUpdateSchemaFlattenRule} flattenRule
	 * @param {NBTBlock} block
	 * @returns {Boolean} Se o estado de bloco foi achatado com sucesso
	 */
	#applyRule["flattenedProperty"];
		if(!(blockStateName in block["states"])) {
			// MODIFICADO: Tradução
			console.debug(`Não é possível achatar o estado de bloco ${blockStateName} porque nãoFlattenedProperty(flattenRule, block) {
		let blockStateName = flattenRule["flattenedProperty"];
		 existe no bloco ${BlockUpdater.stringifyBlock(block)}, ${JSON.stringify(flattenRule)}`);
			return;
		}
		let blockStateValue = block["states"][blockStateName];
		let embedValue = flattenRuleif(!(blockStateName in block["states"])) {
			// MODIFICADO: Tradução do log
			console.debug(`Não é possível achatar o estado de bloco ${blockStateName} porque não existe no bloco ${BlockUpdater.stringifyBlock(block)}, ${JSON.stringify(flattenRule)}`);
			return;
		}
		let blockState["flattenedValueRemaps"]?.[blockStateValue] ?? blockStateValue;
		block["name"] = flattenRule["prefix"] + embedValue + flattenRule["suffix"];
		delete block["states"][blockStateName];Value = block["states"][blockStateName];
		let embedValue = flattenRule["flattenedValueRemaps"]?.[blockStateValue] ?? blockStateValue;
		block["name"] = flattenRule["prefix"] + embedValue +
		return true;
	}
	/**
	 * @param {TypedBlockStateProperty} blockStateProperty 
	 * @returns {Number|String}
	 */
	#readBlockStateProperty(blockStateProperty flattenRule["suffix"];
		delete block["states"][blockStateName];
		return true;
	}
	/**
	 * @param {TypedBlockStateProperty} blockStateProperty 
	 * @returns {Number|) {
		return Object.values(blockStateProperty)[0]; 
	}
	/**
	 * @param {BlockUpdateSchema|BlockUpdateSchemaSkeleton} schema
	 * @returns {Number}
	String}
	 */
	#readBlockStateProperty(blockStateProperty) {
		return Object.values(blockStateProperty)[0]; 
	}
	/**
	 * @param {BlockUpdateSchema| */
	#getSchemaVersion(schema) {
		return (schema["maxVersionMajor"] << 24) | (schema["maxVersionMinor"] << 16) | (schema["maxVersionPatch"] << 8BlockUpdateSchemaSkeleton} schema
	 * @returns {Number}
	 */
	#getSchemaVersion() | schema["maxVersionRevision"];
	}
	/**
	 * "Stringifica" um bloco comschema) {
		return (schema["maxVersionMajor"] << 24) | (schema["maxVersionMinor"] << 16) | (schema["maxVersionPatch"] << 8) | schema["maxVersionRevision"]; seu nome e estados.
	 * @param {NBTBlock|Block} block
	 * @param {Boolean} [includeVersion]
	 * @returns {String}
	 */
	static stringifyBlock(block, include
	}
	/**
	 * "Converte para string" um bloco com seu nome e estados.
	 * @param {NBTBlock|Block} block
	 * @param {Boolean} [includeVersion]
	 * @returnsVersion = true) {
		let blockStates = Object.entries(block["states"]).map(([name, value]) => `${name}=${value}`).join(",");
		let res = block["name"].replace(/^minecraft:/, ""); {String}
	 */
	static stringifyBlock(block, includeVersion = true) {
		let
		if(blockStates.length) {
			res += `[${blockStates}]`;
		}
		if blockStates = Object.entries(block["states"] ?? {}).map(([name, value]) => `${name}=${(includeVersion && "version" in block) {
			res += `@${BlockUpdater.parseBlockVersion(block["value}`).join(","); // Adicionado ?? {}
		let res = block["name"].replace(/^minecraft:/, "");
		if(blockStates.length) {
			res += `[${blockStates}]`;
		}
		ifversion"]).join(".")}`;
		}
		return res;
	}
	/**
	 * Expande(includeVersion && "version" in block) {
			res += `@${BlockUpdater.parseBlockVersion(block[" o número da versão do bloco encontrado no NBT da estrutura em um array.
	 * @param {Number} blockVersion Número da versão do bloco como encontrado no NBT da estrutura
	 * @returns {Array<Number>}
	 */
version"]).join(".")}`;
		}
		return res;
	}
	/**
	 * Expande	static parseBlockVersion(blockVersion) {
		return blockVersion.toString(16).padStart(8, 0).match(/.{2}/g).map(x => parseInt(x, 16));
	 o número da versão do bloco encontrado no NBT da estrutura em um array.
	 * @param {Number} blockVersion Número da versão do bloco como encontrado no NBT da estrutura
	 * @returns {Array<Number>}
	 */}
}

// MODIFICADO: Typedefs traduzidos (comentários)
/**
 *
	static parseBlockVersion(blockVersion) {
		return blockVersion.toString(16).padStart( @typedef {import("./HoloPrint.js").NBTBlock} NBTBlock Bloco como armazenado no NBT8, 0).match(/.{2}/g).map(x => parseInt(x, 16));

 */
/**
 * @typedef {import("./BlockGeoMaker.js").Block} Block Bloco como usado internamente
 */
/**
 * @typedef {import("./HoloPrint.js").BlockUpdateSchemaSkeleton}	}
}

// Typedefs mantidos...
/**
 * @typedef {import("./HoloPrint.js").NBTBlock} NBTBlock
 */
/**
 * @typedef {import("./BlockGeoMaker.js").Block BlockUpdateSchemaSkeleton Esqueleto do schema de atualização de bloco
 */
/**
 * @typedef {import("./H} Block
 */
/**
 * @typedef {import("./HoloPrint.js").BlockUpdateSchemaSkeleton}oloPrint.js").BlockUpdateSchema} BlockUpdateSchema Schema de atualização de bloco
 */
/**
 * @typedef BlockUpdateSchemaSkeleton
 */
/**
 * @typedef {import("./HoloPrint.js").BlockUpdateSchema {import("./HoloPrint.js").TypedBlockStateProperty} TypedBlockStateProperty Propriedade de estado de bloco tipada
 */
/**
 * @typedef {import("./HoloPrint.js").BlockUpdateSchemaFlattenRule}} BlockUpdateSchema
 */
/**
 * @typedef {import("./HoloPrint.js").TypedBlockState BlockUpdateSchemaFlattenRule Regra de achatamento do schema de atualização de bloco
 */
/**
 * @typedef {import("./Property} TypedBlockStateProperty
 */
/**
 * @typedef {import("./HoloPrint.js").BlockUpdateSchemaFlattenRule} BlockUpdateSchemaFlattenRule
 */
/**
 * @typedef {import("./HoloPrint.js").HoloPrint.js").BlockUpdateSchemaRemappedState} BlockUpdateSchemaRemappedState Estado remapeado doBlockUpdateSchemaRemappedState} BlockUpdateSchemaRemappedState
 */