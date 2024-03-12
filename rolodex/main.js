function rolodex(filename) {

    async function start() {
        
        return new Promise((resolveFilename, rej) => {
            const { start: animStart } = roloAnimation(getNames(filename), filename, () => resolveFilename(filename));
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

        const getTabIndex = letter => {
            let index = names.findIndex(n => (typeof(n) !== "string") && (n.tab === letter));
            return index;
        };

        const tabIndex = getTabIndex(filename[0].toUpperCase());

        if (tabIndex !== undefined) {
            let index = tabIndex + 1;

            // Walk forward in list until index name is greater in alpha order
            while (index < names.length && typeof(names[index]) !== "string") {
                if (filename < names[index]) break;
                index += 1;
            }

            names.splice(index, 0, filename);
        }

        return names;
    }
    
    return {
        start
    };

}