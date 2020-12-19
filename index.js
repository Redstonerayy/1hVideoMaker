/*
----------------------------------------------------------------
 DANGER LARGE FILES 2GB <
 IT DOES TAKE TIME
 SOME FILES WILL BE GENERATED, BUT THEN DELETED IF SPECIFIED
----------------------------------------------------------------
*/
//requirements
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

//dump
textfield = document.getElementById("input");
button = document.getElementById("btn");
picture = document.getElementById("pic");
hoursinput = document.getElementById("hours");
keep = document.getElementById("keep");

//vars
keep1h = false;
keepvidaud = false;
hours = 1;
pic = null;

//functions

function make1hvideo(filename){
  //merge 1h files
  vidaud = ffmpeg()
  //make photo instead of 1h video
  if(pic != null){
    vidaud.input(pic); // look end
    vidaud.inputOptions("-loop 1");
  } else {
    vidaud.input(filename + "1 Hour Versionv.mp4");
  }
  vidaud.input(filename + "1 Hour Versiona.mp4")
  .outputOptions([
    "-shortest",
    "-acodec copy"])
  .output(filename + " 1 Hour Version.mp4")
  .on("start", (cmdline) => {
    console.log(cmdline);
  })
  .on("end", () => {
    //delete other files
    if(!keepvidaud){
      fs.unlinkSync(filename + "a.mp4");
      fs.unlinkSync(filename + "v.mp4");
    }
    if(!keep1h){
      fs.unlinkSync(filename + "1 Hour Versiona.mp4");
      fs.unlinkSync(filename + "1 Hour Versionv.mp4");
    }
    //reset vars
    keep1h = false;
    keepvidaud = false;
    hours = 1;
    pic = null;
    //reset inputs
    textfield.value = "";
    picture.value = "";
  })
  .run();
}


function make1hfiles(filename){
  //get duration
  ffmpeg.ffprobe(filename + "v.mp4", (err, metadata) => {
    duration = metadata.format.duration;
    repeat = Math.floor((hours * 60 * 60)/duration) + 1;
    //merge video to 1h
    vid1h = false;
    video = ffmpeg();
    for(let i = 0; i < repeat; i++){
      video.input(filename + "v.mp4");
    }
    video.on("end", () => {
      vid1h = true;
      if(aud1h){
        make1hvideo(filename);
      }
    });
    video.mergeToFile(filename + "1 Hour Versionv.mp4", ".");
    //merge audio to 1h
    aud1h = false;
    audio = ffmpeg();
    for(let i = 0; i < repeat; i++){
      audio.input(filename + "a.mp4");
    }
    audio.on("end", () => {
      aud1h = true;
      if(vid1h){
        make1hvideo(filename);
      }
    });
    audio.mergeToFile(filename + "1 Hour Versiona.mp4", ".");
  });
}


//Events

button.addEventListener("click", async() => {
  if(ytdl.validateURL(textfield.value)){
    //title
    info = await ytdl.getInfo(textfield.value);
    filename = info.videoDetails.title;

    //assign options
    pic = picture.value;
    fs.stat(pic, (err, stats) => {
      if(err){
        pic = null;
      }
      try{
        if(!stats.isFile()){
          pic = null;
        }
      } catch(e){
      }
    });
    if(hoursinput.value != ""){
      try {
        hours = +(hoursinput.value);
      } catch (e) {
        hours = 1;
      }
    }
    //keep files
    keepstring = keep.value;
    keepstring = keepstring.split(" ");
    if(keepstring[0] === "true"){
      keep1h = true;
    }
    if(keepstring[1] === "true"){
      keepvidaud = true;
    }
    //remove chars from name that can`t be in windows filename
    // <>:"/\|?*
    char = String.raw`<>:"/\|?*`;//"- "
    for (let i = 0; i < filename.length; i++) {
	    for(let j = 0; j < char.length; j++){
        filename = filename.replace(char[j], "");
	    }
    }

    //video
    var vid = false;
    ytdl(textfield.value, { quality: "lowestvideo"})
    .on("finish", () => {
      vid = true;
      if(aud){
        make1hfiles(filename);
      }
    })
    .pipe(fs.createWriteStream(filename + "v.mp4"));

    //audio
    var aud = false;
    ytdl(textfield.value, { quality: "lowestaudio"})
    .on("finish", () => {
      aud = true;
      if(vid){
        make1hfiles(filename);
      }
    })
    .pipe(fs.createWriteStream(filename + "a.mp4"));
  }
});


/*
----------------------------------------------------------------------------
 FOUND OUT AND USEFUL PART
----------------------------------------------------------------------------
//its important that the picture is the first input option,
//elsewise there will be an error
//stole code from here: https://www.reddit.com/r/ffmpeg/comments/keobv8/shortest_doesnt_work_as_intended/
video = ffmpeg();
video
.input("jslogo2.png")
.inputOptions("-loop 1")
.input("AeroChordTheSounda.webm")
.outputOptions([
    "-shortest",
    "-acodec copy"])
.output("testttt.mp4")
.on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
})
.run();

*/
