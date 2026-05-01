const d = document;

const inp_name = d.getElementById("inp_name");
const btn_home = d.getElementById("btn_home");
const add_btn = d.getElementById("add-button");
const add_inp = d.getElementById("add-input");
const items_list = d.getElementById("list-items");

// Load content when opened
window.onload = () => {
    const content = localStorage.getItem('currentFileContent');
    if (content) {
        items_list.innerHTML = content;
        
        // Reactivar els botons d'eliminar en carregar el fitxer
        const deleteBtns = items_list.querySelectorAll(".delete-btn");
        deleteBtns.forEach(btn => {
            btn.onclick = function() {
                const li = btn.closest("li");
                li.style.opacity = "0";
                li.style.transform = "translateX(20px)";
                setTimeout(() => li.remove(), 200);
            };
        });
    }

    inp_name.value = localStorage.getItem('currentFileName').replace(".html", "");
};

// House Button: save and quit
btn_home.addEventListener("click", async () => {
    const oldFileName = localStorage.getItem('currentFileName');
    const newFileName = inp_name.value + ".html";
    
    // Guardem exclusivament l'interior del UL
    const contentToSave = items_list.innerHTML; 

    const request = indexedDB.open("Docs", 3);
    request.onsuccess = async (e) => {
        const db = e.target.result;
        const getHandle = db.transaction("handles").objectStore("handles").get("root");

        getHandle.onsuccess = async () => {
            const rootHandle = getHandle.result;
            if (rootHandle) {
                try {
                    if (await rootHandle.requestPermission({mode: 'readwrite'}) === 'granted') {
                        if (oldFileName && oldFileName !== newFileName) {
                            try {
                                await rootHandle.removeEntry(oldFileName);
                            } catch (e) {
                                console.log("Nothing changed");
                            }
                        }

                        const fileHandle = await rootHandle.getFileHandle(newFileName, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(new Blob([contentToSave], { type: 'text/html;charset=utf-8' }));
                        await writable.close();
                        
                        localStorage.setItem('currentFileName', newFileName);
                        window.location.href = "index.html";
                    }
                } catch (err) {
                    console.error("Error saving/renaming:", err);
                    window.location.href = "index.html";
                }
            } else {
                window.location.href = "index.html";
            }
        };
    };
});

// To-Do functionality
add_btn.addEventListener("click", addItem);

add_inp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addItem();
});

function addItem() {
    const text = add_inp.value.trim();

    if (text !== "") {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox">
                <span>${text}</span>
            </div>
            <button class="delete-btn">x</button>
        `;

        const btnEliminar = li.querySelector(".delete-btn");
        btnEliminar.onclick = function() {
            li.style.opacity = "0";
            li.style.transform = "translateX(20px)";
            setTimeout(() => li.remove(), 200);
        };

        items_list.appendChild(li);
        add_inp.value = "";
        add_inp.focus();
    }
}

// DARK MODE
const btnDarkMode = document.getElementById("btn_dark_mode");

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (btnDarkMode) btnDarkMode.innerText = '☀️';
}

if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btnDarkMode.innerText = isDark ? '☀️' : '🌙';
    });
}