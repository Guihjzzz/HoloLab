import { dirname, sha256, sha256text } from "./essential.js"; // Mantém import de essential.js

export default class LocalResourcePack {
	/** @type {String} Um hash único para este pacote de recursos local. */
	hash;
	#files;
	
	/**
	 * Cria um pacote de recursos local a partir da lista de arquivos de um input de pasta.
	 * @param {FileList} fileList Lista de arquivos do input.
	 * @param {Boolean} [aggressiveHashing] Se deve usar hashing agressivo (hash de conteúdo de todos os arquivos).
	 */
	constructor(fileList = [], aggressiveHashing = false) {
		return (async () => {
			this.#files = new Map();
			let folderSummary = []; // Usado para hashing agressivo
			let rootFile = [...fileList].find(file => file.name == "manifest.json");
			if(!rootFile) {
				// MODIFICADO: Tradução do erro
				throw new Error("Não foi possível encontrar manifest.json no pacote de recursos local; ele não será carregado!");
			}
			this.hash = (await sha256(rootFile)).toHexadecimalString();
			let rootPackPath = dirname(rootFile.webkitRelativePath);
			let packFiles = [...fileList].filter(file => file.webkitRelativePath.startsWith(rootPackPath));
			let abstractFiles = packFiles.map(file => ({
				name: file.webkitRelativePath.slice(rootPackPath.length),
				blob: file
			}));
			for(let file of abstractFiles) {
				this.#files.set(file.name, file.blob);
				if(aggressiveHashing) {
					folderSummary.push(file.name, await sha256(file.blob));
				}
			}
			if(aggressiveHashing) {
				this.hash = (await sha256text(folderSummary.join("\n"))).toHexadecimalString();
			} else if(!this.hash) { // Isso só deve acontecer se o manifest.json estiver vazio ou for inválido, o que é improvável
				let joinedFileNames = abstractFiles.map(file => file.name).join("\n");
				this.hash = (await sha256text(joinedFileNames)).toHexadecimalString();
				// MODIFICADO: Tradução do aviso
				console.warn(`Não foi possível encontrar manifest.json no pacote de recursos local para o hash; usando hash ${this.hash} (isso nunca deveria aparecer)`);
			}
			
			return this;
		})();
	}
	/**
	 * Obtém um arquivo do pacote de recursos local, ou undefined se não existir.
	 * @param {String} filePath Caminho do arquivo.
	 * @returns {File|undefined}
	 */
	getFile(filePath) {
		return this.#files.get(filePath);
	}
}