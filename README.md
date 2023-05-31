# chordy.js
Responsive lyric and chord wrapper.

# Demo
https://bukupujian2.blogspot.com/2021/10/echo.html

# Basic Usage
- Wrap lyric and chord inside a container.
- Call `chordy.init()`.

```html
<div id="song">Learning How to Die
Jon Foreman
Key : D
  
CHORUS
        D
All along
                G               Em
Thought I was learning how to take
        A7              D
How to bend not how to break
        G               Em
How to live not how to cry 
            Em          A7            C
But really I've been learning how to die
             G             D    G
I've been learning how to die"</div>


<script src="path/to/chordy.js"></script>
<script>
  let container = document.getElementById('song');  
  chordy.init(container);
</script>
```

# Notes
1. Song key is classified by `Key : ` pattern.
2. Highlighted song structure are: `VERSE`, `INTERLUDE`, `CHORUS`, `INTRO`, `ENDING`, `BRIDGE`, `PRE-CHORUS`, `OUTRO`, and `CODA`.
3. Do not put anything but chord inside a chord line (e.g. Am7 ~~(Walkdown G-F-Em)~~ Gm7).
4. Any lines that does not classified as key, song structure, and chord are fall under lyric category (not wrapped within a container).
5. Careful with extra lines and spaces.
