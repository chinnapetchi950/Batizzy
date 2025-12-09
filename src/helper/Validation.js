function isEmpty(value) {
	if (!value.trim()) {
		return true;
	}
}
function isEmailValidate(value) {
	// let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
	// let reg =
	// 	/^[a-zA-Z0-9] + (?:[._-][a-zA-Z0-9] + ) * @[a-zA-Z0-9-] + (?: \. [a-zA-Z0-9-]{2,4} + ) *\. [a-zA-Z]{2,4}$/; //Umed
	let reg =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (reg.test(value.trim()) === false) {
		return true;
	} else {
		return false;
	}
}
export {
	isEmpty,
	isEmailValidate,
};
