// based on https://github.com/web-audio-components/simple-reverb by Nick Thompson

export function Reverb(context){
  var node = context.createGain()
  
  let dry       = node._dry       = context.createGain()
  let wet       = node._wet       = context.createGain()
  let output    = node.output     = context.createGain()
  let convolver = node._convolver = context.createConvolver();
  let filter    = node._filter    = context.createBiquadFilter();

  node.connect(dry)
  node.connect(wet)

  convolver.connect(filter)
  dry.connect(output)
  wet.connect(convolver)
  filter.connect(output)

  node._time        = 2;
  node._decay       = 2;
  node._reverse     = false;
  node._filter.frequency.value = 2000;
  node._filter.gain.value = 25;
  node.filterType   = 'highpass';
  
  Object.defineProperties(node, {

    connect: {
      value: (...args) => {
        node.output.connect(...args)
      },
      configurable: true,
      writable: true
    },

    disconnect: {
      value: (...args) => {
        node.output.disconnect(...args)
      },
      configurable: true,
      writable: true
    },

    wet: {
      get: () => node._wet.gain,
      set: (value) => {
        node._wet.gain.value = value;
        node._buildImpulse();
      },
      configurable: true
    },

    dry: {
      get: () => node._dry.gain,
      set: (value) => {
        node._dry.gain.value = value;
        node._buildImpulse();
      },
      configurable: true
    },

    cutoff: {
      get: () => node._filter.frequency,
      set: (value) => {
        node._filter.frequency.value = value;
        node._buildImpulse();
      },
      configurable: true
    },

    filterType: {
      get: () => node._filter.type,
      set: (value) => {
        node._filter.type = value
      },
      configurable: true
    },

    _buildImpulse: {
      value: function () {
        let self   = this
        let rate   = self.context.sampleRate
        let length = Math.max(rate * self.time, 1)

        if (self._building) buildImpulse.cancel(self._building)

        self._building = buildImpulse(length, self.decay, self.reverse, (channels) => {
          let impulse  = self.context.createBuffer(2, length, rate)
          
          impulse.getChannelData(0).set(channels[0])
          impulse.getChannelData(1).set(channels[1])

          self._convolver.buffer = impulse
          self._building         = false
        })
      }
    },

    /**
     * Public parameters.
     */

    time: {
      enumerable: true,
      get: function () { return node._time; },
      set: function (value) {
        node._time = value;
        node._buildImpulse();
      },
      configurable: true
    },

    decay: {
      enumerable: true,
      get: function () { return node._decay; },
      set: function (value) {
        node._decay = value;
        node._buildImpulse();
      },
      configurable: true
    },

    reverse: {
      enumerable: true,
      get: function () { return node._reverse; },
      set: function (value) {
        node._reverse = value;
        node._buildImpulse();
      },
      configurable: true
    }
  });

  node._building = false
  node._buildImpulse()

  return node
}

let chunkSize     = 2048
let queue         = []
let targets       = {}
let lastImpulseId = 0

function buildImpulse(length, decay, reverse, cb){
  lastImpulseId += 1
  
  let target = targets[lastImpulseId] = {
    id: lastImpulseId,
    cb: cb,
    length: length,
    decay: decay,
    reverse: reverse,
    impulseL: new Float32Array(length),
    impulseR: new Float32Array(length)
  }

  queue.push([ target.id, 0, Math.min(chunkSize, length) ])

  setTimeout(next, 1)
  return lastImpulseId
}

buildImpulse.cancel = (id) => {
  if (targets[id]){
    ;delete targets[id]
    return true
  } else {
    return false
  }
}

function next(){
  let item = queue.shift()

  if (item){
    let target = targets[item[0]]
    
    if (target){
      let length  = target.length
      let decay   = target.decay
      let reverse = target.reverse
      let from    = item[1]
      let to      = item[2]

      let impulseL = target.impulseL
      let impulseR = target.impulseR

      for (let i=from;i<to;i++) {
        let n = reverse ? length - i : i;
        
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }

      if (to >= length-1){
        ;delete targets[item[0]]
        target.cb([target.impulseL, target.impulseR])
      } else {
        queue.push([ target.id, to, Math.min(to + chunkSize, length) ]);
      }
    }
  }
  
  if (queue.length) setTimeout(next, 5);
}