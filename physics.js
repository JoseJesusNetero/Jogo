// ==========================================
// SISTEMA DE FÍSICA - VENTO, GRAVIDADE, COLISÕES
// ==========================================

class SistemaFisica {
    constructor() {
        this.vento = {
            ativo: false,
            forcaX: 0,
            forcaY: 0,
            direcao: 0,
            intensidade: 0
        };
        
        this.plataformas = [];
        this.inicializarPlataformas();
    }
    
    // === MÉTODOS QUE MODIFICAM O ESTADO ===
    
    inicializarPlataformas() {
        // Criar plataformas em cada quadrante
        QUADRANTS.forEach((q, index) => {
            // 3 plataformas por quadrante
            for (let i = 0; i < 3; i++) {
                this.plataformas.push({
                    id: `${index}-${i}`,
                    x: q.x + 50 + Math.random() * (q.width - 100),
                    y: q.y + 200 + Math.random() * (q.height - 250),
                    width: 80,
                    height: 15,
                    quadrante: index,
                    estabilidade: 100 // 0-100, vento reduz
                });
            }
        });
    }
    
    gerarVento() {
        // Vento aleatório que afeta todos os quadrantes
        this.vento.ativo = Math.random() < 0.3; // 30% chance
        
        if (this.vento.ativo) {
            this.vento.direcao = Math.random() * Math.PI * 2;
            this.vento.intensidade = 1 + Math.random() * 3;
            this.vento.forcaX = Math.cos(this.vento.direcao) * this.vento.intensidade;
            this.vento.forcaY = Math.sin(this.vento.direcao) * this.vento.intensidade;
            
            // Seleciona quadrantes afetados (2 ou 3)
            QUADRANTS.forEach((q, index) => {
                q.afetadoPeloVento = Math.random() < 0.7;
            });
        } else {
            QUADRANTS.forEach(q => q.afetadoPeloVento = false);
        }
        
        return this.vento;
    }
    
    aplicarVentoEmPlataformas() {
        if (!this.vento.ativo) return;
        
        this.plataformas.forEach(plataforma => {
            if (QUADRANTS[plataforma.quadrante].afetadoPeloVento) {
                // Vento reduz estabilidade das plataformas
                plataforma.estabilidade = Math.max(0, 
                    plataforma.estabilidade - this.vento.intensidade * 0.5
                );
                
                // Plataforma instável balança
                if (plataforma.estabilidade < 30) {
                    plataforma.offsetX = Math.sin(Date.now() / 100) * 5;
                }
            } else {
                // Recupera estabilidade
                plataforma.estabilidade = Math.min(100, 
                    plataforma.estabilidade + 0.2
                );
            }
        });
    }
    
    verificarColisoes(jogador, plataformas) {
        jogador.noChao = false;
        
        plataformas.forEach(plataforma => {
            // Verifica se jogador está sobre plataforma
            if (this.colisaoRetangulo(
                jogador.x, jogador.y, jogador.size, jogador.size,
                plataforma.x, plataforma.y, plataforma.width, plataforma.height
            )) {
                // Jogador em cima da plataforma
                if (jogador.vy >= 0 && jogador.y + jogador.size <= plataforma.y + 20) {
                    jogador.y = plataforma.y - jogador.size;
                    jogador.vy = 0;
                    jogador.noChao = true;
                    
                    // Aplicar balanço da plataforma
                    if (plataforma.offsetX) {
                        jogador.x += plataforma.offsetX * 0.5;
                    }
                }
            }
        });
        
        return jogador;
    }
    
    colisaoRetangulo(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (x1 < x2 + w2 &&
                x1 + w1 > x2 &&
                y1 < y2 + h2 &&
                y1 + h1 > y2);
    }
    
    // Vento pode derrubar jogadores da plataforma
    verificarQueda(jogador) {
        if (this.vento.ativo && 
            QUADRANTS[jogador.quadrante].afetadoPeloVento &&
            !jogador.noChao) {
            
            // Chance de cair
            const chanceQueda = this.vento.intensidade * 0.1;
            
            if (Math.random() < chanceQueda) {
                jogador.vy += 5; // Empurra para baixo
                return true; // Caiu
            }
        }
        
        return false;
    }
    
    reset() {
        this.plataformas = [];
        this.inicializarPlataformas();
        this.vento = {
            ativo: false,
            forcaX: 0,
            forcaY: 0,
            direcao: 0,
            intensidade: 0
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SistemaFisica };
}