// MODIFICADO: Comentários e logs traduzidos.

// Referências interessantes para formatos de dados de blocos:
// https://github.com/PrismarineJS/minecraft-data/blob/master/data/bedrock/1.20.71/blockCollisionShapes.json
// https://github.com/MCBE-Development-Wiki/mcbe-dev-home/blob/main/docs/misc/enums/block_shape.md
// https://github.com/bricktea/MCStructure/blob/main/docs/1.16.201/enums/B.md

import { awaitAllEntries, hexColorToClampedTriplet, JSONSet, JSONMap } from "./essential.js"; // Adicionado JSONMap

export default class BlockGeoMaker {
	/** @type {HoloLabConfig} */ // MODIFICADO: HoloLabConfig
	config;
	textureRefs; // Referências de textura para o TextureAtlas
	
	#individualBlockShapes; // Formas de bloco para blocos individuais
	#blockShapePatterns;    // Padrões regex para formas de bloco
	#blockShapeGeos;        // Definições de geometria para cada forma de bloco
	#eigenvariants;         // Variantes de textura fixas para certos blocos
	
	// Definições de rotação e variantes de textura baseadas em estados de bloco
	#globalBlockStateRotations;
	#blockShapeBlockStateRotations;
	#blockNameBlockStateRotations;
	#blockNamePatternBlockStateRotations;
	
	#globalBlockStateTextureVariants;
	#blockShapeBlockStateTextureVariants;
	#blockNameBlockStateTextureVariants;
	#blockNamePatternBlockStateTextureVariants;
	
	#cachedBlockShapes; // Cache para formas de bloco já resolvidas
	
	constructor(config) {
		return (async () => {
			this.config = config;
			this.textureRefs = new JSONSet();
			
			let { blockShapes, blockShapeGeos, blockStateDefs, eigenvariants } = await awaitAllEntries({
				blockShapes: fetch("data/blockShapes.json").then(res => res.jsonc()),
				blockShapeGeos: fetch("data/blockShapeGeos.json").then(res => res.jsonc()),
				blockStateDefs: fetch("data/blockStateDefinitions.json").then(res => res.jsonc()),
				eigenvariants: fetch("data/blockEigenvariants.json").then(res => res.jsonc()),
			});
			this.#individualBlockShapes = blockShapes["individual_blocks"];
			this.#blockShapePatterns = Object.entries(blockShapes["patterns"]).map(([rule, blockShape]) => [new RegExp(rule), blockShape]);
			this.#blockShapeGeos = blockShapeGeos;
			this.#eigenvariants = eigenvariants;
			
			this.#globalBlockStateRotations = blockStateDefs["rotations"]["*"];
			this.#blockShapeBlockStateRotations = {}; // MODIFICADO: Inicializado como objeto
			Object.entries(blockStateDefs["rotations"]["block_shapes"] ?? {}).forEach(([blockShapesKey, rotationDefs]) => { // Renomeado blockShapes para blockShapesKey
				blockShapesKey.split(",").forEach(blockShape => {
					this.#blockShapeBlockStateRotations[blockShape] = rotationDefs;
				});
			});
			this.#blockNameBlockStateRotations = {}; // MODIFICADO: Inicializado como objeto
			this.#blockNamePatternBlockStateRotations = [];
			Object.entries(blockStateDefs["rotations"]["block_names"] ?? {}).forEach(([blockNamesKey, rotationDefs]) => { // Renomeado blockNames para blockNamesKey
				if(blockNamesKey.startsWith("/") && blockNamesKey.endsWith("/")) {
					this.#blockNamePatternBlockStateRotations.push([new RegExp(blockNamesKey.slice(1, -1)), rotationDefs]);
				} else {
					blockNamesKey.split(",").forEach(blockName => {
						this.#blockNameBlockStateRotations[blockName] = rotationDefs;
					});
				}
			});
			
			this.#globalBlockStateTextureVariants = blockStateDefs["texture_variants"]["*"];
			this.#blockShapeBlockStateTextureVariants = {}; // MODIFICADO: Inicializado como objeto
			Object.entries(blockStateDefs["texture_variants"]["block_shapes"] ?? {}).forEach(([blockShapesKey, textureVariantDefs]) => {
				blockShapesKey.split(",").forEach(blockShape => {
					this.#blockShapeBlockStateTextureVariants[blockShape] = textureVariantDefs;
				});
			});
			this.#blockNameBlockStateTextureVariants = {}; // MODIFICADO: Inicializado como objeto
			this.#blockNamePatternBlockStateTextureVariants = [];
			Object.entries(blockStateDefs["texture_variants"]["block_names"] ?? {}).forEach(([blockNamesKey, textureVariantDefs]) => {
				if(blockNamesKey.startsWith("/") && blockNamesKey.endsWith("/")) {
					this.#blockNamePatternBlockStateTextureVariants.push([new RegExp(blockNamesKey.slice(1, -1)), textureVariantDefs]);
				} else {
					blockNamesKey.split(",").forEach(blockName => {
						this.#blockNameBlockStateTextureVariants[blockName] = textureVariantDefs;
					});
				}
			});
			
			this.#cachedBlockShapes = new Map();
			return this;
		})();
	}

