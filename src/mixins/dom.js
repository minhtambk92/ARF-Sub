/**
 * Created by manhhailua on 1/17/17.
 *
 * Mixin of manipulating DOM
 */

const dom = {

  beforeMount() {
    // Attach styles & scripts before rendering for better ads displaying performances
    this.attachStyles();
    this.attachScripts();
  },

  methods: {
    /**
     * Attach entity's styles to header
     */
    attachStyles() {
      if (!this.current.css) return;

      const head = document.head || document.getElementsByTagName('head')[0];
      const style = document.createElement('style');

      style.id = `styles-${this.current.id}`;
      style.type = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = this.current.css;
      } else {
        style.appendChild(document.createTextNode(this.current.css));
      }

      head.appendChild(style);
    },

    /**
     * Attach entity's scripts to header
     */
    attachScripts() {
      if (!this.current.scripts) return;

      const body = document.body || document.getElementsByTagName('body')[0];
      const script = document.createElement('script');

      script.id = `scripts-${this.current.id}`;
      script.type = 'text/javascript';
      script.innerHTML = this.current.scripts;

      body.appendChild(script);
    },
  },

};

export default dom;
