/* global window */

export const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

export function categoriesSorting(catA, catB) {
	// категории упорядочиваются по имени
	// категория "Другое" в конце

	if (!catB || !catA) {
		return 0;
	}
	if (!catB.name || !catA.name) {
		return 0;
	}

	if (catA.name.toLowerCase() === 'другое') {
		return 1;
	}
	if (catB.name.toLowerCase() === 'другое') {
		return -1;
	}

	if (catA.name.toLowerCase() < catB.name.toLowerCase()) {
		return -1;
	} else if (catA.name.toLowerCase() > catB.name.toLowerCase()) {
		return 1;
	}

	return 0;
}

export function convertNodeToDangerouslyHTML(node) {
	return {
		__html: node.outerHTML
	};
}

export function toggleClass(elem, className) {
	let classString = elem.className;
	let nameIndex = classString.indexOf(className);

	if (nameIndex === -1) {
		classString += ' ' + className;
	} else {
		classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
	}

	elem.className = classString;
}
