// ==========================================
// RENDERIZADOR - DESENHA TUDO NO CANVAS
// ==========================================

class Renderizador {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = CONFIG.CANVAS_WIDTH;
        this.height = CONFIG.CANVAS_HEIGHT;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Animações
        this.frame = 0;
    }
    
    limpar() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    desenharQuadrantes() {
        // Desenha divisórias dos quadrantes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        // Linha vertical central
        this.ctx.beginPath();
        this.ctx.moveTo(500, 0);
        this.ctx.lineTo(500, 800);
        this.ctx.stroke();
        
        // Linha horizontal central
        this.ctx.beginPath();
        this.ctx.moveTo(0, 400);
        this.ctx.lineTo(1000, 400);
        this.ctx.stroke();
        
        // Números dos quadrantes
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillText('Q1', 200, 150);
        this.ctx.fillText('Q2', 700, 150);
        this.ctx.fillText('Q3', 200, 550);
        this.ctx.fillText('Q4', 700, 550);
    }
    
    desenharPlataformas(plataformas) {
        plataformas.forEach(p => {
            // Cor baseada na estabilidade
            const estabilidade = p.estabilidade / 100;
            const vermelho = Math.floor(255 * (1 - estabilidade));
            const verde = Math.floor(255 * estabilidade);
            
            this.ctx.fillStyle = `rgb(${vermelho}, ${verde}, 0)`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            
            // Aplicar offsetX do vento
            const x = p.x + (p.offsetX || 0);
            
            this.ctx.fillRect(x, p.y, p.width, p.height);
            
            // Borda
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, p.y, p.width, p.height);
            
            // Sombra de instabilidade
            if (p.estabilidade < 30) {
                this.ctx.fillStyle = 'rgba(255,0,0,0.2)';
                this.ctx.fillRect(x, p.y - 2, p.width, 2);
            }
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    desenharJogador(jogador) {
        const ctx = this.ctx;
        
        // Sombra
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        
        // Corpo do jogador
        ctx.fillStyle = jogador.cor;
        ctx.beginPath();
        ctx.arc(jogador.x, jogador.y, jogador.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Vida
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(jogador.x - 20, jogador.y - 35, 40, 6);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(jogador.x - 20, jogador.y - 35, 40 * (jogador.vida / 100), 6);
        
        // Nome
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(jogador.nome, jogador.x, jogador.y - 45);
        
        // Ícone de proteção ativa
        if (jogador.protecaoAtiva) {
            ctx.font = '20px Arial';
            ctx.fillStyle = jogador.protecaoAtiva.color;
            ctx.fillText('🛡️', jogador.x - 15, jogador.y - 70);
        }
        
        // Efeitos de texto
        if (jogador.ultimoEfeito && jogador.ultimoEfeito.tempo > 0) {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = jogador.ultimoEfeito.cor;
            ctx.textAlign = 'center';
            ctx.fillText(
                jogador.ultimoEfeito.texto,
                jogador.ultimoEfeito.x,
                jogador.ultimoEfeito.y - jogador.ultimoEfeito.tempo / 5
            );
            jogador.ultimoEfeito.tempo--;
        }
    }
    
    desenharDesastre(desastre) {
        const ctx = this.ctx;
        
        // Desenha efeito em cada quadrante afetado
        desastre.quadrantesAfetados.forEach(index => {
            const q = QUADRANTS[index];
            
            // Gradiente de perigo
            const gradient = ctx.createRadialGradient(
                q.x + q.width / 2, q.y + q.height / 2, 0,
                q.x + q.width / 2, q.y + q.height / 2, 300
            );
            gradient.addColorStop(0, desastre.cor + '80');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(q.x, q.y, q.width, q.height);
            
            // Ícone do desastre
            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let icone = '🌋';
            if (desastre.tipo === 'CHUVA') icone = '🌧️';
            if (desastre.tipo === 'VENTO') icone = '💨';
            if (desastre.tipo === 'TERREMOTO') icone = '🌍';
            if (desastre.tipo === 'INCENDIO') icone = '🔥';
            
            ctx.fillText(icone, q.x + q.width / 2, q.y + q.height / 2);
            
            // Ondas de propagação
            ctx.strokeStyle = desastre.cor + '80';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                q.x + q.width / 2,
                q.y + q.height / 2,
                desastre.raio + Math.sin(this.frame / 10) * 10,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        });
        
        this.frame++;
    }
    
    desenharItens(itens) {
        itens.forEach(item => {
            if (!item.ativo || item.coletado) return;
            
            const ctx = this.ctx;
            
            // Brilho
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.cor;
            
            // Ícone
            ctx.font = '30px Arial';
            ctx.fillStyle = item.cor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.nome.split(' ')[0], item.x, item.y + Math.sin(Date.now() / 200) * 5);
            
            ctx.shadowBlur = 0;
            
            // Tempo de vida
            ctx.font = '10px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(`${Math.ceil(item.tempoVida / 1000)}s`, item.x, item.y + 30);
        });
    }
    
    desenharVento(vento) {
        if (!vento.ativo) return;
        
        const ctx = this.ctx;
        
        // Desenha linhas de vento
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + vento.forcaX * 30,
                y + vento.forcaY * 30
            );
            ctx.stroke();
        }
        
        // Direção do vento
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'left';
        ctx.fillText(`💨 Vento: ${Math.round(vento.intensidade * 10)} km/h`, 20, 100);
    }
    
    desenharGameOver() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Clique em RESET para jogar novamente', this.width / 2, this.height / 2 + 50);
    }
    
    desenharPause() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSADO', this.width / 2, this.height / 2);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderizador };
}