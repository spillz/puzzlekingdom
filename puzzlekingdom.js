//@ts-check

import  {App, Widget, ImageWidget, WidgetAnimation, Label, BoxLayout, Vec2, math, rand, Button} from '../eskv/lib/eskv.js'; //Import ESKV objects into an eskv namespace
import { colorString } from '../eskv/lib/modules/math.js';
import { Touch} from '../eskv/lib/modules/input.js';

rand.setPRNG('jsf32');
rand.setSeed(Date.now());

//@ts-ignore
import urlTerrainPlain from './tiles/terrain_plain.png';
//@ts-ignore
import urlTerrainForest from './tiles/terrain_forest.png';
//@ts-ignore
import urlTerrainMountain from './tiles/terrain_mountain.png';
//@ts-ignore
import urlTerrainWater from './tiles/terrain_water.png';
//@ts-ignore
import urlTerrainWaterEdgeN from './tiles/terrain_water_edge_n.png';
//@ts-ignore
import urlTerrainWaterEdgeNe from './tiles/terrain_water_edge_ne.png';
//@ts-ignore
import urlTerrainWaterEdgeSe from './tiles/terrain_water_edge_se.png';
//@ts-ignore
import urlTerrainWaterEdgeS from './tiles/terrain_water_edge_s.png';
//@ts-ignore
import urlTerrainWaterEdgeSw from './tiles/terrain_water_edge_sw.png';
//@ts-ignore
import urlTerrainWaterEdgeNw from './tiles/terrain_water_edge_nw.png';
//@ts-ignore
import urlTileCastle from './tiles/tile_castle.png';
//@ts-ignore
import urlTileVillage from './tiles/tile_village.png';
//@ts-ignore
import urlTileAbbey from './tiles/tile_abbey.png';
//@ts-ignore
import urlTileFarm from './tiles/tile_farm.png';
//@ts-ignore
import urlTileMine from './tiles/tile_mine.png';
//@ts-ignore
import urlTileStronghold from './tiles/tile_stronghold.png';
//@ts-ignore
import urlTileTradeship from './tiles/tile_tradeship.png';
//@ts-ignore
import urlIconCheck from './tiles/icon_check.png';
//@ts-ignore
import urlIconMenu from './tiles/icon_menu.png';
//@ts-ignore
import urlIconSkip from './tiles/icon_skip.png';
//@ts-ignore
import urlIconUncheck from './tiles/icon_uncheck.png';
//@ts-ignore
import urlResourceFood from './tiles/resource_food.png';
//@ts-ignore
import urlResourceMilitary from './tiles/resource_military.png';
//@ts-ignore
import urlResourceMoney from './tiles/resource_money.png';
//@ts-ignore
import urlResourceWorker from './tiles/resource_worker.png';

// Load Images function
const gameImages = {
    'p': urlTerrainPlain,
    'f': urlTerrainForest,
    'm': urlTerrainMountain,
    'w': urlTerrainWater,
    '1': urlTerrainWaterEdgeN,
    '2': urlTerrainWaterEdgeNe,
    '3': urlTerrainWaterEdgeSe,
    '4': urlTerrainWaterEdgeS,
    '5': urlTerrainWaterEdgeSw,
    '6': urlTerrainWaterEdgeNw,
    'C': urlTileCastle,
    'V': urlTileVillage,
    'A': urlTileAbbey,
    'F': urlTileFarm,
    'M': urlTileMine,
    'S': urlTileStronghold,
    'T': urlTileTradeship,
    'rw': urlResourceWorker,
    'rf': urlResourceFood,
    'rm': urlResourceMoney,
};

/**@typedef {'C'|'V'|'A'|'F'|'M'|'S'|'T'} TileType */
/**@typedef {'p'|'f'|'m'|'w'} TerrainType */
/**@typedef {'rf'|'rw'|'rm'} ResourceType */
/**@typedef {{'rf'?:number, 'rw'?:number, 'rm'?:number}} ProductionObj */
/**@typedef {Production|ProductionObj} ProductionLike */

/**@type {ResourceType[]} */
const resources = ['rf','rw','rm'];

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
Abbey: grants +1 effectiveness to an adjacent farm, village or mine. When placed, enhances 1 building at end of current round.
Tradeship: placed on water tile -- grants access to all connected land within a certain range. During activation, spend coin for food/workers

*/


/**
 * @extends {Map<ResourceType, number>}
 */
