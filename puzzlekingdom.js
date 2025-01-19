//@ts-check

import { App, Widget, ImageWidget, WidgetAnimation, Label, BoxLayout, Vec2, math, rand, Button, EventSink, vec2 } from '../eskv/lib/eskv.js'; //Import ESKV objects into an eskv namespace
import { colorString } from '../eskv/lib/modules/math.js';
import { Touch } from '../eskv/lib/modules/input.js';

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
import urlTerrainPlainLandscape from './tiles/terrain_plain_landscape.png';
//@ts-ignore
import urlTerrainForestLandscape from './tiles/terrain_forest_landscape.png';
//@ts-ignore
import urlTerrainMountainLandscape from './tiles/terrain_mountain_landscape.png';
//@ts-ignore
import urlTerrainWaterLandscape from './tiles/terrain_water_landscape.png';
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
import urlTileTradeship from './tiles/tile_port.png';
// //@ts-ignore
// import urlTileMarket from './tiles/tile_market.png';
//@ts-ignore
import urlTileRubble from './tiles/tile_rubble.png';
//@ts-ignore
import urlTileEnemyTent from './tiles/enemy_tent.png';
//@ts-ignore
import urlTileEnemyStronghold from './tiles/enemy_stronghold.png';
//@ts-ignore
import urlTileEnemyCastle from './tiles/enemy_castle.png';
//@ts-ignore
import urlTileEnemyDragon from './tiles/enemy_dragon.png';
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
import urlResourceOre from './tiles/resource_ore.png';
//@ts-ignore
import urlResourceTimber from './tiles/resource_timber.png';
//@ts-ignore
import urlResourceBlessing from './tiles/resource_blessing.png';
//@ts-ignore
import urlResourceSoldier from './tiles/resource_military.png';
//@ts-ignore
import urlResourceMoney from './tiles/resource_money.png';
//@ts-ignore
import urlResourceWorker from './tiles/resource_worker.png';
//@ts-ignore
import urlResourceInfluence from './tiles/resource_influence.png';


/**@type {Object<ResourceType|TerrainType|TileType|TerrainType, string>} */
const gameImages = {
    'p': urlTerrainPlain,
    'f': urlTerrainForest,
    'm': urlTerrainMountain,
    'w': urlTerrainWater,
    'pl': urlTerrainPlainLandscape,
    'fl': urlTerrainForestLandscape,
    'ml': urlTerrainMountainLandscape,
    'wl': urlTerrainWaterLandscape,
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
    // 'K': urlTileMarket,
    'X': urlTileRubble,
    'ET': urlTileEnemyTent,
    'ES': urlTileEnemyStronghold,
    'EC': urlTileEnemyCastle,
    'ED': urlTileEnemyDragon,
    'rw': urlResourceWorker,
    'rf': urlResourceFood,
    'rt': urlResourceTimber,
    'ro': urlResourceOre,
    'rb': urlResourceBlessing,
    'rs': urlResourceSoldier,
    'rm': urlResourceMoney,
    'ri': urlResourceInfluence,
};

/**@typedef {'p'|'f'|'m'|'w'} TerrainType */
/**@typedef {'rf'|'rw'|'rm'|'rs'|'rt'|'ro'|'rb'|'ri'} ResourceType */
/**@typedef {'C'|'V'|'A'|'F'|'M'|'S'|'T'|'X'} TileType */
/**@typedef {'ET'|'ES'|'EC'|'ED'} EnemyTileType */
/**@typedef {{[id in ResourceType]?:number}} ProductionQuantityObj */
/**@typedef {ProductionQuantity|ProductionQuantityObj} ProductionQuantityLike */
/**@typedef {{[id in ResourceType]?:Tile[]}} ProductionChainObj */
/**@typedef {ProductionChain|ProductionChainObj} ProductionChainLike */

/**@type {{[id in TerrainType]:string}} */
const terrainNames = {
    p: 'plain',
    f: 'forest',
    m: 'mountain',
    w: 'water',
}

/**@type {{[id in TileType|EnemyTileType]:string}} */
const tileNames = {
    C: 'castle',
    V: 'village',
    A: 'abbey',
    F: 'farm',
    M: 'mine',
    S: 'stronghold',
    // K: 'market',
    T: 'tradeship',
    X: 'rubble',
    ET: 'enemy tent',
    ES: 'enemy stronghold',
    EC: 'enemy castle',
    ED: 'enemy dragon',
}

const tileDescriptions = {
    C: 'A castle produces influence once supplied with workers, food, and blessings. Every structure adjacent to a castle has a production link to all of the other adjacent structures. Once active, castles connect their production links to the links of any other castles in range 3.',
    V: 'A village produces workers once provided with food.',
    A: 'An abbey produces blessings once supplied with food and workers. Blessings make other structures more effective producers.',
    F: 'A farm produces food once supplied with workers.',
    M: 'A mine produces ore once supplied with workers.',
    S: 'A stronghold produces military strength once supplied with workers and ore. At the end of each turn, units from active strongholds will attack enemies that they connect their resources to.',
    T: 'A tradeship produces money once supplied with workers. Tradeships extend the accessible terrain of your empire to all terrain accessible from water in range 3 of the tradeship. Once active, tradeships allow production links between all structures within reach of the Tradeship.',
    X: 'Rubble is the remains of a structure or enemy that you can build over.',
    ET: 'An enemy tent is a temporary installation that expands enemy reach but does not attack.',
    ES: 'An enemy stronghold expands the enemies reach and will attack adjacent structures at the end of each turn.',
    EC: 'enemy castle',
    ED: 'An enemy dragon lives in mountains and will attack structures in range 2 at the end of each turn.',
}

/**@type {{[id in ResourceType]:string}} */
const resourceNames = {
    rf: 'food',
    rw: 'wood',
    rm: 'money',
    rs: 'military strength',
    rt: 'timber',
    ro: 'ore',
    rb: 'blessings',
    ri: 'influence'
};

/**@type {Object<TileType|EnemyTileType, number>}} */
const tilePriority = {
    'ET': 11,
    'ED': 10,
    'ES': 9,
    'EC': 8,
    'R': 7,
    'C': 6,
    'T': 5,
    'A': 4,
    'S': 3,
    'M': 2,
    'V': 1,
    'F': 0,
}


/**
 * @extends {Map<ResourceType, Tile[]>}
 */
class ProductionChain extends Map {
    /**
     * 
     * @param {ProductionChainLike} obj 
     */
    static from(obj) {
        const prod = new ProductionChain();
        if (obj instanceof ProductionChain) {
            for (let r of obj.keys()) {
                const tiles = obj.get(r);
                if (tiles !== undefined) prod.set(r, [...tiles]);
            }
        } else {
            for (let r in obj) {
                prod.set(/**@type {ResourceType}*/(r), [...obj[r]]);
            }
        }
        return prod;
    }
    /**
     * 
     * @param {ResourceType} resource 
     * @param {Tile} connection 
     */
    addResource(resource, connection) {
        if (this.has(resource)) {
            this.get(resource)?.push(connection);
        } else {
            this.set(resource, [connection]);
        }
    }
    /**
     * 
     * @param {ProductionQuantity} quantity 
     */
    meets(quantity) {
        for (let r of quantity.keys()) {
            const q = quantity.get(r);
            if (q !== undefined && q !== 0 && this.get(r)?.length !== q) return false;
        }
        return true;
    }
}

/**
 * @extends {Map<ResourceType, number>}
 */
