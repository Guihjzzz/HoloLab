import { extractStructureFilesFromMcworld } from "mcbe-leveldb-reader";
import { selectEl, downloadBlob, sleep, selectEls, loadTranslationLanguage, translate, getStackTrace, random, UserError, joinOr, conditionallyGroup, groupByFileExtension, addFilesToFileInput, setFileInputFiles, dispatchInputEvents } from "./essential.js";
import * as HoloPrint from "./HoloPrint.js"; // Mantendo nome do módulo, conteúdo será adaptado

import ResourcePackStack from "./ResourcePackStack.js";
import LocalResourcePack from "./LocalResourcePack.js";
import ItemCriteriaInput from "./components/ItemCriteriaInput.js";
import FileInputTable from "./components/FileInputTable.js";
import SimpleLogger from "./components/SimpleLogger.js";

const EM_PRODUCAO = false; 
const LOG_CONSOLE_REAL = false; 

window.OffscreenCanvas ?? class OffscreenCanvas {
	constructor(w, h) {
		console.debug("Usando polyfill para OffscreenCanvas");
		this.canvas = document.createElement("canvas");
		this.canvas.width = w;
		this.canvas.height = h;
		this.canvas.convertToBlob = () => {
			return new Promise((res, rej) => {
				this.canvas.toBlob(blob => {
					if(blob) {
						res(blob);
					} else {
						rej();
					}
				});
			});
		};
		return this.canvas;
	}
};

let dropFileNotice;
let generatePackForm;
let generatePackFormSubmitButton;
let structureFilesInput;
let worldFileInput;
let oldPackInput;
let structureFilesList;
let packNameInput;
let completedPacksCont;
let logger;
let languageSelector;
let defaultResourcePackStackPromise;
let texturePreviewImageCont;
let texturePreviewImage;

