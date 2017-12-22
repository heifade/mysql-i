// 替换 doc 目录下面所有"_" 打头的文件
let fs = require("fs");
let fsi = require("fs-i");

let renameFileList = [];
function rename(fileName) {
  return fileName
    .replace(/\/_/, "/")
    .replace(/_\//g, "/")
    .replace(/\/_/g, "/")
    .replace(/_\./g, ".")
    .replace(/_/g, '.')
    // .replace(/_(.)/g, (word, a, b, c) => {
    //   return a.toUpperCase();
    // });
}

// 遍历目录，重命名所有带"_"的文件
async function renameFile(path) {
  let fileList = await fsi.getAllFiles(path);
  for (let fileName of fileList) {
    var toName = rename(fileName);

    if (fileName != toName) {
      fs.renameSync(fileName, toName);
      renameFileList.push({
        fileName: fileName.substr(fileName.lastIndexOf("/") + 1),
        toName: toName.substr(toName.lastIndexOf("/") + 1)
      });
    }
  }
}

// 在文件中更新文件引用
async function replaceFile(path) {
  let fileList = await fsi.getAllFiles(path);
  for (let fileName of fileList) {
    if (fileName.endsWith(".html") || fileName.endsWith(".js") || fileName.endsWith(".htm")) {
      var content = fs.readFileSync(fileName, "utf-8");
      renameFileList.map(h => {
        content = content.replace(new RegExp(h.fileName, "g"), h.toName);
      });
      fs.writeFileSync(fileName, content);
    }
  }
}

(async function() {
  await renameFile("./docs");
  await replaceFile("./docs");
})().then();
