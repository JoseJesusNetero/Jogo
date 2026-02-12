// ==========================================
// GERENCIADOR DE EVENTOS - TECLADO E MOUSE
// ==========================================

class GerenciadorEventos {
    constructor() {
        // Estados das teclas
        this.teclasPressionadas = {};
        
        // Controles dos jogadores
        this.controles = {
            0: { // Jogador 1 - WASD
                cima: 'KeyW',
                baixo: 'KeyS',
                esquerda: 'KeyA',
                direita: 'KeyD',
                usar: 'KeyQ'
            },
            1: { // Jogador 2 - Setas
                cima: 'ArrowUp',
                baixo: 'ArrowDown',
                esquerda: 'ArrowLeft',
                direita: 'ArrowRight',
                usar: 'ShiftRight'
            },
            2: { // Jogador 3 - IJKL
                cima: 'KeyI',
                baixo: 'KeyK',
                esquerda: 'KeyJ',
                direita: 'KeyL',
                usar: 'KeyU'
            },
            3: { // Jogador 4 - TFGH
                cima: 'KeyT',
                baixo: 'KeyG',
                esquerda: 'KeyF',
                direita: 'KeyH',
                usar: 'KeyY'
            }
        };
        
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('blur', () => this.teclasPressionadas = {});
    }
    
    onKeyDown(e) {
        this.teclasPressionadas[e.code] = true;
        
        // Prevenir scroll da página
        if (e.code.startsWith('Arrow') || 
            ['KeyW','KeyA','KeyS','KeyD','KeyI','KeyJ','KeyK','KeyL','KeyT','KeyF','KeyG','KeyH'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    onKeyUp(e) {
        this.teclasPressionadas[e.code] = false;
    }
    
    getDirecoesJogador(jogadorId) {
        const controles = this.controles[jogadorId];
        if (!controles) return null;
        
        return {
            cima: this.teclasPressionadas[controles.cima] || false,
            baixo: this.teclasPressionadas[controles.baixo] || false,
            esquerda: this.teclasPressionadas[controles.esquerda] || false,
            direita: this.teclasPressionadas[controles.direita] || false,
            usar: this.teclasPressionadas[controles.usar] || false
        };
    }
    
    // Verifica se alguma tecla foi pressionada para debug
    getTeclaPressionada(code) {
        return this.teclasPressionadas[code] || false;
    }
    
    reset() {
        this.teclasPressionadas = {};
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GerenciadorEventos };
}