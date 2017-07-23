/**
 * Created by Manhhailua on 11/30/16.
 */

class Entity {

  constructor(entity) {
    this.id = entity.id;
    this.weight = entity.weight;
    this.type = entity.type;
    this.width = entity.width;
    this.height = entity.height;
    this.html = entity.html;
    this.script = entity.script;
    this.image = entity.image;
    this.css = entity.css;
    this.outputCss = entity.outputCss;
    this.cpm = entity.cpm;
    this.globalFilters = entity.globalFilters;
    this.preview = entity.preview;
  }

}

export default Entity;
