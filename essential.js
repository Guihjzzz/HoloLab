// Funções pequenas que não fazem nada específico para a funcionalidade principal do HoloLab (anteriormente HoloPrint)

import stripJsonComments from "strip-json-comments";

/** @returns {Element|null} */
export const selectEl = selector => document.querySelector(selector);
/** @returns {NodeListOf<HTMLElement>} */
export const selectEls = selector => document.querySelectorAll(selector);
/**
 * Encontra o descendente mais próximo de um elemento ou ele mesmo que corresponde a um seletor dado.
 * @param {Element} el
 * @param {String} selector
 * @returns {Element|null}
 */
export function closestDescendentOrSelf(el, selector) {
	if(el.matches(selector)) {
		return el;
	}
	return el.querySelector(selector);
}

Element.prototype.selectEl = DocumentFragment.prototype.selectEl = function(query) {
	return this.querySelector(query);
};
Element.prototype.selectEls = DocumentFragment.prototype.selectEls = function(query) {
	return this.querySelectorAll(query);
};
Element.prototype.getAllChildren = DocumentFragment.prototype.getAllChildren = function() {
	let children = [...this.selectEls("*")];
	let allChildren = [];
	while(children.length) {
		let child = children.shift();
		allChildren.push(child);
		if(child.shadowRoot) {
			allChildren.push(...child.shadowRoot.selectEls("*"));
		}
	}
	return allChildren;
};

EventTarget.prototype.onEvent = EventTarget.prototype.addEventListener;
EventTarget.prototype.onEvents = function(types, listener, options = false) {
	types.forEach(type => {
		this.addEventListener(type, listener, options);
	});
};
EventTarget.prototype.onEventAndNow = function(type, listener, options) {
	listener();
	this.addEventListener(type, listener, options);
};

Response.prototype.jsonc = Blob.prototype.jsonc = function() {
	return new Promise((res, rej) => {
		this.text().then(text => {
			let safeText = stripJsonComments(text);
			let json;
			try {
				json = JSON.parse(safeText);
			} catch(e) {
				rej(e);
				return;
			}
			res(json);
		}).catch(e => rej(e));
	});
};
Response.prototype.toImage = async function() {
	let imageBlob = await this.blob();
	let imageUrl = URL.createObjectURL(imageBlob);
	let image = new Image();
	image.src = imageUrl;
	try {
		await image.decode();
	} catch { 
		return new Promise((res, rej) => { 
			let image2 = new Image();
			image2.onEvent("load", () => {
				URL.revokeObjectURL(imageUrl);
				res(image2);
			});
			image2.onEvent("error", e => {
				URL.revokeObjectURL(imageUrl);
				// MODIFICADO: Tradução
				rej(`Falha ao carregar imagem da resposta com status ${this.status} da URL ${this.url}: ${e}`);
			});
			image2.src = imageUrl;
		});
	}
	URL.revokeObjectURL(imageUrl);
	return image;
};
Image.prototype.toImageData = function() {
	let can = new OffscreenCanvas(this.width, this.height);
	let ctx = can.getContext("2d");
	ctx.drawImage(this, 0, 0);
	return ctx.getImageData(0, 0, can.width, can.height);
};
ImageData.prototype.toImage = async function() {
	let can = new OffscreenCanvas(this.width, this.height);
	let ctx = can.getContext("2d");
	ctx.putImageData(this, 0, 0);
	let blob = await can.convertToBlob();
	let imageUrl = URL.createObjectURL(blob);
	let image = new Image();
	image.src = imageUrl;
	try {
		await image.decode();
	} catch {
		return new Promise((res, rej) => {
			let image2 = new Image();
			image2.onEvent("load", () => {
				URL.revokeObjectURL(imageUrl);
				res(image2);
			});
			image2.onEvent("error", e => {
				URL.revokeObjectURL(imageUrl);
				// MODIFICADO: Tradução
				rej(`Falha ao decodificar ImageData com dimensões ${this.width}x${this.height}: ${e}`);
			});
			image2.src = imageUrl;
		});
	}
	URL.revokeObjectURL(imageUrl);
	return image;
};
Image.prototype.toBlob = async function() {
	let can = new OffscreenCanvas(this.width, this.height);
	let ctx = can.getContext("2d");
	ctx.drawImage(this, 0, 0);
	return await can.convertToBlob();
};
Image.prototype.setOpacity = async function(opacity) {
	let imageData = this.toImageData();
	let data = imageData.data;
	for(let i = 0; i < data.length; i += 4) {
		data[i + 3] *= opacity;
	}
	return await imageData.toImage();
};
Image.prototype.addTint = async function(col) {
	let imageData = this.toImageData();
	let data = imageData.data;
	for(let i = 0; i < data.length; i += 4) {
		data[i] *= col[0];
		data[i + 1] *= col[1];
		data[i + 2] *= col[2];
	}
	return await imageData.toImage();
};
Blob.prototype.toImage = function() {
	return new Promise((res, rej) => {
		let img = new Image();
		let url = URL.createObjectURL(this);
		img.onEvent("load", () => {
			URL.revokeObjectURL(url);
			res(img);
		});
		img.onEvent("error", e => {
			URL.revokeObjectURL(url);
			rej(e);
		});
		img.src = url;
	});
};

