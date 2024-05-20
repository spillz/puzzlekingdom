//@ts-check

import  {App, Widget, ImageWidget, WidgetAnimation, Label, BoxLayout, Vec2, math, rand} from '../eskv/lib/eskv.js'; //Import ESKV objects into an eskv namespace
import { colorString } from '../eskv/lib/modules/math.js';
import { getRandomInt } from '../eskv/lib/modules/random.js';

rand.setPRNG('jsf32');
rand.setSeed(Date.now());

/*
New gameplay idea (potentially replaces the current complicated and somewhat boring adjacency scoring fest)
Game played in 5-10 rounds depending on level. Each round:
1. Start of round phase: Draw an event and show to player. It resolves at round end
2. Building phase: Draw 5 building tiles face up. Play the 5 tiles to build the buildings on the terrain. 
3. Activation phase: Spend coin (Tradeship), spend force (stronghold), govern (castle), forest clearing (farm), training (abbey)
4. Resolve event phase
Player is evaluated against end game objectives, which vary by mission

Resources:
Food: Need one food for every worker.
Workers: Each building uses a certain number of workers. Surplus workers become military if a stronghold is present.
Force: Number of surplus workers
Coin: Used to supply food and workers, and end game points.

No activations when there are food or worker shortages? Or just force spending of money, including dipping into negative balance

Building functions:
Farm: place on pasture/forest; provides 1 food/level for its space and each empty adjacent pasture space.
Village: place on pasture/mountain/forest; provides 1 worker for each adjacent building except other villages, which reduce worker production by 1.
Mine: provides 1 coin for it's space and each adjacent mountain space.
Stronghold: provides military strength for each surplus worker.
Castle: provides 1 governance action at end of current round (or immediately?).
Abbey: grants +1 effectiveness to adjacent farm, village and mine. When placed, enhances 1 building at end of current round.
Tradeship: placed on water tile -- grants access to all connected land. During activation, spend coin for food/workers

*/


class Level {
    constructor() {
        this.levelSeed = null;
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';
        this.map = ``;
        this.start = [4,4];
        this.startTile = 'C';
    }
}

class EmptyLevel extends Level {
    constructor() {
        super();
        this.id = 1;
        this.map = `
            ppppp
            pppppp
            ppppppp
            pppppppp
            ppppppppp
            pppppppp
            ppppppp
            pppppp
            ppppp
        `;
        this.start = [4, 4];
        this.startTile = 'C';
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';
    }
}

class Level1 extends Level {
    constructor() {
        super();
        this.id = 1;
        this.map = `
            ppppp
            pmmmpp
            pmmmmpp
            pmwmmmpp
            pfwffmmpp
            ppwfffpp
            ppwwffp
            pppwwf
            ppppw
        `;
        this.start = [4, 4];
        this.startTile = 'C';
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';
    }
}

/**
 * @extends {Map<number, string|undefined>}
 */
