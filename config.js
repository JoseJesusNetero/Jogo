// ==========================================
// CONFIGURAÇÕES GLOBAIS DO JOGO
// ==========================================

const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1000,
    CANVAS_HEIGHT: 800,
    QUADRANT_SIZE: 500, // Cada quadrante 500x400
    
    // Jogadores
    PLAYER_SPEED: 5,
    PLAYER_SIZE: 30,
    PLAYER_INITIAL_SCORE: 0,
    
    // Cores dos quadrantes
    QUADRANT_COLORS: [
        'rgba(66, 153, 225, 0.1)', // Azul - J1
        'rgba(245, 101, 101, 0.1)', // Vermelho - J2
        'rgba(72, 187, 120, 0.1)',  // Verde - J3
        'rgba(236, 201, 75, 0.1)'   // Amarelo - J4
    ],
    
    // Eventos de desastre
    DISASTERS: {
        VULCAO: {
            name: '🌋 ERUPÇÃO VULCÂNICA',
            duration: 8000, // 8 segundos
            damage: 2,
            speed: 2.5,
            color: '#ff4444',
            alert: '🌋 LAVA DESCENDO! PROTEJA-SE!'
        },
        CHUVA: {
            name: '🌧️ CHUVA FORTE',
            duration: 10000,
            damage: 1,
            speed: 1.5,
            color: '#3498db',
            alert: '🌧️ CHUVA INTENSA! USE GUARDA-CHUVA!'
        },
        VENTO: {
            name: '💨 VENTANIA',
            duration: 7000,
            damage: 1.5,
            speed: 3,
            color: '#95a5a6',
            alert: '💨 VENTO FORTE! SEGURE-SE!'
        },
        TERREMOTO: {
            name: '🌍 TERREMOTO',
            duration: 5000,
            damage: 3,
            speed: 0,
            color: '#8e44ad',
            alert: '🌍 TERREMOTO! PLATAFORMAS INSTÁVEIS!'
        },
        INCENDIO: {
            name: '🔥 INCÊNDIO',
            duration: 9000,
            damage: 2,
            speed: 2,
            color: '#e67e22',
            alert: '🔥 FOGO! USE EXTINTOR!'
        }
    },
    
    // Itens defensivos
    ITEMS: {
        GUARDA_CHUVA: {
            name: '☔ Guarda-Chuva',
            protection: 'CHUVA',
            duration: 5000,
            color: '#3498db'
        },
        ESCUDO: {
            name: '🛡️ Escudo',
            protection: 'VULCAO',
            duration: 4000,
            color: '#e74c3c'
        },
        ANCORA: {
            name: '⚓ Âncora',
            protection: 'VENTO',
            duration: 6000,
            color: '#7f8c8d'
        },
        EXTINTOR: {
            name: '🧯 Extintor',
            protection: 'INCENDIO',
            duration: 5000,
            color: '#e67e22'
        },
        CAPACETE: {
            name: '⛑️ Capacete',
            protection: 'TERREMOTO',
            duration: 4000,
            color: '#f39c12'
        }
    },
    
    // Sistema de pontos
    SCORE: {
        SOBREVIVER: 10,
        PROTEGER_OUTRO: 25,
        COLETAR_ITEM: 5,
        RESGATE: 50
    },
    
    // Física
    GRAVITY: 0.5,
    WIND_FORCE: 2,
    FRICTION: 0.98
};

// Estados do jogo
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Quadrantes (0-3)
const QUADRANTS = [
    { x: 0, y: 0, width: 500, height: 400 },      // Q1: Azul
    { x: 500, y: 0, width: 500, height: 400 },    // Q2: Vermelho
    { x: 0, y: 400, width: 500, height: 400 },    // Q3: Verde
    { x: 500, y: 400, width: 500, height: 400 }   // Q4: Amarelo
];

// Export (se usar módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, GAME_STATE, QUADRANTS };
}