export const sleep = async time => new Promise(resolve => setTimeout(resolve, time));

export const { min, max, floor, ceil, sqrt, round, abs, PI: pi, exp } = Math;
export const clamp = (n, lowest, highest) => min(max(n, lowest), highest);
export const lerp = (a, b, x) => a + (b - a) * x;
export const nanToUndefined = x => Number.isNaN(x)? undefined : x;

export function arrayMin(arr) {
	let minVal = Infinity; // MODIFICADO: Nome da variável para clareza
	for(let i = 0; i < arr.length; i++) {
		minVal = minVal < arr[i]? minVal : arr[i];
	}
	return minVal;
}
export function range(a, b, c) {
	if(b == undefined && c == undefined) {
		return (new Array(a + 1)).fill().map((x, i) => i);
	} else if(c == undefined) {
		return (new Array(b - a + 1)).fill().map((x, i) => i + a);
	} else {
		return (new Array((b - a) / c + 1)).fill().map((x, i) => i * c + a);
	}
}
export function random(arr) {
	return arr[~~(Math.random() * arr.length)];
}
/**
 * Remove entradas vazias de um array potencialmente esparso.
 * @template {Array} T
 * @param {T} arr
 * @returns {T}
 */
export function desparseArray(arr) {
	return arr.filter(() => true);
}
/**
 * Agrupa um array em dois arrays com base em uma função de condição.
 * @template T
 * @param {Array<T>} arr
 * @param {function(T): Boolean} conditionFunc
 * @returns {[Array<T>, Array<T>]}
 */
export function conditionallyGroup(arr, conditionFunc) {
	let res = [[], []];
	arr.forEach(el => {
		res[+conditionFunc(el)].push(el);
	});
	return res;
}
/**
 * Separa itens de um array com base no resultado de uma função de agrupamento.
 * @template T
 * @param {Array<T>} items
 * @param {function(T): String} groupFunc
 * @returns {Record<String, Array<T>>}
 */
export function groupBy(items, groupFunc) { 
	let res = {};
	items.forEach(item => {
		let group = groupFunc(item);
		res[group] ??= [];
		res[group].push(item);
	});
	return res;
};
/**
 * Agrupa arquivos por suas extensões.
 * @param {Array<File>} files
 * @returns {Record<String, Array<File>|undefined>}
 */
export function groupByFileExtension(files) {
	return groupBy(files, file => getFileExtension(file));
}
/**
 * Cria um pseudo-enumeração usando números.
 * @template {string[]} T
 * @param {[...T]} keys - Um array de literais de string para usar como chaves.
 * @returns {Record<T[number], number>}
 */
export function createNumericEnum(keys) {
	return Object.freeze(Object.fromEntries(keys.map((key, i) => [key, i])));
}
/**
 * Cria uma enumeração usando Símbolos (Symbols).
 * @template {String} T
 * @param {Array<T>} keys
 * @returns {Readonly<Record<T, symbol>>}
 */