class ProductionQuantity extends Map {
    /**
     * 
     * @param {ProductionQuantityLike} obj 
     */
    static from(obj) {
        const prod = new ProductionQuantity();
        if (obj instanceof ProductionQuantity) {
            for (let r of obj.keys()) {
                const q = obj.get(r);
                if (q !== undefined) prod.set(r, q);
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
     * @param {ProductionQuantityLike} prodLike 
     */
    add(prodLike) {
        let prod0 = ProductionQuantity.from(this);
        let prod1 = ProductionQuantity.from(prodLike);
        for (let r of prod1.keys()) {
            prod0.set(r, (prod0.get(r) ?? 0) + (prod1.get(r) ?? 0));
        }
        return prod0;
    }
    /**
     * 
     * @param {ProductionQuantityLike} prodLike 
     */
    subtract(prodLike) {
        let prod0 = ProductionQuantity.from(this);
        let prod1 = ProductionQuantity.from(prodLike);
        for (let r of prod1.keys()) {
            prod0.set(r, (prod0.get(r) ?? 0) - (prod1.get(r) ?? 0));
        }
        return prod0;
    }
    /**
     * 
     * @param {ResourceType} resource 
     * @param {number} amount 
     */
    addResource(resource, amount) {
        const current = this.get(resource)
        if (current !== undefined) {
            this.set(resource, current + amount)
        } else {
            this.set(resource, amount)
        }
    }
}

class Level {
    constructor() {
        this.levelSeed = null;
        this.tileSet = 'CCVVVVVVVVVPPKKMAAAAAFFFFFSS';
        this.map = ``;
        this.boardSize = 0;
        this.start = [4, 4];
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
        this.tileSet = 'CCVVVVVVVVVPPKKMAAAAAFFFFFSS';
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
        this.tileSet = 'CCVVVVVVVVVPPKKMAAAAAFFFFFSS';
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
    constructor(stringMap, size = 9) {
        super();
        this.mapSize = size;
        let r = 0;
        for (let row of stringMap.trim().split('\n')) {
            let c = 0;
            for (let t of row.trim()) {
                this.set(r * size + c, t);
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
            return this.get(hexPos[1] * this.mapSize + hexPos[0]);
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
        this.set(hexPos[1] * this.mapSize + hexPos[0], value);
    }
    get hexCount() {
        return 3 * this.mapSize * (this.mapSize - 1) + 1
    }
    toString() {
        let str = '';
        const w = Math.floor(this.mapSize / 2);
        for (let r = 0; r < this.mapSize; r++) {
            const width = this.mapSize - Math.abs(w - r);
            for (let c = 0; c < width; c++) {
                str += this.get(r * this.mapSize + c);
            }
            str += '\n';
        }
        return str;
    }
    *iter() {
        const w = Math.floor(this.mapSize / 2);
        for (let r = 0; r < this.mapSize; r++) {
            const width = this.mapSize - Math.abs(w - r);
            for (let c = 0; c < width; c++) {
                yield this.get(r * this.mapSize + c);
            }
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @returns {Generator<[number, number]>}
     */
    *neighborPositions(hexPos) {
        const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2) ? 1 : 0;
        const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2) ? 1 : 0;
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
            if (this.has(y * this.mapSize + x)) yield [x, y];
        }
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @returns {Generator<string|undefined>}
     */
    *neighborIter(hexPos) {
        const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2) ? 1 : 0;
        const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2) ? 1 : 0;
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
            const t = this.at([x, y]);
            if (t) yield t;
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
        return this.getNeighborCount(hexPos) < 6;
    }
    /**
     * 
     * @returns {[number,number]}
     */
    getRandomPos() {
        let y = rand.getRandomInt(this.mapSize);
        let w = Math.floor(this.mapSize / 2);
        let width = this.mapSize - Math.abs(w - y);
        let x = rand.getRandomInt(width);
        return [x, y];
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
        this.tileSet = 'CCVVVVVVVVVPPKKMAAAAAFFFFFSS';
        let mapString = '';
        const w = Math.floor(size / 2);
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size - Math.abs(w - r); c++) {
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
        const basePlacementSet = ['p', 'p', 'p', 'f', 'f', 'm', 'm', 'w'];
        /**
         * 
         * @param {[number, number]} position 
         */
        function recursePlacement(position) {
            const adjacencies = [...tmap.neighborIter(position)];
            const countWater = adjacencies.reduce((prev, cur) => cur === 'w' ? prev + 1 : prev, 0);
            const extras = adjacencies.filter((val) => val !== 'w');
            const atEdge = tmap.hasEdge(position);
            let placements = [...basePlacementSet, ...extras, ...extras];
            if (countWater === 1 && !atEdge) placements = ['w'];
            const terrain = rand.choose(placements);
            tmap.put(position, terrain);
            for (let hp of rand.shuffle([...tmap.neighborPositions(position)])) {
                if (tmap.at(hp) === 'x') recursePlacement(hp);
            }
        }
        recursePlacement(startPos);
        const startTerrain = tmap.at(startPos);
        const basicTiles = ['C', 'V', 'A', 'F', 'S'];
        this.startTile = startTerrain === 'w' ? 'T' :
            startTerrain === 'm' ? 'M' :
                rand.choose(basicTiles);
        let tileSet = 'CCVVVVVVVVAAAAFFFFS';
        const mountainCount = [...tmap.iter()].reduce((prev, cur) => cur === 'm' ? prev + 1 : prev, 0);
        const waterCount = [...tmap.iter()].reduce((prev, cur) => cur === 'w' ? prev + 1 : prev, 0);
        if (mountainCount > 0 && this.startTile != 'M') tileSet += 'M';
        else tileSet += rand.choose(basicTiles)
        if (mountainCount > 2) tileSet += 'M';
        else tileSet += rand.choose(basicTiles)
        if (mountainCount > 5) tileSet += 'M';
        else tileSet += rand.choose(basicTiles)

        if (waterCount > 0 && this.startTile !== 'T') tileSet += 'M';
        else tileSet += rand.choose(basicTiles)
        if (waterCount > 2) tileSet += 'T';
        else tileSet += rand.choose(basicTiles)
        if (waterCount > 5) tileSet += 'T';
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
    value = 0;
    selected = false;
    /**@type {[number, number]} */
    hexPos = [-1, -1];
    tileColor = 'blue';
    textColor = 'white';
    prodBonus = 0;
    showResourceStatus = true;
    score = 0;
    damaged = false;
    /**@type {Object<TerrainType, number|null>} */
    terrainPlacement = {};
    productionFilled = ProductionChain.from({});
    needsFilled = ProductionChain.from({});
    constructor() {
        super({});
        /**@type {Label|null} */
        this.wLabel = null;
        this.iconBox = new BoxLayout({ orientation: "horizontal", hints: { w: 1, h: 0.4, x: 0, y: 0 } })
        this.addChild(this.iconBox);
    }
    get productionCapacity() {
        return ProductionQuantity.from({});
    }
    get needs() {
        return ProductionQuantity.from({});
    }

    /**
     * 
     * @param {TerrainHex} terr 
     * @param {[number, number]|null} centerPos 
     * @param {Player} player 
     * @param {Board} board;
     */
    place(terr, centerPos, player, board) {
        this.hexPos = [terr.hexPos[0], terr.hexPos[1]];
        this.prodBonus = this.terrainPlacement[terr.code] ?? 0;
        if (centerPos !== null) {
            let a = new WidgetAnimation();
            this.w = 0.01;
            this.h = 0.01;
            this.center_x = centerPos[0];
            this.center_y = centerPos[1];
            // this.hints = {center_x: centerPos[0], center_y:centerPos[1]};
            a.add({
                w: board.hexHeight, h: board.hexHeight,
                center_x: centerPos[0], center_y: centerPos[1]
            }, 100);
            a.start(this);
        }
    }

    /**
     * 
     * @param {string} event 
     * @param {ImageWidget} object 
     * @param {boolean} value 
     * @returns 
     */
    on_selected(event, object, value) {
        let parent = this.parent;
        this.bgColor = value ? 'green' : null;
        if (!(parent instanceof GameScreen)) return;
        if (value) {
            let a = new WidgetAnimation();
            a.add({ x: parent.selectPos[0], y: parent.selectPos[1] }, 100);
            a.start(this);
        }
    }

    /**@type {ImageWidget['_draw']} */
    _draw(app, ctx, millis) {
        if (this.showResourceStatus) {
            super._draw(app, ctx, millis);
        } else {
            this.draw(app, ctx);
        }
    }

    updateResourceStatusIcons() {
        //TODO: Staggered stack multiple items (like a card deck) instead of shrinking them
        // requiring a click to see what is missing.
        this.iconBox.children = [];
        let iconsToAdd = [];
        let needsFilled = true;
        for (let n of this.needs.keys()) {
            const minAmt = this.needs.get(n)
            if (minAmt !== undefined && minAmt > 0 && this.needsFilled.get(n)?.length !== minAmt) {
                const icon = new ImageWidget({
                    src: gameImages[n],
                    hints: { h: 0.5, w: '1wh' },
                    bgColor: 'rgba(90,0,0,0.6)',
                    outlineColor: 'rgb(90,0,0)',
                });
                iconsToAdd.push(icon);
                needsFilled = false;
            }
        }
        if (needsFilled) {
            for (let n of this.productionCapacity.keys()) {
                const color = this.productionFilled.get(n) !== this.productionCapacity.get(n) ?
                    'rgba(0,80,0,0.6)' : 'rgba(0,0,60,0.6)';
                const outline = this.productionFilled.get(n) !== this.productionCapacity.get(n) ?
                    'rgb(0,80,0)' : 'rgb(0,0,60)';
                const connectedTiles = this.productionFilled.get(n);
                if (connectedTiles === undefined || connectedTiles.length !== this.productionCapacity.get(n)) {
                    const icon = new ImageWidget({
                        src: gameImages[n],
                        hints: { h: 0.5, w: '1wh' },
                        bgColor: color,
                        outlineColor: outline,
                    })
                    iconsToAdd.push(icon)
                }
            }
        }
        const size = iconsToAdd.length;
        for (let i of iconsToAdd) {
            i.hints['h'] = size===1? 0.7 : 0.7 / (size-1);
        }
        this.iconBox.children = iconsToAdd;
    }
}

/**
 * 
 * @param {Board} board 
 * @param {[number, number]} hexPos 
 */
function blessed(board, hexPos) {
    for (let t of board.neighborIter(hexPos)) {
        if (t.tile instanceof Abbey) {
            return 1;
        }
    }
    return 0;
}

class Rubble extends Tile {
    code = /**@type {TileType} */('X');
    name = 'Rubble';
    terrainPlacement = { 'p': 0, 'f': 0, 'm': 0, 'w': null };
    tileColor = 'gray';
    textColor = 'white';
    constructor(props = {}) {
        super();
        this.src = gameImages['X'];
        this.updateProperties(props);
    }
}

class Castle extends Tile {
    code = /**@type {TileType} */('C');
    name = 'Castle';
    terrainPlacement = { 'p': 0, 'f': 0, 'm': 0, 'w': null };
    tileColor = 'purple';
    textColor = 'white';
    network = /**@type {Set<TerrainHex>}*/(new Set());
    constructor(props = {}) {
        super();
        this.src = gameImages['C'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'ri': 1 + this.prodBonus});
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1, 'rf': 1, 'rb': 1 });
    }
    /** @type {Tile['place']} */
    place(terr, centerPos, player, board) {
        super.place(terr, centerPos, player, board);
        this.network = new Set();
        this.updateNetwork(terr, board, 3, this.network, new Set());
    }
    /**
     * 
     * @param {Board} board 
     * @param {TerrainHex} terr 
     * @param {number} range 
     * @param {Set<TerrainHex>} network 
     * @param {Set<TerrainHex>} visited 
     */
    updateNetwork(terr, board, range, network = new Set(), visited = new Set()) {
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!(t instanceof Water) && !(visited.has(t))) {
                if (t.tile instanceof Castle) {
                    network.add(t);
                }
                visited.add(t);
                if (range > 1) this.updateNetwork(t, board, range - 1, network, visited);
            }
        }
    }
}

