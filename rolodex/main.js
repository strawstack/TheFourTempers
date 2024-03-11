function rolodex(filename) {

    async function start() {
        
        return new Promise((resolveFilename, rej) => {
            const { start: animStart } = roloAnimation(getNames(filename), () => resolveFilename(filename));
            animStart();
        });

    }

    function getNames(filename) {
        const names = [
            {tab: 'A'}, 'Arroyo', 'Askoy',
            {tab: 'B'}, 'Beynac', 'Burbague',
            {tab: 'C'}, 'Castelluccio', 'Cefalu',
            {tab: 'D'}, 'Drainsville',
            {tab: 'E'}, 'Eltville', 'Ennis', 'Estes',
            {tab: 'F'}, 'Fjaerland', 'Fowey',
            {tab: 'G'}, 'Giethoorn', 'Glencoe', 'Grindelwald',
            {tab: 'H'}, 'Hanauma', 'Hahndorf',
            {tab: 'I'}, 'Inishmore', 'Interlaken',
            {tab: 'J'}, 'Jessup',
            {tab: 'K'}, 'Kingsport',
            {tab: 'L'}, 'Labrador', 'Le Mars', 'Longbranch',
            {tab: 'M'}, 'Minsk', 'Moonbeam',
            {tab: 'N'}, 'Nanning', 'Narva',
            {tab: 'O'}, 'Ocula', 
            {tab: 'P'}, 'Pacolma',
            {tab: 'Q'}, 'Qaqortoq', 'Quinhamel',
            {tab: 'R'}, 'Richard', 'Rosscarbery',
            {tab: 'S'}, 'Sedona', 'Siena', 'Stellenbosch', 
            {tab: 'T'}, 'Tumwater',
            {tab: 'U'}, 'Ushuaia',
            {tab: 'V'}, 'Veurne', 'Victoria', 'Vik',
            {tab: 'W'}, 'Wanaka', 'Whitby',
            {tab: 'X'}, 'Xaghra',
            {tab: 'Y'}, 'Yu', 'Yungay',
            {tab: 'Z'}, 'Zellamsee', 'Zermatt'
        ];

        // TODO: insert `filename` into names

        return names;
    }
    
    return {
        start
    };

}