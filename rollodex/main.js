(() => {

    function main() {

        const { start } = roloAnimation(getNames());

        start();

    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

    function getNames() {
        return [
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
    }
    
})();