class TMap extends Map {
    /**
     * 
     * @param {string} stringMap 
     * @param {number} [size=9] 
     */
    constructor(stringMap, size=9) {
        super();
        this.mapSize = size;
        let r = 0;
        for(let row of stringMap.trim().split('\n')) {
            let c = 0;
            for(let t of row.trim()) {
                this.set(r*size + c, t);
                c++;
            }
            r++;
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     */
    at(hexPos) {
        try {
            return this.get(hexPos[1]*this.mapSize+hexPos[0]);
        } catch {
            return undefined;
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @param {string|undefined} value 
     */
    put(hexPos, value) {
        this.set(hexPos[1]*this.mapSize+hexPos[0], value);
    }
    get hexCount() {
        return 3*this.mapSize*(this.mapSize-1)+1
    }
    toString() {
        let str = '';
        for(let r=0; r<this.mapSize; r++) {
            const w = Math.floor(this.mapSize/2);
            const width = this.mapSize - Math.abs(w-r);
            for(let c=0;c<width;c++) {
                str += this.get(r*this.mapSize+c);
            }
            str+='\n';
        }
        return str;
    }
    *iter() {
        for(let r=0; r<this.mapSize; r++) {
            const w = Math.floor(this.mapSize/2);
            const width = this.mapSize - Math.abs(w-r);
            for(let c=0;c<width;c++) {
                yield this.get(r*this.mapSize+c);
            }
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @yields {TerrainHex}
     */
    *neighborPositions(hexPos) {
        const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2)?1:0;
        const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2)?1:0;
        const offsets = [
            [-1, 0],
            [+1, 0],
            [-xOffsetLeft, -1],
            [+1 - xOffsetLeft, -1],
            [-xOffsetRight, +1],
            [+1 - xOffsetRight, +1],
        ];
    
        for (let offset of offsets) {
            const x = hexPos[0] + offset[0];
            const y = hexPos[1] + offset[1];
            if(this.has(y*this.mapSize+x)) yield [x, y];
        }
    }    
    /**
     * 
     * @param {[number, number]} hexPos 
     * @yields {TerrainHex}
     */
    *neighborIter(hexPos) {
        const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2)?1:0;
        const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2)?1:0;
        const offsets = [
            [-1, 0],
            [+1, 0],
            [-xOffsetLeft, -1],
            [+1 - xOffsetLeft, -1],
            [-xOffsetRight, +1],
            [+1 - xOffsetRight, +1],
        ];
    
        for (let offset of offsets) {
            const x = hexPos[0] + offset[0];
            const y = hexPos[1] + offset[1];
            const t = this.at([x,y]);
            if(t) yield t;
        }
    }    
    getNeighborCount(hexPos) {
        let value = 0;
        for (let t of this.neighborIter(hexPos)) {
            if (t !== undefined) {
                value += 1;
            }
        }
        return value;
    }    
    hasEdge(hexPos) {
        return this.getNeighborCount(hexPos)<6;
    }
    /**
     * 
     * @returns {[number,number]}
     */
    getRandomPos() {
        let y = rand.getRandomInt(this.mapSize);
        let w = Math.floor(this.mapSize/2);
        let width = this.mapSize - Math.abs(w-y);
        let x = rand.getRandomInt(width);
        return [x,y];
    }
}

class RandomLevel extends Level {
    /**
     * 
     * @param {number} size 
     */
    constructor(size) {
        super();
        this.start = [4, 4];
        this.startTile = 'C';
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';    
        const mapString = `
            xxxxx
            xxxxxx
            xxxxxxx
            xxxxxxxx
            xxxxxxxxx
            xxxxxxxx
            xxxxxxx
            xxxxxx
            xxxxx
        `;
        let tmap = new TMap(mapString, size);
        this.makeMap(tmap);
        this.id = 1; 
        this.map = tmap.toString();
    }
    /**
     * 
     * @param {TMap} tmap 
     */
    makeMap(tmap) {
        const startPos = tmap.getRandomPos();
        const basePlacementSet = ['p','p','p','f','f','m','m','w'];
        /**
         * 
         * @param {[number, number]} position 
         */
        function recursePlacement(position) {
            const adjacencies = [...tmap.neighborIter(position)];
            const countWater = adjacencies.reduce((prev, cur)=>cur==='w'?prev+1:prev, 0);
            const extras = adjacencies.filter((val)=>val!=='w');
            const atEdge = tmap.hasEdge(position);
            let placements = [...basePlacementSet, ...extras];
            if(countWater===1 && !atEdge) placements = ['w'];
            const terrain = rand.choose(placements);
            tmap.put(position, terrain);
            for(let hp of rand.shuffle([...tmap.neighborPositions(position)])) {
                if(tmap.at(hp)==='x') recursePlacement(hp);
            }
        }
        recursePlacement(startPos);
        const startTerrain = tmap.at(startPos);
        this.startTile =    startTerrain==='w'? 'T':
                            startTerrain==='m'? 'M':
                            rand.choose(['C','V','A','F','S']);
        let tileSet = 'CCVVVVVVVVAAAAFFFFS';
        const mountainCount = [...tmap.iter()].reduce((prev,cur)=>cur==='m'?prev+1:prev, 0);
        const waterCount = [...tmap.iter()].reduce((prev,cur)=>cur==='w'?prev+1:prev, 0);
        if(mountainCount>0 && this.startTile!='M') tileSet+='M';
        else tileSet += rand.choose(['C','V','A','F','S'])
        if(mountainCount>2) tileSet+='M';
        else tileSet += rand.choose(['C','V','A','F','S'])
        if(mountainCount>5) tileSet+='M';
        else tileSet += rand.choose(['C','V','A','F','S'])
        
        if(waterCount>0 && this.startTile!='T') tileSet+='M';
        else tileSet += rand.choose(['C','V','A','F','S'])
        if(waterCount>2) tileSet+='T';
        else tileSet += rand.choose(['C','V','A','F','S'])
        if(waterCount>5) tileSet+='T';
        else tileSet += rand.choose(['C','V','A','F','S'])
        this.tileSet = tileSet;
        //TODO: x,y here are the opposite of how they are presented in the UI.
        this.start = [startPos[1], startPos[0]];
    }
}

var levels = [new RandomLevel(9)];

// Load Images function
const terrainImages = {
    'p': 'tiles/terrain_plain.png',
    'f': 'tiles/terrain_forest.png',
    'm': 'tiles/terrain_mountain.png',
    'w': 'tiles/terrain_water.png',
    '1': 'tiles/terrain_water_edge_n.png',
    '2': 'tiles/terrain_water_edge_ne.png',
    '3': 'tiles/terrain_water_edge_se.png',
    '4': 'tiles/terrain_water_edge_s.png',
    '5': 'tiles/terrain_water_edge_sw.png',
    '6': 'tiles/terrain_water_edge_nw.png',
    'C': 'tiles/tile_castle.png',
    'V': 'tiles/tile_village.png',
    'A': 'tiles/tile_abbey.png',
    'F': 'tiles/tile_farm.png',
    'M': 'tiles/tile_mine.png',
    'S': 'tiles/tile_stronghold.png',
    'T': 'tiles/tile_tradeship.png',
};


// Color Average function
function colorAverage(a, b, aWgt = 0.0) {
    return a.map((x, i) => aWgt * x + (1 - aWgt) * b[i]);
}

// Base Tile class
class Tile extends ImageWidget {
    code = '';
    value = 0;
    selected = false;
    selectablePos = -1;
    /**@type {[number, number]} */
    hexPos = [-1, -1];
    tileColor = 'blue';
    textColor = 'white';
    score = 0;
    scoreTiles = {};
    scoreTerrain = {};
    constructor(player = null) {
        super({});
        this.wLabel = null;
        this.player = player;
    }
    
    place(hexPos, centerPos, player) {
        if (this.selected) {
            this.hexPos = hexPos;
            let a = new WidgetAnimation();
            a.add({center_x:centerPos[0], center_y:centerPos[1]}, 100);
            a.start(this);
        }
    }

    on_touch_down(event, object, touch) {
        if(this.collideRadius(touch.rect, this.w*0.43)) {
            if (this.parent instanceof GameScreen && this.parent.onTouchDownTile(this, touch)) {
                return true;
            }
        }
        return false;
    }
    
    on_selected(event, object, value) {
        let parent = this.parent;
        if(!(parent instanceof GameScreen)) return;
        let board = parent.board;
        if (value) {
            let a = new WidgetAnimation();
            a.add({x:parent.selectPos[0], y:parent.selectPos[1]}, 100);
            a.start(this);
        } else {
            let x = this.selectablePos;
            let pos = [0 * (parent.board.hexSide * 2 + 0.01 * parent.w), 
                board.h - (1 + x) * (board.hexSide * 2 + 0.01 * board.w)];
            let a = new WidgetAnimation();
            a.add({x:pos[0], y:pos[1]}, 100);
            a.start(this);
        }
    }
    /**
     * 
     * @param {Board} board
     */
    production(board) {
        return {}
    }
}

/**
 * 
 * @param {Board} board 
 * @param {[number, number]} hexPos 
 */
function blessed(board, hexPos) {
    for(let t of board.neighborIter(this.hexPos)) {
        if(t.tile!==null && !(t.tile instanceof Abbey)) {
            return true;
        }
    }
    return false;
}

class Castle extends Tile {
    constructor(player=null) {
        super(player);
        this.code = 'C';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': 1, 'M': -1, 'T': 1, 'A': 1, 'F': -1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 0, 'w': null};
        this.tileColor = 'purple';
        this.textColor = 'white';
        this.src = terrainImages['C'];
    }
    /** @type {Tile['production']} */
    production(board) {
        return {governance:1}
    }
}

class Village extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'V';
        this.scoreTiles = {'C': 1, 'V': -1, 'S': 1, 'M': 1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 0, 'w': null};
        this.tileColor = 'yellow';
        this.textColor = 'white';
        this.src = terrainImages['V'];
    }
    /** @type {Tile['production']} */
    production(board) {
        let workers=0;
        for(let t of board.neighborIter(this.hexPos)) {
            if(t.tile!==null && !(t.tile instanceof Village)) {
                workers+=1;
            }
        }
        return {workers:workers*(blessed(board, this.hexPos)?2:1)};
    }
}

