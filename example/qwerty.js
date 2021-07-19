(function(){

    let a = shadyCSS.set(
        {
            name:  "qwerty", //<style data-id="qwerty"></style>
            target: 'alguito',
            source: '#qwerty',
            href: 'css.css',   //<link>
            load: function(){
                console.log("css loaded");
                let b = shadyCSS.get("qwerty");
                console.log(b);
            },
            error: function(){
                console.log("error css");
            }
        }
    );

    console.log(a);

})();