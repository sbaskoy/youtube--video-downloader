const dotenv = require("dotenv");
dotenv.config()

const express = require('express');
const ytdl = require('ytdl-core');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const PORT = process.env.PORT || 1882;

const app = express();

app.use(cookieParser('NotSoSecret'));
app.use(session({
    secret: 'something',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'))

app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    const error = req.flash("error");
    console.log("Error", error);
    res.render('pages/index');
});

app.post('/download', (req, res) => {

    const downloadType = req.body.type || "video";
    const qualityType = req.body.quality || "lowest";

    const url = req.body.url;
    if (!url) {
        req.flash("error", "Please enter video url");
        return res.redirect("/")
    }


    var quality = "lowest";
    if (downloadType == "video") {
        if (qualityType == "lowest") {
            quality = "lowest"
        } else {
            quality = "highest"
        }
    } else {
        if (qualityType == "lowest") {
            quality = "lowestaudio"
        } else {
            quality = "highestaudio"
        }
    }
  
    const fileName = downloadType == "video" ? "video.mp4" : "audio.mp3";
    
    const video = ytdl(url, {
        quality: quality,
        filter: downloadType == "audio" ? "audioonly" : "videoandaudio"
    });


    video.once('response', () => {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        video.pipe(res);
    });

    video.on('progress', (chunkLength, downloaded, total) => {
        // Progress tracking logic (unchanged)
    });

    video.on('end', () => {
        console.log('Download completed');
    });
})

app.listen(PORT);
console.log('Server is listening on port ' + PORT);