document.onEvent("DOMContentLoaded", () => {
	document.body.appendChild = selectEl("main").appendChild.bind(selectEl("main"));
	
	selectEls(`input[type="file"][accept]:not([multiple])`).forEach(input => {
		input.onEventAndNow("input", e => {
			if(!validateFileInputFileTypes(input)) {
				e?.stopImmediatePropagation();
			}
		});
	});
	
	generatePackForm = selectEl("#generatePackForm");
	dropFileNotice = selectEl("#dropFileNotice");
	structureFilesInput = selectEl("#structureFilesInput");
	let notStructureFileError = selectEl("#notStructureFileError");
	worldFileInput = selectEl("#worldFileInput");
	let worldExtractionMessage = selectEl("#worldExtractionMessage");
	let worldExtractionSuccess = selectEl("#worldExtractionSuccess");
	let worldExtractionError = selectEl("#worldExtractionError");
	let worldExtractionWorldError = selectEl("#worldExtractionWorldError");
	oldPackInput = selectEl("#oldPackInput");
	let oldPackExtractionMessage = selectEl("#oldPackExtractionMessage");
	let oldPackExtractionSuccess = selectEl("#oldPackExtractionSuccess");
	let oldPackExtractionError = selectEl("#oldPackExtractionError");
	structureFilesList = selectEl("#structureFilesList");
	packNameInput = generatePackForm.elements.namedItem("packName");
	packNameInput.onEvent("invalid", () => {
		packNameInput.setCustomValidity(translateCurrentLanguage("metadata.pack_name.error") || "O nome do pacote não pode conter '/'");
	});
	packNameInput.onEvent("input", () => {
		packNameInput.setCustomValidity("");
	});
	structureFilesInput.onEvent("input", () => {
		if(!structureFilesInput.files.length) {
			return;
		}
		let files = Array.from(structureFilesInput.files);
		let filesToAdd = files.filter(file => file.name.endsWith(".mcstructure"));
		if(files.length == filesToAdd.length) {
			notStructureFileError.classList.add("hidden");
			structureFilesInput.setCustomValidity("");
		} else {
			notStructureFileError.classList.remove("hidden");
			structureFilesInput.setCustomValidity(notStructureFileError.textContent);
		}
		addFilesToFileInput(structureFilesList, filesToAdd);
	});
	worldFileInput.onEvent("input", async () => {
		worldExtractionMessage.classList.add("hidden");
		worldExtractionSuccess.classList.add("hidden");
		worldExtractionError.classList.add("hidden");
		worldExtractionWorldError.classList.add("hidden");
		oldPackInput.setCustomValidity("");
		let worldFile = worldFileInput.files[0];
		if(!worldFile) {
			return;
		}
		selectEl("#extractFromWorldTab").checked = true;
		worldExtractionMessage.classList.remove("hidden");
		worldExtractionMessage.scrollIntoView({
			block: "center"
		});
		let structureFiles;
		try {
			structureFiles = await extractStructureFilesFromMcworld(worldFile);
		} catch(e) {
			worldExtractionMessage.classList.add("hidden");
			worldExtractionWorldError.dataset.translationSubError = e;
			worldExtractionWorldError.classList.remove("hidden");
			worldFileInput.setCustomValidity(worldExtractionWorldError.textContent);
			return;
		}
		worldExtractionMessage.classList.add("hidden");
		if(structureFiles.size) {
			addFilesToFileInput(structureFilesList, Array.from(structureFiles.values()));
			worldExtractionSuccess.dataset.translationSubCount = structureFiles.size;
			worldExtractionSuccess.classList.remove("hidden");
		} else {
			worldExtractionError.classList.remove("hidden");
			worldFileInput.setCustomValidity(worldExtractionError.textContent);
		}
	});
	oldPackInput.onEvent("input", async () => {
		oldPackExtractionMessage.classList.add("hidden");
		oldPackExtractionSuccess.classList.add("hidden");
		oldPackExtractionError.classList.add("hidden");
		oldPackInput.setCustomValidity("");
		let oldPack = oldPackInput.files[0];
		if(!oldPack) {
			return;
		}
		selectEl("#updatePackTab").checked = true;
		oldPackExtractionMessage.classList.remove("hidden");
		oldPackExtractionMessage.scrollIntoView({
			block: "center"
		});
		let extractedStructureFiles = await HoloPrint.extractStructureFilesFromPack(oldPack);
		oldPackExtractionMessage.classList.add("hidden");
		if(extractedStructureFiles.length) {
			addFilesToFileInput(structureFilesList, extractedStructureFiles);
			oldPackExtractionSuccess.classList.remove("hidden");
		} else {
			oldPackExtractionError.classList.remove("hidden");
			oldPackInput.setCustomValidity(oldPackExtractionError.textContent);
		}
	});
	structureFilesList.onEventAndNow("input", updatePackNameInputPlaceholder);
	completedPacksCont = selectEl("#completedPacksCont");
	texturePreviewImageCont = selectEl("#texturePreviewImageCont");
	defaultResourcePackStackPromise = new ResourcePackStack();
	
	if(location.search == "?loadFile") {
		window.launchQueue?.setConsumer(async launchParams => {
			let launchFiles = await Promise.all(launchParams.files.map(fileHandle => fileHandle.getFile()));
			handleInputFiles(launchFiles);
		});
	}
	
	let dragCounter = 0;
	document.documentElement.onEvent("dragenter", () => {
		dragCounter++;
	});
	document.documentElement.onEvent("dragover", e => {
		if(e.dataTransfer?.types?.includes("Files")) { 
			e.preventDefault();
			dropFileNotice.classList.remove("hidden");
		}
	});
	document.documentElement.onEvent("dragleave", () => {
		dragCounter--;
		if(dragCounter == 0) {
			dropFileNotice.classList.add("hidden");
		}
	});
	document.documentElement.onEvent("drop", async e => {
		e.preventDefault();
		dragCounter = 0;
		dropFileNotice.classList.add("hidden");
		let files = [...e.dataTransfer.files]; 
		handleInputFiles(files);
	});
	
	customElements.define("item-criteria-input", class extends ItemCriteriaInput {
		constructor() {
			super(translateCurrentLanguage);
		}
	});
	customElements.define("file-input-table", FileInputTable);
	customElements.define("simple-logger", SimpleLogger);
	if(!LOG_CONSOLE_REAL) {
		logger = selectEl("#log");
		logger.patchConsoleMethods();
	}
	
	generatePackForm.onEvent("submit", async e => {
		e.preventDefault();
		let formData = new FormData(generatePackForm);
		let resourcePacks = [];
		let localResourcePackFiles = generatePackForm.elements.namedItem("localResourcePack").files;
		if(localResourcePackFiles.length) {
			resourcePacks.push(await new LocalResourcePack(localResourcePackFiles));
		}
		generateHoloLabPack(formData.getAll("structureFiles"), resourcePacks);
	});
	generatePackForm.onEvent("input", e => {
		if(e.target.closest("fieldset")?.classList?.contains("textureSettings") && e.target.hasAttribute("name")) {
			updateTexturePreview();
		}
	});
	updateTexturePreview();
	generatePackFormSubmitButton = generatePackForm.elements.namedItem("submit");
	
	let opacityModeSelect = generatePackForm.elements.namedItem("opacityMode");
	opacityModeSelect.onEventAndNow("change", () => {
		generatePackForm.elements.namedItem("opacity").parentElement.classList.toggle("hidden", opacityModeSelect.value == "multiple");
	});
	
	let descriptionTextArea = generatePackForm.elements.namedItem("description");
	let descriptionLinksCont = selectEl("#descriptionLinksCont");
	descriptionTextArea.onEventAndNow("input", () => {
		let links = HoloPrint.findLinksInDescription(descriptionTextArea.value);
		descriptionLinksCont.textContent = "";
		links.forEach(([_, link], i) => {
			if(i) {
				descriptionLinksCont.appendChild(document.createElement("br"));
			}
			descriptionLinksCont.insertAdjacentHTML("beforeend", `<span data-translate="metadata.description.link_found">${translateCurrentLanguage("metadata.description.link_found") || "Link encontrado:"}</span>`);
			descriptionLinksCont.insertAdjacentText("beforeend", " " + link);
		});
	});
	
	let playerControlsInputCont = selectEl("#playerControlsInputCont");
	Object.entries(HoloPrint.DEFAULT_PLAYER_CONTROLS).map(([control, itemCriteria]) => {
		let label = document.createElement("label");
		let playerControlTranslationKey = HoloPrint.PLAYER_CONTROL_NAMES[control];
		label.innerHTML = `<span data-translate="${playerControlTranslationKey}">...</span>:`;
		let input = document.createElement("item-criteria-input");
		input.setAttribute("name", `control.${control}`);
		if(itemCriteria["names"].length > 0) {
			input.setAttribute("value-items", itemCriteria["names"].join(","));
		}
		if(itemCriteria["tags"].length > 0) {
			input.setAttribute("value-tags", itemCriteria["tags"].join(","));
		}
		label.appendChild(input);
		playerControlsInputCont.appendChild(label);
		input.setAttribute("default", input.value); 
	});
	
	let clearResourcePackCacheButton = selectEl("#clearResourcePackCacheButton");
	clearResourcePackCacheButton.onEvent("click", async () => {
		caches.clear();
		temporarilyChangeText(clearResourcePackCacheButton, clearResourcePackCacheButton.dataset.resetTranslation);
	});
	
	selectEls(".resetButton").forEach(el => {
		el.onEvent("click", () => {
			let fieldset = el.parentElement;
			let [elementsBeingReset, elementsToSave] = conditionallyGroup(Array.from(generatePackForm.elements), el => el.localName != "fieldset" && el.localName != "button" && (!fieldset.contains(el) || !el.hasAttribute("name")));
			let oldValues = elementsToSave.map(el => {
				switch(el.type) {
					case "file": {
						let dataTransfer = new DataTransfer(); 
						[...el.files].forEach(file => dataTransfer.items.add(file));
						return dataTransfer.files;
					}
					case "checkbox": return el.checked;
					default: return el.value;
				}
			});
			generatePackForm.reset(); 
			elementsToSave.forEach((el, i) => {
				switch(el.type) {
					case "file": {
						el.files = oldValues[i];
					} break;
					case "checkbox": {
						el.checked = oldValues[i];
					} break;
					default: {
						el.value = oldValues[i];
					}
				}
			});
			elementsBeingReset.forEach(el => {
				dispatchInputEvents(el);
			});
			temporarilyChangeText(el, el.dataset.resetTranslation);
		});
	});
	
	languageSelector = selectEl("#languageSelector");
	fetch("translations/languages.json").then(res => res.jsonc()).then(languagesAndNames => {
		languagesAndNames = Object.fromEntries(Object.entries(languagesAndNames).sort((a, b) => a[1] > b[1])); 
		let availableLanguages = Object.keys(languagesAndNames);
		
		// MODIFICADO: Forçar 'pt_BR' como opção e potencialmente padrão
        const ptBRName = "Português (Brasil)";
        if (!languagesAndNames["pt_BR"]) {
            languagesAndNames["pt_BR"] = ptBRName;
        }
        if (!availableLanguages.includes("pt_BR")) {
            availableLanguages.push("pt_BR");
        }
        // Tenta definir pt_BR como padrão se o navegador indicar preferência por português
        let defaultLanguage = navigator.languages.find(navigatorLanguage => {
			let navigatorBaseLanguage = navigatorLanguage.split("-")[0];
            if (navigatorBaseLanguage === "pt" && availableLanguages.includes("pt_BR")) return "pt_BR";
			return availableLanguages.find(availableLanguage => availableLanguage == navigatorLanguage) ?? availableLanguages.find(availableLanguage => availableLanguage == navigatorBaseLanguage) ?? availableLanguages.find(availableLanguage => availableLanguage.split(/-|_/)[0] == navigatorBaseLanguage);
		}) ?? "pt_BR"; // Default para pt_BR

		if(availableLanguages.length == 1 && defaultLanguage !== "pt_BR") { // Se só tiver um idioma e não for pt_BR, remove o seletor
             selectEl("#languageSelectorCont").remove();
        } else if (availableLanguages.length === 0) { // Se nenhum idioma for encontrado (improvável)
            selectEl("#languageSelectorCont").remove();
            return;
        }
        
		languageSelector.textContent = "";
		for(let language in languagesAndNames) {
			languageSelector.appendChild(new Option(languagesAndNames[language], language, false, language == defaultLanguage));
		}
        // Garante que pt_BR esteja no seletor se não foi adicionado acima
        if (!languageSelector.querySelector('option[value="pt_BR"]')) {
             languageSelector.appendChild(new Option(ptBRName, "pt_BR", false, "pt_BR" === defaultLanguage));
        }
        // Se o idioma padrão acabou não sendo pt_BR mas pt_BR existe, e o defaultLanguage não existe mais, seleciona pt_BR
        if (languageSelector.value !== defaultLanguage && !availableLanguages.includes(defaultLanguage) && languageSelector.querySelector('option[value="pt_BR"]')) {
            languageSelector.value = "pt_BR";
            defaultLanguage = "pt_BR";
        } else {
            languageSelector.value = defaultLanguage;
        }


		languageSelector.onEventAndNow("change", () => {
			translatePage(languageSelector.value);
		});
		
		let retranslating = false;
		let bodyObserver = new MutationObserver(mutations => {
			if(retranslating) {
				console.log("Mutações observadas ao re-traduzir:", mutations);
				return;
			}
			let shouldRetranslate = mutations.find(mutation => mutation.type == "childList" && [...mutation.addedNodes].some(node => node instanceof Element && ([...node.attributes].some(attr => attr.name.startsWith("data-translate") || attr.name.startsWith("data-translation-sub-")) || node.getAllChildren().some(el => [...el.attributes].some(attr => attr.name.startsWith("data-translate") || attr.name.startsWith("data-translation-sub-"))))) || mutation.type == "attributes" && (mutation.attributeName.startsWith("data-translate") || mutation.attributeName.startsWith("data-translation-sub-")) && mutation.target.getAttribute(mutation.attributeName) != mutation.oldValue); 
			if(shouldRetranslate) {
				retranslating = true;
				translatePage(languageSelector.value);
				retranslating = false;
			}
		});
		let observerConfig = {
			childList: true,
			subtree: true,
			attributes: true,
			attributeOldValue: true
		};
		bodyObserver.observe(document.body, observerConfig);
		document.body.getAllChildren().filter(el => el.shadowRoot).forEach(el => {
			bodyObserver.observe(el.shadowRoot, observerConfig);
		});
	});
});
window.onEvent("load", () => { 
	if(location.search == "?generateEnglishTranslations") {
		translatePage("en_US", true); // Mantido para funcionalidade de geração de template
	}
    // A tradução inicial já é feita pelo onEventAndNow do languageSelector
});

