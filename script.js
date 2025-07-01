const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let image = new Image();

document.getElementById("imageLoader").addEventListener("change", handleImage, false);
document.getElementById("dataLoader").addEventListener("change", handleData, false);

function handleImage(e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = function () {
      // масштабируем под canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function handleData(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    drawFixations(json);
  };
  reader.readAsArrayBuffer(file);
}

function drawFixations(data) {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  data.forEach((fix) => {
    // предполагается, что данные содержат X и Y координаты
    const x = parseFloat(fix.X);
    const y = parseFloat(fix.Y);
    if (!isNaN(x) && !isNaN(y)) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
