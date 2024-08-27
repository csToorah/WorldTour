class Game{
    constructor(home = {name: '', lineup: {batters: [], pitchers: [], bench: [], bullpen: []}},
        visitor = {name: '', lineup: {batters: [], pitchers: [], bench: [], bullpen: []}},
        gameStatus = '',
        link = ''){
        this.home = home;
        this.visitor = visitor;
        this.gameStatus = gameStatus
        this.link = link
    }
}

module.exports = {Game}