class Stronghold extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'S';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': 1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 0, 'm': 1, 'w': null};
        this.tileColor = 'red';
        this.textColor = 'white';
        this.src = terrainImages['S'];
    }
    /** @type {Tile['production']} */
    production(board) {
        let force = 0        
        for(let t of board.neighborIter(this.hexPos)) {
            if(t.tile instanceof Village) {
                force+=1;
            }
        }
        return {force:force*(blessed(board, this.hexPos)?2:1)} //TODO: Force = spare workers OR force = adjacent villages
    }
}

class Mine extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'M';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 0, 'm': 2, 'w': null};
        this.tileColor = 'grey';
        this.textColor = 'white';
        this.src = terrainImages['M'];
    }
    /** @type {Tile['production']} */
    production(board) {
        let gold=0;
        for(let t of board.neighborIter(this.hexPos)) {
            if(t instanceof Mountain) {
                gold+=1;
            }
        }
        return {gold:gold*(blessed(board, this.hexPos)?2:1)};
    }
}

class Tradeship extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'T';
        this.scoreTiles = {'C': 1, 'V': 1, 'S': -1, 'M': 1, 'T': -1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': null, 'f': null, 'm': null, 'w': 2};
        this.tileColor = colorString([0.4, 0.2, 0.2, 1.0]);
        this.textColor = 'white';
        this.src = terrainImages['T'];
    }
    /** @type {Tile['production']} */
    production(board) {
        return {}; //Tradeships allow exchange of gold for other resources during the activation phase
    }    
}

class Abbey extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'A';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': -1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 1, 'w': null};
        this.tileColor = colorString([0.7, 0.4, 0.4, 1.0]);
        this.textColor = 'white';
        this.src = terrainImages['A'];
    }
    /** @type {Tile['production']} */
    production(board) {
        return {};
    }    
}

class Farm extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'F';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': 1, 'F': -1, '': 0.5};
        this.scoreTerrain = {'p': 2, 'f': 1, 'm': null, 'w': null};
        this.tileColor = colorString([0.2, 0.5, 0.2, 1.0]);
        this.textColor = 'white';
        this.src = terrainImages['F'];
    }
    /** @type {Tile['production']} */
    production(board) {
        let food = 0;
        for(let t of board.neighborIter(this.hexPos)) {
            if(t instanceof Plain) {
                food+=1;
            }
        }
        return {food:food*(blessed(board, this.hexPos)?2:1)};
    }
}

