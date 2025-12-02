//@ts-check

import { App, Widget, ImageWidget, WidgetAnimation, Label, ScrollView, BoxLayout, Vec2, math, rand, Button, EventSink, vec2, ModalView } from '../eskv/lib/eskv.js'; //Import ESKV objects into an eskv namespace
import { colorString } from '../eskv/lib/modules/math.js';
import { Touch } from '../eskv/lib/modules/input.js';

rand.setPRNG('mulberry32');
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
import urlTileEnemyLongboat from './tiles/enemy_longboat.png';
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
    'EL': urlTileEnemyLongboat,
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
/**@typedef {'C'|'V'|'A'|'F'|'M'|'S'|'T'|'X'} FriendlyTileType */
/**@typedef {'ET'|'ES'|'EC'|'ED'|'EL'} EnemyTileType */
/**@typedef {FriendlyTileType|EnemyTileType} TileType */
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
    EL: 'enemy longboat',
}

const tileDescriptions = {
    C: 'A castle produces influence once supplied with workers, food, and blessings. Every structure adjacent to a castle has a production link to all of the other adjacent structures. Once placed, castles connect their production links to the links of any other castles in range 3. In this prototype, each castle producing influence scores you 2 points at the end of each round.',
    V: 'A village produces workers once provided with food.',
    A: 'An abbey produces blessings once supplied with food and workers. Blessings make other structures more effective producers.',
    F: 'A farm produces food once supplied with workers. In a forest it will also produce timber.',
    M: 'A mine produces ore once supplied with workers.',
    S: 'A stronghold produces military strength once supplied with workers and ore. At the end of each round, units from activated strongholds will attack enemies that they can reach.',
    T: 'A tradeship produces money once supplied with workers and timber. Coins produce 1 point at the end of each round. Tradeships extend the accessible terrain of your empire to all terrain accessible from water in range 3 of the tradeship. Once placed, tradeships allow production links between all structures within reach of the Tradeship.',
    X: 'Rubble is the remains of a structure or enemy that you can build over.',
    ET: 'An enemy tent is a temporary installation that expands enemy reach but does not attack.',
    ES: 'An enemy stronghold expands the enemies reach and will attack adjacent structures at the end of each round.',
    EC: 'The enemy castle.',
    EL: 'The enemy longboat allows enemy units to travel over water.',
    ED: 'An enemy dragon lives in mountains and will attack structures in range 2 at the end of each round.',
}

/**@type {{[id in ResourceType]:string}} */
const resourceNames = {
    rf: 'food',
    rw: 'worker',
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
     * @returns 
     */
    hasConnection(resource, connection) {
        return this.get(resource)?.includes(connection) ?? false;
    }
    /**
     * 
     * @param {ResourceType} resource 
     * @param {Tile} connection 
     */
    addConnection(resource, connection) {
        const arr = this.get(resource);
        if (arr !== undefined) {
            if (!arr.includes(connection)) {
                arr.push(connection);
                return true;
            }
        } else {
            this.set(resource, [connection]);
            return true;
        }
        return false;
    }
    /**
     * 
     * @param {ResourceType} resource 
     * @param {Tile} connection 
     */
    removeConnection(resource, connection) {
        if (this.has(resource)) {
            const arr = this.get(resource) ?? [];
            if (arr.length > 1) {
                const index = arr.indexOf(connection);
                if (index >= 0) {
                    arr.splice(index, 1);
                    return true;
                }
            } else {
                this.delete(resource);
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param {ProductionQuantity} quantity 
     */
    meets(quantity) {
        for (let r of quantity.keys()) {
            const q = quantity.get(r);
            if (q !== undefined && q !== 0 && (this.get(r) ?? []).length < q) return false;
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

class ResourceIcon extends Widget {
    /**@type {ResourceType} */
    resource = 'rf';
    primary = true;
    color = 'rgba(92, 13, 26, 1)';

    /** @type {Widget['draw']} */
    draw(app, ctx) {
        const src = gameImages[this.resource];
        if (!src) return;

        let img = NetworkFlowEdge._iconCache.get(src);
        if (!img) {
            img = new Image();
            img.src = src;
            NetworkFlowEdge._iconCache.set(src, img);
        }
        if (!img.complete) {
            app.requestFrameUpdate();
            return;
        }

        const color = this.color;
        // const color = NetworkFlowEdge.resColor[this.resource] ?? 'rgba(255,255,255,0.8)';

        ctx.save();

        // Small glow for primary
        if (this.primary) {
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        ctx.globalAlpha = this.primary ? 0.95 : 0.85;
        ctx.drawImage(img, this.x, this.y, this.w, this.h);

        ctx.restore();
    }
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
        super();
        /**@type {Label|null} */
        this.wLabel = null;
        this.iconBox = BoxLayout.a({ orientation: "horizontal", hints: { w: 1, h: 0.4, x: 0, y: 0 } })
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
        this.bgColor = value ? 'rgba(192,188,100, 1)' : null;
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
        const hexPos = this.hexPos;
        const hints = { h: 0.5, w: '1wh' };
        for (let n of this.needs.keys()) {
            const minAmt = this.needs.get(n)
            if (minAmt !== undefined && minAmt > 0 && this.needsFilled.get(n)?.length !== minAmt) {
                const icon = ResourceIcon.a({resource:n, color:'rgba(90,0,0,0.6)', primary:true, hints});
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
                    const icon = ResourceIcon.a({resource:n, color:color, primary:true, hints});
                    iconsToAdd.push(icon);
                }
            }
        }
        const size = iconsToAdd.length;
        for (let i of iconsToAdd) {
            i.hints['h'] = size === 1 ? 0.7 : 0.7 / (size - 1);
        }
        this.iconBox.children = iconsToAdd;
    }
    /**
     * 
     * @param {Board} board 
     */
    *iterNetwork(board) {
        for (let t of board.neighborIter(this.hexPos)) yield t;
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
    /**@type {TileType} */
    code = 'X';
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
    /**@type {TileType} */
    code = 'C';
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
        return ProductionQuantity.from({ 'ri': 1 + this.prodBonus });
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
        /** {TerrainHex[]} */
        const newNodes = [];
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!(t instanceof Water) && !(visited.has(t))) {
                if (t.tile instanceof Castle) {
                    network.add(t);
                }
                visited.add(t);
                newNodes.push(t);
            }
        }
        if (range > 1) {
            for (let t of newNodes) {
                this.updateNetwork(t, board, range - 1, network, visited);
            }
        }
    }
}

class Village extends Tile {
    /**@type {TileType} */
    code = 'V';
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
    /**@type {TileType}*/
    code = 'S';
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
        return ProductionQuantity.from({ 'rs': 1 + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'ro': 1, 'rw': 1 });
    }
}

class Mine extends Tile {
    /**@type {TileType}*/
    code = 'M';
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
    /**@type {TileType}*/
    code = 'T';
    name = 'Tradeship';
    terrainPlacement = { 'p': null, 'f': null, 'm': null, 'w': 0 };
    tileColor = colorString([0.4, 0.2, 0.2, 1.0]);
    textColor = 'white';
    network = /**@type {Set<TerrainHex>} */(new Set());
    constructor(props = {}) {
        super();
        this.src = gameImages['T'];
        this.updateProperties(props);
    }
    get productionCapacity() {
        return ProductionQuantity.from({ 'rm': 1 + this.prodBonus });
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1, 'rt':1 });
    }
    /** @type {Tile['place']} */
    place(terr, centerPos, player, board) {
        super.place(terr, centerPos, player, board);
        this.network = new Set([terr]);
        this.updateNetwork(terr, board, 3, this.network);
    }
    /**
     * 
     * @param {Board} board 
     * @param {TerrainHex} terr
     * @param {number} range 
     * @param {Set<TerrainHex>} ports 
     */
    updateNetwork(terr, board, range, ports) {
        /**@type {TerrainHex[]} */
        const newPorts = [];
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!ports.has(t)) {
                ports.add(t);
                newPorts.push(t);
            }
        }
        if (range > 1) {
            for (let t of newPorts) {
                if (t instanceof Water) {
                    this.updateNetwork(t, board, range - 1, ports);
                }
            }
        }
    }
}

class Abbey extends Tile {
    /**@type {TileType}*/
    code = 'A';
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
            return ProductionQuantity.from({ 'rf': 1 * blessed + this.prodBonus, 'rt': 1 * blessed });
        } else {
            return ProductionQuantity.from({ 'rf': 1 * blessed + this.prodBonus });
        }
    }
    get needs() {
        return ProductionQuantity.from({ 'rw': 1, 'rb': 0 });
    }
}