class Production extends Map {
    /**
     * 
     * @param {ProductionLike} obj 
     */
    static from(obj) {
        const prod = new Production();
        if(obj instanceof Production) {
            for (let r of obj.keys()) {
                prod.set(r, obj.get(r)??0);
            }
        } else {
            for (let r in obj) {
                prod.set(/**@type {ResourceType}*/(r), obj[r]);
            }    
        }
        return prod;
    }
    /**
     * 
     * @param {ProductionLike} prodLike 
     */
    add(prodLike) {
        let prod0 = Production.from(this);
        let prod1 = Production.from(prodLike);
        for(let r of prod1.keys()) {
            prod0.set(r, (prod0.get(r)??0)+(prod1.get(r)??0));
        }    
        return prod0;
    }
    /**
     * 
     * @param {ProductionLike} prodLike 
     */
    subtract(prodLike) {
        let prod0 = Production.from(this);
        let prod1 = Production.from(prodLike);
        for(let r of prod1.keys()) {
            prod0.set(r, (prod0.get(r)??0)-(prod1.get(r)??0));
        }    
        return prod0;
    }
}

class Level {
    constructor() {
        this.levelSeed = null;
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';
        this.map = ``;
        this.boardSize = 0;
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
        this.boardSize = 9;
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
        this.boardSize = 9;
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
        const w = Math.floor(this.mapSize/2);
        for(let r=0; r<this.mapSize; r++) {
            const width = this.mapSize - Math.abs(w-r);
            for(let c=0;c<width;c++) {
                str += this.get(r*this.mapSize+c);
            }
            str+='\n';
        }
        return str;
    }
    *iter() {
        const w = Math.floor(this.mapSize/2);
        for(let r=0; r<this.mapSize; r++) {
            const width = this.mapSize - Math.abs(w-r);
            for(let c=0;c<width;c++) {
                yield this.get(r*this.mapSize+c);
            }
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @returns {Generator<[number, number]>}
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
     * @returns {Generator<string|undefined>}
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
        this.boardSize = size;
        this.tileSet = 'CCVVVVVVVVVTMAAAAAFFFFFSS';    
        let mapString = '';
        const w=Math.floor(size/2);
        for(let r=0;r<size;r++) {
            for(let c=0;c<size-Math.abs(w-r);c++) {
                mapString += 'x';
            }
            mapString += '\n';
        }
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
            let placements = [...basePlacementSet, ...extras, ...extras];
            if(countWater===1 && !atEdge) placements = ['w'];
            const terrain = rand.choose(placements);
            tmap.put(position, terrain);
            for(let hp of rand.shuffle([...tmap.neighborPositions(position)])) {
                if(tmap.at(hp)==='x') recursePlacement(hp);
            }
        }
        recursePlacement(startPos);
        const startTerrain = tmap.at(startPos);
        const basicTiles = ['C','V','A','F','S'];
        this.startTile =    startTerrain==='w'? 'T':
                            startTerrain==='m'? 'M':
                            rand.choose(basicTiles);
        let tileSet = 'CCVVVVVVVVAAAAFFFFS';
        const mountainCount = [...tmap.iter()].reduce((prev,cur)=>cur==='m'?prev+1:prev, 0);
        const waterCount = [...tmap.iter()].reduce((prev,cur)=>cur==='w'?prev+1:prev, 0);
        if(mountainCount>0 && this.startTile!='M') tileSet+='M';
        else tileSet += rand.choose(basicTiles)
        if(mountainCount>2) tileSet+='M';
        else tileSet += rand.choose(basicTiles)
        if(mountainCount>5) tileSet+='M';
        else tileSet += rand.choose(basicTiles)
        
        if(waterCount>0 && this.startTile!='T') tileSet+='M';
        else tileSet += rand.choose(basicTiles)
        if(waterCount>2) tileSet+='T';
        else tileSet += rand.choose(basicTiles)
        if(waterCount>5) tileSet+='T';
        else tileSet += rand.choose(basicTiles)
        this.tileSet = tileSet;
        //TODO: x,y here are the opposite of how they are presented in the UI so we reverse them
        this.start = [startPos[1], startPos[0]];
    }
}

var levels = [new RandomLevel(11)];


// Color Average function
function colorAverage(a, b, aWgt = 0.0) {
    return a.map((x, i) => aWgt * x + (1 - aWgt) * b[i]);
}


/**
 * Base Tile class
 * @param {Player|null} player 
 */
