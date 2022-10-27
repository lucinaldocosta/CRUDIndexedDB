"use strict";
const addInput = document.querySelector(".add_input");
const yourDates = document.querySelector(".your_dates");

let elementName;

const IDBRequest = indexedDB.open("user", 1);
IDBRequest.addEventListener("upgradeneeded", ()=>{
    const db = IDBRequest.result;
    db.createObjectStore("names", {
        autoIncrement: true
    });
});
IDBRequest.addEventListener("success", ()=>{
    console.log("Tudo saiu bem");
    leerObjetos();
});
IDBRequest.addEventListener("error", ()=>{
    console.log("Aconteceu um error ao abrir a BD");
});
document.getElementById("add_date").addEventListener("click", ()=>{
    elementName = document.getElementById("elementName").value;

    if(elementName.length > 0){
        if(document.querySelector(".possible") != undefined){
            if(confirm("Existem elementos sem guardar: Quer continuar? ")){
                addObjeto({elementName});
                leerObjetos();
                addInput.value = "";
            };
        }else{
            addObjeto({elementName});
            leerObjetos();
            addInput.value = "";
        };
    };
});
const addObjeto = (objeto)=>{
    const IDBData = getIDBData("readwrite");
    IDBData[0].add(objeto);
    IDBData[1].addEventListener("complete", ()=>{
        console.log("Objeto agregado corretamente");
    });
};
const leerObjetos = ()=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData[0].openCursor();
    const fragment = document.createDocumentFragment();

    yourDates.innerHTML = "";

    cursor.addEventListener("success", ()=>{
        if(cursor.result){
            let elemento = crearElemento(cursor.result.key, cursor.result.value);
            fragment.appendChild(elemento);
            cursor.result.continue();
        }else{
            yourDates.appendChild(fragment);
        };
    });
};
const modificarObjeto = (key, objeto)=>{
    const IDBData = getIDBData("readwrite");
    IDBData[0].put(objeto, key);
    IDBData[1].addEventListener("complete", ()=>{
        console.log("Objeto modificado corretamente");
    });
};
const eliminarObjeto = (key)=>{
    const IDBData = getIDBData("readwrite");
    IDBData[0].delete(key);
    IDBData[1].addEventListener("complete", ()=>{
        console.log("Objeto eliminado corretamente");
    });
};
const getIDBData = (mode)=>{
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("names", mode);
    const objectStore = IDBtransaction.objectStore("names");
    return [objectStore, IDBtransaction];
};
const crearElemento = (id, date)=>{
    const container = document.createElement("ARTICLE");
    const input = document.createElement("INPUT");
    const saveBtn = document.createElement("BUTTON");
    const deleteBtn = document.createElement("BUTTON");

    container.classList.add("elementName");
    input.classList.add("your_input");
    saveBtn.classList.add("impossible");
    deleteBtn.classList.add("delete");

    saveBtn.textContent = "Guardar";
    deleteBtn.textContent = "Delete";

    input.value = date.elementName;
    input.setAttribute("contenteditable", "true");
    input.setAttribute("spellcheck", "false");

    container.appendChild(input);
    container.appendChild(saveBtn);
    container.appendChild(deleteBtn);

    input.addEventListener("keyup", ()=>{
        saveBtn.classList.replace("impossible", "possible");
    });
    saveBtn.addEventListener("click", ()=>{
        if(saveBtn.className == "possible"){
            modificarObjeto(id, {elementName: input.value});
            saveBtn.classList.replace("possible", "impossible");
        };
    });
    deleteBtn.addEventListener("click", ()=>{
        if(confirm("Tem certeza que deseja eliminar? ")){
            eliminarObjeto(id);
            yourDates.removeChild(container);
        };
    });
    return container
};