class TargetTile extends Label {
    score = 0;
    code = '*';
    constructor(props) {
        super();        
        this.updateProperties(props)
        const score = this.score;
        this.text = score==0? '--':
                    score>0? '+'+score:
                    ''+score;
        this.color = 'rgba(20,20,20,0.8)'
        this.color = this.score>0?'rgba(60,40,0,0.85)':
                    this.score===0?'rgba(20,20,20,0.85)':
                    'rgba(72,32,29,0.85)';
}
    draw(app, ctx) {
        ctx.beginPath();
        ctx.arc(this.center_x, this.center_y, this.w/3, 0, 2*Math.PI);
        ctx.fillStyle = this.score>0?'rgba(255,240,0,0.5)':
                        this.score===0?'rgba(100,100,100,0.5)':
                        'rgba(168,72,65,0.75)';
        ctx.strokeStyle = 'rgba(80,80,80,0.5)';
        ctx.lineWidth = this.w/10;
        ctx.stroke();
        ctx.fill();
        super.draw(app, ctx);
    }
}


const tileDict = {
    'C': Castle,
    'V': Village,
    'S': Stronghold,
    'M': Mine,
    'T': Tradeship,
    'A': Abbey,
    'F': Farm,
};

class TerrainMap extends Array {
    /**
     * 
     * @param {Level|null} level 
     * @param {number} size 
     */
    constructor(level, size) {
        super(); //total number of cells in the x direction
        for(let i=0; i<size; ++i) {
            this.push([]);
        }
        this.size = size;
        let i = 0;
        let terrainmap;
        if(level===null) {
            terrainmap = new EmptyLevel().map.replace(/\n/g, '').replace(/ /g, '');
        } else {
            terrainmap = level.map.replace(/\n/g, '').replace(/ /g, '');
        }
        for (let x = 0; x < this.size; x++) {
            let yHeight = this.size - Math.abs((this.size - 1) / 2 - x);
            for (let y = 0; y < yHeight; y++) {
                let ht = new terrainClass[terrainmap[i]]({hexPos: [x, y]});
                this[x].push(ht);
                i++;
            }
        }
    }
    /**
     * @yields {TerrainHex}
     */
    *iter() {
        for(let a of this) {
            for (let hex of a) {
                yield hex;
            }
        }
    }
    /**
     * @param {number} x 
     * @param {number} y
     * @returns {TerrainHex|undefined}
     */
    at(x, y) {
        try {
            return this[x][y];
        } catch(error) {
            return undefined;
        }
    }
    /**
     * @param {number} x 
     * @param {number} y
     * @param {TerrainHex} terrain
     */
    set(x, y, terrain) {
        this[x][y] = terrain;
    }
}

class TerrainHex extends ImageWidget {
    code = '';
    hexWidth = 0.0;
    hexHeight = 0.0;
    hexLen = 0.0;
    hexPosX = 0.0;
    hexPosY = 0.0;
    texture = {};

    constructor(props=null) {
        super({});
        if(props!==null) {
            this.updateProperties(props);
        }
        this.tile = null;
        this.allowStretch = true;
    }

    /**@type {[number, number]} */
    get hexPos() { 
        return [this.hexPosX, this.hexPosY]; 
    }

    set hexPos(pos) { 
        [this.hexPosX, this.hexPosY] = pos; 
    }

    on_touch_down(event, object, touch) {
        if(this.collideRadius(touch.rect, this.w*0.43)) { //TODO: Scale it
            let gameScreen = this.parent?.parent;
            if(gameScreen instanceof GameScreen) {
                gameScreen.onTouchDownTerrain(this, touch);
                return true;    
            }
        }
        return false;
    }
}

class Plain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'p';
        this.src = terrainImages['p']; 
    }
}

class Forest extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'f';
        this.src = terrainImages['f']; 
    }
}

class Mountain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'm';
        this.src = terrainImages['m'];         
    }
}

class Water extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'w';
        this.src = terrainImages['w']; 
    }
}

const terrainClass = {
    'p': Plain,
    'f': Forest,
    'm': Mountain,
    'w': Water
};

// class ScoreBoard extends BoxLayout {

// }

class Board extends Widget {
    /**@type {number} Height and max width of the board in number of hexes  */
    boardSize = 1;
    /**@type {number} */
    boardWidth = 1;
    /**@type {number} */
    boardHeight = 1;
    /**@type {number} */
    hexWidth = 1;
    /**@type {number} */
    hexSide = 1;
    /**@type {number} */
    hexHeight = 1;
    /**@type {string} */
    bgColor = 'rgba(25, 102, 153, 1.0)'; //'Ocean Blue';
    constructor(props={}) {
        super();
        if(props) this.updateProperties(props);
        /**@type {TerrainMap} */
        this._terrainMap = new TerrainMap(null, this.boardSize);
        for(let thex of this._terrainMap.iter()) {
            this.addChild(thex);
        }    
    }
    /**@type {TerrainMap} */
    set terrainMap(value) {
        for (let thex of this._terrainMap.iter()) {
            this.removeChild(thex);
        }    
        this._terrainMap = value;
        for(let thex of this._terrainMap.iter()) {
            this.addChild(thex);
        }    
    }
    get terrainMap() {
        return this._terrainMap;
    }
    /**
     * 
     * @param {Level|null} level 
     */
    makeTerrain(level) {
        this.terrainMap = new TerrainMap(level, this.boardSize);
    }