class Village extends Tile {
    code = /**@type {TileType}*/('V');
    name = 'Village';
    terrainPlacement = { 'p': 1, 'f': 1, 'm': 0, 'w': null };
    tileColor = 'yellow';
    textColor = 'white';
    constructor(props = {}) {
        super();
        this.src = gameImages['V'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        const blessed = this.needsFilled.get('rb') ? 2 : 1;
        return ProductionQuantity.from({ 'rw': 2 * blessed + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'rf': 1, 'rb': 0 });
    }
}

class Stronghold extends Tile {
    code = /**@type {TileType}*/('S');
    name = 'Stronghold';
    terrainPlacement = { 'p': 1, 'f': 0, 'm': 1, 'w': null };
    tileColor = 'red';
    textColor = 'white';
    constructor(props = {}) {
        super();
        /**@type {TileType} */
        this.src = gameImages['S'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'rs': 1 + this.prodBonus});
    }
    get needs() {
        return ProductionQuantity.from({ 'ro': 1, 'rw': 1 });
    }
}

class Mine extends Tile {
    code = /**@type {TileType}*/('M');
    name = 'Mine';
    terrainPlacement = { 'p': 1, 'f': 0, 'm': 2, 'w': null };
    tileColor = 'grey';
    textColor = 'white';
    constructor(props = {}) {
        super();
        this.src = gameImages['M'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'ro': 1 + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1 });
    }
}


class Tradeship extends Tile {
    code = /**@type {TileType}*/('T');
    name = 'Tradeship';
    terrainPlacement = { 'p': null, 'f': null, 'm': null, 'w': 0 };
    tileColor = colorString([0.4, 0.2, 0.2, 1.0]);
    textColor = 'white';
    ports = /**@type {Set<TerrainHex>} */(new Set());
    constructor(props = {}) {
        super();
        this.src = gameImages['T'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'rm': 1 + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1 });
    }
    /** @type {Tile['place']} */
    place(terr, centerPos, player, board) {
        super.place(terr, centerPos, player, board);
        this.ports = new Set([terr]);
        this.updatePorts(terr, board, 3, this.ports, new Set([terr]));
    }
    /**
     * 
     * @param {Board} board 
     * @param {TerrainHex} terr
     * @param {number} range 
     * @param {Set<TerrainHex>} ports 
     * @param {Set<TerrainHex>} visited 
     */
    updatePorts(terr, board, range, ports, visited) {
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!visited.has(t)) {
                visited.add(t);
                ports.add(t);
                if (t instanceof Water) {
                    if (range > 1) this.updatePorts(t, board, range - 1, ports, visited);
                }
            }
        }
    }
}

class Abbey extends Tile {
    code = /**@type {TileType}*/('A');
    name = 'Abbey';
    terrainPlacement = { 'p': 0, 'f': 1, 'm': 2, 'w': null };
    tileColor = colorString([0.7, 0.4, 0.4, 1.0]);
    textColor = 'white';
    constructor(props = {}) {
        super();
        this.src = gameImages['A'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'rb': 3 + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1, 'rf': 1 });
    }
}

class Farm extends Tile {
    code = /**@type {TileType}*/('F');
    name = 'Farm';
    terrainPlacement = { 'p': 1, 'f': 0, 'm': null, 'w': null };
    tileColor = colorString([0.2, 0.5, 0.2, 1.0]);
    textColor = 'white';
    constructor(props = {}) {
        super();
        this.src = gameImages['F'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        const blessed = this.needsFilled.get('rb') ? 2 : 1;
        if (this.parent instanceof Forest) {
            return ProductionQuantity.from({ 'rf': 1 * blessed + this.prodBonus, 'rt': 2 * blessed});
        } else {
            return ProductionQuantity.from({ 'rf': 1 * blessed + this.prodBonus });
        }
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1, 'rb': 0 });
    }
}

