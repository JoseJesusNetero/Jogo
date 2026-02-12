// ==========================================
// JOGO PRINCIPAL - INTEGRA TODOS OS MÓDULOS
// ==========================================

class Jogo {
    constructor() {
        this.state = GAME_STATE.MENU;
        
        // Inicializar sistemas
        this.eventos = new GerenciadorEventos();
        this.fisica = new SistemaFisica();
        this.renderizador = new Renderizador('gameCanvas');
        
        // Arrays do jogo
        this.jogadores = [];
        this.desastresAtivos = [];
        this.itensAtivos = [];
        
        // Timers
        this.ultimoDesastre = 0;
        this.intervaloDesastre = 8000; // 8 segundos
        this.ultimoItem = 0;
        this.intervaloItem = 5000; // 5 segundos
        
        // UI
        this.alertas = [];
        this.tempoJogo = 0;
        
        // Bind dos métodos
        this.gameLoop = this.gameLoop.bind(this);
        this.iniciar = this.iniciar.bind(this);
    }
    
    // === MÉTODOS DE INICIALIZAÇÃO ===
    
    iniciar() {
        this.state = GAME_STATE.PLAYING;
        this.tempoJogo = 0;
        
        // Criar jogadores
        this.criarJogadores();
        
        // Resetar sistemas
        this.fisica.reset();
        this.desastresAtivos = [];
        this.itensAtivos = [];
        this.alertas = [];
        
        // Iniciar loop
        requestAnimationFrame(this.gameLoop);
        
        this.adicionarAlerta('🎮 JOGO INICIADO! Sobreviva aos desastres!', 'success');
    }
    
    criarJogadores() {
        const cores = ['#4299e1', '#f56565', '#48bb78', '#ecc94b'];
        const nomes = ['GUERREIRO', 'PALADINO', 'ARQUEIRO', 'MAGO'];
        
        this.jogadores = QUADRANTS.map((q, index) => {
            return new Jogador(
                index,
                nomes[index],
                cores[index],
                null,
                q
            );
        });
    }
    
    pausar() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.adicionarAlerta('⏸️ JOGO PAUSADO', 'warning');
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.adicionarAlerta('▶️ JOGO CONTINUADO', 'success');
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    reset() {
        this.state = GAME_STATE.MENU;
        this.iniciar();
    }
    
    // === LOOP PRINCIPAL ===
    
    gameLoop() {
        if (this.state === GAME_STATE.PLAYING) {
            this.atualizar();
            this.renderizar();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    atualizar() {
        this.tempoJogo += 16;
        
        // Atualizar jogadores
        this.atualizarJogadores();
        
        // Atualizar física
        this.atualizarFisica();
        
        // Atualizar desastres
        this.atualizarDesastres();
        
        // Atualizar itens
        this.atualizarItens();
        
        // Gerar eventos
        this.gerarEventos();
        
        // Verificar condições de vitória/derrota
        this.verificarGameOver();
        
        // Atualizar UI
        this.atualizarUI();
    }
    
    atualizarJogadores() {
        this.jogadores.forEach(jogador => {
            // Mover jogador
            const direcoes = this.eventos.getDirecoesJogador(jogador.id);
            if (direcoes) {
                jogador.mover(direcoes);
            }
            
            // Aplicar física
            jogador.aplicarFisica(this.fisica.vento);
            
            // Verificar colisões com plataformas
            this.fisica.verificarColisoes(jogador, this.fisica.plataformas);
            
            // Verificar queda por vento
            this.fisica.verificarQueda(jogador);
            
            // Atualizar proteção
            jogador.atualizarProtecao();
            
            // Verificar dano de desastres
            this.aplicarDanoDesastres(jogador);
            
            // Verificar coleta de itens
            this.verificarColetaItens(jogador);
        });
    }
    
    atualizarFisica() {
        // Gerar vento aleatório
        if (Math.random() < 0.01) { // 1% chance por frame
            this.fisica.gerarVento();
            
            if (this.fisica.vento.ativo) {
                this.adicionarAlerta(
                    `💨 VENTANIA! Intensidade: ${Math.round(this.fisica.vento.intensidade * 10)}km/h`,
                    'warning'
                );
            }
        }
        
        // Aplicar vento nas plataformas
        this.fisica.aplicarVentoEmPlataformas();
    }
    
    atualizarDesastres() {
        // Atualizar desastres existentes
        this.desastresAtivos = this.desastresAtivos.filter(desastre => {
            desastre.atualizar();
            
            // Verificar dano contínuo
            this.jogadores.forEach(jogador => {
                if (desastre.afetaJogador(jogador)) {
                    // Chance de usar item
                    if (Math.random() < 0.1) { // 10% chance
                        jogador.usarItem(desastre.tipo);
                    }
                }
            });
            
            return desastre.ativo;
        });
    }
    
    atualizarItens() {
        // Atualizar itens existentes
        this.itensAtivos = this.itensAtivos.filter(item => {
            item.atualizar();
            return item.ativo;
        });
    }
    
    gerarEventos() {
        // Gerar novo desastre
        if (this.tempoJogo - this.ultimoDesastre > this.intervaloDesastre) {
            this.gerarDesastre();
            this.ultimoDesastre = this.tempoJogo;
            this.intervaloDesastre = Utils.random(6000, 12000);
        }
        
        // Gerar novo item
        if (this.tempoJogo - this.ultimoItem > this.intervaloItem) {
            this.gerarItem();
            this.ultimoItem = this.tempoJogo;
            this.intervaloItem = Utils.random(4000, 8000);
        }
    }
    
    gerarDesastre() {
        const tipos = Object.keys(CONFIG.DISASTERS);
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const quadranteOrigem = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];
        
        const desastre = new Desastre(tipo, quadranteOrigem);
        this.desastresAtivos.push(desastre);
        
        // Alerta
        this.adicionarAlerta(
            `⚠️ ${desastre.config.alert} (Quadrante ${QUADRANTS.indexOf(quadranteOrigem) + 1})`,
            'danger'
        );
        
        // Atualizar overlay
        this.atualizarOverlayEvento(desastre);
    }
    
    gerarItem() {
        const tipos = Object.keys(CONFIG.ITEMS);
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const quadrante = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];
        
        const item = new Item(tipo, quadrante);
        this.itensAtivos.push(item);
    }
    
