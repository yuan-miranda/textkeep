const triggerEvent = (element, eventType) => {
    const event = new Event(eventType);
    element.dispatchEvent(event);
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
            specificUsersTagsContainer.style.overflow = "auto";
            specificUsersField.id = "specific-users-tags-input";
            specificUsersField.type = "text";
            specificUsersField.placeholder = "Enter UID/Username separated by commas...";
            visibilityPopUp.appendChild(pNote);
            visibilityPopUp.appendChild(specificUsersTagsContainer);
            specificUsersTagsContainer.appendChild(specificUsersField);
            createSpecificUsersTags();
        }
    });
    triggerEvent(visibilitySelect, "change");
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
    triggerEvent(durationSelect, "change");
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

// function saveTag(tagsContainer, tagSpanName) {
//     const tags = [];
//     tagsContainer.querySelectorAll(`.${tagSpanName}`).forEach(tag => tags.push(tag.textContent.slice(0, -2)));
//     localStorage.setItem(`${tagSpanName}`, JSON.stringify(tags));
// }

// function loadTags(tagsContainer, tagsInput, tagSpanName, tagCloseName) {
//     const tags = JSON.parse(localStorage.getItem(`${tagSpanName}`)) || [];
//     tags.forEach(tagText => { createTag(tagText, tagsContainer, tagsInput, tagSpanName, tagCloseName); });
// }

function createTag(tagText, tagsContainer, tagsInput, tagSpanName, tagCloseName) {
    const tagElement = document.createElement("span");
    tagElement.className = tagSpanName;
    tagElement.innerHTML = `${tagText} <span class="${tagCloseName}">&times;</span>`;
    tagsContainer.insertBefore(tagElement, tagsInput);
    tagElement.querySelector(`.${tagCloseName}`).addEventListener("click", () => {
        tagsContainer.removeChild(tagElement);
        // saveTag(tagsContainer, tagSpanName);
    });
    tagsInput.value = "";
}

function removeTag(tagsContainer, tagsInput, tagSpanName) {
    if (tagsInput.value) return;
    const tagElements = tagsContainer.querySelectorAll(`.${tagSpanName}`);
    if (tagElements.length === 0) return;
    tagsContainer.removeChild(tagElements[tagElements.length - 1]);
    // saveTag(tagsContainer, tagSpanName);
}

function validTag(tagText, tagsContainer, tagSpanName) {
    if (!tagText) return false;
    if (tagText.match(/[^a-zA-Z0-9_ ]/)) return false;
    if (Array.from(tagsContainer.querySelectorAll(`.${tagSpanName}`)).some(tag => tag.textContent.slice(0, -2) === tagText)) return false;
    return true;
}

function createTagsListeners(tagsContainer, tagsInput, tagSpanName, tagCloseName) {
    // loadTags(tagsContainer, tagsInput, tagSpanName, tagCloseName);
    tagsInput.addEventListener("keydown", (e) => {
        if (e.key === ",") {
            e.preventDefault();
            const tagText = tagsInput.value.trim();
            if (!validTag(tagText, tagsContainer, tagSpanName)) return;
            createTag(tagText, tagsContainer, tagsInput, tagSpanName, tagCloseName);
            // saveTag(tagsContainer, tagSpanName);
        }
        if (e.key === "Backspace") removeTag(tagsContainer, tagsInput, tagSpanName);
    });
}

function createCategoryTags() {
    const tagsContainer = document.querySelector(".tags-container");
    const tagsInput = document.getElementById("tags-input");
    if (!tagsInput) return;
    createTagsListeners(tagsContainer, tagsInput, "tag-span", "tag-close");
}

function createSpecificUsersTags() {
    const specificUsersTagsContainer = document.querySelector(".specific-users-tags-container");
    const specificUsersField = document.getElementById("specific-users-tags-input");
    if (!specificUsersField) return;
    createTagsListeners(specificUsersTagsContainer, specificUsersField, "specific-users-tags-span", "specific-users-tags-close");
}

function removeBorderOnInteract(element, elementInteract=element) {
    elementInteract.addEventListener("focus", () => element.style.border = "");
    elementInteract.addEventListener("input", () => element.style.border = "");
}

function addErrorBorder(element, elementInteract=element) {
    element.style.border = "2px solid red";
    removeBorderOnInteract(element, elementInteract);
}

function onFormSubmit() {
    const inputForm = document.getElementById("inputForm");
    inputForm.addEventListener("submit", (e) => handleSubmission(e));
}

function handleSubmission(e) {
    e.preventDefault();
    const formData = parseFormData();
    if (!validFormData(formData)) return;
    submitForm(formData);
}

function parseFormData() {
    const author = "test";
    const date_created = "";
    const date_updated = "";
    const date_deleted = "";
    
    const text = document.getElementById("text").value || "";
    const title = document.getElementById("title").value || "";
    const description = document.getElementById("description").value || "";
    const tags = Array.from(document.querySelectorAll(".tag-span")).map(tag => tag.textContent.slice(0, -2));
    const visibilityMode = document.getElementById("visibility").value;
    const durationMode = document.getElementById("duration").value;
    let specificUsersTags = [];
    let viewValue = null;
    let dateValue = null;
    let timeValue = null;

    if (visibilityMode === "specific") specificUsersTags = Array.from(document.querySelectorAll(".specific-users-tags-span")).map(user => user.textContent.slice(0, -2));
    if (durationMode === "views") viewValue = document.getElementById("view-count").value;
    else if (durationMode === "time") {
        dateValue = document.getElementById("date-duration").value;
        timeValue = document.getElementById("time-duration").value;
    }

    // CREATE TABLE IF NOT EXISTS notes (
    //     id SERIAL PRIMARY KEY,
    //     author TEXT NOT NULL,
    //     title TEXT,
    //     text TEXT,
    //     description TEXT,
    //     tags TEXT[],
    //     visibility_mode TEXT,
    //     duration_mode TEXT,
    //     specific_users_tags TEXT[],
    //     view_value INT,
    //     date_value DATE,
    //     time_value TIME,
    //     date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     date_deleted TIMESTAMP
    // );`;

    return {
        author,
        title,
        text,
        description,
        tags,
        visibilityMode,
        durationMode,
        specificUsersTags,
        viewValue,
        dateValue,
        timeValue,
        date_created,
        date_updated,
        date_deleted,
    };
}

function validFormData(formData) {
    // if (formData.visibilityMode === "specific" && formData.specificUsersTags.length === 0) {
    //     addErrorBorder(document.querySelector(".specific-users-tags-container"), document.getElementById("specific-users-tags-input"));
    //     return false;
    // }
    if (formData.durationMode === "views" && !formData.viewValue) {
        addErrorBorder(document.getElementById("view-count"));
        return false;
    }
    if (formData.durationMode === "time" && !formData.dateValue && !formData.timeValue) {
        addErrorBorder(document.getElementById("date-duration"));
        addErrorBorder(document.getElementById("time-duration"));
        return false;
    }
    if (formData.durationMode === "time" && !formData.dateValue) {
        addErrorBorder(document.getElementById("date-duration"));
        return false;
    }
    if (formData.durationMode === "time" && !formData.timeValue) {
        addErrorBorder(document.getElementById("time-duration"));
        return false;
    }
    return true;
}

function submitForm(formData) {
    console.log(formData);
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
    createCategoryTags();
    // createSpecificUsersTags();
    onFormSubmit();

    document.getElementById("reset-settings").addEventListener("click", () => {
        // localStorage.clear();
        location.reload();
    });
});