class EnemyStronghold extends Tile {
    code = /**@type {TileType}*/('ES');
    name = 'Enemy Stronghold';
    terrainPlacement = { 'p': 1, 'f': 1, 'm': 1, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 1;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyStronghold;
        this.updateProperties(props);
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
}

class EnemyDragon extends Tile {
    code = /**@type {TileType}*/('ED');
    name = 'Enemy Dragon';
    terrainPlacement = { 'p': null, 'f': null, 'm': 2, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 2;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyDragon;
        this.updateProperties(props);
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
}

class TargetTile extends Label {
    score = 0;
    code = '*';
    /**@type {[number,number]} */
    hexPos = [0, 0];
    constructor(props) {
        super();
        this.updateProperties(props)
        const score = this.score;
        this.text = score == 0 ? '--' :
            score > 0 ? '+' + score :
                '' + score;
        this.color = 'rgba(20,20,20,0.8)';
        this.color = this.score > 0 ? 'rgba(60,40,0,0.85)' :
            this.score === 0 ? 'rgba(20,20,20,0.85)' :
                'rgba(72,32,29,0.85)';
    }
    draw(app, ctx) {
        ctx.beginPath();
        ctx.arc(this.center_x, this.center_y, this.w / 3, 0, 2 * Math.PI);
        ctx.fillStyle = this.score >= 0 ? 'rgba(255,240,0,0.5)' :
            // this.score === 0 ? 'rgba(100,100,100,0.5)' :
                'rgba(168,72,65,0.75)';
        ctx.strokeStyle = 'rgba(80,80,80,0.5)';
        ctx.lineWidth = this.w / 10;
        ctx.stroke();
        ctx.fill();
        super.draw(app, ctx);
    }
}

/**@type {Object<TileType, Tile>}} */
const playerTileClasses = {
    'C': Castle,
    'V': Village,
    'S': Stronghold,
    'M': Mine,
    'T': Tradeship,
    'A': Abbey,
    'F': Farm,
    'R': Rubble,
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
    /**@type {"vertical"|"horizontal"} */
    orientation = "vertical";

    constructor(props = null) {
        super({});
        if (props !== null) {
            this.updateProperties(props);
        }
        this.tile = null;
        this.allowStretch = true;
    }

    on_orientation(object, event, value) {
        if (this.orientation === "vertical") {
            this.src = gameImages[this.code]
        } else {
            this.src = gameImages[this.code + "l"];
        }
    }

    on_code(object, event, value) {
        if (this.orientation === "vertical") {
            this.src = gameImages[this.code]
        } else {
            this.src = gameImages[this.code + "l"];
        }
    }

    /**@type {[number, number]} */
    get hexPos() {
        return [this.hexPosX, this.hexPosY];
    }

    set hexPos(pos) {
        [this.hexPosX, this.hexPosY] = pos;
    }

    on_tile(e, o, v) {
        if (this.tile) {
            this.children = [this.tile];
        } else {
            this.children = [];
        }
    }

    on_touch_down(event, object, touch) {
        if (this.collideRadius(touch.rect, this.w * 0.43)) { //TODO: Scale it
            let gameScreen = this.parent?.parent;
            if (gameScreen instanceof GameScreen) {
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
        // this.src = gameImages['p'];
    }
}

class Forest extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'f';
        // this.src = gameImages['f']; 
    }
}

class Mountain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'm';
        // this.src = gameImages['m'];         
    }
}