    aplicarDanoDesastres(jogador) {
        this.desastresAtivos.forEach(desastre => {
            if (desastre.afetaJogador(jogador)) {
                // Aplica dano se não estiver protegido
                jogador.receberDano(desastre.dano * 0.1, desastre.tipo);
            }
        });
    }
    
    verificarColetaItens(jogador) {
        this.itensAtivos.forEach(item => {
            if (!item.coletado && item.ativo) {
                const dist = Utils.distancia(jogador.x, jogador.y, item.x, item.y);
                
                if (dist < 40) { // Distância de coleta
                    item.coletar(jogador);
                    this.adicionarAlerta(
                        `🎁 ${jogador.nome} coletou ${item.nome}!`,
                        'success'
                    );
                }
            }
        });
    }
    
    verificarGameOver() {
        const jogadoresVivos = this.jogadores.filter(j => j.vida > 0);
        
        if (jogadoresVivos.length === 0) {
            this.state = GAME_STATE.GAME_OVER;
            this.adicionarAlerta('💀 GAME OVER - Todos os jogadores morreram!', 'danger');
        }
    }
    
    // === MÉTODOS DE RENDERIZAÇÃO ===
    
    renderizar() {
        const r = this.renderizador;
        r.limpar();
        
        // Desenhar quadrantes
        r.desenharQuadrantes();
        
        // Desenhar plataformas
        r.desenharPlataformas(this.fisica.plataformas);
        
        // Desenhar itens
        r.desenharItens(this.itensAtivos);
        
        // Desenhar jogadores
        this.jogadores.forEach(j => r.desenharJogador(j));
        
        // Desenhar desastres
        this.desastresAtivos.forEach(d => r.desenharDesastre(d));
        
        // Desenhar vento
        r.desenharVento(this.fisica.vento);
        
        // Desenhar estado
        if (this.state === GAME_STATE.GAME_OVER) {
            r.desenharGameOver();
        } else if (this.state === GAME_STATE.PAUSED) {
            r.desenharPause();
        }
    }
    
    // === MÉTODOS DE UI ===
    
    atualizarUI() {
        // Atualizar scores
        this.jogadores.forEach((jogador, index) => {
            const scoreEl = document.getElementById(`score${index + 1}`);
            if (scoreEl) {
                scoreEl.textContent = jogador.score;
            }
            
            // Atualizar itens
            const itemsEl = document.getElementById(`items${index + 1}`);
            if (itemsEl) {
                itemsEl.innerHTML = jogador.itens.map(item => 
                    `<span class="item-badge" style="background: ${item.color}40">
                        ${item.nome}
                    </span>`
                ).join('');
            }
        });
    }
    
    atualizarOverlayEvento(desastre) {
        const overlay = document.getElementById('currentEvent');
        const timer = document.getElementById('eventTimer');
        
        if (overlay) {
            overlay.textContent = desastre.nome;
            overlay.style.borderColor = desastre.cor;
        }
        
        // Atualizar timer
        if (timer) {
            timer.textContent = `${Math.ceil(desastre.tempoRestante / 1000)}s`;
        }
    }
    
    adicionarAlerta(mensagem, tipo = 'warning') {
        const container = document.getElementById('alertContainer');
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.className = `alert ${tipo === 'success' ? 'success' : ''}`;
        alert.innerHTML = `
            <span>${mensagem}</span>
            <span style="margin-left: auto; opacity: 0.7;">${Utils.formatarTempo(this.tempoJogo)}</span>
        `;
        
        container.appendChild(alert);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        this.alertas.push(alert);
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    window.jogo = new Jogo();
    
    // Botões
    document.getElementById('startGameBtn').addEventListener('click', () => {
        window.jogo.iniciar();
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        window.jogo.pausar();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        window.jogo.reset();
    });
});