export function createSymbolicEnum(keys) {
	return Object.freeze(Object.fromEntries(keys.map(key => [key, Symbol(key)])));
}
/**
 * Cria uma pseudo-enumeração usando strings.
 * @template {String} T
 * @param {Array<T>} keys
 * @returns {Readonly<Record<T, String>>}
 */
export function createStringEnum(keys) {
	return Object.freeze(Object.fromEntries(keys.map((key, i) => {
		let n = i + 1;
		let value = "";
		while(n) {
			value = String.fromCharCode((n - 1) % 26 + 97) + value;
			n = ~~((n - 1) / 26);
		}
		return [key, value];
	})));
}

export function hexColorToClampedTriplet(hexColor) {
	let [, r, g, b] = hexColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
	return [r, g, b].map(x => parseInt(x, 16) / 255);
}
export function addOrdinalSuffix(num) {
	// MODIFICADO: Usar sufixos em português, embora a função original seja para inglês.
    // Para português, a lógica é mais complexa e depende do gênero.
    // Simplificando para ordinal numérico básico (1º, 2º, 3º ...).
    if (num % 100 >= 11 && num % 100 <= 13) return num + "º"; // Casos como 11º, 12º, 13º
    switch (num % 10) {
        case 1: return num + "º"; // ou ª se feminino
        case 2: return num + "º"; // ou ª se feminino
        case 3: return num + "º"; // ou ª se feminino
        default: return num + "º";
    }
    // A função original:
	// return num + (num % 10 == 1 && num % 100 != 11? "st" : num % 10 == 2 && num % 100 != 12? "nd" : num % 10 == 3 && num % 100 != 13? "rd" : "th");
}
/** Retorna a string original quando usada em um template literal marcado. Usado apenas para que o HTML interno possa ser minificado na build, e para que o VSCode possa aplicar syntax highlighting com o plugin lit-plugin. */
export function html(strings, ...values) {
	return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}
/**
 * Encontra o nome base de um caminho de arquivo.
 * @param {String} path
 * @returns {String}
 */
export function basename(path) {
	return path.slice(path.lastIndexOf("/") + 1);
}
/**
 * Encontra o nome do diretório de um caminho de arquivo. Retorna uma string vazia se não houver diretórios, caso contrário, terminará com /.
 * @param {String} path
 * @returns {String}
 */
export function dirname(path) {
	return path.includes("/")? path.slice(0, path.lastIndexOf("/") + 1) : "";
}
/**
 * Encontra a extensão do arquivo de um arquivo ou nome de arquivo.
 * @param {File|String} filename
 * @returns {String}
 */
export function getFileExtension(filename) {
	if(filename instanceof File) {
		filename = filename.name;
	}
	return filename.slice(filename.lastIndexOf(".") + 1);
}
/**
 * Remove a (última) extensão de arquivo de um nome de arquivo.
 * @param {String} filename
 * @returns {String}
 */
export function removeFileExtension(filename) {
	return filename.includes(".")? filename.slice(0, filename.lastIndexOf(".")) : filename;
}
/**
 * Junta um array de strings com "ou", localizado.
 * @param {Array<String>} arr
 * @param {String} [language] Código de idioma (ex: 'pt-BR')
 * @returns {String}
 */
export function joinOr(arr, language = "pt-BR") { // MODIFICADO: Padrão para pt-BR
	return (new Intl.ListFormat(language.replaceAll("_", "-"), {
		type: "disjunction"
	})).format(arr);
}


/**
 * Define os arquivos de um input de arquivo e dispara eventos de input e change.
 * @param {HTMLInputElement} fileInput
 * @param {FileList|Array<File>} files
 */
export function setFileInputFiles(fileInput, files) {
	if(!files.length) {
		return;
	}
	if(Array.isArray(files)) {
		files = fileArrayToFileList(files);
	}
	fileInput.files = files;
	dispatchInputEvents(fileInput);
}
/**
 * Adiciona arquivos a um input de arquivo.
 * @param {HTMLInputElement} fileInput
 * @param {Array<File>} files
 */
export function addFilesToFileInput(fileInput, files) {
	if(!files.length) {
		return;
	}
	setFileInputFiles(fileInput, [...fileInput.files, ...files]);
}
/**
 * Transforma um array de arquivos em um FileList.
 * @param {Array<File>} files
 * @returns {FileList}
 */
