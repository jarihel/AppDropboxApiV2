let diseñador = '\nDISEÑADOR:\n///////////////////////////////////////////////////////' +
    '\n//  _   _   _                                   ___  //' +
    '\n// ||X  X|--||  ||XXX|XX ||--  XX  ||   ||   -- X || //' +
    '\n// || XX||||||  ||---|| X|||| XXXX ||   ||   ||  X   //' +
    '\n// ||   |||||XXX||XXX||  X|||XX  XX||XXX||XXX||||_X  //' +
    '\n//                                                   //' +
    '\n///////////////////////////////////////////////////////';
console.log(diseñador);

/////////////////////////////////////////////////////////
///   _    _         ___                          ___  //
///  |\\  //|--||  ||""" \\ ||--  /\  ||   ||   --\  | //
///  ||\\//||||||  ||---||\\|||| //\\ ||   ||   || \\  //
///  ||    |||||___||___|| \||||//  \\||___||___|||__\ //
///                                                    //
///////////////////////////////////////////////////////// 




"use strict";
const state = { files: [], rootPath: '/inicio' }
const fileListElem = document.querySelector('#app')
const loadingElem = document.querySelector('.loading')
let ruta = new Set();
let i = 0;
let thumbnail;





const dbx = new Dropbox.Dropbox({
  accessToken: '3SDa6adnXMAAAAAAAAAAD3Cz_YDiEwwipVnoXoclZss5uGF1vp4FlzsJIut-ePWP',
  fetch
});
const init = async () => {
  //console.log(ruta);
  let res = await dbx.filesListFolder({
    path: state.rootPath,
    limit: 50
  })
  actualizar(res); // acualiza el state y renderiza
  /*///////////////////////////////CARPETAS////////////////////////////////////////////////*/
  let carpetas = document.querySelectorAll('#path');//captura los items que son carpetas
  carpetas.forEach((elemento) => {
    elemento.addEventListener('click', (e) => {
      loadingElem.classList.remove('hidden')
      if (elemento.children[1].dataset.name.toLowerCase().includes(' ')) {
        let nombre = elemento.children[1].dataset.name.toLowerCase().split(' ').join('-');
        ruta.add(`/${nombre}`);
        console.log(ruta);
      } else {
        ruta.add(`/${elemento.children[1].dataset.name.toLowerCase()}`);
      }
      location.hash = Array.from(ruta).join('');//agrega la ruta al hash
    });
  })
  /*///////////////////////////////ARCHIVOS////////////////////////////////////////////////*/
  let archivos = document.querySelectorAll('#file');
  archivos.forEach(elemento => {
      dbx.filesDownload({ path: elemento.dataset.path })
      .then(function (response) {
        let downloadUrl = URL.createObjectURL(response.fileBlob);
        elemento.setAttribute('href', downloadUrl);
        elemento.setAttribute('download', response.name);
       })
      .catch(function (error) {
        console.error(error);
      });
  })
  loadingElem.classList.add('hidden')
}
const reset = () => {
  state.files = []
  init();
}
const actualizar = (files) => {
  state.files = [...state.files, ...files.entries]
  renderizar()
  /*
  if (ruta.size === 1) {
  //obtenerIcono(files);
  }*/
}
function esExtencion(extension) {
  console.log(extension);
  


  if (extension === (('docx') || ('doc')) ||(('xlsx') || ('xlsm') )||(('xltx') || ('pptx')) || (('pptm') || ('ppt'))||('pdf')) {    
    return extension.slice(0, 3);
  } else {    
    return 'iconDefault';
  }
}
const renderizar = () => {
  fileListElem.innerHTML = state.files.sort((a, b) => {
    // sort alphabetically, folders first
    if ((a['.tag'] === 'folder' || b['.tag'] === 'folder')
      && !(a['.tag'] === b['.tag'])) {
      return a['.tag'] === 'folder' ? -1 : 1
    } else {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    }
  }).map(file => {
    const type = file['.tag']
     
    if (ruta.size === 1) {
      // console.log('inicio');
      fileListElem.className = 'wrapper-inicio';
      if (type === 'file') {
       // let miniatura = `data:image/png;base64,${file.thumbnail}`
      } else {
        let  rutaImagen =`./img/${file.name.replace(/[0-9] */g, "")}.png`;
         // ruta de la carpta que renderizaa
         //console.log(rutaImagen.toLowerCase());
        return `<div id="path" data-path="${file.path_lower}"             class="directorio-principal-inicio  pointer ${file.name.replace(/[0-9] */g, "").toLowerCase()}">
                <div class="over-flow-inicio"><img src="${rutaImagen.toLowerCase()}" alt=""></div>
                <p class="texto-inicio" data-name="${file.name}" >${file.name.replace(/[0-9] */g, "")}</p>
            </div>`;       
      }
    } else {     
      fileListElem.className = 'wrapper-secundario';    
      if (type === 'file') {
        let extencion = esExtencion(file.path_lower.split('.')[1]);
        return `<a id="file" data-path="${file.path_lower}">
        <div class="directorio-principal-secundario  pointer">
        <div class="over-flow-secundario ${extencion}"></div>
        <p class="texto-secundario">${file.name.split('.')[0]}</p>
    </div>
    </a>`;
      } else {
        return `<div id="path" data-path="${file.path_lower}" class="directorio-principal-secundario  pointer">
        <div class="over-flow-secundario path"></div>
        <p class="texto-secundario" data-name="${file.name}">${file.name}</p>
    </div>`;
      }
    }
  }).join('');

}
const obtenerIcono = async (files) => {
  const resImg = await dbx.filesGetThumbnailBatch({
    entries: files.entries.map(function (entry) {
      return {
        path: entry.id,
        format: { '.tag': 'png' },
        size: { '.tag': 'w2048h1536' }
      }
    })
  });
  const newStateFiles = [...state.files]
  resImg.entries.forEach(e => {    
    if(e['.tag'] === 'success'){
      let indexToUpdate = state.files.findIndex(
      stateFile => e.metadata.path_lower === stateFile.path_lower
      )
      newStateFiles[indexToUpdate].thumbnail = e.thumbnail
    }
   });
  state.files = newStateFiles
  renderizar();
};
window.addEventListener('hashchange', () => {
  loadingElem.classList.remove('hidden')
  //console.log('cambio de hash');
  let hashid = location.hash.split('#')[1];
  if (hashid.includes('-')) {
    hashid = hashid.toLowerCase().split('-').join(' ');
    state.rootPath = hashid;
    hashid = hashid.toLowerCase().split(' ').join('-');
  }else{
    state.rootPath = hashid;
  }
  ruta.clear()
  hashid.split('/').forEach(e => {
    if (e === '') { } else { ruta.add(`/${e}`); }
  })
  reset();
})


console.log(location.hash);

location.hash = state.rootPath;
console.log(location.hash);
ruta.add(location.hash.split('#')[1]);
console.log(ruta);