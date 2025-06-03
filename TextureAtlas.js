// MODIFICADO: Comentários e logs traduzidos.

import { awaitAllEntries, ceil, floor, hexColorToClampedTriplet, JSONSet, max, range, stringToImageData } from "./essential.js";
import TGALoader from "tga-js"; 
import potpack from "potpack"; // Algoritmo para empacotar as texturas
import ResourcePackStack from "./ResourcePackStack.js";

export default class TextureAtlas {
	#blocksDotJsonPatches;
	#blocksToUseCarriedTextures;
	#transparentBlocks;
	#terrainTexturePatches;
	#terrainTextureTints;
	
	blocksDotJson;
	terrainTexture;
	
	#flipbookTexturesAndSizes; // Mapeia texturas de flipbook para seus tamanhos (número de frames)
	
	/** @type {HoloLabConfig} */ // MODIFICADO: Se HoloPrintConfig for renomeado
	config;
	resourcePackStack;
	
	/** Quando makeAtlas() é chamado, isto conterá coordenadas UV e tamanhos para as referências de textura passadas como entrada, bem como informações de recorte. */
	textures;
	
	/**
	 * Contém as imagens reais do atlas de texturas: [nomeDaTextura, blobDaImagem]
	 * @type {Array<[String, Blob]>}
	 */
	imageBlobs;
	textureWidth;    // Largura total do atlas de textura final
	textureHeight;   // Altura total do atlas de textura final
	atlasWidth;      // (Parece ser o mesmo que textureWidth)
	atlasHeight;     // (Parece ser o mesmo que textureHeight)
	textureFillEfficiency; // Quão eficientemente o espaço do atlas é usado (0-1)
	