class Water extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'w';
        // this.src = gameImages['w']; 
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
     * @param {"vertical"|"horizontal"} orientation
     */
    constructor(level, size, orientation) {
        super(); //total number of cells in the x direction
        for (let i = 0; i < size; ++i) {
            this.push([]);
        }
        this.size = size;
        let i = 0;
        let terrainmap;
        if (level === null) {
            terrainmap = new EmptyLevel().map.replace(/\n/g, '').replace(/ /g, '');
        } else {
            terrainmap = level.map.replace(/\n/g, '').replace(/ /g, '');
        }
        for (let x = 0; x < this.size; x++) {
            let yHeight = this.size - Math.abs((this.size - 1) / 2 - x);
            for (let y = 0; y < yHeight; y++) {
                let ht = new terrainClasses[terrainmap[i]]({ hexPos: [x, y] });
                ht.orientation = orientation;
                this[x].push(ht);
                i++;
            }
        }
    }
    /**
     * @yields {TerrainHex}
     */
    *iter() {
        for (let a of this) {
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
        } catch (error) {
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

class NetworkTileOverlay extends Widget {
    /**
     * 
     * @param {number} hexSide 
     * @param {[number, number]} hexPos 
     * @param {ResourceType|''} input 
     * @param {ResourceType|''} output 
     */
    constructor(hexSide, hexPos, input, output) {
        super();
        this.outlineColor = 'rgba(208, 212, 240,1)';        
        this.w = hexSide;
        this.h = hexSide;
        this.hexPos = hexPos.slice();
        this.updateProperties({});
        this.input = input;
        this.output = output;
    }
    on_input(event, object, value) {
        this.updateIO();
    }
    on_output(event, object, value) {
        this.updateIO();
    }
    updateIO() {
        if (this.input!=='' && this.output!=='') {
            this.children = [
                new ImageWidget({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x:0, y:0 }, bgColor:'rgba(100,100,192,0.7)'}),
                new ImageWidget({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right:1, bottom:1 }, bgColor:'rgba(192,100,100,0.7)'} )
            ];
        }
        else if (this.input!=='') {
            this.children = [
                new ImageWidget({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x:0, y:0 }, bgColor:'rgba(100,100,192,0.7)'}),
            ];
        }
        else if (this.output!=='') {
            this.children = [
                new ImageWidget({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right:1, bottom:1 }, bgColor:'rgba(192,100,100,0.7)'} )
            ];
        } else {
            this.children = [];
        }
    }
}
    /**
     * 
     * @param {Board} board 
     * @param {import('../eskv/lib/modules/types.js').WidgetSizeHints} hints 
     */
    constructor(board, hints) {
        super();
        this.board = board;
        this.hints = hints;
        /**@type {Tile|null} */
        this.tile = null;
        this.tileImage = new ImageWidget({ hints: { x: 0, y: '0.0', h: '1.0', w: '1.0' } }), //Tile & name
        this.terrainLabel = new Label({ align: 'left', hints: { x: 0, y: '1.0', h: '0.5', w: 1 } }), //Terrain
        this.terrainBox = new BoxLayout({ orientation: 'horizontal', hints: { x: 0, y: '1.5', w: 1.0, h: '1.5' } }),
        this.resourceInLabel = new Label({ align: 'left', text: 'Inputs', hints: { x: 0, y: '3.0', w: 1.0, h: '0.5' } }),
        this.resourceInBox = new BoxLayout({ orientation: 'horizontal', hints: { x: 0, y: '3.5', w: 1.0, h: '1.5' } }),
        this.resourceOutLabel = new Label({ align: 'left', text: 'Outputs', hints: { x: 0, y: '5.0', w: 1.0, h: '0.5' } }),
        this.resourceOutBox = new BoxLayout({ orientation: 'horizontal', hints: { x: 0, y: '5.5', w: 1.0, h: '1.5' } }),
        this.tileDescription = new Label({align:'left', fontSize: '0.25', wrap:true, hints:{x:0, y:'7', h:null, w:'5'}}),
        this.children = [
            // this.tileLabel,
            this.tileImage,
            this.terrainLabel,
            this.terrainBox,
            this.resourceInLabel,
            this.resourceInBox,
            this.resourceOutLabel,
            this.resourceOutBox,
            this.tileDescription,
        ];
        this.updateProperties({});
    }
    /**
     * 
     * @param {string} event 
     * @param {TileInfoPane} object 
     * @param {Tile|null} value 
     */
    on_tile(event, object, value) {
        if (this.tile === null) {
            this.children = [];
            return;
        }
        this.children = [
            // this.tileLabel,
            this.tileImage,
            this.terrainLabel,
            this.terrainBox,
            this.resourceInLabel,
            this.resourceInBox,
            this.resourceOutLabel,
            this.resourceOutBox,
            this.tileDescription,
        ];
        // this.tileLabel.text = tileNames[this.tile.code];
        this.tileImage.src = gameImages[this.tile.code];
        this.tileDescription.text = tileDescriptions[this.tile.code];
        const terrain = this.board.terrainMap.atPos(...this.tile.hexPos);
        if (terrain !== undefined) {
            this.terrainLabel.text = terrainNames[terrain.code];
            const tbox = new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[terrain.code] }),
                    new Label({ text: `${this.tile.terrainPlacement[terrain.code]}`, hints: { h: 0.5 } })
                ],
            });
            this.terrainBox.children = [tbox];
            this.terrainBox.hints.w = `${this.terrainBox.children.length}`;

            //Input resource status
            const needs = this.tile.needs;
            const needsFilled = this.tile.needsFilled;
            const riBoxChildren = [...needs.keys()].map((resourceType) => new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[resourceType] }),
                    new Label({ text: `${needsFilled.get(resourceType)?.length??0}/${needs.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceInBox.children = riBoxChildren;
            this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;

            //Output resource status
            const prodCapacity = this.tile.productionCapacity;
            const prodRequested = this.tile.productionFilled;
            const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[resourceType] }),
                    new Label({ text: `${prodRequested.get(resourceType)?.length??0}/${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceOutBox.children = roBoxChildren;
            this.resourceOutBox.hints.w = `${this.resourceOutBox.children.length}`;
        } else {
            this.terrainLabel.text = 'Placement and output bonus';
            const tp = this.tile.terrainPlacement;
            const tboxChildren = Object.keys(tp).filter(terrainType => tp[terrainType] !== null).map((terrainType) => new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[terrainType] }),
                    new Label({ text: `${tp[terrainType]}`, hints: { h: 0.5 } })
                ]
            }));
            this.terrainBox.children = tboxChildren;
            this.terrainBox.hints.w = `${this.terrainBox.children.length}`;

            //Input resource needed
            const needs = this.tile.needs;
            const riBoxChildren = [...needs.keys()].map((resourceType) => new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[resourceType] }),
                    new Label({ text: `${needs.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceInBox.children = riBoxChildren;
            this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;

            //Output resource produced
            const prodCapacity = this.tile.productionCapacity;
            const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => new BoxLayout({
                orientation: 'vertical',
                children: [
                    new ImageWidget({ src: gameImages[resourceType] }),
                    new Label({ text: `${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceOutBox.children = roBoxChildren;
            this.resourceOutBox.hints.w = `${this.resourceOutBox.children.length}`;
        }
        if (this.parent) this.parent._needsLayout = true;
    }
    /**
     * 
     * @param {App} app 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} millis
     */
    _draw(app, ctx, millis) {
        if (this.tile !== null) super._draw(app, ctx, millis);
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
    /**@type {"horizontal"|"vertical"} */
    orientation = "horizontal";
    constructor(props = {}) {
        super();
        if (props) this.updateProperties(props);
        /**@type {TerrainMap} */
        this._terrainMap = new TerrainMap(null, this.boardSize, this.orientation);
        for (let thex of this._terrainMap.iter()) {
            this.addChild(thex);
        }
    }
    /**@type {TerrainMap} */
    set terrainMap(value) {
        for (let thex of this._terrainMap.iter()) {
            this.removeChild(thex);
        }
        this._terrainMap = value;
        for (let thex of this._terrainMap.iter()) {
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
        this.terrainMap = new TerrainMap(level, this.boardSize, this.orientation);
    }
    /**
     * 
     * @param {[number, number]} hexPos 
     * @returns {[number, number]}
     */
    pixelPos(hexPos) {
        if (this.orientation === "vertical") {
            return [
                this.center_x + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardSize / 2)),
                this.center_y + this.hexHeight * (hexPos[1] - Math.floor(this.boardSize / 2) + Math.abs(hexPos[0] - Math.floor(this.boardSize / 2)) / 2.0)
            ];
        } else {
            return [
                this.center_x + this.hexHeight * (hexPos[1] - Math.floor(this.boardSize / 2) + Math.abs(hexPos[0] - Math.floor(this.boardSize / 2)) / 2.0),
                this.center_y + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardSize / 2))
            ];

        }
    }

    hexPos(pixelPos) {
        if (this.orientation === "vertical") {
            const hpos = Math.round((pixelPos[0] - this.center_x) / (this.hexSide * 1.5) + Math.floor(this.boardSize / 2));
            const vpos = Math.round((pixelPos[1] - this.center_y) / this.hexHeight + Math.floor(this.boardSize / 2) - Math.abs(hpos - Math.floor(this.boardSize / 2)) / 2);
            if (0 <= hpos && hpos < this.boardSize && 0 <= vpos && vpos < this.boardSize) {
                return [hpos, vpos];
            } else {
                return null;
            }
        } else {
            const vpos = Math.round((pixelPos[1] - this.center_y) / (this.hexSide * 1.5) + Math.floor(this.boardSize / 2));
            const hpos = Math.round((pixelPos[0] - this.center_x) / this.hexHeight + Math.floor(this.boardSize / 2) - Math.abs(vpos - Math.floor(this.boardSize / 2)) / 2);
            if (0 <= hpos && hpos < this.boardSize && 0 <= vpos && vpos < this.boardSize) {
                return [hpos, vpos];
            } else {
                return null;
            }
        }
    }
    get hexCount() {
        return 3 * this.boardSize * (this.boardSize - 1) + 1
    }
    /**
     * Returns all terrain positions that are conneced to this tile
     * @param {TerrainHex} terr 
     * @param {Player} player 
     * @param {Set<TerrainHex>} visited 
     * @param {Set<TerrainHex>} castles 
     * @yields {TerrainHex}
     */
    *connectedIter(terr, player, visited, castles) {
        //All adjacent tiles are connected
        if (terr.tile !== null && terr.tile instanceof Castle) {
            castles.add(terr);
        }
        for (let t of this.connectedAdjecentPriority(terr)) {
            if (visited.has(t)) continue;
            yield t;
            visited.add(t);
        }
        //Adjacent tiles of adjacent own castles are also connected
        for (let t of this.connectedAdjecentPriority(terr)) {
            if (t.tile && player.placedTiles.includes(t.tile)) {
                if (t.tile instanceof Castle) {
                    for (let tc of this.connectedAdjecentPriority(t)) {
                        if (visited.has(tc)) continue;
                        yield tc;
                        visited.add(tc);
                    }
                    for (let tn of t.tile.network) {
                        castles.add(tn);
                    }
                }
            }
        }
        // If the terrain is in a port we return all other terrain served by the Tradeship
        for (let ship of player.placedTiles) {
            if (ship instanceof Tradeship) {
                if (!ship.ports.has(terr)) continue;
                for (let tp of ship.ports) {
                    if (visited.has(tp)) continue;
                    yield tp;
                    visited.add(tp);
                    if (tp.tile !== null && tp.tile instanceof Castle) {
                        castles.add(tp);
                    }
                }
            }
        }
        //All castles connected are connected to all other castles in range 
        for (let tc of castles) {
            if (tc.tile !== null && tc.tile instanceof Castle) {
                for (let tn of tc.tile.network) {
                    if (visited.has(tn)) continue;
                    yield tn;
                    visited.add(tn);
                    for (let tnAdj of this.connectedAdjecentPriority(tn)) {
                        if (visited.has(tnAdj)) continue;
                        yield tnAdj
                        visited.add(tnAdj);
                    }
                    // yield *this.connectedIter(tn, player, visited, castles);
                }
            }
        }
    }
    /**
     * 
     * @param {TerrainHex} terr 
     * @returns 
     */
    connectedAdjecentPriority(terr) {
        let neighbors = [...this.neighborIter(terr.hexPos)];
        neighbors.sort((a,b)=>{
            if (a.tile===null && b.tile===null) return 0;
            if (a.tile===null) return 100;
            if (b.tile===null) return -100;
            return tilePriority[a.tile.code]-tilePriority[b.tile.code]
        });
        return neighbors;
    }

    /**
     * 
     * @param {[number, number]} hexPos 
     * @yields {TerrainHex}
     */
    *neighborIter(hexPos) {
        const yOffsetLeft = hexPos[0] <= Math.floor(this.boardSize / 2) ? 1 : 0;
        const yOffsetRight = hexPos[0] >= Math.floor(this.boardSize / 2) ? 1 : 0;
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
            const t = this._terrainMap.atPos(x, y);
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
                if (thex) {
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

class LabeledIcon extends BoxLayout {
    /**
     * 
     * @param {string} text 
     * @param {string} iconSrc
     */
    constructor(text, iconSrc) {
        super();
        this.children = [
            new Label({ text: text, hints: { w: null } }),
            new ImageWidget({ src: iconSrc })
        ];
        console.log(text, iconSrc);
        this.updateProperties({ orientation: 'horizontal' });
    }
}

class ActionBar extends BoxLayout {
    /**@type {Tile|null} */
    selectedTile = null;
    active = true;
    constructor(props = {}) {
        super();
        this.updateProperties(props);
    }
    on_child_removed(e, o, c) {
        if (c instanceof Tile) {
            c.selected = false;
            if (this.selectedTile === c) {
                this.selectedTile = null;
            }
        }

    }
    /**
     * 
     * @param {string} e 
     * @param {ActionBar} o 
     * @param {Widget} c 
     */
    on_child_added(e, o, c) {
        if (c instanceof Tile) {
            c.bind('touch_down', (e, o, v) => {
                if (this.active && /**@type {Widget}*/(o).collide(v.rect)) {
                    for (let c of this.children) /**@type {Tile}*/(c).selected = false;
                    if (this.selectedTile === o) {
                        this.selectedTile = null;
                        /**@type {Tile}*/(o).selected = false;
                    } else {
                        this.selectedTile =/**@type {Tile}*/(o);
                        /**@type {Tile}*/(o).selected = true;
                    }
                };
            });
        }
    }

    on_selectedTile(e, o, v) {
        for (let c of this.children) /**@type {Tile}*/(c).selected = false;
        if (this.selectedTile !== null) {
            this.selectedTile.selected = true;            
        }
    }
    on_active(e, o, v) {
        if (!this.active) {
            for (let c of this.children) {
                if (c instanceof Tile) {
                    c.selected = false;
                }
            }
            this.selectedTile = null;
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
        this.tileStack = [];
        this.bgColor = 'rgba(25, 102, 153, 1.0)'; //'Ocean Blue';

        /**@type {[number, number]} */
        this.selectPos = [0, 0];
        this.board = new Board({ hints: { right: 1, y: 0, w: '1.5h', h: 1 } });
        this.addChild(this.board);
        this.tileInfo = new TileInfo(this.board, { x: '0.14wh', y: '1.0', w: '0.5h', h: 1 });
        this.addChild(this.tileInfo)
        this.placementLayer = new Widget({ hints: { x: 0, y: 0, w: 1, h: 1 } });
        this.addChild(this.placementLayer);
        this.scoreboard = new BoxLayout({ align: 'right', hints: { right: 0.99, y: 0.01, w: 1, h: 0.05 } });
        this.addChild(this.scoreboard);
        this.wStateLabel = new Label({ text: '', color: 'white', align: 'left', hints: { x: 0.01, y: 0.01, w: 1, h: '1.0' } });
        this.addChild(this.wStateLabel);
        this.actionBar = new ActionBar({ hints: { x: 0, y: '1.0', w: '0.14wh', h: 0.84 }, bgColor: 'gray', outlineColor: 'white' });
        this.addChild(this.actionBar);
        this.actionBar.bind('selectedTile', (e, o, v) => this.selectTile(e, o, v));
        this.nextButton = new Button({
            text: 'End turn', alight: 'right',
            hints: { right: 0.99, bottom: 0.99, w: 0.1, h: 0.05 },
            on_press: (e, o, v) => this.finishTurn()
        });
        this.addChild(this.nextButton);
        this.updateProperties({});
    }
    finishTurn() {
        if (this.activePlayer === 0) {
            //TODO: Put all this in the player class
            //Resource tracker management also could be put into the player class?
            const sm = this.players[this.activePlayer].scoreMarker;
            if (sm.turn > 1) {
                sm.turn--;
                // this.actionBar.children = [new Farm(), new Village(), new Mine(), new Abbey(), new Tradeship(), new Stronghold(), new Castle()];
                if (sm.turn == 1) {
                    this.nextButton.text = 'End game';
                }
            } else if (sm.turn === 1) {
                sm.turn = 0;
                // this.actionBar.children = [];
                this.nextButton.disable = true;
                this.gameOver = true;
            }
        }
        this.tilesPlacedThisTurn = 0;
        this.nextPlayer();
    }
    /**
     * @param {TerrainHex|null} terrain 
     */
    updateScores(terrain = null) {
        if (terrain !== null) {
            this.updateResourceProduction();
        }
    }


    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex} terr
     * @returns 
     */
    removeTileFromTerrain(player, terr) {
        const tile = terr.tile;
        terr.tile = null;
        for(let p of this.players) {
            p.placedTiles = p.placedTiles.filter(t0=>t0!==tile);
        }
    }
    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex} thex 
     * @param {Tile} tile 
     * @param {boolean} removeExisting
     * @param {boolean} serverCheck 
     * @returns 
     */
    placeTile(player, thex, tile, removeExisting = false, advanceTurn = true, serverCheck = true) {
        const hexPos = thex.hexPos;
        const t = this.board.terrainMap.atPos(...hexPos);
        if (t === undefined) return false;
        if (t.tile !== null) {
            if (!removeExisting) return false;
            this.removeTileFromTerrain(player, thex);
        }
        if (tile.terrainPlacement[t.code] === null) return false;
        /**@type {[number, number]|null} */
        const center = advanceTurn ? [thex.center_x, thex.center_y] : null;
        tile.place(thex, center, player, this.board);
        player.placedTiles.push(tile);
        player.scoreMarker.tilesPlacedThisTurn++;
        thex.tile = tile;
        this.updateScores(thex);
        for (let t of player.placedTiles) {
            const terr = this.board.terrainMap.atPos(t.hexPos[0], t.hexPos[1]);
            if (terr === undefined) continue;
            // if (t instanceof Tradeship) {
            //     t.ports = new Set([terr]);
            //     t.updatePorts(terr, this.board, 3, t.ports, new Set([terr]));
            // }
            if (t instanceof Castle) {
                t.network = new Set([terr]);
                t.updateNetwork(terr, this.board, 3, t.network, new Set([terr]));
            }
        }
        this.tileInfo.tile = tile;
        this.actionBar.selectedTile = null;
        if (advanceTurn) {
            this.clearPlacementTargets();
            // this.nextPlayer();
        }
        return true;
    }

    /**
     * 
     * @param {TerrainHex} terrain 
     * @param {Touch} touch 
     * @returns 
     */
    onTouchDownTerrain(terrain, touch) {
        if (this.gameOver) return true;
        const player = this.players[this.activePlayer];
        if (terrain.tile) {
            this.tileInfo.tile = terrain.tile;
            const verb = !(terrain.tile instanceof Rubble) && terrain.tile.needsFilled.meets(terrain.tile.needs) ? 'Active' : 'Inactive';
            this.wStateLabel.text = `${verb} ${tileNames[terrain.tile.code]}`;
            //TODO: Here we want to highlight:
            // * Input tiles
            // * Output tiles
            // * Terrain in this tile's network
            for (let t of player.placedTiles) {
                t.showResourceStatus = false;
            }
            this.setTileNetworkInfo(player, terrain);
            if (!(terrain.tile instanceof Rubble)) {
                this.actionBar.selectedTile = null;
                return true;
            }
        }
        if (this.actionBar.selectedTile === null) return true;
        if (!player.localControl) return true;
        const tile = this.actionBar.selectedTile;
        const tileToPlace = new playerTileClasses[tile.code]();
        if (!this.canReach(player, terrain)) return true;
        this.actionBar.selectedTile = null;
        return this.placeTile(player, terrain, tileToPlace, terrain.tile instanceof Rubble);
    }

    /**
     * Returns the set of the tiles that can be reached by the player
     * @param {Player} player Player who will place
     */
    reachableTiles(player) {
        /**@type {Set<TerrainHex>} */
        const reachable = new Set();
        for (let t of player.placedTiles) {
            const terr = this.board.terrainMap.atPos(t.hexPos[0], t.hexPos[1]);
            if (terr === undefined) continue;
            //All terrain of placed tiles
            reachable.add(terr);
            //All adjacent terrain
            for (let terrAdj of this.board.neighborIter(terr.hexPos)) {
                reachable.add(terrAdj);
            }
            //All port terrain
            if (t instanceof Tradeship) {
                for (let port of t.ports) {
                    reachable.add(port);
                }
            }
            // //All castles in network
            // if (t instanceof Castle) {
            //     for (let terrPatrol of t.network) {
            //         reachable.add(terrPatrol);
            //     }
            // }
        }
        return reachable
    }

    /**
     * Returns true if the player can reach the destination terrain location
     * @param {Player} player Player who will place
     * @param {TerrainHex} terrain Location to place in
     * @returns 
     */
    canReach(player, terrain) {
        return this.reachableTiles(player).has(terrain);
    }

    /**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
    selectTile(e, o, v) {
        if (v===null) return;
        const player = this.players[this.activePlayer];
        for (let t of player.placedTiles) {
            t.showResourceStatus = true;
        }
        if (player.scoreMarker.tilesPlacedThisTurn < 5) {
            // this.actionBar.active = true;
            if (v) {
                this.wStateLabel.text = 'Place ' + v.name;
                this.setPlacementTargets(v.code);
                this.tileInfo.tile = v;
            } else {
                this.wStateLabel.text = 'Select a building type';
                this.clearPlacementTargets();
                this.tileInfo.tile = null;
            }
        } else {
            if (this.actionBar.active) this.actionBar.active = false;
            this.tileInfo.tile = null;
            this.wStateLabel.text = 'End turn';
            this.clearPlacementTargets();
        }
    }

    updateResourceProduction() {
        const player = this.players[this.activePlayer];
        if (!player) return;
        // /**@type {ProductionChain} */
        // let totalProd = ProductionChain.from({});
        const placedTiles = [...player.placedTiles];
        placedTiles.sort((a,b)=>tilePriority[a.code]-tilePriority[b.code]);
        const reversePlacedTiles = [...placedTiles];
        reversePlacedTiles.reverse();
        for (let tile of player.placedTiles) {
            tile.needsFilled.clear();
            tile.productionFilled.clear();
        }
        let changes = true;
        /**@type {Map<Tile, Set<Tile>>} */
        const deactivatedConnections = new Map();
        for (let t of placedTiles) {
            deactivatedConnections.set(t, new Set());
        }
        while (changes) {
            changes = false;
            //Figure out needs and production
            for (let tile of placedTiles) {
                let terr0 = this.board._terrainMap.atPos(tile.hexPos[0], tile.hexPos[1]);
                if (terr0 === undefined) continue;
                for (let terr of this.board.connectedIter(terr0, player, new Set([terr0]), new Set([terr0]))) {
                    const adjTile = terr.tile;
                    const conn = /**@type {Set<Tile>}*/(deactivatedConnections.get(tile));
                    if (adjTile!==null && !conn.has(adjTile)) {
                        for (let need of tile.needs.keys()) {
                            const neededAmt = tile.needs.get(need);
                            const neededAmtFilled = tile.needsFilled.get(need)??[];
                            if (neededAmt===undefined) continue;
                            if (neededAmt===0 && neededAmtFilled.length===1 || neededAmt>0 && neededAmtFilled.length === neededAmt) continue;
                            if (!adjTile.productionCapacity.has(need)) continue;
                            const providedAmt = adjTile.productionCapacity.get(need);
                            if (providedAmt === undefined) continue;
                            if (adjTile.productionFilled.get(need)?.length === providedAmt) continue;
                            // changes = true;
                            adjTile.productionFilled.addResource(need, tile);
                            tile.needsFilled.addResource(need, adjTile);
                        }
                    }
                }
            }
            // Now we remove needsFilled and productionRequested of the next tile lacking the needed resources or 
            // whose producer does not have the resource it needs to activate
            for (let tile of reversePlacedTiles) {
                for (let need of tile.needsFilled.keys()) {
                    const suppliers = tile.needsFilled.get(need)??[];
                    const activeSuppliers = suppliers.filter((sTile) => sTile.needsFilled.meets(sTile.needs));
                    const inactiveSuppliers = suppliers.filter((sTile) => !sTile.needsFilled.meets(sTile.needs));
                    if (inactiveSuppliers.length > 0) {
                        if (activeSuppliers.length > 0) {
                            tile.needsFilled.set(need, activeSuppliers);
                        } else {
                            tile.needsFilled.delete(need);
                        }
                        for (let is of inactiveSuppliers) {
                            deactivatedConnections.get(tile)?.add(is);
                        }
                        changes = true;
                    }
                }
                if (!tile.needsFilled.meets(tile.needs)) {
                    //Clear out the production link from tiles that are supplying this one
                    //Some of these may come back on the next iteration except for the deactivateConnections
                    for (let n of tile.needsFilled.keys()) {
                        const nfts = tile.needsFilled.get(n);
                        if (nfts===undefined) continue;
                        for (let nft of nfts) {
                            const prods = nft.productionFilled.get(n);
                            if (prods!==undefined) {
                                if (prods.length>1) {
                                    nft.productionFilled.set(n, prods.filter((p)=>p!==tile));
                                } else {
                                    nft.productionFilled.delete(n);
                                }
                                // changes = true;
                            }
                        }
                    }
                    //Clear out the needsFilled of tiles that this tile supplies
                    //Some of these may come back on the next iteration except for the deactivateConnections
                    for (let n of tile.productionFilled.keys()) {
                        const users = tile.productionFilled.get(n);
                        if (users!==undefined) {
                            for (let p of users) {
                                const needs = p.needsFilled.get(n);
                                if (needs!==undefined) {
                                    if (needs.length>1) {
                                        p.needsFilled.set(n, needs.filter((n)=>n!==tile));
                                    } else {
                                        p.needsFilled.delete(n);
                                    }
                                }
                            }
                        }
                    }
                    tile.productionFilled.clear();
                    break;
                }
            }    
        }

        for (let tile of player.placedTiles) {
            // totalProd = totalProd.add(tile.productionRequested);
            tile.updateResourceStatusIcons();
        }
    }

    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex|null} terrain 
     */
    displayTileNetworkInfo(player, terrain) {
        if (terrain === null) {
            for (let t of player.placedTiles) {
                t.showResourceStatus = true;
            }
            this.placementLayer.children = [];
            return;
        }
        const tile = terrain.tile;
        if (tile===null) {
            for (let t of player.placedTiles) {
                t.showResourceStatus = true;
            }
            this.placementLayer.children = [];
            return;
        }
        for (let t of player.placedTiles) {
            t.showResourceStatus = false;
        }
        /**@type {NetworkTileOverlay[]} */
        const info = [];
        for (let terr of this.board.connectedIter(terrain, player, new Set(), new Set())) {
            /**@type {ResourceType|''} */
            let output = '';
            /**@type {ResourceType|''} */
            let input = '';
            if (terr.tile !== null) {
                for (let n of tile.needsFilled.keys()) {
                    if (tile.needsFilled.get(n)?.includes(terr.tile)) {
                        input = n;
                        break;
                    }
                }
                for (let n of tile.productionFilled.keys()) {
                    if (tile.productionFilled.get(n)?.includes(terr.tile)) {
                        output = n;
                        break;
                    }
                }
            }
            info.push(new NetworkTileOverlay(this.board.hexSide, terr.hexPos, input, output));
        }
        this.placementLayer.children = info;
    }

    /**
     * @param {TileType} tileType */
    setPlacementTargets(tileType) {
        const tile = new playerTileClasses[tileType]();
        this.clearPlacementTargets();
        let player = this.players[this.activePlayer];
        if (!this.board.terrainMap) return;
        let targets = [];
        for (let thex of this.reachableTiles(player)) {
            if (thex.tile !== null && !(thex.tile instanceof Rubble)) continue;
            if (tile.terrainPlacement[thex.code] === null) continue;
            let value = tile.terrainPlacement[thex.code];
            let tt = new TargetTile({
                w: this.board.hexSide * 2,
                h: this.board.hexSide * 2,
                score: value,
                hexPos: thex.hexPos.slice(),
            });
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
    }
    /**
     * @param {Level|null} level 
     */
    setupLevel(level = null) {
        if (level !== null) {
            this.level = level;
        }
        if (this.level === null) return;
        this.board.makeTerrain(this.level);
        let p = this.players[this.activePlayer]
        if (!p) return; //throw new Error("No active player found");

        this.tileStack = [...this.level.tileSet].map(t => new playerTileClasses[t]());
        this.tileStack.sort(() => Math.random() - 0.5);
        let startTile = new playerTileClasses[this.level.startTile]();

        if (this.board.terrainMap && this.level) {
            let terr = this.board.terrainMap.atPos(this.level.start[0], this.level.start[1]);
            if (terr) this.placeTile(p, terr, startTile, false, false);
        }

        this.actionBar.addChild(new Farm());
        this.actionBar.addChild(new Village());
        this.actionBar.addChild(new Mine());
        this.actionBar.addChild(new Abbey());
        this.actionBar.addChild(new Tradeship());
        // this.actionBar.addChild(new Market());
        this.actionBar.addChild(new Stronghold());
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
                this.players.push(new Player(p.name, p.color, this, true));
            }
            if (p.type === 1) { // enemy
                this.players.push(new EnemyPlayer(p.name, p.color, this, false));
            }
        }
        this.setupLevel(level);
        this.players[0].scoreMarker.turn = 10;
        this.players[1].scoreMarker.turn = 10;
    }

    startGame() {
        this.startPlayerTurn();
    }

    nextPlayer() {
        if (this.activePlayer === 0) {
            this.players[this.activePlayer].endTurn(this);
            const player = this.players[this.activePlayer];
            for (let t of player.placedTiles) {
                if (t instanceof Stronghold && t.needsFilled.meets(t.needs)) {
                    for (let terr of this.board.neighborIter(t.hexPos)) {
                        if (terr.tile instanceof EnemyDragon || terr.tile instanceof EnemyStronghold) {
                            terr.tile.health--;
                            if (terr.tile.health <= 0) {
                                const otherPlayer = this.players[1];
                                const rubble = new Rubble();
                                this.placeTile(otherPlayer, terr, rubble, true, false);
                            }
                        }
                    }
                }
                if (t instanceof Castle && t.needsFilled.meets(t.needs)) {
                    player.scoreMarker.score += 1;
                }
            }

        }
        this.activePlayer += 1;
        if (this.activePlayer >= this.players.length) {
            this.activePlayer = 0;
        }
        const p = this.players[this.activePlayer];
        p.scoreMarker.tilesPlacedThisTurn = 0;
        this.startPlayerTurn();
    }

    startPlayerTurn() {
        const p = this.players[this.activePlayer];
        this.updateResourceProduction();
        if (p.localControl) {
            this.actionBar.active = true;
            if (p.scoreMarker.tilesPlacedThisTurn < 5) {
                this.wStateLabel.text = 'Select tile';
                this.wStateLabel.color = p.color;
            } else {
                this.wStateLabel.text = 'End turn';
                this.wStateLabel.color = p.color;
            }
        } else {
            this.wStateLabel.text = '';
            this.wStateLabel.color = p.color;
        }
        p.startTurn(this);
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
        if (!t) return;
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
            tt.w = hexSide,
            tt.h = hexSide,
            tt.center_x = hp[0];
            tt.center_y = hp[1];
        }

        this.applyHints(this.tileInfo);
        this.tileInfo.layoutChildren();

        this.applyHints(this.scoreboard);
        this.scoreboard.layoutChildren();

        this.applyHints(this.actionBar);
        this.actionBar.layoutChildren();

        this.applyHints(this.wStateLabel);
        this.wStateLabel.layoutChildren();

        this.applyHints(this.nextButton);
        this.nextButton.layoutChildren();

        this.applyHints(this.placementLayer);
        this.placementLayer.layoutChildren();

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
        this.tilesPlacedThisTurn = 0;
        this.activeTurn = false;
        /**@type {"left"|"center"|"right"}*/
        this.align = "right";
    }
    on_score(event, object, data) {
        this.updateStatus();
    }
    on_turn(event, object, data) {
        this.updateStatus();
    }
    on_tilesPlacedThisTurn(event, object, data) {
        this.updateStatus();
    }
    updateStatus() {
        if (this.turn > 1) {
            this.text = `Tiles to place: ${5 - this.tilesPlacedThisTurn} -- Turn: ${11-this.turn}/10 -- Score: ${this.score}`;
        } else if (this.turn === 1) {
            this.text = `Tiles to place: ${5 - this.tilesPlacedThisTurn} -- Last turn -- Score: ${this.score}`;
        } else {
            this.text = `Game over -- Score: ${this.score}`;
        }
    }
}