    pixelPos(hexPos) {
        return [
            this.center_x + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardSize / 2)),
            this.center_y + this.hexHeight * (hexPos[1] - Math.floor(this.boardSize / 2) + Math.abs(hexPos[0] - Math.floor(this.boardSize / 2)) / 2.0)
        ];
    }
    
    hexPos(pixelPos) {
        const hpos = Math.round((pixelPos[0] - this.center_x) / (this.hexSide * 1.5) + Math.floor(this.boardSize / 2));
        const vpos = Math.round((pixelPos[1] - this.center_y) / this.hexHeight + Math.floor(this.boardSize / 2) - Math.abs(hpos - Math.floor(this.boardSize / 2)) / 2);
        if (0 <= hpos && hpos < this.boardSize && 0 <= vpos && vpos < this.boardSize) {
            return [hpos, vpos];
        } else {
            return null;
        }
    }
    get hexCount() {
        return 3*this.boardSize*(this.boardSize-1)+1
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @yields {TerrainHex}
     */
    *neighborIter(hexPos) {
        const yOffsetLeft = hexPos[0] <= Math.floor(this.boardSize / 2)?1:0;
        const yOffsetRight = hexPos[0] >= Math.floor(this.boardSize / 2)?1:0;
        const offsets = [
            [0, -1],
            [0, +1],
            [-1, -yOffsetLeft],
            [-1, +1 - yOffsetLeft],
            [+1, -yOffsetRight],
            [+1, +1 - yOffsetRight]
        ];
    
        for (let offset of offsets) {
            const x = hexPos[0] + offset[0];
            const y = hexPos[1] + offset[1];
            const t = this._terrainMap.at(x,y);
            if (t) yield t;
        }
    }
    
    getNeighborCount(hexPos) {
        let value = 0;
        for (let t of this.neighborIter(hexPos)) {
            if (t.tile !== null) {
                value += 1;
            }
        }
        return value;
    }    

    layoutChildren() {
        this.hexSide = Math.min(
            this.w / (1.5 * this.boardSize + 1),
            0.95 * this.h / (this.boardSize * Math.sqrt(3))
        );
        this.hexWidth = this.hexSide * 2;
        this.hexHeight = this.hexSide * Math.sqrt(3);
        this.boardHeight = this.hexHeight * this.boardSize;
        this.boardWidth = this.hexSide * (1.5 * this.boardSize + 1);
    
        for (let x = 0; x < this.boardSize; x++) {
            let yHeight = this.boardSize - Math.abs(Math.floor((this.boardSize - 1) / 2) - x);
            for (let y = 0; y < yHeight; y++) {
                let center = this.pixelPos([x, y]);
                let thex = this._terrainMap.at(x, y);
                if(thex) {
                    thex.w = this.hexWidth;
                    thex.h = this.hexWidth;
                    thex.center_x = center[0];
                    thex.center_y = center[1];
                    thex.layoutChildren();    
                }
            }
        }
    }
}

class GameScreen extends Widget {
    constructor() {
        super();
        this.board = new Board({hints:{x:0,y:0,w:1,h:1}});
        this.addChild(this.board);
        /**@type {Level|null} */
        this.level = null;
        this.tiles = [];
        this.selectableTiles = [];
        this.placementTargets = [];
        this.tileStack = [];
        this.selectedTile = null;
        this.activePlayer = 0;
        this.players = [];
        this.selectPos = [0,0];
        this.scoreboard = new BoxLayout({align:'right', hints:{right:0.99, y:0.01, w:1, h:0.05}});
        this.addChild(this.scoreboard);
        this.gameOver = false;
        this.wStateLabel = new Label({text: '', color: 'white', align: 'right', hints: {right: 0.99, bottom: 0.99, w:1, h:0.05}});
        this.addChild(this.wStateLabel);
    }
    /**
     * @param {TerrainHex|null} terrain 
     */
    updateScores(terrain = null) {
        if (terrain !== null) {
            this.scoreTile(terrain);
            for (let terr of this.board.neighborIter(terrain.hexPos)) {
                if (terr.tile !== null) {
                    this.scoreTile(terr);
                }
            }
        }
        for (let p of this.players) {
            let score = 0;
            for (let pt of p.placedTiles) {
                score += pt.score;
            }
            p.scoreMarker.score = score;
        }
    }
    
    /**
     * 
     * @param {TerrainHex} thex 
     * @param {boolean} serverCheck 
     * @returns 
     */
    placeTile(thex, serverCheck = true) {
        if (!this.gameOver && this.selectedTile !== null) {
            const hexPos = thex.hexPos;
            const t = this.board.terrainMap.at(...hexPos);
            if (t===undefined || t.tile !== null) {
                return;
            }
            const centerPos = this.board.pixelPos(hexPos);
            this.selectedTile.place(hexPos, centerPos, this.players[this.activePlayer]);
            const index = this.selectableTiles.indexOf(this.selectedTile);
            if (index > -1) {
                this.selectableTiles.splice(index, 1);
            }
            thex.tile = this.selectedTile;
            this.clearPlacementTargets();
            this.players[this.activePlayer].placedTiles.push(this.selectedTile);
            this.selectedTile.selectablePos = -1;
            this.selectedTile.bgColor = null;
            this.selectedTile = null;
            this.updateScores(thex);
            this.drawNewTile();
            this.nextPlayer();
        }
    }

