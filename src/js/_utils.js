(function() {
    window.utils = {
        addElement: function(elTag, classes) {
            let element = document.createElement(elTag);
            if (classes) element.className = classes;
            
            return element;
        }
    };
})();
