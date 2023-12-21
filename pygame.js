let images = {};

export class Screen {
  constructor(size, adddom = true) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    this.g = this.canvas.getContext("2d", { willReadFrequently: true });
    if (adddom) {
      const c = document.querySelector("main") || document.body;
      c.appendChild(this.canvas);
    }
  }
  blit(img, posorrect) {
    if (img && img.image) {
      if (posorrect instanceof Rect) {
        const r = posorrect;
        this.g.drawImage(img.image, r.x, r.y, r.w, r.h);
      } else {
        const pos = posorrect;
        this.g.drawImage(img.image, pos[0], pos[1]);
      }
    }
    if (img instanceof Screen) {
      const pos = posorrect;
      this.g.drawImage(img.canvas, pos[0], pos[1]);
    }
  }
  fill(color) {
    this.g.fillStyle = color.color;
    this.g.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

class Display {
  set_mode(size) {
    return new Screen(size);
  }
  set_caption(title) {
    document.title = title;
  }
  update() {
  }
};

export const display = new Display();

export class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  colliderect(r) {
    if (r.x + r.w < this.x) return false;
    if (r.y + r.h < this.y) return false;
    if (r.x > this.x + this.w) return false;
    if (r.y > this.y + this.h) return false;
    return true;
  }
  set topleft(p) {
    this.x = p[0];
    this.y = p[1];
  }
};

class PyImage {
  constructor(fn) {
    this.fn = fn;
    if (fn) {
      const i = images[fn.substring("images/".length)];
      this.rect = new Rect(0, 0, i.width, i.height);
      this.image = new Image();
      this.image.src = fn;
    } else {
      this.rect = new Rect()
    }
  }
  load(fn) {
    return new PyImage(fn);
  }
  get_rect() {
    return this.rect;
  }
};
export const image = new PyImage();

export const init = (imgs) => {
  images = imgs;
};

Array.prototype.remove = function(o) {
  const n = this.indexOf(o);
  if (n >= 0) {
    this.splice(n, 1);
  }
};
Array.prototype.append = Array.prototype.push;
Array.prototype.clear = function() {
  this.length = 0;
};

export class Font {
  constructor(font, size) {
    this.font = font;
    this.size = size * .65;
  }
  render(s, b, color) {
    const surface = new Surface([800, 100], Surface.SRCALPHA); // dummy size
    surface.g.font = `${this.size}px sans-serif`;
    surface.g.fillStyle = color.color;
    surface.g.fillText(s, 0, this.size * .8);
    return surface;
  }
};

export const font = { Font };

export class Surface extends Screen {
  static SRCALPHA = 1;

  constructor(size, opt) {
    super(size, false, opt);
    if (opt == Surface.SRCALPHA) {
      //this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //this.g.globalAlpha = 0;
    }
  }
};

const musics = [];
let music_current = null;

export class Music {
  constructor(fn) {
    this.fn = fn;
    if (fn) {
      this.audio = new Audio(fn);
      musics.push(this);
    }
  }
  load(fn) {
    return new Music(fn);
  }
  play(n) {
    if (n == -1) {
      music_current = musics[0];
      music_current.audio.loop = true;
      music_current.play();
    } else {
      this.audio.play();
    }
  }
  stop() {
    if (music_current) {
      music_current.audio.pause();
      music_current.audio.currentTime = 0;
    }
  }
};

export class Sound {
  constructor(fn) {
    this.fn = fn;
    this.audio = new Audio(fn);
  }
  play() {
    this.audio.play();
  }
};

export const mixer = { music: new Music(), Sound };

const colorset = new Set();

// https://www.pygame.org/docs/ref/color_list.html
const colormap = {
  "WHITE": [255, 255, 255, 255],
  "NAVY": [0, 0, 128, 255],
  "RED": [255, 0, 0, 255],
  "GREEN": [0, 255, 0, 255],
};
const array2color = (a) => {
  return `rgba(${a[0]},${a[1]},${a[2]},${a[3] / 255})`;
};
export class Color {
  constructor(name) {
    //colorset.add(name);
    //console.log(Array.from(colorset));
    if (typeof name == "string") {
      this.color = array2color(colormap[name]);
    } else {
      this.color = array2color(name);
    }
  }
};

export const K_a = "KeyA";
export const K_SPACE = "Space";
export const K_RIGHT = "ArrowRight";
export const K_LEFT = "ArrowLeft";

export class Key {
  constructor() {
    this.keys = {};
    document.body.onkeydown = (k) => {
      this.keys[k.code] = true;
    };
    document.body.onkeyup = (k) => {
      this.keys[k.code] = false;
    };
    const btns = {
      btnright: K_RIGHT,
      btnleft: K_LEFT,
      btnspc: K_SPACE,
      btna: K_a,
    };
    for (const name in btns) {
      const b = document.getElementById(name);
      if (b) {
        const k = btns[name];
        if ("ontouchstart" in b) {
          b.ontouchstart = () => this.keys[k] = true;
          b.ontouchend = () => this.keys[k] = false;
        } else {
          b.onmousedown = () => this.keys[k] = true;
          b.onmouseup = () => this.keys[k] = false;
        }
      }
    }
  }
  get_pressed() {
    return this.keys;
  }
};

export const key = new Key();

export class Draw {
  rect(screen, color, rect) {
    if (!(color instanceof Color)) {
      color = new Color(color);
    }

    screen.g.fillStyle = color.color;
    if (rect instanceof Rect) {
      screen.g.fillRect(rect.x, rect.y, rect.w, rect.h);
    } else {
      screen.g.fillRect(rect[0], rect[1], rect[2], rect[3]);
    }
  }
};

export const draw = new Draw();

/*
export class Clock {
  tick(n) {
    return n;
  }
};

export const time = { Clock };
*/

const c = document.documentElement;
const touchHandler = e => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};
c.addEventListener("touchstart", touchHandler, { passive: false });
c.addEventListener("touchmove", function(e) { e.preventDefault(); }, { passive: false });
c.addEventListener("touchend", function(e) { e.preventDefault(); }, { passive: false });
/*
c.addEventListener("touchstart", function(e) { e.preventDefault(); }, { passive: false });
c.addEventListener("touchmove", function(e) { e.preventDefault(); }, { passive: false });
c.addEventListener("touchend", function(e) { e.preventDefault(); }, { passive: false });
*/

const links = document.querySelectorAll("a");
links.forEach(i => {
  i.addEventListener("touchstart", function(e) {});
  i.addEventListener("touchmove", function(e) {});
  i.addEventListener("touchend", function(e) {});
});
