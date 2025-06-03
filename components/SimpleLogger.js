// Logger simples.
import { ceil, downloadBlob, getStackTrace, html } from "../essential.js"; // Mantém import de ../essential.js

export default class SimpleLogger extends HTMLElement {
	#originTime;
	
	node;
	allLogs = [];
	
	#errorCount;
	#warningCount;
	
	#errorCountNode;
	#warningCountNode;
	
	constructor() {
		super();
		this.attachShadow({
			mode: "open"
		});
	}
	connectedCallback() {
		this.shadowRoot.innerHTML = html`
			<style>
				#root {
					margin: 15px;
					display: block;
					color: white; /* Cor do texto do log */
					font-family: monospace;
					font-size: 14px;
					max-height: 300px;
					overflow: auto;
					text-align: left;
					position: relative;
					background: #333; /* Fundo um pouco mais escuro para o contêiner do log */
				}
				.logHeader {
					padding: 4px 12px; /* Aumentado padding */
					position: sticky;
					top: 0;
					height: 24px; /* Ajustado para padding */
					background: #556;
					z-index: 1; /* Para garantir que fique sobre os logs */
					display: flex; /* Para alinhar itens */
					align-items: center; /* Alinhar verticalmente */
				}
				.logHeader > span:first-child { /* "Logs" */
					font-weight: bold;
				}
				.logHeader .count { /* Contadores de erro/aviso */
					margin-left: 15px; /* Ajustado espaçamento */
				}
				#downloadLogsButton {
					background: #667; /* Cor de botão um pouco mais clara */
					border: 1px solid #889;
					border-radius: 5px; /* Raio de borda menor */
					color: white;
					margin-left: auto; /* Empurra para a direita */
					padding: 2px 8px; /* Ajustado padding */
					cursor: pointer;
					font: inherit;
					font-size: 0.9em; /* Tamanho de fonte menor */
				}
				#downloadLogsButton:hover {
					background: #778;
				}
				#downloadLogsButton:active {
					background: #556;
				}
				.log {
					margin: 0;
					padding: 3px 12px; /* Ajustado padding */
					background: #28282E; /* Fundo de entrada de log */
					overflow-wrap: break-word;
					border-bottom: 1px solid #444; /* Divisor sutil */
				}
				.log:nth-child(odd) { /* Alternar cor de fundo para melhor legibilidade */
					background: #2C2C33;
				}
				.warning > .logText::before {
					content: "⚠️ "; /* Adicionado espaço */
				}
				.error > .logText::before {
					content: "🚨 "; /* Adicionado espaço */
				}
				.info > .logText::before {
					content: "ℹ️ "; /* Adicionado espaço */
				}
				.timestamp {
					margin-right: 8px; /* Aumentado espaçamento */
					padding: 1px 4px; /* Ajustado padding */
					background: #4A4A52; /* Fundo do timestamp */
					color: #BBB; /* Cor do timestamp */
					border-radius: 3px;
					font-size: 0.9em;
				}
			</style>
			<div id="root">
				<!-- MODIFICADO: Textos traduzidos -->
				<div class="logHeader">
					<span>Logs</span>
					<span id="errorCount" class="count">🚨0</span>
					<span id="warningCount" class="count">⚠️0</span>
					<button type="button" id="downloadLogsButton">Baixar Logs</button>
				</div>
			</div>
		`;
		this.node = this.shadowRoot.selectEl("#root");
		this.node.selectEl("#downloadLogsButton").onEvent("click", () => {
			// MODIFICADO: Nome do arquivo de log
			downloadBlob(new Blob([JSON.stringify(this.allLogs)]), "hololab_logs.json");
		});
		this.#warningCountNode = this.node.selectEl("#warningCount");
		this.#errorCountNode = this.node.selectEl("#errorCount");
		
		this.#errorCount = 0;
		this.#warningCount = 0;
		
		this.#originTime = performance.now();
	}
	warn(text) {
		if(this.#genericLogWithClass(text, "warning")) {
			this.#warningCountNode.innerText = `⚠️${++this.#warningCount}`;
		}
	}
	error(text) {
		if(this.#genericLogWithClass(text, "error")) {
			this.#errorCountNode.innerText = `🚨${++this.#errorCount}`;
		}
	}
	info(text) {
		this.#genericLogWithClass(text, "info");
	}
	debug(text) {
		this.#genericLogWithClass(text, "debug");
	}
	setOriginTime(originTime) {
		this.#originTime = originTime;
	}
	#genericLogWithClass(text, logLevel) {
		let stackTrace = getStackTrace().slice(2); // Pega o stack trace, removendo as duas primeiras chamadas (esta função e a chamadora)
		this.allLogs.push({
			text,
			level: logLevel,
			stackTrace,
			time: performance.now() - this.#originTime
		});
		if(logLevel == "debug") {
			return; // Não exibe logs de debug na UI, apenas no console (se patchConsoleMethods for chamado)
		}
		// Evita exibir logs de scripts de terceiros (ex: extensões do navegador) na UI
		let currentURLOrigin = location.href.slice(0, location.href.lastIndexOf("/")); 
		if(stackTrace.some(loc => /https?:\/\//.test(loc) && !loc.includes(currentURLOrigin) && !loc.includes("<anonymous>"))) {
			return;
		}
		let el = document.createElement("p");
		el.classList.add("log");
		if(logLevel) {
			el.classList.add(logLevel);
		}
		let timestamp = this.#createTimestamp();
		el.appendChild(timestamp);
		let textSpan = document.createElement("span");
		textSpan.classList.add("logText");
		textSpan.innerText = text;
		el.appendChild(textSpan);
		// Verifica se o scroll está no final antes de adicionar novo log, para manter a posição se o usuário tiver rolado para cima
		let shouldScrollToBottom = ceil(this.node.scrollTop + this.node.getBoundingClientRect().height) >= this.node.scrollHeight;
		this.node.appendChild(el);
		if(shouldScrollToBottom) {
			this.node.scrollTop = this.node.scrollHeight; // Auto-scroll para o novo log
		}
		return true;
	}
	#createTimestamp() {
		let el = document.createElement("span");
		el.classList.add("timestamp");
		let d = new Date(performance.now() - this.#originTime);
		let text = `${d.getUTCMinutes().toString().padStart(2, "0")}:${d.getUTCSeconds().toString().padStart(2, "0")}.${d.getUTCMilliseconds().toString().padStart(3, "0")}`;
		if(d.getUTCHours() > 0) {
			text = `${d.getUTCHours().toString().padStart(2, "0")}:${text}`
		}
		el.innerText = text;
		return el;
	}
	
	// Modifica os métodos do console para também logar aqui
	patchConsoleMethods() {
		[console._warn, console._error, console._info, console._debug] = [console.warn, console.error, console.info, console.debug];
		console.warn = (...args) => {
			this.warn(args.join(" "));
			// A informação do local do log original é útil para depuração
			return console._warn.apply(console, [getStackTrace()[1].match(/\/([^\/]+\.[^\.]+:\d+:\d+)/)?.[1] + "\n", ...args]);
		};
		console.error = (...args) => {
			this.error(args.join(" "));
			return console._error.apply(console, [getStackTrace()[1].match(/\/([^\/]+\.[^\.]+:\d+:\d+)/)?.[1] + "\n", ...args]);
		};
		console.info = (...args) => {
			this.info(args.join(" "));
			return console._info.apply(console, [getStackTrace()[1].match(/\/([^\/]+\.[^\.]+:\d+:\d+)/)?.[1] + "\n", ...args]);
		};
		console.debug = (...args) => {
			this.debug(args.join(" "));
			return console._debug.apply(console, [getStackTrace()[1].match(/\/([^\/]+\.[^\.]+:\d+:\d+)/)?.[1] + "\n", ...args]);
		};
	}
}