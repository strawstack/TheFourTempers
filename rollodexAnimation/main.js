(() => {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function main() {

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
            'Arroyo', 'Askoy', null,
            'Beynac', 'Burbague', null,
            'Castelluccio', 'Cefalu', null,
            'Drainsville', null,
            'Estes', 'Eltville', 'Ennis', null,
            'Fjaerland', 'Fowey', null,
            'Giethoorn', 'Glencoe', 'Grindelwald', null,
            'Hanauma', 'Hahndorf', null,
            'Inishmore', 'Interlaken', null,
            'Jessup', null,
            'Kingsport', null,
            'Labrador', 'Le Mars', 'Longbranch', null,
            'Minsk', 'Moonbeam', null,
            'Nanning', 'Narva', null,
            'Ocula', null, 
            'Pacolma', null,
            'Qaqortoq', 'Quinhamel', null,
            'Rosscarbery', 'Richard', null,
            'Stellenbosch', 'Sedona', null,
            'Tumwater', null,
            'Ushuaia', null,
            'Victoria', 'Veurne', 'Vik', null,
            'Wanaka', 'Whitby', null,
            'Xaghra', null,
            'Yu', 'Yungay', null,
            'Zermatt', 'Zellamsee'
        ];
    }
    
})();