async function handleInputFiles(files) {
	let {
		"mcstructure": structureFiles = [],
		"mcworld": worldFiles = [],
		"zip": zipFiles = [],
		"mcpack": resourcePackFiles = []
	} = groupByFileExtension(files);
	let allWorldFiles = [...worldFiles, ...zipFiles];
	
	addFilesToFileInput(structureFilesList, structureFiles);
	setFileInputFiles(worldFileInput, allWorldFiles.slice(0, 1)); 
	setFileInputFiles(oldPackInput, resourcePackFiles.slice(0, 1));
}
function updatePackNameInputPlaceholder() {
	packNameInput.setAttribute("placeholder", HoloPrint.getDefaultPackName([...structureFilesList.files]));
}
async function updateTexturePreview() {
	texturePreviewImage ??= await defaultResourcePackStackPromise.then(rps => rps.fetchResource(`textures/blocks/${random(["crafting_table_front", "diamond_ore", "blast_furnace_front_off", "brick", "cherry_planks", "chiseled_copper", "cobblestone", "wool_colored_white", "stonebrick", "stone_granite_smooth"])}.png`)).then(res => res.toImage());
	let can = new OffscreenCanvas(texturePreviewImage.width, texturePreviewImage.height);
	let ctx = can.getContext("2d");
	ctx.drawImage(texturePreviewImage, 0, 0);
	let textureOutlineWidth = +generatePackForm.elements.namedItem("textureOutlineWidth").value;
	
    const newPrimaryBlueLighter = getComputedStyle(document.documentElement).getPropertyValue('--primary-blue-lighter').trim() || generatePackForm.elements.namedItem("textureOutlineColor").value;
    const newPrimaryBlue = getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim() || generatePackForm.elements.namedItem("tintColor").value;

	let outlinedCan = textureOutlineWidth > 0? HoloPrint.TextureAtlas.addTextureOutlines(can, [{ 
		x: 0,
		y: 0,
		w: can.width,
		h: can.height
	}], HoloPrint.addDefaultConfig({ 
		TEXTURE_OUTLINE_COLOR: newPrimaryBlueLighter, 
		TEXTURE_OUTLINE_OPACITY: generatePackForm.elements.namedItem("textureOutlineOpacity").value / 100,
		TEXTURE_OUTLINE_WIDTH: textureOutlineWidth
	})) : can;
	let tintlessImage = await outlinedCan.convertToBlob().then(blob => blob.toImage());
	let outlinedCanCtx = outlinedCan.getContext("2d");
	outlinedCanCtx.fillStyle = newPrimaryBlue; 
	outlinedCanCtx.globalAlpha = generatePackForm.elements.namedItem("tintOpacity").value / 100;
	outlinedCanCtx.fillRect(0, 0, outlinedCan.width, outlinedCan.height);
	let tintedImage = await outlinedCan.convertToBlob().then(blob => blob.toImage());
	texturePreviewImageCont.textContent = "";
	texturePreviewImageCont.appendChild(tintlessImage);
	texturePreviewImageCont.appendChild(tintedImage);
}
async function translatePage(language, generateTranslations = false) {
	// Se for pt_BR, usamos 'en_US' como chave de arquivo, mas o conteúdo será pt_BR
    const fileLanguageKey = (language === "pt_BR") ? "en_US" : language;

	let translatableEls = document.documentElement.getAllChildren().filter(el => [...el.attributes].some(attr => attr.name.startsWith("data-translate")));
	await loadTranslationLanguage(fileLanguageKey); 
	let translations = generateTranslations? await fetch(`translations/${fileLanguageKey}.json`).then(res => res.jsonc()) : {};
	
	await Promise.all(translatableEls.map(async el => {
		if("translate" in el.dataset) {
			let translationKey = el.dataset["translate"];
			if(generateTranslations && language === "en_US") { // Só gerar template a partir do inglês
				translations[translationKey] = el.innerHTML.replaceAll("<code>", "`").replaceAll("</code>", "`").replaceAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "[$2]($1)");
			} else {
				let translation = translate(translationKey, fileLanguageKey); // A função `translate` buscará do cache de `fileLanguageKey`
				if(translation != undefined) {
					el.innerHTML = performTranslationSubstitutions(el, translation);
				} else {
					console.warn(`Não foi possível encontrar a tradução para ${translationKey} no idioma ${language} (usando chave ${fileLanguageKey})!`);
					if(el.innerHTML == "") {
						let englishTranslation = translate(translationKey, "en_US");
						if(englishTranslation) {
							el.innerHTML = performTranslationSubstitutions(el, englishTranslation);
						} else {
							el.innerHTML = translationKey;
						}
					}
				}
			}
		}
		[...el.attributes].filter(attr => attr.name.startsWith("data-translate-")).forEach(async attr => {
			let targetAttrName = attr.name.replace(/^data-translate-/, "");
			let translationKey = attr.value;
			if(generateTranslations && language === "en_US") {
				translations[translationKey] = el.getAttribute(targetAttrName);
			} else {
				let translation = translate(translationKey, fileLanguageKey);
				if(translation != undefined) {
					el.setAttribute(targetAttrName, performTranslationSubstitutions(el, translation));
				} else {
					console.warn(`Não foi possível encontrar a tradução para ${translationKey} no idioma ${language} (usando chave ${fileLanguageKey})!`);
					if(!el.hasAttribute(targetAttrName)) {
						let englishTranslation = translate(translationKey, "en_US");
						if(englishTranslation) {
							el.setAttribute(targetAttrName, performTranslationSubstitutions(el, englishTranslation));
						} else {
							el.setAttribute(targetAttrName, translationKey);
						}
					}
				}
			}
		});
	}));
	if(generateTranslations && language === "en_US") {
		translations = Object.fromEntries(Object.entries(translations).sort((a, b) => a[0] > b[0]));
		downloadBlob(new File([JSON.stringify(translations, null, "\t")], `${language}.json`));
	}
}

