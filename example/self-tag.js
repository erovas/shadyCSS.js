(function(){

    let a = shadyCSS.set(
        {
            name:  "self", //<style data-id="self"></style>
            //target: 'self-tag',
            source: '.self',
            src: 'self.css',   //XHR
            load: function(){
                console.log("css loaded");
                let b = shadyCSS.get("self");
                console.log(b);
            },
            error: function(){
                console.log("error css");
            }
        }
    );

    console.log(a);

})();