class EnemyStronghold extends Tile {
    /**@type {TileType}*/
    code = 'ES';
    name = 'Enemy Stronghold';
    terrainPlacement = { 'p': 1, 'f': 1, 'm': 1, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 2;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyStronghold;
        this.updateProperties(props);
    }
    get needs() {
        return ProductionQuantity.from({ 'rs': this.health });
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
}

class EnemyCastle extends Tile {
    /**@type {TileType}*/
    code = 'EC';
    name = 'Enemy Castle';
    terrainPlacement = { 'p': 1, 'f': 1, 'm': 1, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 5;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyCastle;
        this.updateProperties(props);
    }
    get needs() {
        return ProductionQuantity.from({ 'rs': this.health });
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
}

class EnemyLongboat extends Tile {
    /**@type {TileType}*/
    code = 'EL';
    name = 'Enemy Castle';
    terrainPlacement = { 'p': null, 'f': null, 'm': null, 'w': 1 };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 1;
    network = /**@type {Set<TerrainHex>}*/(new Set());
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyLongboat;
        this.updateProperties(props);
    }
    get needs() {
        return ProductionQuantity.from({ 'rs': this.health });
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
    /**
     * 
     * @param {Board} board 
     * @param {TerrainHex} terr
     * @param {number} range 
     * @param {Set<TerrainHex>} ports 
     */
    updateNetwork(terr, board, range, ports) {
        /**@type {TerrainHex[]} */
        const newPorts = [];
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!ports.has(t)) {
                ports.add(t);
                newPorts.push(t);
            }
        }
        if (range > 1) {
            for (let t of newPorts) {
                if (t instanceof Water) {
                    this.updateNetwork(t, board, range - 1, ports);
                }
            }
        }
    }
    /** @type {Tile['place']} */
    place(terr, centerPos, player, board) {
        super.place(terr, centerPos, player, board);
        this.network = new Set([terr]);
        this.updateNetwork(terr, board, 3, this.network);
    }
    /**
     * 
     * @param {Board} board 
     */
    *iterNetwork(board) {
        for (let t of this.network) yield t;
    }
}

class EnemyTent extends Tile {
    /**@type {TileType} */
    code = 'ET';
    name = 'Enemy Tent';
    terrainPlacement = { 'p': 1, 'f': 1, 'm': 1, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    network = /**@type {Set<TerrainHex>}*/(new Set());
    health = 1;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyTent;
        this.updateProperties(props);
    }
    get needs() {
        return ProductionQuantity.from({ 'rs': this.health });
    }
    /**@type {Tile['draw']} */
    draw(app, ctx) {
        super.draw(app, ctx);
    }
    /**
     * 
     * @param {Board} board 
     * @param {TerrainHex} terr
     * @param {number} range 
     * @param {Set<TerrainHex>} sites 
     */
    updateNetwork(terr, board, range, sites) {
        /**@type {TerrainHex[]} */
        const newSites = [];
        for (let t of board.neighborIter(terr.hexPos)) {
            if (!sites.has(t)) {
                sites.add(t);
                newSites.push(t);
            }
        }
        if (range > 1) {
            for (let t of newSites) {
                if (!(t instanceof Water)) {
                    this.updateNetwork(t, board, range - 1, sites);
                }
            }
        }
    }
    /** @type {Tile['place']} */
    place(terr, centerPos, player, board) {
        super.place(terr, centerPos, player, board);
        this.network = new Set([terr]);
        this.updateNetwork(terr, board, 2, this.network);
    }
    /**
     * 
     * @param {Board} board 
     */
    *iterNetwork(board) {
        for (let t of this.network) yield t;
    }
}

class EnemyDragon extends Tile {
    /**@type {TileType}*/
    code = 'ED';
    name = 'Enemy Dragon';
    terrainPlacement = { 'p': null, 'f': null, 'm': 2, 'w': null };
    tileColor = colorString([0.7, 0.2, 0.2, 1.0]);
    textColor = 'red';
    health = 3;
    constructor(props = {}) {
        super();
        this.src = urlTileEnemyDragon;
        this.updateProperties(props);
    }
    get needs() {
        return ProductionQuantity.from({ 'rs': 1 });
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
        super();
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
                let ht = terrainClasses[terrainmap[i]].a({ hexPos: [x, y] });
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

class NetworkFlowEdge extends Widget {
    /** @type {Board|null} */
    board = null;
    /** @type {[number, number]} */
    fromHex = [0, 0];
    /** @type {[number, number]} */
    toHex = [0, 0];
    /** @type {ResourceType} */
    resource = 'rf';
    /** Highlighted style for focused edges */
    primary = false;

    // --- Pulse-related members ---

    /**
     * How many resource icons to show at once.
     * - For normal edges (from != to): one pulse, mainly used for “1 at a time”.
     * - For self-loops: icons are spaced around a circle.
     */
    resourceCount = 1;

    /**
     * Duration of a single pulse in milliseconds.
     * A pulse = one traversal from start to end, or one full revolution for loops.
     */
    pulseTime = 1000;

    /**
     * Number of pulses before finishing.
     * - >0  → run that many pulses, then stop.
     * -  0  → repeat forever.
     */
    pulseCount = 0;

    /**
     * Delay before the *first* pulse starts (in ms).
     * During this time, nothing is drawn and no pulses are emitted.
     */
    startDelay = 0;

    /**
     * Delay *between* pulses (in ms).
     * After each pulse finishes, the icon disappears for this long before
     * the next pulse begins.
     */
    pulseDelay = 0;

    /** Total elapsed time since creation (ms) */
    _time = 0;
    /** Elapsed time within current pulse+delay cycle (ms) */
    _cycleElapsed = 0;
    /** Total pulses completed so far */
    _pulsesDone = 0;
    /** Whether this edge should draw this frame */
    _visibleThisFrame = true;

    /**
     * Normalized 0..1 position of the *current* pulse.
     * For non-loops: 0 at edge start, 1 at edge end.
     * For loops: 0..1 = full revolution around the hex.
     */
    phase = 0;

    // Leftover speed param (if you want to reintroduce speed-based motion)
    speed = 1;

    /** @type {Map<string, HTMLImageElement>} */
    static _iconCache = new Map();

    /** Optional phase memory from older version; kept for compatibility */
    /** @type {Map<string, number>} */
    static _phaseMem = new Map();

    // Resource colors for your short codes
    static resColor = {
        rw: 'rgba(210,165, 70,0.95)', // workers
        rf: 'rgba(100,185,100,0.95)', // food
        rt: 'rgba(167,115, 58,0.95)', // timber
        ro: 'rgba(140,140,140,0.95)', // ore
        rb: 'rgba(140,120,210,0.95)', // blessing
        rs: 'rgba(210, 60, 60,0.95)', // soldiers
        rm: 'rgba(200,160,100,0.95)', // money
        ri: 'rgba( 60,140,210,0.95)', // influence
    };

    _edgeKey() {
        const [fx, fy] = this.fromHex, [tx, ty] = this.toHex;
        return `${fx},${fy}->${tx},${ty}:${this.resource}`;
    }

    centerOf(hex) {
        if (!this.board) return { x: 0, y: 0 };
        const [x, y] = this.board.pixelPos(hex);
        return { x, y };
    }

    ctrlPoint(a, b) {
        const mx = (a.x + b.x) * 0.5;
        const my = (a.y + b.y) * 0.5;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const bow = Math.min((this.board?.hexSide ?? 16) * 0.4, len * 0.12);
        return { x: mx + nx * bow, y: my + ny * bow };
    }

    /** @type {Widget['update']} */
    update(app, millis) {
        // Let children update first if any (usually none)
        for (const c of this.children) c.update(app, millis);

        const activeForever = (this.pulseCount === 0);
        const maxPulses = this.pulseCount;

        // If we've already finished all pulses (finite case), nothing more to animate
        if (!activeForever && this._pulsesDone >= maxPulses) {
            this._visibleThisFrame = false;
            this.phase = 1;
            return;
        }

        const prevTime = this._time;
        this._time += millis;

        // Time available for pulse cycles this frame (after startDelay)
        let activeDt = 0;
        if (prevTime >= this.startDelay) {
            activeDt = millis;
        } else if (this._time > this.startDelay) {
            activeDt = this._time - this.startDelay;
        }

        // Before startDelay: nothing visible, but keep requesting frames
        if (activeDt <= 0) {
            this._visibleThisFrame = false;
            this.phase = 0;
            app.requestFrameUpdate();
            return;
        }

        const cycleLen = this.pulseTime + this.pulseDelay;

        // Degenerate case: no real timing, just pin at start
        if (cycleLen <= 0 || this.pulseTime <= 0) {
            this._visibleThisFrame = true;
            this.phase = 0;
            app.requestFrameUpdate();
            return;
        }

        this._cycleElapsed += activeDt;

        // Handle completed cycles (pulse + delay)
        while (this._cycleElapsed >= cycleLen) {
            this._cycleElapsed -= cycleLen;
            this._pulsesDone++;

            // Notify listeners that a pulse has completed
            this.emit('pulse', { pulsesDone: this._pulsesDone });

            if (!activeForever && this._pulsesDone >= maxPulses) {
                this._visibleThisFrame = false;
                this.phase = 1;
                return;
            }
        }

        // Within current cycle: [0, pulseTime) is active; [pulseTime, cycleLen) is gap
        let visible = true;
        let tInPulse = this._cycleElapsed;

        if (this._cycleElapsed >= this.pulseTime) {
            // In the inter-pulse delay: hide the icon
            visible = false;
            tInPulse = this.pulseTime;
        }

        this._visibleThisFrame = visible;

        if (this.pulseTime > 0) {
            this.phase = Math.min(1, tInPulse / this.pulseTime);
        } else {
            this.phase = 0;
        }

        // Keep animating
        app.requestFrameUpdate();
    }

    /** @type {Widget['draw']} */
    draw(app, ctx) {
        if (!this.board) return;
        if (!this._visibleThisFrame) return;

        const a = this.centerOf(this.fromHex);
        const b = this.centerOf(this.toHex);
        const isLoop = (this.fromHex[0] === this.toHex[0] &&
                        this.fromHex[1] === this.toHex[1]);

        const src = gameImages[this.resource];
        if (!src) return;

        let img = NetworkFlowEdge._iconCache.get(src);
        if (!img) {
            img = new Image();
            img.src = src;
            NetworkFlowEdge._iconCache.set(src, img);
        }
        if (!img.complete) {
            app.requestFrameUpdate();
            return;
        }

        const side = this.board.hexSide ?? 16;
        const size = side * (this.primary ? 0.40 : 0.3);
        const color = NetworkFlowEdge.resColor[this.resource] ?? 'rgba(255,255,255,0.8)';

        ctx.save();

        if (isLoop) {
            // === Self-loop: orbit around the tile ===
            const cx = a.x;
            const cy = a.y;
            const radius = side * (this.primary ? 0.55 : 0.45);
            const baseAngle = -Math.PI/2 + (this.phase % 1) * Math.PI * 2;

            const count = Math.max(1, this.resourceCount | 0);

            for (let i = 0; i < count; i++) {
                const angle = baseAngle + (2 * Math.PI * i) / count;
                const px = cx + Math.cos(angle) * radius;
                const py = cy + Math.sin(angle) * radius;

                // Small glow for primary
                if (this.primary) {
                    ctx.globalAlpha = 0.35;
                    ctx.beginPath();
                    ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }

                ctx.globalAlpha = this.primary ? 0.95 : 0.85;
                ctx.drawImage(img, px - size / 2, py - size / 2, size, size);
            }

            ctx.restore();
            return;
        }

        // === Normal edge: single pulse moving along a bowed curve ===

        const cpt = this.ctrlPoint(a, b);

        const ax = a.x, ay = a.y;
        const bx = b.x, by = b.y;
        const cxp = cpt.x, cyp = cpt.y;

        const startFrac = 0.12;
        const endFrac   = 0.88;
        const span      = endFrac - startFrac;

        // Map phase(0..1) into a position along the usable part of the curve
        const tCurve = startFrac + (this.phase % 1) * span;

        /** @type {(t:number)=>{px:number, py:number}} */
        const bezierPoint = (t) => {
            const u  = 1 - t;
            const uu = u * u;
            const tt = t * t;
            const px = uu * ax + 2 * u * t * cxp + tt * bx;
            const py = uu * ay + 2 * u * t * cyp + tt * by;
            return { px, py };
        };

        const { px, py } = bezierPoint(tCurve);

        // Fade in/out a bit near ends
        const localT   = this.phase % 1;
        const fadeEdge = Math.sin(Math.PI * localT); // 0 at 0/1, 1 at 0.5
        const alphaBase = (this.primary ? 0.95 : 0.80) * (0.3 + 0.7 * fadeEdge);

        // Optional glow for primary edges
        if (this.primary && fadeEdge > 0.1) {
            ctx.globalAlpha = 0.35 * fadeEdge;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Resource icon
        ctx.globalAlpha = alphaBase;
        ctx.drawImage(img, px - size / 2, py - size / 2, size, size);

        ctx.restore();
    }
}

class NetworkTileOverlay extends Widget {
    hexPos = [0, 0];
    primary = false;
    input = '';
    output = '';
    constructor() {
        super();
        this.updateIO();
    }
    updateIO() {
        this.outlineColor = this.primary ? 'rgba(238, 73, 22, 1)' : 'rgba(208, 212, 240,1)';
        // this.bgColor = null; // this.primary ? 'rgba(208, 212, 0, 0.5)' : null;
        const inputColor = 'rgba(192,100,100,0.9)';
        const outputColor = this.primary ? 'rgba(100,185,100,0.9)' : 'rgba(100,100,192,0.9)';
        if (this.input !== '' && this.output !== '') {
            this.children = [
                ImageWidget.a({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x: 0, y: 0 }, bgColor: null }),
                ImageWidget.a({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right: 1, bottom: 1 }, bgColor: null })
            ];
        }
        else if (this.input !== '') {
            this.children = [
                ImageWidget.a({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x: 0, y: 0 }, bgColor: null }),
            ];
        }
        else if (this.output !== '') {
            this.children = [
                ImageWidget.a({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right: 1, bottom: 1 }, bgColor: null })
            ];
        } else {
            this.children = [];
        }
    }
}