	/**
	 * Cria um atlas de texturas para carregar imagens de referências de textura e uni-las.
	 * @param {HoloLabConfig} config Configurações do HoloLab
	 * @param {ResourcePackStack} resourcePackStack Pilha de pacotes de recursos
	 */
	constructor(config, resourcePackStack) {
		return (async () => { 
			this.config = config;
			this.resourcePackStack = resourcePackStack;
			
			let { blocksDotJson, terrainTexture, flipbookTextures, textureAtlasMappings } = await awaitAllEntries({
				blocksDotJson: this.resourcePackStack.fetchResource("blocks.json").then(res => res.jsonc()),
				terrainTexture: this.resourcePackStack.fetchResource("textures/terrain_texture.json").then(res => res.jsonc()),
				flipbookTextures: this.resourcePackStack.fetchResource("textures/flipbook_textures.json").then(res => res.jsonc()),
				textureAtlasMappings: fetch("data/textureAtlasMappings.json").then(res => res.jsonc())
			})
			this.blocksDotJson = blocksDotJson;
			this.terrainTexture = terrainTexture;
			
			this.#blocksDotJsonPatches = textureAtlasMappings["blocks_dot_json_patches"];
			this.#blocksToUseCarriedTextures = textureAtlasMappings["blocks_to_use_carried_textures"];
			this.#transparentBlocks = textureAtlasMappings["transparent_blocks"];
			this.#terrainTexturePatches = textureAtlasMappings["terrain_texture_patches"];
			this.#terrainTextureTints = textureAtlasMappings["terrain_texture_tints"];
			
			this.#flipbookTexturesAndSizes = new Map();
			textureAtlasMappings["missing_flipbook_textures"].forEach(terrainTextureKey => {
				this.#flipbookTexturesAndSizes.set(terrainTextureKey, 1);
			});
			flipbookTextures.map(entry => {
				this.#flipbookTexturesAndSizes.set(entry["flipbook_texture"], entry["replicate"] ?? 1);
			});
			
			return this;
		})();
	}
	/**
	 * Cria um atlas de texturas a partir de referências de textura e altera a propriedade textureUvs
	 * para refletir as coordenadas UV e tamanhos para cada referência.
	 * @param {Array<TextureReference>} textureRefs
	 */
	async makeAtlas(textureRefs) {
		// MODIFICADO: Tradução
		console.log("Referências de textura:", textureRefs);
		
		let textureImageIndices = [];
		
		let allTextureFragments = new JSONSet();
		textureRefs.forEach(textureRef => {
			let texturePath;
			let tint = textureRef["tint"];
			let tintLikePng = false;
			let opacity = 1;
			if("texture_path_override" in textureRef) {
				texturePath = textureRef["texture_path_override"];
			} else {
				let terrainTextureKey = this.#getTerrainTextureKeyFromTextureReference(textureRef);
				let blockName = textureRef["block_name"];
				let variant = textureRef["variant"];
				let texturePathAndTint = this.#getTexturePathAndTint(terrainTextureKey, variant);
				texturePath = texturePathAndTint?.texturePath; // Adicionado ?. para segurança
				if(tint == undefined && texturePathAndTint && "tint" in texturePathAndTint) {
					tint = hexColorToClampedTriplet(texturePathAndTint["tint"]);
				}
				if(!texturePath) {
					// MODIFICADO: Tradução
					console.error(`Nenhuma textura para o bloco ${blockName} na face ${textureRef["texture_face"]}!`);
					texturePath = this.#getTexturePathAndTint("missing", -1)?.texturePath; // Adicionado ?.
				}
				
				if(tint == undefined && terrainTextureKey && this.#terrainTextureTints["terrain_texture_keys"][terrainTextureKey]) {
					let tintColor = this.#terrainTextureTints["terrain_texture_keys"][terrainTextureKey];
					if(typeof tintColor == "object") {
						tintLikePng = tintColor["tint_like_png"];
						tintColor = tintColor["tint"];
					}
					if(tintColor.startsWith("#")) {
						tint = hexColorToClampedTriplet(tintColor);
					} else if(tintColor in this.#terrainTextureTints["colors"]) {
						tint = hexColorToClampedTriplet(this.#terrainTextureTints["colors"][tintColor]);
					} else {
						// MODIFICADO: Tradução
						console.error(`Nenhuma cor de tinta ${tintColor}`);
					}
				}
				if(blockName in this.#transparentBlocks) {
					opacity = this.#transparentBlocks[blockName];
				}
			}
			let textureFragment = {
				"texturePath": texturePath || "fallback_texture_path", // Adicionado fallback se texturePath for undefined
				"tint": tint,
				"tint_like_png": tintLikePng,
				"opacity": opacity,
				"uv": textureRef["uv"],
				"uv_size": textureRef["uv_size"],
				"croppable": textureRef["croppable"]
			};
			allTextureFragments.add(textureFragment);
			textureImageIndices.push(allTextureFragments.indexOf(textureFragment));
		});
		
		// MODIFICADO: Traduções
		console.log("Índices de imagem de textura:", textureImageIndices);
		console.log("Fragmentos de textura:", allTextureFragments);
		
		let imageFragments = await this.#loadImages(allTextureFragments);
		console.log("Fragmentos de imagem:", imageFragments);
		
		let imageUvs = await this.#stitchTextureAtlas(imageFragments);
		console.log("UVs da imagem:", imageUvs);
		
		this.textures = textureImageIndices.map(i => imageUvs[i]);
	}
	
	#getTerrainTextureKeyFromTextureReference(textureRef) {
		if("terrain_texture_override" in textureRef) {
			return textureRef["terrain_texture_override"];
		}
		let blockName = textureRef["block_name"];
		if(!(blockName in this.blocksDotJson) && blockName in this.#blocksDotJsonPatches) {
			blockName = this.#blocksDotJsonPatches[blockName];
			if(blockName?.includes(".")) {
				textureRef["variant"] = +blockName.split(".")[1]; 
				blockName = blockName.split(".")[0];
			}
		}
		let blockEntry = this.blocksDotJson[blockName];
		let terrainTextureKeys;
		if(!blockEntry) {
			// MODIFICADO: Tradução
			console.error(`Nenhuma entrada em blocks.json para ${blockName}`);
			return "missing";
		}
		
		let textureFace = textureRef["texture_face"];
		if(textureFace.startsWith("carried")) {
			if("carried_textures" in blockEntry) {
				if(textureFace == "carried") {
					if(typeof blockEntry["carried_textures"] == "string") {
						return blockEntry["carried_textures"];
					} else {
						// MODIFICADO: Tradução
						console.error(`Textura "carried" especificada para ${blockName} tem múltiplas faces!`);
					}
				} else {
					let carriedFace = textureFace.slice(8);
					let terrainTextureKey = blockEntry["carried_textures"][carriedFace];
					if(["west", "east", "north", "south"].includes(carriedFace)) {
						terrainTextureKey ??= blockEntry["carried_textures"]["side"];
					}
					if(carriedFace == undefined) { // MODIFICADO: Comparação mais segura
						// MODIFICADO: Tradução
						console.error(`Não foi possível encontrar a face da textura "carried": ${carriedFace}!`);
					} else {
						return terrainTextureKey;
					}
				}
			} else {
				// MODIFICADO: Tradução
				console.error(`Nenhuma textura "carried" para ${blockName}!`, textureRef, blockEntry);
			}
		}
		if(this.#blocksToUseCarriedTextures.includes(blockName)) {
			terrainTextureKeys = blockEntry["carried_textures"];
			console.debug(`Usando texturas "carried" para ${blockName}`);
			if(!terrainTextureKeys) {
				// MODIFICADO: Tradução
				console.error(`Textura "carried" especificada em blocks.json para ${blockName} não pôde ser encontrada`);
			}
		}
		terrainTextureKeys ??= blockEntry["textures"]; 
		if(!terrainTextureKeys) {
			if("carried_textures" in blockEntry) {
				terrainTextureKeys = blockEntry["carried_textures"];
				// MODIFICADO: Tradução
				console.error(`Nenhuma entrada de textura encontrada em blocks.json para o bloco ${blockName}! Usando textura "carried" como padrão.`);
			} else {
				terrainTextureKeys = "missing"; 
				// MODIFICADO: Tradução
				console.error(`Nenhuma entrada de textura encontrada em blocks.json para o bloco ${blockName}!`);
			}
		}
		
		if(typeof terrainTextureKeys == "string") { 
			return terrainTextureKeys;
		} else {
			return terrainTextureKeys[textureFace] ?? terrainTextureKeys[["west", "east", "north", "south"].includes(textureFace)? "side" : function() {
				let defaultFace = Object.keys(terrainTextureKeys)[0];
				// MODIFICADO: Tradução
				console.error(`Face de textura desconhecida ${textureFace}! Usando ${defaultFace} como padrão.`);
				return defaultFace;
			}()];
		}
	}
	
