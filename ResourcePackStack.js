// Permite empilhar múltiplos pacotes de recursos e obter um recurso singular,
// assim como o Minecraft faria. Atualmente, busca apenas os recursos vanilla.

import { all as mergeObjects } from "deepmerge";

import "./essential.js"; // Garante que polyfills/protótipos de essential.js sejam carregados

import LocalResourcePack from "./LocalResourcePack.js";
import { CachingFetcher, sha256text } from "./essential.js";

// MODIFICADO: Pode ser uma constante global ou configurável se necessário
const versaoDadosVanillaPadrao = "v1.21.70.26-preview"; // defaultVanillaDataVersion

export default class ResourcePackStack {
	static #ARQUIVOS_JSON_PARA_MESCLAR = ["blocks.json", "textures/terrain_texture.json", "textures/flipbook_textures.json"]; // JSON_FILES_TO_MERGE
	
	cacheEnabled;
	hash;
	cacheName;
	/** Se há ou não pacotes de recursos anexados (além do vanilla, claro) @type {Boolean} */
	hasResourcePacks;
	/** @type {Array<LocalResourcePack>} */
	#localResourcePacks;
	 /** @type {VanillaDataFetcher} */
	#vanillaDataFetcher;
	#cache;
	
	/**
	 * Cria uma pilha de pacotes de recursos para obter recursos.
	 * @param {Array<LocalResourcePack>} [localResourcePacks] Pacotes de recursos locais a serem aplicados. O início da lista tem prioridade mais alta.
	 * @param {Boolean} [enableCache] Se o cache de arquivos deve ser habilitado ou não.
	 * @param {String} [vanillaDataVersion] A versão do Minecraft para obter dados vanilla.
	 */
	constructor(localResourcePacks = [], enableCache = true, vanillaDataVersion = versaoDadosVanillaPadrao) {
		return (async () => {
			this.hash = (await sha256text([vanillaDataVersion, ...localResourcePacks.map(lrp => lrp.hash)].join("\n"))).toHexadecimalString();
			// MODIFICADO: Nome do cache personalizado
			this.cacheName = `HoloLab_ResourcePackStack_${this.hash}`;
			this.hasResourcePacks = localResourcePacks.length > 0;
			this.#localResourcePacks = localResourcePacks;
			this.#vanillaDataFetcher = await new VanillaDataFetcher(vanillaDataVersion);
			this.cacheEnabled = enableCache;
			if(enableCache) {
				// MODIFICADO: Tradução do log
				console.log("Usando cache:", this.cacheName, [vanillaDataVersion, ...localResourcePacks.map(lrp => lrp.hash)])
				this.#cache = await caches.open(this.cacheName);
			}
			
			return this;
		})();
	}
	
	/**
	 * Busca dados do diretório raiz de Mojang/bedrock-samples.
	 * @param {String} filePath 
	 * @returns {Promise<Response>}
	 */
	async fetchData(filePath) {
		return this.#vanillaDataFetcher.fetch(filePath);
	}
	/**
	 * Busca um arquivo de pacote de recursos.
	 * @param {String} resourcePath Caminho do recurso dentro da pasta resource_pack
	 * @returns {Promise<Response>}
	 */
	async fetchResource(resourcePath) {
		let filePath = `resource_pack/${resourcePath}`;
		// MODIFICADO: Prefixo do cache pode ser personalizado
		let cacheLink = `https://hololab-cache/${filePath}`; // Anteriormente holoprint-cache
		let res = this.cacheEnabled && await this.#cache.match(cacheLink);
		if(CachingFetcher.BAD_STATUS_CODES.includes(res?.status)) {
			await this.#cache.delete(cacheLink);
			res = undefined;
		}
		if(!res) {
			if(ResourcePackStack.#ARQUIVOS_JSON_PARA_MESCLAR.includes(resourcePath)) {
				let vanillaRes = await this.fetchData(filePath);
				let vanillaFile = await vanillaRes.clone().jsonc(); 
				let resourcePackFiles = await Promise.all(this.#localResourcePacks.map(resourcePack => resourcePack.getFile(resourcePath)?.jsonc()));
				resourcePackFiles.reverse(); 
				let allFiles = [vanillaFile, ...resourcePackFiles.removeFalsies()];
				if(allFiles.length == 1) { 
					res = vanillaRes;
				} else {
					let mergedFile = mergeObjects(allFiles);
					// MODIFICADO: Tradução do log
					console.debug(`Arquivo JSON mesclado ${resourcePath}:`, mergedFile, "De:", allFiles);
					res = new Response(JSON.stringify(mergedFile));
				}
			} else {
				for(let localResourcePack of this.#localResourcePacks) {
					let resource = localResourcePack.getFile(resourcePath);
					if(resource) {
						res = new Response(resource);
						break;
					}
				}
				res ??= await this.fetchData(filePath);
			}
			if(this.cacheEnabled) {
				await this.#cache.put(cacheLink, res.clone());
			}
		}
		return res;
	}
}

export class VanillaDataFetcher extends CachingFetcher {
	static #VANILLA_RESOURCES_LINK = "https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples"; 
	
	/**
	 * Cria um buscador de dados vanilla para buscar dados do repositório Mojang/bedrock-samples.
	 * @param {String} [version] O nome da tag do GitHub para uma versão específica do Minecraft.
	 */
	constructor(version = versaoDadosVanillaPadrao) {
		return (async () => {
			// MODIFICADO: Nome do cache personalizado
			await super(`HoloLab_VanillaDataFetcher_${version}`, `${VanillaDataFetcher.#VANILLA_RESOURCES_LINK}@${version}/`);
			this.version = version;
			
			return this;
		})();
	}
}