class Tile extends ImageWidget {
    /**@type {TileType} */
    code = 'F';
    /**@type {Object<ResourceType, number>} */
    cost = {'rw':1}
    value = 0;
    selected = false;
    /**@type {[number, number]} */
    hexPos = [-1, -1];
    tileColor = 'blue';
    textColor = 'white';
    score = 0;
    placeTerrain = {};
    constructor() {
        super({});
        /**@type {Label|null} */
        this.wLabel = null;
    }
    
    /**
     * 
     * @param {[number, number]} hexPos 
     * @param {[number, number]|null} centerPos 
     * @param {Player} player 
     * @param {Board} board;
     */
    place(hexPos, centerPos, player, board) {
        this.hexPos = hexPos;
        if(centerPos!==null) {
            let a = new WidgetAnimation();
            this.w = 0.01;
            this.h = 0.01;
            this.center_x = centerPos[0];
            this.center_y = centerPos[1];
            // this.hints = {center_x: centerPos[0], center_y:centerPos[1]};
            a.add({w:board.hexHeight, h:board.hexHeight, 
                center_x:centerPos[0], center_y:centerPos[1]}, 100);
            a.start(this);    
        }
    }
    
    on_selected(event, object, value) {
        let parent = this.parent;
        this.bgColor = value? 'green':null;
        if(!(parent instanceof GameScreen)) return;
        if (value) {
            let a = new WidgetAnimation();
            a.add({x:parent.selectPos[0], y:parent.selectPos[1]}, 100);
            a.start(this);
        }
    }
    /**
     * 
     * @param {Board} board
     * @param {[number, number]} hexPos
     * @returns {Production}
     */
    production(board, hexPos) {
        return Production.from({});
    }
}

/**
 * 
 * @param {Board} board 
 * @param {[number, number]} hexPos 
 */
function blessed(board, hexPos) {
    for(let t of board.neighborIter(hexPos)) {
        if(t.tile instanceof Abbey) {
            return 1;
        }
    }
    return 0;
}

class Castle extends Tile {
    code = /**@type {TileType} */('C');
    cost = /**@type {Object<ResourceType, number>} */({'rw':5, 'rm':2});
    placeTerrain = {'p': 0, 'f': 0, 'm': 0, 'w': null};
    tileColor = 'purple';
    textColor = 'white';
    constructor(props={}) {
        super();
        this.src = gameImages['C'];
        this.updateProperties(props);
    }
}

class Village extends Tile {
    code = /**@type {TileType}*/('V');
    placeTerrain = {'p': 1, 'f': 1, 'm': 0, 'w': null};
    cost =/**@type {Object<ResourceType, number>} */({'rw':2, 'rm':0});
    tileColor = 'yellow';
    textColor = 'white';
    constructor(props={}) {
        super();
        this.src = gameImages['V'];
        this.updateProperties(props);
    }
    /** @type {Tile['production']} */
    production(board, hexPos) {
        if(hexPos===null) hexPos=this.hexPos;
        let workers=1;
        for(let t of board.neighborIter(hexPos)) {
            if(t.tile instanceof Farm) {
                workers+=1;
            }
        }
        return Production.from({'rw':workers+blessed(board, hexPos)});
    }
}

class Stronghold extends Tile {
    code = /**@type {TileType}*/('S');
    placeTerrain = {'p': 1, 'f': 0, 'm': 1, 'w': null};
    cost =/**@type {Object<ResourceType, number>} */({'rw':3, 'rm':1});
    tileColor = 'red';
    textColor = 'white';
    constructor(props={}) {
        super();        
        /**@type {TileType} */
        this.src = gameImages['S'];
        this.updateProperties(props);
    }
}

class Mine extends Tile {
    code = /**@type {TileType}*/('M');
    placeTerrain = {'p': 1, 'f': 0, 'm': 2, 'w': null};
    cost =/**@type {Object<ResourceType, number>} */({'rw':3, 'rm':0});
    tileColor = 'grey';
    textColor = 'white';
    constructor(props={}) {
        super();        
        this.src = gameImages['M'];
        this.updateProperties(props);
    }
    /** @type {Tile['production']} */
    production(board, hexPos) {
        if(hexPos===null) hexPos=this.hexPos;
        let gold=0;
        if(board.terrainMap.atPos(...hexPos) instanceof Mountain) gold=2;
        else {
            for(let t of board.neighborIter(hexPos)) {
                // if(t.tile===null && t instanceof Mountain) {
                if(t instanceof Mountain) {
                    gold=1;
                    break;
                }
            }
        }
        return Production.from({'rm':gold+blessed(board, hexPos)});
    }
}