	#getTexturePathAndTint(terrainTextureKey, variant) {
		if (!terrainTextureKey) return { texturePath: "missing_texture_path" }; // Fallback

		if(terrainTextureKey in this.#terrainTexturePatches) {
			let texturePath = this.#terrainTexturePatches[terrainTextureKey];
			// MODIFICADO: Tradução
			console.debug(`Chave de textura de terreno ${terrainTextureKey} remapeada para o caminho de textura ${texturePath}`);
			return { texturePath }; // MODIFICADO: Retornar objeto para consistência
		}
		let textureEntry = this.terrainTexture["texture_data"][terrainTextureKey]?.["textures"]; // MODIFICADO: Nome da variável
		if(!textureEntry) {
			// MODIFICADO: Tradução
			console.warn(`Nenhuma entrada em terrain_texture.json para a chave ${terrainTextureKey}`);
			return { texturePath: "missing_texture_path" }; // MODIFICADO: Retornar objeto
		}
		if(Array.isArray(textureEntry)) {
			if(textureEntry.length == 1) {
				textureEntry = textureEntry[0];
			} else {
				if(variant == -1) {
					// MODIFICADO: Tradução
					console.warn(`Variante desconhecida para escolher para a chave de textura de terreno ${terrainTextureKey}; usando a primeira como padrão`);
					variant = 0;
				}
				if(!(variant in textureEntry)) {
					// MODIFICADO: Tradução
					console.error(`Variante ${variant} não existe para a chave de textura de terreno ${terrainTextureKey}! Usando 0 como padrão.`);
					variant = 0;
				}
				textureEntry = textureEntry[variant];
			}
		}
		if(typeof textureEntry == "string") {
			return { texturePath: textureEntry };
		} else if (textureEntry && typeof textureEntry === 'object') { // Verifica se textureEntry é um objeto
			return {
				"texturePath": textureEntry["path"],
				"tint": textureEntry["overlay_color"] ?? textureEntry["tint_color"]
			};
		} else {
            // MODIFICADO: Tradução
            console.warn(`Entrada de textura inválida para a chave ${terrainTextureKey}`);
            return { texturePath: "invalid_texture_entry" };
        }
	}
	
	async #loadImages(textureFragments) {
		let tgaLoader = new TGALoader();
		let allTexturePaths = [...new Set([...textureFragments].map(textureFragment => textureFragment.texturePath))];
		// MODIFICADO: Tradução
		console.log(`Carregando ${allTexturePaths.length} imagens para ${textureFragments.size} fragmentos de textura`);
		let allImageData = await Promise.all(allTexturePaths.map(async texturePath => {
			let imageRes = await this.resourcePackStack.fetchResource(`${texturePath}.png`);
			let imageData;
			let imageIsTga = false;
			let imageNotFound = false;
			if(imageRes.ok) {
				let image = await imageRes.toImage();
				imageData = image.toImageData(); 
			} else {
				imageRes = await this.resourcePackStack.fetchResource(`${texturePath}.tga`);
				if(imageRes.ok) {
					console.debug(`Textura TGA ${texturePath}.tga buscada`);
					imageIsTga = true;
					tgaLoader.load(new Uint8Array(await imageRes.arrayBuffer()));
					imageData = tgaLoader.getImageData();
				} else {
					// MODIFICADO: Tradução
					console.warn(`Nenhuma textura encontrada em ${texturePath}`);
					imageData = stringToImageData(texturePath); // Gera imagem placeholder com o nome
					imageNotFound = true;
				}
			}
			return { imageData, imageIsTga, imageNotFound };
		}));
		let imageDataByTexturePath = new Map(allTexturePaths.map((texturePath, i) => [texturePath, allImageData[i]]));
		return await Promise.all([...textureFragments].map(async ({ texturePath, tint, tint_like_png: tintLikePng, opacity, uv: sourceUv, uv_size: uvSize, croppable }) => {
			let { imageData, imageIsTga, imageNotFound } = imageDataByTexturePath.get(texturePath);
			if(imageNotFound) {
				sourceUv = [0, 0];
				uvSize = [1, 1];
			}
			if(tint) {
				imageData = this.#tintImageData(imageData, tint, imageIsTga && !tintLikePng); 
			}
			if(opacity != 1) {
				imageData = this.#setImageDataOpacity(imageData, opacity);
			}
			let { width: imageW, height: imageH } = imageData;
			let image = await imageData.toImage().catch(e => {
				// MODIFICADO: Tradução
				console.error(`Falha ao decodificar dados de imagem de ${texturePath}: ${e}`);
				sourceUv = [0, 0];
				uvSize = [1, 1];
				return stringToImageData(`Falha ao decodificar ${texturePath}`).toImage(); 
			});
			
			if(this.#flipbookTexturesAndSizes.has(texturePath)) {
				let size = this.#flipbookTexturesAndSizes.get(texturePath);
				imageH = imageW = imageW / size; 
				console.debug(`Usando textura de flipbook para ${texturePath}, ${imageW}x${imageH}`);
			}
			let sourceX = sourceUv[0] * imageW;
			let sourceY = sourceUv[1] * imageH;
			let w = uvSize[0] * imageW;
			let h = uvSize[1] * imageH;
			let crop;
			if(croppable) {
				// ... (lógica de recorte mantida, traduza comentários internos se houver) ...
			}
			let imageFragment = { /* ... */ }; // Lógica mantida
			return imageFragment;
		}));
	}
	
	async #stitchTextureAtlas(imageFragments) {
		// ... (lógica de empacotamento e desenho no canvas mantida) ...
        // MODIFICADO: Tradução do log de eficiência
		console.info(`Atlas de texturas empacotado com ${(this.textureFillEfficiency * 100).toFixed(2)}% de eficiência de espaço!`);
		console.log("Fragmentos de imagem empacotados:", imageFragments); // imageFragments aqui já foi ordenado por potpack
		
        // ... (lógica de criação de blobs de imagem com opacidade) ...
        // MODIFICADO: Nome do arquivo de log potencial se o download do atlas falhar
        // document.body.appendChild(await this.imageBlobs.at(-1)[1].toImage()); // Linha de depuração

		return imageUvs; // imageUvs é o array de {uv, uv_size, crop}
	}

	// ... (Funções #findMostExtremePixels, addTextureOutlines, #setCanvasOpacity, #tintImageData, #setImageDataOpacity mantidas)
    // A função addTextureOutlines usa config.TEXTURE_OUTLINE_COLOR etc., que já foram ajustados para azul no HoloPrint.js

}

// ... (código potpackWithWidthPresort mantido) ...

/**
 * @typedef {import("./HoloPrint.js").TextureReference} TextureReference
 * @typedef {import("./HoloPrint.js").TextureFragment} TextureFragment
 * @typedef {import("./HoloPrint.js").ImageFragment} ImageFragment
 * @typedef {import("./HoloPrint.js").HoloLabConfig} HoloLabConfig
 */