    /**
     * 
     * @param {Tile} tile 
     * @param {boolean} notifyServer 
     * @returns 
     */
    selectTile(tile, notifyServer = true) {
        if (this.selectedTile !== null && this.selectedTile !== tile) {
            this.selectedTile.selected = false;
            this.selectedTile = null;
        }
        if (!this.gameOver && this.selectedTile === null && this.selectableTiles.includes(tile)) {
            const tileNum = this.selectableTiles.indexOf(tile);
            tile.selected = true;
            this.selectedTile = tile;
        }
        return false;
    }

    /**
     * 
     * @param {TerrainHex} terrain 
     * @param {Touch} touch 
     * @returns 
     */
    onTouchDownTerrain(terrain, touch) {
        if (this.gameOver) return true;
        if (this.selectedTile === null) return true;
        if (this.selectedTile.scoreTerrain[terrain.code] === null) return true;
        const player = this.players[this.activePlayer];
        if (!player.localControl) return true;
        if (!this.hasNeighbor(player, terrain)) return true;
        return this.placeTile(terrain);
    }

    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex} terrain 
     * @returns 
     */
    hasNeighbor(player, terrain) {
        if (player.placedTiles.length > 0) {
            for (let t of this.board.neighborIter(terrain.hexPos)) {
                if (player.placedTiles.includes(t.tile)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 
     * @param {Tile} tile 
     * @param {Touch} touch 
     * @returns 
     */
    onTouchDownTile(tile, touch) {
        if (this.gameOver) return true;
        if (tile.hexPos[0] !== -1 && tile.hexPos[1] !== -1) return false;
        const p = this.players[this.activePlayer];
        if (!p.localControl) return true;
        else {
            this.wStateLabel.text = 'Place tile';
            this.wStateLabel.color = p.color; // colorAverage([1,1,1,1], p.color);
            this.setPlacementTargets(tile);
        }
        return this.selectTile(tile);
    }

    /**
     * 
     * @param {TerrainHex} terrHex 
     * @returns {number}
     */
    scoreTile(terrHex) {
        terrHex.tile.score = this.getTileScore(terrHex, terrHex.tile);
        return terrHex.tile.score;
    }

    /**
     * 
     * @param {TerrainHex} terrHex 
     * @param {Tile} tile 
     * @returns {number}
     */
    getTileScore(terrHex, tile) {
        let score = tile.scoreTerrain[terrHex.code];
        for (let nterr of this.board.neighborIter(terrHex.hexPos)) {
            if (nterr.tile !== null) {
                score += tile.scoreTiles[nterr.tile.code];
            }
        }
        return score;
    }


    /**
     * @param {Tile} tile */
    setPlacementTargets(tile) {
        this.clearPlacementTargets();
        let player = this.players[this.activePlayer];
        if(!this.board.terrainMap) return;
        let targets = [];
        for(let thex of this.board.terrainMap.iter()) {
            if(thex.tile!==null) continue;
            if(!this.hasNeighbor(player, thex)) continue;
            if(tile.scoreTerrain[thex.code]===null) continue;
            let score = this.getTileScore(thex, tile);
            for (let nterr of this.board.neighborIter(thex.hexPos)) {
                if (nterr.tile !== null) {
                    score += nterr.tile.scoreTiles[tile.code];
                }
            }
            let tt = new TargetTile({
                w: this.board.hexSide * 2,
                h: this.board.hexSide * 2,
                score: score,
                hexPos: thex.hexPos.slice(),
            })
            let xy = this.board.pixelPos(thex.hexPos)
            tt.center_x = xy[0];
            tt.center_y = xy[1];
            targets.push(tt);

        }
        this.placementTargets = targets;
        for(let c of targets) {
            this.addChild(c);
        }
    }

    clearPlacementTargets() {
        for(let c of this.placementTargets) {
            this.removeChild(c)
        }
        this.placementTargets = [];
    }

    removePlayers() {
        this.activePlayer = 0;
        this.selectedTile = null;
        for (let p of this.players) {
            p.delete();
        }
        this.players = [];
    }

    clearLevel() {
        this.board.makeTerrain(null);
        for (let st of this.selectableTiles) {
            this.removeChild(st);
        }
        this.selectableTiles = [];
    }
    /**
     * @param {Level|null} level 
     */
    setupLevel(level = null) {
        if (level !== null) {
            this.level = level;
        }
        if(this.level===null) return;
        this.board.makeTerrain(this.level);
        let p = this.players[this.activePlayer]
        this.selectableTiles = [new Castle(p), new Village(p), new Village(p)];
        let x = 0;
        for (let st of this.selectableTiles) {
            st.selectablePos = x;
            st.bgColor = 'gray';
            this.addChild(st);
            x++;
        }
        this.tileStack = [...this.level.tileSet].map(t => new tileDict[t]());
        this.tileStack.sort(() => Math.random() - 0.5);
        let startTile = new tileDict[this.level.startTile]();
        startTile.hexPos = this.level.start;
        this.addChild(startTile);
        if(this.board.terrainMap && this.level) {
            let terr = this.board.terrainMap.at(this.level.start[0], this.level.start[1]);
            if(terr) {
                terr.tile = startTile;
                this.players[this.activePlayer].placedTiles.push(startTile);
                this.scoreTile(terr);
                this.updateScores();                    
            }
        }
    }

    /**
     * 
     * @param {PlayerSpec[]} playerSpec 
     * @param {Level|null} level 
     */
    setupGame(playerSpec, level = null) {
        this.gameOver = false;
        this.wStateLabel.text = '';
        this.wStateLabel.color = 'white';
        this.removePlayers();
        this.clearLevel();
        
        // This code could be simplified as the values are the same for every condition, 
        // but I'm keeping it to retain the structure in case you want to change values for specific conditions later.
        if (playerSpec.length === 1) {
            this.board.boardSize = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 2) {
            this.board.boardSize = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 3) {
            this.board.boardSize = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 4) {
            this.board.boardSize = 9;
            this.tilesCount = 24;
        } else { // Assuming 5 or more
            this.board.boardSize = 9;
            this.tilesCount = 24;
        }
        
        for (let p of playerSpec) {
            if (p.type === 0) { // human
                this.players.push(new Player(p.name, p.color, this));
            // } else if (p.type === 1) { // computer
            //     this.players.push(new AIPlayer(p.name, p.color, this));
            // } else if (p.type === 2) { // network
            //     this.players.push(new NetworkPlayer(p.name, p.color, this));
            }
        }
        this.setupLevel(level);
    }

    startGame() {
        this.nextPlayer();
    }

    nextPlayer() {
        if (this.activePlayer >= 0) {
            this.players[this.activePlayer].endTurn();
            if (this.selectableTiles.length === 0) {
                this.showGameOver();
                return;
            }
        }
        this.activePlayer += 1;
        if (this.activePlayer >= this.players.length) {
            this.activePlayer = 0;
        }
        let p = this.players[this.activePlayer];
        p.startTurn();
        if (p.localControl) {
            this.wStateLabel.text = 'Select tile';
            this.wStateLabel.color = p.color; // colorAverage([1,1,1,1], p.color);
        } else {
            this.wStateLabel.text = '';
            this.wStateLabel.color = 'white';
        }
    }
    
    showGameOver() {
        let scores = this.players.map(p => p.scoreMarker.score);
        let hiScore = Math.max(...scores);
        let winners = this.players.filter((player, idx) => scores[idx] === hiScore);
        this.gameOver = true;
    
        if (this.players.length === 1) {
            let rating = 'You bankrupted the kingdom!';
            if (hiScore > 40) rating = 'Time to find another job';
            if (hiScore > 60) rating = 'The people are happy';
            if (hiScore > 80) rating = 'The people are joyous!';
            if (hiScore > 90) rating = 'Welcome to the history books';
            if (hiScore > 100) rating = 'Hail to the king!';
            this.wStateLabel.color = winners[0].color; //colorAverage([1,1,1,1], winners[0].color);
            this.wStateLabel.text = `Game over - ${rating}`;
        } else if (winners.length === 1) {
            this.wStateLabel.color = winners[0].color; //colorAverage([1,1,1,1], winners[0].color);
            this.wStateLabel.text = `Game over - ${winners[0].name} wins`;
        } else {
            this.wStateLabel.color = 'white';
            this.wStateLabel.text = 'Game over - draw';
        }
    }
    
    drawNewTile() {
        let hexSide = this.board.hexSide;
        if (this.tileStack.length === 0) {
            return;
        }
        let t = this.tileStack.pop();
        t.bgColor = 'gray'
        this.selectableTiles.push(t);
        this.addChild(t);
        for (let x = 0; x < this.selectableTiles.length; x++) {
            let st = this.selectableTiles[x];
            st.selectablePos = x;
            [st.x, st.y] = [
                0 * (hexSide * 2 + 0.01 * this.w),
                this.h - (1 + x) * (hexSide * 2 + 0.01 * this.w)
            ];
            [st.w, st.h] = [hexSide * 2, hexSide * 2];
        }
    }
    
    layoutChildren() {
        this.applyHints(this.board);
        this.board.layoutChildren();
        let hexSide = this.board.hexSide;
        this.selectPos = [
            3 * (hexSide * 2 + 0.01 * this.w),
            this.h - hexSide * 2 - 0.01 * this.w
        ];

        for (let p of this.players) {
            p.boardResize(hexSide);
        }    

        for (let tt of this.placementTargets) {
            let hp = this.board.pixelPos(tt.hexPos);
            tt.w = hexSide * 2,
            tt.h = hexSide * 2,
            tt.center_x = hp[0];
            tt.center_y = hp[1];
        }

        this.applyHints(this.scoreboard);
        this.scoreboard.layoutChildren();
    
        for (let x = 0; x < this.selectableTiles.length; x++) {
            let st = this.selectableTiles[x];
            if(st.selected) {
                [st.x, st.y] = this.selectPos;
            } else {
                st.x = 0 * (hexSide * 2 + 0.01 * this.w);
                st.y = this.h - (1 + x) * (hexSide * 2 + 0.01 * this.w);    
            }
            st.w = hexSide * 2, 
            st.h = hexSide * 2;
            this.applyHints(st);
            st.layoutChildren();
        }
    
        this.applyHints(this.wStateLabel);
        this.wStateLabel.layoutChildren();
        this._needsLayout = false;
    }
}

class PlayerSpec {
    constructor(name, color, type) {
        this.name = name;
        this.color = color;
        this.type = type;
    }
}

class PlayerScore extends Label {
    constructor(identity, color) {
        super();
        this.ident = identity;
        this.color = color;
        this.score = 0.0;
        this.activeTurn = false;
        /**@type {"left"|"center"|"right"}*/
        this.align = "right";
    }
    on_score(event, object, data) {
        this.text = 'Score: '+Math.floor(this.score)
    }
}

class Player {
    /**
     * 
     * @param {string} name 
     * @param {string} color 
     * @param {GameScreen} screen
     */
    constructor(name, color, screen) {
        this.localControl = true;
        this.name = name;
        this.color = color;
        this.screen = screen;
        this.placedTiles = [];
        this.scoreMarker = new PlayerScore(this.name.substring(0, 2), color);
        this.screen.scoreboard.addChild(this.scoreMarker);
    }

    delete() {
        this.reset();
        this.screen.scoreboard.removeChild(this.scoreMarker);
        for (let pt of this.placedTiles) {
            this.screen.removeChild(pt);
        }
        this.placedTiles = [];
    }

    reset() {
        this.scoreMarker.activeTurn = false;
        this.scoreMarker.score = 0;
        for (let pt of this.placedTiles) {
            this.screen.removeChild(pt);
        }
        this.placedTiles = [];
    }

    startTurn() {
        this.scoreMarker.activeTurn = true;
    }

    endTurn() {
        this.scoreMarker.activeTurn = false;
    }

    /**
     * 
     * @param {number} hexSide 
     */
    boardResize(hexSide) {
        for (let pt of this.placedTiles) {
            if(pt._animation) continue;
            pt.w = hexSide*2;
            pt.h = hexSide*2;
            [pt.center_x,pt.center_y] = pt.parent.board.pixelPos(pt.hexPos);
        }
    }
}


const colorLookup = {
    0: [0.6, 0, 0, 1],
    1: [0, 0.6, 0, 1],
    2: [0, 0, 0.6, 1],
    3: [0.5, 0, 0.5, 1],
    4: [0.5, 0.5, 0, 1]
};

// class LevelHex extends ImageWidget {
//     constructor(level_id, source_id = 'tiles/terrain_plain.png') {
//         super();
//         this.src = source_id;
//         this.lid = level_id;
//         this.level_id = String(level_id);
//     }

//     on_touch_up(event, touch) {
//         if (this.collideRadius(touch.rect, this.w*0.43)) {
//             this.parent.on_touch_up_level(this, touch);
//         }
//     }
// }

// class LevelPicker extends Widget {
//     constructor(gameMenu) {
//         super();
//         this.levels = {};
//         for (let l of levels.Level.subclasses()) {
//             this.levels[l.id] = l;
//         }
//         this.gameMenu = gameMenu;
//         for (let i of Object.keys(this.levels).sort()) {
//             this.addChild(new LevelHex(i));
//         }
//         this.bind('size', this.onSize);
//     }

//     layoutChildren() {
//         super.layoutChildren();
//         let W = this.w;
//         let H = this.h;
//         let N = this.children.length;
//         if (W === 0 || W === null || N === 0) {
//             return;
//         }
//         let x = Math.ceil(Math.sqrt(1.0 * N * W / H));
//         let y = Math.ceil(1.0 * x / N);
//         let i = 0;
//         for (let w of this.children.reverse()) {
//             w.size = [W * 0.1, H * 0.1];
//             w.center = [(i + 1) * 3 * w.size[0], this.size[1] / 2];
//             i++;
//         }
//     }

//     on_touch_up_level(terrain, touch) {
//         this.gameMenu.startSpGame(this.levels[terrain.lid]);
//     }
// }

class GameMenu extends BoxLayout {
    /**
     * 
     * @param {import('../eskv/lib/modules/widgets.js').BoxLayoutProperties} props 
     */
    constructor(props) {
        super(props);
        this.playerCount = 0;
        this.players = [];
        this.wGame = new GameScreen();
        this.addChild(this.wGame);
        this.level = levels[0]
        this.playerSpec = [];
        this.startSpGame(this.level);
    }

    restartGame() {
        let game = this.wGame;
        game.setupGame(this.playerSpec, levels[0]);
        game.startGame();
        this.current = 'game';
    }

    startGame() {
        let ps = new PlayerSpec('Player ' + String(1), colorLookup[0], 0);
        this.playerSpec = [ps];
        this.wGame.setupGame(this.playerSpec, levels[0]);
        this.wGame.startGame();
        this.current = 'game';
    }

    /**
     * 
     * @param {Level} level 
     */
    startSpGame(level) {
        this.playerSpec = [new PlayerSpec('Player ' + String(1), 'white', 0)];
        this.wGame.setupGame(this.playerSpec, levels[0]);
        this.wGame.startGame();
        this.current = 'game';
    }
}

class StatusLabel extends Label {
    /**
     * 
     * @param {string} text 
     * @param {string} bgColor 
     * @param {string} color 
     * @param {import('../eskv/lib/modules/widgets.js').WidgetSizeHints} hints 
     */
    constructor(text, bgColor, color, hints) {
        super({text:text, bgColor:bgColor, color:color, hints:hints});
    }
}

class PuzzleKingdomApp extends App {
    constructor() {
        super();
        this._baseWidget.children = [ 
            new GameMenu({hints: {x:0, y:0, w:1, h:1}})
        ];
    }

}

var pk = new PuzzleKingdomApp();
pk.start();