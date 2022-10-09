
    let slimSelectAlbum = new SlimSelect({
        select: '#chooseAlbum'
    });

    let slimSelectMusic = new SlimSelect({
        select: '#chooseMusic'
    });


    var audio, playbtn, mutebtn, 
    seekslider, volumeslider, 
    seekto, seeking=false, 
    curtimetext, durtimetext,
    play_status, playlist,
    ext, playlist_index, agent,isMobile, 
    modeSwitch, playModeValue, musicBank;
    
    function initAudioPlayer() {
        // Set Object references
        playbtn = document.getElementById("myPlay");
        mutebtn = document.getElementById("myMute");
        nextbtn = document.getElementById("myNext");
        prevbtn = document.getElementById("myPrev");
        volumeslider = document.getElementById("myVolume");
        seekslider = document.getElementById("mySeek");
        curtimetext = document.getElementById("curtimetext");
        durtimetext = document.getElementById("durtimetext");
        play_status = document.getElementById("myStatus");
        modeSwitch = document.getElementsByName("modeS");
        chooseMusic = document.getElementById("chooseMusic");
        chooseAlbum = document.getElementById("chooseAlbum");
        
        isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
        };

        

        
        //Functions
        function getDataAlbum(){

                let df = document.createDocumentFragment();
                for(let d=0;d<albumBank.length;d++)
                {
                let option = document.createElement('option');
                option.value = albumBank[d].url;
                option.appendChild(document.createTextNode(albumBank[d].name));
                df.appendChild(option);
                }
                chooseAlbum.appendChild(df);
                chooseAlbum.addEventListener("change", getDataMusic);
	    }

        getDataAlbum();


        function getDataMusic(){
            musicBank = chooseAlbum.options[chooseAlbum.selectedIndex].value
            fetch(musicBank + 'data.json', {
                method: 'GET'
            })
            .then((response) => response.json())
            .then((result) => {

                playlist = result.music;

                console.log(result.music);

                var df = document.createDocumentFragment();
                for(var d=0;d<playlist.length;d++)
                {
                let option = document.createElement('option');
                option.value = playlist[d];
                option.appendChild(document.createTextNode(playlist[d]));
                df.appendChild(option);
                }
                chooseMusic.appendChild(df);
                readyAudio();
            })
            .catch((error) => {
                console.error('Error:', error);
            });

	    }
        // getDataMusic();

        function readyAudio(){
            // Audio Object
            audio = new Audio();

            playModeValue = "0";
            playlist_index = 0;
            agent = navigator.userAgent.toLowerCase();
            audio.src = musicBank+playlist[0];
            audio.loop = false;
            audio.play();
            play_status.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index].name;
            document.title = play_status.innerText;
            
            playbtn.addEventListener("click", playPause);
            mutebtn.addEventListener("click", mute);
            nextbtn.addEventListener("click", nextPlay);
            prevbtn.addEventListener("click", prevPlay);
            if(isMobile.Android() || isMobile.any() ) {
            /*seekslider.addEventListener("touchend", function(event){ seeking=true; seek(event); });
            seekslider.addEventListener("touchmove", function(event){ seek(event); });
            seekslider.addEventListener("touchstart", function(){ seeking=false; });*/
            
            seekslider.addEventListener("touchstart", function(event){ seeking=true; seekandro(event); });
            seekslider.addEventListener("touchmove", function(event){ seekandro(event); });
            seekslider.addEventListener("touchend", function(){ seeking=false; });
            volumeslider.addEventListener("touchmove", setvolume);
            } else {
            seekslider.addEventListener("mousedown", function(event){ seeking=true; seek(event); });
            seekslider.addEventListener("mousemove", function(event){ seek(event); });
            seekslider.addEventListener("mouseup", function(){ seeking=false; });
            volumeslider.addEventListener("mousemove", setvolume);
            }
            audio.addEventListener("timeupdate", function() { seektimeupdate(); })
            audio.addEventListener("ended", function(){ switchTrack(); });

            chooseMusic.addEventListener("change", musicChoose);
            
            for(let i = 0; i < modeSwitch.length ; i++){
                modeSwitch[i].addEventListener("change", function() {
                    console.log(this.value);
                    if(this == null){
                        playModeValue = 0;
                    }
                    playModeValue = this.value;
                })
            }
        
        }

        function musicChoose() {
            audio.pause();
            audio.currentTime = 0;
            let checkedMusic = chooseMusic.options[chooseMusic.selectedIndex].value
            audio.src = musicBank+checkedMusic;
            playlist_index = chooseMusic.selectedIndex
            play_status.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index].name;
            document.title = play_status.innerText;
            playPause(true);
        }
        function switchTrack() {
            if(playModeValue == "1"){
               playlist_index = Math.floor(Math.random() * (playlist.length - 1));
            } else {
                if(playlist_index == (playlist.length - 1)){
                    playlist_index = 0;
                } else {
                    playlist_index++;
                }
            }
            play_status.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index].name;
            document.title = play_status.innerText;
            audio.src = musicBank+playlist[playlist_index];
            audio.play();
        }
        
        
        function playPause(playTrigger){
            this.playTrigger = playTrigger;
            
            if(playTrigger = true){
                audio.play();
                playbtn.children[0].src = "image/pause.png";
            }else{
                audio.pause();
                playbtn.children[0].src = "image/play.png";
            }
        }
        
        function playPause(){
            if(audio.paused){
                audio.play();
                playbtn.children[0].src = "image/pause.png";
                // playbtn.innerText = "Pause";
            } else {
                audio.pause();
                playbtn.children[0].src = "image/play.png";
    // 			playbtn.innerText = "Play";
            }
        }
        function mute(){
            if(audio.muted){
                audio.muted = false;
            } else {
                audio.muted = true;
            }
        }
        function seek(event){
            if(seeking){
                seekslider.value = event.clientX - seekslider.offsetLeft;
                seekto = audio.duration * (seekslider.value / 100);
                audio.currentTime = seekto;
                
            }
        }
        
        function seekandro(event){
            if(seeking){
                seekslider.value = event.touches[0].clientX - seekslider.offsetLeft;
                seekto = audio.duration * (seekslider.value / 100);
                audio.currentTime = seekto;
    
            }
        }
        
        
        function setvolume() {
            audio.volume = volumeslider.value / 100;
        }
        function seektimeupdate() {
            var nt = audio.currentTime * (100 / audio.duration);
            seekslider.value = nt;
            var curmins = Math.floor(audio.currentTime / 60);
            var cursecs = Math.floor(audio.currentTime - curmins * 60);
            var durmins = Math.floor(audio.duration / 60);
            var dursecs = Math.floor(audio.duration - curmins * 60);
            if(cursecs < 10) { cursecs = "0"+cursecs;}
            if(dursecs < 10) { dursecs = "0"+dursecs;}
            if(curmins < 10) { curmins = "0"+curmins;}
            if(durmins < 10) { durmins = "0"+durmins;}
            curtimetext.innerHTML = curmins+":"+cursecs;
            durtimetext.innerHTML = durmins+":"+dursecs;
        }
        function nextPlay() {
            if(playlist_index > (playlist.length - 1)){
                playlist_index = 0;
            }
            playlist_index++;
            play_status.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index].name;
            document.title = play_status.innerText;
            audio.src = musicBank+playlist[playlist_index];
            playPause(true);
        }
        function prevPlay() {
            if(playlist_index < 1 ) {
             alert("Error Mbah");
            }else {
            playlist_index--;
            play_status.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index].name;
            document.title = play_status.innerText;
            audio.src = musicBank+playlist[playlist_index];
            playPause(true);
            }
        }
        
    }
    
    window.addEventListener('DOMContentLoaded', (event) => {
        initAudioPlayer();
    });