export function fileArrayToFileList(files) {
	let dataTransfer = new DataTransfer();
	files.forEach(file => dataTransfer.items.add(file));
	return dataTransfer.files;
}
/**
 * Limpa todos os arquivos de um input de arquivo.
 * @param {HTMLInputElement} fileInput
 */
export function clearFileInput(fileInput) {
	fileInput.files = (new DataTransfer()).files;
	dispatchInputEvents(fileInput);
}
/**
 * Dispara os eventos input e change em um <input>.
 * @param {HTMLInputElement} input
 */
export function dispatchInputEvents(input) {
	input.dispatchEvent(new Event("input", {
		bubbles: true
	}));
	input.dispatchEvent(new Event("change", {
		bubbles: true
	}));
}
/**
 * Verifica se um toque de um evento de toque está dentro dos limites verticais de um elemento.
 * @param {Touch} touch
 * @param {Element} el
 * @returns {Boolean}
 */
export function isTouchInElementVerticalBounds(touch, el) {
	let domRect = el.getBoundingClientRect();
	return touch.clientY >= domRect.top && touch.clientY <= domRect.bottom;
}
export function htmlCodeToElement(htmlCode) {
	return (new DOMParser()).parseFromString(htmlCode, "text/html").body.firstElementChild;
}
export function stringToImageData(text, textCol = "black", backgroundCol = "white", font = "12px monospace") {
	let can = new OffscreenCanvas(0, 20);
	let ctx = can.getContext("2d");
	ctx.font = font;
	can.width = ctx.measureText(text).width;
	ctx.fillStyle = backgroundCol;
	ctx.fillRect(0, 0, can.width, can.height);
	ctx.fillStyle = textCol;
	ctx.font = font;
	ctx.fillText(text, 0, 15);
	return ctx.getImageData(0, 0, can.width, can.height);
}
/**
 * Adiciona preenchimento transparente ao redor de uma imagem.
 * @param {HTMLImageElement} image
 * @param {{ left: Number|undefined, right: Number|undefined, top: Number|undefined, bottom: Number|undefined }} padding Pixels
 * @returns {Promise<HTMLImageElement>}
 */
export async function addPaddingToImage(image, padding) {
	let { left = 0, right = 0, top = 0, bottom = 0 } = padding;
	let can = new OffscreenCanvas(image.width + left + right, image.height + top + bottom);
	let ctx = can.getContext("2d");
	ctx.drawImage(image, left, top);
	let blob = await can.convertToBlob();
	return await blob.toImage();
}
/**
 * Sobrepõe imagens quadradas, com a primeira imagem sendo a base. Elas podem ter dimensões diferentes e serão redimensionadas para não perder qualidade.
 * @param  {...HTMLImageElement} images
 * @returns {Promise<Blob>}
 */
export async function overlaySquareImages(...images) {
	let outputSize = images.map(image => image.width).reduce((a, b) => lcm(a, b));
	let can = new OffscreenCanvas(outputSize, outputSize);
	let ctx = can.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	images.forEach(image => {
		ctx.drawImage(image, 0, 0, outputSize, outputSize);
	});
	return await can.convertToBlob();
}
/**
 * Redimensiona uma imagem para um tamanho específico sem suavização de imagem.
 * @param {HTMLImageElement} image
 * @param {Number} width
 * @param {Number} [height]
 * @returns {Promise<Blob>}
 */
export async function resizeImageToBlob(image, width, height = width) {
	let can = new OffscreenCanvas(width, height);
	let ctx = can.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, 0, 0, width, height);
	return await can.convertToBlob();
}

let translationLanguages = {}; // MODIFICADO: Nome da variável
// MODIFICADO: Nome da função e tradução de logs/comentários
export async function carregarIdiomaTraducao(idioma) { // loadTranslationLanguage
	// Se pt_BR for solicitado, mas o arquivo real é en_US (contendo pt_BR)
    const chaveArquivoIdioma = (idioma === "pt_BR" && !translationLanguages["pt_BR"]) ? "en_US" : idioma;

	translationLanguages[chaveArquivoIdioma] ??= await fetch(`translations/${chaveArquivoIdioma}.json`).then(res => res.jsonc()).catch(() => {
		console.warn(`Falha ao carregar o idioma ${idioma} (chave de arquivo: ${chaveArquivoIdioma}) para traduções!`);
		return {};
	});
}
/**
 * Procura uma tradução de translations/`idioma`.json
 * @param {String} translationKey
 * @param {String} language
 * @returns {String|undefined}
 */
