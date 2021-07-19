(function(){

    let a = shadyCSS.set(
        {
            name:  "algo", //<style data-id="algo"></style>
            target: 'alguito',
            source: 'al-go',
            src: 'css.css',   //XHR
            load: function(){
                console.log("css loaded");
                let b = shadyCSS.get("algo");
                console.log(b);
            },
            error: function(){
                console.log("error css");
            }
        }
    );

    console.log(a);

})();