function performTranslationSubstitutions(el, translation) {
	const prefix = "data-translation-sub-";
	Array.from(el.attributes).forEach(({ name, value }) => {
		if(name.startsWith(prefix)) {
			let subName = name.slice(prefix.length).toUpperCase().replaceAll("-", "_");
			translation = translation.replaceAll(`{${subName}}`, value);
			if(parseInt(value) == value) { 
				translation = Number(value) > 1 ? translation.replace(/\[|\]/g, "") : translation.replaceAll(/\[.+\]/g, "");
			}
		}
	});
	return translation;
}
function translateCurrentLanguage(translationKey) {
	if(!languageSelector) {
		return undefined;
	}
    const currentSelectedLang = languageSelector.value;
    // Se pt_BR, usa en_US como chave de arquivo para buscar do cache
    const fileLangKeyForTranslate = (currentSelectedLang === "pt_BR") ? "en_US" : currentSelectedLang;

	let translation = translate(translationKey, fileLangKeyForTranslate);
	if(!translation) {
        // Fallback para inglês se a tradução direta falhar
		translation = translate(translationKey, "en_US");
		if(translation) {
			console.warn(`Não foi possível encontrar a tradução para ${translationKey} no idioma ${currentSelectedLang}! Usando Inglês.`);
		} else {
			console.warn(`Não foi possível encontrar a tradução para ${translationKey} no idioma ${currentSelectedLang} ou Inglês!`);
			translation = translationKey; 
		}
	}
	return translation;
}

