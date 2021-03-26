const pimage = require('pureimage');
const stream = require('stream');
const fs = require('fs')


const renderBubble = async () => {
  const width = 640
  const height = 800
  const img1 = pimage.make(width, height)
  const ctx = img1.getContext('2d')
  ctx.fillStyle = 'rgba(23,31,42,1)'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(66,83,99,1)'
  drawChatBubble(15, 30, 420, 60, 20, ctx)

  const text = "oi, tudo bem contigo? queria dizer só que você é legal"
  await setFont()

  ctx.fillStyle = '#ffffff';
  ctx.font = "16pt 'Roboto'";
  ctx.fillText(text, 30, 65);

  // TODO: create in memory stream to output to the twitter api
  pimage.encodePNGToStream(img1, fs.createWriteStream('out.png')).then(() => {
    console.log("wrote out the png file to out.png");
  }).catch((e)=>{
      console.log("there was an error writing");
  });
}

const setFont = async () => {
  return new Promise((resolve, reject) => {
    try {
      const fnt= pimage.registerFont('/Users/caiogomes/Documents/projects/channel/indiretas-api/src/assets/Roboto-Regular.ttf','Roboto');
      fnt.load(() => {
        resolve();
      });
    } catch(err) {
      reject(err)
    }
  })
}

const drawChatBubble = (x, y, width, height, cornerRadius, ctx) => {
  // draw a bigger rectangle, and 2 other rectangles and 3 circles
  ctx.fillRect(x + cornerRadius, y, width - 2*cornerRadius, height)
  ctx.fillRect(x, y + cornerRadius, cornerRadius, height - 1*cornerRadius)
  ctx.fillRect(x + width - cornerRadius, y + cornerRadius, cornerRadius, height - 2*cornerRadius)
  
  // left top
  ctx.beginPath();
  ctx.arc(x + cornerRadius, y + cornerRadius, cornerRadius, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // right top
  ctx.beginPath();
  ctx.arc(x + width - cornerRadius, y + cornerRadius, cornerRadius, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // right bottom
  ctx.beginPath();
  ctx.arc(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, Math.PI, Math.PI, true);
  ctx.closePath();
  ctx.fill();
}

const drawMidBubble = (x, y, width, height, cornerRadius, ctx) => {
  // draw a bigger rectangle, and 2 other rectangles and 3 circles
  ctx.fillRect(x + cornerRadius, y, width - 2*cornerRadius, height)
  ctx.fillRect(x, cornerRadius, cornerRadius, height - 1*cornerRadius)
  ctx.fillRect(x + width - cornerRadius, y + cornerRadius, cornerRadius, height - 2*cornerRadius)

  // right top
  ctx.beginPath();
  ctx.arc(x + width - cornerRadius, y + cornerRadius, cornerRadius, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // right bottom
  ctx.beginPath();
  ctx.arc(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, Math.PI, Math.PI, true);
  ctx.closePath();
  ctx.fill();
}

renderBubble()