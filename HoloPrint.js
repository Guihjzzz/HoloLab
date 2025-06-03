// MODIFICADO: Arquivo principal da lógica de geração do pacote HoloLab
// Comentários e logs traduzidos. Nomes de funções e variáveis internas majoritariamente mantidos.

import * as NBT from "nbtify";
import { ZipWriter, TextReader, BlobWriter, BlobReader, ZipReader } from "@zip.js/zip.js";

import BlockGeoMaker from "./BlockGeoMaker.js";
import TextureAtlas from "./TextureAtlas.js";
import MaterialList from "./MaterialList.js";
import PreviewRenderer from "./PreviewRenderer.js";

import * as entityScripts from "./entityScripts.molang.js";
import { 
    addPaddingToImage, arrayMin, awaitAllEntries, CachingFetcher, 
    concatenateFiles, createNumericEnum, desparseArray, exp, floor, 
    getFileExtension, hexColorToClampedTriplet, JSONMap, JSONSet, lcm, 
    max, min, overlaySquareImages, pi, resizeImageToBlob, round, sha256, 
    UserError 
} from "./essential.js";
import ResourcePackStack from "./ResourcePackStack.js";
import BlockUpdater from "./BlockUpdater.js";

export const VERSION = "1.0.0-HoloLab";
export const NOME_FERRAMENTA = "HoloLab";

export const IGNORED_BLOCKS = ["air", "piston_arm_collision", "sticky_piston_arm_collision"];
const IGNORED_BLOCK_ENTITIES = ["Beacon", "Beehive", "Bell", "BrewingStand", "ChiseledBookshelf", "CommandBlock", "Comparator", "Conduit", "EnchantTable", "EndGateway", "JigsawBlock", "Lodestone", "SculkCatalyst", "SculkShrieker", "SculkSensor", "CalibratedSculkSensor", "StructureBlock", "BrushableBlock", "TrialSpawner", "Vault"];

export const PLAYER_CONTROL_NAMES = {
	TOGGLE_RENDERING: "player_controls.toggle_rendering",
	CHANGE_OPACITY: "player_controls.change_opacity",
	TOGGLE_TINT: "player_controls.toggle_tint",
	TOGGLE_VALIDATING: "player_controls.toggle_validating",
	CHANGE_LAYER: "player_controls.change_layer",
	DECREASE_LAYER: "player_controls.decrease_layer",
	CHANGE_LAYER_MODE: "player_controls.change_layer_mode",
	MOVE_HOLOGRAM: "player_controls.move_hologram",
	ROTATE_HOLOGRAM: "player_controls.rotate_hologram",
	CHANGE_STRUCTURE: "player_controls.change_structure",
	DISABLE_PLAYER_CONTROLS: "player_controls.disable_player_controls",
	BACKUP_HOLOGRAM: "player_controls.backup_hologram"
};
export const DEFAULT_PLAYER_CONTROLS = {
	TOGGLE_RENDERING: createItemCriteria("brick"),
	CHANGE_OPACITY: createItemCriteria("amethyst_shard"),
	TOGGLE_TINT: createItemCriteria("white_dye"),
	TOGGLE_VALIDATING: createItemCriteria("iron_ingot"),
	CHANGE_LAYER: createItemCriteria("leather"),
	DECREASE_LAYER: createItemCriteria("feather"),
	CHANGE_LAYER_MODE: createItemCriteria("flint"),
	MOVE_HOLOGRAM: createItemCriteria("stick"),
	ROTATE_HOLOGRAM: createItemCriteria("copper_ingot"),
	CHANGE_STRUCTURE: createItemCriteria("arrow"),
	DISABLE_PLAYER_CONTROLS: createItemCriteria("bone"),
	BACKUP_HOLOGRAM: createItemCriteria("paper")
};

const HOLOGRAM_LAYER_MODES = createNumericEnum(["SINGLE", "ALL_BELOW"]);