class Player extends EventSink {
    /**
     * 
     * @param {string} name 
     * @param {string} color 
     * @param {GameScreen} screen
     * @param {boolean} showScore
     */
    constructor(name, color, screen, showScore) {
        super();
        this.localControl = true;
        this.name = name;
        this.color = color;
        this.screen = screen;
        /**@type {Tile[]} */
        this.placedTiles = [];
        this.scoreMarker = new PlayerScore(this.name.substring(0, 2), color);
        this.showScore = showScore;
    }

    on_showScore(event, object, value) {
        if (this.showScore) {
            this.screen.scoreboard.addChild(this.scoreMarker);
        } else {
            this.screen.scoreboard.removeChild(this.scoreMarker);
        }
    }

    delete() {
        this.reset();
        if (this.showScore) {
        }
        // for (let pt of this.placedTiles) {
        //     this.screen.removeChild(pt);
        // }
        this.placedTiles = [];
    }

    reset() {
        this.scoreMarker.activeTurn = false;
        this.scoreMarker.score = 0;
        // for (let pt of this.placedTiles) {
        //     this.screen.removeChild(pt);
        // }
        this.placedTiles = [];
    }

    /**
     * 
     * @param {GameScreen} screen 
     */
    startTurn(screen) {
        this.scoreMarker.activeTurn = true;
        this.scoreMarker.tilesPlacedThisTurn = 0;
    }

