import { Rx, defineReactive, isObservable, warn, unsub } from './util'

export default {
  created () {
    const vm = this
    const domStreams = vm.$options.domStreams
    if (domStreams) {
      if (!Rx.Subject) {
        warn('Rx.Subject is required to use the "domStreams" option.')
      } else {
        domStreams.forEach(key => {
          vm[key] = new Rx.Subject()
        })
      }
    }

    let obs = vm.$options.subscriptions
    if (typeof obs === 'function') {
      obs = obs.call(vm)
    }
    if (obs) {
      vm.$observables = {}
      vm._obSubscriptions = []
      Object.keys(obs).forEach(key => {
        defineReactive(vm, key, undefined)
        const ob = vm.$observables[key] = obs[key]
        if (!isObservable(ob)) {
          warn(
            'Invalid Observable found in subscriptions option with key "' + key + '".',
            vm
          )
          return
        }
        vm._obSubscriptions.push(obs[key].subscribe(value => {
          vm[key] = value
        }))
      })
    }
  },

  beforeDestroy () {
    if (this._obSubscriptions) {
      this._obSubscriptions.forEach(unsub)
    }
  }
}