/**
 * Gera um pacote de recursos HoloLab a partir de um arquivo de estrutura.
 * @param {File|Array<File>} structureFiles Arquivo(s) de estrutura (`*.mcstructure`)
 * @param {HoloLabConfig} [config] Configurações do HoloLab
 * @param {ResourcePackStack} [resourcePackStack]
 * @param {HTMLElement} [previewCont] Contêiner para a pré-visualização
 * @returns {Promise<File>} Pacote de recursos (`*.mcpack`)
 */
export async function makePack(structureFiles, config = {}, resourcePackStack, previewCont) {
	console.info(`Executando ${NOME_FERRAMENTA} ${VERSION}`);
	if(!resourcePackStack) {
		console.debug("Aguardando inicialização da pilha de pacotes de recursos...");
		resourcePackStack = await new ResourcePackStack();
		console.debug("Pilha de pacotes de recursos inicializada!");
	}
	let startTime = performance.now();
	
	config = addDefaultConfig(config); 
	if(!Array.isArray(structureFiles)) {
		structureFiles = [structureFiles];
	}
	let nbts = await Promise.all(structureFiles.map(structureFile => readStructureNBT(structureFile)));
	console.info("Leitura dos NBTs das estruturas finalizada!");
	console.log("NBTs:", nbts);
	let structureSizes = nbts.map(nbt => nbt["size"].map(x => +x)); 
	let packName = config.PACK_NAME ?? getDefaultPackName(structureFiles);
	
    let manifestTemplate = await fetch("packTemplate/manifest.json").then(res => res.jsonc())
        .catch(err => {
            console.error("Erro ao carregar o template manifest.json do pacote. Usando fallback:", err);
            return {
                format_version: 2, header: { name: packName, description: "pack.description", uuid: crypto.randomUUID(), version: [1,0,0], min_engine_version: [1,16,0]},
                modules: [{ type: "resources", uuid: crypto.randomUUID(), version: [1,0,0]}], metadata: { authors: [], generated_with: {}, license: "CC BY-NC-SA 4.0", url:""}, settings: [], subpacks: []
            };
        });

    let packIconBlob;
    if (config.CUSTOM_PACK_ICON_URL) {
        try {
            const response = await fetch(config.CUSTOM_PACK_ICON_URL);
            if (response.ok) {
                packIconBlob = await response.blob();
                console.info("Ícone do pacote carregado da URL personalizada.");
            } else {
                console.warn(`Falha ao carregar o ícone da URL: ${config.CUSTOM_PACK_ICON_URL}. Status: ${response.status}. Usando fallback.`);
            }
        } catch (error) {
            console.warn(`Erro ao buscar o ícone da URL: ${config.CUSTOM_PACK_ICON_URL}. Usando fallback.`, error);
        }
    }
    if (!packIconBlob && config.PACK_ICON_BLOB && config.PACK_ICON_BLOB.size > 0) {
        packIconBlob = config.PACK_ICON_BLOB;
        console.info("Usando ícone do pacote fornecido no formulário.");
    }
    if (!packIconBlob) {
        console.info("Nenhum ícone personalizado ou do formulário fornecido. Gerando ícone dinâmico.");
        packIconBlob = await makePackIcon(concatenateFiles(structureFiles), config);
    }

	let loadedStuff = await carregarRecursos({ // MODIFICADO: Renomeado para carregarRecursos
		packTemplate: {
			hologramRenderControllers: "render_controllers/armor_stand.hologram.render_controllers.json",
			hologramGeo: "models/entity/armor_stand.hologram.geo.json", 
			hologramMaterial: "materials/entity.material",
			hologramAnimationControllers: "animation_controllers/armor_stand.hologram.animation_controllers.json",
			hologramAnimations: "animations/armor_stand.hologram.animation.json",
			boundingBoxOutlineParticle: "particles/bounding_box_outline.json",
			blockValidationParticle: "particles/block_validation.json", // Template para partículas de validação
			savingBackupParticle: "particles/saving_backup.json",
			singleWhitePixelTexture: "textures/particle/single_white_pixel.png",
			exclamationMarkTexture: "textures/particle/exclamation_mark.png",
			saveIconTexture: "textures/particle/save_icon.png",
			itemTextureJsonTemplate: config.RETEXTURE_CONTROL_ITEMS? "textures/item_texture.json" : undefined,
			terrainTextureJsonTemplate: config.RETEXTURE_CONTROL_ITEMS? "textures/terrain_texture.json" : undefined, 
			hudScreenUI: config.MATERIAL_LIST_ENABLED? "ui/hud_screen.json" : undefined,
			customEmojiFont: "font/glyph_E2.png",
			packLanguagesJson: "packTemplate/texts/languages.json" 
		},
		resources: { // Estes são carregados através do ResourcePackStack (vanilla + locais)
			entityFile: "entity/armor_stand.entity.json",
			defaultPlayerRenderControllers: config.PLAYER_CONTROLS_ENABLED? "render_controllers/player.render_controllers.json" : undefined,
			resourceItemTexture: config.RETEXTURE_CONTROL_ITEMS? "textures/item_texture.json" : undefined
		},
		otherFiles: {
			// packIcon já é packIconBlob
			itemIcons: config.RETEXTURE_CONTROL_ITEMS? fetch("data/itemIcons.json").then(res => res.jsonc()) : undefined
		},
		data: { 
			blockMetadata: "metadata/vanilladata_modules/mojang-blocks.json",
			itemMetadata: "metadata/vanilladata_modules/mojang-items.json"
		}
	}, resourcePackStack);

	let { 
        entityFile, hologramRenderControllers, defaultPlayerRenderControllers, 
        hologramGeo, hologramMaterial, hologramAnimationControllers, hologramAnimations, 
        boundingBoxOutlineParticle, blockValidationParticle, savingBackupParticle, 
        singleWhitePixelTexture, exclamationMarkTexture, saveIconTexture, 
        itemTextureJsonTemplate, terrainTextureJsonTemplate, hudScreenUI, customEmojiFont, 
        packLanguagesJson, resourceItemTexture, itemIcons 
    } = loadedStuff.files;
	let { blockMetadata, itemMetadata } = loadedStuff.data;
	
    let packLangFileContents = {}; // Conteúdo dos arquivos .lang do packTemplate
    const languagesToProcessForPack = packLanguagesJson && Array.isArray(packLanguagesJson) ? packLanguagesJson : ["en_US"]; 

    for (const languageCode of languagesToProcessForPack) {
        try {
            const langContent = await fetch(`packTemplate/texts/${languageCode}.lang`).then(res => res.ok ? res.text() : Promise.reject(`Falha ao carregar ${languageCode}.lang do template`));
            packLangFileContents[languageCode] = langContent;
        } catch (error) {
            console.warn(`Não foi possível carregar o arquivo de idioma do template do pacote: ${languageCode}.lang. Erro: ${error}`);
            packLangFileContents[languageCode] = `pack.name=${packName}\npack.description=${config.PACK_LANG_DESCRIPTION_DEVELOPER_LINE || `Pacote ${NOME_FERRAMENTA}`}`;
        }
    }
	
	let structures = nbts.map(nbt => nbt["structure"]);
	
	let palettesAndIndices = await Promise.all(structures.map(structure => tweakBlockPalette(structure, config.IGNORED_BLOCKS)));
	let { palette: blockPalette, indices: allStructureIndicesByLayer } = mergeMultiplePalettesAndIndices(palettesAndIndices);
	if(desparseArray(blockPalette).length == 0) {
		throw new UserError(`A estrutura está vazia! Não há blocos dentro da estrutura.`);
	}
	console.log("Paleta combinada: ", blockPalette);
	console.log("Índices remapeados: ", allStructureIndicesByLayer);
	
	let blockGeoMaker = await new BlockGeoMaker(config);
	let boneTemplatePalette = blockPalette.map(block => blockGeoMaker.makeBoneTemplate(block));
	console.info("Templates de geometria de bloco finalizados!");
	
	let textureAtlas = await new TextureAtlas(config, resourcePackStack);
	let textureRefs = [...blockGeoMaker.textureRefs];
	await textureAtlas.makeAtlas(textureRefs); 
	let textureBlobs = textureAtlas.imageBlobs; // Array de [nomeTextura, blobTextura]
	let defaultTextureIndex = max(textureBlobs.length - 3, 0); 
	
	console.log("UVs da Textura do Atlas:", textureAtlas.textures);
    // A lógica de aplicar UVs aos boneTemplates e criar as geometrias dinâmicas para cada estrutura
    // é complexa e precisa ser portada da função `Ut` original.
    // Isso inclui popular `hologramGeo["minecraft:geometry"]`, `entityDescription["geometry"]`,
    // `hologramRenderControllers`, `hologramAnimations`, `hologramAnimationControllers`.

    // --- INÍCIO DA LÓGICA DE GERAÇÃO DE CONTEÚDO DINÂMICO (PORTAR DE Ut) ---
    let finalHologramGeo = structuredClone(hologramGeo);
    let finalHologramAnimations = structuredClone(hologramAnimations);
    let finalHologramAnimControllers = structuredClone(hologramAnimationControllers);
    let finalEntityFile = structuredClone(entityFile);
    let finalHologramRenderControllers = structuredClone(hologramRenderControllers);
    let finalHudScreenUI = config.MATERIAL_LIST_ENABLED ? structuredClone(hudScreenUI) : null;
    let finalItemTextureJson = config.RETEXTURE_CONTROL_ITEMS ? structuredClone(itemTextureJsonTemplate || {texture_data:{}}) : null;
    let finalTerrainTextureJson = config.RETEXTURE_CONTROL_ITEMS ? structuredClone(terrainTextureJsonTemplate || {texture_data:{}}) : null; // Para o caso de texturas de controle serem blocos

    let uniqueBlocksToValidate = new Set(); // Para partículas de validação
    let totalBlockCountForPreview = 0;
    // ... (toda a lógica de loops sobre estruturas, camadas, blocos, criação de ossos, etc.) ...
    // Exemplo simplificado de acesso:
    // finalEntityFile["minecraft:client_entity"]["description"]["scripts"]["initialize"].push(...)
    // finalHologramGeo["minecraft:geometry"].push(geoEstruturaClonada);
    // finalHologramRenderControllers["render_controllers"]["controller.render.armor_stand.hologram"]["arrays"]["geometries"]["Array.geometries"].push(...)
    // ... (ajustar overlay_color no render controller com base na config.TINT_COLOR) ...
    // ... (popular uniqueBlocksToValidate)
    // ... (cálculo de totalBlockCountForPreview)
    // --- FIM DA LÓGICA DE GERAÇÃO DE CONTEÚDO DINÂMICO ---


    // --- MANIFEST E ARQUIVOS DE IDIOMA (LÓGICA REFINADA) ---
    let finalManifest = structuredClone(manifestTemplate);

	finalManifest.header.name = packName; 
	finalManifest.header.uuid = crypto.randomUUID();
	let packToolVersionArray = VERSION.match(/^v?(\d+)\.(\d+)\.(\d+)/)?.slice(1)?.map(x => +x) ?? [1, 0, 0];
	finalManifest.header.version = packToolVersionArray;
    if (finalManifest.modules && finalManifest.modules[0]) {
        finalManifest.modules[0].uuid = crypto.randomUUID();
        finalManifest.modules[0].version = packToolVersionArray;
    } else {
        console.warn("Estrutura de 'modules' inesperada no template do manifest.json. Criando um módulo padrão.");
        finalManifest.modules = [{ type: "resources", uuid: crypto.randomUUID(), version: packToolVersionArray }];
    }

    finalManifest.metadata.authors = [config.MANIFEST_AUTHOR_TOOL_NAME, `§c${config.MANIFEST_AUTHOR_TIKTOK_NAME}§r`];
    if(config.AUTHORS && config.AUTHORS.length) {
        finalManifest.metadata.authors.push(...config.AUTHORS);
    }
    finalManifest.metadata.authors = [...new Set(finalManifest.metadata.authors)]; 

    finalManifest.metadata.generated_with = {
        [config.MANIFEST_AUTHOR_TOOL_NAME]: [packToolVersionArray.join(".")]
    };
    finalManifest.metadata.url = config.MANIFEST_SETTINGS_DISCORD_URL; 
    finalManifest.metadata.license = "CC BY-NC-SA 4.0";

    const settings = [];
    const wikiSettingTemplate = manifestTemplate.settings?.find(s => s.name === "wiki");
    if (wikiSettingTemplate) {
        settings.push({
            ...wikiSettingTemplate,
            text: `§u${config.MANIFEST_AUTHOR_TOOL_NAME}§r Wiki:`, 
            default: config.GITHUB_REPO_URL ? `${config.GITHUB_REPO_URL}/wiki` : (config.GITHUB_REPO_URL || "#") // Link para wiki ou repo
        });
    }
    
    const githubSettingTemplate = manifestTemplate.settings?.find(s => s.name === "github");
    if (githubSettingTemplate) {
         settings.push({
            ...githubSettingTemplate,
            text: `Gerado por §u${config.MANIFEST_AUTHOR_TOOL_NAME}§r:`, 
            default: config.GITHUB_REPO_URL || `https://github.com/${config.MANIFEST_AUTHOR_TIKTOK_NAME}` // Link para o repo ou perfil do TikToker
        });
    }
    settings.push({
        type: "input",
        text: `§bTIKTOK (${config.MANIFEST_AUTHOR_TIKTOK_NAME}):§r`,
        default: config.MANIFEST_SETTINGS_TIKTOK_URL,
        name: "tiktok_guihjzzz"
    });
    settings.push({
        type: "input",
        text: "§9DISCORD (Comunidade):§r",
        default: config.MANIFEST_SETTINGS_DISCORD_URL,
        name: "discord_community"
    });
    finalManifest.settings = settings;

	let packGenerationTime = (new Date()).toLocaleString("pt-BR", { dateStyle: 'short', timeStyle: 'medium' });
	
    let finalPackLangFilesOutput = [];
    let materialList = await new MaterialList(blockMetadata, itemMetadata); 
    
    // Calcular a lista de materiais uma vez para todos os idiomas
    materialList.clear(); // Limpar antes de preencher
    if (palettesAndIndices.length > 0 && palettesAndIndices[0].palette) {
        desparseArray(palettesAndIndices[0].palette).forEach(block => { // Usar a primeira estrutura para a lista de materiais por simplicidade
            if (!config.IGNORED_MATERIAL_LIST_BLOCKS.includes(block.name)) {
                materialList.add(block);
            }
        });
    }
    const totalMaterialCountFromCalc = materialList.totalMaterialCount;
    let finalisedMaterialLists = {}; // Cache para listas de materiais já traduzidas

    // Lógica para `inGameControls` e `controlItemTranslations` se RENAME_CONTROL_ITEMS etc.
    // let { inGameControls, controlItemTranslations } = {}; // Precisa ser populado pela lógica de Ut
    // if (controlsHaveBeenCustomised || config.RENAME_CONTROL_ITEMS) {
    //     const pmmpFetcher = await createPmmpBedrockDataFetcher();
    //     const itemTagsData = await pmmpFetcher.fetch("item_tags.json").then(res => res.json());
    //     ({ inGameControls, controlItemTranslations } = await translateControlItems(config, blockMetadata, itemMetadata, languagesToProcessForPack, packLangFileContents, itemTagsData));
    // }


    for (const languageCode of languagesToProcessForPack) {
        let langFileContent = packLangFileContents[languageCode];
        if (!langFileContent) {
            langFileContent = `pack.name=${packName}\npack.description=${config.PACK_LANG_DESCRIPTION_DEVELOPER_LINE || `Pacote ${NOME_FERRAMENTA}`}`;
        }

        materialList.setLanguage(langFileContent); 
        finalisedMaterialLists[languageCode] = materialList.export(); 
        
        const materialListString = config.MATERIAL_LIST_ENABLED 
            ? (finalisedMaterialLists[languageCode] || []).map(item => `${item.count} ${item.translatedName}`).join(", ") 
            : "Lista de materiais desabilitada.";

        langFileContent = preencherPlaceholdersLang(
            langFileContent,
            packName,
            packGenerationTime,
            config,
            { totalCount: totalMaterialCountFromCalc, listString: materialListString },
            {} // TODO: Passar 'inGameControls[languageCode]'
        );
        
        // TODO: Adicionar controlItemTranslations ao final do langFileContent se config.RENAME_CONTROL_ITEMS
        // if (config.RENAME_CONTROL_ITEMS && controlItemTranslations && controlItemTranslations[languageCode]) {
        //    langFileContent += `\n${controlItemTranslations[languageCode]}`;
        // }

        finalPackLangFilesOutput.push([languageCode, langFileContent]);
    }
	
	console.info("Todos os arquivos do pacote finalizados!");
	
	let packFileWriter = new BlobWriter();
	let packZip = new ZipWriter(packFileWriter);
	let packFilesToZip = [];

	if(structureFiles.length == 1) {
		packFilesToZip.push([".mcstructure", structureFiles[0], structureFiles[0].name]);
	} else {
		packFilesToZip.push(...structureFiles.map((structureFile, i) => [`${i}.mcstructure`, structureFile, structureFile.name]));
	}
	packFilesToZip.push(["manifest.json", JSON.stringify(finalManifest, null, "\t")]); 
	packFilesToZip.push(["pack_icon.png", packIconBlob]); 

    // --- ADICIONANDO ARQUIVOS GERADOS DINAMICAMENTE E DE TEMPLATE AO ZIP ---
    // Esta seção precisa replicar a lógica de `Ut` sobre quais arquivos adicionar e com qual conteúdo.
    // É uma parte extensa e crítica.

    packFilesToZip.push(["entity/armor_stand.entity.json", JSON.stringify(finalEntityFile).replaceAll("HOLOGRAM_INITIAL_ACTIVATION", true)]);
    packFilesToZip.push(["subpacks/punch_to_activate/entity/armor_stand.entity.json", JSON.stringify(finalEntityFile).replaceAll("HOLOGRAM_INITIAL_ACTIVATION", false)]);
    packFilesToZip.push(["render_controllers/armor_stand.hologram.render_controllers.json", JSON.stringify(finalHologramRenderControllers)]);
    if(config.PLAYER_CONTROLS_ENABLED && defaultPlayerRenderControllers) {
		packFilesToZip.push(["render_controllers/player.render_controllers.json", JSON.stringify(defaultPlayerRenderControllers)]); // Ou playerRenderControllers se modificado
	}
    packFilesToZip.push(["models/entity/armor_stand.hologram.geo.json", stringifyWithFixedDecimals(finalHologramGeo)]);
    packFilesToZip.push(["materials/entity.material", JSON.stringify(hologramMaterial)]); // Usar o carregado
    packFilesToZip.push(["animation_controllers/armor_stand.hologram.animation_controllers.json", JSON.stringify(finalHologramAnimControllers)]);
    packFilesToZip.push(["animations/armor_stand.hologram.animation.json", JSON.stringify(finalHologramAnimations)]);
    packFilesToZip.push(["particles/bounding_box_outline.json", JSON.stringify(boundingBoxOutlineParticle)]);

    // Partículas de validação de bloco
    uniqueBlocksToValidate.forEach(blockName => {
		let particleName = `validate_${blockName.replace(":", ".")}`;
		let particleJson = structuredClone(blockValidationParticle); // Usa o template carregado
		particleJson["particle_effect"]["description"]["identifier"] = `${NOME_FERRAMENTA.toLowerCase()}:${particleName}`;
		particleJson["particle_effect"]["components"]["minecraft:particle_expire_if_in_blocks"] = [blockName.includes(":")? blockName : `minecraft:${blockName}`];
		packFilesToZip.push([`particles/${particleName}.json`, JSON.stringify(particleJson)]);
	});

    packFilesToZip.push(["particles/saving_backup.json", JSON.stringify(savingBackupParticle)]);
	packFilesToZip.push(["textures/particle/single_white_pixel.png", await singleWhitePixelTexture.toBlob()]);
	packFilesToZip.push(["textures/particle/exclamation_mark.png", await exclamationMarkTexture.toBlob()]);
	packFilesToZip.push(["textures/particle/save_icon.png", await saveIconTexture.toBlob()]);
    
    // Textura de overlay (usada pelo wrong_block_overlay)
    const overlayTextureBlob = await (await singleWhitePixelTexture.setOpacity(config.WRONG_BLOCK_OVERLAY_COLOR[3])).toBlob();
	packFilesToZip.push(["textures/entity/overlay.png", overlayTextureBlob]);

	textureBlobs.forEach(([textureName, blob]) => {
		packFilesToZip.push([`textures/entity/${textureName}.png`, blob]);
	});

    if(config.RETEXTURE_CONTROL_ITEMS && finalItemTextureJson) {
		packFilesToZip.push(["textures/item_texture.json", JSON.stringify(finalItemTextureJson)]);
        // Adicionar lógica para hasModifiedTerrainTexture e finalTerrainTextureJson se necessário
        // E a lógica de controlItemTextures (blobs de imagens de itens retexturizados)
	}
    if(config.MATERIAL_LIST_ENABLED && finalHudScreenUI) {
		packFilesToZip.push(["ui/hud_screen.json", JSON.stringify(finalHudScreenUI)]);
        // Adicionar customEmojiFont se highestItemCount for grande (lógica precisa ser portada)
	}
    // ------------------------------------------------------------------------

	packFilesToZip.push(["texts/languages.json", JSON.stringify(packLanguagesJson, null, "\t")]); 
	finalPackLangFilesOutput.forEach(([language, languageFile]) => {
		packFilesToZip.push([`texts/${language}.lang`, languageFile]);
	});
	
	await Promise.all(packFilesToZip.map(([fileName, fileContents, comment]) => {
		let options = { comment, level: config.COMPRESSION_LEVEL };
		if(fileContents instanceof Blob) {
			return packZip.add(fileName, new BlobReader(fileContents), options);
		} else if (typeof fileContents === 'string') {
			return packZip.add(fileName, new TextReader(fileContents), options);
		} else if (fileContents && typeof fileContents === 'object' && !(fileContents instanceof File)) { 
            return packZip.add(fileName, new TextReader(JSON.stringify(fileContents, null, "\t")), options);
        } else {
            if (fileContents instanceof File) {
                 return packZip.add(fileName, new BlobReader(fileContents), options);
            }
            console.warn(`Conteúdo de arquivo inesperado ou nulo para ${fileName}, pulando.`);
            return Promise.resolve();
        }
	}));
	let zippedPack = await packZip.close();
	
	console.info(`Criação do pacote finalizada em ${(performance.now() - startTime).toFixed(0) / 1000}s!`);
	
	if(previewCont) {
        let showPreview = () => {
            const currentHologramGeo = finalHologramGeo; // Usar a geometria final
            if (currentHologramGeo && currentHologramGeo["minecraft:geometry"]) {
                currentHologramGeo["minecraft:geometry"].filter(geo => geo["description"]["identifier"].startsWith("geometry.armor_stand.hologram_")).map(geo => {
                    (new PreviewRenderer(previewCont, textureAtlas, geo, finalHologramAnimations, config.SHOW_PREVIEW_SKYBOX)).catch(e => console.error("Erro no renderizador de pré-visualização:", e)); 
                });
            } else {
                 console.error("Geometria do holograma não carregada para pré-visualização.");
            }
		};
		if(totalBlockCountForPreview < config.PREVIEW_BLOCK_LIMIT) { // totalBlockCountForPreview precisa ser calculado
			showPreview();
		} else {
			// ... (lógica de mensagem "clique para ver" mantida, mas traduza o texto) ...
		}
	}
	
	return new File([zippedPack], `${packName}.${NOME_FERRAMENTA.toLowerCase()}.mcpack`, {
		type: "application/mcpack"
	});
}