class Tradeship extends Tile {
    code = /**@type {TileType}*/('T');
    placeTerrain = {'p': null, 'f': null, 'm': null, 'w': 2};
    cost =/**@type {Object<ResourceType, number>} */({'rw':5, 'rm':0});
    tileColor = colorString([0.4, 0.2, 0.2, 1.0]);
    textColor = 'white';
    constructor(props={}) {
        super();        
        this.src = gameImages['T'];
        this.updateProperties(props);
    }
    /** @type {Tile['place']} */
    place(hexPos, centerPos, player, board) {
        super.place(hexPos, centerPos, player, board);
        function patrol(hexPos, range) {
            for(let t of board.neighborIter(hexPos)) {
                if(t instanceof Water) {
                    t.patrolled=true;
                    if(range>1) patrol(t.hexPos, range-1);
                }
            }
        }
        patrol(hexPos, 2);
    }
}

class Abbey extends Tile {
    code = /**@type {TileType}*/('A');
    placeTerrain = {'p': 1, 'f': 1, 'm': 1, 'w': null};
    cost =/**@type {Object<ResourceType, number>} */({'rw':5, 'rm':0});
    tileColor = colorString([0.7, 0.4, 0.4, 1.0]);
    textColor = 'white';
    constructor(props={}) {
        super();
        this.src = gameImages['A'];
        this.updateProperties(props);
    }
}

class Farm extends Tile {
    code = /**@type {TileType}*/('F');
    placeTerrain = {'p': 2, 'f': 1, 'm': null, 'w': null};
    cost =/**@type {Object<ResourceType, number>} */({'rw':1, 'rm':0});
    tileColor = colorString([0.2, 0.5, 0.2, 1.0]);
    textColor = 'white';
    constructor(props={}) {
        super();        
        this.src = gameImages['F'];
        this.updateProperties(props);
    }
    /** @type {Tile['production']} */
    production(board, hexPos) {
        if(hexPos===null) hexPos=this.hexPos;
        let food = 0;
        const terr = board.terrainMap.atPos(...hexPos);
        if(terr) {
            if(terr instanceof Plain) food+=2;
            else if(terr instanceof Forest) food+=1;
        }
        for(let t of board.neighborIter(hexPos)) {
            if(t.tile===null) {
                if(t instanceof Plain) food+=1;
            }
        }
        return Production.from({'rf':food+blessed(board, hexPos)});
    }
}

class TargetTile extends Label {
    score = 0;
    code = '*';
    /**@type {[number,number]} */
    hexPos = [0,0];
    constructor(props) {
        super();        
        this.updateProperties(props)
        const score = this.score;
        this.text = score==0? '--':
                    score>0? '+'+score:
                    ''+score;
        this.color = 'rgba(20,20,20,0.8)';
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

const tileClasses = {
    'C': Castle,
    'V': Village,
    'S': Stronghold,
    'M': Mine,
    'T': Tradeship,
    'A': Abbey,
    'F': Farm,
};

class TerrainHex extends ImageWidget {
    code = '';
    hexWidth = 0.0;
    hexHeight = 0.0;
    hexLen = 0.0;
    hexPosX = 0.0;
    hexPosY = 0.0;
    texture = {};
    /**@type {Tile|null} */
    tile = null;

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

    on_tile(e, o, v) {
        if(this.tile) {
            this.children = [this.tile];
        } else {
            this.children = [];
        }
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
        this.src = gameImages['p']; 
    }
}

class Forest extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'f';
        this.src = gameImages['f']; 
    }
}

class Mountain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'm';
        this.src = gameImages['m'];         
    }
}

class Water extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'w';
        this.src = gameImages['w']; 
        this.patrolled = false;
    }
}

const terrainClasses = {
    'p': Plain,
    'f': Forest,
    'm': Mountain,
    'w': Water
};

