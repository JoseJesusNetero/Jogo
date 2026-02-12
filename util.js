// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

const Utils = {
    // Número aleatório entre min e max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Distância entre dois pontos
    distancia(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // Delay com Promise
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Formatar tempo (ms -> mm:ss)
    formatarTempo(ms) {
        const segundos = Math.floor(ms / 1000);
        const minutos = Math.floor(segundos / 60);
        const segRestantes = segundos % 60;
        return `${minutos}:${segRestantes.toString().padStart(2, '0')}`;
    },
    
    // Gerar ID único
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Clampear valor entre min e max
    clamp(valor, min, max) {
        return Math.min(max, Math.max(min, valor));
    },
    
    // Interpolação linear
    lerp(inicio, fim, t) {
        return inicio * (1 - t) + fim * t;
    },
    
    // Detectar colisão círculo-retângulo
    colisaoCirculoRetangulo(cx, cy, raio, rx, ry, rw, rh) {
        const dx = Math.abs(cx - (rx + rw / 2));
        const dy = Math.abs(cy - (ry + rh / 2));
        
        if (dx > (rw / 2 + raio)) return false;
        if (dy > (rh / 2 + raio)) return false;
        
        if (dx <= (rw / 2)) return true;
        if (dy <= (rh / 2)) return true;
        
        const dist = Math.pow(dx - rw / 2, 2) + Math.pow(dy - rh / 2, 2);
        return dist <= Math.pow(raio, 2);
    },
    
    // Emitir evento customizado
    emitirEvento(nome, detalhes) {
        const evento = new CustomEvent(nome, { detail: detalhes });
        window.dispatchEvent(evento);
    },
    
    // Salvar no localStorage
    salvarDados(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    },
    
    // Carregar do localStorage
    carregarDados(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return null;
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
}