export function translate(translationKey, language) { // A função global de tradução
    const fileLanguageKey = (language === "pt_BR" && !translationLanguages["pt_BR"] && translationLanguages["en_US"]) ? "en_US" : language;

	if(!(fileLanguageKey in translationLanguages)) {
		console.error(`Idioma ${language} (chave de arquivo: ${fileLanguageKey}) não carregado para tradução!`);
		return undefined;
	}
	return translationLanguages[fileLanguageKey][translationKey]?.replaceAll(/`([^`]+)`/g, "<code>$1</code>")?.replaceAll(/\[([^\]]+)\]\(([^\)]+)\)/g, `<a href="$2" target="_blank">$1</a>`);
}

export function getStackTrace(e = new Error()) {
	return e.stack.split("\n").slice(1).removeFalsies();
}

/**
 * Retorna o hash SHA-256 de um blob.
 * @param {Blob} blob
 * @returns {Promise<Uint8Array>}
 */
export async function sha256(blob) {
	return new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()));
}
export async function sha256text(text) {
	return new Uint8Array(await crypto.subtle.digest("SHA-256", (new TextEncoder()).encode(text)));
}
Uint8Array.prototype.toHexadecimalString = function() {
	return [...this].map(ch => ch.toString(16).padStart(2, "0")).join("");
};
Array.prototype.removeFalsies = function() {
	return this.filter(el => el);
};
export function concatenateFiles(files, name) {
	return new File(files, name ?? files.map(file => file.name).join(","));
}

CacheStorage.prototype.clear = async function() {
	(await this.keys()).forEach(cacheName => this.delete(cacheName));
};

/**
 * Promise.all() mas para objetos
 * @template T
 * @param {T} object
 * @returns {Promise<{[K in keyof T]: Awaited<T[K]>}>}
 */
export async function awaitAllEntries(object) {
	await Promise.all(Object.entries(object).map(async ([key, promise]) => {
		object[key] = await promise;
	}));
	return object;
}

/**
 * Retorna os dois fatores de um número que são mais próximos um do outro.
 * @param {Number} n
 * @returns {[Number, Number]}
 */
export function closestFactorPair(n) {
	let x = ceil(sqrt(n));
	while(n % x) x++;
	return [x, n / x];
}
/**
 * Calcula o MDC de dois números
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
export function gcd(a, b) {
	while(b != 0) {
		// MODIFICADO: Tradução do erro
		if(!(a >= 1 && b >= 1)) throw new Error(`Não é possível encontrar o MDC de ${a} e ${b}`);
		[a, b] = [b, a % b]; // Algoritmo Euclidiano
	}
	return a;
}
/**
 * Calcula o MMC de dois números
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
export function lcm(a, b) {
	return a * b / gcd(a, b);
}

export function downloadBlob(blob, fileName) {
	let a = document.createElement("a");
	let objectURL = URL.createObjectURL(blob);
	a.href = objectURL;
	a.download = fileName ?? blob.name; 
	a.click();
	URL.revokeObjectURL(objectURL);
}

function stringifyJsonBigIntSafe(value) {
	return JSON.stringify(value, (_, x) => typeof x == "bigint"? (JSON.rawJSON ?? String)(x) : x); 
}

export class JSONSet extends Set {
	#actualValues;
	constructor() {
		super();
		this.#actualValues = new Map();
	}
	indexOf(value) { 
		let stringifiedValues = [...super[Symbol.iterator]()];
		return stringifiedValues.indexOf(this.#stringify(value));
	}
	add(value) {
		let stringifiedValue = this.#stringify(value);
		if(!this.#actualValues.has(stringifiedValue)) {
			this.#actualValues.set(stringifiedValue, structuredClone(value));
		}
		return super.add(stringifiedValue);
	}
	delete(value) {
		return super.delete(this.#stringify(value));
	}
	has(value) {
		return super.has(this.#stringify(value))
	}
	[Symbol.iterator]() {
		return this.#actualValues.values();
	}
	entries() {
		let iter = this[Symbol.iterator]();
		return {
			next: () => {
				let { value, done } = iter.next();
				return {
					value: done? undefined : [value, value],
					done
				};
			},
			[Symbol.iterator]() {
				return this;
			}
		};
	}
	keys() {
		return this[Symbol.iterator]();
	}
	values() {
		return this[Symbol.iterator]();
	}
	#stringify(value) {
		return stringifyJsonBigIntSafe(value);
	}
}
export class JSONMap extends Map { 
	constructor() {
		super();
	}
	get(key) {
		return super.get(this.#stringify(key));
	}
	has(key) {
		return super.has(this.#stringify(key));
	}
	set(key, value) {
		return super.set(this.#stringify(key), value)
	}
	#stringify(value) {
		return stringifyJsonBigIntSafe(value);
	}
}
export class CachingFetcher {
	static URL_PREFIX = "https://cache/"; // Pode ser personalizado se necessário
	static BAD_STATUS_CODES = [429];
	
	cacheName;
	#baseUrl;
	/** @type {Cache} */
	#cache;
	constructor(cacheName, baseUrl = "") {
		return (async () => {
			this.#cache = await caches.open(cacheName);
			this.#baseUrl = baseUrl;
			this.cacheName = cacheName;
			
			return this;
		})();
	}
	/**
	 * Busca um arquivo, verificando primeiro no cache.
	 * @param {String} url
	 * @returns {Promise<Response>}
	 */
	async fetch(url) {
		let fullUrl = this.#baseUrl + url;
		let cacheLink = CachingFetcher.URL_PREFIX + url;
		let res = await this.#cache.match(cacheLink);
		if(CachingFetcher.BAD_STATUS_CODES.includes(res?.status)) {
			await this.#cache.delete(cacheLink);
			res = undefined;
		}
		if(!res) {
			res = await this.retrieve(fullUrl);
			let fetchAttempsLeft = 5;
			const fetchRetryTimeout = 1000;
			while(CachingFetcher.BAD_STATUS_CODES.includes(res.status) && fetchAttempsLeft--) {
				// MODIFICADO: Tradução
				console.debug(`Status HTTP ruim (${res.status}) encontrado em ${fullUrl}, tentando novamente em ${fetchRetryTimeout}ms`);
				await sleep(fetchRetryTimeout);
			}
			if(fetchAttempsLeft) {
				await this.#cache.put(cacheLink, res.clone());
			} else {
				// MODIFICADO: Tradução
				console.error(`Não foi possível evitar códigos de status HTTP ruins para ${fullUrl}`);
			}
		}
		return res;
	}
	/**
	 * Carrega um arquivo de fato, quando não encontrado no cache.
	 * @param {String} url
	 * @returns {Promise<Response>}
	 */
	async retrieve(url) {
		const maxFetchAttempts = 3;
		const fetchRetryTimeout = 500; // ms
		let lastError;
		for(let i = 0; i < maxFetchAttempts; i++) {
			try {
				return await fetch(url);
			} catch(e) {
				if(navigator.onLine && e instanceof TypeError && e.message == "Failed to fetch") { 
					// MODIFICADO: Tradução
					console.debug(`Falha ao buscar recurso em ${url}, tentando novamente em ${fetchRetryTimeout}ms`);
					lastError = e;
					await sleep(fetchRetryTimeout);
				} else {
					throw e;
				}
			}
		}
		// MODIFICADO: Tradução
		console.error(`Falha ao buscar recurso em ${url} após ${maxFetchAttempts} tentativas...`);
		throw lastError;
	}
}
/**
 * Cria uma classe de erro personalizada com um nome dado.
 * @param {String} name
 * @returns {typeof Error}
 */
export function createCustomError(name) {
	return class extends Error {
		constructor(message) {
			super(message);
			this.name = name;
		}
	};
}
// MODIFICADO: Tradução do nome do erro (ou manter em inglês se preferir consistência com APIs JS)
export const UserError = createCustomError("ErroDoUsuario"); // Ou "UserError"