class TileInfoPane extends Widget {
    constructor() {
        super();
        /**@type {Board|null} */
        this.board = null;
        /**@type {Tile|null} */
        this.tile = null;
        this.tileImage = ImageWidget.a({ hints: { x: 0, y: '0.0', h: '1.0', w: '1.0' } }), //Tile & name
            this.terrainLabel = Label.a({ align: 'left', hints: { x: 0, y: '1.0', h: '0.75', w: 1 } }), //Terrain
            this.terrainBox = BoxLayout.a({ orientation: 'horizontal', hints: { x: 0, y: '1.75', w: 1.0, h: '1.5' } }),
            this.resourceInLabel = Label.a({ align: 'left', text: 'Inputs', hints: { x: 0, y: '3.25', w: 1.0, h: '0.75' } }),
            this.resourceInBox = BoxLayout.a({ orientation: 'horizontal', hints: { x: 0, y: '4.0', w: 1.0, h: '1.5' } }),
            this.resourceOutLabel = Label.a({ align: 'left', text: 'Outputs', hints: { x: 0, y: '5.5', w: 1.0, h: '0.75' } }),
            this.resourceOutBox = BoxLayout.a({ orientation: 'horizontal', hints: { x: 0, y: '6.25', w: 1.0, h: '1.5' } }),
            this.tileDescription = Label.a({ align: 'left', fontSize: '0.325', wrap: true, hints: { x: 0, y: '7.75', h: null, w: '10' } }),
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
        const terrain = this.board?.terrainMap.atPos(...this.tile.hexPos);
        if (terrain !== undefined) {
            this.terrainLabel.text = terrainNames[terrain.code];
            const tbox = BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[terrain.code] }),
                    Label.a({ text: `${this.tile.terrainPlacement[terrain.code]}`, hints: { h: 0.5 } })
                ],
            });
            this.terrainBox.children = [tbox];
            this.terrainBox.hints.w = `${this.terrainBox.children.length}`;

            //Input resource status
            const needs = this.tile.needs;
            const needsFilled = this.tile.needsFilled;
            const riBoxChildren = [...needs.keys()].map((resourceType) => BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[resourceType] }),
                    Label.a({ text: `${needsFilled.get(resourceType)?.length ?? 0}/${needs.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceInBox.children = riBoxChildren;
            this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;

            //Output resource status
            const prodCapacity = this.tile.productionCapacity;
            const prodRequested = this.tile.productionFilled;
            const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[resourceType] }),
                    Label.a({ text: `${prodRequested.get(resourceType)?.length ?? 0}/${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceOutBox.children = roBoxChildren;
            this.resourceOutBox.hints.w = `${this.resourceOutBox.children.length}`;
        } else {
            this.terrainLabel.text = 'Terrain placement and output bonus';
            const tp = this.tile.terrainPlacement;
            const tboxChildren = Object.keys(tp).filter(terrainType => tp[terrainType] !== null).map((terrainType) => BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[terrainType] }),
                    Label.a({ text: `${tp[terrainType]}`, hints: { h: 0.5 } })
                ]
            }));
            this.terrainBox.children = tboxChildren;
            this.terrainBox.hints.w = `${this.terrainBox.children.length}`;

            //Input resource needed
            const needs = this.tile.needs;
            const riBoxChildren = [...needs.keys()].map((resourceType) => BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[resourceType] }),
                    Label.a({ text: `${needs.get(resourceType)}`, hints: { h: 0.5 } })
                ]
            }));
            this.resourceInBox.children = riBoxChildren;
            this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;

            //Output resource produced
            const prodCapacity = this.tile.productionCapacity;
            const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => BoxLayout.a({
                orientation: 'vertical',
                children: [
                    ImageWidget.a({ src: gameImages[resourceType] }),
                    Label.a({ text: `${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
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
    on_orientation(event, object, value) {
        if (this.terrainMap) {
            for (let t of this.terrainMap.iter()) {
                t.orientation = value;
            }
        }
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
        yield terr;
        visited.add(terr);
        //All adjacent tiles are connected
        if (terr.tile !== null && terr.tile instanceof Castle) {
            castles.add(terr);
        }
        for (let t of this.connectedAdjacentPriority(terr)) {
            if (visited.has(t)) continue;
            yield t;
            visited.add(t);
        }
        //Adjacent tiles of adjacent own castles are also connected
        for (let t of this.connectedAdjacentPriority(terr)) {
            if (t.tile && player.placedTiles.includes(t.tile)) {
                if (t.tile instanceof Castle) {
                    castles.add(t);
                    for (let tc of this.connectedAdjacentPriority(t)) {
                        if (visited.has(tc)) continue;
                        yield tc;
                        visited.add(tc);
                    }
                    // for (let tn of t.tile.network) {
                    //     castles.add(tn);
                    // }
                }
            }
        }
        // If the terrain is in a port we return all other terrain served by the Tradeship
        for (let ship of player.placedTiles) {
            if (ship instanceof Tradeship) {
                if (!ship.network.has(terr)) continue;
                for (let tp of ship.network) {
                    if (visited.has(tp)) continue;
                    yield tp;
                    visited.add(tp);
                }
            }
        }
        //All castles connected are connected to all other castles in range 
        for (let tc of castles) {
            if (tc.tile !== null && tc.tile instanceof Castle) {
                for (let tn of tc.tile.network) {
                    if (!visited.has(tn)) yield tn;
                    visited.add(tn);
                    for (let tnAdj of this.connectedAdjacentPriority(tn)) {
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
    connectedAdjacentPriority(terr) {
        let neighbors = [...this.neighborIter(terr.hexPos)];
        neighbors.sort((a, b) => {
            if (a.tile === null && b.tile === null) return 0;
            if (a.tile === null) return 100;
            if (b.tile === null) return -100;
            return tilePriority[a.tile.code] - tilePriority[b.tile.code]
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

    /**
     * 
     * @param {[number, number]} hexPos 
     * @param {number} range
     * @param {Set<TerrainHex>} visited 
     * @yields {TerrainHex}
     */
    *neighborIterInRange(hexPos, range, visited = new Set()) {
        const terr = this.terrainMap.atPos(hexPos[0], hexPos[1]);
        if (!terr) return;
        visited.add(terr);
        for (let t of this.neighborIter(hexPos)) {
            if (visited.has(t)) continue;
            yield t;
            if (range > 1) {
                yield* this.neighborIterInRange(t.hexPos, range - 1, visited);
            }
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
            Label.a({ text: text, hints: { w: null } }),
            ImageWidget.a({ src: iconSrc })
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
            c.listen('touch_down', (e, o, v) => {
                if (this.active && /**@type {Widget}*/(o).collide(v.rect)) {
                    for (let c of this.children) /**@type {Tile}*/(c).selected = false;
                    if (this.selectedTile === o) {
                        this.selectedTile = null;
                        /**@type {Tile}*/(o).selected = false;
                    } else {
                        this.selectedTile =/**@type {Tile}*/(o);
                        /**@type {Tile}*/(o).selected = true;
                    }
                    return true;
                };
                return false;
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


const olgGameDescription = `Welcome to the Island Chains Prototype
                    
Overview: Island Chains is a turn based city building game where you manage production chains between buildings. You play the game over 10 rounds and in each round you can place up to 5 buildings (aka tiles) onto the hex squares. Instead of stockpiling resources, the production chaining in the game is centered on input fulfillment to activate buildings. So for example, there are villages, farms, and mines that respectively produce 2 workers, 2 food (if placed on a plain), and 1 or more ore. Most buildings will require workers to activate and some will additionally require ore and food. A village requires food and a farm requires workers so if you place them side by side you will activate both. Place a mine next to them and it will start producing ore. 

Once activated, buildings produce their resource(s), which can then be fed into other buildings. By default, buildings can only share their resources with adjacent tiles, but ships and castles let you break that rule by essentially acting as a resource router between everything they are connected to. Castles are also interconnected with other nearby castles so every building they are routing can share resources with buildings routed to other castles. There are also Strongholds, providing defenses, and Abbeys, providing blessings (aka building productivity boost). The game handles figuring out what resources to rout to what buildings but I'm thinking about allowing players to override the allocations building in a future update.

Playing a round: To play a round you will simply click on a building on the left pane (or bottom of the screen in portrait mode) then click an circled place on the map to place it. The +X indicator gives you a production boost if the building is placed in that spot.

Building and activations: buildings are activated when they have been supplied with their required resources (the blessing resource is optional for some buildings and provided a production bonus). If a building is missing some resources it will show that icon in red. If an activated building has resources that are not being used, they will appear in green. If you click on one of your placed buildings you will see information about it's required and produced resources as well as the network of spaces it is connected to.

Military: Between rounds, enemy buildings spawn and will require assigning military might to them to defeat them, otherwise they will continue to spread out and destroy nearby buildings. 

End game: The game will end at the conclusion of your 10th round. In this prototype, you score points by activating as many castles as you can, with each active castle producing power points at the end of the round. 
`

const gameDescription = `Island Chains – Prototype Overview
==================================================================

Island Chains is a turn-based hex-grid city-builder about managing production chains. The core twist: the game has no resource stockpiles. Instead you activate buildings by connecting them with buildings that provide their inputs. Buildings are active in turns where their required inputs are supplied through the network of connected structures. When active, their outputs will immediately flow to other buildings within range that need them.

You play through 10 rounds, placing up to five buildings per round to expand your island economy and defend against enemies.

Core Loop: Place Buildings → Form Chains → Trigger Production
==================================================================

Each building has:

- Inputs (resources it needs to activate)
- Outputs (resources it produces this turn if activated)
- Terrain bonuses (extra output when built on certain terrain)

For example:

- Village → Workers (needs: Food)
- Farm → Food (needs: Workers, production bonus: plains or forest)
- Mine → Ore (needs: Workers, production bonus: mountains)

If you place a Farm next to a Village, they will power each other:
Workers → Farm → Food → Village → more Workers.

Because resources don’t accumulate, activation depends entirely on whether inputs can be satisfied in that turn based on the current network.

Resource Flow & Routing
==================================================================

By default, resources only flow between adjacent tiles, creating small local networks. Placing buildings strategically to maximize the linkages. A single building will often be able to fulfill the needs of more than one building.

Two special buildings break the adjacency rule and form larger shared networks:

1. Castles — Large-Scale Routing Hubs

- All buildings adjacent to a Castle can share resources with one another.
- All Castles within range 3 link their adjacency groups into one larger network.
- A supplied Castle produces Influence, which is your score in the prototype.

Castles act as the backbone of long-distance production chains.

2. Tradeships — Water Network Routers

- Tradeships are placed on water, but create a supply network spanning all tiles reachable over water within range 3 of the ship.
- Any structures touching those tiles can share resources via the Tradeship.
- Tradeships serve as flexible “floating supply lines” for connecting distant regions.

Boosts & Modifiers
==================================================================

Blessings (Abbeys): Abbeys produce Blessings when supplied with Workers and Food. Many buildings get bonus output if Blessings are present, but can still function without them.

Terrain Bonuses: Some buildings gain extra output when built on favorable terrain. A “+X” indicator appears when placing a tile to show this.

Playing a Round
==================================================================

1. Pick a building from your available pieces.

2. Click a highlighted hex to place it (placement bonuses are highlighted).

3. The game then:

  - Updates the network based on adjacencies, castles, and tradeships,

  - Determines which buildings receive the inputs they need,

  - Activates every building whose inputs can be supplied this turn (including combat), and

  - Routes resulting outputs to any connected buildings that require them

Repeat until you have placed 5 buildings.

You can inspect your network at any time. Click any placed building during a round to view:

  - Its inputs and outputs

  - Which requirements are met / unmet

  - How it is connected through adjacency, castle, and tradeship networks

Clicking buildings in the action bar provies summary information about that building type.

Military & Enemies
==================================================================

Between rounds, enemy structures appear and expand outward.

Your Strongholds, when supplied with Workers and Ore, generate Military Strength that automatically attacks nearby enemies.

Unopposed enemies will destroy your buildings, leaving behind Rubble that can later be built over.

End of Game
==================================================================

After 10 rounds, the game ends.

In this prototype, each activated Castle's influence produces 2 points at the end of the round and each Tradeship's coin produces 1 point.

In round 10 all active buildings with no unused resources scores 1 point.

Building efficient production networks and well-placed Castles and Tradeships is the key to high scores.`

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
        /**@type {Tile|null} */
        this.hoverTile = null;
        /**@type {[Tile, TerrainHex][]} */
        this.roundPlacements = [];
        this.bgColor = 'rgba(25, 102, 153, 1.0)'; //'Ocean Blue';

        //Idle animation trackers
        /** @type {boolean} */
        this.idleFlowActive = false;
        /** @type {number} */
        this.idleFlowTileIndex = 0;
        /** @type {number} */
        this.idleFlowOutputIndex = 0;

        /**@type {[number, number]} */
        this.selectPos = [0, 0];
        this.board = Board.a({ hints: { right: 1, y: 0, w: '1h', h: 1 } });
        this.addChild(this.board);
        this.tileInfoPane = TileInfoPane.a({ board: this.board, hints: { x: '0.14wh', y: '1.0', w: '0.5h', h: 1 } });
        this.addChild(this.tileInfoPane)
        this.placementLayer = Widget.a({ hints: { x: 0, y: 0, w: 1, h: 1 } });
        this.addChild(this.placementLayer);
        this.scoreboard = BoxLayout.a({ hints: { right: 0.99, y: 0.01, w: 1, h: 0.05 } });
        this.addChild(this.scoreboard);
        this.statusLabel = Label.a({ text: '', color: 'white', align: 'left', hints: { x: 0.01, y: 0.01, w: 1, h: '1.0' } });
        this.addChild(this.statusLabel);
        this.actionBar = ActionBar.a({ hints: { x: 0, y: '1.0', w: '0.14wh', h: 0.84 }, bgColor: 'gray', outlineColor: 'white' });
        this.addChild(this.actionBar);
        this.actionBar.listen('selectedTile', (e, o, v) => this.selectTile(e, o, v, null));
        this.nextButton = Button.a({
            text: 'End round',
            hints: { right: 0.99, bottom: 0.99, w: 0.1, h: 0.05 },
            on_press: (e, o, v) => this.finishTurn()
        });
        this.undoButton = Button.a({
            text: 'Undo',
            hints: { right: 0.88, bottom: 0.99, w: 0.1, h: 0.05 },
            on_press: (e, o, v) => this.undoLastTile(),
        });
        this.instrButton = Button.a({
            text: 'Instructions',
            hints: { x: 0.01, bottom: 0.99, w: null, h: 0.05 },
            on_press: (e, o, v) => {
                ModalView.a({ hints: { x: 0.2, y: 0.2, w: 0.6, h: 0.6 }, bgColor: 'rgba(75, 152, 203, 0.8)' })
                    .c(ScrollView.a({scrollW: false, hints: {x:0, y:0, w:1, h:1}}).c(
                        Label.a({
                            text: gameDescription,
                            richText: false,
                            wrap: true,
                            align: 'left',
                            hints: {h:null},
                            fontSize: '0.5',
                        })
                    )).popup();
            }
        });
        this.addChild(this.undoButton);
        this.addChild(this.nextButton);
        this.addChild(this.instrButton);
    }

    hideIdleFlow() {
        if (!this.idleFlowActive) return;

        // Remove any NetworkFlowEdge from the placement layer,
        // but leave other overlays (if any) alone.
        if (this.placementLayer) {
            this.placementLayer.children = this.placementLayer.children.filter(
                (w) => !(w instanceof NetworkFlowEdge)
            );
        }

        this.idleFlowActive = false;
        // this.idleFlowTileIndex = 0;
        // this.idleFlowOutputIndex = 0;
    }

    nextIdleFlow() {
        // Remove any existing NetworkFlowEdge from the overlay
        if (this.placementLayer) {
            this.placementLayer.children = this.placementLayer.children.filter(
                (w) => !(w instanceof NetworkFlowEdge)
            );
        }

        const board = this.board;
        if (!board) {
            this.hideIdleFlow();
            return;
        }

        const player = this.players[this.activePlayer];
        if (!player) {
            this.hideIdleFlow();
            return;
        }

        const tiles = player.placedTiles.slice();
        if (tiles.length === 0) {
            this.hideIdleFlow();
            return;
        }

        // Deterministic tile order: by row, then column
        tiles.sort((a, b) => {
            const ar = a.hexPos[1], br = b.hexPos[1];
            if (ar !== br) return ar - br;
            const ac = a.hexPos[0], bc = b.hexPos[0];
            return ac - bc;
        });

        // Keep indices in range in case tile count changed
        if (this.idleFlowTileIndex < 0 || this.idleFlowTileIndex >= tiles.length) {
            this.idleFlowTileIndex = 0;
            this.idleFlowOutputIndex = 0;
        }

        /** @type {ResourceType[]} */
        const resourceOrder = /** @type {any} */ ([
            'rw', // Workers
            'rf', // Food
            'rt', // Timber
            'ro', // Ore
            'rb', // Blessing
            'rs', // Soldier
            'rm', // Money
            'ri', // Influence
        ]);

        // Try at most tiles.length times to find a tile with at least one output
        let tileChecks = 0;
        while (tileChecks < tiles.length) {
            const tile = tiles[this.idleFlowTileIndex];

            /** @type {{from:[number,number],to:[number,number],resource:ResourceType,unusedCount?:number}[]} */
            const outputs = [];

            // "Actively producing" tile?
            const activeProducer = tile.needsFilled.meets(tile.needs);

            if (activeProducer) {
                for (const res of resourceOrder) {
                    const cap = tile.productionCapacity.get(res) ?? 0;
                    if (!cap) continue;

                    const consumers = tile.productionFilled.get(res) ?? [];

                    // Deterministic consumer order: by row, then column
                    const sortedConsumers = consumers.slice().sort((a, b) => {
                        const ar = a.hexPos[1], br = b.hexPos[1];
                        if (ar !== br) return ar - br;
                        const ac = a.hexPos[0], bc = b.hexPos[0];
                        return ac - bc;
                    });

                    // 1) One output per *used* resource (each consumer)
                    for (const consTile of sortedConsumers) {
                        outputs.push({
                            from: tile.hexPos,
                            to: consTile.hexPos,
                            resource: res,
                            unusedCount: 0,
                        });
                    }

                    // 2) Single loop edge for *all* unused resources
                    const used = sortedConsumers.length;
                    const unused = Math.max(0, cap - used);
                    if (unused > 0) {
                        outputs.push({
                            from: tile.hexPos,
                            to: tile.hexPos,   // self-loop
                            resource: res,
                            unusedCount: unused,
                        });
                    }
                }
            }

            if (outputs.length === 0) {
                // No outputs on this tile; move to next tile and reset output index
                this.idleFlowTileIndex = (this.idleFlowTileIndex + 1) % tiles.length;
                this.idleFlowOutputIndex = 0;
                tileChecks++;
                continue;
            }

            // If we’ve exhausted outputs for this tile, move to next tile
            if (this.idleFlowOutputIndex >= outputs.length) {
                this.idleFlowTileIndex = (this.idleFlowTileIndex + 1) % tiles.length;
                this.idleFlowOutputIndex = 0;
                tile.updateResourceStatusIcons();
                tileChecks++;
                continue;
            }

            // Pick the current output
            const spec = outputs[this.idleFlowOutputIndex];

            // Advance for the *next* call
            this.idleFlowOutputIndex++;

            const isLoop =
                spec.from[0] === spec.to[0] &&
                spec.from[1] === spec.to[1];

            // For the loop edge, show one icon per unused resource
            const resourceCount = (isLoop && spec.unusedCount && spec.unusedCount > 0)
                ? spec.unusedCount
                : 1;

            tile.iconBox.children = [];
            // Create the new NetworkFlowEdge
            const edge = NetworkFlowEdge.a({
                hints: { x: 0, y: 0, w: '1w', h: '1h' },
                board: board,
                fromHex: spec.from,
                toHex: spec.to,
                resource: spec.resource,
                primary: true,   // idle overlay, not selected
                pulseTime: 2000,
                pulseCount: 1,
                resourceCount: resourceCount,
            });

            // When this pulse finishes, move to the next idle flow
            edge.listen('pulse', () => this.nextIdleFlow());

            this.placementLayer.children = [edge];
            this.idleFlowActive = true;
            return;
        }

        // If we get here: no tiles had outputs
        this.hideIdleFlow();
    }


    /**
     * 
     * @param {'horizontal'|'vertical'} orienation 
     */
    setLayoutForOrientation(orienation) {
        if (orienation === 'horizontal') {
            this.board.hints = { right: 1, y: 0, w: '1h', h: 1 };
            this.board.orientation = 'horizontal';
            this.tileInfoPane.hints = { x: '0.14wh', y: '1.0', w: '0.5h', h: 1 };
            this.placementLayer.hints = { x: 0, y: 0, w: 1, h: 1 };
            this.scoreboard.hints = { right: 0.99, y: 0.01, w: 1, h: '1.0' };
            this.statusLabel.hints = { x: 0.01, y: 0.01, w: 1, h: '1.0' };
            this.actionBar.hints = { x: 0, y: '1.0', w: '0.14wh', h: 0.84 };
            this.actionBar.orientation = 'vertical';
            this.nextButton.hints = { right: 0.99, bottom: 0.99, w: 0.1, h: '1.0' };
            this.undoButton.hints = { right: 0.88, bottom: 0.99, w: 0.1, h: '1.0' };
            this.instrButton.hints = { x: 0.01, bottom: 0.99, w: 0.15, h: '1.0' };
        } else if (orienation === 'vertical') {
            this.board.hints = { center_x: 0.5, y: '2.0', w: 1, h: '1w' };
            this.board.orientation = 'vertical';
            this.tileInfoPane.hints = { x: 0, y: '1w', w: 1, h: 1 };
            this.placementLayer.hints = { x: 0, y: 0, w: 1, h: 1 };
            this.scoreboard.hints = { right: 0.99, y: 0.0, w: 1, h: '1.0' };
            this.statusLabel.hints = { x: 0.01, y: '1.0', w: 1, h: '1.0' };
            this.actionBar.hints = { x: 0, bottom: 1, w: 1, h: '2.0' };
            this.actionBar.orientation = 'horizontal';
            this.nextButton.hints = { right: 0.99, y: '1.0', w: 0.1, h: '1.0' };
            this.undoButton.hints = { right: 0.99, y: '2.2', w: 0.1, h: '1.0' };
            this.instrButton.hints = { right: 0.99, y: '3.4', w: 0.15, h: '1.0' };
        }
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
        for (let p of this.players) {
            p.placedTiles = p.placedTiles.filter(t0 => t0 !== tile);
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
            //     t.network = new Set([terr]);
            //     t.updatePorts(terr, this.board, 3, t.network);
            // }
            if (t instanceof Castle) {
                t.network = new Set([terr]);
                t.updateNetwork(terr, this.board, 3, t.network);
            }
        }
        this.tileInfoPane.tile = tile;
        this.actionBar.selectedTile = null;
        this.roundPlacements.push([tile, thex]);
        this.undoButton.disable = false;
        if (advanceTurn) {
            this.clearPlacementTargets();
            // this.nextPlayer();
        }
        if (player.scoreMarker.tilesPlacedThisTurn >= 5) {
            this.actionBar.active = false;
            this.statusLabel.text = 'End round'
        }
        this.displayTileNetworkInfo(player, null);
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
        if (!player.localControl) return true;
        if (terrain.tile) {
            const verb = !(terrain.tile instanceof Rubble) && terrain.tile.needsFilled.meets(terrain.tile.needs) ? 'Active' : 'Inactive';
            if (!(terrain.tile instanceof Rubble && this.actionBar.selectedTile !== null)) {
                this.actionBar.selectedTile = null;
                this.displayTileNetworkInfo(player, terrain);
                this.tileInfoPane.tile = terrain.tile;
                this.statusLabel.text = `${verb} ${tileNames[terrain.tile.code]}`;
                return true;
            }
            this.tileInfoPane.tile = terrain.tile;
        }
        if (this.actionBar.selectedTile === null) {
            this.displayTileNetworkInfo(player, terrain);
            this.tileInfoPane.tile = null;
            this.statusLabel.text = 'Select a building';
            return true;
        }
        const tile = this.actionBar.selectedTile;
        const tileToPlace = playerTileClasses[tile.code].a({});
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
                for (let port of t.network) {
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
        if (v === null) {
            this.clearPlacementTargets();
            this.tileInfoPane.tile = null;
            this.statusLabel.text = 'Select a building';
            return;
        }
        const player = this.players[this.activePlayer];
        this.displayTileNetworkInfo(player, null);
        if (player.scoreMarker.tilesPlacedThisTurn < 5) {
            // this.actionBar.active = true;
            if (v) {
                this.statusLabel.text = 'Place ' + v.name;
                this.setPlacementTargets(v.code);
                this.tileInfoPane.tile = v;
            } else {
                // this.wStateLabel.text = 'Select a building type';
                // this.clearPlacementTargets();
                // this.tileInfoPane.tile = null;
            }
        } else {
            if (this.actionBar.active) this.actionBar.active = false;
            this.clearPlacementTargets();
            this.tileInfoPane.tile = null;
            this.statusLabel.text = 'End round';
        }
    }

    updateResourceProduction() {
        const player = this.players[0];
        const enemy = this.players[1];
        if (!player || !enemy) return;
        // /**@type {ProductionChain} */
        // let totalProd = ProductionChain.from({});
        const placedTiles = [...player.placedTiles, ...enemy.placedTiles];
        placedTiles.sort((a, b) => tilePriority[a.code] - tilePriority[b.code]);
        const reversePlacedTiles = [...placedTiles];
        reversePlacedTiles.reverse();
        for (let tile of placedTiles) {
            tile.needsFilled.clear();
            tile.productionFilled.clear();
        }
        let changes = true;
        // Deactivated users is a mapping from tiles that produce an input to the Sete of users of the input
        // that are no longer eligible to receive the input
        /**@type {Map<Tile, Set<Tile>>} */
        const deactivatedUsers = new Map();
        for (let t of placedTiles) {
            deactivatedUsers.set(t, new Set());
        }
        let loops = 0;
        console.log('==============Starting resource production allocation==============');
        while (changes && loops < 10) {
            ++loops;
            console.log('--------------Loop', loops, '-----------------------------------------------');
            changes = false;
            // For each tile from highest to lowest tile priority, provide the resources it needs 
            // from other tiles it is connected to in the network sorted in priority from closest 
            // to furthest (with ties determined by tile priority)
            for (let tile of placedTiles) {
                let terr0 = this.board._terrainMap.atPos(tile.hexPos[0], tile.hexPos[1]);
                if (terr0 === undefined) continue;
                for (let terr of this.board.connectedIter(terr0, player, new Set(), new Set())) {
                    const adjTile = terr.tile;
                    if (adjTile === null) continue;
                    const conn = /**@type {Set<Tile>}*/(deactivatedUsers.get(tile));
                    if (conn.has(adjTile) && !tile.needsFilled.meets(tile.needs)) continue; //Ignored deactivated connections
                    for (let need of adjTile.needs.keys()) {
                        const neededAmt = adjTile.needs.get(need);
                        const neededAmtFilled = adjTile.needsFilled.get(need) ?? [];
                        if (neededAmt === undefined) continue;
                        if (neededAmt === 0 && neededAmtFilled.length >= 1 || neededAmt > 0 && neededAmtFilled.length >= neededAmt) continue;
                        if (!tile.productionCapacity.has(need)) continue;
                        const providedAmt = tile.productionCapacity.get(need);
                        if (providedAmt === undefined) continue;
                        if ((tile.productionFilled.get(need) ?? []).length >= providedAmt) continue;
                        tile.productionFilled.addConnection(need, adjTile);
                        adjTile.needsFilled.addConnection(need, tile);
                        changes = true;
                        console.log('connected', tile, ...tile.hexPos, '->', adjTile, ...adjTile.hexPos, need);
                    }
                }
            }
            if (changes) continue;
            // Now we remove needsFilled and productionRequested of the next tile lacking the needed resources or 
            // whose producer does not have the resource it needs to activate
            for (let tile of reversePlacedTiles) {
                for (let need of tile.needsFilled.keys()) {
                    const suppliers = tile.needsFilled.get(need) ?? [];
                    const activeSuppliers = suppliers.filter((sTile) => sTile.needsFilled.meets(sTile.needs));
                    const inactiveSuppliers = suppliers.filter((sTile) => !sTile.needsFilled.meets(sTile.needs));
                    if (inactiveSuppliers.length > 0) {
                        for (let t of inactiveSuppliers) {
                            tile.needsFilled.removeConnection(need, t);
                        }
                        for (let is of inactiveSuppliers) {
                            is.productionFilled.removeConnection(need, tile);
                            deactivatedUsers.get(is)?.add(tile);
                            console.log('deactivated', is, ...is.hexPos, '->', need, tile, ...tile.hexPos);
                        }
                        changes = true;
                    }
                }
                if (changes) {
                    if (!tile.needsFilled.meets(tile.needs)) {
                        //Clear out the production link from tiles that are supplying this one
                        //Some of these may come back on the next iteration except for the deactivateConnections
                        for (let n of tile.needsFilled.keys()) {
                            const nfts = tile.needsFilled.get(n);
                            if (nfts === undefined) continue;
                            for (let nft of nfts) {
                                if (nft.productionFilled.removeConnection(n, tile)) {
                                    console.log('unlinked', nft, ...nft.hexPos, '->', tile, ...tile.hexPos, n);
                                }
                            }
                        }
                        //Clear out the needsFilled of tiles that this tile supplies
                        //Some of these may come back on the next iteration except for the deactivateUsers
                        for (let n of tile.productionFilled.keys()) {
                            const users = tile.productionFilled.get(n);
                            if (users !== undefined) {
                                for (let p of users) {
                                    if (p.needsFilled.removeConnection(n, tile)) {
                                        console.log('unlinked', tile, ...tile.hexPos, '->', p, ...p.hexPos, n);
                                    }
                                }
                            }
                        }
                        if (tile.productionFilled.size > 0) {
                            tile.productionFilled.clear();
                        }
                        changes = true;
                    }
                    break;
                }
            }
        }
        if (loops >= 1000) {
            console.log('Exceeded loop limit during resource produciton allocation');
        }

        for (let tile of placedTiles) {
            // totalProd = totalProd.add(tile.productionRequested);
            tile.updateResourceStatusIcons();
        }
    }

    on_touch_down(e, o, touch) {
        if (!super.on_touch_down(e, o, touch)) {
            if (this.collide(touch.rect)) {
                this.displayTileNetworkInfo(this.players[this.activePlayer], null);
                this.statusLabel.text = 'Select a building';
                this.tileInfoPane.tile = null;
                if (this.actionBar.selectedTile !== null) {
                    this.actionBar.selectedTile = null;
                }
            }
            return true;
        }
        return false;
    }
    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex|null} terrain 
     */
    displayTileNetworkInfo(player, terrain) {
        if (terrain === null || terrain.tile === null) {
            for (let t of player.placedTiles) t.showResourceStatus = true;
            this.placementLayer.children = [];
            // Enter / continue idle-flow mode
            this.nextIdleFlow();
            return;
        }
        for (let t of player.placedTiles) t.showResourceStatus = false;

        const edges = [];
        const nodes = [];

        const srcTerr = terrain;
        const srcTile = terrain.tile;

        if (srcTile) {
            /** @type {ResourceType[]} */
            const resourceOrder = /** @type {any} */ ([
                'rw', 'rf', 'rt', 'ro', 'rb', 'rs', 'rm', 'ri'
            ]);

            const activeProducer = srcTile.needsFilled.meets(srcTile.needs);

            // === 1) INCOMING: producers → hovered consumer ===
            // Only shows for needs that are actually filled (as per needsFilled).
            for (const [res, arr] of srcTile.needsFilled) {
                const prodTiles = arr ?? [];
                for (const prodTile of prodTiles) {
                    edges.push(NetworkFlowEdge.a({
                        hints: { x: 0, y: 0, w: '1w', h: '1h' }, // cover overlay layer
                        board: this.board,
                        fromHex: prodTile.hexPos,
                        toHex: srcTerr.hexPos,
                        resource: res,
                        primary: true,
                        pulseTime: 800,
                        pulseCount: 0,   // keep pulsing while selected
                        startDelay: 0,   // incoming flows start first
                        pulseDelay: 1200,
                    }));
                }
            }

            // === 2) OUTGOING: hovered producer → consumers, plus loop for unused ===
            // Only if tile is actively producing (all needs met).
            if (activeProducer) {
                for (const res of resourceOrder) {
                    const cap = srcTile.productionCapacity.get(res) ?? 0;
                    if (!cap) continue;

                    const consumers = srcTile.productionFilled.get(res) ?? [];

                    // A) one edge per consumer (used output)
                    for (const consTile of consumers) {
                        edges.push(NetworkFlowEdge.a({
                            hints: { x: 0, y: 0, w: '1w', h: '1h' },
                            board: this.board,
                            fromHex: srcTerr.hexPos,
                            toHex: consTile.hexPos,
                            resource: res,
                            primary: true,
                            pulseTime: 800,
                            pulseCount: 0,
                            // start slightly after incoming so it feels like
                            // "resources arrive, then flow out"
                            startDelay: 1000,
                            pulseDelay: 1200,
                        }));
                    }

                    // B) loop for unused production (only when active)
                    const used = consumers.length;
                    const unused = Math.max(0, cap - used);

                    if (unused > 0) {
                        edges.push(NetworkFlowEdge.a({
                            hints: { x: 0, y: 0, w: '1w', h: '1h' },
                            board: this.board,
                            fromHex: srcTerr.hexPos,
                            toHex: srcTerr.hexPos,   // self-loop
                            resource: res,
                            primary: true,
                            resourceCount: unused,   // one orbiting icon per unused unit
                            pulseTime: 1000,
                            pulseCount: 0,           // keep spinning while selected
                            startDelay: 1000,         // sync with outgoing
                            pulseDelay: 1000,
                        }));
                    }
                }
            }
        }

        // Node overlays (unchanged, still just markers)
        for (let terr of this.board.connectedIter(terrain, player, new Set(), new Set())) {
            const nto = NetworkTileOverlay.a({
                w: this.board.hexSide, h: this.board.hexSide,
                hexPos: terr.hexPos, input: '', output: '', primary: terr === terrain
            });
            nto.updateIO();
            nodes.push(nto);
        }

        // Underlay edges, then icon overlays
        this.placementLayer.children = [...nodes, ...edges];
    }

    /**
     * 
     * @param {Player} player 
     * @param {TerrainHex|null} terrain 
     */
    displayTileNetworkInfo2(player, terrain) {
        if (terrain === null) {
            for (let t of player.placedTiles) {
                t.showResourceStatus = true;
            }
            this.placementLayer.children = [];
            return;
        }
        const tile = terrain.tile;
        if (tile === null) {
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
                if (terr !== terrain) {
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
                } else {
                    for (let n of tile.needsFilled.keys()) {
                        if ((tile.needsFilled.get(n) ?? []).length < (tile.needs.get(n) ?? 0)) {
                            input = n;
                            break;
                        }
                    }
                    for (let n of tile.productionFilled.keys()) {
                        if ((tile.productionFilled.get(n) ?? []).length < (tile.productionCapacity.get(n) ?? 0)) {
                            output = n;
                            break;
                        }
                    }
                }
            }
            const nto = NetworkTileOverlay.a({ w: this.board.hexSide, h: this.board.hexSide, hexPos: terr.hexPos, input, output, primary: terr === terrain })
            nto.updateIO();
            info.push(nto);
        }
        this.placementLayer.children = info;
    }

    /**
     * @param {TileType} tileType */
    setPlacementTargets(tileType) {
        const tile = playerTileClasses[tileType].a({});
        this.clearPlacementTargets();
        let player = this.players[this.activePlayer];
        if (!this.board.terrainMap) return;
        let targets = [];
        for (let thex of this.reachableTiles(player)) {
            if (thex.tile !== null && !(thex.tile instanceof Rubble)) continue;
            if (tile.terrainPlacement[thex.code] === null) continue;
            let value = tile.terrainPlacement[thex.code];
            let tt = TargetTile.a({
                w: this.board.hexSide * 2,
                h: this.board.hexSide * 2,
                score: value,
                hexPos: [thex.hexPos[0], thex.hexPos[1]],
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
        if (!this.board.terrainMap) return;

        let p = this.players[0];
        let ep = this.players[1];
        if (!p || !ep) return; //throw new Error("No active player found");

        this.tileStack = [...this.level.tileSet].map(t => playerTileClasses[t].a({}));
        this.tileStack.sort(() => Math.random() - 0.5);
        let startTile = playerTileClasses[this.level.startTile].a();
        let start = new Vec2(this.level.start);

        let startTerr = this.board.terrainMap.atPos(start[0], start[1]);
        if (startTerr === undefined) return;
        this.placeTile(p, startTerr, startTile, false, false);

        let furthest = 0;
        let enemyCandidates = [];
        for (let terr of this.board.terrainMap.iter()) {
            if (terr instanceof Water) continue;
            const dist = new Vec2(terr.hexPos).sub(new Vec2(startTerr.hexPos)).abs().sum();
            if (dist === furthest) {
                enemyCandidates.push(terr);
            } else if (dist > furthest) {
                enemyCandidates = [terr];
                furthest = dist;
            }
        }

        if (enemyCandidates.length > 0) {
            const enemyStartTerr = rand.choose(enemyCandidates);
            let enemyStartTile = EnemyCastle.a({});
            this.placeTile(ep, enemyStartTerr, enemyStartTile, true, false, false);
        }

        this.actionBar.addChild(Farm.a({}));
        this.actionBar.addChild(Village.a({}));
        this.actionBar.addChild(Mine.a({}));
        this.actionBar.addChild(Abbey.a({}));
        this.actionBar.addChild(Tradeship.a({}));
        this.actionBar.addChild(Stronghold.a({}));
        this.actionBar.addChild(Castle.a({}));
    }

    /**
     * 
     * @param {PlayerSpec[]} playerSpec 
     * @param {Level|null} level 
     */
    setupGame(playerSpec, level = null) {
        this.gameOver = false;
        this.statusLabel.text = '';
        this.statusLabel.color = 'white';
        this.removePlayers();
        this.clearLevel();

        for (let p of playerSpec) {
            if (p.type === 0) { // human
                this.players.push(Player.a({ name: p.name, color: p.color, screen: this, showScore: true }));
            }
            if (p.type === 1) { // enemy
                this.players.push(EnemyPlayer.a({ name: p.name, color: p.color, screen: this, showScore: false }));
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
            const player = this.players[0];
            const enemyPlayer = this.players[1];
            for (let t of player.placedTiles) {
                const terrain = this.board.terrainMap.atPos(t.hexPos[0], t.hexPos[1]);
                if (!terrain) continue;
                if (t instanceof Stronghold && t.needsFilled.meets(t.needs)) {
                    for (let eterr of this.board.connectedIter(terrain, player, new Set(), new Set())) {
                        const etile = eterr.tile;
                        if (etile) {
                            if (etile instanceof EnemyDragon || etile instanceof EnemyStronghold || etile instanceof EnemyTent || etile instanceof EnemyCastle || etile instanceof EnemyLongboat) {
                                etile.health--;
                                if (etile.health <= 0) {
                                    const rubble = Rubble.a({});
                                    this.placeTile(enemyPlayer, eterr, rubble, true, false);
                                    player.scoreMarker.score += 1;
                                }
                            }
                        }
                    }
                }
                if (t instanceof Castle && t.needsFilled.meets(t.needs)) {
                    player.scoreMarker.score += 2;
                }
                if (t instanceof Tradeship && t.needsFilled.meets(t.needs)) {
                    player.scoreMarker.score += 1;
                }
                if (player.scoreMarker.turn === 10 && t.productionFilled.meets(t.productionCapacity)) {
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
        this.roundPlacements = [];
        this.undoButton.disable = true;
        if (p.localControl) {
            this.actionBar.active = true;
            if (p.scoreMarker.tilesPlacedThisTurn < 5) {
                this.statusLabel.text = 'Select a building';
                this.statusLabel.color = p.color;
            } else {
                this.statusLabel.text = 'End round';
                this.statusLabel.color = p.color;
            }
        } else {
            this.statusLabel.text = '';
            this.statusLabel.color = p.color;
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
            this.statusLabel.color = winners[0].color; //colorAverage([1,1,1,1], winners[0].color);
            this.statusLabel.text = `Game over - ${rating}`;
        } else if (winners.length === 1) {
            this.statusLabel.color = winners[0].color; //colorAverage([1,1,1,1], winners[0].color);
            this.statusLabel.text = `Game over - ${winners[0].name} wins`;
        } else {
            this.statusLabel.color = 'white';
            this.statusLabel.text = 'Game over - draw';
        }
    }

    undoLastTile() {
        const last = this.roundPlacements.pop();
        if (last !== undefined) {
            const [tile, terr] = last;
            this.removeTileFromTerrain(this.players[0], terr);
            this.updateResourceProduction();
            const p = this.players[this.activePlayer];
            p.scoreMarker.tilesPlacedThisTurn--;
        }
        this.actionBar.selectedTile = null;
        this.clearPlacementTargets();
        this.tileInfoPane.tile = null;
        this.statusLabel.text = 'Select a building';
        this.actionBar.active = true;
        if (this.roundPlacements.length === 0) {
            this.undoButton.disable = true;
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
        if (this.w < this.h) {
            this.setLayoutForOrientation('vertical');
        } else {
            this.setLayoutForOrientation('horizontal');
        }

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
            if ('hexPos' in tt) {
                let hp = this.board.pixelPos(tt.hexPos);
                tt.w = hexSide,
                    tt.h = hexSide,
                    tt.center_x = hp[0];
                tt.center_y = hp[1];
            }
        }

        this.applyHints(this.tileInfoPane);
        this.tileInfoPane.layoutChildren();

        this.applyHints(this.scoreboard);
        this.scoreboard.layoutChildren();

        this.applyHints(this.actionBar);
        this.actionBar.layoutChildren();

        this.applyHints(this.statusLabel);
        this.statusLabel.layoutChildren();

        this.applyHints(this.nextButton);
        this.nextButton.layoutChildren();

        this.applyHints(this.undoButton);
        this.undoButton.layoutChildren();

        this.applyHints(this.instrButton);
        this.instrButton.layoutChildren();

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
    ident = '';
    color = 'white';
    score = 0.0;
    turn = 10;
    tilesPlacedThisTurn = 0;
    activeTurn = false;
    /**@type {"left"|"center"|"right"}*/
    align = "right";
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
            this.text = `Buildings to place: ${5 - this.tilesPlacedThisTurn} -- Round: ${11 - this.turn}/10 -- Score: ${this.score}`;
        } else if (this.turn === 1) {
            this.text = `Buildings to place: ${5 - this.tilesPlacedThisTurn} -- Last round -- Score: ${this.score}`;
        } else {
            this.text = `Game over -- Score: ${this.score}`;
        }
    }
}

class Player extends EventSink {
    name = '';
    color = 'white';
    /**@type {GameScreen|null} */
    screen = null;
    showScore = true;
    constructor() {
        super();
        this.localControl = true;
        /**@type {Tile[]} */
        this.placedTiles = [];
        this.scoreMarker = PlayerScore.a({ ident: this.name.substring(0, 2), color: this.color });
    }

    on_showScore(event, object, value) {
        if (this.showScore) {
            this.screen?.scoreboard.addChild(this.scoreMarker);
        } else {
            this.screen?.scoreboard.removeChild(this.scoreMarker);
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
    maxTiles = 13;
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
                        screen.placeTile(otherPlayer, terr, Rubble.a({}), true, false);
                        break;
                    }
                }
            }
            else if (t instanceof EnemyDragon) {
                for (let terr of board.neighborIter(t.hexPos)) {
                    if (terr.tile instanceof Tile && !(terr.tile instanceof Rubble) && !this.placedTiles.includes(terr.tile)) {
                        screen.placeTile(otherPlayer, terr, Rubble.a({}), true, false);
                        break;
                    }
                }
            }
        }
        /**
         * 
         * @param {Player} p 
         * @param {Player} op 
         */
        function nearestTiles(p, op) {
            let nearest = Infinity;
            let nearTiles = /**@type {[Tile, Tile][]}*/([]);
            for (let t of p.placedTiles) {
                for (let o of op.placedTiles) {
                    const dist = new Vec2(t.hexPos).sub(o.hexPos).abs().sum();
                    if (dist < nearest) {
                        nearTiles = [[t, o]];
                        nearest = dist;
                    } else if (dist === nearest) {
                        nearTiles.push([t, o]);
                    }
                }
            }
            return { nearest, nearTiles };
        }
        /**
         * 
         * @param {Board} board 
         * @param {Tile} tile
         * @param {Player} op
         * @param {boolean} excludeWater
         */
        function nearestEmptyTerrain(board, tile, op, excludeWater = false) {
            let nearest = Infinity;
            let nearTerrain = /**@type {Set<TerrainHex>}*/(new Set());
            for (let terr of tile.iterNetwork(board)) {
                if (excludeWater && terr instanceof Water) continue;
                if (terr.tile !== null) continue;
                for (const ot of op.placedTiles) {
                    const dist = new Vec2(terr.hexPos).sub(ot.hexPos).abs().sum();
                    if (dist < nearest) {
                        nearTerrain.clear();
                        nearTerrain.add(terr)
                        nearest = dist;
                    } else if (dist === nearest) {
                        nearTerrain.add(terr);
                    }
                }
            }
            return { nearest, nearTerrain };
        }
        if (this.placedTiles.filter((t) => !(t instanceof Rubble)).length < this.maxTiles) {
            const ntData = nearestTiles(this, otherPlayer);
            const nearest = ntData.nearest;
            const nearTiles = ntData.nearTiles;
            const [t, ot] = rand.choose(nearTiles);
            if (t instanceof EnemyCastle) {
                const nltData = nearestEmptyTerrain(board, t, otherPlayer)
                const newTerr = rand.choose([...nltData.nearTerrain]);
                if (newTerr instanceof Water) {
                    screen.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
                } else if (newTerr) {
                    screen.placeTile(this, newTerr, EnemyTent.a({}), true, false, false);
                }
            } else if (t instanceof EnemyStronghold) {
                const nltData = nearestEmptyTerrain(board, t, otherPlayer)
                const newTerr = rand.choose([...nltData.nearTerrain]);
                if (newTerr instanceof Water) {
                    screen.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
                } else if (newTerr) {
                    screen.placeTile(this, newTerr, EnemyTent.a({}), true, false, false);
                }
            } else if (t instanceof EnemyLongboat) {
                const nltData = nearestEmptyTerrain(board, t, otherPlayer);
                const newTerr = rand.choose([...nltData.nearTerrain]);
                if (newTerr instanceof Water) {
                    screen.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
                } else if (newTerr) {
                    screen.placeTile(this, newTerr, EnemyStronghold.a({}), true, false, false);
                }
            } else if (t instanceof EnemyTent) {
                const nltData = nearestEmptyTerrain(board, t, otherPlayer);
                const newTerr = rand.choose([...nltData.nearTerrain]);
                if (newTerr instanceof Water) {
                    screen.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
                } else if (newTerr) {
                    screen.placeTile(this, newTerr, EnemyStronghold.a({}), true, false, false);
                }
            }
        }
        screen.finishTurn();
    }
}


const playerColorLookup = {
    0: [0.6, 0, 0, 1],
    1: [0, 0.6, 0, 1],
    2: [0, 0, 0.6, 1],
    3: [0.5, 0, 0.5, 1],
    4: [0.5, 0.5, 0, 1],
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
    playerCount = 0;
    /**@type {Player[]} */
    players = [];
    wGame = GameScreen.a({});
    level = levels[0];
    /**@type {PlayerSpec[]} */
    playerSpec = [];
    constructor() {
        super();
        this.addChild(this.wGame);
        this.startSpGame(this.level);
    }

    restartGame() {
        let game = this.wGame;
        game.setupGame(this.playerSpec, levels[0]);
        game.startGame();
        this.current = 'game';
    }

    startGame() {
        let ps = new PlayerSpec('Player', playerColorLookup[0], 0);
        let es = new PlayerSpec('Enemy', playerColorLookup[1], 1);
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

class PuzzleKingdomApp extends App {
    constructor() {
        super();
        this.prefDimH = 20;
        this.prefDimW = 20;
        this._baseWidget.children = [
            GameMenu.a({ hints: { x: 0, y: 0, w: 1, h: 1 } })
        ];
    }

}

var pk = new PuzzleKingdomApp();
pk.start();