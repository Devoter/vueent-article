import { createApp, defineComponent } from 'vue';

let VueInstance: unknown | undefined;

if (!VueInstance) {
  VueInstance = createApp(
    defineComponent({
      name: 'App',
      render(createElement: Function) {
        return createElement('div', this.$slots.default);
      }
    })
  );
}

export default VueInstance;
