(function() {
	window.utils = {
		addElement: function(elTag, classes) {
		    let element = document.createElement(elTag);
			let classesArray = classes.split(' ');

			for (elClass in classesArray) {
				element.classList.add(elClass);
			};

		    return element;
		}
	};
})();
 