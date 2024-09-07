function removeBorderOnInteract(element, elementInteract=element) {
    elementInteract.addEventListener("focus", () => element.style.border = "");
    elementInteract.addEventListener("input", () => element.style.border = "");
}

function removeTextOnInteract(element, elementInteract=element) {
    // elementInteract.addEventListener("focus", () => element.textContent = "");
    elementInteract.addEventListener("input", () => element.textContent = "");
}

function addErrorBorder(element, elementInteract=element) {
    element.style.border = "2px solid red";
    removeBorderOnInteract(element, elementInteract);
}

function addErrorText(element, message, elementInteract=element) {
    element.textContent = message;
    removeTextOnInteract(element, elementInteract);
}

const addError = (element, elementInteract=element, message) => {
    addErrorBorder(elementInteract);
    addErrorText(element, message, elementInteract);
}