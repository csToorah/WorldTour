class Game{
    constructor(home = {name: '', lineups: {batters: [], pitchers: [], bench: [], bullpen: []}, hits: '', runs: ''},
        visitor = {name: '', lineups: {batters: [], pitchers: [], bench: [], bullpen: []}, hits: '', runs: ''},
        status = '',
        link = ''){
        this.home = home;
        this.visitor = visitor;
        this.status = status;
        this.link = link;
        this.inning = '';

    }
}

module.exports = {Game}
