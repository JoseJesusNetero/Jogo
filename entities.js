// ==========================================
// CLASSE JOGADOR - USA THIS PARA SE MODIFICAR
// ==========================================
class Jogador {
    constructor(id, nome, cor, teclas, quadrante) {
        this.id = id;
        this.nome = nome;
        this.cor = cor;
        this.teclas = teclas;
        
        // Posição inicial no centro do quadrante
        this.x = quadrante.x + quadrante.width / 2;
        this.y = quadrante.y + quadrante.height / 2;
        this.quadrante = quadrante;
        
        // Status
        this.vida = 100;
        this.score = 0;
        this.itens = [];
        this.protecaoAtiva = null;
        this.tempoProtecao = 0;
        
        // Física
        this.vx = 0;
        this.vy = 0;
        this.noChao = true;
        this.size = CONFIG.PLAYER_SIZE;
        
        // Estatísticas
        this.desastresSobrevividos = 0;
        this.resgatesRealizados = 0;
    }
    
    // === MÉTODOS QUE MODIFICAM O PRÓPRIO OBJETO (USAM THIS) ===
    
    mover(direcoes) {
        // Modifica a posição baseado nas teclas pressionadas
        if (direcoes.cima) this.y -= CONFIG.PLAYER_SPEED;
        if (direcoes.baixo) this.y += CONFIG.PLAYER_SPEED;
        if (direcoes.esquerda) this.x -= CONFIG.PLAYER_SPEED;
        if (direcoes.direita) this.x += CONFIG.PLAYER_SPEED;
        
        // Limitar ao quadrante
        this.x = Math.max(this.quadrante.x, Math.min(this.quadrante.x + this.quadrante.width - this.size, this.x));
        this.y = Math.max(this.quadrante.y, Math.min(this.quadrante.y + this.quadrante.height - this.size, this.y));
        
        return this;
    }
    
    aplicarFisica(vento) {
        // Aplica vento e gravidade
        this.vx *= CONFIG.FRICTION;
        this.vy *= CONFIG.FRICTION;
        
        if (vento.ativo && this.quadrante.afetadoPeloVento) {
            this.vx += vento.forcaX * (this.temItem('ANCORA') ? 0.3 : 1);
            this.vy += vento.forcaY * (this.temItem('ANCORA') ? 0.3 : 1);
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        return this;
    }
    
    receberDano(quantidade, tipo) {
        // Verifica proteção
        if (this.estaProtegidoContra(tipo)) {
            quantidade /= 2;
            this.criarEfeito('🛡️', '#3498db');
        }
        
        this.vida = Math.max(0, this.vida - quantidade);
        
        if (this.vida <= 0) {
            this.morrer();
        }
        
        return this;
    }
    
    curar(quantidade) {
        this.vida = Math.min(100, this.vida + quantidade);
        this.criarEfeito('❤️', '#4ade80');
        return this;
    }
    
    adicionarItem(item) {
        this.itens.push(item);
        this.score += CONFIG.SCORE.COLETAR_ITEM;
        this.criarEfeito(`+${item.nome}`, item.color);
        return this;
    }
    
    usarItem(tipoDesastre) {
        // Procura item que protege contra este desastre
        const itemIndex = this.itens.findIndex(item => 
            item.protection === tipoDesastre
        );
        
        if (itemIndex !== -1) {
            const item = this.itens[itemIndex];
            this.itens.splice(itemIndex, 1);
            this.protecaoAtiva = item;
            this.tempoProtecao = item.duration;
            this.criarEfeito(`🛡️ ${item.name}`, item.color);
            return true;
        }
        
        return false;
    }
    
    atualizarProtecao() {
        if (this.tempoProtecao > 0) {
            this.tempoProtecao -= 16; // ~60 FPS
            if (this.tempoProtecao <= 0) {
                this.protecaoAtiva = null;
            }
        }
        return this;
    }
    
    estaProtegidoContra(tipo) {
        return this.protecaoAtiva && this.protecaoAtiva.protection === tipo;
    }
    
    temItem(nome) {
        return this.itens.some(item => item.name.includes(nome));
    }
    
    morrer() {
        this.vida = 0;
        this.score = Math.max(0, this.score - 50);
        this.criarEfeito('💀', '#ff4444');
        
        // Resetar posição
        this.x = this.quadrante.x + this.quadrante.width / 2;
        this.y = this.quadrante.y + this.quadrante.height / 2;
        
        // Resetar itens
        this.itens = [];
        this.protecaoAtiva = null;
        this.tempoProtecao = 0;
        
        return this;
    }
    
    criarEfeito(texto, cor) {
        // Efeito visual de texto flutuante
        this.ultimoEfeito = {
            texto,
            cor,
            tempo: 60, // 1 segundo
            x: this.x,
            y: this.y - 30
        };
    }
    
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            cor: this.cor,
            vida: this.vida,
            score: this.score,
            x: this.x,
            y: this.y
        };
    }
}

