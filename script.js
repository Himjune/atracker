const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let image = new Image();
let rawData = [];

let aoiList = [];


document.getElementById("imageLoader").addEventListener("change", handleImage, false);
document.getElementById("dataLoader").addEventListener("change", handleData, false);

function resizeCanvasToDisplaySize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.width * 9 / 16;
}

function handleImage(e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = function () {
      resizeCanvasToDisplaySize();
      drawImageAndFixations(); // отрисовка после загрузки
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
    rawData = XLSX.utils.sheet_to_json(worksheet);
    drawImageAndFixations();
  };
  reader.readAsArrayBuffer(file);
}

document.getElementById("aoiLoader").addEventListener("change", handleAoi, false);

function handleAoi(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const json = JSON.parse(event.target.result);
      console.log(json)
      aoiList = json.list || [];
      console.log(aoiList)
      drawImageAndFixations();
    } catch (err) {
      alert("Ошибка при чтении AOI-файла.");
    }
  };
  reader.readAsText(file);
}


function drawImageAndFixations() {
  if (!image.src) return;
  resizeCanvasToDisplaySize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Фиксации
  if (rawData.length > 0) {
    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;
    ctx.fillStyle = "red";
    rawData.forEach((fix) => {
      const x = parseFloat(fix.X) * scaleX;
      const y = parseFloat(fix.Y) * scaleY;
      if (!isNaN(x) && !isNaN(y)) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // AOI рамки
  if (aoiList.length > 0) {
    aoiList.forEach((aoi) => {
      const left = aoi.left * canvas.width;
      const top = aoi.top * canvas.height;
      const right = aoi.right * canvas.width;
      const bottom = aoi.bottom * canvas.height;
      const width = right - left;
      const height = bottom - top;

      ctx.strokeStyle = "rgba(0,195,0,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      // подпись
      if (aoi.name) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillText(aoi.name, left + 4, top + 16);
      }
    });
  }
}


window.addEventListener("resize", drawImageAndFixations);
