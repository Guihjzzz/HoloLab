import { clamp, createSymbolicEnum, html, isTouchInElementVerticalBounds, max, min, removeFileExtension, sleep } from "../essential.js";

export default class FileInputTable extends HTMLElement {
	static observedAttributes = ["file-count-text", "empty-text", "remove-all-text", "hide-file-extensions"];
	
	static #ANIMATION_MOVEMENTS = createSymbolicEnum(["MOVE_DOWN", "MOVE_UP"]);
	static #ANIMATION_LENGTH = 400; // ms
	
	/** @type {HTMLInputElement} */
	fileInput;
	/** @type {HTMLTableElement} */
	#table;
	/** @type {HTMLSpanElement} */ // MODIFICADO: Era HTMLParagraphElement, mas é um span dentro de um p
	#fileCountHeading;
	/** @type {HTMLTableRowElement|null} */
	#rowBeingDragged;
	/** @type {Number} */
	#touchDragVerticalOffset;
	/** @type {WeakMap<HTMLTableRowElement, File>} */
	#filesByRow;
	
	constructor() {
		super();
		this.attachShadow({
			mode: "open"
		});
		this.#filesByRow = new WeakMap();
	}
	connectedCallback() {
		if(this.childElementCount != 1 || !(this.children[0] instanceof HTMLInputElement) || this.children[0].type != "file") {
			// MODIFICADO: Tradução do erro
			throw new Error("Elementos FileInputTable precisam de exatamente 1 filho: um input de arquivo!");
		}
		this.fileInput = this.children[0];
		this.#initShadowDom();
		this.fileInput.onEvent("input", () => this.#updateTable());
		
		this.#updateTable();
	}
	attributeChangedCallback(attrName, _, newValue) {
		let elBoundToAttr = this.shadowRoot.selectEl(`[data-text-attribute="${attrName}"]`);
		if(elBoundToAttr) {
			elBoundToAttr.textContent = newValue; // O texto é atualizado pelo atributo
			return;
		}
		if(!this.#table) { // Se o shadow DOM não foi inicializado ainda
			return;
		}
		switch(attrName) {
			case "file-count-text":
			case "empty-text": {
				this.#updateFileCountHeading();
				break;
			}
			case "hide-file-extensions": {
				this.#updateTable();
				break;
			}
		}
	}
	
	#initShadowDom() {
		// MODIFICADO: Cores CSS ajustadas para o tema azul
		this.shadowRoot.innerHTML = html`
			<style>
				:host {
					display: block;
					width: 100%;
				}
				#main {
					margin: auto;
					width: 70%; /* Mantido, pode ser ajustado no CSS principal se necessário */
					border: 3px ridge var(--primary-blue-lighter, #58a6ff); /* Azul para borda */
					background-color: var(--section-background, #f8f9fa); /* Fundo de seção */
					border-radius: 8px;
					overflow: hidden; /* Para conter bordas arredondadas */
				}
				#main > * {
					width: 100%;
				}
				#fileCountHeadingWrapper {
					margin: 0;
					padding: 4px 8px; /* Aumentado padding */
					height: 26px; /* Ajustado para padding */
					box-sizing: border-box;
					background: var(--primary-blue-lightest, #cce5ff); /* Fundo azul bem claro */
					color: var(--primary-blue-darker, #0056b3); /* Texto azul escuro */
					border-bottom: 1px solid var(--primary-blue-lighter, #58a6ff);
				}
				#fileCountHeading {
					font-weight: bold;
					font-size: 1em;
				}
				#removeAllFilesButton {
					padding: 1px 6px; /* Ajustado padding */
					float: right;
					height: 100%;
					box-sizing: border-box;
					background: var(--primary-blue-lighter, #58a6ff);
					color: var(--text-color-light, #f8f9fa);
					border: 1px solid var(--primary-blue, #007bff);
					border-radius: 5px;
					font-family: inherit;
					line-height: inherit;
					font-size: smaller;
					cursor: pointer;
					transition: transform 0.15s, background-color 0.15s;
				}
				#removeAllFilesButton .material-symbols {
					font-size: 120%;
					vertical-align: top;
					display: inline-block;
					width: 1ch;
				}
				#removeAllFilesButton:hover {
					transform: scale(1.05);
					background-color: var(--primary-blue, #007bff);
				}
				#removeAllFilesButton:active {
					transform: scale(1.02);
					background-color: var(--primary-blue-darker, #0056b3);
				}
				button { /* Estilo base para botões internos da tabela */
					color: var(--primary-blue-darker, #0056b3);
				}
				table {
					border-collapse: collapse;
					table-layout: fixed;
					background-color: var(--background-color, #fff);
				}
				tr {
					border-bottom: 1px solid var(--border-color, #ced4da); /* Linha divisória sutil */
				}
				tr:last-child {
					border-bottom: none;
				}
				tr:first-child .moveUpButton, tr:last-child .moveDownButton {
					visibility: hidden;
				} 
				tr:only-child .dragMoveCell {
					opacity: 0; 
					cursor: initial;
				}
				tr:nth-child(odd) { /* Leve alternância de cor para linhas */
					background: rgba(0, 123, 255, 0.03); /* Azul muito sutil */
				}
				tr.beingDragged {
					position: relative;
					background: var(--primary-blue-lightest, #cce5ff) !important; /* Destaque azul ao arrastar */
					color: var(--primary-blue-darker, #0056b3);
					transition: background 0.1s;
					box-shadow: 0 2px 5px rgba(0,0,0,0.2);
				}
				tr:not(:only-child):not(.beingDeleted) .dragMoveCell {
					cursor: grab;
				}
				tr:not(:only-child):not(.beingDeleted) .dragMoveCell:active {
					cursor: grabbing;
				}
				td {
					padding: 4px 6px; /* Padding nas células */
				}
				td:first-child {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap; /* Evitar quebra de linha no nome do arquivo */
				}
				td:last-child {
					user-select: none;
					padding: 0;
					width: 5.06rem; /* Mantido */
					text-align: right; /* Alinhar botões à direita */
				}
				td div { /* Contêiner dos botões de ação */
					height: 24px;
					display: flex;
					justify-content: flex-end; /* Alinhar botões à direita */
				}
				td div * { /* Estilo dos botões de ação */
					width: 1.265rem; /* Mantido */
					height: 24px;
					font-size: 115%;
					transition: font-size 0.1s, color 0.15s;
					text-align: center;
					color: var(--primary-blue, #007bff);
				}
				td button {
					padding: 0;
					border: none;
					background: none;
					cursor: pointer;
					border-radius: 4px; /* Pequeno arredondamento */
				}
                td button:hover {
                    color: var(--primary-blue-darker, #0056b3);
                    background-color: rgba(0, 123, 255, 0.1); /* Fundo sutil no hover */
                }
				td button:not(.dragMoveCell):active {
					font-size: 80%;
				}
				.material-symbols {
					font-family: "Material Symbols";
					line-height: 1;
				}
			</style>
			<div id="main">
				<p id="fileCountHeadingWrapper">
					<span id="fileCountHeading"></span>
					<button id="removeAllFilesButton">
						<span data-text-attribute="remove-all-text">Remover Todos</span> 
						<span class="material-symbols">delete_sweep</span>
					</button>
				</p>
				<table></table>
			</div>
		`;
		this.#fileCountHeading = this.shadowRoot.selectEl("#fileCountHeading");
		let removeAllFilesButton = this.shadowRoot.selectEl("#removeAllFilesButton");
		this.#table = this.shadowRoot.selectEl("table");
		
		this.#updateFileCountHeading();
		this.#updateHasFilesAttribute();
		let tableObserver = new MutationObserver(() => {
			this.#updateFileCountHeading();
			this.#updateHasFilesAttribute();
		});
		tableObserver.observe(this.#table, {
			childList: true,
			subtree: true
		});
		
