// osc1 is rendering (log of) time to most recent capture
// osc2 is rendering (log of) time to twenty captures ago
// color is expressing ratio of (logs of) most recent to twenty ago aka density?
// height of animation is expressing sum of the two distances
//
// all of this does not necessarily provide much moment-to-moment information,
// but gives a sort of "normal" baseline from which big differences can be
// discerned.  true?  yes -- if captures stop, overall pitch will rise.

var freq1, freq2, power, osc1base, osc1, osc2base, osc2, distances, ratio, fft, r, t;

var mycall= function(data) {
    // for (var key in data['objects']) {
    // 	console.log(data['objects'][key]['creation_timestamp']);
    // }

    // the following detects time since last capture; the log is a way
    // of reducing the magnitude of the change.
    var d = new Date();
    var last = new Date(data['objects'][0]['creation_timestamp']);
    var twenty = new Date(data['objects'][19]['creation_timestamp']);
    var recent = d - last;
    var lr = log(recent);
    var density = d - twenty;
    var ld = log(density)
    // console.log("log of time to most recent capture:");
    // console.log(lr);
    // console.log("log of time to twenty captures ago:");
    // console.log(ld);
    freq1 = 96 + lr;
    freq2 = 120 + ld;
    distances = lr + ld;
    ratio = lr / ld;
    r = lr;
    t = ld;
}


function setup() {
    freq1 = 96;
    freq2 = 120
    r = 0.0;
    t = 0.0;
    ratio = 0.0;
    createCanvas(710, 200);
    fill(255, 40, 255);
    fft = new p5.FFT();
    power = 0;
    //createCanvas(710, 200);
    osc1base = new p5.SinOsc();
    osc1 = new p5.SawOsc();
    osc2base = new p5.SinOsc();
    osc2 = new p5.SawOsc();
    // osc1base = new p5.SqrOsc();
    // osc1 = new p5.SqrOsc();
    // osc2base = new p5.SqrOsc();
    // osc2 = new p5.SqrOsc();

    osc1base.freq(freq1);
    osc1.freq(freq1);
    osc1base.pan(-0.2);
    osc1.pan(-0.2);
    osc1base.amp(power);
    osc1.amp(power);
    osc2base.freq(freq2);
    osc2.freq(freq2);
    osc2base.pan(0.2);
    osc2.pan(0.2);
    osc2base.amp(power);
    osc2.amp(power);

    update_freqs();

    osc1base.start();
    osc1.start();
    osc2base.start();
    osc2.start();
}

function draw() {
    background(30);
    
    var c1 = color("red");
    var c2 = color("blue");
    var c = lerpColor(c1, c2, ratio);
    fill(c);
    textSize(16);
    text(r.toFixed(4).toString(), 10, 30);
    text(t.toFixed(4).toString(), 10, 50);
    text(ratio.toFixed(4).toString(), 70, 40);
    // changing frequencies
    // text(freq1.toFixed(4).toString(), 140, 30);
    // text(freq2.toFixed(4).toString(), 140, 50);

    //background(0);
    // var c1 = color("red");
    // var c2 = color("blue");
    //var c = lerpColor(c1, c2, ratio);
    // //strokeWeight(2);
    //stroke(c);
    // var x = random(50, 80);
    // var y = random(50, 80);
    // ellipse(80, 80, x, 4 * distances);

    //fft.setInput(osc2);
    var spectrum = fft.analyze();
    noStroke();
    for (var i = 0; i < spectrum.length; i++) {
	var x = map(i, 0, spectrum.length, 0, width);
	var h = -height + map(spectrum[i], 0, 255, height, 0);
	rect(x, height, width/spectrum.length, h);
    }
    
    if (frameCount % 300 == 0) {
	//console.log('tick');
	update_freqs();
	//console.log("ratio of logs, last to twenty ago");
	//console.log(ratio);
    }
}

function update_freqs() {
    var script = document.createElement('script');
    script.src = "https://api.perma.cc/v1/public/archives/?callback=mycall";
    document.getElementsByTagName('head')[0].appendChild(script);
    osc1.freq(freq1);
    osc2.freq(freq2);
    // http://stackoverflow.com/a/28262648
    script.parentNode.removeChild(script);
    // osc1.freq(196 + 7 + 25);
    // osc2.freq(220 + 7 + 27);
}

function mousePressed() {
    if (power == 0) {
	power = 0.02;
    } else {
	power = 0;
    }
    osc1base.amp(power);
    osc1.amp(power);
    osc2base.amp(power);
    osc2.amp(power);
}

