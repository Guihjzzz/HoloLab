import { html, htmlCodeToElement } no `ItemCriteriaInput.js`:**

1.  **Tradução de Textos da Interface (dent from "../essential.js";
import * as HoloPrint from "../HoloPrint.js"; // Mantém a referência aro do Shadow DOM):**
    *   "Matching:" -> "Combinando:"
    *   "Nothing HoloPrint.js
import { VanillaDataFetcher } from "../ResourcePackStack.js"; // Mantém import" (placeholder para quando não há inputs) -> "Nada"
    *   "Item name" (no botão e

// Promessas para carregar datalists de itens e tags
let itemsDatalistPromise = ( placeholder) -> "Nome do Item"
    *   "Item tag" (no botão e placeholder) -> "Tag donew VanillaDataFetcher()).then(async fetcher => {
	let mojangItems = await fetcher.fetch Item"
    *   " or " -> " ou "
2.  **Tradução de Mensagens("metadata/vanilladata_modules/mojang-items.json").then(res => res.json()); de Erro (para `setValidity`):**
    *   "Please enter item criteria" -> "Por favor
	let itemNames = mojangItems["data_items"].map(item => item["name"].replace(/^, insira um critério de item."
    *   "Invalid item/tag name" -> "Nome de item/minecraft:/, ""))
	let datalist = document.createElement("datalist");
	datalist.id = "itemNamestag inválido."
3.  **Referências a `HoloPrint.js`:**
    *   ManDatalist";
	datalist.append(...itemNames.map(itemName => new Option(itemName)));
	return datter `import * as HoloPrint from "../HoloPrint.js";` e `HoloPrint.createItemCriteriaalist;
});
let itemTagsDatalistPromise = HoloPrint.createPmmpBedrockDataFetcher().then(...)` por enquanto, conforme sua instrução anterior de não renomear o arquivo `HoloPrint.js`(async fetcher => {
	let data = await fetcher.fetch("item_tags.json").then ainda.
4.  **Tradução de Comentários Internos.**

Aqui está o código proposto para `Item(res => res.json());
	let itemTags = Object.keys(data).map(tag => tag.replace(/^minecraft:/, ""));
	let datalist = document.createElement("datalist");
	datalist.idCriteriaInput.js`:

```javascript
import { html, htmlCodeToElement } from "../essential.js";
 = "itemTagsDatalist";
	datalist.append(...itemTags.map(tag => new Optionimport * as HoloPrint from "../HoloPrint.js"; // Mantido, pois o arquivo HoloPrint.(tag)));
	return datalist;
});

/** Um elemento de entrada de critério de item personalizado. Arqujs não foi renomeado ainda
import { VanillaDataFetcher } from "../ResourcePackStack.js"; // Mantivos de tradução podem ser adicionados estendendo e definindo translateCurrentLanguage. */
export default class ItemCriteriaInput extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = ["value-items", "value-tagsido

// Carrega as listas de data para autocompletar
let itemsDatalistPromise = (new VanillaDataFetcher"];
	
	internals;
	
	#connected;
	#tasksPendingConnection;
	()).then(async fetcher => {
	let mojangItems = await fetcher.fetch("metadata/van#translateCurrentLanguage; // Função para buscar traduções
	
	#criteriaInputsCont; // Contêiner para osilladata_modules/mojang-items.json").then(res => res.json());
	let item inputs de critério
	
	/**
	 * @param {Function} [translateCurrentLanguage] Função para obterNames = mojangItems["data_items"].map(item => item["name"].replace(/^minecraft:/, "")) traduções do idioma atual.
	 */
	constructor(translateCurrentLanguage) {
		super();
		this.#
	let datalist = document.createElement("datalist");
	datalist.id = "itemNamesDatalist";
	datalist.append(...itemNames.map(itemName => new Option(itemName)));
	return datalist;
});translateCurrentLanguage = translateCurrentLanguage; // Armazena a função de tradução
		this.attachShadow({
			
let itemTagsDatalistPromise = HoloPrint.createPmmpBedrockDataFetcher().then(asyncmode: "open"
		});
		this.internals = this.attachInternals();
		
		this.#connected = false;
		this.#tasksPendingConnection = [];
	}
	connectedCallback() {
		if(this.#connected) {
			return;
		}
		this.#connected = true fetcher => {
	let data = await fetcher.fetch("item_tags.json").then(res => res.json());
	let itemTags = Object.keys(data).map(tag => tag.replace(/^minecraft:/, ""));
	let datalist = document.createElement("datalist");
	datalist.;
		
		this.tabIndex = 0; // Torna o custom element focável
		//id = "itemTagsDatalist";
	datalist.append(...itemTags.map(tag => new Option(tag)));
	return datalist;
});

/** Um elemento de input de critério de item personalizado. Arqu MODIFICADO: Textos traduzidos e chaves data-translate para os botões e placeholders
		thisivos de tradução podem ser adicionados estendendo e definindo translateCurrentLanguage. */
export default class ItemCriteria.shadowRoot.innerHTML = html`
			<style>
				:host {
					display: block;
					padding-left: 15px;
					font-size: 0.8rem;
Input extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = ["value-items", "value-tags				}
				#criteriaInputs:empty::before {
					content: attr(data-empty-text);
				}
				button {
					background: color-mix(in srgb, var(--accent-col) "];
	
	internals;
	
	#connected;
	#tasksPendingConnection;
	50%, white);
					cursor: pointer;
					font-family: inherit;
					line-height: inherit#translateCurrentLanguage; // Função para buscar traduções
	
	#criteriaInputsCont; // Contêiner para;
                    margin-left: 4px; /* Pequeno espaço entre botões */
                    padding: 2 os inputs
	
	/**
	 * @param {Function} [translateCurrentLanguageFn] Função para obterpx 6px;
                    border-radius: 4px;
				}
				input, button {
					box-sizing: border-box;
					border-style: solid;
					border-color: var(--accent a tradução da chave no idioma atual.
	 */
	constructor(translateCurrentLanguageFn) {
		super-col);
					outline-color: var(--accent-col);
					accent-color: var(--accent();
		this.#translateCurrentLanguage = translateCurrentLanguageFn;
		this.attachShadow({
			mode: "open"
		});
		this.internals = this.attachInternals();
		
		-col);
				}
				input {
					font-family: monospace;
                    padding: 3pxthis.#connected = false;
		this.#tasksPendingConnection = [];
	}
	connectedCallback() {
		if(this.#connected) {
			return;
		}
		this.#connected = true; 4px;
                    margin-right: 4px; /* Espaço antes do "ou" */
				}
				input.itemNameInput, #addItemButton {
					--accent-col: #007bff; /*
		
		this.tabIndex = 0; // Permite que o custom element receba foco
		// Azul primário do tema */
				}
				input.itemTagInput, #addTagButton {
					 MODIFICADO: Textos traduzidos no template HTML
		this.shadowRoot.innerHTML = html`
--accent-col: #ffc107; /* Amarelo/Laranja para tags, como exemplo */
			<style>
				:host {
					display: block;
					padding-left: 15px;
					font-size: 0.8rem;
				}
				#criteriaInputs:empty				}
				input:invalid:not(:placeholder-shown) {
					--accent-col: #dc3545; /* Vermelho de erro do tema */
				}
			</style>
			<label::before {
					content: attr(data-empty-text);
				}
				button {
					 data-translate="item_criteria_input.matching">Combinando:</label>
			<label id="criteriaInputsbackground: color-mix(in srgb, var(--accent-col) 50%, white);
					cursor" data-empty-text="Nada" data-translate-data-empty-text="item_criteria_input.nothing"></label>
			<button id="addItemButton" title="Adicionar nome de item">+ <span data-: pointer;
					font-family: inherit;
					line-height: inherit;
                    /* Estilos de botão para o tema azul podem ser herdados ou definidos aqui */
                    border: 1px solid var(--primary-blue-lighter, #ccc);
                    padding: 2px 6px;
                    margin-left:translate="item_criteria_input.item_name">Nome do Item</span></button>
			<button id=" 4px;
                    border-radius: 4px;
				}
                button:hover {
                    background-color: var(--primary-blue-lightest, #eef);
                }
				input, button {
					box-sizing: border-box;
					border-style: solid;
					border-coloraddTagButton" title="Adicionar tag de item">+ <span data-translate="item_criteria_input.item_tag">Tag do Item</span></button>
		`;
		this.#criteriaInputsCont = this.shadowRoot.selectEl("#criteriaInputs");
		this.shadowRoot.selectEl("#addItemButton").onEvent("click", () => {
			this.#addNewInput("item");
		});
		this.shadowRoot.selectEl: var(--accent-col);
					outline-color: var(--accent-col);
					accent-color: var(--accent-col);
				}
				input {
					font-family: monospace;
                    padding: 3px;
                    border: 1px solid #ccc;
                    border-radius: 3px;("#addTagButton").onEvent("click", () => {
			this.#addNewInput("tag");
		});
		
		let task;
		while(task = this.#tasksPendingConnection.shift()) {
			task();
		}
		
		this.#criteriaInputsCont.onEventAndNow("input", () => this.#reportFormState());
		this.onEvent("focus", async e => {
			if(e.composedPath()[0] instanceof this.constructor) { 
				(this.shadowRoot.selectEl("input:
				}
				input.itemNameInput, #addItemButton {
					--accent-col: #01808C; /* Azul para itens */
				}
				input.itemTagInput, #addTagButton {
					--accent-col: #D9A300; /* Amarelo/Laranja para tags */
				}
				input:invalid:not(:placeholder-shown) {
					--accent-col: #E24invalid") ?? this.shadowRoot.selectEl("input:last-child") ?? this.shadowRoot.selectEl("#addItemButton")).focus();
			}
			// Adiciona os datalists ao shadowRoot quando o componente ganha foco
			this.shadowRoot.append(await itemsDatalistPromise, await itemTagsDatalistPromise);
		});
		this.onEvent("blur", async () => { 
			if([...this.#criteriaInputsCont.selectEls436; /* Vermelho para inválido */
                    border-color: #E24436;
				}
                #criteriaInputsLabel { /* Rótulo "Combinando:" */
                    margin-right: 5px;
                }
                #criteriaInputs span.or-separator { /* Separador "ou" */
("input")].filter(input => input.value.trim() == "").map(input => input.remove()).length) {
				this.#reportFormState();
				this.#removeConsecutiveOrSpacers();
			}
			// Remove os datalists do shadowRoot quando o componente perde o foco para limpar o DOM
                                margin: 0 4px;
                }
			</style>
			<label id="criteriaInputsLabel" data-translate="item_criteria_input.matching">Combinando:</label>
			<span id="criteriaInputs" data-empty-text="Nada" data-translate-data-empty-text="item_criteria_input// (itemsDatalistPromise e itemTagsDatalistPromise resolvem para os elementos <datalist>)
            const itemsDatalist = await itemsDatalistPromise;
            const tagsDatalist = await itemTagsDatalistPromise;
            if (itemsDatalist.parentNode === this.shadowRoot) this.shadowRoot..nothing"></span>
			<button id="addItemButton" title="Adicionar nome de item">+ <span data-translate="item_criteria_input.item_name">Nome do Item</span></button>
			<button id="addTagButton" title="Adicionar tag de item">+ <span data-translate="item_criteria_input.removeChild(itemsDatalist);
            if (tagsDatalist.parentNode === this.shadowRoot) this.shadowRoot.removeChild(tagsDatalist);
		});
	}
	attributeChangedCallback(...argsitem_tag">Tag do Item</span></button>
		`;
		this.#criteriaInputsCont = this.shadowRoot.selectEl("#criteriaInputs");
		this.shadowRoot.selectEl("#addItemButton").onEvent) { 
		if(this.#connected) {
			this.#handleAttributeChange(...args);
		} else {
			this.#tasksPendingConnection.push(() => {
				this.#handleAttributeChange(...args);
			});
		}
	}
	formResetCallback() {
		this.value = this.getAttribute("("click", () => {
			this.#addNewInput("item");
		});
		this.shadowRoot.selectEl("#addTagButton").onEvent("click", () => {
			this.#addNewInput("tag");
		default") ?? "{}";
	}
	get form() {
		return this.internals.form;
	}
	get name() {
		return this.getAttribute("name");
	}
	});
		
		let task;
		while(task = this.#tasksPendingConnection.shift()) {
			task();
		}
		
		this.#criteriaInputsCont.onEventAndNow("input", ()get type() {
		return this.localName;
	}
	get value() {
		let itemNames = [...this.#criteriaInputsCont.selectEls(".itemNameInput")].map(input => input.value => this.#reportFormState());
		this.onEvent("focus", async e => {
			if(e.composedPath()[0] instanceof this.constructor) { 
				(this.shadowRoot.selectEl(".trim());
		let tagNames = [...this.#criteriaInputsCont.selectEls(".itemTagInput")].map(input => input.value.trim());
		return JSON.stringify(HoloPrint.createItemCriteria(itemNames, tagNamesinput:invalid") ?? this.shadowRoot.selectEl("input:last-child") ?? this.shadowRoot.selectEl("#addItemButton")).focus();
			}
			this.shadowRoot.append(await itemsDatalistPromise));
	}
	set value(stringifiedValue) {
		this.#criteriaInputsCont.innerHTML =, await itemTagsDatalistPromise);
		});
		this.onEvent("blur", async () => {  ""; // Limpa inputs existentes
		try {
            let itemCriteria = JSON.parse(stringifiedValue.
			if([...this.#criteriaInputsCont.selectEls("input")].filter(input => input.value.trim() ==replaceAll("'", `"`));
            itemCriteria["names"]?.forEach(itemName => {
                this.#addNewInput("item", false, itemName);
            });
            itemCriteria["tags"]?.forEach(tagName => {
 "").map(input => input.remove()).length) {
				this.#reportFormState();
				this.#                this.#addNewInput("tag", false, tagName);
            });
        } catch (e) {
            removeConsecutiveOrSpacers();
			}
			// Tenta remover datalists apenas se ainda estiverconsole.error("Erro ao definir valor do ItemCriteriaInput:", e, stringifiedValue);
            // Reset paraem no shadowRoot
			const itemsDatalist = await itemsDatalistPromise;
			if (this um estado vazio válido em caso de erro
            this.internals.setFormValue(JSON.stringify({names.shadowRoot.contains(itemsDatalist)) {
				this.shadowRoot.removeChild(itemsDatalist);
			}
			const itemTagsDatalist = await itemTagsDatalistPromise;
			: [], tags: []}));
        }
        this.#reportFormState(); // Reportar estado após definir o valor
	if (this.shadowRoot.contains(itemTagsDatalist)) {
				this.shadowRoot.removeChild(itemTags}
	
	#reportFormState() {
		this.internals.setFormValue(this.Datalist);
			}
		});
	}
	attributeChangedCallback(...args) { 
		if(this.#connected) {
			this.#handleAttributeChange(...args);
		} else {
			this.#value);
		let allInputs = [...this.#criteriaInputsCont.selectEls("input")];
		// MODIFICADO: Mensagens de erro traduzidas
		if(allInputs.length == 0) {
tasksPendingConnection.push(() => {
				this.#handleAttributeChange(...args);
			});
		}
	}
	formResetCallback() {
		this.value = this.getAttribute("default") ?? "			this.internals.setValidity({
				tooShort: true
			}, this.#translateCurrentLanguage?.("item_criteria_input.error.empty") ?? "Por favor, insira um critério de item.");{}";
	}
	get form() {
		return this.internals.form;
	}
	get name() {
		return this.getAttribute("name");
	}
	get type() {
		} else if(allInputs.some(el => !el.validity.valid)) {
			
		return this.localName;
	}
	get value() {
		let itemNames = [...this.internals.setValidity({
				patternMismatch: true
			}, this.#translateCurrentLanguage?.("this.#criteriaInputsCont.selectEls(".itemNameInput")].map(input => input.value.trim());
		let tagNames = [...this.#criteriaInputsCont.selectEls(".itemTagInput")].map(input =>item_criteria_input.error.invalid") ?? "Nome de item/tag inválido.");
		} else {
			this.internals.setValidity({});
		}
	}
	#handleAttributeChange(attrName, oldValue, newValue) {
		let inputValue = JSON.parse(this.value);
		newValue = newValue input.value.trim());
		return JSON.stringify(HoloPrint.createItemCriteria(itemNames, tagNames));
	}
	set value(stringifiedValue) {
		this.#criteriaInputsCont.innerHTML = ? newValue.split(",") : []; // Tratar newValue nulo
		switch(attrName) {
			case ""; // Limpa inputs existentes
		try {
			let itemCriteria = JSON.parse(stringifiedValue.replaceAll "value-items": {
				inputValue["names"] = newValue;
			} break;
			case "value("'", `"`));
			itemCriteria["names"]?.forEach(itemName => {
				this.#addNewInput-tags": {
				inputValue["tags"] = newValue;
			} break;
		}
		this.value = JSON.stringify(inputValue);
	}
	#addNewInput(type, autofocus = true,("item", false, itemName);
			});
			itemCriteria["tags"]?.forEach(tagName => {
				this.# initialValue) {
		// MODIFICADO: Placeholders traduzidos via data-translate-placeholder
		const attributesByType = {
			"item": `placeholder="Nome do Item" list="itemNamesDatalist"addNewInput("tag", false, tagName);
			});
		} catch (e) {
			console.error("Erro ao definir valor do ItemCriteriaInput:", e, stringifiedValue);
			// Define um valor padrão vazio em class="itemNameInput" data-translate-placeholder="item_criteria_input.item_name"`,
			"tag": `placeholder="Tag do Item" list="itemTagsDatalist" class="itemTagInput" caso de erro para evitar estado inconsistente
			this.internals.setFormValue(JSON.stringify(HoloPrint. data-translate-placeholder="item_criteria_input.item_tag"`
		}
		this.#criteriaInputsCont.createItemCriteria([], [])));
		}
		this.#reportFormState(); // Atualiza o estado do formulário apósselectEl(`input:last-child:placeholder-shown`)?.remove(); // Remove input vazio se houver
		let last definir o valor
	}
	
	#reportFormState() {
		this.internals.setFormValue(this.value);
		let allInputs = [...this.#criteriaInputsCont.selectEls("input")];
Node = [...this.#criteriaInputsCont.childNodes].at(-1);
		if(lastNode && !(lastNode instanceof HTMLSpanElement)) { // Adiciona "ou" se necessário
			let orSpan = document.createElement("span");		if(allInputs.length == 0) {
			this.internals.setValidity({
				tooShort: true
			}, this.#translateCurrentLanguage?.("item_criteria_input.error.empty") ??
			orSpan.dataset.translate = "item_criteria_input.or";
			orSpan.innerText = ` "Por favor, insira um critério de item.");
		} else if(allInputs.some(el ${this.#translateCurrentLanguage?.("item_criteria_input.or") || "ou"} `; // Adiciona espaços => !el.validity.valid)) {
			this.internals.setValidity({
				patternMismatch
			this.#criteriaInputsCont.appendChild(orSpan);
		}
		let newInput = htmlCodeTo: true
			}, this.#translateCurrentLanguage?.("item_criteria_input.error.invalid") ?? "Nome de item/tag inválido.");
		} else {
			this.internals.setValidity({});
		Element(`<input type="text" required pattern="^\\s*(\\w+:)?\\w+\\s*$" spellcheck}
	}
	#handleAttributeChange(attrName, oldValue, newValue) {
		let inputValue = JSON="false" autocapitalize="off" ${attributesByType[type]}/>`);
		newInput.onEvent("keydown", this.#inputKeyDownEvent);
		if(initialValue != undefined) {
			newInput.parse(this.value);
		newValue = newValue ? newValue.split(",") : []; // Trata newValue nulo ou vazio
		switch(attrName) {
			case "value-items": {
				inputValue[".value = initialValue;
		}
		this.#criteriaInputsCont.appendChild(newInput);
		if(autofocus) {
			newInput.focus();
		}
		// A tradução dosnames"] = newValue;
			} break;
			case "value-tags": {
				inputValue["tags"] = newValue placeholders será feita pelo MutationObserver no index.js
		this.#reportFormState();
	}
	#inputKeyDownEvent = e => { 
		if(e.target.value != "" && (e.key == "Tab" && !e.shiftKey && e.target == this.#criteriaInputsCont.selectEl("input;
			} break;
		}
		this.value = JSON.stringify(inputValue);
	}
	#addNewInput(type, autofocus = true, initialValue) {
		// MODIFICADO: Placeholder:last-child") || e.key == "Enter" || e.key == ",")) {
			e e classes traduzidas (data-translate-placeholder)
		const attributesByType = {
			"item": `placeholder="${this.#translateCurrentLanguage?.("item_criteria_input.item_name") || "Nome do Item"}".preventDefault();
			this.#addNewInput(e.target.classList.contains("itemNameInput")? "item" : list="itemNamesDatalist" class="itemNameInput" data-translate-placeholder="item_criteria_input "tag");
			// this.#reportFormState(); // Já é chamado dentro de #addNewInput
		} else if(.item_name"`,
			"tag": `placeholder="${this.#translateCurrentLanguage?.("item_criteria_input.item_tag") || "Tag do Item"}" list="itemTagsDatalist" class="e.key == "Backspace" && e.target.value == "") {
			e.preventDefault();
            itemTagInput" data-translate-placeholder="item_criteria_input.item_tag"`
		}
		this.#const previousSibling = e.target.previousElementSibling;
			e.target.remove();
			this.#removeConsecutiveOrSpacers();
            // Focar no input anterior ou no botão de adicionar se não houver mais inputscriteriaInputsCont.selectEl(`input:last-child:placeholder-shown`)?.remove(); // Remove input vazio se
            if (previousSibling && previousSibling.previousElementSibling instanceof HTMLInputElement) {
                previousSibling.previousElementSibling.focus(); existir
		
		// Adiciona separador "ou" se necessário
		let lastNode = [...this.#criteriaInputs
            } else {
                 (this.shadowRoot.selectEl("input:last-child") ?? this.shadowCont.childNodes].at(-1);
		if(lastNode && !(lastNode instanceof HTMLSpanElement && lastNode.classList.contains("or-separator"))) {
			let orSpan = document.createElement("span");
Root.selectEl("#addItemButton")).focus();
            }
			this.#reportFormState();
		}
	};			orSpan.classList.add("or-separator"); // Adicionada classe para estilização/identificação
			or
	#removeConsecutiveOrSpacers() { // Remove "ou"s desnecessários
		[...this.#criteriaInputsCont.children].forEach(node => {
			if(node instanceof HTMLSpanElement && (node.previousSiblingSpan.dataset.translate = "item_criteria_input.or";
			orSpan.innerText = ` ${this.#translate instanceof HTMLSpanElement || node.nextSibling instanceof HTMLSpanElement || !node.previousSibling || !node.nextSibling))CurrentLanguage?.("item_criteria_input.or") || "ou"} `; // Espaços para separação
			this.#criteriaInputsCont.appendChild(orSpan);
		}

		let newInput = htmlCodeToElement(`<input type="text {
				node.remove();
			}
		});
	}
}