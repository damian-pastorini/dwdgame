const P2 = require('p2');
const share = require('../../shared/constants');

class P2world extends P2.World
{

    constructor(options)
    {
        super(options);
        this.sceneName = options.sceneName || false;
        this.sceneTiledMapFile = options.sceneTiledMapFile || false;
        if(!this.sceneName || !this.sceneTiledMapFile){
            console.log('ERROR - World creation missing data in options:', options);
        }
        this.mapJson = require('../../client/assets/maps/'+this.sceneTiledMapFile);
    }

    setMapCollisions(mapData)
    {
        // @TODO:
        // - Fix maps to create proper body blocks instead of use only boxes for each map block.
        // - Refactor to use ray cast and avoid the amount the overload of bodies created.
        // get scene change points:
        let changePoints = this.getSceneChangePoints(mapData);
        // map data:
        let mapLayers = this.mapJson.layers,
            mapW = this.mapJson.width,
            mapH = this.mapJson.height,
            tileW = this.mapJson.tilewidth,
            tileH = this.mapJson.tileheight;
        // @NOTE: for collisions in server side we need to include the defined main layer.
        let mainLayer = mapData.layers.main;
        mapData.layers.collider[mapData.layers.collider.length] = mainLayer;
        for(let ci in mapData.layers.collider){
            let colliderIndex = mapData.layers.collider[ci];
            if(mapLayers[colliderIndex]){
                let layerData = mapLayers[colliderIndex].data;
                for (let c = 0; c < mapW; c++) {
                    let posX = c * tileW;
                    for (let r = 0; r < mapH; r++) {
                        // position in pixels
                        let posY = r * tileH;
                        let tileIndex = r * mapW + c;
                        let tile = layerData[tileIndex];
                        // occupy space or add the scene change points:
                        if (tile !== 0) { // 0 => empty tiles without collision
                            // if the tile is a change point has to be empty for every layer.
                            if(changePoints[tile]){
                                // only create the change points once on the main layer:
                                if(colliderIndex == mainLayer) {
                                    // @NOTE: we make the change point smaller so the user needs to walk into to hit it.
                                    let bodyChangePoint = this.createWall((tileW/2), (tileH/2), posX, posY);
                                    bodyChangePoint.changeScenePoint = changePoints[tile];
                                    bodyChangePoint.isWall = true;
                                    this.addBody(bodyChangePoint);
                                } // that's why we don't have an else for the main layer condition here.
                            } else {
                                // create a box to fill the space:
                                let bodyWall = this.createWall(tileW, tileH, posX, posY);
                                bodyWall.isWall = true;
                                this.addBody(bodyWall);
                            }
                        }
                    }
                }
            }
        }
    }

    createLimits()
    {
        // map data:
        let mapW = this.mapJson.width;
        let mapH = this.mapJson.height;
        // create world boundary, up wall:
        let upWall = this.createWall(mapW, 0.1, ((mapW/2)-0.5), 0.5);
        upWall.isWorldWall = true;
        this.addBody(upWall);
        // create world boundary, down wall:
        let downWall = this.createWall(mapW, 0.1, ((mapW/2)-0.5), -(mapH-0.5));
        downWall.isWorldWall = true;
        this.addBody(downWall);
        // create world boundary, left wall:
        let leftWall = this.createWall(0.1, (mapH+1), -0.5, -(mapH/2));
        leftWall.isWorldWall = true;
        this.addBody(leftWall);
        // create world boundary, right wall:
        let rightWall = this.createWall(0.1, (mapH+1), (mapW-0.5), -(mapH/2));
        rightWall.isWorldWall = true;
        this.addBody(rightWall);
    }

    createWall(width, height, x, y)
    {
        let boxShape = new P2.Box({ width: width, height: height});
        boxShape.collisionGroup = share.COL_GROUND;
        boxShape.collisionMask = share.COL_PLAYER | share.COL_ENEMY;
        let bodyConfig = {
            position: [x, y],
            mass: 1,
            type: P2.Body.STATIC,
            fixedRotation: true
        };
        let boxBody = new P2.Body(bodyConfig);
        boxBody.addShape(boxShape);
        return boxBody;
    }

    getSceneChangePoints(mapData)
    {
        let changePoints = {};
        for(let cp in mapData.layers.change_points){
            let cPoint = mapData.layers.change_points[cp];
            // example: {"i":167, "n":"other_scene_key_1"}
            changePoints[cPoint.i] = cPoint.n;
        }
        return changePoints;
    }

}

exports.p2world = P2world;
