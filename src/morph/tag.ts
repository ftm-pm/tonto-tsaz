/**
 * Тег. Содержит в себе информацию о конкретной форме слова, но при этом
 * к конкретному слову не привязан. Всевозможные значения тегов переиспользуются
 * для всех разборов слов.
 *
 * Все граммемы навешаны на тег как поля. Если какая-то граммема содержит в себе
 * дочерние граммемы, то значением поля является именно название дочерней
 * граммемы (например, tag.GNdr == 'masc'). В то же время для дочерних граммем
 * значением является просто true (т.е. условие можно писать и просто как
 * if (tag.masc) ...).
 * @property stat
 */
export class Tag {
  /**
   * Полный список неизменяемых граммем.
   */
  private stat: string[];

  /**
   * Полный список изменяемых граммем.
   */
  private flex: string[];
  /**
   * Копия тега с русскими обозначениями (по версии OpenCorpora).
   */
  private ext: Tag;

  /**
   * @param {string} str
   */
  public constructor(str: string) {
    // let par;
    // const pair = str.split(' ');
    // this.stat = pair[0].split(',');
    // this.flex = pair[1] ? pair[1].split(',') : [];
    // for (let j = 0; j < 2; j++) {
    //   var grams = this[['stat', 'flex'][j]];
    //   for (var i = 0; i < grams.length; i++) {
    //     var gram = grams[i];
    //     this[gram] = true;
    //     // loc2 -> loct -> CAse
    //     while (grammemes[gram] && (par = grammemes[gram].parent)) {
    //       this[par] = gram;
    //       gram = par;
    //     }
    //   }
    // }
    // if ('POST' in this) {
    //   this.POS = this.POST;
    // }
  }

  /**
   * Возвращает текстовое представление тега.
   *
   * @returns {string} Список неизменяемых граммем через запятую, пробел,
   *  и список изменяемых граммем через запятую.
   */
  public toString(): string {
    return `${this.stat.join(',')} ${this.flex.join(',')}`.trim();
  }
}
