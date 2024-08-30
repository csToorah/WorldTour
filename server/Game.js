class Game{
    constructor(home = {name: '', lineup: {batters: [], pitchers: [], bench: [], bullpen: []}},
        visitor = {name: '', lineup: {batters: [], pitchers: [], bench: [], bullpen: []}},
        status = '',
        link = ''){
        this.home = home;
        this.visitor = visitor;
        this.status = status
        this.link = link
    }
}

module.exports = {Game}
