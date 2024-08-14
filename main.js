const triggerChange = (element) => {
    const event = new Event("change");
    element.dispatchEvent(event);
}

const triggerToggle = (element) => {
    const event = new Event("click");
    element.dispatchEvent(event);
}

function removeBorderOnInteract(element) {
    element.addEventListener("focus", () => element.style.border = "");
    element.addEventListener("input", () => element.style.border = "");
}

function visibilityModes() {
    const visibilitySelect = document.getElementById("visibility");
    const visibilityPopUp = document.getElementById("visibility-popup");

    if (!visibilitySelect) return;
    visibilitySelect.addEventListener("change", () => {
        const pNote = document.createElement("p");
        pNote.style.fontSize = "12px";
        pNote.style.color = "gray";

        visibilityPopUp.innerHTML = "";
        if (visibilitySelect.value === "public") {
            pNote.innerHTML = "*Your text will be possibly shown in the main page.*";
            visibilityPopUp.appendChild(pNote);
        } else if (visibilitySelect.value === "private") {
            pNote.innerHTML = "*Your text will be only visible to you.*";
            visibilityPopUp.appendChild(pNote);
        } else if (visibilitySelect.value === "unlisted") {
            const pLink = document.createElement("p");
            pNote.innerHTML = "This text is only accessible via link.*";
            pLink.innerHTML = "https://www.example.com/your-content"; // generate a link here.
            visibilityPopUp.appendChild(pNote);
            visibilityPopUp.appendChild(pLink);
        } else if (visibilitySelect.value === "specific") {
            const specificUsersTagsContainer = document.createElement("div");
            const specificUsersField = document.createElement("input");
            pNote.innerHTML = "*Specific means that you can choose who can access your content.*";
            specificUsersTagsContainer.className = "specific-users-tags-container";
            specificUsersField.id = "specific-users";
            specificUsersField.type = "text";
            specificUsersField.placeholder = "Enter UID/Username separated by commas...";
            visibilityPopUp.appendChild(pNote);
            visibilityPopUp.appendChild(specificUsersTagsContainer);
            specificUsersTagsContainer.appendChild(specificUsersField);
            createSpecificUsersTags();
        }
    });
    triggerChange(visibilitySelect);
}

function durationModes() {
    const durationSelect = document.getElementById("duration");
    const durationPopUp = document.getElementById("duration-popup");

    if (!durationSelect) return;
    durationSelect.addEventListener("change", () => {
        const pNote = document.createElement("p");
        pNote.style.fontSize = "12px";
        pNote.style.color = "gray";

        durationPopUp.innerHTML = "";
        if (durationSelect.value === "views") {
            const viewField = document.createElement("input");
            pNote.innerHTML = "*Your text will be deleted after the specified number of views.*";
            viewField.type = "number";
            viewField.placeholder = "Enter number of views";
            viewField.min = 1;
            viewField.id = "view-count";
            durationPopUp.appendChild(pNote);
            durationPopUp.appendChild(viewField);
        } else if (durationSelect.value === "time") {
            const dateField = document.createElement("input");
            const timeField = document.createElement("input");
            pNote.innerHTML = "*Your text will be deleted after the specified time.*";
            dateField.type = "date";
            timeField.type = "time";
            dateField.id = "date-duration";
            timeField.id = "time-duration";
            durationPopUp.appendChild(pNote);
            durationPopUp.appendChild(dateField);
            durationPopUp.appendChild(timeField);
        } else if (durationSelect.value === "indefinitely") {
            pNote.innerHTML = "*Your text will be stored indefinitely.*";
            durationPopUp.appendChild(pNote);
        }
    });
    triggerChange(durationSelect);
}

function resizeDivider() {
    const divider = document.querySelector(".divider");
    const inputForm = document.querySelector(".input-form");
    const settingsForm = document.querySelector(".settings-form");
    let isDragging = false;

    if (!divider) return;
    divider.addEventListener("mousedown", () => {
        isDragging = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    });

    if (!inputForm || !settingsForm) return;
    document.addEventListener("mouseup", (e) => {
        isDragging = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    });
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        if (settingsForm.style.display === "none") return;
        const width = divider.parentElement.getBoundingClientRect().width;
        const offset = e.clientX / width;
        inputForm.style.flex = offset;
        settingsForm.style.flex = 1 - offset;
    });
}

function minimizeSettings() {
    const minimizeButton = document.getElementById("minimize-button");

    if (!minimizeButton) return;
    minimizeButton.addEventListener("click", () => {
        hideSettings();
    });
}

function showSettings() {
    const settingsForm = document.querySelector(".settings-form");
    const inputForm = document.querySelector(".input-form");
    const divider = document.querySelector(".divider");
    const toggleSettingsButton = document.getElementById("toggle-settings");

    settingsForm.style.display = "flex";
    inputForm.style.flex = 2;
    settingsForm.style.flex = 0.5;
    toggleSettingsButton.textContent = ">";
    divider.style.width = "5px";
}