		removeAllFilesButton.onEvent("click", async () => {
			for(let button of this.#table.selectEls(".deleteButton")) {
				button.click();
				await sleep(FileInputTable.#ANIMATION_LENGTH * 0.15);
			}
		});
		
		this.#table.addEventListener("click", e => {
			if(!(e.target instanceof HTMLButtonElement || e.target.parentElement instanceof HTMLButtonElement )) { // Clicar no ícone dentro do botão
				return;
			}
            const button = e.target.closest("button");
			let row = button.closest("tr");

			if(button.classList.contains("moveUpButton")) {
				this.#animateRow(row.previousElementSibling, FileInputTable.#ANIMATION_MOVEMENTS.MOVE_DOWN, false);
				row.previousElementSibling.before(row);
				this.#animateRow(row, FileInputTable.#ANIMATION_MOVEMENTS.MOVE_UP);
			} else if(button.classList.contains("moveDownButton")) {
				this.#animateRow(row.nextElementSibling, FileInputTable.#ANIMATION_MOVEMENTS.MOVE_UP, false);
				row.nextElementSibling.after(row);
				this.#animateRow(row, FileInputTable.#ANIMATION_MOVEMENTS.MOVE_DOWN);
			} else if(button.classList.contains("deleteButton")) {
				this.#deleteRow(row);
			} else {
				return;
			}
			this.#updateFileInput();
		});
		this.#table.onEvents(["dragstart", "touchstart"], e => {
			// ... (lógica de drag and drop mantida, traduza comentários internos se necessário) ...
			if(e.target.classList.contains("dragMoveCell") && getComputedStyle(e.target).opacity != "0") {
				let row = e.target.closest("tr");
				if(row.classList.contains("beingDeleted")) {
					e.preventDefault();
					return;
				}
				this.#rowBeingDragged = row;
				this.#rowBeingDragged.classList.add("beingDragged");
				if(e.type == "dragstart") {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.dropEffect = "move";
					e.dataTransfer.setDragImage(this.#rowBeingDragged.cells[0], 0, 0);
				} else {
					this.#touchDragVerticalOffset = e.changedTouches[0].clientY;
				}
			}
		}, {
			passive: false
		});
		this.#table.onEvents(["dragover", "touchmove"], e => {
			// ... (lógica de drag and drop mantida) ...
			if(!this.#rowBeingDragged) return;
			e.preventDefault();
			let targetRow;
			if(e.type == "dragover") {
				targetRow = e.target.closest("tr");
			} else {
				let touch = e.changedTouches[0];
				if(isTouchInElementVerticalBounds(touch, this.#table)) {
					targetRow = Array.from(this.#table.rows).find(row => row != this.#rowBeingDragged && isTouchInElementVerticalBounds(touch, row));
				}
			}
			if(targetRow && targetRow != this.#rowBeingDragged && !targetRow.getAnimations().length) {
				let initialY = this.#rowBeingDragged.offsetTop;
				if(this.#rowBeingDragged.rowIndex < targetRow.rowIndex) {
					for(let rowI = this.#rowBeingDragged.rowIndex + 1; rowI <= targetRow.rowIndex; rowI++) {
						this.#animateRow(this.#table.rows[rowI], FileInputTable.#ANIMATION_MOVEMENTS.MOVE_UP, false);
					}
					targetRow.after(this.#rowBeingDragged);
					this.#animateRow(this.#rowBeingDragged, e.type == "dragover"? FileInputTable.#ANIMATION_MOVEMENTS.MOVE_DOWN : undefined);
				} else {
					for(let rowI = targetRow.rowIndex; rowI < this.#rowBeingDragged.rowIndex; rowI++) {
						this.#animateRow(this.#table.rows[rowI], FileInputTable.#ANIMATION_MOVEMENTS.MOVE_DOWN, false);
					}
					targetRow.before(this.#rowBeingDragged);
					this.#animateRow(this.#rowBeingDragged, e.type == "dragover"? FileInputTable.#ANIMATION_MOVEMENTS.MOVE_UP : undefined);
				}
				let deltaY = this.#rowBeingDragged.offsetTop - initialY;
				this.#touchDragVerticalOffset += deltaY;
				this.#updateFileInput();
			}
			if(e.type == "touchmove") {
				let currentOffset = parseFloat(this.#rowBeingDragged.style.top) || 0;
				let tableBounds = this.#table.getBoundingClientRect();
				let rowBounds = this.#rowBeingDragged.getBoundingClientRect();
				let lowest = min(tableBounds.top - (rowBounds.top - currentOffset), 0);
				let highest = max(tableBounds.bottom - (rowBounds.bottom - currentOffset), 0);
				let y = clamp(e.changedTouches[0].clientY - this.#touchDragVerticalOffset, lowest, highest);
				this.#rowBeingDragged.style.top = `${y}px`;
			}
		}, {
			passive: false
		});
		this.#table.onEvents(["dragend", "touchend", "touchcancel"], () => {
			// ... (lógica de drag and drop mantida) ...
			if(this.#rowBeingDragged) {
				this.#rowBeingDragged.classList.remove("beingDragged");
				this.#rowBeingDragged.style.left = "";
				this.#rowBeingDragged.style.top = "";
				this.#rowBeingDragged = null;
			}
		});
	}
	
	#updateTable() {
		let alreadyHadRows = this.#table.rows.length > 0; 
		let oldFiles = alreadyHadRows && new Set(Array.from(this.#table.rows).map(row => this.#filesByRow.get(row)));
		this.#table.textContent = "";
		Array.from(this.fileInput.files).forEach(file => {
			let row = this.#table.insertRow();
			this.#filesByRow.set(row, file);
			let fileNameCell = row.insertCell();
			fileNameCell.textContent = this.hasAttribute("hide-file-extensions") && file.name.lastIndexOf(".") != 0? removeFileExtension(file.name) : file.name;
			this.#addGenericRowButtons(row);
			if(alreadyHadRows && !oldFiles.has(file)) {
				this.#animateRow(row);
			}
		});
	}
	#updateFileCountHeading() {
		// Os textos são agora controlados pelos atributos do elemento no HTML principal
		if(this.fileInput.files.length) {
			let countText = this.getAttribute("file-count-text") ?? "{COUNT} arquivo[s] selecionado[s]";
			let pluralizedCountText = this.fileInput.files.length > 1? countText.replaceAll(/\[|\]/g, "") : countText.replaceAll(/\[.+\]/g, "");
			this.#fileCountHeading.textContent = pluralizedCountText.replace("{COUNT}", this.fileInput.files.length);
		} else {
			this.#fileCountHeading.textContent = this.getAttribute("empty-text") ?? "Nenhum arquivo selecionado";
		}
	}
	#updateHasFilesAttribute() {
		if(this.fileInput.files.length) {
			this.setAttribute("has-files", ""); 
		} else {
			this.removeAttribute("has-files");
		}
	}
	
	#addGenericRowButtons(row) {
		row.insertAdjacentHTML("beforeend", html`
			<td>
				<div>
					<button class="moveUpButton material-symbols" title="Mover para Cima">arrow_upward</button>
					<button class="moveDownButton material-symbols" title="Mover para Baixo">arrow_downward</button>
					<button class="deleteButton material-symbols" title="Remover">delete</button>
					<button draggable="true" class="dragMoveCell material-symbols" title="Arrastar para Reordenar">drag_indicator</button>
				</div>
			</td>
		`);
	}
	#updateFileInput() {
		let files = Array.from(this.#table.rows).filter(row => !row.classList.contains("beingDeleted")).map(row => this.#filesByRow.get(row));
		let dt = new DataTransfer();
		files.forEach(file => dt.items.add(file));
		this.fileInput.files = dt.files;
		this.#updateFileCountHeading(); // É importante chamar isso para que o FileList reflita a UI
        dispatchInputEvents(this.fileInput); // Notifica o formulário sobre a mudança
	}
	
	#animateRow(row, movement, highlight = true) {
		// ... (lógica de animação mantida, pode traduzir comentários internos se houver) ...
        let startingFrame = {};
		if(movement) {
			let rowHeight = row.getBoundingClientRect().height;
			let offset = rowHeight * (movement == FileInputTable.#ANIMATION_MOVEMENTS.MOVE_DOWN? -1 : 1);
			startingFrame = {
				transform: `translateY(${offset}px)`,
				composite: "add"
			};
		}
		if(highlight) {
			const middleFrame = {
				transform: "scale(1.08)",
				boxShadow: "0 0 5px rgba(0, 90, 179, 0.5)" // Sombra azul para destaque
			};
			for(let i = 0; i < 2; i++) { 
				row.animate([
					i == 0? startingFrame : {},
					{
						...middleFrame,
						offset: 0.3
					},
					{
						...middleFrame,
						offset: 0.7
					},
					{}
				], {
					duration: FileInputTable.#ANIMATION_LENGTH,
					easing: "ease"
				});
			}
		} else {
			row.animate([startingFrame, {}], {
				duration: FileInputTable.#ANIMATION_LENGTH * 0.3,
				easing: "ease"
			});
		}
	}
	
	async #deleteRow(row) {
		// ... (lógica de deleção mantida, pode traduzir comentários internos) ...
        if(row.classList.contains("beingDeleted")) {
			return;
		}
		row.classList.add("beingDeleted");
		let deleteAnimation = row.animate({
			opacity: [1, 0]
		}, {
			duration: FileInputTable.#ANIMATION_LENGTH,
			easing: "cubic-bezier(0.165, 0.84, 0.44, 1)"
		});
		await deleteAnimation.finished;
		for(let rowI = row.rowIndex + 1; rowI < this.#table.rows.length; rowI++) { // Corrigido para ser <, não <=
			this.#animateRow(this.#table.rows[rowI], FileInputTable.#ANIMATION_MOVEMENTS.MOVE_UP, false);
		}
		let rowHeight = row.getBoundingClientRect().height;
		this.#table.animate({
			marginBottom: [rowHeight + "px", "0"]
		}, {
			duration: FileInputTable.#ANIMATION_LENGTH * 0.3,
			easing: "ease",
			composite: "add"
		});
		row.remove();
	}
}