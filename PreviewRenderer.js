import TextureAtlas from "./TextureAtlas.js"; // Mantém import
import { max, min } from "./entários Internos.**
3.  **Tradução de Mensagens de Erro/Log (`console.error`).essential.js"; // Mantém import

let THREE; // Será carregado dinamicamente
let StandaloneModelViewer;**
4.  **Caminhos de Assets (Skybox):**
    *   O skybox é carreg // Será carregado dinamicamente

export default class PreviewRenderer {
	viewer;
	/**
	 * Criaado de `"assets/previewPanorama/"`. Se você quiser um skybox diferente, precisará fornecer suas próprias imagens e atualizar um renderizador de pré-visualização para um arquivo de geometria completo.
	 * @param {HTMLElement} cont O contêiner onde a pré-visualização será inserida.
	 * @param {TextureAtlas} textureAtlas O atlas este caminho. Por enquanto, manterei o caminho original, mas com um comentário.
5.  **Nomes de Classes e de texturas a ser usado.
	 * @param {Object} geo O objeto de geometria do Minecraft.
	 * Funções:** Manteremos em inglês.

Aqui está o código proposto para `PreviewRenderer.js`:

```javascript @param {Object} animations Conteúdo do arquivo `.animation.json`.
	 * @param {Boolean} [showSkybox
import TextureAtlas from "./TextureAtlas.js"; // Mantém import
import { max, min } from "./essential.] Se o skybox deve ser exibido ou não.
	 */
	constructor(cont, textureAtlas,js"; // Mantém import

let THREE;
let StandaloneModelViewer;

export default class PreviewRenderer {
 geo, animations, showSkybox = true) {
		return (async () => {
			let loadingMessage	viewer;
	/**
	 * Cria um renderizador de pré-visualização para um arquivo de geometria completo = document.createElement("div");
			loadingMessage.classList.add("previewMessage");
			let p =.
	 * @param {HTMLElement} cont O contêiner onde a pré-visualização será inserida.
	 document.createElement("p");
			let span = document.createElement("span");
			// MODIFICADO: * @param {TextureAtlas} textureAtlas O atlas de texturas a ser usado.
	 * @param {Object} geo Chave de tradução para a mensagem de carregamento
			span.dataset.translate = "preview.loading";  O objeto de geometria do Minecraft.
	 * @param {Object} animations Conteúdo do arquivo `.animation.json`.
            // Fallback em português caso a tradução JS ainda não tenha ocorrido
            span.textContent = "
	 * @param {Boolean} [showSkybox] Se o skybox deve ser exibido ou não.
	 */Carregando pré-visualização..."; 
			p.appendChild(span);
			let loader = document.createElement
	constructor(cont, textureAtlas, geo, animations, showSkybox = true) {
		return (async () => {
			let loadingMessage = document.createElement("div");
			loadingMessage.classList.add("previewMessage("div");
			loader.classList.add("loader"); // Estilo do loader virá do CSS principal
			p.");
			let p = document.createElement("p");
			let span = document.createElement("span");
appendChild(loader);
			loadingMessage.appendChild(p);
			cont.appendChild(loadingMessage);
						// MODIFICADO: Chave de tradução para a mensagem de carregamento
			span.dataset.translate =
			THREE ??= await import("three"); 
			StandaloneModelViewer ??= (await import("@bridge-editor/model-viewer")).StandaloneModelViewer;
			
			let can = document.createElement("canvas");
			( "preview.loading"; 
			// Fallback em português caso a tradução falhe ou não seja aplicada anew MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if(mutation.attributeName == "style") {
						can.removeAttribute("style"); 
					}
				});
			 tempo
			span.textContent = "Carregando pré-visualização...";
			p.appendChild(span);
			let loader = document.createElement("div");
			loader.classList.add("loader");
			p})).observe(can, {
				attributes: true
			});
			let imageBlob = textureAtlas.imageBlo.appendChild(loader);
			loadingMessage.appendChild(p);
			cont.appendChild(loadingMessage);
bs.at(-1)[1]; // Usa a última imagem do atlas (geralmente a com opacidade padrão			
			THREE ??= await import("three"); 
			StandaloneModelViewer ??= (await import("@bridge-editor/)
			let imageUrl = URL.createObjectURL(imageBlob);
			this.viewer = new StandaloneModelViewer(model-viewer")).StandaloneModelViewer;
			
			let can = document.createElement("canvas");
			(can, geo, imageUrl, {
				width: min(window.innerWidth, window.innerHeight) * 0.new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if(mutation.attributeName == "style") {
						can.removeAttribute("style"); 
					}
				});
			8,
				height: min(window.innerWidth, window.innerHeight) * 0.8,
				antialias:})).observe(can, {
				attributes: true
			});
			let imageBlob = textureAtlas.imageBlo true,
				alpha: !showSkybox // Fundo transparente se não houver skybox
			});
			bs.at(-1)[1]; // Pega a última imagem do atlas (geralmente a com opacidade padrãothis.#addLighting();
			if(showSkybox) {
				await this.#addSkybox();
)
			let imageUrl = URL.createObjectURL(imageBlob);
			this.viewer = new StandaloneModelViewer(			} else {
				this.viewer.scene.background = null; // Garante fundo transparente
			}can, geo, imageUrl, {
				width: min(window.innerWidth, window.innerHeight) * 0.
			await this.viewer.loadedModel;
			URL.revokeObjectURL(imageUrl);
			this.viewer.positionCamera8,
				height: min(window.innerWidth, window.innerHeight) * 0.8,
				(1.7); // Ajusta a posição inicial da câmera
			this.viewer.camera.far = 500antialias: true,
				alpha: !showSkybox // Fundo transparente se não houver skybox
			});
0; // Aumenta o alcance de renderização da câmera
			this.viewer.camera.updateProjectionMatrix();			this.#addLighting();
			if(showSkybox) {
				await this.#addSkybox();
			this.viewer.requestRendering();
			loadingMessage.replaceWith(can); // Substitui a mensagem de carregamento
			} else {
				this.viewer.scene.background = null;
			}
			await this pelo canvas
			this.viewer.controls.minDistance = 10;
			this.viewer.controls.max.viewer.loadedModel;
			URL.revokeObjectURL(imageUrl);
			this.viewer.positionCamera(Distance = 1000;
			
			// Aplica a animação de spawn
			let animator = this1.7);
			this.viewer.camera.far = 5000;
			this..viewer.getModel().animator;
			let animation = animations["animations"]["animation.armor_stand.hviewer.camera.updateProjectionMatrix();
			this.viewer.requestRendering();
			loadingMessage.replaceWithologram.spawn"];
			if (animation && animation["bones"]) { // Verifica se a animação e os(can);
			this.viewer.controls.minDistance = 10;
			this.viewer.controls. ossos existem
				Object.values(animation["bones"]).forEach(bone => { // MODIFICADO: 'maxDistance = 1000;
			
			let animator = this.viewer.getModel().animatorforEach' em vez de 'map' se não estiver retornando novo array
					if (typeof bone === 'object;
			// A animação de spawn é referenciada aqui.
			// O objeto 'animations' passado' && bone !== null) {
						Object.values(bone).forEach(animationChannel => {
							if (typeof deve ter a estrutura correta.
			let spawnAnimation = animations["animations"]["animation.armor_stand.h animationChannel === 'object' && animationChannel !== null && Object.keys(animationChannel).length > 0)ologram.spawn"];
			if (spawnAnimation) {
				Object.values(spawnAnimation["bones"] ?? {} {
								animationChannel["Infinity"] = animationChannel[`${max(...Object.keys(animationChannel).map(Number).map(bone => Object.values(bone).forEach(animationChannel => {
					// Corrige um problema).filter(k => !isNaN(k)))}`];
							}
						});
					}
				});
				 onde o último keyframe pode não ser 'Infinity'
					const maxKeyframe = max(...Object.keys(animationChannel).animator.addAnimation("spawn", animation);
				animator.play("spawn");
			} else {
map(k => parseFloat(k)).filter(k => isFinite(k)));
					if (isFinite(maxKey				// MODIFICADO: Tradução
				console.warn("Animação de spawn ou seus ossos não definframe)) {
						animationChannel["Infinity"] = animationChannel[`${maxKeyframe}`];
					}
idos. Animação de spawn pulada na pré-visualização.");
			}
			
			return this				}));
				animator.addAnimation("spawn", spawnAnimation);
				animator.play("spawn");
;
		})();
	}
	#addLighting() {
		this.viewer.scene.children.			} else {
				// MODIFICADO: Tradução
				console.warn("Animação 'animation.armor_shift(); // Remove a luz ambiente padrão
		
		let directionalLight = new THREE.DirectionalLight(0stand.hologram.spawn' não encontrada para a pré-visualização.");
			}
			
			return thisxFFFFFF, 0.5);
		directionalLight.position.set(6, 16, 0);
;
		})();
	}
	#addLighting() {
		this.viewer.scene.children.		directionalLight.target.position.set(-6, 5, 5);
		this.viewer.shift(); // Remove a luz ambiente padrão do viewer
		
		let directionalLight = new THREE.DirectionalLight(scene.add(directionalLight);
		this.viewer.scene.add(directionalLight.target);
		0xFFFFFF, 0.5);
		directionalLight.position.set(6, 16,
		let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // Luz ambiente mais suave
		this.viewer.scene.add(ambientLight);
	}
	async #addSkybox() { 0);
		directionalLight.target.position.set(-6, 5, 5);
		
		let loader = new THREE.CubeTextureLoader();
		// MODIFICADO: Caminho para assets locaisthis.viewer.scene.add(directionalLight);
		this.viewer.scene.add(directionalLight.target);
		
		let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
		this.viewer.scene.add(ambientLight);
	}
	async #addSkybox, se você for hospedá-los.
		// Se estiver usando os links do HoloPrint original, manten() {
		let loader = new THREE.CubeTextureLoader();
		// ATENÇÃO: Se você mudar o skyha como estava.
		// Supondo que você tenha uma pasta 'assets/previewPanorama/' no seu projeto Holbox, atualize este caminho e os nomes dos arquivos.
		loader.setPath("assets/previewPanorama/"); 
		oLab.
		loader.setPath("assets/previewPanorama/"); 
		let cubemap = await loadertry {
			let cubemap = await loader.loadAsync([1, 3, 4, 5, 0, 2].map(x => `${x}.png`));
			this.viewer.scene.background =.loadAsync([1, 3, 4, 5, 0, 2].map(x => `${x cubemap;
		} catch (e) {
			// MODIFICADO: Tradução
			console.error}.png`));
		this.viewer.scene.background = cubemap;
	}
}