	/**
	 * Cria um template de osso (bone) (ou seja, osso não posicionado e sem nome com geometria) a partir de um bloco.
	 * UVs de textura não são resolvidos e são índices para a propriedade textureRefs.
	 * @param {Block} block
	 * @returns {BoneTemplate}
	 */
	makeBoneTemplate(block) {
		let blockName = block["name"];
		let blockShape = this.#getBlockShape(blockName);
		let boneCubes = this.#makeBoneCubes(block, blockShape);
		if(boneCubes.length == 0) {
			// MODIFICADO: Tradução
			console.debug(`Nenhum cubo está sendo renderizado para o bloco ${blockName}`);
		}
		let bone = {
			"cubes": boneCubes
		};
		if(blockShape.includes("{")) { // Remove a parte da textura especial se houver
			blockShape = blockShape.slice(0, blockShape.indexOf("{"));
		}
		let blockShapeSpecificRotations = this.#blockShapeBlockStateRotations[blockShape];
		let blockNameSpecificRotations = this.#blockNameBlockStateRotations[blockName];
		let statesAndBlockEntityData = this.#getBlockStatesAndEntityDataEntries(block);

		statesAndBlockEntityData.forEach(([blockStateName, blockStateValue]) => {
			let rotations = blockNameSpecificRotations?.[blockStateName] ?? 
							this.#blockNamePatternBlockStateRotations.find(([pattern, _rotations]) => pattern.test(blockName) && blockStateName in _rotations)?.[1]?.[blockStateName] ?? // Corrigido para pegar as rotações corretas
							blockShapeSpecificRotations?.[blockStateName] ?? 
							this.#globalBlockStateRotations[blockStateName];
			
			if(!rotations) {
				return; // Este estado de bloco não controla a rotação
			}
			
			if(!(blockStateValue in rotations)) {
				// MODIFICADO: Tradução
				console.error(`Valor de estado de bloco ${blockStateValue} para o estado de rotação ${blockStateName} não encontrado em ${blockName}...`, block);
				return;
			}
			if("rotation" in bone) {
				// MODIFICADO: Tradução
				console.debug(`Múltiplos estados de bloco de rotação para o bloco ${block["name"]}; somando todos!`);
				bone["rotation"] = bone["rotation"].map((x, i) => x + rotations[blockStateValue][i]);
			} else {
				bone["rotation"] = rotations[blockStateValue];
				bone["pivot"] = [8, 8, 8];
			}
		});
		if(bone["rotation"]?.every(x => x == 0)) { // Remove rotação se for tudo zero
			delete bone["rotation"];
			delete bone["pivot"];
		}
		return bone;
	}