async function temporarilyChangeText(el, translationKey, duration = 2000) {
	let originalTranslationKey = el.dataset.translate;
	el.dataset.translate = translationKey;
	el.setAttribute("disabled", "");
	await sleep(duration);
	el.dataset.translate = originalTranslationKey;
	el.removeAttribute("disabled");
}

function validateFileInputFileTypes(fileInput) {
	let acceptableFileExtensions = fileInput.accept.split(",");
	let valid = Array.from(fileInput.files).every(file => acceptableFileExtensions.some(fileExtension => file.name.endsWith(fileExtension)));
	if(valid) {
		fileInput.setCustomValidity("");
	} else {
		if(languageSelector) {
			const fileTypesString = joinOr(acceptableFileExtensions, languageSelector.value.replace("_", "-"));
			const errorMsgKey = "upload.error.wrong_file_type";
			const errorMsgTemplate = translateCurrentLanguage(errorMsgKey) || "Por favor, envie apenas arquivos {FILE_TYPE}.";
			fileInput.setCustomValidity(errorMsgTemplate.replace("{FILE_TYPE}", fileTypesString));
		} else {
			fileInput.setCustomValidity(`Por favor, envie apenas arquivos ${joinOr(acceptableFileExtensions)}.`);
		}
	}
	return valid;
}