// ... (restante das funções como extractStructureFilesFromPack, updatePack, getDefaultPackName, findLinksInDescription, createItemCriteria, addDefaultConfig, createPmmpBedrockDataFetcher, readStructureNBT, carregarRecursos, obterConteudoResposta, tweakBlockPalette, mergeMultiplePalettesAndIndices, makePackIcon, preencherPlaceholdersLang) ...
// A função preencherPlaceholdersLang precisa ser completada com a lógica para {DISABLED_FEATURES_SECTION} e {CONTROLS_SECTION}

// ... (funções auxiliares de Molang e typedefs mantidas/adaptadas como no exemplo anterior) ...

/**
 * @typedef {Object} HoloLabConfig
 * @property {String} [CUSTOM_PACK_ICON_URL] URL para o ícone padrão do pacote
 * @property {String} MANIFEST_AUTHOR_TIKTOK_NAME Nome do autor (TikToker) para o manifest
 * @property {String} MANIFEST_AUTHOR_TOOL_NAME Nome da ferramenta para o manifest
 * @property {String} MANIFEST_SETTINGS_TIKTOK_URL URL do TikTok para os settings do manifest
 * @property {String} MANIFEST_SETTINGS_DISCORD_URL URL do Discord para os settings do manifest
 * @property {String} PACK_LANG_DESCRIPTION_DEVELOPER_LINE Linha de "desenvolvido por" para os arquivos .lang
 * @property {String} GITHUB_REPO_URL URL do repositório GitHub (para links de Wiki/fonte)
 * @property {Array<String>} IGNORED_BLOCKS
 * @property {Array<String>} IGNORED_MATERIAL_LIST_BLOCKS
 * @property {Number} SCALE
 * @property {Number} OPACITY
 * @property {Boolean} MULTIPLE_OPACITIES
 * @property {String} TINT_COLOR Hex RGB #xxxxxx
 * @property {Number} TINT_OPACITY 0-1
 * @property {Number} MINI_SCALE
 * @property {Number} TEXTURE_OUTLINE_WIDTH
 * @property {String} TEXTURE_OUTLINE_COLOR
 * @property {Number} TEXTURE_OUTLINE_OPACITY 0-1
 * @property {Boolean} SPAWN_ANIMATION_ENABLED
 * @property {Number} SPAWN_ANIMATION_LENGTH
 * @property {Boolean} PLAYER_CONTROLS_ENABLED
 * @property {HoloPrintControlsConfig} CONTROLS
 * @property {Boolean} MATERIAL_LIST_ENABLED
 * @property {Boolean} RETEXTURE_CONTROL_ITEMS
 * @property {Number} CONTROL_ITEM_TEXTURE_SCALE
 * @property {Boolean} RENAME_CONTROL_ITEMS
 * @property {Array<Number>} WRONG_BLOCK_OVERLAY_COLOR
 * @property {Vec3} INITIAL_OFFSET
 * @property {Number} BACKUP_SLOT_COUNT
 * @property {String|undefined} PACK_NAME
 * @property {Blob} [PACK_ICON_BLOB]
 * @property {Array<String>} AUTHORS
 * @property {String|undefined} DESCRIPTION
 * @property {Number} COMPRESSION_LEVEL
 * @property {Number} PREVIEW_BLOCK_LIMIT
 * @property {Boolean} SHOW_PREVIEW_SKYBOX
 */
// ... (outras typedefs como HoloPrintControlsConfig, ItemCriteria, Block, NBTBlock, etc.)