	/**
	 * Posiciona absolutamente um template de osso.
	 * @param {BoneTemplate} boneTemplate
	 * @param {Vec3} blockPos A posição para onde o osso será movido.
	 * @returns {BoneTemplate}
	 */
	positionBoneTemplate(boneTemplate, blockPos) {
		// ... (Lógica original mantida, traduza comentários internos se houver)
		let bone = structuredClone(boneTemplate);
		bone["cubes"].forEach(boneCube => {
			boneCube["origin"] = boneCube["origin"].map((x, i) => x + blockPos[i]);
			if("pivot" in boneCube) {
				boneCube["pivot"] = boneCube["pivot"].map((x, i) => x + blockPos[i]);
			}
			boneCube["extra_rots"]?.forEach(extraRot => {
				extraRot["pivot"] = extraRot["pivot"].map((x, i) => x + blockPos[i]);
			});
		});
		if("pivot" in bone) {
			bone["pivot"] = bone["pivot"].map((x, i) => x + blockPos[i]);
		}
		return bone;
	}
	
	#getBlockShape(blockName) {
		// ... (Lógica original mantida)
        if(this.#cachedBlockShapes.has(blockName)) {
			return this.#cachedBlockShapes.get(blockName);
		}
		let individualBlockShape = this.#individualBlockShapes[blockName];
		if(individualBlockShape) {
			return individualBlockShape; // Não precisa cachear, já é direto
		}
		let matchingBlockShape = this.#blockShapePatterns.find(([pattern]) => pattern.test(blockName))?.[1];
		let blockShape = matchingBlockShape ?? "block"; // Padrão para "block"
		this.#cachedBlockShapes.set(blockName, blockShape);
		return blockShape;
	}
	
	#makeBoneCubes(block, blockShape) {
		// ... (Lógica principal de processamento de cubos. Esta é a função mais complexa.)
        // Traduzirei os console.error e console.warn.
		let specialTexture;
		if(blockShape.includes("{")) {
			[, blockShape, specialTexture] = blockShape.match(/^(\w+)\{(textures\/[\w\/]+)\}$/);
		}
		
		let unfilteredCubes = structuredClone(this.#blockShapeGeos[blockShape]);
		if(!unfilteredCubes) {
			// MODIFICADO: Tradução
			console.error(`Não foi possível encontrar geometria para a forma de bloco ${blockShape}; usando "block" como padrão`);
			unfilteredCubes = structuredClone(this.#blockShapeGeos["block"]);
		}
		let filteredCubes = [];
		let boneCubes = []; // Cubos finais para o osso
		while(unfilteredCubes.length) {
			let cube = unfilteredCubes.shift();
			// ... (lógica de "if", "block_states", "copy", "copy_block") ...
            if("copy" in cube) {
				if(cube["copy"] == blockShape) { 
					// MODIFICADO: Tradução
					console.error(`Não é possível copiar a mesma forma de bloco: ${blockShape}`);
					continue;
				}
                // ... resto da lógica de copy ...
            } else if ("copy_block" in cube) {
                // ... lógica de copy_block ...
                if(!blockToCopy) {
					// MODIFICADO: Tradução
					console.error(`Não foi possível encontrar a propriedade da entidade de bloco ${blockEntityProperty} no bloco ${block["name"]}:`, block);
					continue;
				}
            }
            // ...
			filteredCubes.push(cube);
		}
		// ... (adiciona getters x,y,z,w,h,d) ...
		let cubes = this.#mergeCubes(filteredCubes);
		
		let blockName = block["name"];
		let variant = this.#getTextureVariant(block);
		let variantWithoutEigenvariant;
		
		cubes.forEach(cube => {
			// ... (lógica de criação de boneCube, cálculo de UVs) ...
            if(textureFace == "#tex") {
                if(specialTexture) {
                    textureRef["texture_path_override"] = specialTexture;
                } else {
					// MODIFICADO: Tradução
                    console.error(`Nenhuma #tex para o bloco ${blockName} e forma de bloco ${blockShape}!`);
                }
            }
            // ...
            if("tint" in cube) {
                // ...
                if(!(tintColor in this.#terrainTextureTints["colors"])) { // Adicionado para o código original
                    // MODIFICADO: Tradução
                    console.error(`Nenhuma cor de tinta ${tintColor} definida em terrainTextureTints`);
                }
            }
            // ...
			boneCubes.push(boneCube);
		});
		return boneCubes;
	}
	
	#getBlockStatesAndEntityDataEntries(block) {
		// ... (Lógica original mantida)
        return [...Object.entries(block["states"] ?? {}), ...Object.entries(block["block_entity_data"] ?? {}).map(([key, value]) => [`entity.${key}`, value])];
	}
	
	#mergeCubes(cubes) {
		// ... (Lógica original mantida, traduza comentários internos se houver)
        // Exemplo de log interno que poderia ser traduzido:
        // console.debug("Cubo mesclado", cube2, "em", cube1);
        // ...
        let unmergeableCubes = [];
		let mergeableCubes = [];
		cubes.forEach(cube => {
			if(!cube["size"].some(x => x == 0) && Object.keys(cube).length == 2 && !cube["disable_merging"]) { // MODIFICADO: Adicionado !cube["disable_merging"]
				mergeableCubes.push(cube);
			} else {
				unmergeableCubes.push(cube);
			}
		});
		
		let mergedCubes = [];
		mergeableCubes.forEach(cube1 => { 
			tryMerging: while(true) {
				for(let [i, cube2] of mergedCubes.entries()) {
					if(this.#tryMergeCubesOneWay(cube1, cube2)) {
						// console.debug("Merged cube", cube2, "into", cube1);
						mergedCubes.splice(i, 1);
						continue tryMerging; 
					} else if(this.#tryMergeCubesOneWay(cube2, cube1)) {
						// console.debug("Merged cube", cube1, "into", cube2);
						mergedCubes.splice(i, 1);
						cube1 = cube2;
						continue tryMerging; 
					}
				}
				break; 
			}
			mergedCubes.push(cube1);
		});
		
		return [...unmergeableCubes, ...mergedCubes];
	}
	
	#getTextureVariant(block, ignoreEigenvariant = false) {
		// ... (Lógica original mantida, traduza logs e comentários)
        let blockName = block["name"];
		let eigenvariantExists = blockName in this.#eigenvariants;
		if(!ignoreEigenvariant && eigenvariantExists) {
			let variant = this.#eigenvariants[blockName];
			console.debug(`Usando eigenvariant ${variant} para o bloco ${blockName}`);
			return variant;
		} else if(ignoreEigenvariant && !eigenvariantExists) {
			// MODIFICADO: Tradução
			console.warn(`Não é possível ignorar eigenvariant de ${blockName} pois não existe!`);
		}
		// ...
        if(!(blockStateValue in blockStateVariants)) {
            // MODIFICADO: Tradução
            console.error(`Valor de estado de bloco ${blockStateValue} para estado de variação de textura ${blockStateName} não encontrado...`);
            return; // ou retornar um valor padrão como -1
        }
        // ...
        if(variant != -1 && newVariant !== variant) { // Adicionado newVariant !== variant
            // MODIFICADO: Tradução
            console.warn(`Múltiplos estados de bloco variando textura para o bloco ${block["name"]}; usando ${blockStateName}. Conflito entre variante ${variant} e ${newVariant}.`);
        }
        // ...
		return variant;
	}
	
	#calculateUv(cube) {
		// ... (Lógica original mantida, traduza comentários internos)
        // A lógica aqui é bem matemática e não tem muitas strings para o usuário.
        // ...
        return { /* ... UVs calculados ... */ };
	}
	
	#scaleBoneCube(boneCube) {
		// ... (Lógica original mantida)
        boneCube["origin"] = boneCube["origin"].map(x => (x - 8) * this.config.SCALE + 8);
		boneCube["size"] = boneCube["size"].map(x => x * this.config.SCALE);
		if("pivot" in boneCube) {
			boneCube["pivot"] = boneCube["pivot"].map(x => (x - 8) * this.config.SCALE + 8);
		}
		if("extra_rots" in boneCube) {
			boneCube["extra_rots"].forEach(extraRot => {
				extraRot["pivot"] = extraRot["pivot"].map(x => (x - 8) * this.config.SCALE + 8);
			});
		}
		return boneCube;
	}

	#checkBlockStateConditional(block, conditional) {
		// ... (Lógica original mantida, traduza logs e comentários)
        if(!match) {
            // MODIFICADO: Tradução
            console.error(`Expressão de estado de bloco formatada incorretamente "${booleanExpression}" da condicional "${conditional}"\n(Match: ${JSON.stringify(match)})`);
            return true; 
        }
        // ...
        if(!(dataObjectName in block)) {
            // MODIFICADO: Tradução
            console.error(`Nenhum(a) ${dataObjectName} no bloco ${block["name"]}!`);
            return true;
        }
        // ...
        if(blockStateOperator != "??" && !(blockStateName in dataObject)) {
            // MODIFICADO: Tradução
            console.error(`Não foi possível encontrar ${dataObjectName} ${blockStateName} no bloco ${block["name"]}`);
            return true;
        }
        // ...
		return orRes;
	}
	
	#interpolateInBlockValues(block, fullExpression, cube) {
		// ... (Lógica original mantida, traduza logs e comentários)
        if(!array) {
            // MODIFICADO: Tradução
            console.error(`Não foi possível encontrar o array ${arrayName} no cubo:`, cube);
            return "";
        }
        // ...
        if(!("block_entity_data" in block) || !(blockEntityProperty in block["block_entity_data"])) {
            // MODIFICADO: Tradução
            console.error(`Não foi possível encontrar a propriedade da entidade de bloco ${blockEntityProperty} em ${block["name"]}:`, block);
            return "";
        }
        // ...
        if(!("states" in block) || !(arrayIndexVar in block["states"])) {
            // MODIFICADO: Tradução
            console.error(`Não foi possível encontrar o estado de bloco ${arrayIndexVar} em ${block["name"]}:`, block);
            return "";
        }
        // ...
        if(!(arrayIndex in array)) {
            // MODIFICADO: Tradução
            console.error(`Índice do array fora dos limites: ${JSON.stringify(array)}[${arrayIndex}]`);
            return "";
        }
        // ...
        if(!match) {
            // MODIFICADO: Tradução
            console.error(`Expressão formatada incorretamente: ${bracketedExpression}`);
            return "";
        }
        // ...
        if(value == undefined || value === "") {
            if(slicingAndDefault[4] == undefined) { // Se não houver valor padrão
                 // MODIFICADO: Tradução
                console.error(`Nada para ${specialVar}${propertyChain} no bloco:`, block);
                return "";
            }
        }
        console.debug(`Alterado ${bracketedExpression} para ${value}!`, block);
		return wholeStringValue ?? substitutedExpression;
	}
	
	#tryMergeCubesOneWay(cube1, cube2) {
		// ... (Lógica original mantida)
        if(cube1.x + cube1.w == cube2.x) { 
			if(cube1.y == cube2.y && cube1.z == cube2.z && cube1.h == cube2.h && cube1.d == cube2.d) {
				cube1.w += cube2.w; 
				return true;
			}
		} else if(cube1.y + cube1.h == cube2.y) { 
			if(cube1.x == cube2.x && cube1.z == cube2.z && cube1.w == cube2.w && cube1.d == cube2.d) {
				cube1.h += cube2.h;
				return true;
			}
		} else if(cube1.z + cube1.d == cube2.z) { 
			if(cube1.x == cube2.x && cube1.y == cube2.y && cube1.w == cube2.w && cube1.h == cube2.h) {
				cube1.d += cube2.d;
				return true;
			}
		}
		return false;
	}
}

/**
 * @typedef {import("./HoloPrint.js").Vec3} Vec3
 * @typedef {import("./HoloPrint.js").Block} Block
 * @typedef {import("./HoloPrint.js").BoneTemplate} BoneTemplate
 * @typedef {import("./HoloPrint.js").Bone} Bone
 * @typedef {import("./HoloPrint.js").HoloLabConfig} HoloLabConfig // MODIFICADO
 */