async function generateHoloLabPack(structureFiles, localResourcePacks) {
	generatePackFormSubmitButton.disabled = true;
	
	if(EM_PRODUCAO) {
		console.debug("User agent:", navigator.userAgent);
	}
	
	let formData = new FormData(generatePackForm);
	let authors = formData.get("author").split(",").map(x => x.trim()).removeFalsies();
	
	let config = {
		IGNORED_BLOCKS: formData.get("ignoredBlocks").split(/\W/).removeFalsies(),
		SCALE: formData.get("scale") / 100,
		OPACITY: formData.get("opacity") / 100,
		MULTIPLE_OPACITIES: formData.get("opacityMode") == "multiple",
		TINT_COLOR: formData.get("tintColor"),
		TINT_OPACITY: formData.get("tintOpacity") / 100,
		MINI_SCALE: +formData.get("miniSize"),
		TEXTURE_OUTLINE_WIDTH: +formData.get("textureOutlineWidth"),
		TEXTURE_OUTLINE_COLOR: formData.get("textureOutlineColor"),
		TEXTURE_OUTLINE_OPACITY: formData.get("textureOutlineOpacity") / 100,
		SPAWN_ANIMATION_ENABLED: !!formData.get("spawnAnimationEnabled"),
		PLAYER_CONTROLS_ENABLED: !!formData.get("playerControlsEnabled"),
		MATERIAL_LIST_ENABLED: !!formData.get("materialListEnabled"),
		RETEXTURE_CONTROL_ITEMS: !!formData.get("retextureControlItems"),
		RENAME_CONTROL_ITEMS: !!formData.get("renameControlItems"),
		CONTROLS: Object.fromEntries([...formData].filter(([key]) => key.startsWith("control.")).map(([key, value]) => [key.replace(/^control./, ""), JSON.parse(value)])),
		INITIAL_OFFSET: [+formData.get("initialOffsetX"), +formData.get("initialOffsetY"), +formData.get("initialOffsetZ")],
		BACKUP_SLOT_COUNT: +formData.get("backupSlotCount"),
		PACK_NAME: formData.get("packName") || undefined,
		AUTHORS: authors,
		DESCRIPTION: formData.get("description") || undefined,
		COMPRESSION_LEVEL: +formData.get("compressionLevel"),
        CUSTOM_PACK_ICON_URL: "https://github.com/Holo-Lab/holo/blob/main/ChatGPT%20Image%203%20de%20jun.%20de%202025,%2008_40_34.png?raw=true",
        MANIFEST_AUTHOR_TIKTOK_NAME: "Guihjzzz", 
        MANIFEST_AUTHOR_TOOL_NAME: "HoloLab",     
        MANIFEST_SETTINGS_TIKTOK_URL: "https://www.tiktok.com/@guihjzzz?_t=ZM-8vawBdE0Ew2&_r=1",
        MANIFEST_SETTINGS_DISCORD_URL: "https://discord.gg/YTdKsTjnUy",
        PACK_LANG_DESCRIPTION_DEVELOPER_LINE: "Desenvolvido por §l§btik§dtok §cGuihjzzz§r",
		// Passando a URL do repositório para o HoloPrint.js
        GITHUB_REPO_URL: "https://github.com/Guihjzzz/HoloLab" // Placeholder, substitua se tiver um repo específico
	};
	
	let previewCont = document.createElement("div");
	previewCont.classList.add("previewCont");
	completedPacksCont.prepend(previewCont);
	let infoButton = document.createElement("button");
	infoButton.classList.add("packInfoButton"); 
	infoButton.dataset.translate = "progress.generating";
    infoButton.textContent = translateCurrentLanguage("progress.generating") || "Gerando pacote...";
	completedPacksCont.prepend(infoButton);
	
	let resourcePackStack = await new ResourcePackStack(localResourcePacks);
	
	let pack;
	logger?.setOriginTime(performance.now());
	
	let generationFailedError; 
	const packGeneratorFunction = HoloPrint.makePack;

	if(LOG_CONSOLE_REAL) {
		pack = await packGeneratorFunction(structureFiles, config, resourcePackStack, previewCont);
	} else {
		try {
			pack = await packGeneratorFunction(structureFiles, config, resourcePackStack, previewCont);
		} catch(e) {
			console.error(`Criação do pacote falhou!\n${e}`);
			if(!(e instanceof UserError)) {
				generationFailedError = e;
			}
			if(!(e instanceof DOMException)) { 
				console.debug(getStackTrace(e).join("\n"));
			}
		}
	}
	
	infoButton.classList.add("finished");
	if(pack) {
		infoButton.dataset.translate = "download";
        infoButton.textContent = translateCurrentLanguage("download") || "Baixar pacote";
		infoButton.classList.add("completed");
		infoButton.onclick = () => {
			downloadBlob(pack, pack.name);
		};
	} else {
        infoButton.classList.add("failed");
        infoButton.dataset.translate = "pack_generation_failed";
        let errorText = translateCurrentLanguage("pack_generation_failed") || "Falha na geração do pacote!";
        if (generationFailedError) {
            // Não adicionaremos link de reportar erro, conforme solicitado
            console.error("Erro detalhado:", generationFailedError);
        }
        infoButton.innerHTML = errorText;
	}
	
	generatePackFormSubmitButton.disabled = false;
}