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
    this.css = entity.outputCss;
    this.cpm = entity.cpm;
  }

}

export default Entity;