function hideSettings() {
    const settingsForm = document.querySelector(".settings-form");
    const inputForm = document.querySelector(".input-form");
    const divider = document.querySelector(".divider");
    const toggleSettingsButton = document.getElementById("toggle-settings");

    settingsForm.style.display = "none";
    inputForm.style.flex = 1;
    toggleSettingsButton.textContent = "<";
    divider.style.width = "10px";
}

function toggleSettings() {
    const toggleSettingsButton = document.getElementById("toggle-settings");
    if (toggleSettingsButton.textContent === "<") hideSettings();
    
    if (!toggleSettingsButton) return;
    toggleSettingsButton.addEventListener("click", () => {
        if (toggleSettingsButton.textContent === "<") showSettings();
        else hideSettings();
    });
}

function createTags() {
    const tagsContainer = document.querySelector(".tags-container");
    const tagsInput = document.getElementById("tags-input");

    if (!tagsInput) return;
    tagsInput.addEventListener("keydown", (e) => {
        if (e.key !== ",") return;
        e.preventDefault();
        const tag = tagsInput.value.trim();
        if (!tag) return;

        const tagElement = document.createElement("span");
        tagElement.className = "tag-span";
        tagElement.innerHTML = `${tag} <span class="tag-close">&times;</span>`;
        tagsContainer.insertBefore(tagElement, tagsInput);

        tagElement.querySelector(".tag-close").addEventListener("click", () => {
            tagsContainer.removeChild(tagElement);
        });
        tagsInput.value = "";
    });
}

function createSpecificUsersTags() {
    const specificUsersTagsContainer = document.querySelector(".specific-users-tags-container");
    const specificUsersField = document.getElementById("specific-users");

    if (!specificUsersField) return;
    specificUsersField.addEventListener("keydown", (e) => {
        if (e.key !== ",") return;
        e.preventDefault();
        const user = specificUsersField.value.trim();
        if (!user) return;

        const userElement = document.createElement("span");
        userElement.className = "specific-users-tags-span";
        userElement.innerHTML = `${user} <span class="specific-users-tags-close">&times;</span>`;
        specificUsersTagsContainer.insertBefore(userElement, specificUsersField);

        userElement.querySelector(".specific-users-tags-close").addEventListener("click", () => {
            specificUsersTagsContainer.removeChild(userElement);
        });
        specificUsersField.value = "";
    });
}


function onFormSubmit() {
    const inputForm = document.getElementById("inputForm");
    inputForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = document.getElementById("text").value || "";
        const title = document.getElementById("title").value || "";
        const description = document.getElementById("description").value || "";
        const tags = Array.from(document.querySelectorAll(".tag-span")).map(tag => tag.childNodes[0].textContent.split(" ")[0]);
        const visibilityMode = document.getElementById("visibility").value;
        const durationMode = document.getElementById("duration").value;
        let specificUsersTags = [];
        let view = null;
        let date = null;
        let time = null;
        let viewValue = null;
        let dateValue = null;
        let timeValue = null;

        if (visibilityMode === "specific") specificUsersTags = Array.from(document.querySelectorAll(".specific-users-tags-span")).map(user => user.childNodes[0].textContent.split(" ")[0]);
        if (durationMode === "views") {
            view = document.getElementById("view-count");
            viewValue = view.value;
            if (!viewValue) {
                view.style.border = "2px solid red";
                removeBorderOnInteract(view);
                return;
            }
        } else if (durationMode === "time") {
            date = document.getElementById("date-duration");
            time = document.getElementById("time-duration");
            dateValue = date.value;
            timeValue = time.value;
            if (!dateValue && timeValue) {
                date.style.border = "2px solid red";
                removeBorderOnInteract(date);
                return;
            }
            if (!timeValue && dateValue) {
                time.style.border = "2px solid red";
                removeBorderOnInteract(time);
                return;
            }
            if (!dateValue || !timeValue) {
                date.style.border = "2px solid red";
                time.style.border = "2px solid red";
                removeBorderOnInteract(date);
                removeBorderOnInteract(time);
                return;
            }
        }

        const formData = {
            text,
            title,
            description,
            tags,
            visibilityMode,
            durationMode,
            specificUsersTags,
            viewValue,
            dateValue,
            timeValue
        };
        submitForm(formData);
    });
}

function submitForm(formData) {
    fetch("/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => alert(`Content: ${JSON.stringify(data)}`))
    .catch((error) => alert(`Error: ${error}`));
}

document.addEventListener("DOMContentLoaded", () => {
    visibilityModes();
    durationModes();
    resizeDivider();
    minimizeSettings();
    toggleSettings();
    createTags();
    createSpecificUsersTags();
    onFormSubmit();
});