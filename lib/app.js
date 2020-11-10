"use strict";

const __toolpicRenderEndpoint = 'https://api.fridaysforfuture.io/render';
const app = new Vue({
  el: '#app',
  data: {
    image: 'https://cdn.fridaysforfuture.io/toolpic/templates/ProfilePicture/preview.png',
    blob: null,
    loading: false
  },

  mounted() {
    console.log(this);
  },

  methods: {
    upload() {
      openFile({
        width: 400,
        height: 400,
        convertToJPG: true
      }).then(img => {
        console.log(img.data.length);
        this.loading = true;
        this.generate(img.data);
      });
    },

    downloadImage() {
      if (this.blob) {
        download(this.blob, 'Profil-Bild', 'image/png');
      }
    },

    generate(data) {
      const sessionId = Date.now();
      fetch(__toolpicRenderEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "root": "https://cdn.fridaysforfuture.io/toolpic/templates_precompiled/ProfilePicture/Danni.vue.js",
          "assets": "https://cdn.fridaysforfuture.io/toolpic/templates_precompiled/ProfilePicture",
          "width": 400,
          "height": 400,
          "format": "png",
          "type": "image",
          "data": {
            "image": [data],
            "pos": 0,
            "borders": [{
              "clipPath": null,
              "colors": ["#65A36D", "#457349"]
            }, {
              "clipPath": "url(#secondary-area)",
              "colors": ["#E23F3F", "#C71E1E"]
            }],
            "textPathRadiusTop": 445,
            "textPathRadiusBottom": 470
          },
          "sessionId": sessionId,
          "renderings": 1
        })
      }).then(response => response.blob()).then(blob => {
        this.blob = blob;
        this.loading = false;
        const url = URL.createObjectURL(blob);
        console.log(blob);
        console.log(url);
        this.image = url;
      });
    }

  }
});

function blobToDataURL(blob) {
  return new Promise(function (resolve, reject) {
    var a = new FileReader();

    a.onload = function (e) {
      resolve(e.target.result);
    };

    a.readAsDataURL(blob);
  });
}

function imageInfo(url, mime) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.src = url;
    img.addEventListener("load", function () {
      resolve({
        data: url,
        width: img.width,
        height: img.height,
        ratio: img.width / img.height
      });
    });
  });
}

function openFile(opts) {
  /*
  width: this.width,
  height: this.height,
  convertToJPG: this.convertToJPG
  */
  return new Promise(function (resolve, reject) {
    const hiddenInput = Object.assign(document.createElement("input"), {
      type: 'file',
      style: `
        position: fixed;
        left: 200%;
        top: 200%;
      `
    });
    document.body.append(hiddenInput);
    hiddenInput.addEventListener("change", async function (event) {
      const file = event.target.files[0];
      new Compressor(file, {
        quality: 0.7,
        checkOrientation: true,
        maxWidth: opts.width,
        maxHeight: opts.height,
        convertSize: opts.convertToJPG ? 0 : Infinity,

        async success(result) {
          const dataURL = await blobToDataURL(result);
          const imgInfo = imageInfo(dataURL);
          document.body.removeChild(hiddenInput);
          resolve(imgInfo);
        },

        error(err) {
          console.log(err.message);
        }

      });
    });
    hiddenInput.click();
  });
}