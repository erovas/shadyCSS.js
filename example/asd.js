(function(){

    let a = shadyCSS.set(
        {
            //name:  //autogenerate
            target: 'alguito',
            source: '.asd',
            src: 'css.css',   //XHR
            load: function(){
                console.log("css loaded");
                let b = shadyCSS.get(a.name);
                console.log(b);
            },
            error: function(){
                console.log("error css");
            }
        }
    );

    console.log(a);

})();