    /**
     * 
     * @param {GameScreen} screen 
     */
    endTurn(screen) {
        this.scoreMarker.activeTurn = false;
    }

    /**
     * 
     * @param {Board} board 
     * @param {number} hexSide 
     */
    boardResize(board, hexSide) {
        for (let pt of this.placedTiles) {
            if (pt._animation) continue;
            pt.w = hexSide * 2;
            pt.h = hexSide * 2;
            [pt.center_x, pt.center_y] = board.pixelPos(pt.hexPos);
        }
    }
}

class EnemyPlayer extends Player {
    maxTiles = 3;
    localControl = false;
    /**
     * 
     * @param {GameScreen} screen 
     */
    startTurn(screen) {
        const board = screen.board;
        const otherPlayer = screen.players[0];
        for (let t of this.placedTiles) {
            if (t instanceof EnemyStronghold) {
                for (let terr of board.neighborIter(t.hexPos)) {
                    if (terr.tile instanceof Tile && !(terr.tile instanceof Rubble) && !this.placedTiles.includes(terr.tile)) {
                        screen.placeTile(otherPlayer, terr, new Rubble(), true, false);
                        break;
                    }
                }
            }
            else if (t instanceof EnemyDragon) {
                for (let terr of board.neighborIter(t.hexPos)) {
                    if (terr.tile instanceof Tile && !(terr.tile instanceof Rubble) && !this.placedTiles.includes(terr.tile)) {
                        screen.placeTile(otherPlayer, terr, new Rubble(), true, false);
                        break;
                    }
                }
            }
        }
        if (this.placedTiles.reduce((p,c)=>p+(c instanceof Rubble?0:1), 0) < this.maxTiles) {
            for (let terr of rand.shuffle([...board.terrainMap.iter()])) {
                if (terr.tile === null) {
                    for (let adjTerr of board.neighborIter(terr.hexPos)) {
                        if (adjTerr.tile !== null && !this.placedTiles.includes(adjTerr.tile)) {
                            /**@type {Tile|null} */
                            let tile = null;
                            switch (terr.code) {
                                case 'p':
                                case 'f':
                                    tile = new EnemyStronghold();
                                    break;
                                case 'm':
                                    tile = new EnemyDragon();
                                    break;
                            }
                            if (tile !== null) {
                                this.placedTiles.push(tile);
                                terr.tile = tile;
                                tile.place(terr, board.pixelPos(terr.hexPos), this, board);
                                screen.finishTurn();
                                return;
                            }
                        }
                    }
                }
            }
        }
        screen.finishTurn();
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
        let ps = new PlayerSpec('Player', colorLookup[0], 0);
        let es = new PlayerSpec('Enemy', colorLookup[1], 1);
        this.playerSpec = [ps, es];
        this.wGame.setupGame(this.playerSpec, levels[0]);
        this.wGame.startGame();
        this.current = 'game';
    }

    /**
     * 
     * @param {Level} level 
     */
    startSpGame(level) {
        this.playerSpec = [
            new PlayerSpec('Player', 'white', 0),
            new PlayerSpec('Enemy', 'red', 1),
        ];
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
        super({ text: text, bgColor: bgColor, color: color, hints: hints });
    }
}

class PuzzleKingdomApp extends App {
    constructor() {
        super();
        this._baseWidget.children = [
            new GameMenu({ hints: { x: 0, y: 0, w: 1, h: 1 } })
        ];
    }

}

var pk = new PuzzleKingdomApp();
pk.start();