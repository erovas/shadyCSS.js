/**
 * shadyCSS.js v1.0.0
 * Libreria que encapsula estilos CSS bajo a selector css
 * [Back-compatibility: IE11+]
 * Copyright (c) 2021, Emanuel Rojas Vásquez
 * BSD 3-Clause License
 * https://github.com/erovas/shadyCSS.js
 */
(function(window, document){

    if(window.shadyCSS)
        return console.error('shadyCSS.js has already been defined');

    //#region CONSTANTES

    let SELF_TAG = 'self-tag';
    let DATA_ID = 'data-id';
    let STYLE = 'style';
    let ARRAY_PROPERTIES = ['src', 'href', 'cssString'];
    let SOURCE = 'source';
    let TARGET = 'target';
    let HEAD = document.head;
    let LOAD = 'load';
    let ERROR = 'error';
    let FN = function(){};
    let IS_NOT_A = 'is not a ';
    let FUNCTION = 'function'
    let NO_FUNCTION = IS_NOT_A + FUNCTION;
    let NO_CSS_SELECTOR = IS_NOT_A + 'valid CSS selector';
    let STRING = 'string';
    let NO_STRING = IS_NOT_A + STRING;


    //#endregion

    //#region Utilidades

    /**
     * Throw error
     * @param {String} txt 
     * @param {String} act 
     * @returns 
     */
     function _aux_throwError(txt, act){
        let error;
        try { throw new Error(); }
        catch(e){ error = e; }
        if(!error) return;

        error = error.stack.split('\n');
        //removing the line that we force to generate the error (let error = new Error();) from the message
        //aux.splice(0, 2);
        error.splice(0, 3);
        error = error.join('\n');
        if(act)
            error = '"' + txt + '" ' + act + '\n' + error;
        else
            error = txt + '\n' + error;
        
        throw error;
    }


    /**
     * Comprueba si obj es un objeto palno
     * @param {object} obj 
     * @returns 
     */
    function _aux_is_plain_object(obj){
        if(
            //Basic check
            //obj !== null &&  //No es necesario
            //Separate from primitives
            typeof obj === 'object' &&
            //Separate build-in like Math
            Object.prototype.toString.call(obj) === '[object Object]'
            ){
            let props = Object.getPrototypeOf(obj);
            //obj == Object.create(null) || Separate instances (Array, DOM, ...)
            return props === null || props.constructor === Object;
        }
    
        return false;
    }


    /**
     * Comprueba que el string aportado es un CSS selector valido
     * @param {string} selector 
     */    
    function _aux_checkCSSSelector(selector){
        try { pseudoDOM.querySelector(selector) } catch(e) { return false }
        return true

    }

    let pseudoDOM = document.createDocumentFragment();

    /**
     * Simliar a Object.assing() pero mas poderoso
     * @param {object} target 
     * @param {object} source 
     * @returns 
     */
    function _aux_object_assing(target, source){
        Object.getOwnPropertyNames(source).forEach(function(name){
            Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
        });
        return target;
    }

    //#endregion

    //#region Funciones para insertar "rules" css en un <style>

    /**
     * Reemplaza el tagName_target por tagName_source en las CSS Rules suministradas por style_source, y dichas CSS Rules modificadas
     * son insertadas en style_target (NOTA: los <style> DEBEN estar en el DOM)
     * @param {string} tagName_target 
     * @param {string} tagName_source 
     * @param {HTMLStyleElement} style_target 
     * @param {HTMLStyleElement} style_source
     * @returns <style> target
     */
     function _aux_insertRules(tagName_target, tagName_source, style_target, style_source){

        let rules = style_source.sheet.cssRules;

        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            if(rule.type === 1)
                style_target.sheet.insertRule(_aux_getSelector(tagName_source, rule, tagName_target), i);
            else if(rule.type === 4)
                style_target.sheet.insertRule(_aux_getMedias(tagName_source, rule, tagName_target), i);
            else //if(rule.type === 7)
                style_target.sheet.insertRule(rule.cssText, i);
        }

        return style_target;
    }

    /**
     * Obtiene el CSS Selector Rule modificado de una CSSRule dada, donde se reemplazará el refTagName
     * por tagName
     * @param {string} tagName 
     * @param {CSSRule} rule 
     * @param {string} refTagName
     * @returns string del CSS Rule modificado
     */
     function _aux_getSelector(tagName, rule, refTagName){
        let split = rule.selectorText.split(',');
        let cssText = rule.cssText + '';
        let index = cssText.indexOf('{');
        let selectorText = '';

        for (let i = 0; i < split.length; i++){
            if(split[i].toLowerCase().indexOf(refTagName) > -1 )
                selectorText += split[i].replace(new RegExp(refTagName, 'i'), tagName) + (i === split.length - 1? '': ',');
            else
                selectorText += tagName + ' ' + split[i] + (i === split.length - 1? '': ',');
        }

        return selectorText + cssText.slice(index, cssText.length);
    }

    /**
     * Obtiene el CSS media Rule modificado de una CSSRule dada, donde se reemplazará el refTagName
     * por tagName
     * @param {string} tagName 
     * @param {CSSRule} mediaRule 
     * @param {string} refTagName
     * @returns string del CSS Rule modificado
     */
    function _aux_getMedias(tagName, mediaRule, refTagName){
        let out = '';
        let rules = mediaRule.cssRules;
        out = '@media ' + mediaRule.media.mediaText + '{';

            for (let j = 0; j < rules.length; j++) {
                let rule = rules[j];
                //if(rule.type !== 4)
                if(rule.type === 1)
                    out += _aux_getSelector(tagName, rule, refTagName);
                else if(rule.type === 4)
                    out += _aux_getMedias(tagName, rule, refTagName);  //Para un media query dentro de este media query
                else //if(rule.type === 7)
                    out += rule.cssText;
            }

        out += '}';

        return out;
    }

    /**
     * Obtiene un string con todas las rules de un <style>
     * @param {HTMLStyleElement} style 
     */
    function _aux_getRulesString(style){
        let rules = style.sheet.cssRules;
        let str = '';

        for (let i = 0; i < rules.length; i++)
            str += rules[i].cssText + '\n';
        
        return str;
    }

    /**
     * Obtiene (o crea) el <style> del uComponent
     * @param {string} tagName 
     * @returns 
     */
     function _aux_getStyle(tagName){
        
        let style = HEAD.querySelector(STYLE + '[' + DATA_ID + '="' + tagName + '"]');

        if(!style){
            style = document.createElement(STYLE);
            style.setAttribute(DATA_ID, tagName);
            HEAD.appendChild(style);
        }

        return style;
    }

    /**
     * Inserta las rules en el <style>
     * @param {object} options 
     */
    function _aux_setStyles(options, style){
        let temp = document.createElement(STYLE);
        temp.innerHTML = options[ARRAY_PROPERTIES[2]];
        HEAD.appendChild(temp);

        _aux_insertRules(options[TARGET], options[SOURCE], style, temp);

        HEAD.removeChild(temp);
    }

    //#endregion

    function SetCSS(options){

        //Comprobar que options es un objeto plano
        if(!_aux_is_plain_object(options))
            _aux_throwError('options', IS_NOT_A + 'plain object');

        //Comprobacion de existencia de alguna de las siguientes "src", "href", "cssString"
        for (let i = 0; i < ARRAY_PROPERTIES.length; i++) {
            let attr = ARRAY_PROPERTIES[i];
            let prop = options[attr]

            if(prop && typeof prop != STRING)
                _aux_throwError(attr, NO_STRING);
            
            if(prop)
                break;

            if(prop && i == ARRAY_PROPERTIES.length - 1)
                _aux_throwError('options', 'must contain any of the following properties: "src", "href", or "cssString"');
        }

        //Comprobacion de que "source" es un css selector valido
        if(!_aux_checkCSSSelector(options[SOURCE]) || !options[SOURCE])
            _aux_throwError(SOURCE, NO_CSS_SELECTOR);

        //Comprobacion de "load"
        if(options[LOAD] && typeof options[LOAD] != FUNCTION)
            _aux_throwError(LOAD, NO_FUNCTION);

        //Comprobacion de "error"
        if(options[ERROR] && typeof options[ERROR] != FUNCTION)
            _aux_throwError(ERROR, NO_FUNCTION);

        let dummy = _aux_object_assing({
            name: 'name-' + ( Date.now() + Math.floor(Math.random() * 10) ),
            target: SELF_TAG,
            load: FN,
            error: FN
        }, options);

        //Comprobación de que "target" es un css selector valido
        if(!_aux_checkCSSSelector(dummy[TARGET]))
            _aux_throwError(TARGET, NO_CSS_SELECTOR);

        //Se crea/recupera el <style>
        let style = _aux_getStyle(dummy.name);

        if(dummy[ARRAY_PROPERTIES[0]]){ //src

            let XHR = new XMLHttpRequest();
            XHR.onloadend = function(){
                let xhrStatus = XHR.status;
                //respuesta satisfactoria (200 a 299) ó cache (304)
                if((xhrStatus >= 200 && xhrStatus < 300) || xhrStatus == 304){
                    dummy[ARRAY_PROPERTIES[2]] = XHR.responseText;
                    _aux_setStyles(dummy, style);
                    dummy[LOAD]();
                }
                else
                    dummy[ERROR]();
            }

            XHR.open('GET', dummy[ARRAY_PROPERTIES[0]], true);
            XHR.send();
            //XHR.responseType = 'text';  //Por IE11
        }
        else if(dummy[ARRAY_PROPERTIES[1]]){ //href
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = dummy[ARRAY_PROPERTIES[1]];
            link.onload = function(){
                _aux_insertRules(dummy[TARGET], dummy[SOURCE], style, link);
                HEAD.removeChild(link);
                dummy[LOAD]();
            }
            link.onerror = function(){
                HEAD.removeChild(link);
                dummy[ERROR]();
            }
            HEAD.appendChild(link);
        }
        else { //cssString
            setTimeout(function(){
                _aux_setStyles(dummy, style);
                dummy[LOAD]();
            }, 0);
        }

        return _aux_object_assing({}, dummy);
    }

    function GetCSS(name){
        let style = HEAD.querySelector(STYLE + '[' + DATA_ID + '="' + name + '"]');
        return style? _aux_getRulesString(style) : null;
    }

    function DelCSS(name){
        let style = HEAD.querySelector(STYLE + '[' + DATA_ID + '="' + name + '"]');
        if(style){
            HEAD.removeChild(style);
            return true;
        }
        return false;
    }

    window.shadyCSS = {
        set: SetCSS,
        get: GetCSS,
        del: DelCSS
    }

})(window, document);