/**
 * @extends {Array<Array<TerrainHex>>}
 */
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
                let ht = new terrainClasses[terrainmap[i]]({hexPos: [x, y]});
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
     * 
     * @param {number} x 
     * @param {number} y 
     */
    atPos(x, y) {
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
     * @param {Level} level 
     */
    makeTerrain(level) {
        this.boardSize = level.boardSize;
        this.terrainMap = new TerrainMap(level, this.boardSize);
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @returns {[number, number]}
     */
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
            const t = this._terrainMap.atPos(x,y);
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
                let thex = this._terrainMap.atPos(x, y);
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

class ResourceWidget extends BoxLayout {
    /**
     * 
     * @param {string} imageId 
     * @param {number} amount
     * @param {number|null} production
     * @param {boolean} exhausts
     * @param {Object<ResourceType,number>} consumes
     */
    constructor(imageId, amount, production, exhausts, consumes) {
        super();
        this.exhaustsOnProduce = exhausts;
        this.consumesOnProduce = consumes;
        this.labelAmount = new Label({hints:{w:0.25, center_y:0.5}, sizeGroup:'resources', valign:'middle'}),
        this.labelProd = new Label({hints:{w:0.25, center_y:0.5, h:0.5}, sizeGroup:'resources', valign:'middle'}),
        this.amount = amount;
        this.production = production;
        this.children = [
            this.labelAmount,
            new ImageWidget({src:imageId}),
            this.labelProd
        ]
        this.updateProperties({orientation:'horizontal'});
    }
    on_amount(e,o,v) {
        this.labelAmount.text = String(this.amount);
    }
    on_production(e,o,v) {
        this.labelProd.text = this.production!==null?'+'+String(this.production):'';
    }
}

class ResourceTracker extends BoxLayout {
    constructor(props={}) {
        super();
        /**@type {Object<ResourceType, ResourceWidget>} */
        this._rmap = {
            'rf': new ResourceWidget(urlResourceFood, 0, 0, true, {}),
            'rw': new ResourceWidget(urlResourceWorker, 0, 0, true, {'rf':1}),
            'rm': new ResourceWidget(urlResourceMoney, 0, 0, false, {'rw':1}),
        };
        this.children = [
            this._rmap['rf'],
            this._rmap['rw'],
            this._rmap['rm'],
        ];
        this.updateProperties(props);
    }
    /**
     * 
     * @param {ResourceType} resourceId 
     * @returns {ResourceWidget}
     */
    get(resourceId) {
        return this._rmap[resourceId];
    }
    /**
     * 
     * @param {TileType} tileType 
     * @returns 
     */
    hasResources(tileType) {
        let tile = new tileClasses[tileType]();
        for(let r in tile.cost) {
            const rw = this.get(/**@type {ResourceType}*/(r));
            if(rw.amount<tile.cost[r]) return false;
        }
        return true;
    }
    /**
     * 
     * @param {TileType} tileType 
     * @returns 
     */
    spendResources(tileType) {
        if(this.hasResources(tileType)) {
            let tile = new tileClasses[tileType]();
            for(let r in tile.cost) {
                const rw = this.get(/**@type {ResourceType}*/(r));
                rw.amount -= tile.cost[r];
            }
            return true;
        }
        return false;
    }
    produceResources() {
        for(let r in this._rmap) {
            const cons = this._rmap[r].consumesOnProduce
            let hasEnoughResources = true;
            let maxProd = this._rmap[r].production
            for(let c in cons) {
                maxProd = Math.min(maxProd, Math.floor(this._rmap[c].amount/cons[c]))
            }
            for(let c in cons) {
                this._rmap[c].amount -= maxProd*cons[c];
            }
            if(this._rmap[r].exhaustsOnProduce) {
                this._rmap[r].amount = maxProd;
            } else {
                this._rmap[r].amount += maxProd;
            }
        }
    }
    clearResources() {
        for(let r in this._rmap) {
            this._rmap[r].amount = 0;
        }
    }
}

class LabeledIcon extends BoxLayout {
    /**
     * 
     * @param {string} text 
     * @param {string} iconSrc
     */
    constructor(text, iconSrc) {
        super();
        this.children = [
            new Label({text:text, hints:{w:null}}),
            new ImageWidget({src:iconSrc})
        ];
        console.log(text, iconSrc);
        this.updateProperties({orientation:'horizontal'});
    }    
}

// class BuildAction extends BoxLayout {
//     code = /**@type {TileType}*/('F');
//     /**
//      * 
//      * @param {TileType} tileClass 
//      */
//     constructor(tileClass) {
//         super();
//         this.code = tileClass;
//         /**@type {Tile} */
//         this.tile = new tileClasses[tileClass]({hints:{h:0.66}});
//         this.box = new BoxLayout({orientation:'horizontal'})
//         /**@type {Widget[]} */
//         this.children = [
//             this.tile,
//         ];
//         for(let r in this.tile.cost) {
//             this.box.addChild(new LabeledIcon(String(this.tile.cost[r]), String(gameImages[r])))
//         }
//         this.updateProperties({orientation:'vertical'});
//         this.active = false;
//     }
//     on_active() {
//         if(this.active && this.children.indexOf(this.box)<0) {
//             this.addChild(this.box);
//             this.bgColor = 'green';
//         }
//         else if(this.children.indexOf(this.box)>=0) {
//             this.removeChild(this.box);
//             this.bgColor = 'gray';
//         }
//     }
// }

class ActionBar extends BoxLayout {
    /**@type {Tile|null} */
    selectedTile = null;
    constructor(props = {}) {
        super();
        this.updateProperties(props);
    }
    on_child_removed(e, o, c) {
        if(c instanceof Tile) {
            c.selected = false;
            if(this.selectedTile === c) {
                this.selectedTile = null;
            }
        }

    }
    on_child_added(e, o, c) {
        if(c instanceof Tile) {
            c.bind('touch_down', (e,o,v)=>{
                if(/**@type {Widget}*/(o).collide(v.rect)) {
                    for(let c of this.children) /**@type {Tile}*/(c).selected=false;
                    if(this.selectedTile===o) {
                        this.selectedTile=null;
                        /**@type {Tile}*/(o).selected = false;
                    } else if(this.children.length>3){
                        this.selectedTile=/**@type {Tile}*/(o);
                        /**@type {Tile}*/(o).selected = true;
                    }
                } ;
            });    
        }
    }
}


class GameScreen extends Widget {
    constructor() {
        super();
        this.activePlayer = 0;
        /**@type {Player[]} */
        this.players = [];
        /**@type {Level|null} */
        this.level = null;
        this.gameOver = false;
        /**@type {Tile[]} */
        this.tileStack  = [];

        /**@type {[number, number]} */
        this.selectPos = [0,0];

        this.board = new Board({hints:{x:0,y:0,w:1,h:1}});
        this.addChild(this.board);
        this.placementLayer = new Widget({hints:{x:0,y:0,w:1,h:1}});
        this.addChild(this.placementLayer);
        this.resourceTracker = new ResourceTracker({orientation:'vertical', hints:{right:1, y:0.2, w:0.1, h:0.6}});
        this.addChild(this.resourceTracker);
        this.scoreboard = new BoxLayout({align:'right', hints:{right:0.99, y:0.01, w:1, h:0.05}});
        this.addChild(this.scoreboard);
        this.wStateLabel = new Label({text: '', color: 'white', align: 'left', hints: {x: 0.01, y: 0.01, w:1, h:0.05}});
        this.addChild(this.wStateLabel);
        this.actionBar = new ActionBar({hints:{x:0,y:0.07,w:'0.14wh',h:0.84}, bgColor:'gray', outlineColor:'white'});
        this.addChild(this.actionBar);
        this.actionBar.bind('selectedTile', (e,o,v)=>this.selectTile(e,o,v));
        this.nextButton = new Button({text: 'End turn', alight:'right', 
            hints:{right:0.99, bottom:0.99, w:0.1, h:0.05},
            on_press: (e,o,v)=>this.nextTurn()});
        this.addChild(this.nextButton);
    }
    nextTurn() {
        const sm = this.players[this.activePlayer].scoreMarker;
        if(sm.turn>1) {
            sm.turn--;
            this.resourceTracker.produceResources();
            sm.score = this.resourceTracker.get('rm').amount;
            this.actionBar.children = [new Farm(), new Village(), new Mine(), new Abbey(), new Tradeship(), new Castle()];
            if(sm.turn==1) {
                this.nextButton.text = 'End game';
            }
        } else if(sm.turn===1) {
            sm.turn = 0;
            this.resourceTracker.produceResources();
            sm.score = this.resourceTracker.get('rm').amount;
            this.actionBar.children = [];
            this.nextButton.disable = true;
            this.gameOver = true;
        }
    }
    /**
     * @param {TerrainHex|null} terrain 
     */
    updateScores(terrain = null) {
        if (terrain !== null) {
            this.updateResourceProduction();
        }
        for (let p of this.players) {
            // let score = 0;
            // for (let pt of p.placedTiles) {
            //     score += pt.score;
            // }
            p.scoreMarker.score = this.resourceTracker.get('rm').amount;
        }
    }
    
    /**
     * 
     * @param {TerrainHex} thex 
     * @param {Tile} tile 
     * @param {boolean} serverCheck 
     * @returns 
     */
    placeTile(thex, tile, advanceTurn = true, serverCheck = true) {
        const hexPos = thex.hexPos;
        const t = this.board.terrainMap.atPos(...hexPos);
        if (t===undefined || t.tile !== null) {
            return;
        }
        if(tile.placeTerrain[t.code]===null) return;
        const player = this.players[this.activePlayer];
        /**@type {[number, number]|null} */
        const center = advanceTurn ? [thex.center_x, thex.center_y] : null;
        tile.place(hexPos, center, player, this.board);
        player.placedTiles.push(tile);
        thex.tile = tile;
        this.updateScores(thex);
        if(advanceTurn) {
            this.clearPlacementTargets();
            this.nextPlayer();    
        }
    }

    /**
     * 
     * @param {TerrainHex} terrain 
     * @param {Touch} touch 
     * @returns 
     */
    onTouchDownTerrain(terrain, touch) {
        if (this.gameOver) return true;
        if (this.actionBar.selectedTile === null) return true;
        const player = this.players[this.activePlayer];
        if (!player.localControl) return true;
        if (!this.canReach(player, terrain)) return true;
        // if (!this.resourceTracker.hasResources(this.actionBar.selectedTile.code)) return true;
        const tile = this.actionBar.selectedTile;
        this.actionBar.removeChild(tile);
        return this.placeTile(terrain, tile);
    }

    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex} terrain 
     * @returns 
     */
    canReach(player, terrain) {
        /**@type {Set<TerrainHex>} */ 
        const traversed=new Set();
        /**
         * 
         * @param {TerrainHex} terrain 
         * @param {Board} board 
         * @returns 
         */
        function walk(terrain, board) {
            traversed.add(terrain);
            if (player.placedTiles.length > 0) {
                for (let t of board.neighborIter(terrain.hexPos)) {
                    if (t.tile && player.placedTiles.includes(t.tile)) {
                        return true;
                    }
                    if (t instanceof Water && t.patrolled && !traversed.has(t)) {
                        if(walk(t, board)) return true;
                    }
                }
            }
            return false;
        }
        return walk(terrain, this.board);
    }

    // /**
    //  * 



    
    //  * @param {Tile} tile 
    //  * @param {Touch} touch 
    //  * @returns 
    //  */
    // onTouchDownTile(tile, touch) {
    //     if (this.gameOver) return true;
    //     if (tile.hexPos[0] !== -1 && tile.hexPos[1] !== -1) return false;
    //     const p = this.players[this.activePlayer];
    //     if (!p.localControl) return true;
    //     else {
    //         this.wStateLabel.text = 'Place tile';
    //         this.wStateLabel.color = p.color; // colorAverage([1,1,1,1], p.color);
    //         this.setPlacementTargets(tile);
    //     }
    //     return this.selectTile(tile);
    // }

    /**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
    selectTile(e, o, v) {
        if(this.actionBar.children.length>3) {
            if(v) {
                this.wStateLabel.text = 'Place '+v.code;
                this.setPlacementTargets(v.code);
            } else {
                this.wStateLabel.text = 'Select tile';
                this.clearPlacementTargets();
            }    
        } else {
            this.wStateLabel.text = 'End turn';
            this.clearPlacementTargets();
        }
    }

    updateResourceProduction() {
        const player = this.players[this.activePlayer];
        if(!player) return;
        /**@type {Production} */
        let totalProd = Production.from({
            'rf':0,
            'rw':0,
            'rm':0,
        });
        for(let tile of player.placedTiles) {
            totalProd = totalProd.add(tile.production(this.board, tile.hexPos));
        }
        for(let res of totalProd.keys()) {
            this.resourceTracker.get(res).production = totalProd.get(res)??0;
        }
    }

    /**
     * @param {TileType} tileType */
    setPlacementTargets(tileType) {
        const tile = new tileClasses[tileType]();
        this.clearPlacementTargets();
        let player = this.players[this.activePlayer];
        if(!this.board.terrainMap) return;
        let targets = [];
        for(let thex of this.board.terrainMap.iter()) {
            if(thex.tile!==null) continue;
            if(!this.canReach(player, thex)) continue;
            if(tile.placeTerrain[thex.code]===null) continue;
            let prod = tile.production(this.board, thex.hexPos);
            let value = 0
            for(let res of prod.keys()) {
                value+=prod.get(res)??0;
            }
            let tt = new TargetTile({
                w: this.board.hexSide * 2,
                h: this.board.hexSide * 2,
                score: value,
                hexPos: thex.hexPos.slice(),
            })
            let xy = this.board.pixelPos(thex.hexPos)
            tt.center_x = xy[0];
            tt.center_y = xy[1];
            targets.push(tt);

        }
        this.placementLayer.children = targets;
    }

    clearPlacementTargets() {
        this.placementLayer.children = [];
    }

    removePlayers() {
        this.activePlayer = 0;
        for (let p of this.players) {
            p.delete();
        }
        this.players = [];
    }

    clearLevel() {
        this.board.makeTerrain(levels[0]);
        // for (let st of this.selectableTiles) {
        //     this.removeChild(st);
        // }
        // this.selectableTiles = [];
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
        if(!p) return; //throw new Error("No active player found");

        this.tileStack = [...this.level.tileSet].map(t => new tileClasses[t]());
        this.tileStack.sort(() => Math.random() - 0.5);
        let startTile = new tileClasses[this.level.startTile]();
        // startTile.hexPos = this.level.start;

        if(this.board.terrainMap && this.level) {
            let terr = this.board.terrainMap.atPos(this.level.start[0], this.level.start[1]);
            p.placedTiles.push(startTile);
            if(terr) this.placeTile(terr, startTile, false)
        }

        this.actionBar.addChild(new Farm());
        this.actionBar.addChild(new Village());
        this.actionBar.addChild(new Mine());
        this.actionBar.addChild(new Abbey());
        this.actionBar.addChild(new Tradeship());
        this.actionBar.addChild(new Castle());

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

        for (let p of playerSpec) {
            if (p.type === 0) { // human
                this.players.push(new Player(p.name, p.color, this));
            }
        }
        this.setupLevel(level);
        this.players[0].scoreMarker.turn = 10; //Math.ceil(this.tileStack.length/5);
    }

    startGame() {
        this.nextPlayer();
    }

    nextPlayer() {
        if (this.activePlayer >= 0) {
            this.players[this.activePlayer].endTurn();
        }
        this.activePlayer += 1;
        if (this.activePlayer >= this.players.length) {
            this.activePlayer = 0;
        }
        let p = this.players[this.activePlayer];
        p.startTurn();
        if (p.localControl) {
            if(this.actionBar.children.length>3) {
                this.wStateLabel.text = 'Select tile';
                this.wStateLabel.color = p.color;
            } else {
                this.wStateLabel.text = 'End turn';
                this.wStateLabel.color = p.color;
            }
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
        if(!t) return;
        this.actionBar.addChild(t);
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
            p.boardResize(this.board, hexSide);
        }    

        for (let tt of /**@type {TargetTile[]}*/(this.placementLayer.children)) {
            let hp = this.board.pixelPos(tt.hexPos);
            tt.w = hexSide * 2,
            tt.h = hexSide * 2,
            tt.center_x = hp[0];
            tt.center_y = hp[1];
        }

        this.applyHints(this.scoreboard);
        this.scoreboard.layoutChildren();

        this.applyHints(this.actionBar);
        this.actionBar.layoutChildren();

        this.applyHints(this.resourceTracker);
        this.resourceTracker.layoutChildren();

        this.applyHints(this.wStateLabel);
        this.wStateLabel.layoutChildren();

        this.applyHints(this.nextButton);
        this.nextButton.layoutChildren();

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
        this.turn = 10;
        this.activeTurn = false;
        /**@type {"left"|"center"|"right"}*/
        this.align = "right";
    }
    on_score(event, object, data) {
        this.updateStatus();
    }
    on_turn(event, object, date) {
        this.updateStatus();
    }
    updateStatus() {
        if(this.turn>1) {
            this.text = 'Turns left: '+Math.floor(this.turn) + ' -- Score: '+Math.floor(this.score);
        } else if(this.turn===1) {
            this.text = 'Last turn -- Score: '+Math.floor(this.score);
        } else {
            this.text = 'Game over -- Score: '+Math.floor(this.score);
        }
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
        /**@type {Tile[]} */
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
     * @param {Board} board 
     * @param {number} hexSide 
     */
    boardResize(board, hexSide) {
        for (let pt of this.placedTiles) {
            if(pt._animation) continue;
            pt.w = hexSide*2;
            pt.h = hexSide*2;
            [pt.center_x,pt.center_y] = board.pixelPos(pt.hexPos);    
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