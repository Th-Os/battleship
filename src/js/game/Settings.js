var App = App || {};
App.Settings = {
    turn: {
        time: 30000
    },
    score: {
        // miss: -5,
        hit: 25,
        sink: 100
    },
    grid: {
        rows: 10,
        cols: 10
    },
    square: {
        fillColor: "#FAFAFA",
        strokeColor: "#969696"
    },
    mark: {
        target: {
            size: 0.8,
            strokeWidth: 0.1,
            strokeColor: "#323232",
            opacity: 0.5
        },
        hit: {
            size: 0.8,
            strokeWidth: 0.1,
            strokeColor: "#FA0032",
            opacity: 0.75
        },
        miss: {
            size: 0.8,
            strokeWidth: 0.1,
            strokeColor: "#969696",
            opacity: 0.25
        }
    },
    ship: {
        size: 0.8,
        fillColor: "#AFAFAF",
        radius: 0.25
    },
    fleet: [
        {
            length: 4,
            count: 1
        },
        {
            length: 3,
            count: 2
        },
        {
            length: 2,
            count: 3
        },
        {
            length: 1,
            count: 4
        }
    ],
    powerup: {
        shield: {
            title: "Shield",
            count: 2,
            width: 3,
            height: 3,
            primaryColor: "#0096E1",
            secondaryColor: "#00327D",
            opacity: 0.5,
            radius: 0.25
        },
        scan: {
            title: "Scan",
            count: 1,
            width: 4,
            height: 4,
            primaryColor: "#64C800",
            secondaryColor: "rgba(50, 100, 0, 0)",
            opacity: 0.75
        },
        bomb: {
            title: "Bomb",
            count: 3,
            width: 2,
            height: 2,
            primaryColor: "#FA0032",
            secondaryColor: "#960032",
            opacity: 0.5
        },
        missile: {
            title: "Missile",
            count: 4,
            width: 1,
            height: 1,
            primaryColor: "#FA0032",
            secondaryColor: "#960032",
            opacity: 0.5
        }
    }
};

export default App.Settings;
