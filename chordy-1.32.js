/* v1.32 - 28 aug 2020 by TmP of PacoLemon */
(function () {
  
  let $ = function(selector, node=document) { let nodes = node.querySelectorAll(selector); return (nodes.length === 1 && selector.indexOf('#') === 0) ? nodes[0] : nodes };
  
  function replaceLoop(song, partIndex, replaceIndex) {
    let i = partIndex + 1;
    let type = song[i][0];
    song.splice(replaceIndex, 1, song[partIndex]);
    let isReverse = (replaceIndex < partIndex);
    while ([0,1,2,5].includes(type)) {
      song.splice(replaceIndex+1, 0, song[i]);
      i++;
      replaceIndex++;
      if (isReverse) i++;
      if (i >= song.length) break;
      type = song[i][0];
    }
    
    if (song[replaceIndex][0] === 0)
      song.splice(replaceIndex, 1);
  }
  
  function findSongParts(song, partName, replaceIndex) {
    for (let i=0; i<song.length; i++) {
      let type = song[i][0];
      let content = song[i][1];
      if (type == 4 && partName.indexOf(content) > 0) {
        replaceLoop(song, i, replaceIndex);
        break;
      }
    }
  }
  
  function replaceSongParts(song) {
    for (let i=0; i<song.length; i++) {
      let type = song[i][0];
      let content = song[i][1];
      if (type == 6)
        findSongParts(song, content, i);
    }
  }
  
  const chordy = {
    unique: 0,
    once: true,
    fixLyric: function(lyric) {
      let r1, r2;
      let i = 0, clean = [];
      
      while (i < lyric.length-1) {
        
        r1=lyric[i], r2=lyric[i+1];
        
        if (r1[0]+r2[0] == 8) {lyric.splice(0,1);continue;}
        r1[1] = r1[1].replace(/  +/g,' ').replace(/^ /g,'');
        
        if (r1[0] == 6) {
          if (r1[1].indexOf('(') >= 0) r1[1] = '('+r1[1].split('(')[1];
        }
        
        clean.push(r1);
        i++;
      }
      
      if (lyric[i][0] != 4) clean.push(lyric[i]);
      for (i=0; i < clean.length; i++) {
        
        if (clean[i][0] == 4) {clean.splice(i,0,[0,'']); i++}
        else if (i > 0 && i+1 < clean.length) {
          
          if (clean[i][0] == 5 && clean[i+1][0] == 6)
          {clean.splice(i+1,0,[0,'']); i++;}
          else if (clean[i][0] == 5 && clean[i-1][0] == 6)
          {clean.splice(i,0,[0,'']); i++;}
        }
      }
      
      for (i=0; i < clean.length; i++)
        clean[i][1] = clean[i][1].replace(/ +/g, ' ').replace(/ - /g,'').replace(/ +/g, ' ');
  
      return clean;
    },
    getResponsiveString: function(song, profile) {
  
      function findSplitIndex(s1, s2, idx) {
        let cutPoint = 0;
        let doNot = false;
        for (let j = Math.max(s1[1].length-1, s2[1].length-1); j > 0; j--) {
          if (s1[1].length < charLim*1/4 && s2[1].length > charLim*3/4) {
            if (idx === 1 && s2[1].charAt(j) === ' ' && j > charLim*3/4) {
              cutPoint = j;
              findSplitIndex.j = j;
            } else if (idx === 1 && s2[1].charAt(j) === ' ' && j <= charLim*3/4) {
              song.splice(i+idx,0,[s2[0],s2[1].slice(j)]);
              break;
            }
            continue;
          }
          
          if (idx === 1 && s2[1].charAt(j) === ' ' && j > charLim*3/4) cutPoint = j;
          let isChord = (s1[1].charAt(j).match(/ |>|[A-G]/) !== null);
          let isnotSlash = (s1[1].charAt(j-1) !== '/');
          if (isChord && isnotSlash && s2[1].charAt(j) === ' ' && j < charLim*4/5) {
            if (j < charLim*1/2 && cutPoint !== 0) {j = cutPoint;doNot=true;}
            song.splice(i+idx,0,[s2[0],s2[1].slice(j)]);
            if (!doNot) song.splice(i+idx,0,[s1[0],s1[1].slice(j)]);
            findSplitIndex.j = j;
            break;
          }
        }
      }
  
      for (var i=0,j,t,s,charLim=profile.char; i < song.length; i++) {
        s = song[i];
        t = s[0], s=s[1];
        if (s.length <= profile.char) continue;
          
        if (t === 1) {
          findSplitIndex(song[i], song[i+1],2);
          song[i][1] = s.substr(0, findSplitIndex.j);
          song[i+1][1] = song[i+1][1].substr(0, findSplitIndex.j);
        } else if (i-1 >= 0 && song[i-1][0] === 1) {
          findSplitIndex(song[i-1], song[i],1);
          song[i-1][1] = song[i-1][1].substr(0, findSplitIndex.j);
          song[i][1] = s.substr(0, findSplitIndex.j);
        } else {
          if (t === 2) {
            for (j=s.length-1; j>0; j--) {
              if (s.charAt(j) === '|' && j < charLim*4/5) {
                song.splice(i+1,0,[t,s.slice(j)]);
                song[i][1] = s.substr(0,j)+'|';
                break;
              }
            }
          } else {
            for (j=s.length-1; j>0; j--) {
              if (s.charAt(j) === ' ' && j < charLim*4/5) {
                song.splice(i+1, 0, [t, s.slice(j)]);
                song[i][1] = s.substr(0, j);
                break;
              }
            }
          }
        }
      }
      return song;
    },
    wrapInStyle: function(t, s, wrapper) {
      if (t === 4) {
        if (wrapper.data._mode == 1)
          s = "<b class='chordy-structures "+s.split(' ')[0]+"'><i>"+s+"</i></b>";
        else
          s = "<b class='chordy-structures "+s.split(' ')[0]+"'>"+s+"</b>";
      } else if (t === 3) {
        
        let key = (s.match(/[A-G]+[#mb]*/));
        if (key[0].indexOf('m') > 0) {
          wrapper.data._minor = true;
          key[0] = key[0].replace('m','');
          s = s.replace(key[0]+'m',"<b id='chordy-key-"+wrapper.data.unique+"' class='chordy-chords-"+wrapper.data.unique+"'>"+key+"</b><b>m</b>");
        } else {
          wrapper.data._minor = false;
          s = s.replace(key[0],"<b id='chordy-key-"+wrapper.data.unique+"' class='chordy-chords-"+wrapper.data.unique+"'>"+key+"</b>");
        }
        wrapper.data.LC.chords.push(key[0]);
        wrapper.data.transposer._baseKey = chordy.transposer.key.indexOf(key[0]);
        wrapper.data.transposer._activeKey = chordy.transposer.key.indexOf(key[0]);
      } else if (t === 1 || t === 2) {
        wrapper.data.LC.chords.push(s);
        s = "<b class='chordy-chords-"+wrapper.data.unique+"'>"+s+"</b>";
      } else if (t === 6 && wrapper.data._mode === 0) {
        var idx = s.indexOf('(')-1;
        wrapper.data.LC.chords.push(s.slice(0,idx));
        s = "<b class='chordy-chords-"+wrapper.data.unique+"'>"+s.slice(0,idx)+"</b>"+s.slice(idx);
      }
      if (wrapper.data._mode === 1) {
        if (t === 5)
          s = "<span>"+s+"</span>";
      }
      return s;
    },
    fillPages: function(song, profile, wrapper) {
      wrapper.data.LC.chords = [];
      
      let i, s;
      let dat = [];
      for (i = 0; i < song.length; i++) {
        s = song[i];
        dat.push(chordy.wrapInStyle(s[0], s[1], wrapper));
      }
      return dat;
    },
    getPlayerProfile: function(wrapper) {
      let vw = Math.max(225, wrapper.offsetWidth);
      let cw = $('#chordy-char').offsetWidth / 10;
      let vh = wrapper.offsetHeight;
      let ch = $('#chordy-char').offsetHeight;
      
      wrapper.setAttribute('chordy-width', wrapper.offsetWidth);
      
      return {char:Math.floor(vw/cw),line:Math.floor(vh/ch)}
    },
    classify: function(song) {
      let lines = song.trim().split('\n');
      let lyric=[], 
        GC = [], 
        charLen = 0, 
        noKey = true;
      
      for (let i=0; i<lines.length; i++) {
        let line = lines[i];
        let type = 0;
        
        if (line.length > 0) {
          if (line.indexOf('[[') === 0) {
            type = 6;
          } else if (noKey && line.indexOf('Key :') === 0) {
            type = 3; 
            noKey = false;
          } else if (line.match(/[R~hp,SrtkewnKOl"oygf!PI]| d/g) === null) {
            let chords = line.split(' ');
            for (let chord of chords) {
              if (chord.length == 0 || chord.match(/[.|\||\|\|]/) !== null) continue;
              if (GC.indexOf(chord) < 0) GC.push(chord);
            }
            type = (line.indexOf('|') < 0) ? 1 : 2;
            charLen = Math.max(charLen, line.length);
          } else if (line.indexOf('!') < 0 && line.match(/VERSE|INTERLUDE|CHORUS|INTRO|ENDING|BRIDGE|PRE-CHORUS|OUTRO|CODA/)) {
            type = 4; 
            lyric.push([4, line]);
          } else {
            type = 5; 
            if (line.indexOf('Capo ') < 0) {
              lyric.push([5, line]); 
            }
            charLen = Math.max(charLen,line.length);
          }
        }
        
        lines[i] = [type, line];
        
        if (i > 2 && i < lines.length-1 && lines[i-1][0] === 5 && lines[i][0] === 0) {
          lyric.push([5, line]);
        }
      }
      
      replaceSongParts(lines);
      
      for (let i=0; i<lyric.length-1; i++) {
        if (lyric[i][1] === "" && lyric[i+1][0] === 4) {
          lyric.splice(i,1);
          i -= 1;
        }
      }
      
      return {
        song: lines,
        lyric: chordy.fixLyric(lyric),
        charLen: charLen,
        GC: GC,
        chords: [],
      }
    },
    toggleLyric: function(wrapper, persistent) {
      if (persistent !== undefined) {
        $('#chordy-char').classList.toggle('mode1', persistent);
        $('#chordy-char').classList.toggle('mode2', !persistent);
        wrapper.data.player.mode = (persistent) ? 2: 1;
      } else {
        $('#chordy-char').classList.toggle('mode1');
        $('#chordy-char').classList.toggle('mode2');
        wrapper.data.player.mode = wrapper.data.player.mode % 2 + 1;
      }
        
      if (wrapper.data.player.mode == 2) chordy.transposer.disable();
      else chordy.transposer.enable();
      chordy.rebound();
    },
    transposer: {
      key: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
      keyGate: function(i) { return (i > 11) ? (i - 12) % 12 : i; },
      transpose: function(finalKey, wrapper) {
        chordy._chordBase = [];
        var activeKey = wrapper.data.transposer._baseKey;
        var transPoint =  (activeKey > finalKey) ? 12-activeKey+finalKey*1 : finalKey-activeKey;
        var o1 = [], o2 = [], pc = [];
        for (var i = 0; i < 12; i++) {
          o1.push(chordy.transposer.key[chordy.transposer.keyGate(activeKey+i)]);
          o2.push(chordy.transposer.key[chordy.transposer.keyGate(activeKey+i+transPoint)]);
          pc.push(o1[i].length - o2[i].length);
        }
      
        var chord = wrapper.data.LC.chords;
  
        for (i = 0; i < chord.length; i++) {
          
          var char = chord[i].split('');
          var splitNew = [];
          for (var j=0;j < char.length;j++) {
            
            skip = false;
            var c = char[j];
            if (char[j+1] === '#' || char[j+1] === 'b') {
              
              skip = true;
              char[j] += char[j+1];
            }
              
            var batIdx = o1.indexOf(char[j]);
            if (batIdx >= 0) {
              char[j] = o2[batIdx];
              if (pc[batIdx] === 1 || pc[batIdx] === -1) {
                for (var j2 = j + 1; j2 < char.length; j2++) {
                  if (char[j2] === ' ') {
                    char[j2] = (pc[batIdx] === 1) ? '  ' : (char[j2+1]) === ' ' ? '' : ' ';
                    break;
                  }
                }
              }
            }
            
            splitNew.push(char[j]);
            
            if (skip) j++;
          }
          $('.chordy-chords-'+wrapper.data.unique)[i].textContent = splitNew.join('');
          
          let chordAtom = $('.chordy-chords-'+wrapper.data.unique)[i].textContent.split(' ');
          for (let j = 0; j < chordAtom.length; j++) {
            if (chordAtom[j].length == 0 || chordAtom[j].match(/[.|\||\|\|]/) !== null) continue;
            if (chordy._chordBase.indexOf(chordAtom[j]) < 0) chordy._chordBase.push(chordAtom[j]);
          }
        }
        
        wrapper.data.transposer._activeKey = finalKey;
      },
      init: function(wrapper) {
        if ($('#chordy-key-'+wrapper.data.unique) !== null) {
          $('.chordy-transpose').forEach((el) => {
            if (wrapper.data._minor) el.textContent = el.textContent.replace('*','').replace('m','')+'m';
            if (el.textContent.replace('m','').replace('*','') == $('#chordy-key-'+wrapper.data.unique).textContent)
              el.textContent = el.textContent.replace('*','')+'*';
            else
              el.textContent = el.textContent.replace('*','');
          });
        }
      },
      disable: function() {
        $('.chordy-transpose').forEach((el) => {
          el.setAttribute('disabled','disabled');
        });
      },
      enable: function() {
        $('.chordy-transpose').forEach((el) => {
          el.removeAttribute('disabled');
        });
      }
    },
    render: function(wrapper) {
      const profile = chordy.getPlayerProfile(wrapper);
      wrapper.data.player.charLim = profile.char;
      wrapper.data.player.rowLim = profile.line;
      const data = chordy.getResponsiveString(JSON.parse(JSON.stringify(wrapper.data.LC.song)), profile);
      wrapper.innerHTML = chordy.fillPages(data, profile, wrapper).join('\n');
    },
    rebound: function() {
      const wrappers = $('.chordy-container');
      
      for (let wrapper of wrappers) {
        
        if (wrapper.offsetWidth !== wrapper.getAttribute('chordy-width')) {
          const tmpKey = wrapper.data.transposer._activeKey;
          const profile = chordy.getPlayerProfile(wrapper);
          let data;
          if (wrapper.data.player.mode == 2) {
            data = chordy.getResponsiveString(JSON.parse(JSON.stringify(wrapper.data.LC.lyric)),profile);
            wrapper.classList.toggle('mode1', false);
            wrapper.classList.toggle('mode2', true);
          } else {
            data = chordy.getResponsiveString(JSON.parse(JSON.stringify(wrapper.data.LC.song)),profile);
            wrapper.classList.toggle('mode1', true);
            wrapper.classList.toggle('mode2', false);
          }
          wrapper.innerHTML = chordy.fillPages(data, profile, wrapper).join('\n');
          chordy.transposer.transpose(tmpKey, wrapper);
        }
        
      }
      
    },
    init: function(containerElement) {
      
      if (chordy.once) {
        chordy.supportElement();
        window.addEventListener('resize', function chordyRebound() {
          chordy.rebound();
        });
        chordy.once = false;
      }
      
      if (containerElement[0] === undefined)
        containerElement = [containerElement];
      
      for (let wrapper of containerElement) {
      
        wrapper.classList.add(['chordy-container'], ['mode1']);
        const content = wrapper.innerText;
        
        wrapper.data = {
          _mode: 1,
          _minor: false,
          unique: chordy.unique,
          LC: chordy.classify(content),
          player: {
            charLim:0,
            rowLim:0,
            totPage:0,
            totPaper:0,
            mode:1
          },
          transposer: {
            _activeKey: null,
            _baseKey: null
          }
        };
        chordy.render(wrapper);
        chordy.transposer.init(wrapper);
        
        chordy.unique += 1;
        
      };
    },
    supportElement: function() {
      let style = document.createElement('style');
      style.setAttribute('id', 'chordy-style');
      style.innerHTML = `
        .chordy-container {white-space:pre;line-height:1.4em;}
        .chordy-container.mode1 {font-family:Cousine, monospace;font-size:13px;}
        .chordy-container.mode2 {font-family:Telex, sans-serif;font-size:15px;}
        #chordy-char.mode1 {min-width:7px;float:left;font-family:Cousine, monospace;font-size:13px;}
        #chordy-char.mode2 {min-width:7px;float:left;font-family:Telex, sans-serif;font-size:15px;}`;
      document.head.appendChild(style);
      
      let div = document.createElement('div');
      div.style.overflow = 'hidden';
      div.style.height = '0';
      
      let p = document.createElement('p');
      p.setAttribute('id', 'chordy-char');
      p.classList.add(['mode1']);
      p.textContent = 'DEFGHI_+_-';
  
      div.appendChild(p);
      document.body.appendChild(div);
    }
  };  
  
  if (window.chordy === undefined) {
    window.chordy = chordy;
  } else {
    console.error('chordy.js:', 'Failed to initialize. Duplicate variable exists.');
  }
})();
