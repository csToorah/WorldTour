const cookiesDisabler = '#onetrust-close-btn-container';

const scoresPageSelectors = {
    gameContainers: '.gmoPjI',
    teamNames: '.fdaoCu',
    gameStatus: '.cBEKUV',
    btnsContainer: '.dlHiDf'
}

const preGameSelectors = {
    containers: {
        lineup: '.dFXpor > tbody',
        matchup: '.dFXpor > tbody',
        pitchersOuter: '.FqHVL',
        pitchersInner: '.lcFuuA'
    },
    lineup: {
        name: '.izsxYc',
        battingPosition: '[data-col = "1"]',
        AVG: '[data-col = "5"]',
        OPS: '[data-col = "6"]'
    },
    matchup: {
        name: '.izsxYc',
        HR: '[data-col = "1"]',
        RBI: '[data-col = "2"]',
        AB: '[data-col = "3"]',
        AVG: '[data-col = "4"]',
        OPS: '[data-col = "5"]'
    },
    pitchers: {
        name: '.jJjzqB',
        pitchingArm: '.ljFmix',
        record: '.cTXOhx .before-list',
        ERA: '.cTXOhx .after-list',
        K: '.cTXOhx .bottom-list'
    }
}

const liveGameSelectors = {
    containers: {
        scoreBoard: '.fxhlOg > tbody',
        batters: '.dgwGLd.batters > tbody',
        pitchers: '.dgwGLd.pitchers > tbody',
        bench: '.dgwGLd.bench > tbody',
        bullpen: '.dgwGLd.bullpen > tbody'
    },
    scoreBoard: {
        runs: '[data-col="0"]',
        hits: '[data-col="1"]',
        inning: '.jfAqho'
    },
    batters: {
        name: '.Lvhrv',
        AB: '[data-col="1"]',
        runs: '[data-col="2"]',
        hits: '[data-col="3"]',
        RBI: '[data-col="4"]',
        walks: '[data-col="5"]',
        K: '[data-col="6"]',
        AVG: '[data-col="7"]',
        OPS: '[data-col="8"]'
    },
    pitchers: {
        name: '.erTrAi',
        IP: '[data-col="1"]',
        hits: '[data-col="2"]',
        runs: '[data-col="3"]',
        ER: '[data-col="4"]',
        walks: '[data-col="5"]',
        K: '[data-col="6"]',
        HR: '[data-col="7"]',
        ERA: '[data-col="8"]'
    },
    bench: {
        name: '.Lvhrv',
        side: '[data-col="1"]',
        POS: '[data-col="2"]',
        AVG: '[data-col="3"]'
    },
    bullpen: {
        name: '.Lvhrv',
        side: '[data-col="1"]',
        ERA: '[data-col="2"]',
        IP: '[data-col="3"]',
        hits: '[data-col="4"]',
        walks: '[data-col="5"]',
        K: '[data-col="6"]'
    }
}

const finalGameSelectors = {
    inning: '.jfAqho',
    containers: {
        batters: '.dgwGLd.batters > tbody',
        pitchers: '.dgwGLd.pitchers > tbody',
        scoreboard: '.fxhlOg > tbody'
    },
    scoreboard: {
        runs: '[data-col="0"]'  ,
        hits:  '[data-col="1"]',
        errors: '[data-col="2"]'
    },
    batters: {
        name: '.Lvhrv',
        AB: '[data-col="1"]',
        runs: '[data-col="2"]',
        hits: '[data-col="3"]',
        RBI: '[data-col="4"]',
        walks: '[data-col="5"]',
        K: '[data-col="6"]',
        AVG: '[data-col="7"]',
        OPS: '[data-col="8"]'
    },
    pitchers: {
        name: '.Lvhrv span',
        IP: '[data-col="1"]',
        hits: '[data-col="2"]',
        runs: '[data-col="3"]',
        ER: '[data-col="4"]',
        walks: '[data-col="5"]',
        K: '[data-col="6"]',
        HR: '[data-col="7"]',
        ERA: '[data-col="8"]'
    }
}

module.exports = {cookiesDisabler, scoresPageSelectors, liveGameSelectors, finalGameSelectors, preGameSelectors}