// ==========================================
// CLASSE DESASTRE - OBJETO DINÂMICO
// ==========================================
class Desastre {
    constructor(tipo, quadranteOrigem) {
        this.tipo = tipo;
        this.config = CONFIG.DISASTERS[tipo];
        this.nome = this.config.name;
        this.dano = this.config.damage;
        this.velocidade = this.config.speed;
        this.cor = this.config.color;
        
        // Propagação entre quadrantes
        this.origem = quadranteOrigem;
        this.quadrantesAfetados = [quadranteOrigem];
        this.tempoParaProximoQuadrante = 2000; // 2 segundos
        this.tempoAtual = 0;
        
        // Posição visual
        this.x = quadranteOrigem.x + quadranteOrigem.width / 2;
        this.y = quadranteOrigem.y + quadranteOrigem.height / 2;
        this.raio = 20;
        
        // Duração
        this.duracao = this.config.duration;
        this.tempoRestante = this.duracao;
        this.ativo = true;
    }
    
    // === MÉTODOS QUE MODIFICAM O PRÓPRIO DESASTRE ===
    
    atualizar() {
        this.tempoRestante -= 16;
        this.tempoAtual += 16;
        
        // Expandir para próximo quadrante
        if (this.tempoAtual >= this.tempoParaProximoQuadrante) {
            this.tempoAtual = 0;
            this.propagar();
        }
        
        // Animação
        this.raio = 20 + Math.sin(Date.now() / 200) * 5;
        
        if (this.tempoRestante <= 0) {
            this.ativo = false;
        }
        
        return this;
    }
    
    propagar() {
        // 0: Q1, 1: Q2, 2: Q3, 3: Q4
        const indexOrigem = QUADRANTS.indexOf(this.origem);
        
        // Propagar para quadrantes vizinhos
        const vizinhos = this.getVizinhos(indexOrigem);
        
        vizinhos.forEach(vizinho => {
            if (!this.quadrantesAfetados.includes(vizinho)) {
                this.quadrantesAfetados.push(vizinho);
                
                // Evento de propagação
                if (window.game) {
                    window.game.adicionarAlerta(
                        `🌊 ${this.nome} se espalhou para o Quadrante ${vizinho + 1}!`,
                        'warning'
                    );
                }
            }
        });
        
        return this;
    }
    
    getVizinhos(index) {
        // Retorna quadrantes vizinhos
        const vizinhos = [];
        
        switch(index) {
            case 0: // Q1: vizinhos Q2 e Q3
                vizinhos.push(1, 2);
                break;
            case 1: // Q2: vizinhos Q0 e Q3
                vizinhos.push(0, 3);
                break;
            case 2: // Q3: vizinhos Q0 e Q1
                vizinhos.push(0, 1);
                break;
            case 3: // Q4: vizinhos Q1 e Q2
                vizinhos.push(1, 2);
                break;
        }
        
        return vizinhos;
    }
    
    afetaJogador(jogador) {
        // Verifica se jogador está em quadrante afetado
        const quadranteJogador = this.getQuadrantePorPosicao(jogador.x, jogador.y);
        return this.quadrantesAfetados.includes(quadranteJogador);
    }
    
    getQuadrantePorPosicao(x, y) {
        for (let i = 0; i < QUADRANTS.length; i++) {
            const q = QUADRANTS[i];
            if (x >= q.x && x <= q.x + q.width &&
                y >= q.y && y <= q.y + q.height) {
                return i;
            }
        }
        return -1;
    }
}

// ==========================================
// CLASSE ITEM - COLETÁVEL
// ==========================================
class Item {
    constructor(tipo, quadrante) {
        this.tipo = tipo;
        this.config = CONFIG.ITEMS[tipo];
        this.nome = this.config.name;
        this.cor = this.config.color;
        
        // Posição aleatória no quadrante
        this.x = quadrante.x + 50 + Math.random() * (quadrante.width - 100);
        this.y = quadrante.y + 50 + Math.random() * (quadrante.height - 100);
        
        this.coletado = false;
        this.tempoVida = 15000; // 15 segundos
        this.ativo = true;
    }
    
    atualizar() {
        this.tempoVida -= 16;
        if (this.tempoVida <= 0) {
            this.ativo = false;
        }
        return this;
    }
    
    coletar(jogador) {
        this.coletado = true;
        this.ativo = false;
        jogador.adicionarItem(this);
        return this;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Jogador, Desastre, Item };
}