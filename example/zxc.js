(function(){

    let cssString = 'tag { display: block; width: 200px; height: 300px; background-color: red; }'
    cssString += 'tag { background-color: green; }';
    cssString += 'tag { background-color: yellow; }';
    cssString += 'tag { background-color: blue; }';
    cssString += 'div { width: 20px; height: 20px; background-color: red; }';

    let a = shadyCSS.set(
        {
            name:  "zxc", //<style data-id="zxc"></style>
            target: 'tag',
            source: '[data-class="zxc"]',
            cssString: cssString,
            load: function(){
                console.log("css loaded");
                let b = shadyCSS.get("zxc");
                console.log(b);
            },
            error: function(){
                console.log("error css");
            }
        }
    );

    console.log(a);

})();