/**
 *
 * Reldens - Users Client Package.
 *
 */

const { EventsManagerSingleton, Logger, sc } = require('@reldens/utils');
const { LifebarUi } = require('./lifebar-ui');
const { GameConst } = require('../../game/constants');

class UsersPack
{

    constructor()
    {
        this.initialGameData = {};
        EventsManagerSingleton.on('reldens.beforeCreateEngine', (initialGameData, gameManager) => {
            this.initialGameData = initialGameData;
            this.onBeforeCreateEngine(initialGameData, gameManager);
            if(!this.lifeBarUi){
                this.lifeBarUi = (new LifebarUi()).setup(gameManager);
            }
        });
    }

    onBeforeCreateEngine(initialGameData, gameManager)
    {
        let isMultiplayerEnabled = sc.isTrue(initialGameData.gameConfig.client.players.multiplePlayers, 'enabled');
        let playerSelection = gameManager.gameDom.getElement('#player-selection');
        let playersCount = sc.isTrue(initialGameData, 'players') ? Object.keys(initialGameData.players).length : 0;
        if(
            // if multiplayer is disabled and the user already has a player then just allow the engine to be executed:
            (playersCount <= 1 && !isMultiplayerEnabled)
            // or if the container for the player selection/creation doesn't exists also allow the normal execution:
            || !playerSelection
        ){
            // before return set the only player available:
            initialGameData.player = initialGameData.players[0];
            return;
        }
        // for every other case we will stop the normal execution of the engine and show the selection/creation block:
        gameManager.canInitEngine = false;
        playerSelection.removeClass('hidden');
        // if multiplayer is enabled and the user already has a player then setup the selector form:
        if(isMultiplayerEnabled && playersCount){
            this.preparePlayerSelector(playerSelection, initialGameData, gameManager);
        }
        this.preparePlayerCreator(playerSelection, initialGameData, gameManager);
    }

    preparePlayerSelector(playerSelection, initialGameData, gameManager)
    {
        let form = gameManager.gameDom.getElement('#player_selector_form');
        let select = gameManager.gameDom.getElement('#select-element');
        if(!form || !select){
            return false;
        }
        form.on('submit', () => {
            let selectedPlayer = this.getPlayerById(initialGameData.players, Number(select.val()));
            if(selectedPlayer){
                playerSelection.addClass('hidden');
                gameManager.initialGameData.player = selectedPlayer;
                gameManager.initEngine().catch((err) => {
                    Logger.error(err);
                });
            }
            return false;
        });
        for(let i of Object.keys(initialGameData.players)){
            let player = initialGameData.players[i];
            let optionLabel = player.name+(player.additionalLabel || '');
            let option = new Option(optionLabel, player.id);
            option.dataset.key = player.avatarKey;
            select.append(option);
        }
        let avatarContainer = gameManager.gameDom.getElement('.player_selection_additional_info');
        if(avatarContainer){
            let playersConfig = initialGameData.gameConfig.client.players;
            gameManager.features.featuresList.actions
                .appendAvatarOnSelector(select[0], avatarContainer[0], gameManager, playersConfig);
        }
        form.removeClass('hidden');
    }

    preparePlayerCreator(playerSelection, initialGameData, gameManager)
    {
        let $formElement = gameManager.gameDom.getElement('#player_create_form');
        if(!$formElement){
            return;
        }
        $formElement.on('submit', () => {
            let errorElement = gameManager.gameDom.getElement('#player_create_form .response-error');
            errorElement.addClass('hidden');
            let formData = new FormData($formElement[0]);
            let serializedForm = this.serialize(formData);
            if(serializedForm['new_player_name'].toString().length < 3){
                return false;
            }
            gameManager.submitedForm = true;
            gameManager.gameRoom.send({act: GameConst.CREATE_PLAYER, formData: serializedForm});
            return false;
        });
    }

    serialize(data)
    {
        let obj = {};
        for(let [key, value] of data){
            if(obj[key] !== undefined){
                if(!Array.isArray(obj[key])){
                    obj[key] = [obj[key]];
                }
                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    getPlayerById(players, playerId)
    {
        let result = false;
        for(let player of players){
            if(player.id === playerId){
                result = player;
                break;
            }
        }
        return result;
    }

}

module.exports.UsersPack = UsersPack;
