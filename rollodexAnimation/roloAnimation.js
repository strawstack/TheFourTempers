function roloAnimation(names) {

    const state = {};

    state.showLetter = [
        [false, false, false, false], // top
        [false, false, false, false] // bottom
    ];

    state.letterRef = null;

    function start() {
        state.letterRef = document.querySelectorAll(".tab-letter");

    }

    return {
        start
    };
}